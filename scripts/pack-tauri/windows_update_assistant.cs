using System;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Web.Script.Serialization;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

internal static class UGSciUpdateAssistant
{
    private const int InvalidArguments = 2;
    private const int UpdateFailed = 3;

    [STAThread]
    private static int Main(string[] args)
    {
        Options options;
        try { options = Options.Parse(args); }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "UGSci Desktop Update",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
            return InvalidArguments;
        }

        using (var singleton = new Mutex(false, "Local\\UGSciDesktopUpdateAssistant"))
        {
            bool acquired;
            try { acquired = singleton.WaitOne(0); }
            catch (AbandonedMutexException) { acquired = true; }
            if (!acquired)
            {
                WriteFailure(options, new InvalidOperationException(
                    "Another UGSci Desktop update is already running."));
                return UpdateFailed;
            }
            try
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                using (var form = new UpdateForm(options))
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

    private sealed class Options
    {
        public string PackagePath;
        public string ExpectedSha256;
        public string TargetVersion;
        public string ReadyFile;
        public int ParentPid;

        public static Options Parse(string[] args)
        {
            var options = new Options();
            for (int i = 0; i < args.Length; i++)
            {
                string value = i + 1 < args.Length ? args[i + 1] : null;
                switch (args[i].ToLowerInvariant())
                {
                    case "--package": options.PackagePath = Require(value, args[i]); i++; break;
                    case "--sha256": options.ExpectedSha256 = Require(value, args[i]); i++; break;
                    case "--version": options.TargetVersion = Require(value, args[i]); i++; break;
                    case "--ready-file": options.ReadyFile = Require(value, args[i]); i++; break;
                    case "--parent-pid":
                        if (!int.TryParse(Require(value, args[i]), NumberStyles.None,
                                CultureInfo.InvariantCulture, out options.ParentPid) || options.ParentPid <= 0)
                            throw new ArgumentException("--parent-pid must be a positive process ID.");
                        i++;
                        break;
                    default: throw new ArgumentException("Unknown update assistant argument: " + args[i]);
                }
            }
            options.PackagePath = Path.GetFullPath(Require(options.PackagePath, "--package"));
            options.ReadyFile = Path.GetFullPath(Require(options.ReadyFile, "--ready-file"));
            Require(options.TargetVersion, "--version");
            string hash = Require(options.ExpectedSha256, "--sha256").Trim().ToLowerInvariant();
            if (hash.Length != 64)
                throw new ArgumentException("--sha256 must be a 64-character hexadecimal digest.");
            foreach (char c in hash)
                if (!Uri.IsHexDigit(c)) throw new ArgumentException("--sha256 is not hexadecimal.");
            options.ExpectedSha256 = hash;
            if (!File.Exists(options.PackagePath))
                throw new FileNotFoundException("The cached update package is missing.", options.PackagePath);
            return options;
        }

        private static string Require(string value, string name)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Missing required update assistant argument " + name + ".");
            return value;
        }
    }

    private sealed class UpdateForm : Form
    {
        private readonly Options options;
        private readonly Label stageLabel;
        private readonly Label detailLabel;
        private readonly ProgressBar progress;
        private readonly Button logButton;
        private readonly Button closeButton;
        private readonly string stateRoot;
        private readonly string logPath;
        private readonly string journalPath;
        private string stagingRoot;
        private InstallTransaction transaction;
        private Process launchedApplication;
        private bool allowClose;
        public int ResultCode { get; private set; }

