using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
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
        string ioRoot = ToExtendedPath(root);
        string prefix = ioRoot.EndsWith(Path.DirectorySeparatorChar.ToString(), StringComparison.Ordinal) ||
            ioRoot.EndsWith(Path.AltDirectorySeparatorChar.ToString(), StringComparison.Ordinal)
                ? ioRoot : ioRoot + Path.DirectorySeparatorChar;
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
            // .NET Framework has inconsistent File.Exists support for the
            // \\?\ prefix on ordinary short paths (including root-level
            // install.ps1).  Keep normal paths while they fit under MAX_PATH,
            // and only opt into the extended form for genuinely deep files.
            string fullPath = PathForIo(canonicalPath);
            if (!expected.Add(relative)) throw new InvalidDataException("Duplicate checksum entry: " + relative);
            if (!File.Exists(fullPath)) throw new InvalidDataException("Package file is missing: " + relative);
            string actual = Sha256(fullPath);
            if (!string.Equals(actual, match.Groups[1].Value, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("Package checksum mismatch: " + relative);
        }
        foreach (string file in Directory.GetFiles(ioRoot, "*", SearchOption.AllDirectories))
        {
            if (string.Equals(file, ToExtendedPath(manifest), StringComparison.OrdinalIgnoreCase)) continue;
            string relative = file.Substring(prefix.Length);
            if (!expected.Contains(relative)) throw new InvalidDataException("Unchecked package file: " + relative);
        }
        foreach (string required in new[] { "Setup.exe", "install.ps1", "version.json",
                     Path.Combine("payload", "Setup.exe"),
                     Path.Combine("payload", "Uninstall.exe"),
                     Path.Combine("payload", "UGSci.exe"),
                     Path.Combine("payload", "binaries", "state", "active.json"),
                     Path.Combine("payload", "binaries", "cli", "qwenpaw.exe"),
                     Path.Combine("payload", "binaries", "update-assistant", "UGSciUpdateAssistant.exe") })
            if (!expected.Contains(required)) throw new InvalidDataException("Required checksum entry is missing: " + required);
    }

    private static string PathForIo(string path)
    {
        // VerifyPackage combines an already-normalized absolute package root
        // with a validated relative path.  Calling Path.GetFullPath here is
        // unsafe on the .NET Framework used by the bootstrap: it throws for
        // paths over MAX_PATH before we get a chance to add the extended path
        // prefix.  Preserve short-path compatibility and convert long,
        // already-absolute paths directly.
        if (!Path.IsPathRooted(path))
            path = Path.GetFullPath(path);
        return path.Length < 248 ? path : ToExtendedPath(path);
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
        using (var stream = File.OpenRead(path))
        using (var sha = SHA256.Create())
            return BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").ToLowerInvariant();
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
            pages[0].Controls.Add(new Label { Text = "This wizard installs UGSci Desktop and its bundled QwenPaw runtime.\n\nClose UGSci Desktop before continuing. Existing user data is backed up before an upgrade.", AutoSize = true, MaximumSize = new Size(535, 0), Location = new Point(38, 105) });
            verifyStatus = new Label { Text = "Verifying installation package...", AutoSize = true, Location = new Point(38, 250), ForeColor = Color.DimGray };
            verifyProgress = new ProgressBar { Location = new Point(38, 278), Width = 525, Style = ProgressBarStyle.Marquee };
            pages[0].Controls.AddRange(new Control[] { verifyStatus, verifyProgress });

            pages[1].Controls.Add(PageTitle("Important information"));
            var notice = new RichTextBox { ReadOnly = true, BorderStyle = BorderStyle.FixedSingle, Location = new Point(38, 78), Size = new Size(525, 225), BackColor = Color.White, Text = "UGSci Desktop includes the QwenPaw backend, managed bundled plugins, and third-party runtimes.\n\nSetup may download the Microsoft WebView2 runtime when it is missing. During an upgrade, application files are replaced atomically. QwenPaw workspaces, secrets, engines, models, state, and other user data are backed up or preserved.\n\nDo not select a folder containing unrelated files. Setup will refuse to delete or overwrite an unrecognized non-empty folder." };
            pages[1].Controls.Add(notice);

            pages[2].Controls.Add(PageTitle("Choose installation location"));
            pages[2].Controls.Add(new Label { Text = "Install UGSci Desktop to:", AutoSize = true, Location = new Point(38, 105) });
            location = new TextBox { Location = new Point(38, 132), Width = 420, Text = FindInstallLocation() };
            browse = new Button { Text = "Browse...", Location = new Point(470, 130), Width = 93 };
            browse.Click += BrowseClicked;
            pages[2].Controls.AddRange(new Control[] { location, browse, new Label { Text = "An existing UGSci installation or uninstall remnant can be repaired in place.\nFolders with unrelated files are rejected.", AutoSize = true, Location = new Point(38, 180), ForeColor = Color.DimGray } });

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
            if (pageIndex == 0 && verificationComplete) ShowPage(1);
            else if (pageIndex == 1) ShowPage(2);
            else if (pageIndex == 2)
            {
                string normalized;
                string validationError;
                if (!TryNormalizeInstallLocation(location.Text, out normalized, out validationError))
                    MessageBox.Show(this, validationError, Text, MessageBoxButtons.OK, MessageBoxIcon.Warning);
                else
                {
                    location.Text = normalized;
                    ShowPage(3);
                }
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

        private void StartInstall()
        {
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
                        completeStatus.Text = "UGSci Desktop was installed successfully.\n\nYou can start it from the Start menu" +
                            (desktopShortcut.Checked ? " or desktop shortcut." : ".") +
                            "\n\nThe downloaded ZIP and its extracted setup folder can now be deleted.";
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

        private string FindInstallLocation()
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
            return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "UGSci Desktop");
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
