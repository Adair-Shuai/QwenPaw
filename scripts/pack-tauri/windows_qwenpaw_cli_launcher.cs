using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Web.Script.Serialization;

internal static class QwenPawCliLauncher
{
    private sealed class ActiveLayout
    {
        public int schemaVersion { get; set; }
        public Dictionary<string, ActiveComponent> components { get; set; }
    }

    private sealed class ActiveComponent
    {
        public string path { get; set; }
    }

    private static int Main(string[] args)
    {
        try
        {
            string cliDir = AppDomain.CurrentDomain.BaseDirectory.TrimEnd(Path.DirectorySeparatorChar);
            string binaries = Directory.GetParent(cliDir).FullName;
            string installRoot = Directory.GetParent(binaries).FullName;
            string activePath = Path.Combine(binaries, "state", "active.json");
            var layout = new JavaScriptSerializer().Deserialize<ActiveLayout>(File.ReadAllText(activePath));
            if (layout == null || layout.schemaVersion != 1 || layout.components == null)
                throw new InvalidDataException("UGSci Desktop active runtime layout is invalid.");
            string pythonRoot = Resolve(installRoot, layout.components["python-runtime"].path);
            string backend = Resolve(installRoot, layout.components["backend"].path);
            string dependencies = Resolve(installRoot, layout.components["python-packages"].path);
            string python = Path.Combine(pythonRoot, "python", "python.exe");
            if (!File.Exists(python)) throw new FileNotFoundException("UGSci Python runtime is missing.", python);
            var quoted = new List<string> { "-m", "qwenpaw.cli.main" };
            foreach (string arg in args) quoted.Add(Quote(arg));
            var start = new ProcessStartInfo {
                FileName = python,
                Arguments = string.Join(" ", quoted.ToArray()),
                WorkingDirectory = Environment.CurrentDirectory,
                UseShellExecute = false
            };
            start.EnvironmentVariables["PYTHONNOUSERSITE"] = "1";
            start.EnvironmentVariables["PYTHONPATH"] = backend + Path.PathSeparator + dependencies;
            using (Process process = Process.Start(start))
            {
                if (process == null) return 3;
                process.WaitForExit();
                return process.ExitCode;
            }
        }
        catch (Exception error)
        {
            Console.Error.WriteLine("QwenPaw CLI could not start: " + error.Message);
            return 3;
        }
    }

    private static string Resolve(string root, string relative)
    {
        if (string.IsNullOrWhiteSpace(relative) || Path.IsPathRooted(relative))
            throw new InvalidDataException("Active component path is invalid.");
        string normalizedRoot = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        string value = Path.GetFullPath(Path.Combine(root, relative));
        if (!value.StartsWith(normalizedRoot, StringComparison.OrdinalIgnoreCase) || !Directory.Exists(value))
            throw new InvalidDataException("Active component path escapes or is missing: " + relative);
        return value;
    }

    private static string Quote(string value)
    {
        if (value.Length == 0) return "\"\"";
        return "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
    }
}
