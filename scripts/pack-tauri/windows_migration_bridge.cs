using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Windows.Forms;

internal static class UGSciMigrationBridge
{
    private const string TargetVersion = "__UGSCI_VERSION__";
    private const string FooterMagic = "UGSCIBRIDGEV1!!!";
    private const int FooterSize = 8 + 32 + 16;

    [STAThread]
    private static int Main()
    {
        try
        {
            string ownPath = Process.GetCurrentProcess().MainModule.FileName;
            string state = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "UGSci", "updates", "bridge-" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(state);
            string package = Path.Combine(state, "UGSci-Desktop-" + TargetVersion + ".zip");
            byte[] expectedHash;
            ExtractOverlay(ownPath, package, out expectedHash);
            string actualHash = Sha256(package);
            if (!string.Equals(actualHash, Hex(expectedHash), StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("The embedded UGSci update package failed SHA-256 verification.");

            string assistant = Path.Combine(state, "UGSciUpdateAssistant.exe");
            ExtractAssistant(package, assistant);
            string ready = Path.Combine(state, "assistant.ready");
            var start = new ProcessStartInfo {
                FileName = assistant,
                Arguments = "--package " + Quote(package) +
                    " --sha256 " + actualHash +
                    " --version " + Quote(TargetVersion) +
                    " --parent-pid " + Process.GetCurrentProcess().Id +
                    " --ready-file " + Quote(ready),
                WorkingDirectory = state,
                UseShellExecute = false
            };
            Process child = Process.Start(start);
            if (child == null) throw new InvalidOperationException("The UGSci update assistant did not start.");
            DateTime deadline = DateTime.UtcNow.AddSeconds(15);
            while (DateTime.UtcNow < deadline)
            {
                if (File.Exists(ready)) return 0;
                if (child.HasExited)
                    throw new InvalidOperationException("The UGSci update assistant closed before showing its window.");
                Thread.Sleep(100);
            }
            try { child.Kill(); } catch { }
            throw new TimeoutException("The UGSci update assistant did not become visible in time.");
        }
        catch (Exception error)
        {
            MessageBox.Show(error.Message, "UGSci Desktop Update",
                MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 3;
        }
    }

    private static void ExtractOverlay(string executable, string output, out byte[] expectedHash)
    {
        using (var input = new FileStream(executable, FileMode.Open, FileAccess.Read, FileShare.Read))
        {
            if (input.Length <= FooterSize) throw new InvalidDataException("UGSci migration payload is missing.");
            input.Position = input.Length - FooterSize;
            using (var reader = new BinaryReader(input, Encoding.ASCII, true))
            {
                long payloadLength = reader.ReadInt64();
                expectedHash = reader.ReadBytes(32);
                string magic = Encoding.ASCII.GetString(reader.ReadBytes(16));
                if (magic != FooterMagic || payloadLength <= 0 || payloadLength > input.Length - FooterSize)
                    throw new InvalidDataException("UGSci migration payload footer is invalid.");
                long payloadOffset = input.Length - FooterSize - payloadLength;
                input.Position = payloadOffset;
                using (var destination = new FileStream(output, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                {
                    byte[] buffer = new byte[1024 * 1024];
                    long remaining = payloadLength;
                    while (remaining > 0)
                    {
                        int read = input.Read(buffer, 0, (int)Math.Min(buffer.Length, remaining));
                        if (read <= 0) throw new EndOfStreamException("UGSci migration payload is truncated.");
                        destination.Write(buffer, 0, read);
                        remaining -= read;
                    }
                }
            }
        }
    }

    private static void ExtractAssistant(string package, string output)
    {
        using (var archive = ZipFile.OpenRead(package))
        {
            ZipArchiveEntry selected = null;
            foreach (ZipArchiveEntry entry in archive.Entries)
            {
                string normalized = entry.FullName.Replace('\\', '/');
                if (string.Equals(normalized,
                    "payload/binaries/update-assistant/UGSciUpdateAssistant.exe",
                    StringComparison.OrdinalIgnoreCase))
                {
                    if (selected != null) throw new InvalidDataException("Duplicate update assistant in package.");
                    selected = entry;
                }
            }
            if (selected == null) throw new InvalidDataException("The b7 update assistant is missing from the package.");
            if (selected.Length <= 0 || selected.Length > 16 * 1024 * 1024)
                throw new InvalidDataException("The b7 update assistant has an invalid size.");
            using (Stream source = selected.Open())
            using (var destination = new FileStream(output, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                source.CopyTo(destination);
        }
    }

    private static string Sha256(string path)
    {
        using (var hash = SHA256.Create())
        using (var stream = File.OpenRead(path)) return Hex(hash.ComputeHash(stream));
    }

    private static string Hex(byte[] value)
    {
        var result = new StringBuilder(value.Length * 2);
        foreach (byte item in value) result.Append(item.ToString("x2"));
        return result.ToString();
    }

    private static string Quote(string value) { return "\"" + value.Replace("\"", "\\\"") + "\""; }
}
