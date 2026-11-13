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
                        MessageBox.Show("另一个 UGSci 安装或卸载程序正在运行，请等待其完成。",
                            "UGSci 安装", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    else
                        WriteFailureLog(HasArgument(args, "--uninstall") ? "uninstall" : "setup",
                            new InvalidOperationException(
                            "另一个 UGSci 安装或卸载程序正在运行，请等待其完成。"));
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
                MessageBox.Show("安装程序无法继续。错误详情已写入日志，请查看后重试。\n\n日志位置：\n" + logPath, "UGSci 安装",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            else
                WriteFailureLog(HasArgument(args, "--uninstall") ? "uninstall" : "setup", error);
            return error is InvalidDataException ? InvalidPackageExitCode : LaunchFailureExitCode;
        }
    }

    private static int RunUninstaller(string installRoot, bool silent)
    {
        if (!silent && MessageBox.Show("确定要从此计算机卸载 UGSci 吗？", "UGSci 卸载",
                MessageBoxButtons.YesNo, MessageBoxIcon.Question) != DialogResult.Yes)
            return 0;

        string script = Path.Combine(installRoot, "uninstall.ps1");
        if (!File.Exists(script)) throw new FileNotFoundException("The UGSci uninstall script is missing.", script);
        string temporaryScript = Path.Combine(Path.GetTempPath(), "ugsci-desktop-uninstall-" +
            Process.GetCurrentProcess().Id.ToString(CultureInfo.InvariantCulture) + ".ps1");
        File.Copy(script, temporaryScript, true);
        string temporaryCleanup = Path.Combine(Path.GetTempPath(), "ugsci-desktop-uninstall-cleanup-" +
            Process.GetCurrentProcess().Id.ToString(CultureInfo.InvariantCulture) + ".ps1");
        string cleanup = Path.Combine(installRoot, "uninstall-cleanup.ps1");
        if (!File.Exists(cleanup)) throw new FileNotFoundException("The UGSci cleanup script is missing.", cleanup);
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
            if (!silent) MessageBox.Show("UGSci 卸载未完成，请查看日志后重试。" +
                "\n\n日志：" + logPath, "UGSci 卸载", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
                MessageBox.Show("UGSci 已卸载。关闭此窗口后将清理剩余应用文件。", "UGSci 卸载",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
            else
                MessageBox.Show("UGSci 卸载未完成。\n\n日志：" + result.LogPath,
                    "UGSci 卸载", MessageBoxButtons.OK, MessageBoxIcon.Error);
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
            if (HasArgument(new[] { args[i] }, name))
                return args[i + 1];
        return null;
    }

    private static int RunInstaller(string packageRoot, string installDir, bool noCliPath,
        bool noDesktopShortcut, bool deferredCommit, string transactionFile, out string logPath,
        Action<string> reportStage = null)
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
        ProcessResult result = RunPowerShell(packageRoot, Path.Combine(packageRoot, "install.ps1"), arguments, false, reportStage);
        logPath = result.LogPath;
        return result.ExitCode;
    }

    private static ProcessResult RunPowerShell(string workingDirectory, string script, IEnumerable<string> scriptArguments,
        bool uninstall, Action<string> reportStage = null)
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
        string logPath = NewLogPath(uninstall ? "uninstall" : "setup");
        // Flush as output arrives: a slow copy or interrupted installer must
        // leave useful diagnostics without retaining every line in memory.
        using (var log = new StreamWriter(new FileStream(logPath, FileMode.CreateNew,
            FileAccess.Write, FileShare.Read), new UTF8Encoding(false)))
        using (Process process = new Process { StartInfo = start })
        {
            log.AutoFlush = true;
            var elapsed = Stopwatch.StartNew();
            Action<string, string> writeLine = delegate(string channel, string line) {
                lock (log) log.WriteLine("{0:o} +{1:F3}s [{2}] {3}", DateTime.UtcNow,
                    elapsed.Elapsed.TotalSeconds, channel, line);
            };
            process.OutputDataReceived += delegate(object sender, DataReceivedEventArgs e) {
                if (e.Data == null) return;
                writeLine("stdout", e.Data);
                string stage = InstallerStage(e.Data);
                if (e.Data.StartsWith("[UGSCI-PHASE] ", StringComparison.Ordinal) ||
                    e.Data.StartsWith("[UGSCI-PROGRESS] ", StringComparison.Ordinal)) stage = e.Data;
                if (stage != null && reportStage != null) reportStage(stage);
            };
            process.ErrorDataReceived += delegate(object sender, DataReceivedEventArgs e) {
                if (e.Data != null) writeLine("stderr", e.Data);
            };
            writeLine("setup", "Starting installation process.");
            if (!process.Start()) throw new InvalidOperationException("Installer process did not start.");
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            process.WaitForExit();
            writeLine("setup", "Process exited with code " + process.ExitCode.ToString(CultureInfo.InvariantCulture) + ".");
            if (!uninstall)
            {
                try { File.Copy(logPath, Path.Combine(Path.GetTempPath(), "ugsci-desktop-setup.log"), true); }
                catch { }
            }
            return new ProcessResult(process.ExitCode, logPath);
        }
    }

    private static string InstallerStage(string line)
    {
        const string prefix = "[UGSCI-INSTALL] ";
        if (line == null || !line.StartsWith(prefix, StringComparison.Ordinal)) return null;
        string stage = line.Substring(prefix.Length).Trim();
        if (stage.Length == 0) return null;
        return stage.Length <= 240 ? stage : stage.Substring(0, 237) + "...";
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
        var quoted = new StringBuilder("\"");
        int backslashes = 0;
        foreach (char character in value)
        {
            if (character == '\\') { backslashes++; continue; }
            quoted.Append('\\', character == '"' ? backslashes * 2 + 1 : backslashes);
            quoted.Append(character);
            backslashes = 0;
        }
        // Windows command-line parsing consumes backslashes before a quote.
        // AppDomain.BaseDirectory ends with one, including during uninstall.
        quoted.Append('\\', backslashes * 2).Append('"');
        return quoted.ToString();
    }

    private static void VerifyPackage(string packageRoot)
    {
        VerifyPackageWithProgress(packageRoot, null);
    }

    private static void VerifyPackageWithProgress(string packageRoot, Action<long, long> report)
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
        string[] manifestLines = File.ReadAllLines(manifest);
        int totalEntries = 0;
        foreach (string entry in manifestLines)
            if (!string.IsNullOrWhiteSpace(entry)) totalEntries++;
        int verifiedEntries = 0;
        var progressClock = Stopwatch.StartNew();
        foreach (string rawLine in manifestLines)
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
            verifiedEntries++;
            if (report != null && (progressClock.ElapsedMilliseconds >= 100 || verifiedEntries == totalEntries))
            {
                report(verifiedEntries, totalEntries);
                progressClock.Restart();
            }
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

    private static long FileLengthLongPath(string path)
    {
        using (var handle = CreateFileW(ToExtendedPath(path), GenericRead, FileShareRead,
            IntPtr.Zero, OpenExisting, FileAttributeNormal, IntPtr.Zero))
        {
            if (handle.IsInvalid) throw new IOException("Cannot read package file: " + path);
            using (var stream = new FileStream(handle, FileAccess.Read)) return stream.Length;
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
        return "所选文件夹包含其他内容，未识别为 UGSci 安装目录。\n\n" +
            "请选择空文件夹或现有的 UGSci 安装目录。有效安装需要应用程序及对应的运行环境或版本标记。\n\n" +
            "Windows 资源管理器可能生成 desktop.ini，该文件也会计入文件夹内容。";
    }

    private static string UnrelatedInstallEntriesMessage(string preview)
    {
        return "UGSci 安装目录中包含以下额外文件或文件夹：\n" + preview +
            "\n\n请先移动这些内容（包括 desktop.ini），或选择其他空文件夹，再重试安装。";
    }

    private static string AlreadyInstalledElsewhereMessage(string existingDir)
    {
        return "检测到此计算机已安装 UGSci：\n" + existingDir +
            "\n\n请沿用上述目录进行升级。如需更换位置，请先从 Windows 设置中卸载现有版本。";
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

    // The overall value describes completed installation stages. Measured file
    // work advances within its stage; only a successful child exit completes it.
    private sealed class InstallProgressState
    {
        internal static readonly string[] PhaseNames = {
            "Preparing file operations", "Verifying package", "Checking backup and disk space",
            "Copying application files", "Backing up user data", "Checking WebView2 runtime",
            "Activating installation", "Preserving installed user data", "Registering application",
            "Committing installation", "Cleaning staging files"
        };
        internal static readonly string[] PhaseLabels = {
            "准备安装", "校验安装包", "检查磁盘与备份空间", "复制应用文件", "备份用户数据",
            "配置运行环境", "切换应用版本", "保留用户数据", "创建快捷方式与注册应用",
            "提交安装", "清理临时文件"
        };
        private static readonly int[] Starts = { 0, 2, 20, 23, 73, 82, 89, 91, 94, 96, 98 };
        private static readonly int[] Ends = { 2, 20, 23, 73, 82, 89, 91, 94, 96, 98, 99 };
        public int Phase = -1;
        public int Percent;
        public long Done;
        public long Total;
        private bool committed;
        public readonly Stopwatch PhaseClock = new Stopwatch();
        public bool Apply(string message)
        {
            if (message == null) return false;
            if (message.StartsWith("[UGSCI-PHASE] ", StringComparison.Ordinal))
            {
                string[] parts = message.Substring(14).Split('|');
                if (parts.Length != 2 || (parts[1] != "start" && parts[1] != "end")) return false;
                int index = Array.IndexOf(PhaseNames, parts[0]);
                if (index < 0 || index < Phase) return false;
                if (index != Phase)
                {
                    Phase = index; Done = 0; Total = 0; PhaseClock.Restart();
                }
                if (index == 9 && parts[1] == "end") committed = true;
                // The finally block also cleans up failed installs. It must
                // not make a failed copy appear to have almost completed.
                if (index != 10 || committed)
                    Percent = Math.Max(Percent, parts[1] == "end" ? Ends[index] : Starts[index]);
                return true;
            }
            if (!message.StartsWith("[UGSCI-PROGRESS] ", StringComparison.Ordinal)) return false;
            string[] values = message.Substring(17).Split('|');
            long done, total;
            if (values.Length != 3 || !long.TryParse(values[1], NumberStyles.None,
                    CultureInfo.InvariantCulture, out done) || !long.TryParse(values[2], NumberStyles.None,
                    CultureInfo.InvariantCulture, out total) || total <= 0 || done < 0 || done > total) return false;
            int expected = values[0] == "copy" ? 3 : (values[0] == "verify" ? 1 : -1);
            if (expected < 0 || Phase != expected || done < Done) return false;
            Done = done; Total = total;
            Percent = Math.Max(Percent, Starts[Phase] + (int)((Ends[Phase] - Starts[Phase]) * ((double)Done / Total)));
            return true;
        }
    }

    private sealed class ProgressStrip : Control
    {
        private int value;
        public int Value {
            get { return value; }
            set { this.value = Math.Max(0, Math.Min(100, value)); AccessibleDescription = this.value + "%"; Invalidate(); }
        }
        public ProgressStrip()
        {
            SetStyle(ControlStyles.UserPaint | ControlStyles.AllPaintingInWmPaint |
                ControlStyles.OptimizedDoubleBuffer | ControlStyles.ResizeRedraw, true);
            AccessibleRole = AccessibleRole.ProgressBar;
            AccessibleName = "安装进度";
            Height = 6;
        }
        protected override void OnPaint(PaintEventArgs e)
        {
            e.Graphics.Clear(Color.FromArgb(224, 224, 224));
            using (var brush = new SolidBrush(ForeColor))
                e.Graphics.FillRectangle(brush, 0, 0, Width * value / 100, Height);
        }
    }

    private sealed class StepSidebar : Control
    {
        public int Step;
        public Icon BrandIcon;
        public StepSidebar()
        {
            Width = 160; Dock = DockStyle.Left; BackColor = Color.FromArgb(244, 244, 244);
            SetStyle(ControlStyles.OptimizedDoubleBuffer | ControlStyles.AllPaintingInWmPaint |
                ControlStyles.UserPaint | ControlStyles.ResizeRedraw, true);
        }
        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            float scale = Width / 160f;
            e.Graphics.ScaleTransform(scale, scale);
            e.Graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            if (BrandIcon != null) e.Graphics.DrawIcon(BrandIcon, new Rectangle(24, 30, 25, 25));
            using (var brand = new Font("Microsoft YaHei UI", 15, FontStyle.Bold, GraphicsUnit.Pixel))
            using (var regular = new Font("Microsoft YaHei UI", 12, FontStyle.Regular, GraphicsUnit.Pixel))
            using (var active = new Font("Microsoft YaHei UI", 12, FontStyle.Bold, GraphicsUnit.Pixel))
            using (var line = new Pen(Color.FromArgb(210, 210, 210)))
            {
                e.Graphics.DrawString("UGSci", brand, Brushes.Black, 54, 32);
                string[] labels = { "安装设置", "正在安装", "完成" };
                for (int i = 0; i < labels.Length; i++)
                {
                    int y = 112 + i * 48;
                    if (i < 2) e.Graphics.DrawLine(line, 32, y + 10, 32, y + 38);
                    Brush dot = i == Step ? Brushes.Black : (i < Step ? Brushes.Gray : Brushes.LightGray);
                    e.Graphics.FillEllipse(dot, 26, y - 6, 12, 12);
                    if (i < Step)
                        using (var check = new Pen(Color.White, 1.4f))
                            e.Graphics.DrawLines(check, new[] { new Point(29, y), new Point(31, y + 2), new Point(35, y - 2) });
                    e.Graphics.DrawString(labels[i], i == Step ? active : regular,
                        i == Step ? Brushes.Black : Brushes.DimGray, 49, y - 9);
                }
            }
        }
    }

    private sealed class SetupForm : Form
    {
        private readonly string packageRoot;
        private readonly bool forceNoCliPath;
        private readonly Panel[] pages = new Panel[3];
        private readonly StepSidebar sidebar;
        private readonly Button nextButton;
        private readonly Button cancelButton;
        private readonly LinkLabel detailsButton;
        private readonly TextBox location;
        private readonly Label spaceStatus;
        private readonly Label locationStatus;
        private readonly CheckBox addPath;
        private readonly CheckBox desktopShortcut;
        private readonly Label verifyStatus;
        private readonly ProgressStrip verifyProgress;
        private readonly Label installStatus;
        private readonly Label installMetrics;
        private readonly Label installPercent;
        private readonly Label installNext;
        private readonly Label installTime;
        private readonly ProgressStrip installProgress;
        private readonly Label completeStatus;
        private readonly TextBox details;
        private readonly System.Windows.Forms.Timer clock;
        private readonly Stopwatch elapsed = new Stopwatch();
        private InstallProgressState progress = new InstallProgressState();
        private readonly Queue<string> recentStages = new Queue<string>();
        private string installLog;
        private bool detailsExpanded;
        private int collapsedHeight;
        private int pageIndex;
        private int resultCode = 1;
        private bool busy;
        private bool allowClose;
        private bool verificationComplete;
        public int ResultCode { get { return resultCode; } }

        public SetupForm(string root, bool noCliPath)
        {
            packageRoot = root; forceNoCliPath = noCliPath;
            Text = "UGSci 安装"; Icon = TryLoadIcon();
            Font = new Font("Microsoft YaHei UI", 9.75f);
            AutoScaleDimensions = new SizeF(96, 96); AutoScaleMode = AutoScaleMode.Dpi;
            FormBorderStyle = FormBorderStyle.FixedDialog; MaximizeBox = false; MinimizeBox = true;
            StartPosition = FormStartPosition.CenterScreen; ClientSize = new Size(740, 480);
            BackColor = Color.White; ForeColor = Color.FromArgb(32, 32, 32);
            sidebar = new StepSidebar { BrandIcon = Icon };
            var body = new Panel { Dock = DockStyle.Fill, BackColor = Color.White };
            Controls.Add(body); Controls.Add(sidebar);
            var footer = new Panel { Dock = DockStyle.Bottom, Height = 62, BackColor = Color.FromArgb(250, 250, 250) };
            footer.Controls.Add(new Panel { Dock = DockStyle.Top, Height = 1, BackColor = Color.FromArgb(226, 226, 226) });
            body.Controls.Add(footer);
            var host = new Panel { Dock = DockStyle.Fill };
            body.Controls.Add(host); host.BringToFront();
            for (int i = 0; i < pages.Length; i++)
            {
                pages[i] = new Panel { Name = "page-" + i, Dock = DockStyle.Fill, Visible = false, AutoScroll = true };
                host.Controls.Add(pages[i]);
            }
            pages[0].Controls.Add(PageTitle("安装选项"));
            pages[0].Controls.Add(TextLabel("选择安装位置和快捷方式。", 30, 72, 510, 23, false));
            pages[0].Controls.Add(TextLabel("安装位置", 30, 117, 500, 22, false));
            location = new TextBox { Location = new Point(30, 147), Width = 405, Text = FindInstallLocation() };
            var browse = ActionButton("浏览…", 447, 144, 103);
            browse.Click += BrowseClicked;
            spaceStatus = TextLabel("正在计算安装空间…", 30, 183, 520, 23, true);
            desktopShortcut = new CheckBox { Text = "创建桌面快捷方式", AutoSize = true, Location = new Point(30, 228), Checked = true };
            addPath = new CheckBox { Text = "添加命令行工具到 PATH", AutoSize = true, Location = new Point(30, 262), Checked = !noCliPath, Enabled = !noCliPath };
            pages[0].Controls.AddRange(new Control[] { location, browse, spaceStatus, desktopShortcut, addPath });
            pages[0].Controls.Add(TextLabel("安装时需要管理员权限。", 30, 314, 520, 22, true));
            locationStatus = TextLabel("", 30, 339, 520, 30, true); locationStatus.ForeColor = Color.Firebrick;
            verifyStatus = TextLabel("正在校验安装包…", 30, 376, 520, 22, true);
            verifyProgress = new ProgressStrip { Location = new Point(30, 406), Width = 520, Height = 4 };
            pages[0].Controls.AddRange(new Control[] { locationStatus, verifyStatus, verifyProgress });
            location.TextChanged += delegate { UpdateAvailableSpace(); };

            pages[1].Controls.Add(PageTitle("正在安装"));
            installStatus = TextLabel("正在准备安装…", 30, 74, 520, 25, false);
            installProgress = new ProgressStrip { Location = new Point(30, 131), Width = 520 };
            installMetrics = TextLabel("安装进度（按阶段）", 30, 153, 360, 24, true);
            installPercent = TextLabel("总进度 0%", 400, 153, 150, 24, false); installPercent.TextAlign = ContentAlignment.TopRight;
            installNext = TextLabel("", 30, 208, 520, 25, false);
            installTime = TextLabel("", 30, 249, 520, 48, true);
            pages[1].Controls.AddRange(new Control[] { installStatus, installProgress, installMetrics, installPercent, installNext, installTime });
            pages[1].Controls.Add(TextLabel("正在安装期间请保持窗口打开。", 30, 310, 520, 25, true));
            details = new TextBox { Name = "installation-details", Location = new Point(30, 354), Width = 520, Height = 148,
                ReadOnly = true, Multiline = true, ScrollBars = ScrollBars.Vertical, Visible = false, BackColor = Color.FromArgb(250, 250, 250) };
            pages[1].Controls.Add(details);

            pages[2].Controls.Add(PageTitle("UGSci 安装完成"));
            completeStatus = TextLabel("", 30, 95, 520, 300, false);
            pages[2].Controls.Add(completeStatus);
            detailsButton = new LinkLabel { Text = "安装说明", Location = new Point(30, 21), AutoSize = true,
                LinkColor = ForeColor, ActiveLinkColor = ForeColor, VisitedLinkColor = ForeColor };
            detailsButton.LinkClicked += DetailsClicked;
            nextButton = ActionButton("安装", 447, 16, 103); nextButton.BackColor = ForeColor;
            nextButton.ForeColor = Color.White; nextButton.FlatAppearance.BorderSize = 0;
            nextButton.FlatAppearance.MouseOverBackColor = Color.FromArgb(55, 55, 55);
            nextButton.FlatAppearance.MouseDownBackColor = Color.FromArgb(75, 75, 75);
            cancelButton = ActionButton("取消", 332, 16, 103);
            nextButton.Click += NextClicked; cancelButton.Click += delegate { Close(); };
            footer.Controls.AddRange(new Control[] { detailsButton, nextButton, cancelButton });
            nextButton.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            cancelButton.Anchor = AnchorStyles.Top | AnchorStyles.Right;
            AcceptButton = nextButton; CancelButton = cancelButton;
            clock = new System.Windows.Forms.Timer { Interval = 1000 };
            clock.Tick += delegate { if (pageIndex == 1) RenderProgress(); };
            FormClosed += delegate { clock.Dispose(); };
            ShowPage(0);
            Shown += delegate {
                FitToWorkingArea(Screen.FromControl(this).WorkingArea);
                VerifyPackageInBackground();
            };
            FormClosing += SetupFormClosing;
        }

        private static Label TextLabel(string text, int x, int y, int width, int height, bool muted)
        {
            return new Label { Text = text, Location = new Point(x, y), Size = new Size(width, height),
                ForeColor = muted ? Color.DimGray : Color.FromArgb(32, 32, 32) };
        }
        private static Label PageTitle(string text)
        {
            var label = TextLabel(text, 30, 31, 520, 32, false);
            label.Font = new Font("Microsoft YaHei UI", 14, FontStyle.Bold); return label;
        }
        private static Button ActionButton(string text, int x, int y, int width)
        {
            var button = new Button { Text = text, Location = new Point(x, y), Size = new Size(width, 31),
                FlatStyle = FlatStyle.Flat, BackColor = Color.White, UseVisualStyleBackColor = false };
            button.FlatAppearance.BorderColor = Color.FromArgb(185, 185, 185);
            button.FlatAppearance.MouseOverBackColor = Color.FromArgb(245, 245, 245);
            return button;
        }
        private void PostUi(MethodInvoker action)
        {
            if (IsDisposed || !IsHandleCreated) return;
            try { BeginInvoke((MethodInvoker)delegate { if (!IsDisposed) action(); }); }
            catch (InvalidOperationException) { }
        }
        private void FitToWorkingArea(Rectangle workingArea)
        {
            Size = new Size(Math.Min(Width, workingArea.Width), Math.Min(Height, workingArea.Height));
            Location = new Point(Math.Max(workingArea.Left, Math.Min(Left, workingArea.Right - Width)),
                Math.Max(workingArea.Top, Math.Min(Top, workingArea.Bottom - Height)));
        }
        private void BrowseClicked(object sender, EventArgs e)
        {
            using (var dialog = new FolderBrowserDialog { Description = "选择 UGSci 的安装位置", SelectedPath = location.Text })
                if (dialog.ShowDialog(this) == DialogResult.OK) location.Text = dialog.SelectedPath;
        }
        private long packageBytes;
        private void UpdateAvailableSpace()
        {
            try
            {
                string root = Path.GetPathRoot(Path.GetFullPath(location.Text.Trim()));
                long free = new DriveInfo(root).AvailableFreeSpace;
                spaceStatus.Text = (packageBytes > 0 ? "应用文件 " + FormatBytes(packageBytes) + "　" : "") +
                    "可用空间 " + FormatBytes(free);
            }
            catch { spaceStatus.Text = "安装前将检查应用文件和用户数据备份所需空间。"; }
        }
        private static string FormatBytes(long bytes)
        {
            return bytes >= 1073741824 ? (bytes / 1073741824d).ToString("0.00") + " GB" :
                (bytes / 1048576d).ToString("0.0") + " MB";
        }
        private void ShowPage(int index)
        {
            if (index != 1 && detailsExpanded)
            {
                detailsExpanded = false; details.Visible = false;
                Height = collapsedHeight;
            }
            pageIndex = index; sidebar.Step = index; sidebar.Invalidate();
            for (int i = 0; i < pages.Length; i++) pages[i].Visible = i == index;
            pages[index].BringToFront();
            cancelButton.Enabled = !busy; cancelButton.Visible = index < 2;
            nextButton.Visible = index != 1; nextButton.Enabled = !busy && (verificationComplete || index == 2);
            nextButton.Text = index == 2 ? "完成" : "安装";
            cancelButton.Left = index == 1 ? nextButton.Left : nextButton.Left - cancelButton.Width - (int)(12 * sidebar.Width / 160d);
            detailsButton.Text = index == 0 ? (installLog == null ? "安装说明" : "查看安装日志") :
                (index == 2 ? "查看安装日志" : "展开安装详情");
            if (IsHandleCreated) FitToWorkingArea(Screen.FromControl(this).WorkingArea);
        }
        private void NextClicked(object sender, EventArgs e)
        {
            if (busy) return;
            if (pageIndex == 0 && verificationComplete) StartInstall();
            else if (pageIndex == 2) { allowClose = true; Close(); }
        }
        private void DetailsClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            if (pageIndex == 0)
            {
                if (installLog != null) { OpenLog(); return; }
                MessageBox.Show(this, "UGSci 包含应用程序、内置组件与第三方运行环境。\n\n" +
                    "安装包附带离线 WebView2 安装程序，此步骤无需联网。如果系统组件安装失败，应用仍会完成安装，并提示后续处理方式。\n\n" +
                    "升级前会备份用户数据，并保留工作区、模型和配置。请选择空文件夹或现有 UGSci 安装目录。",
                    "安装说明", MessageBoxButtons.OK, MessageBoxIcon.Information);
                return;
            }
            if (pageIndex == 2) { OpenLog(); return; }
            if (!detailsExpanded) collapsedHeight = Height;
            detailsExpanded = !detailsExpanded; details.Visible = detailsExpanded;
            int extra = (int)(140 * sidebar.Width / 160d);
            Height = detailsExpanded ? collapsedHeight + extra : collapsedHeight;
            FitToWorkingArea(Screen.FromControl(this).WorkingArea);
            detailsButton.Text = detailsExpanded ? "收起安装详情" : "展开安装详情";
        }
        private void OpenLog()
        {
            try { if (!string.IsNullOrWhiteSpace(installLog)) Process.Start(new ProcessStartInfo(installLog) { UseShellExecute = true }); }
            catch { MessageBox.Show(this, "日志位置：\n" + installLog, Text, MessageBoxButtons.OK, MessageBoxIcon.Information); }
        }
        private void VerifyPackageInBackground()
        {
            busy = true; ShowPage(0);
            var thread = new Thread(new ThreadStart(delegate {
                string error = null;
                long bytes = 0;
                try
                {
                    VerifyPackageWithProgress(packageRoot, delegate(long done, long total) {
                        PostUi(delegate {
                            verifyProgress.Value = total > 0 ? (int)Math.Min(99, done * 100d / total) : 0;
                            verifyStatus.Text = "正在校验安装包　" + done + " / " + total + " 个文件";
                        });
                    });
                    // Use the checked manifest paths rather than a second unrestricted tree walk.
                    foreach (string line in File.ReadAllLines(Path.Combine(packageRoot, "checksums.sha256")))
                        if (line.Length > 66 && line.Substring(66).Replace('/', '\\').StartsWith("payload\\", StringComparison.OrdinalIgnoreCase))
                            bytes += FileLengthLongPath(Path.Combine(packageRoot, SafeRelativePath(line.Substring(66))));
                }
                catch (Exception ex) { error = ex.Message; installLog = WriteFailureLog("setup", ex); }
                PostUi(delegate {
                    busy = false; verifyProgress.Visible = false;
                    if (error == null)
                    {
                        verificationComplete = true; packageBytes = bytes; UpdateAvailableSpace();
                        verifyStatus.Text = "安装包校验通过";
                    }
                    else
                    {
                        resultCode = InvalidPackageExitCode; verifyStatus.ForeColor = Color.Firebrick;
                        verifyStatus.Text = "安装包校验失败，请重新下载完整安装包。";
                        MessageBox.Show(this, "安装包未通过完整性校验。请重新下载并解压后重试。\n\n日志位置：\n" + installLog,
                            Text, MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                    ShowPage(0);
                });
            }));
            thread.IsBackground = true; thread.Start();
        }
        private string[] BlockingProcessRoots()
        {
            var roots = new List<string>();
            if (!string.IsNullOrWhiteSpace(packageRoot)) roots.Add(packageRoot);
            string registered = FindRegisteredInstallLocation();
            if (!string.IsNullOrWhiteSpace(registered)) roots.Add(registered);
            if (!string.IsNullOrWhiteSpace(location.Text)) roots.Add(location.Text.Trim());
            return roots.ToArray();
        }
        private bool ConfirmCloseRunningApplications()
        {
            List<BlockingProcess> running = FindBlockingSetupProcesses(BlockingProcessRoots());
            if (running.Count == 0) return true;
            string message = "UGSci 正在运行。安装前需要关闭以下应用进程，包括从解压目录启动的副本。\n请先保存正在进行的工作。\n\n" +
                FormatBlockingProcesses(running) + "\n\n现在关闭这些进程并继续安装？";
            if (MessageBox.Show(this, message, Text, MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) != DialogResult.Yes) return false;
            KillBlockingSetupProcesses(running);
            List<BlockingProcess> remaining = FindBlockingSetupProcesses(BlockingProcessRoots());
            if (remaining.Count == 0) return true;
            MessageBox.Show(this, "以下进程暂时无法关闭，请手动关闭后重试：\n\n" + FormatBlockingProcesses(remaining),
                Text, MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return false;
        }
        private bool TryAcceptInstallLocation()
        {
            string normalized, validationError;
            if (!TryNormalizeInstallLocation(location.Text, out normalized, out validationError))
            {
                locationStatus.Text = FirstLine(validationError);
                MessageBox.Show(this, validationError, Text, MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return false;
            }
            location.Text = normalized; locationStatus.Text = ""; return true;
        }
        private static string FirstLine(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return value;
            int newline = value.IndexOf('\n');
            return newline < 0 ? value.Trim() : value.Substring(0, newline).Trim();
        }
        private void StartInstall()
        {
            if (!TryAcceptInstallLocation() || !ConfirmCloseRunningApplications()) return;
            string dir = location.Text.Trim();
            busy = true; progress = new InstallProgressState(); installProgress.Value = 0;
            elapsed.Restart(); clock.Start(); ShowPage(1); RenderProgress();
            bool noCli = forceNoCliPath || !addPath.Checked;
            bool noDesktop = !desktopShortcut.Checked;
            var thread = new Thread(new ThreadStart(delegate {
                int code = 1; string error = null; string logPath = null;
                try { code = RunInstaller(packageRoot, dir, noCli,
                    noDesktop, false, null, out logPath, delegate(string stage) {
                        PostUi(delegate {
                            if (!busy) return;
                            if (progress.Apply(stage)) RenderProgress();
                            if (!stage.StartsWith("[UGSCI-PROGRESS]", StringComparison.Ordinal))
                            {
                                recentStages.Enqueue(stage);
                                while (recentStages.Count > 100) recentStages.Dequeue();
                                details.Text = string.Join(Environment.NewLine, recentStages.ToArray());
                                details.SelectionStart = details.TextLength; details.ScrollToCaret();
                            }
                        });
                    }); }
                catch (Exception ex) { error = ex.Message; logPath = WriteFailureLog("setup", ex); }
                PostUi(delegate {
                    busy = false; clock.Stop(); elapsed.Stop(); resultCode = code; installLog = logPath;
                    if (error != null || code != 0)
                    {
                        installProgress.Value = 0; installPercent.Text = "0%"; installStatus.Text = "安装未完成";
                        MessageBox.Show(this, "安装未完成，已保留安装日志。请检查可用空间和运行中的应用后重试。\n\n日志位置：\n" + installLog,
                            Text, MessageBoxButtons.OK, MessageBoxIcon.Error);
                        ShowPage(0); verifyStatus.Text = "上次安装未完成。日志：" + installLog;
                    }
                    else
                    {
                        installProgress.Value = 100; installPercent.Text = "100%";
                        completeStatus.Text = GetInstallCompleteMessage(dir, desktopShortcut.Checked);
                        allowClose = true; ShowPage(2);
                    }
                });
            }));
            thread.IsBackground = true; thread.Start();
        }
        private void RenderProgress()
        {
            int phase = progress.Phase;
            installStatus.Text = phase >= 0 ? "正在" + InstallProgressState.PhaseLabels[phase] + "…" : "正在启动安装程序…";
            installProgress.Value = progress.Percent; installPercent.Text = "总进度 " + progress.Percent + "%";
            installMetrics.Text = progress.Total > 0 ? (phase == 3 ? "已复制 " + FormatBytes(progress.Done) + " / " + FormatBytes(progress.Total) :
                "已校验 " + progress.Done + " / " + progress.Total + " 个文件") : "安装进度（按阶段）";
            installNext.Text = phase < 0 ? "下一步：校验安装包" :
                (phase + 1 < InstallProgressState.PhaseLabels.Length ?
                "下一步：" + InstallProgressState.PhaseLabels[phase + 1] : "正在完成安装");
            string remaining = "";
            double seconds = progress.PhaseClock.Elapsed.TotalSeconds;
            if (phase == 3 && seconds >= 2 && progress.Done > 1048576 && progress.Done < progress.Total)
            {
                int estimate = (int)Math.Min(86400, Math.Ceiling((progress.Total - progress.Done) * seconds / progress.Done));
                remaining = "复制预计剩余约 " + (estimate >= 60 ? Math.Ceiling(estimate / 60d) + " 分钟" : Math.Max(1, estimate) + " 秒");
            }
            else if (phase == 5) remaining = "正在等待系统组件配置，最多约 5 分钟";
            else remaining = "正在处理当前步骤，请稍候";
            installTime.Text = "已用时 " + elapsed.Elapsed.ToString(@"mm\:ss") + "\n" + remaining;
        }
        private void SetupFormClosing(object sender, FormClosingEventArgs e)
        {
            if (busy && !allowClose)
            {
                e.Cancel = true;
                MessageBox.Show(this, "当前操作正在进行，请等待完成后再关闭窗口。", Text, MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }
        private Icon TryLoadIcon()
        {
            try { return Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { return null; }
        }
        private static string GetInstallCompleteMessage(string installDir, bool desktopShortcut)
        {
            string success = "UGSci 已安装完成。\n\n可以从开始菜单" + (desktopShortcut ? "或桌面快捷方式" : "") +
                "启动应用。\n\n安装位置：\n" + installDir + "\n\n下载的 ZIP 和解压后的安装目录现在可以删除。";
            if (string.IsNullOrWhiteSpace(installDir) || !File.Exists(Path.Combine(installDir, "webview2-missing.txt"))) return success;
            return success + "\n\nWebView2 尚未安装成功。请运行安装目录中的 WebView2 安装程序后再启动桌面窗口。命令行与后台服务可正常使用。";
        }

        private string FindInstallLocation()
        {
            string registered = FindRegisteredInstallLocation();
            if (!string.IsNullOrWhiteSpace(registered)) return registered;
            return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "UGSci");
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
                                    (displayName.IndexOf("UGSci", StringComparison.OrdinalIgnoreCase) < 0 &&
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
                    throw new ArgumentException("请选择安装文件夹。");
                if (!Path.IsPathRooted(value.Trim()))
                    throw new ArgumentException("安装位置必须使用完整路径。");
                normalized = Path.GetFullPath(value.Trim()).TrimEnd(
                    Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                string volumeRoot = Path.GetPathRoot(normalized);
                if (string.Equals(normalized, volumeRoot == null ? null : volumeRoot.TrimEnd(
                        Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar),
                        StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("请选择磁盘中的文件夹，不能直接安装到磁盘根目录。");

                string source = Path.GetFullPath(packageRoot).TrimEnd(
                    Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
                string sourcePrefix = source + Path.DirectorySeparatorChar;
                string installPrefix = normalized + Path.DirectorySeparatorChar;
                if (string.Equals(normalized, source, StringComparison.OrdinalIgnoreCase) ||
                    installPrefix.StartsWith(sourcePrefix, StringComparison.OrdinalIgnoreCase) ||
                    sourcePrefix.StartsWith(installPrefix, StringComparison.OrdinalIgnoreCase))
                    throw new ArgumentException("安装文件夹与解压后的安装包目录必须相互独立，不能重叠或互相包含。");
                if (File.Exists(normalized) && !Directory.Exists(normalized))
                    throw new ArgumentException("所选位置是一个文件，请选择文件夹。");

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
