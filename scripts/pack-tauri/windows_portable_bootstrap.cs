using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Security.Cryptography;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using Microsoft.Win32.SafeHandles;
using System.Windows.Forms;

// Small native WinForms front-end for the portable package.  The actual
// installation remains in install.ps1 so upgrades and rollback use one code
// path.  PowerShell is always hidden and is invoked non-interactively.
internal static class PortableSetup
{
    private const int InvalidPackageExitCode = 2;
    private const int LaunchFailureExitCode = 3;

    [STAThread]
    private static int Main(string[] args)
    {
        bool silent = HasArgument(args, "--silent") || HasArgument(args, "/S");
        try
        {
            string packageRoot = AppDomain.CurrentDomain.BaseDirectory;
            using (var singleton = new Mutex(false, "Local\\UGSciDesktopPortableSetup"))
            {
                bool acquired;
                try { acquired = singleton.WaitOne(0); }
                catch (AbandonedMutexException) { acquired = true; }
                if (!acquired)
                {
                    if (!silent)
                        MessageBox.Show("Another UGSci Desktop setup or uninstall operation is already running.",
                            "UGSci Desktop Setup", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    else
                        WriteFailureLog(HasArgument(args, "--uninstall") ? "uninstall" : "setup",
                            new InvalidOperationException(
                            "Another UGSci Desktop setup or uninstall operation is already running."));
                    return LaunchFailureExitCode;
                }
                try
                {
                    if (HasArgument(args, "--uninstall"))
                        return RunUninstaller(packageRoot, silent);
                    if (silent)
                    {
                        VerifyPackage(packageRoot);
                        string silentLog;
                        return RunInstaller(packageRoot, null, HasNoCliPath(args), false,
                            HasArgument(args, "--deferred-commit"),
                            ArgumentValue(args, "--transaction-file"), out silentLog);
                    }

                    Application.EnableVisualStyles();
                    Application.SetCompatibleTextRenderingDefault(false);
                    using (var form = new SetupForm(packageRoot, HasNoCliPath(args)))
                    {
                        Application.Run(form);
                        return form.ResultCode;
                    }
                }
                finally
                {
                    try { singleton.ReleaseMutex(); } catch (ApplicationException) { }
                }
            }
        }
        catch (Exception error)
        {
            if (!silent)
            {
                string logPath = WriteFailureLog(HasArgument(args, "--uninstall") ? "uninstall" : "setup", error);
                MessageBox.Show(error.Message + "\n\nLog: " + logPath, "UGSci Desktop Setup",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            else
                WriteFailureLog(HasArgument(args, "--uninstall") ? "uninstall" : "setup", error);
            return error is InvalidDataException ? InvalidPackageExitCode : LaunchFailureExitCode;
        }
    }

    private static int RunUninstaller(string installRoot, bool silent)
    {
        if (!silent && MessageBox.Show("Remove UGSci Desktop from this computer?", "UGSci Desktop Uninstall",
                MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes)
            return 0;

        string script = Path.Combine(installRoot, "uninstall.ps1");
        if (!File.Exists(script)) throw new FileNotFoundException("The UGSci Desktop uninstall script is missing.", script);
        string temporaryScript = Path.Combine(Path.GetTempPath(), "ugsci-desktop-uninstall-" +
            Process.GetCurrentProcess().Id.ToString(CultureInfo.InvariantCulture) + ".ps1");
        File.Copy(script, temporaryScript, true);
        string temporaryCleanup = Path.Combine(Path.GetTempPath(), "ugsci-desktop-uninstall-cleanup-" +
            Process.GetCurrentProcess().Id.ToString(CultureInfo.InvariantCulture) + ".ps1");
        string cleanup = Path.Combine(installRoot, "uninstall-cleanup.ps1");
        if (!File.Exists(cleanup)) throw new FileNotFoundException("The UGSci Desktop cleanup script is missing.", cleanup);
        File.Copy(cleanup, temporaryCleanup, true);
        ProcessResult result;
        bool keepTemporaryCleanup = false;
        try
        {
            result = RunPowerShell(installRoot, temporaryScript, new[] {
                "-InstallDir", installRoot,
                "-CleanupScript", temporaryCleanup,
                "-LauncherPid", Process.GetCurrentProcess().Id.ToString(CultureInfo.InvariantCulture)
            }, true);
            keepTemporaryCleanup = result.ExitCode == 0;
        }
        catch (Exception error)
        {
            string logPath = NewLogPath("uninstall");
            try { File.WriteAllText(logPath, error.ToString()); } catch { }
            if (!silent) MessageBox.Show("UGSci Desktop could not be uninstalled.\n\n" + error.Message +
                "\n\nLog: " + logPath, "UGSci Desktop Uninstall", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return LaunchFailureExitCode;
        }
        finally
        {
            try { File.Delete(temporaryScript); } catch { }
            if (!keepTemporaryCleanup)
                try { File.Delete(temporaryCleanup); } catch { }
        }
        if (!silent)
        {
            if (result.ExitCode == 0)
                MessageBox.Show("UGSci Desktop was removed from Windows. Remaining application files will be deleted after this window closes.", "UGSci Desktop Uninstall",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
            else
                MessageBox.Show("UGSci Desktop could not be uninstalled.\n\nLog: " + result.LogPath,
                    "UGSci Desktop Uninstall", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        return result.ExitCode;
    }

    private static bool HasNoCliPath(string[] args)
    {
        return HasArgument(args, "--no-cli-path") || HasArgument(args, "/NO_QWENPAW_PATH");
    }

    private static bool HasArgument(string[] args, string value)
    {
        foreach (string arg in args)
        {
            if (string.Equals(arg, value, StringComparison.OrdinalIgnoreCase)) return true;
            // PowerShell/NSIS callers conventionally use a single dash while
            // the public bootstrap CLI uses a double dash. Treat both forms
            // as equivalent so silent portable updates never open the UI.
            if (value.StartsWith("--", StringComparison.Ordinal) &&
                string.Equals(arg, "-" + value.Substring(2), StringComparison.OrdinalIgnoreCase)) return true;
            if (value.StartsWith("-", StringComparison.Ordinal) &&
                !value.StartsWith("--", StringComparison.Ordinal) &&
                string.Equals(arg, "--" + value.Substring(1), StringComparison.OrdinalIgnoreCase)) return true;
        }
        return false;
    }

    private static string ArgumentValue(string[] args, string name)
    {
        for (int i = 0; i + 1 < args.Length; i++)
            if (string.Equals(args[i], name, StringComparison.OrdinalIgnoreCase))
                return args[i + 1];
        return null;
    }

    private static int RunInstaller(string packageRoot, string installDir, bool noCliPath,
        bool noDesktopShortcut, bool deferredCommit, string transactionFile, out string logPath)
    {
        var arguments = new List<string> { "-Silent" };
        if (noCliPath) arguments.Add("-NoCliPath");
        if (noDesktopShortcut) arguments.Add("-NoDesktopShortcut");
        if (deferredCommit)
        {
            if (string.IsNullOrWhiteSpace(transactionFile))
                throw new ArgumentException("Deferred commit requires --transaction-file.");
            arguments.Add("-DeferredCommit");
            arguments.Add("-TransactionFile");
            arguments.Add(transactionFile);
        }
        if (!string.IsNullOrWhiteSpace(installDir)) arguments.Add("-InstallDir");
        if (!string.IsNullOrWhiteSpace(installDir)) arguments.Add(installDir);
        ProcessResult result = RunPowerShell(packageRoot, Path.Combine(packageRoot, "install.ps1"), arguments, false);
        logPath = result.LogPath;
        return result.ExitCode;
    }

    private static ProcessResult RunPowerShell(string workingDirectory, string script, IEnumerable<string> scriptArguments, bool uninstall)
    {
        string powershell = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows),
            "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
        if (!File.Exists(powershell)) throw new FileNotFoundException("Windows PowerShell was not found.", powershell);
        var arguments = new List<string> {
            "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", Quote(script)
        };
        foreach (string argument in scriptArguments) arguments.Add(argument.StartsWith("-") ? argument : Quote(argument));

        var start = new ProcessStartInfo {
            FileName = powershell,
            Arguments = string.Join(" ", arguments.ToArray()),
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            WindowStyle = ProcessWindowStyle.Hidden,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8
        };
        using (Process process = Process.Start(start))
        {
            if (process == null) throw new InvalidOperationException("Installer process did not start.");
            var stdoutBuilder = new StringBuilder();
            var stderrBuilder = new StringBuilder();
            process.OutputDataReceived += delegate(object sender, DataReceivedEventArgs e) {
                if (e.Data != null) lock (stdoutBuilder) stdoutBuilder.AppendLine(e.Data);
            };
            process.ErrorDataReceived += delegate(object sender, DataReceivedEventArgs e) {
                if (e.Data != null) lock (stderrBuilder) stderrBuilder.AppendLine(e.Data);
            };
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            process.WaitForExit();
            process.WaitForExit();
            string stdout = stdoutBuilder.ToString();
            string stderr = stderrBuilder.ToString();
            string logPath = NewLogPath(uninstall ? "uninstall" : "setup");
            File.WriteAllText(logPath, stdout + Environment.NewLine + stderr);
            if (!uninstall)
            {
                try { File.Copy(logPath, Path.Combine(Path.GetTempPath(), "ugsci-desktop-setup.log"), true); }
                catch { }
            }
            return new ProcessResult(process.ExitCode, logPath);
        }
    }

    private static string NewLogPath(string operation)
    {
        return Path.Combine(Path.GetTempPath(), "ugsci-desktop-" + operation + "-" +
            DateTime.UtcNow.ToString("yyyyMMdd-HHmmss-fff", CultureInfo.InvariantCulture) + "-" +
            Process.GetCurrentProcess().Id.ToString(CultureInfo.InvariantCulture) + ".log");
    }

    private sealed class ProcessResult
    {
        public readonly int ExitCode;
        public readonly string LogPath;
        public ProcessResult(int exitCode, string logPath) { ExitCode = exitCode; LogPath = logPath; }
    }

    private static string Quote(string value)
    {
        return "\"" + value.Replace("\"", "\\\"") + "\"";
    }

    private static void VerifyPackage(string packageRoot)
    {
        string root = Path.IsPathRooted(packageRoot) ? packageRoot : Path.GetFullPath(packageRoot);
        string volumeRoot = Path.GetPathRoot(root);
        if (!string.Equals(root, volumeRoot, StringComparison.OrdinalIgnoreCase))
            root = root.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        // .NET Framework's File.Exists/File.ReadAllLines can return false for
        // an extended-length path even when the short manifest path exists.
        // The manifest is always at the package root, so read it through the
        // canonical normal path and reserve the extended prefix for payload
        // traversal and hashing where paths can actually exceed MAX_PATH.
        string manifest = Path.Combine(root, "checksums.sha256");
        if (!File.Exists(manifest)) throw new InvalidDataException("checksums.sha256 is missing.");
        var expected = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var pattern = new Regex("^([0-9a-fA-F]{64})  (.+)$", RegexOptions.CultureInvariant);
        foreach (string rawLine in File.ReadAllLines(manifest))
        {
            if (string.IsNullOrWhiteSpace(rawLine)) continue;
            Match match = pattern.Match(rawLine);
            if (!match.Success) throw new InvalidDataException("Invalid checksum manifest entry.");
            string relative = SafeRelativePath(match.Groups[2].Value);
            string canonicalPath = Path.Combine(root, relative);
            if (!expected.Add(relative)) throw new InvalidDataException("Duplicate checksum entry: " + relative);
            if (!FileExistsLongPath(canonicalPath))
                throw new InvalidDataException("Package file is missing: " + relative +
                    ". The archive may not have been extracted with long-path support; extract to a short path such as C:\\\\UGSciSetup, use 7-Zip, or enable Windows long paths, then retry.");
            string actual = Sha256(canonicalPath);
            if (!string.Equals(actual, match.Groups[1].Value, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("Package checksum mismatch: " + relative);
        }
        foreach (string relative in EnumeratePackageFiles(root))
        {
            if (string.Equals(relative, "checksums.sha256", StringComparison.OrdinalIgnoreCase)) continue;
            if (!expected.Contains(relative)) throw new InvalidDataException("Unchecked package file: " + relative);
        }
        foreach (string required in new[] { "Setup.exe", "install.ps1", "version.json",
                     Path.Combine("payload", "Setup.exe"),
                     Path.Combine("payload", "Uninstall.exe"),
                     Path.Combine("payload", "UGSci.exe"),
                     Path.Combine("payload", "binaries", "state", "active.json"),
                     Path.Combine("payload", "binaries", "cli", "qwenpaw.exe"),
                     Path.Combine("payload", "binaries", "update-assistant", "UGSciUpdateAssistant.exe"),
                     Path.Combine("payload", "MicrosoftEdgeWebView2RuntimeInstallerX64.exe") })
            if (!expected.Contains(required)) throw new InvalidDataException("Required checksum entry is missing: " + required);
    }

    private const int ErrorNoMoreFiles = 18;
    private static readonly IntPtr InvalidFindHandle = new IntPtr(-1);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct Win32FindData
    {
        public FileAttributes Attributes;
        public System.Runtime.InteropServices.ComTypes.FILETIME CreationTime;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastAccessTime;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWriteTime;
        public uint FileSizeHigh;
        public uint FileSizeLow;
        public uint Reserved0;
        public uint Reserved1;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)] public string FileName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 14)] public string AlternateFileName;
    }

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr FindFirstFileW(string fileName, out Win32FindData findData);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool FindNextFileW(IntPtr findHandle, out Win32FindData findData);

    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool FindClose(IntPtr findHandle);

    private static IEnumerable<string> EnumeratePackageFiles(string root)
    {
        foreach (string relative in EnumeratePackageFiles(root, "")) yield return relative;
    }

    private static IEnumerable<string> EnumeratePackageFiles(string root, string relativeDirectory)
    {
        string directory = string.IsNullOrEmpty(relativeDirectory)
            ? root : Path.Combine(root, relativeDirectory);
        string search = ToExtendedPath(directory.TrimEnd(Path.DirectorySeparatorChar,
            Path.AltDirectorySeparatorChar) + Path.DirectorySeparatorChar + "*");
        Win32FindData data;
        IntPtr handle = FindFirstFileW(search, out data);
        if (handle == InvalidFindHandle)
            throw new IOException("Cannot enumerate package directory: " + relativeDirectory,
                Marshal.GetLastWin32Error());
        try
        {
            while (true)
            {
                string name = data.FileName;
                if (name != "." && name != "..")
                {
                    string relative = string.IsNullOrEmpty(relativeDirectory)
                        ? name : Path.Combine(relativeDirectory, name);
                    if ((data.Attributes & FileAttributes.ReparsePoint) != 0)
                        throw new InvalidDataException("Package contains a reparse point: " + relative);
                    if ((data.Attributes & FileAttributes.Directory) != 0)
                    {
                        foreach (string child in EnumeratePackageFiles(root, relative)) yield return child;
                    }
                    else
                        yield return relative;
                }
                if (FindNextFileW(handle, out data)) continue;
                int error = Marshal.GetLastWin32Error();
                if (error != ErrorNoMoreFiles)
                    throw new IOException("Cannot enumerate package directory: " + relativeDirectory, error);
                break;
            }
        }
        finally
        {
            FindClose(handle);
        }
    }

    private const uint InvalidFileAttributes = 0xFFFFFFFF;
    private const uint GenericRead = 0x80000000u;
    private const uint FileShareRead = 0x00000001;
    private const uint OpenExisting = 3;
    private const uint FileAttributeNormal = 0x00000080;

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern uint GetFileAttributesW(string fileName);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern SafeFileHandle CreateFileW(
        string fileName,
        uint desiredAccess,
        uint shareMode,
        IntPtr securityAttributes,
        uint creationDisposition,
        uint flagsAndAttributes,
        IntPtr templateFile);

    private const uint ProcessQueryLimitedInformation = 0x1000;

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr OpenProcess(uint desiredAccess, bool inheritHandle, int processId);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool QueryFullProcessImageNameW(
        IntPtr hProcess, int flags, StringBuilder exeName, ref int size);

    [DllImport("kernel32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool CloseHandle(IntPtr handle);

    private static bool FileExistsLongPath(string path)
    {
        uint attributes = GetFileAttributesW(ToExtendedPath(path));
        if (attributes == InvalidFileAttributes) return false;
        return (attributes & (uint)FileAttributes.Directory) == 0;
    }

    private static string SafeRelativePath(string value)
    {
        string relative = value.Replace('/', Path.DirectorySeparatorChar)
            .Replace(Path.AltDirectorySeparatorChar, Path.DirectorySeparatorChar);
        if (string.IsNullOrWhiteSpace(relative) || Path.IsPathRooted(relative))
            throw new InvalidDataException("Unsafe checksum path: " + value);
        string[] segments = relative.Split(Path.DirectorySeparatorChar);
        foreach (string segment in segments)
        {
            if (string.IsNullOrWhiteSpace(segment) || segment == "." || segment == ".." ||
                segment.IndexOf(':') >= 0)
                throw new InvalidDataException("Unsafe checksum path: " + value);
        }
        return string.Join(Path.DirectorySeparatorChar.ToString(), segments);
    }

    private static string ToExtendedPath(string path)
    {
        if (path.StartsWith(@"\\?\", StringComparison.Ordinal)) return path;
        if (path.StartsWith(@"\\", StringComparison.Ordinal))
            return @"\\?\UNC\" + path.Substring(2);
        return @"\\?\" + path;
    }

    private static string Sha256(string path)
    {
        using (var handle = CreateFileW(ToExtendedPath(path), GenericRead, FileShareRead,
            IntPtr.Zero, OpenExisting, FileAttributeNormal, IntPtr.Zero))
        {
            if (handle.IsInvalid)
                throw new IOException("Cannot read package file: " + path, Marshal.GetLastWin32Error());
            using (var stream = new FileStream(handle, FileAccess.Read))
            using (var sha = SHA256.Create())
                return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").ToLowerInvariant();
        }
    }

    private static readonly string[] OwnedInstallFiles = {
        "UGSci.exe", "qwenpaw-desktop.exe", "qwenpaw-desktop-debug.cmd", "qwenpaw-desktop-debug.ps1",
        "version.json", "Setup.exe", "Uninstall.exe", "uninstall.ps1", "uninstall-cleanup.ps1",
        "update-qwenpaw-path.ps1", "cli-path.txt",
        "MicrosoftEdgeWebView2RuntimeInstallerX64.exe", "MicrosoftEdgeWebview2Setup.exe",
        "webview2-missing.txt"
    };
    private static readonly string[] OwnedInstallDirectories = {
        "binaries", "execution-runtime", "optional-components", "engines", "data", "state",
        "user-data", "workspace", "models", "logs"
    };

    private static bool IsExistingUGSciInstall(string root)
    {
        if (string.IsNullOrWhiteSpace(root) || !Directory.Exists(root)) return false;
        bool desktopExists = File.Exists(Path.Combine(root, "UGSci.exe")) ||
            File.Exists(Path.Combine(root, "qwenpaw-desktop.exe"));
        bool backendExists = File.Exists(Path.Combine(root,
            "binaries", "qwenpaw-backend", "qwenpaw-backend.exe"));
        bool layeredExists = File.Exists(Path.Combine(root, "binaries", "state", "active.json"));
        if (desktopExists && (backendExists || layeredExists)) return true;

        string versionPath = Path.Combine(root, "version.json");
        if (!File.Exists(versionPath)) return false;
        try
        {
            string version = File.ReadAllText(versionPath);
            if (version.IndexOf("\"product\"", StringComparison.OrdinalIgnoreCase) < 0 ||
                version.IndexOf("UGSci Desktop", StringComparison.OrdinalIgnoreCase) < 0)
                return false;
        }
        catch { return false; }
        foreach (string marker in new[] {
            "UGSci.exe", "qwenpaw-desktop.exe", "binaries", "Uninstall.exe", "uninstall.ps1" })
        {
            string candidate = Path.Combine(root, marker);
            if (File.Exists(candidate) || Directory.Exists(candidate)) return true;
        }
        return false;
    }

    private static List<string> GetUnrelatedInstallEntries(string root)
    {
        var unrelated = new List<string>();
        if (!Directory.Exists(root)) return unrelated;
        foreach (string path in Directory.GetFileSystemEntries(root))
        {
            string name = Path.GetFileName(path);
            if (string.IsNullOrEmpty(name)) continue;
            bool isDirectory = Directory.Exists(path) &&
                (File.GetAttributes(path) & FileAttributes.Directory) != 0;
            bool owned = isDirectory
                ? IndexOfOrdinalIgnoreCase(OwnedInstallDirectories, name) >= 0
                : IndexOfOrdinalIgnoreCase(OwnedInstallFiles, name) >= 0;
            if (!owned) unrelated.Add(name);
        }
        return unrelated;
    }

    private static int IndexOfOrdinalIgnoreCase(string[] values, string name)
    {
        for (int i = 0; i < values.Length; i++)
            if (string.Equals(values[i], name, StringComparison.OrdinalIgnoreCase)) return i;
        return -1;
    }

    private static string PreviewEntryNames(IList<string> names)
    {
        if (names == null || names.Count == 0) return "";
        int limit = names.Count < 5 ? names.Count : 5;
        var parts = new string[limit];
        for (int i = 0; i < limit; i++) parts[i] = names[i];
        string preview = string.Join(", ", parts);
        if (names.Count > 5) preview += ", ...";
        return preview;
    }

    private static string UnrecognizedNonEmptyFolderMessage()
    {
        return "The selected folder is not empty and is not a recognized UGSci Desktop installation."
            + Environment.NewLine + Environment.NewLine
            + "A recognized install has UGSci.exe (or the legacy name qwenpaw-desktop.exe) plus binaries\\state\\active.json or a legacy backend; or version.json with product \"UGSci Desktop\" plus one of those program markers."
            + Environment.NewLine + Environment.NewLine
            + "Choose an empty folder, or remove extra files and retry. Windows Explorer may have created desktop.ini in this folder, which also counts as extra content.";
    }

    private static string UnrelatedInstallEntriesMessage(string preview)
    {
        return "The existing UGSci Desktop folder also contains unrelated files or folders that Setup will not delete: "
            + preview + "."
            + Environment.NewLine + Environment.NewLine
            + "Move or remove those items (including desktop.ini or other files you added), then retry, or choose a different empty folder.";
    }

    private static string AlreadyInstalledElsewhereMessage(string existingDir)
    {
        return "UGSci Desktop is already installed at:"
            + Environment.NewLine + existingDir
            + Environment.NewLine + Environment.NewLine
            + "Setup cannot install to a second location. Uninstall the existing copy from Windows Settings first, or go back and keep the folder above to upgrade in place.";
    }

    private sealed class BlockingProcess
    {
        public int Id;
        public string Name;
        public string Path;
    }

    private static string QueryProcessImagePath(int processId)
    {
        IntPtr handle = OpenProcess(ProcessQueryLimitedInformation, false, processId);
        if (handle == IntPtr.Zero) return null;
        try
        {
            var buffer = new StringBuilder(32768);
            int size = buffer.Capacity;
            if (!QueryFullProcessImageNameW(handle, 0, buffer, ref size)) return null;
            return buffer.ToString();
        }
        finally
        {
            CloseHandle(handle);
        }
    }

    private static string NormalizeRootPrefix(string root)
    {
        if (string.IsNullOrWhiteSpace(root) || !Path.IsPathRooted(root.Trim())) return null;
        string full = Path.GetFullPath(root.Trim()).TrimEnd(
            Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        return full + Path.DirectorySeparatorChar;
    }

    private static bool PathIsUnderPrefix(string path, string prefix)
    {
        if (string.IsNullOrWhiteSpace(path) || string.IsNullOrWhiteSpace(prefix)) return false;
        return path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(path.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                prefix.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsCurrentSetupExecutable(string path)
    {
        if (string.IsNullOrWhiteSpace(path)) return false;
        try
        {
            string self = Process.GetCurrentProcess().MainModule.FileName;
            if (!string.IsNullOrWhiteSpace(self) &&
                string.Equals(Path.GetFullPath(self), Path.GetFullPath(path),
                    StringComparison.OrdinalIgnoreCase))
                return true;
        }
        catch { }
        return false;
    }

    private static List<BlockingProcess> FindBlockingSetupProcesses(IList<string> roots)
    {
        var prefixes = new List<string>();
        if (roots != null)
        {
            foreach (string root in roots)
            {
                try
                {
                    string prefix = NormalizeRootPrefix(root);
                    if (prefix != null && prefixes.IndexOf(prefix) < 0) prefixes.Add(prefix);
                }
                catch { }
            }
        }
        var found = new List<BlockingProcess>();
        if (prefixes.Count == 0) return found;
        int currentId = Process.GetCurrentProcess().Id;
        foreach (Process process in Process.GetProcesses())
        {
            try
            {
                if (process.Id == currentId) continue;
                string path = QueryProcessImagePath(process.Id);
                if (string.IsNullOrWhiteSpace(path)) continue;
                try { path = Path.GetFullPath(path); } catch { continue; }
                if (IsCurrentSetupExecutable(path)) continue;
                bool underRoot = false;
                foreach (string prefix in prefixes)
                {
                    if (PathIsUnderPrefix(path, prefix))
                    {
                        underRoot = true;
                        break;
                    }
                }
                if (!underRoot) continue;
                found.Add(new BlockingProcess {
                    Id = process.Id,
                    Name = process.ProcessName + ".exe",
                    Path = path
                });
            }
            catch { }
            finally
            {
                try { process.Dispose(); } catch { }
            }
        }
        return found;
    }

    private static string FormatBlockingProcesses(IList<BlockingProcess> processes)
    {
        var builder = new StringBuilder();
        int limit = processes.Count < 8 ? processes.Count : 8;
        for (int i = 0; i < limit; i++)
        {
            BlockingProcess process = processes[i];
            builder.Append(process.Name);
            builder.Append(" (PID ");
            builder.Append(process.Id.ToString(CultureInfo.InvariantCulture));
            builder.Append(")");
            builder.Append(Environment.NewLine);
            builder.Append("  ");
            builder.Append(process.Path);
            builder.Append(Environment.NewLine);
        }
        if (processes.Count > 8)
            builder.Append("  ...").Append(Environment.NewLine);
        return builder.ToString();
    }

    private static void KillBlockingSetupProcesses(IList<BlockingProcess> processes)
    {
        string taskkill = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),
            "taskkill.exe");
        foreach (BlockingProcess process in processes)
        {
            try
            {
                var start = new ProcessStartInfo {
                    FileName = taskkill,
                    Arguments = "/PID " + process.Id.ToString(CultureInfo.InvariantCulture) + " /T /F",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    WindowStyle = ProcessWindowStyle.Hidden
                };
                using (Process killer = Process.Start(start))
                {
                    if (killer != null) killer.WaitForExit(15000);
                }
            }
            catch
            {
                try
                {
                    using (Process target = Process.GetProcessById(process.Id))
                        target.Kill();
                }
                catch { }
            }
        }
        var waitIds = new List<int>();
        foreach (BlockingProcess process in processes) waitIds.Add(process.Id);
        if (waitIds.Count == 0) return;
        DateTime deadline = DateTime.UtcNow.AddSeconds(8);
        while (DateTime.UtcNow < deadline)
        {
            bool anyAlive = false;
            foreach (int id in waitIds)
            {
                try
                {
                    using (Process remaining = Process.GetProcessById(id))
                        if (!remaining.HasExited) anyAlive = true;
                }
                catch (ArgumentException) { }
            }
            if (!anyAlive) return;
            Thread.Sleep(250);
        }
    }

    private sealed class SetupForm : Form
    {
        private readonly string packageRoot;
        private readonly bool forceNoCliPath;
        private readonly Panel[] pages = new Panel[6];
        private readonly Button backButton;
        private readonly Button nextButton;
        private readonly Button cancelButton;
        private readonly TextBox location;
        private readonly Button browse;
        private readonly Label locationHint;
        private readonly Label locationStatus;
        private readonly CheckBox addPath;
        private readonly CheckBox desktopShortcut;
        private readonly Label verifyStatus;
        private readonly ProgressBar verifyProgress;
        private readonly Label installStatus;
        private readonly ProgressBar installProgress;
        private readonly Label completeStatus;
        private int pageIndex;
        private int resultCode = 1;
        private bool busy;
        private bool allowClose;
        private bool verificationComplete;
        public int ResultCode { get { return resultCode; } }

        public SetupForm(string root, bool noCliPath)
        {
            packageRoot = root;
            forceNoCliPath = noCliPath;
            Text = "UGSci Desktop Setup";
            Icon = TryLoadIcon();
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            ClientSize = new Size(620, 410);

            var host = new Panel { Dock = DockStyle.Top, Height = 350, BackColor = Color.White };
            Controls.Add(host);
            for (int i = 0; i < pages.Length; i++)
            {
                pages[i] = new Panel { Dock = DockStyle.Fill, Visible = false, BackColor = Color.White };
                host.Controls.Add(pages[i]);
            }

            pages[0].Controls.Add(new Label { Text = "Welcome to UGSci Desktop Setup", Font = new Font(Font.FontFamily, 17, FontStyle.Bold), AutoSize = true, Location = new Point(35, 45) });
            pages[0].Controls.Add(new Label { Text = "This wizard installs UGSci Desktop and its bundled QwenPaw runtime.\n\nSetup requires administrator permission. If UGSci Desktop is still running — including a copy started from this extracted folder — Setup will ask to close it before continuing. Existing user data is backed up before an upgrade.", AutoSize = true, MaximumSize = new Size(535, 0), Location = new Point(38, 105) });
            verifyStatus = new Label { Text = "Verifying installation package...", AutoSize = true, Location = new Point(38, 250), ForeColor = Color.DimGray };
            verifyProgress = new ProgressBar { Location = new Point(38, 278), Width = 525, Style = ProgressBarStyle.Marquee };
            pages[0].Controls.AddRange(new Control[] { verifyStatus, verifyProgress });

            pages[1].Controls.Add(PageTitle("Important information"));
            var notice = new RichTextBox { ReadOnly = true, BorderStyle = BorderStyle.FixedSingle, Location = new Point(38, 78), Size = new Size(525, 225), BackColor = Color.White, Text = "UGSci Desktop includes the QwenPaw backend, managed bundled plugins, and third-party runtimes.\n\nSetup installs the bundled Microsoft WebView2 runtime when it is missing; an internet connection is not required for that step. If WebView2 still cannot be installed, Setup continues. The desktop window and visualization stay unavailable until WebView2 is present; the QwenPaw CLI and backend remain usable.\n\nDuring an upgrade, application files are replaced atomically. QwenPaw workspaces, secrets, engines, models, state, and other user data are backed up or preserved.\n\nDo not select a folder containing unrelated files. Setup will refuse to delete or overwrite an unrecognized non-empty folder." };
            pages[1].Controls.Add(notice);

            pages[2].Controls.Add(PageTitle("Choose installation location"));
            pages[2].Controls.Add(new Label { Text = "Install UGSci Desktop to:", AutoSize = true, Location = new Point(38, 105) });
            location = new TextBox { Location = new Point(38, 132), Width = 420, Text = FindInstallLocation() };
            browse = new Button { Text = "Browse...", Location = new Point(470, 130), Width = 93 };
            browse.Click += BrowseClicked;
            locationHint = new Label { Text = "Administrator permission is required. The default location is Program Files.\nClick Next to check this folder before installing. An existing UGSci installation can be upgraded in place. A non-empty folder that is not UGSci, or that contains extra files such as desktop.ini, will be rejected.", AutoSize = true, MaximumSize = new Size(525, 0), Location = new Point(38, 175), ForeColor = Color.DimGray };
            locationStatus = new Label { Text = "", AutoSize = true, MaximumSize = new Size(525, 0), Location = new Point(38, 235), ForeColor = Color.Firebrick };
            pages[2].Controls.AddRange(new Control[] { location, browse, locationHint, locationStatus });

            pages[3].Controls.Add(PageTitle("Installation options"));
            addPath = new CheckBox { Text = "Add QwenPaw command line tools to my user PATH", AutoSize = true, Location = new Point(45, 110), Checked = !noCliPath, Enabled = !noCliPath };
            desktopShortcut = new CheckBox { Text = "Create a UGSci Desktop shortcut on the desktop", AutoSize = true, Location = new Point(45, 150), Checked = true };
            pages[3].Controls.AddRange(new Control[] { addPath, desktopShortcut, new Label { Text = "A Start menu shortcut and uninstall entry are always created.", AutoSize = true, Location = new Point(45, 205), ForeColor = Color.DimGray } });

            pages[4].Controls.Add(PageTitle("Installing UGSci Desktop"));
            installStatus = new Label { Text = "Preparing installation...", AutoSize = true, Location = new Point(38, 125) };
            installProgress = new ProgressBar { Location = new Point(38, 160), Width = 525, Style = ProgressBarStyle.Marquee };
            pages[4].Controls.AddRange(new Control[] { installStatus, installProgress });

            pages[5].Controls.Add(PageTitle("Setup complete"));
            completeStatus = new Label { AutoSize = true, MaximumSize = new Size(535, 0), Location = new Point(38, 115) };
            pages[5].Controls.Add(completeStatus);

            backButton = new Button { Text = "< Back", Location = new Point(350, 365), Width = 80 };
            nextButton = new Button { Text = "Next >", Location = new Point(438, 365), Width = 80, Enabled = false };
            cancelButton = new Button { Text = "Cancel", Location = new Point(526, 365), Width = 80 };
            backButton.Click += delegate { if (pageIndex > 0 && pageIndex < 4) ShowPage(pageIndex - 1); };
            nextButton.Click += NextClicked;
            cancelButton.Click += delegate { Close(); };
            Controls.AddRange(new Control[] { backButton, nextButton, cancelButton });
            AcceptButton = nextButton;
            CancelButton = cancelButton;
            ShowPage(0);
            Shown += delegate { VerifyPackageInBackground(); };
            FormClosing += SetupFormClosing;
        }

        private static Label PageTitle(string text)
        {
            return new Label { Text = text, Font = new Font(SystemFonts.MessageBoxFont.FontFamily, 14, FontStyle.Bold), AutoSize = true, Location = new Point(35, 35) };
        }

        private void BrowseClicked(object sender, EventArgs e)
        {
            using (var dialog = new FolderBrowserDialog { Description = "Choose where to install UGSci Desktop", SelectedPath = location.Text })
                if (dialog.ShowDialog(this) == DialogResult.OK) location.Text = dialog.SelectedPath;
        }

        private void ShowPage(int index)
        {
            pageIndex = index;
            for (int i = 0; i < pages.Length; i++) pages[i].Visible = i == index;
            pages[index].BringToFront();
            backButton.Enabled = !busy && index > 0 && index < 4;
            backButton.Visible = index < 4;
            cancelButton.Enabled = !busy && index < 5;
            cancelButton.Visible = index < 5;
            nextButton.Enabled = !busy && ((index == 0 && verificationComplete) || (index > 0 && index < 4) || index == 5);
            nextButton.Text = index == 3 ? "Install" : (index == 5 ? "Finish" : "Next >");
        }

        private void NextClicked(object sender, EventArgs e)
        {
            if (busy) return;
            if (pageIndex == 0 && verificationComplete)
            {
                if (ConfirmCloseRunningApplications()) ShowPage(1);
            }
            else if (pageIndex == 1) ShowPage(2);
            else if (pageIndex == 2)
            {
                if (TryAcceptInstallLocation()) ShowPage(3);
            }
            else if (pageIndex == 3) StartInstall();
            else if (pageIndex == 5) { allowClose = true; Close(); }
        }

        private void VerifyPackageInBackground()
        {
            busy = true;
            ShowPage(0);
            var thread = new Thread(new ThreadStart(delegate {
                string error = null;
                try { VerifyPackage(packageRoot); } catch (Exception ex) { error = ex.Message; }
                BeginInvoke((MethodInvoker)delegate {
                    busy = false;
                    verifyProgress.Visible = false;
                    if (error == null)
                    {
                        verificationComplete = true;
                        verifyStatus.Text = "Package verified. Click Next to continue.";
                        ShowPage(0);
                    }
                    else
                    {
                        resultCode = InvalidPackageExitCode;
                        verifyStatus.Text = "Package verification failed.";
                        string logPath = WriteFailureLog("setup", new InvalidDataException(error));
                        MessageBox.Show(this, error + "\n\nLog: " + logPath, Text,
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                        allowClose = true;
                        Close();
                    }
                });
            }));
            thread.IsBackground = true;
            thread.Start();
        }

        private string[] BlockingProcessRoots()
        {
            var roots = new List<string>();
            if (!string.IsNullOrWhiteSpace(packageRoot)) roots.Add(packageRoot);
            string registered = FindRegisteredInstallLocation();
            if (!string.IsNullOrWhiteSpace(registered)) roots.Add(registered);
            if (location != null && !string.IsNullOrWhiteSpace(location.Text))
                roots.Add(location.Text.Trim());
            return roots.ToArray();
        }

        private bool ConfirmCloseRunningApplications()
        {
            List<BlockingProcess> running = FindBlockingSetupProcesses(BlockingProcessRoots());
            if (running.Count == 0) return true;
            string message = "UGSci Desktop is still running. Setup must close it before files can be copied, including copies started from the extracted package."
                + Environment.NewLine + Environment.NewLine
                + "Running processes:"
                + Environment.NewLine
                + FormatBlockingProcesses(running)
                + Environment.NewLine
                + "Close these processes now?";
            if (MessageBox.Show(this, message, Text, MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question, MessageBoxDefaultButton.Button1) != DialogResult.Yes)
                return false;
            KillBlockingSetupProcesses(running);
            List<BlockingProcess> remaining = FindBlockingSetupProcesses(BlockingProcessRoots());
            if (remaining.Count == 0) return true;
            MessageBox.Show(this,
                "Setup could not close the following processes. Close UGSci Desktop (including any copy started from the extracted folder) and retry."
                + Environment.NewLine + Environment.NewLine
                + FormatBlockingProcesses(remaining),
                Text, MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return false;
        }

        private bool TryAcceptInstallLocation()
        {
            string normalized;
            string validationError;
            if (!TryNormalizeInstallLocation(location.Text, out normalized, out validationError))
            {
                locationStatus.Text = FirstLine(validationError);
                MessageBox.Show(this, validationError, Text, MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
            location.Text = normalized;
            locationStatus.Text = "";
            return true;
        }

        private static string FirstLine(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return value;
            int newline = value.IndexOf('\n');
            return newline < 0 ? value.Trim() : value.Substring(0, newline).Trim();
        }

        private void StartInstall()
        {
            if (!TryAcceptInstallLocation())
            {
                ShowPage(2);
                return;
            }
            if (!ConfirmCloseRunningApplications())
                return;
            string dir = location.Text.Trim();
            busy = true;
            installProgress.Style = ProgressBarStyle.Marquee;
            installProgress.Value = 0;
            ShowPage(4);
            installStatus.Text = "Backing up data and installing application files...";
            var thread = new Thread(new ThreadStart(delegate {
                int code = 1; string error = null; string logPath = null;
                try { code = RunInstaller(packageRoot, dir, forceNoCliPath || !addPath.Checked,
                    !desktopShortcut.Checked, false, null, out logPath); }
                catch (Exception ex) { error = ex.Message; logPath = WriteFailureLog("setup", ex); }
                BeginInvoke((MethodInvoker)delegate {
                    busy = false;
                    resultCode = code;
                    if (error != null || code != 0)
                    {
                        installProgress.Style = ProgressBarStyle.Continuous;
                        installProgress.Value = 0;
                        installStatus.Text = "Installation failed.";
                        string details = error ?? ("Installer exited with code " + code.ToString(CultureInfo.InvariantCulture));
                        if (!string.IsNullOrWhiteSpace(logPath)) details += "\n\nLog: " + logPath;
                        MessageBox.Show(this, details, Text, MessageBoxButtons.OK, MessageBoxIcon.Error);
                        ShowPage(3);
                    }
                    else
                    {
                        resultCode = 0;
                        completeStatus.Text = GetInstallCompleteMessage(dir, desktopShortcut.Checked);
                        if (File.Exists(Path.Combine(dir, "webview2-missing.txt")))
                            MessageBox.Show(this, completeStatus.Text, Text, MessageBoxButtons.OK, MessageBoxIcon.Warning);
                        allowClose = true;
                        ShowPage(5);
                    }
                });
            }));
            thread.IsBackground = true;
            thread.Start();
        }

        private void SetupFormClosing(object sender, FormClosingEventArgs e)
        {
            if (busy && !allowClose)
            {
                e.Cancel = true;
                MessageBox.Show(this, "Please wait for the current operation to finish.", Text, MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private Icon TryLoadIcon()
        {
            try { return Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { return null; }
        }

        private static string GetInstallCompleteMessage(string installDir, bool desktopShortcut)
        {
            string success = "UGSci Desktop was installed successfully.\n\nYou can start it from the Start menu" +
                (desktopShortcut ? " or desktop shortcut." : ".") +
                "\n\nThe downloaded ZIP and its extracted setup folder can now be deleted.";
            if (string.IsNullOrWhiteSpace(installDir) || !File.Exists(Path.Combine(installDir, "webview2-missing.txt")))
                return success;
            return success + "\n\nMicrosoft WebView2 Runtime could not be installed. The desktop window and visualization stay unavailable until WebView2 is installed. The QwenPaw CLI and backend are still available. Install WebView2 from Microsoft, or rerun the bundled installer in the application folder, then start UGSci Desktop again.";
        }

        private string FindInstallLocation()
        {
            string registered = FindRegisteredInstallLocation();
            if (!string.IsNullOrWhiteSpace(registered)) return registered;
            return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "UGSci Desktop");
        }

        private string FindRegisteredInstallLocation()
        {
            string uninstallRoot = @"Software\Microsoft\Windows\CurrentVersion\Uninstall";
            string[] preferredKeys = { "UGSci Desktop", "QwenPaw Desktop", "QwenPaw" };
            foreach (string keyName in preferredKeys)
            {
                string installed = ReadTrustedInstallLocation(uninstallRoot + "\\" + keyName);
                if (!string.IsNullOrWhiteSpace(installed)) return installed;
            }
            try
            {
                using (var root = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(uninstallRoot))
                {
                    if (root != null)
                    {
                        foreach (string keyName in root.GetSubKeyNames())
                        {
                            using (var key = root.OpenSubKey(keyName))
                            {
                                string displayName = key == null ? null : key.GetValue("DisplayName") as string;
                                if (string.IsNullOrWhiteSpace(displayName) ||
                                    (displayName.IndexOf("UGSci Desktop", StringComparison.OrdinalIgnoreCase) < 0 &&
                                     displayName.IndexOf("QwenPaw", StringComparison.OrdinalIgnoreCase) < 0)) continue;
                            }
                            string installed = ReadTrustedInstallLocation(uninstallRoot + "\\" + keyName);
                            if (!string.IsNullOrWhiteSpace(installed)) return installed;
                        }
                    }
                }
            }
            catch { }
            return null;
        }

        private static string ReadTrustedInstallLocation(string keyPath)
        {
            try
            {
                using (var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(keyPath))
                {
                    string value = key == null ? null : key.GetValue("InstallLocation") as string;
                    if (string.IsNullOrWhiteSpace(value) || !Path.IsPathRooted(value.Trim())) return null;
                    string location = Path.GetFullPath(value.Trim()).TrimEnd(
                        Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                    if (!Directory.Exists(location)) return null;
                    bool desktop = File.Exists(Path.Combine(location, "UGSci.exe")) ||
                        File.Exists(Path.Combine(location, "qwenpaw-desktop.exe"));
                    bool runtime = File.Exists(Path.Combine(location, "binaries", "state", "active.json")) ||
                        File.Exists(Path.Combine(location, "binaries", "qwenpaw-backend", "qwenpaw-backend.exe"));
                    bool productMarker = false;
                    string versionPath = Path.Combine(location, "version.json");
                    if (File.Exists(versionPath))
                    {
                        string version = File.ReadAllText(versionPath);
                        productMarker = version.IndexOf("UGSci Desktop", StringComparison.OrdinalIgnoreCase) >= 0;
                    }
                    return desktop && (runtime || productMarker) ? location : null;
                }
            }
            catch { return null; }
        }

        private bool TryNormalizeInstallLocation(string value, out string normalized, out string error)
        {
            normalized = null;
            error = null;
            try
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("Choose an installation folder.");
                if (!Path.IsPathRooted(value.Trim()))
                    throw new ArgumentException("The installation folder must be an absolute path.");
                normalized = Path.GetFullPath(value.Trim()).TrimEnd(
                    Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                string volumeRoot = Path.GetPathRoot(normalized);
                if (string.Equals(normalized, volumeRoot == null ? null : volumeRoot.TrimEnd(
                        Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                        StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("UGSci Desktop cannot be installed directly into a drive root.");

                string source = Path.GetFullPath(packageRoot).TrimEnd(
                    Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                string sourcePrefix = source + Path.DirectorySeparatorChar;
                string installPrefix = normalized + Path.DirectorySeparatorChar;
                if (string.Equals(normalized, source, StringComparison.OrdinalIgnoreCase) ||
                    installPrefix.StartsWith(sourcePrefix, StringComparison.OrdinalIgnoreCase) ||
                    sourcePrefix.StartsWith(installPrefix, StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("The installation folder must be separate from the extracted setup package.");
                if (File.Exists(normalized) && !Directory.Exists(normalized))
                    throw new ArgumentException("The selected installation path is an existing file. Choose a folder.");

                string registered = FindRegisteredInstallLocation();
                if (!string.IsNullOrWhiteSpace(registered) &&
                    !string.Equals(normalized, registered, StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException(AlreadyInstalledElsewhereMessage(registered));

                if (Directory.Exists(normalized) && Directory.GetFileSystemEntries(normalized).Length > 0)
                {
                    if (!IsExistingUGSciInstall(normalized))
                        throw new ArgumentException(UnrecognizedNonEmptyFolderMessage());
                    List<string> unrelated = GetUnrelatedInstallEntries(normalized);
                    if (unrelated.Count > 0)
                        throw new ArgumentException(UnrelatedInstallEntriesMessage(PreviewEntryNames(unrelated)));
                }
                return true;
            }
            catch (Exception ex)
            {
                error = ex.Message;
                normalized = null;
                return false;
            }
        }
    }

    private static string WriteFailureLog(string operation, Exception error)
    {
        string logPath = NewLogPath(operation);
        try { File.WriteAllText(logPath, error.ToString()); } catch { }
        if (string.Equals(operation, "setup", StringComparison.OrdinalIgnoreCase))
        {
            try { File.Copy(logPath, Path.Combine(Path.GetTempPath(), "ugsci-desktop-setup.log"), true); }
            catch { }
        }
        return logPath;
    }
}
