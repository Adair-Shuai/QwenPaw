// Embedded into install.ps1 at build time. Keep compatible with Windows
// PowerShell 5.1 / .NET Framework; no extra runtime is installed by setup.
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Win32.SafeHandles;

public static class UGSciInstallerIO
{
    [DllImport("shell32.dll", CharSet = CharSet.Unicode, ExactSpelling = true)]
    private static extern void SHChangeNotify(uint eventId, uint flags, string item, IntPtr unused);

    public static void RefreshShellIcons(string executable, string[] shortcuts)
    {
        try
        {
            // SHCNE_ASSOCCHANGED invalidates cached icons. SHCNE_UPDATEITEM
            // uses Unicode paths and asynchronous delivery to refresh links.
            SHChangeNotify(0x08000000, 0, null, IntPtr.Zero);
            if (File.Exists(executable)) SHChangeNotify(0x00002000, 0x2005, executable, IntPtr.Zero);
            foreach (string path in shortcuts)
                if (File.Exists(path)) SHChangeNotify(0x00002000, 0x2005, path, IntPtr.Zero);
        }
        catch (Exception error)
        {
            Console.WriteLine("[UGSCI-INSTALL] Icon refresh warning: " + error.Message);
        }
    }

    public sealed class PackageInventory
    {
        public long PayloadBytes;
        public int FileCount;
    }

    private static string FullPath(string path)
    {
        string full = Path.GetFullPath(path);
        string root = Path.GetPathRoot(full);
        return full.Length == root.Length ? full : full.TrimEnd('\\');
    }