        public UpdateForm(Options value)
        {
            options = value;
            ResultCode = UpdateFailed;
            stateRoot = Path.Combine(Environment.GetFolderPath(
                Environment.SpecialFolder.LocalApplicationData), "UGSci", "updates");
            Directory.CreateDirectory(stateRoot);
            logPath = Path.Combine(stateRoot, "update-" + DateTime.UtcNow.ToString(
                "yyyyMMdd-HHmmss-fff", CultureInfo.InvariantCulture) + ".log");
            journalPath = Path.Combine(stateRoot, "update-journal.json");

            Text = "UGSci Desktop Update";
            Icon = TryLoadIcon();
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = true;
            StartPosition = FormStartPosition.CenterScreen;
            ClientSize = new Size(610, 270);

            var title = new Label {
                Text = "Updating UGSci Desktop",
                Font = new Font(SystemFonts.MessageBoxFont.FontFamily, 16, FontStyle.Bold),
                AutoSize = true, Location = new Point(32, 30)
            };
            stageLabel = new Label {
                Text = "Preparing update...", AutoSize = true,
                Font = new Font(SystemFonts.MessageBoxFont.FontFamily, 10, FontStyle.Bold),
                Location = new Point(35, 88)
            };
            detailLabel = new Label {
                Text = "UGSci Desktop will close after this update window is ready.",
                AutoSize = false, Size = new Size(535, 42), Location = new Point(35, 118)
            };
            progress = new ProgressBar {
                Location = new Point(35, 166), Size = new Size(535, 22),
                Minimum = 0, Maximum = 100, Style = ProgressBarStyle.Continuous
            };
            logButton = new Button { Text = "Open log", Location = new Point(377, 214), Width = 92, Enabled = false };
            closeButton = new Button { Text = "Close", Location = new Point(478, 214), Width = 92, Enabled = false };
            logButton.Click += delegate { OpenLog(); };
            closeButton.Click += delegate { allowClose = true; Close(); };
            Controls.AddRange(new Control[] { title, stageLabel, detailLabel, progress, logButton, closeButton });
            FormClosing += delegate(object sender, FormClosingEventArgs e) {
                if (!allowClose)
                {
                    e.Cancel = true;
                    MessageBox.Show(this, "Please wait for the update to finish.", Text,
                        MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            };
            Shown += delegate { SignalReadyAndStart(); };
        }

        private void SignalReadyAndStart()
        {
            try
            {
                string parent = Path.GetDirectoryName(options.ReadyFile);
                if (!string.IsNullOrWhiteSpace(parent)) Directory.CreateDirectory(parent);
                File.WriteAllText(options.ReadyFile, Process.GetCurrentProcess().Id.ToString(
                    CultureInfo.InvariantCulture), Encoding.ASCII);
                WriteJournal("assistant-ready", null);
            }
            catch (Exception error)
            {
                FinishFailure(error);
                return;
            }
            var worker = new Thread(RunUpdate) { IsBackground = true };
            worker.Start();
        }

        private void RunUpdate()
        {
            try
            {
                SetStage("Verifying update package", "Checking the signed download before installation...", 2);
                VerifySha256(options.PackagePath, options.ExpectedSha256);
                WriteJournal("verified", null);

                stagingRoot = Path.Combine(Environment.GetFolderPath(
                    Environment.SpecialFolder.LocalApplicationData), "UGSci", "u",
                    Guid.NewGuid().ToString("N"));
                Directory.CreateDirectory(stagingRoot);
                SetStage("Extracting update", "Preparing application files. UGSci has not crashed.", 5);
                ExtractSafely(options.PackagePath, stagingRoot, delegate(int percent, string entry) {
                    SetStage("Extracting update", "Extracting " + entry, 5 + (percent * 65 / 100));
                });
                string setup = Path.Combine(stagingRoot, "Setup.exe");
                if (!File.Exists(setup)) throw new InvalidDataException("The update package does not contain Setup.exe.");
                WriteJournal("extracted", null);

                SetStage("Waiting for UGSci Desktop to close", "Finishing the hand-off from the running application...", 72);
                WaitForParent(options.ParentPid, TimeSpan.FromMinutes(2));
                WriteJournal("parent-exited", null);

                SetStage("Recovering previous update", "Checking for an interrupted installation transaction...", 74);
                RecoverInterruptedTransactions(stateRoot, options);

                SetStage("Installing update", "Backing up data and replacing application components...", 76);
                string transactionFile = Path.Combine(stateRoot, "install-transaction-" +
                    Guid.NewGuid().ToString("N") + ".json");
                int exitCode = RunSetup(setup, stagingRoot, transactionFile);
                if (exitCode != 0) throw new InvalidOperationException(
                    "UGSci Desktop Setup failed with exit code " + exitCode.ToString(CultureInfo.InvariantCulture) + ".");
                transaction = ReadTransaction(transactionFile);
                WriteJournal("installed", null);

                SetStage("Checking the new installation", "Verifying the installed executable and version...", 94);
                string installed = FindInstalledExecutable();
                DateTime markerBefore = LatestStartupMarkerTime();
                SetStage("Starting UGSci Desktop", "Waiting for the new backend and plugins to become ready...", 96);
                launchedApplication = Process.Start(new ProcessStartInfo {
                    FileName = installed,
                    WorkingDirectory = Path.GetDirectoryName(installed),
                    UseShellExecute = true
                });
                if (launchedApplication == null)
                    throw new InvalidOperationException("The updated UGSci Desktop process did not start.");
                WaitForStartupHealth(markerBefore, options.TargetVersion, launchedApplication, TimeSpan.FromMinutes(3));
                WriteJournal("health-checked", null);
                CommitTransaction(transaction);
                transaction = null;
                WriteJournal("restarted", null);
                SetStage("Update complete", "UGSci Desktop " + options.TargetVersion + " has been installed and restarted.", 100);
                BeginInvoke((MethodInvoker)delegate {
                    ResultCode = 0;
                    allowClose = true;
                    closeButton.Enabled = true;
                    closeButton.Text = "Done";
                    var timer = new System.Windows.Forms.Timer { Interval = 1800 };
                    timer.Tick += delegate { timer.Stop(); Close(); };
                    timer.Start();
                });
                CleanupStaging();
            }
            catch (Exception error) { FinishFailure(error); }
        }

        private void FinishFailure(Exception error)
        {
            string rollback = null;
            if (transaction != null)
            {
                try
                {
                    SetStage("Restoring previous version", "The new version did not pass its health check.", 0);
                    RollbackTransaction(transaction, launchedApplication);
                    rollback = " The previous UGSci Desktop version was restored and restarted.";
                    WriteJournal("rolled-back", error.Message);
                    transaction = null;
                }
                catch (Exception rollbackError)
                {
                    rollback = " Automatic rollback also failed: " + rollbackError.Message;
                    WriteJournal("rollback-failed", rollbackError.Message);
                }
            }
            WriteFailure(options, error, logPath);
            WriteJournal("failed", error.Message);
            BeginInvoke((MethodInvoker)delegate {
                ResultCode = UpdateFailed;
                progress.Value = 0;
                stageLabel.Text = "Update failed";
                detailLabel.Text = error.Message + (rollback ?? string.Empty) +
                    "\nYour data backup and installation logs have been preserved.";
                logButton.Enabled = true;
                closeButton.Enabled = true;
                allowClose = true;
            });
        }

        private void SetStage(string stage, string detail, int percent)
        {
            if (IsDisposed) return;
            BeginInvoke((MethodInvoker)delegate {
                stageLabel.Text = stage;
                detailLabel.Text = detail;
                progress.Value = Math.Max(progress.Minimum, Math.Min(progress.Maximum, percent));
            });
            AppendLog(stage + ": " + detail);
        }

        private void WriteJournal(string stage, string error)
        {
            string json = "{\n" +
                "  \"schemaVersion\": 1,\n" +
                "  \"targetVersion\": \"" + Json(options.TargetVersion) + "\",\n" +
                "  \"package\": \"" + Json(options.PackagePath) + "\",\n" +
                "  \"sha256\": \"" + options.ExpectedSha256 + "\",\n" +
                "  \"stage\": \"" + Json(stage) + "\",\n" +
                "  \"updatedAt\": \"" + DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture) + "\",\n" +
                "  \"error\": " + (error == null ? "null" : "\"" + Json(error) + "\"") + "\n" +
                "}\n";
            string temporary = journalPath + "." + Process.GetCurrentProcess().Id.ToString(
                CultureInfo.InvariantCulture) + ".tmp";
            File.WriteAllText(temporary, json, new UTF8Encoding(false));
            if (File.Exists(journalPath)) File.Replace(temporary, journalPath, null);
            else File.Move(temporary, journalPath);
        }

        private static void VerifySha256(string path, string expected)
        {
            using (var stream = File.OpenRead(path))
            using (var sha = SHA256.Create())
            {
                string actual = BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").ToLowerInvariant();
                if (!string.Equals(actual, expected, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidDataException("The cached update package failed SHA-256 verification.");
            }
        }

        private static string ToExtendedPath(string path)
        {
            if (path.StartsWith(@"\\?\", StringComparison.Ordinal)) return path;
            if (path.StartsWith(@"\\", StringComparison.Ordinal))
                return @"\\?\UNC\" + path.Substring(2);
            return @"\\?\" + path;
        }

        private static string PathForIo(string path)
        {
            // Reserve the extended prefix for genuinely deep members so the
            // short-path profile keeps working for the common case.
            return path.Length < 248 ? path : ToExtendedPath(path);
        }

        private static void ExtractSafely(string zipPath, string destination, Action<int, string> report)
        {
            string root = Path.GetFullPath(destination).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            using (var archive = ZipFile.OpenRead(zipPath))
            {
                long total = 0; foreach (ZipArchiveEntry entry in archive.Entries) total += Math.Max(0, entry.Length);
                long completed = 0;
                foreach (ZipArchiveEntry entry in archive.Entries)
                {
                    string name = entry.FullName.Replace('/', Path.DirectorySeparatorChar);
                    if (string.IsNullOrWhiteSpace(name)) continue;
                    if (Path.IsPathRooted(name) || name.IndexOf(':') >= 0)
                        throw new InvalidDataException("Unsafe absolute ZIP entry: " + entry.FullName);
                    foreach (string segment in name.Split(Path.DirectorySeparatorChar))
                        if (segment == ".." || segment == ".")
                            throw new InvalidDataException("Unsafe ZIP entry path: " + entry.FullName);
                    // Path.GetFullPath cannot be applied to members that exceed
                    // MAX_PATH on .NET Framework, so containment is derived from
                    // the validated relative segments above plus the trusted
                    // destination root.
                    string output = Path.Combine(destination, name);
                    if (!output.StartsWith(root, StringComparison.OrdinalIgnoreCase))
                        throw new InvalidDataException("ZIP entry escapes the staging directory: " + entry.FullName);
                    int unixType = (entry.ExternalAttributes >> 16) & 0xF000;
                    if (unixType == 0xA000)
                        throw new InvalidDataException("ZIP symbolic links are not allowed: " + entry.FullName);
                    if (entry.FullName.EndsWith("/", StringComparison.Ordinal) ||
                        entry.FullName.EndsWith("\\", StringComparison.Ordinal))
                    {
                        Directory.CreateDirectory(PathForIo(output));
                        continue;
                    }
                    string parent = Path.GetDirectoryName(output);
                    if (!string.IsNullOrWhiteSpace(parent)) Directory.CreateDirectory(PathForIo(parent));
                    string ioOutput = PathForIo(output);
                    if (File.Exists(ioOutput)) throw new InvalidDataException("Duplicate ZIP output path: " + entry.FullName);
                    using (Stream input = entry.Open())
                    using (var target = new FileStream(ioOutput, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                    {
                        byte[] buffer = new byte[1024 * 1024]; int read;
                        while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                        {
                            target.Write(buffer, 0, read);
                            completed += read;
                            report(total == 0 ? 100 : (int)Math.Min(100, completed * 100 / total), entry.FullName);
                        }
                    }
                }
            }
        }

        private static void WaitForParent(int pid, TimeSpan timeout)
        {
            try
            {
                using (Process parent = Process.GetProcessById(pid))
                    if (!parent.WaitForExit((int)timeout.TotalMilliseconds))
                        throw new TimeoutException("UGSci Desktop did not close in time. Close it and retry the update.");
            }
            catch (ArgumentException) { }
        }

        private static int RunSetup(string setup, string workingDirectory, string transactionFile)
        {
            var start = new ProcessStartInfo {
                FileName = setup,
                Arguments = "--silent --deferred-commit --transaction-file " + Quote(transactionFile),
                WorkingDirectory = workingDirectory,
                UseShellExecute = false,
                CreateNoWindow = true,
                WindowStyle = ProcessWindowStyle.Hidden
            };
            using (Process process = Process.Start(start))
            {
                if (process == null) throw new InvalidOperationException("UGSci Desktop Setup did not start.");
                process.WaitForExit();
                return process.ExitCode;
            }
        }

        private sealed class InstallTransaction
        {
            public int schema_version { get; set; }
            public string stage { get; set; }
            public string install_dir { get; set; }
            public string backup_dir { get; set; }
            public string staging_dir { get; set; }
            public string target_version { get; set; }
            public string previous_version { get; set; }
            public string previous_user_path { get; set; }
            public string previous_uninstall_key_path { get; set; }
            public RegistryValueSnapshot[] previous_uninstall_values { get; set; }
            public bool canonical_uninstall_previously_existed { get; set; }
            public string start_menu_shortcut_path { get; set; }
            public string start_menu_shortcut_base64 { get; set; }
            public string desktop_shortcut_path { get; set; }
            public string desktop_shortcut_base64 { get; set; }
            public string transaction_file { get; set; }
        }

        private sealed class RegistryValueSnapshot
        {
            public string name { get; set; }
            public string kind { get; set; }
            public object value { get; set; }
        }

        private static InstallTransaction ReadTransaction(string path)
        {
            if (!File.Exists(path))
                throw new InvalidDataException("Setup did not create the deferred update transaction.");
            var serializer = new JavaScriptSerializer();
            InstallTransaction value = serializer.Deserialize<InstallTransaction>(File.ReadAllText(path, Encoding.UTF8));
            if (value == null || (value.schema_version != 1 && value.schema_version != 2) ||
                string.IsNullOrWhiteSpace(value.install_dir) || string.IsNullOrWhiteSpace(value.backup_dir))
                throw new InvalidDataException("The deferred update transaction is invalid.");
            if (value.schema_version == 1 && string.IsNullOrWhiteSpace(value.stage)) value.stage = "registered";
            if (value.schema_version == 2 &&
                value.stage != "prepared" && value.stage != "old-moved" &&
                value.stage != "new-activated" && value.stage != "registered")
                throw new InvalidDataException("The deferred update transaction stage is invalid.");
            value.install_dir = Path.GetFullPath(value.install_dir).TrimEnd(Path.DirectorySeparatorChar);
            value.backup_dir = Path.GetFullPath(value.backup_dir).TrimEnd(Path.DirectorySeparatorChar);
            if (!string.IsNullOrWhiteSpace(value.staging_dir))
                value.staging_dir = Path.GetFullPath(value.staging_dir).TrimEnd(Path.DirectorySeparatorChar);
            value.transaction_file = path;
            string parent = Path.GetDirectoryName(value.install_dir);
            if (string.IsNullOrWhiteSpace(parent) ||
                !string.Equals(Path.GetDirectoryName(value.backup_dir), parent, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("The deferred update backup is outside the installation parent.");
            string trustedInstall = SnapshotValue(value, "InstallLocation") ?? FindTrustedRegisteredInstallLocation();
            if (string.IsNullOrWhiteSpace(trustedInstall) || !Path.IsPathRooted(trustedInstall) ||
                !string.Equals(value.install_dir, Path.GetFullPath(trustedInstall).TrimEnd(Path.DirectorySeparatorChar),
                    StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("The deferred update target does not match the registered installation.");
            string backupName = Path.GetFileName(value.backup_dir);
            const string backupPrefix = ".ug-b-";
            const string legacyBackupPrefix = ".UGSci Desktop.backup-";
            string backupId = backupName != null && backupName.StartsWith(backupPrefix, StringComparison.Ordinal)
                ? backupName.Substring(backupPrefix.Length) :
                backupName != null && backupName.StartsWith(legacyBackupPrefix, StringComparison.Ordinal)
                    ? backupName.Substring(legacyBackupPrefix.Length) : "";
            Guid parsedBackupId;
            if (backupId.Length != 32 || !Guid.TryParseExact(backupId, "N", out parsedBackupId))
                throw new InvalidDataException("The deferred update backup name is invalid.");
            if (!string.IsNullOrWhiteSpace(value.staging_dir))
            {
                string stagingName = Path.GetFileName(value.staging_dir);
                const string stagingPrefix = ".ug-i-";
                const string legacyStagingPrefix = ".UGSci Desktop.install-";
                string stagingId = stagingName != null && stagingName.StartsWith(stagingPrefix, StringComparison.Ordinal)
                    ? stagingName.Substring(stagingPrefix.Length) :
                    stagingName != null && stagingName.StartsWith(legacyStagingPrefix, StringComparison.Ordinal)
                        ? stagingName.Substring(legacyStagingPrefix.Length) : "";
                Guid parsedStagingId;
                if (!string.Equals(Path.GetDirectoryName(value.staging_dir), parent, StringComparison.OrdinalIgnoreCase) ||
                    stagingId.Length != 32 || !Guid.TryParseExact(stagingId, "N", out parsedStagingId))
                    throw new InvalidDataException("The deferred update staging directory is invalid.");
            }
            ValidateShortcutPath(value.start_menu_shortcut_path, true);
            ValidateShortcutPath(value.desktop_shortcut_path, false);
            ValidateRegistrySnapshot(value);
            if (value.stage != "prepared" && !Directory.Exists(value.backup_dir))
                throw new InvalidDataException("The deferred update backup directory is missing.");
            return value;
        }

        private static string SnapshotValue(InstallTransaction value, string name)
        {
            if (value.previous_uninstall_values == null) return null;
            foreach (RegistryValueSnapshot entry in value.previous_uninstall_values)
                if (entry != null && string.Equals(entry.name, name, StringComparison.OrdinalIgnoreCase))
                    return Convert.ToString(entry.value, CultureInfo.InvariantCulture);
            return null;
        }

        private static void ValidateRegistrySnapshot(InstallTransaction value)
        {
            if (value.schema_version < 2 || string.IsNullOrWhiteSpace(value.previous_uninstall_key_path)) return;
            const string root = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\";
            string keyPath = value.previous_uninstall_key_path;
            if (!keyPath.StartsWith(root, StringComparison.OrdinalIgnoreCase) ||
                keyPath.Substring(root.Length).IndexOf('\\') >= 0)
                throw new InvalidDataException("The previous uninstall registry key is outside the uninstall hive.");
            string display = SnapshotValue(value, "DisplayName");
            string location = SnapshotValue(value, "InstallLocation");
            if (string.IsNullOrWhiteSpace(display) ||
                (display.IndexOf("UGSci Desktop", StringComparison.OrdinalIgnoreCase) < 0 &&
                 display.IndexOf("QwenPaw", StringComparison.OrdinalIgnoreCase) < 0) ||
                string.IsNullOrWhiteSpace(location))
                throw new InvalidDataException("The previous uninstall registry snapshot is not a UGSci installation.");
        }

        private static string FindTrustedRegisteredInstallLocation()
        {
            string rootPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall";
            string[] keys = { "UGSci Desktop", "QwenPaw Desktop", "QwenPaw" };
            foreach (string keyName in keys)
            {
                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(rootPath + "\\" + keyName))
                {
                    string location = key == null ? null : key.GetValue("InstallLocation") as string;
                    if (IsTrustedInstallLocation(location))
                        return Path.GetFullPath(location).TrimEnd(Path.DirectorySeparatorChar);
                }
            }
            using (RegistryKey root = Registry.CurrentUser.OpenSubKey(rootPath))
            {
                if (root == null) return null;
                foreach (string keyName in root.GetSubKeyNames())
                using (RegistryKey key = root.OpenSubKey(keyName))
                {
                    string display = key == null ? null : key.GetValue("DisplayName") as string;
                    string location = key == null ? null : key.GetValue("InstallLocation") as string;
                    if (!string.IsNullOrWhiteSpace(display) &&
                        (display.IndexOf("UGSci Desktop", StringComparison.OrdinalIgnoreCase) >= 0 ||
                         display.IndexOf("QwenPaw", StringComparison.OrdinalIgnoreCase) >= 0) &&
                        IsTrustedInstallLocation(location))
                        return Path.GetFullPath(location).TrimEnd(Path.DirectorySeparatorChar);
                }
            }
            return null;
        }

        private static bool IsTrustedInstallLocation(string location)
        {
            if (string.IsNullOrWhiteSpace(location) || !Path.IsPathRooted(location)) return false;
            try
            {
                string root = Path.GetFullPath(location);
                return Directory.Exists(root) &&
                    (File.Exists(Path.Combine(root, "UGSci.exe")) ||
                     File.Exists(Path.Combine(root, "qwenpaw-desktop.exe")));
            }
            catch { return false; }
        }

        private static void ValidateShortcutPath(string path, bool startMenu)
        {
            if (string.IsNullOrWhiteSpace(path)) return;
            string expectedRoot = startMenu
                ? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                    "Microsoft", "Windows", "Start Menu", "Programs")
                : Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
            string full = Path.GetFullPath(path);
            string expected = Path.Combine(Path.GetFullPath(expectedRoot), "UGSci Desktop.lnk");
            if (!string.Equals(full, expected, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("The deferred update shortcut path is outside the expected Windows folder.");
        }

        private static void CommitTransaction(InstallTransaction value)
        {
            if (value == null) return;
            // The new version is already healthy at this point.  Mark the
            // transaction committed before best-effort cleanup; a locked old
            // file must never turn a successful update into a rollback from a
            // partially deleted backup.
            try { File.Delete(value.transaction_file); } catch { }
            try
            {
                if (Directory.Exists(value.backup_dir)) Directory.Delete(value.backup_dir, true);
            }
            catch
            {
                // A later maintenance pass can remove the orphaned backup.
            }
        }

        private static void RecoverInterruptedTransactions(string stateDirectory, Options options)
        {
            if (!Directory.Exists(stateDirectory)) return;
            foreach (string path in Directory.GetFiles(stateDirectory, "install-transaction-*.json"))
            {
                try
                {
                    InstallTransaction interrupted = ReadTransaction(path);
                    RollbackTransaction(interrupted, null, false);
                }
                catch (Exception error)
                {
                    string isolated = path + ".invalid-" + Guid.NewGuid().ToString("N");
                    try { File.Move(path, isolated); } catch { }
                    WriteFailure(options, new InvalidDataException(
                        "An unsafe or corrupt interrupted update transaction was isolated: " + path, error));
                }
            }
        }

        private static void RollbackTransaction(InstallTransaction value, Process application,
            bool restartApplication = true)
        {
            if (value == null) return;
            if (application != null && !application.HasExited)
            {
                try
                {
                    using (Process killer = Process.Start(new ProcessStartInfo {
                        FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "taskkill.exe"),
                        Arguments = "/PID " + application.Id.ToString(CultureInfo.InvariantCulture) + " /T /F",
                        UseShellExecute = false, CreateNoWindow = true, WindowStyle = ProcessWindowStyle.Hidden
                    })) { if (killer != null) killer.WaitForExit(15000); }
                }
                catch { try { application.Kill(); } catch { } }
            }
            // A process can die after the atomic old -> backup rename but
            // before the next transaction-file replacement. Infer that narrow
            // transition from the trusted sibling backup instead of assuming
            // that a persisted "prepared" stage means no filesystem mutation.
            if (value.stage == "prepared" && !Directory.Exists(value.backup_dir))
            {
                if (!Directory.Exists(value.install_dir))
                    throw new InvalidDataException("A prepared update lost both the installation and its backup.");
                RestorePreviousWindowsState(value);
                RestorePreviousShortcuts(value, Path.Combine(value.install_dir, "UGSci.exe"), value.install_dir);
                DeleteTransactionAndStaging(value);
                return;
            }
            string failed = value.install_dir + ".failed-" + Guid.NewGuid().ToString("N");
            if (Directory.Exists(value.install_dir))
                MoveDirectoryWithRetry(value.install_dir, failed, TimeSpan.FromSeconds(30));
            try
            {
                if (!Directory.Exists(value.install_dir))
                    MoveDirectoryWithRetry(value.backup_dir, value.install_dir, TimeSpan.FromSeconds(30));
            }
            catch
            {
                // Never leave InstallLocation empty. If restoring the old tree
                // fails, put the complete new tree back before surfacing the error.
                if (!Directory.Exists(value.install_dir) && Directory.Exists(failed))
                    MoveDirectoryWithRetry(failed, value.install_dir, TimeSpan.FromSeconds(30));
                throw;
            }
            string executable = Path.Combine(value.install_dir, "UGSci.exe");
            if (!File.Exists(executable))
                throw new InvalidDataException("Rollback restored a directory without UGSci.exe.");
            ValidateRestoredRuntime(value.install_dir);
            RestorePreviousWindowsState(value);
            RestorePreviousShortcuts(value, executable, value.install_dir);
            if (restartApplication)
                Process.Start(new ProcessStartInfo {
                    FileName = executable, WorkingDirectory = value.install_dir, UseShellExecute = true
                });
            DeleteTransactionAndStaging(value);
        }

        private static void RestorePreviousWindowsState(InstallTransaction value)
        {
            if (value.schema_version >= 2)
                Environment.SetEnvironmentVariable("Path", value.previous_user_path, EnvironmentVariableTarget.User);
            const string canonical = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\UGSci Desktop";
            try { Registry.CurrentUser.DeleteSubKeyTree(canonical, false); } catch { }
            if (value.schema_version >= 2 && !string.IsNullOrWhiteSpace(value.previous_uninstall_key_path))
            {
                try { Registry.CurrentUser.DeleteSubKeyTree(value.previous_uninstall_key_path, false); } catch { }
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(value.previous_uninstall_key_path))
                {
                    foreach (RegistryValueSnapshot entry in value.previous_uninstall_values ?? new RegistryValueSnapshot[0])
                    {
                        if (entry == null || entry.name == null || string.IsNullOrWhiteSpace(entry.kind)) continue;
                        RegistryValueKind kind = (RegistryValueKind)Enum.Parse(typeof(RegistryValueKind), entry.kind, true);
                        key.SetValue(entry.name, ConvertRegistryValue(entry.value, kind), kind);
                    }
                }
                return;
            }
            using (RegistryKey key = Registry.CurrentUser.CreateSubKey(canonical))
            {
                key.SetValue("InstallLocation", value.install_dir, RegistryValueKind.String);
                key.SetValue("DisplayIcon", "\"" + Path.Combine(value.install_dir, "UGSci.exe") + "\",0", RegistryValueKind.String);
                if (!string.IsNullOrWhiteSpace(value.previous_version))
                    key.SetValue("DisplayVersion", value.previous_version, RegistryValueKind.String);
            }
        }

        private static object ConvertRegistryValue(object raw, RegistryValueKind kind)
        {
            if (kind == RegistryValueKind.DWord) return Convert.ToInt32(raw, CultureInfo.InvariantCulture);
            if (kind == RegistryValueKind.QWord) return Convert.ToInt64(raw, CultureInfo.InvariantCulture);
            if (kind == RegistryValueKind.MultiString)
            {
                object[] values = raw as object[];
                if (values == null) return new string[0];
                var converted = new string[values.Length];
                for (int i = 0; i < values.Length; i++) converted[i] = Convert.ToString(values[i], CultureInfo.InvariantCulture);
                return converted;
            }
            if (kind == RegistryValueKind.Binary)
            {
                object[] values = raw as object[];
                if (values == null) return new byte[0];
                var converted = new byte[values.Length];
                for (int i = 0; i < values.Length; i++) converted[i] = Convert.ToByte(values[i], CultureInfo.InvariantCulture);
                return converted;
            }
            return raw ?? string.Empty;
        }

        private static void DeleteTransactionAndStaging(InstallTransaction value)
        {
            try { File.Delete(value.transaction_file); } catch { }
            if (!string.IsNullOrWhiteSpace(value.staging_dir))
                try { if (Directory.Exists(value.staging_dir)) Directory.Delete(value.staging_dir, true); } catch { }
        }

        private static void ValidateRestoredRuntime(string installDirectory)
        {
            string binaries = Path.Combine(installDirectory, "binaries");
            string frozenBackend = Path.Combine(binaries, "qwenpaw-backend", "qwenpaw-backend.exe");
            string activePath = Path.Combine(binaries, "state", "active.json");
            if (File.Exists(frozenBackend)) return;
            if (!File.Exists(activePath))
                throw new InvalidDataException(
                    "Rollback restored UGSci.exe but no backend runtime was found.");
            var serializer = new JavaScriptSerializer();
            var active = serializer.Deserialize<System.Collections.Generic.Dictionary<string, object>>(
                File.ReadAllText(activePath, Encoding.UTF8));
            object rawComponents;
            if (active == null || !active.TryGetValue("components", out rawComponents))
                throw new InvalidDataException("Rollback active.json has no components.");
            var components = rawComponents as System.Collections.Generic.Dictionary<string, object>;
            if (components == null || !components.ContainsKey("backend") ||
                !components.ContainsKey("python-runtime"))
                throw new InvalidDataException(
                    "Rollback active.json is missing backend or Python runtime components.");
        }

        private static void MoveDirectoryWithRetry(string source, string destination, TimeSpan timeout)
        {
            DateTime deadline = DateTime.UtcNow + timeout;
            Exception last = null;
            do
            {
                try { Directory.Move(source, destination); return; }
                catch (Exception error) { last = error; Thread.Sleep(500); }
            } while (DateTime.UtcNow < deadline);
            throw new IOException("Could not move " + source + " to " + destination + ".", last);
        }

        private static DateTime LatestStartupMarkerTime()
        {
            DateTime latest = DateTime.MinValue;
            foreach (string path in StartupMarkers())
                if (File.Exists(path) && File.GetLastWriteTimeUtc(path) > latest)
                    latest = File.GetLastWriteTimeUtc(path);
            return latest;
        }

        private static string[] StartupMarkers()
        {
            string profile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            var markers = new System.Collections.Generic.List<string>();
            AddWorkingDirectoryMarker(markers, Environment.GetEnvironmentVariable("QWENPAW_WORKING_DIR"));
            AddWorkingDirectoryMarker(markers, Environment.GetEnvironmentVariable("COPAW_WORKING_DIR"));
            markers.Add(Path.Combine(profile, ".qwenpaw", "cache", "startup-complete.json"));
            markers.Add(Path.Combine(profile, ".copaw", "cache", "startup-complete.json"));
            return markers.ToArray();
        }

        private static void AddWorkingDirectoryMarker(System.Collections.Generic.List<string> markers, string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return;
            try
            {
                string candidate = value.Trim();
                if (candidate == "~" || candidate.StartsWith("~\\", StringComparison.Ordinal) ||
                    candidate.StartsWith("~/", StringComparison.Ordinal))
                {
                    string profile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                    candidate = candidate.Length == 1 ? profile :
                        Path.Combine(profile, candidate.Substring(2));
                }
                // Match Python's Path(...).expanduser().resolve(): relative
                // values are resolved against the inherited process cwd.
                string root = Path.GetFullPath(candidate);
                string marker = Path.Combine(root, "cache", "startup-complete.json");
                if (!markers.Exists(item => string.Equals(
                    item, marker, StringComparison.OrdinalIgnoreCase))) markers.Add(marker);
            }
            catch { }
        }

        private static void WaitForStartupHealth(DateTime previousMarker, string targetVersion,
            Process application, TimeSpan timeout)
        {
            DateTime deadline = DateTime.UtcNow + timeout;
            var serializer = new JavaScriptSerializer();
            while (DateTime.UtcNow < deadline)
            {
                if (application.HasExited)
                    throw new InvalidOperationException("The updated UGSci Desktop exited before startup completed.");
                foreach (string path in StartupMarkers())
                {
                    if (!File.Exists(path) || File.GetLastWriteTimeUtc(path) <= previousMarker) continue;
                    try
                    {
                        var payload = serializer.Deserialize<System.Collections.Generic.Dictionary<string, object>>(
                            File.ReadAllText(path, Encoding.UTF8));
                        object version;
                        if (payload.TryGetValue("version", out version) &&
                            string.Equals(NormalizeVersion(Convert.ToString(version, CultureInfo.InvariantCulture)),
                                NormalizeVersion(targetVersion), StringComparison.OrdinalIgnoreCase)) return;
                    }
                    catch { }
                }
                Thread.Sleep(1000);
            }
            throw new TimeoutException("The updated backend did not report healthy startup in time.");
        }

        private static string Quote(string value)
        {
            return "\"" + value.Replace("\"", "\\\"") + "\"";
        }

        private string FindInstalledExecutable()
        {
            const string keyPath = @"Software\Microsoft\Windows\CurrentVersion\Uninstall\UGSci Desktop";
            using (RegistryKey key = Registry.CurrentUser.OpenSubKey(keyPath))
            {
                string location = key == null ? null : key.GetValue("InstallLocation") as string;
                string version = key == null ? null : key.GetValue("DisplayVersion") as string;
                if (string.IsNullOrWhiteSpace(location))
                    throw new InvalidDataException("Setup did not register an installation location.");
                string executable = Path.Combine(location, "UGSci.exe");
                if (!File.Exists(executable))
                    throw new FileNotFoundException("Setup completed but UGSci.exe is missing.", executable);
                if (string.IsNullOrWhiteSpace(version))
                    throw new InvalidDataException("Setup did not register an installed version.");
                if (!string.Equals(NormalizeVersion(version), NormalizeVersion(options.TargetVersion),
                        StringComparison.OrdinalIgnoreCase))
                    throw new InvalidDataException("Installed version " + version +
                        " does not match the requested update " + options.TargetVersion + ".");
                RepairApplicationShortcuts(executable, location);
                return executable;
            }
        }

        private static void RepairApplicationShortcuts(string executable, string installDirectory)
        {
            if (!File.Exists(executable))
                throw new FileNotFoundException("Cannot create a shortcut for a missing UGSci.exe.", executable);
            string startMenu = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                "Microsoft", "Windows", "Start Menu", "Programs", "UGSci Desktop.lnk");
            string desktop = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
                "UGSci Desktop.lnk");
            CreateShortcut(startMenu, executable, installDirectory);
            CreateShortcut(desktop, executable, installDirectory);
        }

        private static void RestorePreviousShortcuts(InstallTransaction value, string executable,
            string installDirectory)
        {
            bool hasPersistedState = !string.IsNullOrWhiteSpace(value.start_menu_shortcut_path) ||
                !string.IsNullOrWhiteSpace(value.desktop_shortcut_path);
            if (!hasPersistedState)
            {
                RepairApplicationShortcuts(executable, installDirectory);
                return;
            }
            RestoreShortcutBytes(value.start_menu_shortcut_path, value.start_menu_shortcut_base64);
            RestoreShortcutBytes(value.desktop_shortcut_path, value.desktop_shortcut_base64);
        }

        private static void RestoreShortcutBytes(string path, string base64)
        {
            if (string.IsNullOrWhiteSpace(path)) return;
            if (string.IsNullOrWhiteSpace(base64))
            {
                try { File.Delete(path); } catch { }
                return;
            }
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            File.WriteAllBytes(path, Convert.FromBase64String(base64));
        }

        private static void CreateShortcut(string shortcutPath, string target, string workingDirectory)
        {
            Directory.CreateDirectory(Path.GetDirectoryName(shortcutPath));
            Type shellType = Type.GetTypeFromProgID("WScript.Shell");
            if (shellType == null) throw new InvalidOperationException("Windows Script Host is unavailable.");
            object shell = Activator.CreateInstance(shellType);
            object shortcut = null;
            try
            {
                shortcut = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod,
                    null, shell, new object[] { shortcutPath });
                Type shortcutType = shortcut.GetType();
                shortcutType.InvokeMember("TargetPath", BindingFlags.SetProperty,
                    null, shortcut, new object[] { target });
                shortcutType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty,
                    null, shortcut, new object[] { workingDirectory });
                shortcutType.InvokeMember("IconLocation", BindingFlags.SetProperty,
                    null, shortcut, new object[] { target + ",0" });
                shortcutType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
            }
            finally
            {
                if (shortcut != null && Marshal.IsComObject(shortcut)) Marshal.FinalReleaseComObject(shortcut);
                if (Marshal.IsComObject(shell)) Marshal.FinalReleaseComObject(shell);
            }
            if (!File.Exists(shortcutPath))
                throw new IOException("UGSci Desktop shortcut was not created: " + shortcutPath);
        }

        private static string NormalizeVersion(string value)
        {
            return (value ?? string.Empty).Trim().Replace("-beta.", "b").Replace("-beta", "b");
        }

        private void CleanupStaging()
        {
            if (string.IsNullOrWhiteSpace(stagingRoot)) return;
            try { Directory.Delete(stagingRoot, true); } catch { }
        }

        private void AppendLog(string message)
        {
            try { File.AppendAllText(logPath, DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture) + " " + message + Environment.NewLine); }
            catch { }
        }

        private void OpenLog()
        {
            try { Process.Start(new ProcessStartInfo { FileName = logPath, UseShellExecute = true }); }
            catch { }
        }

        private static Icon TryLoadIcon()
        {
            try { return Icon.ExtractAssociatedIcon(Application.ExecutablePath); } catch { return null; }
        }
    }

    private static string Sanitize(string value)
    {
        var builder = new StringBuilder();
        foreach (char c in value)
            builder.Append(char.IsLetterOrDigit(c) || c == '.' || c == '-' || c == '_' ? c : '_');
        return builder.Length == 0 ? "unknown" : builder.ToString();
    }

    private static string Json(string value)
    {
        return (value ?? string.Empty).Replace("\\", "\\\\").Replace("\"", "\\\"")
            .Replace("\r", "\\r").Replace("\n", "\\n");
    }

    private static void WriteFailure(Options options, Exception error)
    {
        string root = Path.Combine(Environment.GetFolderPath(
            Environment.SpecialFolder.LocalApplicationData), "UGSci", "updates");
        Directory.CreateDirectory(root);
        WriteFailure(options, error, Path.Combine(root, "update-launch-failure.log"));
    }

    private static void WriteFailure(Options options, Exception error, string path)
    {
        try { File.WriteAllText(path, DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture) + Environment.NewLine + error); }
        catch { }
    }
}
