using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using System.Windows.Forms;

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

            string powershell = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.Windows),
                "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
            if (!File.Exists(powershell))
                throw new FileNotFoundException("Windows PowerShell was not found.", powershell);

            string script = Path.Combine(packageRoot, "install.ps1");
            var arguments = new List<string> {
                "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
                "-File", Quote(script)
            };
            if (silent) arguments.Add("-Silent");
            if (HasArgument(args, "--no-cli-path") || HasArgument(args, "/NO_QWENPAW_PATH"))
                arguments.Add("-NoCliPath");

            var start = new ProcessStartInfo {
                FileName = powershell,
                Arguments = string.Join(" ", arguments.ToArray()),
                WorkingDirectory = packageRoot,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = silent,
                WindowStyle = silent ? ProcessWindowStyle.Hidden : ProcessWindowStyle.Normal
            };
            using (Process process = Process.Start(start)) {
                if (process == null) throw new InvalidOperationException("Installer process did not start.");
                string stdout = process.StandardOutput.ReadToEnd();
                string stderr = process.StandardError.ReadToEnd();
                process.WaitForExit();
                string logPath = Path.Combine(Path.GetTempPath(), "ugsci-desktop-setup.log");
                File.WriteAllText(logPath, stdout + Environment.NewLine + stderr);
                if (process.ExitCode != 0 && !silent)
                    MessageBox.Show("UGSci Desktop installation failed (exit " + process.ExitCode.ToString(CultureInfo.InvariantCulture) + "). Log: " + logPath,
                        "UGSci Desktop Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return process.ExitCode;
            }
        }
        catch (Exception error)
        {
            if (!silent)
                MessageBox.Show(error.Message, "UGSci Desktop Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return error is InvalidDataException ? InvalidPackageExitCode : LaunchFailureExitCode;
        }
    }

    private static bool HasArgument(string[] args, string value)
    {
        foreach (string arg in args)
            if (string.Equals(arg, value, StringComparison.OrdinalIgnoreCase)) return true;
        return false;
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
}