    private static string IoPath(string path)
    {
        if (path.StartsWith(@"\\?\", StringComparison.Ordinal)) return path;
        if (path.StartsWith(@"\\", StringComparison.Ordinal))
            return @"\\?\UNC\" + path.Substring(2);
        return @"\\?\" + path;
    }

    private static void RequireOrdinary(FileSystemInfo entry)
    {
        if ((entry.Attributes & FileAttributes.ReparsePoint) != 0)
            throw new IOException("Installer cannot follow a reparse point: " + entry.FullName);
    }

    private static IEnumerable<FileInfo> WalkFiles(string root, bool skipLinks)
    {
        var pending = new Stack<DirectoryInfo>();
        var first = new DirectoryInfo(IoPath(FullPath(root)));
        RequireOrdinary(first);
        pending.Push(first);
        while (pending.Count != 0)
        {
            var directory = pending.Pop();
            foreach (var entry in directory.EnumerateFileSystemInfos())
            {
                if (skipLinks && (entry.Attributes & FileAttributes.ReparsePoint) != 0)
                    continue;
                RequireOrdinary(entry);
                var child = entry as DirectoryInfo;
                if (child != null) pending.Push(child);
                else yield return (FileInfo)entry;
            }
        }
    }

    public static long DirectorySize(string path)
    {
        if (String.IsNullOrEmpty(path) || !Directory.Exists(IoPath(FullPath(path)))) return 0;
        long total = 0;
        // A user may deliberately put the working directory or models root on
        // another drive using a junction. Follow that declared root once, but
        // keep excluding links encountered inside it, as the backup does.
        foreach (var file in WalkFiles(ResolveDirectoryPath(path), true)) checked { total += file.Length; }
        return total;
    }

    private static string ChecksumPath(string relative)
    {
        relative = relative.Replace('/', '\\');
        if (Path.IsPathRooted(relative) || relative.IndexOf(':') >= 0)
            throw new IOException("Unsafe checksum path: " + relative);
        foreach (string part in relative.Split('\\'))
        {
            if (part.Length == 0 || part == "." || part == ".." ||
                part.EndsWith(" ", StringComparison.Ordinal) ||
                part.EndsWith(".", StringComparison.Ordinal))
                throw new IOException("Unsafe checksum path: " + relative);
        }
        return relative;
    }

    public static PackageInventory VerifyPackage(string root, string[] required)
    {
        root = FullPath(root);
        string rootIo = IoPath(root).TrimEnd('\\') + "\\";
        string manifest = Path.Combine(rootIo, "checksums.sha256");
        if (!File.Exists(manifest))
            throw new IOException("Package checksum manifest is missing");
        RequireOrdinary(new FileInfo(manifest));
        var expected = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var result = new PackageInventory();
        var progress = Stopwatch.StartNew();
        // Reuse the hasher and read buffer for the whole package. The PowerShell
        // loop previously created a crypto provider and dispatched many cmdlets
        // for every small file in the Python dependency tree.
        byte[] buffer = new byte[128 * 1024];
        using (var sha = SHA256.Create())
        foreach (string line in File.ReadLines(manifest))
        {
            if (String.IsNullOrWhiteSpace(line)) continue;
            if (line.Length < 67 || line[64] != ' ' || line[65] != ' ')
                throw new IOException("Invalid checksum manifest entry: " + line);
            string expectedHash = line.Substring(0, 64);
            foreach (char digit in expectedHash)
                if (!Uri.IsHexDigit(digit)) throw new IOException("Invalid checksum manifest entry: " + line);
            string relative = ChecksumPath(line.Substring(66));
            if (!expected.Add(relative)) throw new IOException("Duplicate checksum entry: " + relative);
            string fullPath = Path.Combine(rootIo, relative);
            if (!File.Exists(fullPath))
                throw new IOException("Package file is missing: " + relative);
            RequireOrdinary(new FileInfo(fullPath));
            long length;
            using (var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read,
                FileShare.Read, 4096, FileOptions.SequentialScan))
            {
                length = stream.Length;
                sha.Initialize();
                int read;
                while ((read = stream.Read(buffer, 0, buffer.Length)) != 0)
                    sha.TransformBlock(buffer, 0, read, buffer, 0);
                sha.TransformFinalBlock(buffer, 0, 0);
            }
            string actualHash = BitConverter.ToString(sha.Hash).Replace("-", "");
            if (!String.Equals(actualHash, expectedHash, StringComparison.OrdinalIgnoreCase))
                throw new IOException("Package checksum mismatch: " + relative);
            result.FileCount++;
            if (relative.StartsWith("payload\\", StringComparison.OrdinalIgnoreCase))
                checked { result.PayloadBytes += length; }
            if (progress.ElapsedMilliseconds >= 1000)
            {
                Console.WriteLine("[UGSCI-INSTALL] Verifying package: " + result.FileCount + " files checked");
                progress.Restart();
            }
        }
        // Keep this check after hashing, as in the original installer: files
        // added while verification was running must not escape the manifest.
        var actual = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var file in WalkFiles(root, false))
        {
            string relative = file.FullName.Substring(rootIo.Length);
            if (!actual.Add(relative)) throw new IOException("Duplicate package path: " + relative);
            if (!relative.Equals("checksums.sha256", StringComparison.OrdinalIgnoreCase) && !expected.Contains(relative))
                throw new IOException("Unchecked package file: " + relative);
        }
        foreach (string relative in expected)
            if (!actual.Contains(relative))
                throw new IOException("Package file is missing: " + relative);
        foreach (string relative in required)
            if (!expected.Contains(relative))
                throw new IOException("Required checksum entry is missing: " + relative);
        return result;
    }

    private static bool IsWithin(string candidate, string root)
    {
        return candidate.Equals(root, StringComparison.OrdinalIgnoreCase) ||
            candidate.StartsWith(root.TrimEnd('\\') + "\\", StringComparison.OrdinalIgnoreCase);
    }

    private static void RequireOrdinaryDestinationRoot(string path)
    {
        // DirectoryInfo.Exists follows the target and is false for a dangling
        // junction. Read the directory entry's attributes instead, before
        // resolving an ordinary not-yet-created destination from its parent.
        try
        {
            if ((File.GetAttributes(IoPath(path)) & FileAttributes.ReparsePoint) != 0)
                throw new IOException("Installer cannot follow a reparse point: " + path);
        }
        catch (FileNotFoundException) { }
        catch (DirectoryNotFoundException) { }
    }

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern SafeFileHandle CreateFile(string path, uint access,
        uint share, IntPtr security, uint disposition, uint flags, IntPtr template);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern uint GetFinalPathNameByHandle(SafeFileHandle handle,
        StringBuilder path, uint length, uint flags);

