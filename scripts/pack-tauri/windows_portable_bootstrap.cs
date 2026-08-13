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
            VerifyPackage(packageRoot);
            if (silent)
                return RunInstaller(packageRoot, null, true, HasNoCliPath(args), null);

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            using (var form = new SetupForm(packageRoot, HasNoCliPath(args)))
            {
                Application.Run(form);
                return form.ResultCode;
            }
        }
        catch (Exception error)
        {
            if (!silent)
                MessageBox.Show(error.Message, "UGSci Desktop Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return error is InvalidDataException ? InvalidPackageExitCode : LaunchFailureExitCode;
        }
    }

    private static bool HasNoCliPath(string[] args)
    {
        return HasArgument(args, "--no-cli-path") || HasArgument(args, "/NO_QWENPAW_PATH");
    }

    private static bool HasArgument(string[] args, string value)
    {
        foreach (string arg in args)
            if (string.Equals(arg, value, StringComparison.OrdinalIgnoreCase)) return true;
        return false;
    }

    private static int RunInstaller(string packageRoot, string installDir, bool silent, bool noCliPath, Action<string> output)
    {
        string powershell = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows),
            "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
        if (!File.Exists(powershell)) throw new FileNotFoundException("Windows PowerShell was not found.", powershell);
        string script = Path.Combine(packageRoot, "install.ps1");
        var arguments = new List<string> {
            "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", Quote(script), "-Silent"
        };
        if (noCliPath) arguments.Add("-NoCliPath");
        if (!string.IsNullOrWhiteSpace(installDir)) arguments.Add("-InstallDir");
        if (!string.IsNullOrWhiteSpace(installDir)) arguments.Add(Quote(installDir));

        var start = new ProcessStartInfo {
            FileName = powershell,
            Arguments = string.Join(" ", arguments.ToArray()),
            WorkingDirectory = packageRoot,
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
            process.CancelOutputRead();
            process.CancelErrorRead();
            string stdout = stdoutBuilder.ToString();
            string stderr = stderrBuilder.ToString();
            string logPath = Path.Combine(Path.GetTempPath(), "ugsci-desktop-setup.log");
            File.WriteAllText(logPath, stdout + Environment.NewLine + stderr);
            if (output != null)
            {
                if (!string.IsNullOrWhiteSpace(stdout)) output(stdout.Trim());
                if (!string.IsNullOrWhiteSpace(stderr)) output(stderr.Trim());
                output("Log: " + logPath);
            }
            if (process.ExitCode != 0 && silent) return process.ExitCode;
            return process.ExitCode;
        }
    }

    private static string Quote(string value)
    {
        return "\"" + value.Replace("\"", "\\\"") + "\"";
    }

    private static void VerifyPackage(string packageRoot)
    {
        string root = Path.GetFullPath(packageRoot).TrimEnd(Path.DirectorySeparatorChar);
        string prefix = root + Path.DirectorySeparatorChar;
        string manifest = Path.Combine(root, "checksums.sha256");
        if (!File.Exists(manifest)) throw new InvalidDataException("checksums.sha256 is missing.");
        var expected = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var pattern = new Regex("^([0-9a-fA-F]{64})  (.+)$", RegexOptions.CultureInvariant);
        foreach (string rawLine in File.ReadAllLines(manifest))
        {
            if (string.IsNullOrWhiteSpace(rawLine)) continue;
            Match match = pattern.Match(rawLine);
            if (!match.Success) throw new InvalidDataException("Invalid checksum manifest entry.");
            string relative = match.Groups[2].Value.Replace('/', Path.DirectorySeparatorChar);
            if (Path.IsPathRooted(relative) || relative.IndexOf("..", StringComparison.Ordinal) >= 0)
                throw new InvalidDataException("Unsafe checksum path: " + relative);
            string fullPath = Path.GetFullPath(Path.Combine(root, relative));
            if (!fullPath.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("Checksum path escapes the package root.");
            if (!expected.Add(relative)) throw new InvalidDataException("Duplicate checksum entry: " + relative);
            if (!File.Exists(fullPath)) throw new InvalidDataException("Package file is missing: " + relative);
            string actual = Sha256(fullPath);
            if (!string.Equals(actual, match.Groups[1].Value, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("Package checksum mismatch: " + relative);
        }
        foreach (string file in Directory.GetFiles(root, "*", SearchOption.AllDirectories))
        {
            if (string.Equals(file, manifest, StringComparison.OrdinalIgnoreCase)) continue;
            string relative = file.Substring(prefix.Length);
            if (!expected.Contains(relative)) throw new InvalidDataException("Unchecked package file: " + relative);
        }
        foreach (string required in new[] { "Setup.exe", "install.ps1", "version.json",
                     Path.Combine("payload", "UGSci.exe"),
                     Path.Combine("payload", "binaries", "qwenpaw-backend", "qwenpaw-backend.exe") })
            if (!expected.Contains(required)) throw new InvalidDataException("Required checksum entry is missing: " + required);
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
        private readonly TextBox location;
        private readonly CheckBox addPath;
        private readonly Button install;
        private readonly ProgressBar progress;
        private readonly Label status;
        private int resultCode = 1;
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
            ClientSize = new Size(520, 230);

            var title = new Label { Text = "Install UGSci Desktop", AutoSize = true, Font = new Font(Font, FontStyle.Bold), Location = new Point(20, 18) };
            var pathLabel = new Label { Text = "Installation folder:", AutoSize = true, Location = new Point(20, 62) };
            location = new TextBox { Location = new Point(20, 84), Width = 390, Text = FindInstallLocation() };
            var browse = new Button { Text = "Browse...", Location = new Point(420, 82), Width = 80 };
            browse.Click += delegate { using (var dialog = new FolderBrowserDialog { Description = "Choose where to install UGSci Desktop", SelectedPath = location.Text }) if (dialog.ShowDialog(this) == DialogResult.OK) location.Text = dialog.SelectedPath; };
            addPath = new CheckBox { Text = "Add QwenPaw to my user PATH", AutoSize = true, Location = new Point(20, 122), Checked = !noCliPath };
            if (noCliPath) addPath.Enabled = false;
            status = new Label { Text = "Ready to install.", AutoSize = true, Location = new Point(20, 160), ForeColor = Color.DimGray };
            progress = new ProgressBar { Location = new Point(20, 185), Width = 390, Style = ProgressBarStyle.Marquee, Visible = false };
            install = new Button { Text = "Install", Location = new Point(420, 182), Width = 80, DialogResult = DialogResult.None };
            install.Click += InstallClicked;
            Controls.AddRange(new Control[] { title, pathLabel, location, browse, addPath, status, progress, install });
            AcceptButton = install;
        }

        private Icon TryLoadIcon()
        {
            try { return Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { return null; }
        }

        private string FindInstallLocation()
        {
            const string uninstallKey = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\UGSci Desktop";
            try
            {
                using (var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(uninstallKey))
                {
                    string installed = key == null ? null : key.GetValue("InstallLocation") as string;
                    if (!string.IsNullOrWhiteSpace(installed)) return installed;
                }
            }
            catch { }
            return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "UGSci Desktop");
        }

        private void InstallClicked(object sender, EventArgs e)
        {
            string dir = location.Text.Trim();
            if (string.IsNullOrWhiteSpace(dir)) { MessageBox.Show(this, "Choose an installation folder.", Text, MessageBoxButtons.OK, MessageBoxIcon.Warning); return; }
            install.Enabled = false; location.Enabled = false; addPath.Enabled = false; progress.Visible = true; status.Text = "Installing...";
            bool noCli = forceNoCliPath || !addPath.Checked;
            var thread = new Thread(new ThreadStart(delegate {
                int code = 1; string error = null;
                try { code = RunInstaller(packageRoot, dir, true, noCli, null); }
                catch (Exception ex) { error = ex.Message; }
                BeginInvoke((MethodInvoker)delegate {
                    progress.Visible = false; resultCode = code;
                    if (error != null || code != 0) { status.Text = "Installation failed."; MessageBox.Show(this, error ?? ("Installer exited with code " + code.ToString(CultureInfo.InvariantCulture)), Text, MessageBoxButtons.OK, MessageBoxIcon.Error); install.Enabled = true; location.Enabled = true; addPath.Enabled = !forceNoCliPath; }
                    else { status.Text = "Installation complete. A desktop shortcut was created."; MessageBox.Show(this, "UGSci Desktop was installed successfully.", Text, MessageBoxButtons.OK, MessageBoxIcon.Information); DialogResult = DialogResult.OK; Close(); }
                });
            }));
            thread.IsBackground = true; thread.Start();
        }
    }
}