    private static string ResolveDirectoryPath(string path)
    {
        // Resolve through a directory handle so system folder redirection and
        // drive aliases remain usable, while overlap checks see the real tree.
        // A not-yet-created destination is resolved from its existing ancestor.
        var tail = new Stack<string>();
        string current = FullPath(path);
        while (!Directory.Exists(IoPath(current)))
        {
            RequireOrdinaryDestinationRoot(current);
            string parent = Path.GetDirectoryName(current);
            if (String.IsNullOrEmpty(parent) || parent == current)
                throw new DirectoryNotFoundException("Installer path has no existing parent: " + path);
            tail.Push(Path.GetFileName(current));
            current = parent;
        }
        using (var handle = CreateFile(IoPath(current), 0, 7, IntPtr.Zero, 3,
            0x02000000, IntPtr.Zero))
        {
            if (handle.IsInvalid) throw new Win32Exception(Marshal.GetLastWin32Error());
            var resolved = new StringBuilder(512);
            uint count = GetFinalPathNameByHandle(handle, resolved, (uint)resolved.Capacity, 0);
            if (count == 0) throw new Win32Exception(Marshal.GetLastWin32Error());
            if (count >= resolved.Capacity)
            {
                resolved.Capacity = checked((int)count + 1);
                count = GetFinalPathNameByHandle(handle, resolved, (uint)resolved.Capacity, 0);
                if (count == 0 || count >= resolved.Capacity)
                    throw new Win32Exception(Marshal.GetLastWin32Error());
            }
            current = FullPath(resolved.ToString());
        }
        while (tail.Count != 0) current = Path.Combine(current, tail.Pop());
        return current;
    }

    public static long CopyDirectory(string source, string destination)
    {
        return CopyDirectory(source, destination, false);
    }

    public static long CopyDirectory(string source, string destination, bool allowSourceRootLink)
    {
        source = FullPath(source);
        destination = FullPath(destination);
        if (!allowSourceRootLink) RequireOrdinary(new DirectoryInfo(IoPath(source)));
        RequireOrdinaryDestinationRoot(destination);
        source = ResolveDirectoryPath(source);
        destination = ResolveDirectoryPath(destination);
        if (IsWithin(destination, source) || IsWithin(source, destination))
            throw new IOException("Installer copy source and destination must be separate trees");
        string sourceIo = IoPath(source);
        string destinationIo = IoPath(destination);
        var pending = new Stack<KeyValuePair<DirectoryInfo, string>>();
        pending.Push(new KeyValuePair<DirectoryInfo, string>(new DirectoryInfo(sourceIo), destinationIo));
        var progress = Stopwatch.StartNew();
        long count = 0;
        while (pending.Count != 0)
        {
            var current = pending.Pop();
            RequireOrdinary(current.Key);
            var targetDirectory = new DirectoryInfo(current.Value);
            if (targetDirectory.Exists) RequireOrdinary(targetDirectory);
            // Exactly one creation per directory, including empty directories;
            // no second recursive enumeration or per-file parent creation.
            Directory.CreateDirectory(current.Value);
            // Inspect existing entries once per directory, including dangling
            // links for which File.Exists would return false.
            foreach (var existing in targetDirectory.EnumerateFileSystemInfos())
                RequireOrdinary(existing);
            foreach (var entry in current.Key.EnumerateFileSystemInfos())
            {
                RequireOrdinary(entry);
                string target = Path.Combine(current.Value, entry.Name);
                var child = entry as DirectoryInfo;
                if (child != null)
                    pending.Push(new KeyValuePair<DirectoryInfo, string>(child, target));
                else
                {
                    File.Copy(entry.FullName, target, true);
                    count++;
                }
                if (progress.ElapsedMilliseconds >= 1000)
                {
                    Console.WriteLine("[UGSCI-INSTALL] Copying files: " + count + " copied");
                    progress.Restart();
                }
            }
        }
        return count;
    }
}
