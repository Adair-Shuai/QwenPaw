# -*- coding: utf-8 -*-
"""Exercise the compiled Chinese wizard through its actual window controls."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys

import pytest

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "scripts/pack-tauri/windows_portable_bootstrap.cs"
pytestmark = pytest.mark.skipif(
    sys.platform != "win32",
    reason="Requires Windows WinForms and the shipping .NET Framework",
)

HARNESS = r"""
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;
using System.Windows.Forms;

internal static class InstallerUiProbe
{
    private const BindingFlags Fields = BindingFlags.NonPublic |
        BindingFlags.Instance;
    private const BindingFlags Methods = BindingFlags.NonPublic |
        BindingFlags.Public | BindingFlags.Instance;
    private static int activePage;
    private static bool expanded;
    private static object Get(object value, string name) { return
        value.GetType().GetField(name, Fields).GetValue(value); }
    private static void Check(bool valid, string message) { if (!valid) throw
        new Exception(message); }
    private static void CheckBounds(Control parent)
    {
        foreach (Control child in parent.Controls)
        {
            if (child.Name.StartsWith("page-") && child.Name != "page-" +
                activePage) continue;
            if (child.Name == "installation-details" && !expanded) continue;
            Rectangle available = parent.DisplayRectangle;
            Check(child.Left >= available.Left && child.Top >= available.Top
                && child.Right <= available.Right + 1 &&
                child.Bottom <= available.Bottom + 1,
                    "Control clipped: " + child.Text + " " +
                child.Bounds + " parent " + parent.GetType().Name + " " +
                    parent.ClientSize);
            CheckBounds(child);
        }
    }
    [STAThread]
    private static int Main(string[] args)
    {
        try { return Run(args); }
        catch (Exception error)
        {
            while (error.InnerException != null) error = error.InnerException;
            Console.WriteLine(error.GetType().Name + ": " + error.Message);
            return 1;
        }
    }
    private static int Run(string[] args)
    {
        Console.OutputEncoding = new UTF8Encoding(false);
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        var assembly = Assembly.LoadFrom(args[0]);
        Type stateType =
            assembly.GetType("PortableSetup+InstallProgressState");
        object state = Activator.CreateInstance(stateType, true);
        MethodInfo apply = stateType.GetMethod("Apply");
        var percentages = new List<int>();
        foreach (string line in new[] {
            "[UGSCI-PHASE] Verifying package|start",
            "[UGSCI-PROGRESS] verify|50|100",
            "[UGSCI-PHASE] Copying application files|start",
            "[UGSCI-PROGRESS] copy|90|100",
            "[UGSCI-PHASE] Committing installation|end",
            "[UGSCI-PHASE] Cleaning staging files|end" })
        {
            Check((bool)apply.Invoke(state, new object[] { line }),
                "Valid progress rejected");
            percentages.Add((int)stateType.GetField("Percent").GetValue(state));
        }
        foreach (string invalid in new[] {
            "[UGSCI-PROGRESS] copy|-1|100", "[UGSCI-PROGRESS] copy|101|100",
            "[UGSCI-PROGRESS] copy|1|0", "[UGSCI-PROGRESS] verify|x|1",
            "[UGSCI-PROGRESS] other|1|1",
                "[UGSCI-PHASE] Copying application files|start",
            "[UGSCI-PHASE] not-a-phase|end",
                "[UGSCI-PHASE] Cleaning staging files|other" })
            Check(!(bool)apply.Invoke(state, new object[] { invalid }),
                "Unsafe progress accepted");
        Check((int)stateType.GetField("Percent").GetValue(state) == 99,
            "Premature 100 percent");
        object failed = Activator.CreateInstance(stateType, true);
        apply.Invoke(failed, new object[] {
            "[UGSCI-PHASE] Copying application files|start" });
        apply.Invoke(failed, new object[] { "[UGSCI-PROGRESS] copy|50|100" });
        apply.Invoke(failed, new object[] {
            "[UGSCI-PHASE] Cleaning staging files|end" });
        Check((int)stateType.GetField("Percent").GetValue(failed) == 48,
            "Failure cleanup reported success");

        Type formType = assembly.GetType("PortableSetup+SetupForm");
        for (int scaleIndex = 0; scaleIndex < 3; scaleIndex++)
        using (var form = (Form)Activator.CreateInstance(formType, new object[]
            { args[1], false }))
        {
            form.CreateControl();
            form.StartPosition = FormStartPosition.Manual;
            form.Location = new Point(-10000, -10000);
            form.ShowInTaskbar = false;
            form.Opacity = 0;
            form.Show();
            DateTime limit = DateTime.UtcNow.AddSeconds(20);
            while (!(bool)Get(form, "verificationComplete") && DateTime.UtcNow
                < limit)
            {
                Application.DoEvents(); Thread.Sleep(10);
            }
            Check((bool)Get(form, "verificationComplete"),
                "Real package verification did not complete");
            var showPage = formType.GetMethod("ShowPage", Methods);
            showPage.Invoke(form, new object[] { 0 });
            Check(form.Text == "UGSci 安装", "Window is not Chinese");
            Check(((Button)Get(form, "nextButton")).Text == "安装",
                "Install action missing");
            float scale = new[] { 1f, 1.5f, 2f }[scaleIndex];
            activePage = 0; expanded = false;
            form.Scale(new SizeF(scale, scale));
            formType.GetMethod("FitToWorkingArea", Methods).Invoke(form,
                new object[] { new Rectangle(0, 0, 1280, 700) });
            form.PerformLayout();
            CheckBounds(form);
            if (scaleIndex == 0) Save(form, Path.Combine(args[2],
                "settings.png"));
            object current = Get(form, "progress");
            apply.Invoke(current, new object[] {
                "[UGSCI-PHASE] Copying application files|start" });
            apply.Invoke(current, new object[] {
                "[UGSCI-PROGRESS] copy|1932735284|2147483648" });
            formType.GetField("busy", Fields).SetValue(form, true);
            showPage.Invoke(form, new object[] { 1 });
            activePage = 1;
            formType.GetMethod("RenderProgress", Methods).Invoke(form, null);
            Check(!(bool)((Button)Get(form, "cancelButton")).Enabled,
                "Unsafe install interruption enabled");
            Check(((Label)Get(form, "installPercent")).Text.Contains("68%"),
                "Measured phase did not reach UI");
            Check(((Label)Get(form,
                "installMetrics")).Text.Contains("1.80 GB"),
                "Copied bytes missing");
            if (scaleIndex == 0) Save(form, Path.Combine(args[2],
                "installing.png"));
            formType.GetMethod("DetailsClicked", Methods).Invoke(form, new
                object[] { null, null });
            expanded = true;
            CheckBounds(form);
            if (scaleIndex == 0) Save(form, Path.Combine(args[2],
                "details.png"));
            showPage.Invoke(form, new object[] { 2 });
            activePage = 2; expanded = false;
            Check(!(bool)Get(form, "detailsExpanded"),
                "Details did not collapse on completion");
            ((Label)Get(form, "completeStatus")).Text =
                "UGSci 已安装完成。\n\n可以从开始菜单或桌面快捷方式启动应用。";
            CheckBounds(form);
            if (scaleIndex == 0) Save(form, Path.Combine(args[2],
                "complete.png"));
            var fit = formType.GetMethod("FitToWorkingArea", Methods);
            var workingArea = new Rectangle(0, 0, 1280, 700);
            fit.Invoke(form, new object[] { workingArea });
            form.PerformLayout();
            Check(workingArea.Contains(form.Bounds),
                "High-DPI dialog exceeds the available work area");
            CheckBounds(form);
            showPage.Invoke(form, new object[] { 1 });
            activePage = 1;
            int collapsed = form.Height;
            formType.GetMethod("DetailsClicked", Methods).Invoke(form,
                new object[] { null, null });
            expanded = true;
            fit.Invoke(form, new object[] { workingArea });
            form.PerformLayout(); CheckBounds(form);
            formType.GetMethod("DetailsClicked", Methods).Invoke(form,
                new object[] { null, null });
            expanded = false;
            Check(form.Height == collapsed,
                "Clipped details expansion changed the collapsed height");
            formType.GetField("allowClose", Fields).SetValue(form, true);
        }
        Console.WriteLine(new JavaScriptSerializer().Serialize(new {
            percentages = percentages, scales = 3 }));
        return 0;
    }
    private static void Save(Form form, string path)
    {
        using (var bitmap = new Bitmap(form.Width, form.Height))
        {
            form.DrawToBitmap(bitmap, new Rectangle(Point.Empty, bitmap.Size));
            bitmap.Save(path, System.Drawing.Imaging.ImageFormat.Png);
        }
    }
}

"""


def _compile(source: Path, output: Path, target: str) -> None:
    compiler = (
        Path(os.environ["WINDIR"])
        / "Microsoft.NET/Framework64/v4.0.30319/csc.exe"
    )
    assert compiler.is_file(), "Windows UI validation requires csc.exe"
    result = subprocess.run(
        [
            str(compiler),
            "/nologo",
            f"/target:{target}",
            f"/out:{output}",
            f"/win32icon:{ROOT / 'scripts/pack/assets/icon.ico'}",
            "/reference:System.dll",
            "/reference:System.Core.dll",
            "/reference:System.Drawing.dll",
            "/reference:System.Windows.Forms.dll",
            "/reference:System.Web.Extensions.dll",
            str(source),
        ],
        capture_output=True,
        text=True,
        timeout=60,
        check=False,
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    assert result.returncode == 0, result.stdout + result.stderr


def test_chinese_setup_renders_all_steps_and_measured_progress(
    tmp_path: Path,
) -> None:
    package = tmp_path / "package"
    required = [
        "Setup.exe",
        "install.ps1",
        "version.json",
        "payload/Setup.exe",
        "payload/Uninstall.exe",
        "payload/UGSci.exe",
        "payload/binaries/state/active.json",
        "payload/binaries/cli/qwenpaw.exe",
        "payload/binaries/update-assistant/UGSciUpdateAssistant.exe",
        "payload/MicrosoftEdgeWebView2RuntimeInstallerX64.exe",
    ]
    entries = []
    for name in required:
        path = package / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b"isolated UI verification fixture\n")
        entries.append(
            f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {name}",
        )
    (package / "checksums.sha256").write_text(
        "\n".join(entries),
        encoding="utf-8",
    )
    harness = tmp_path / "probe.cs"
    harness.write_text(HARNESS, encoding="utf-8")
    assembly, executable = tmp_path / "setup.dll", tmp_path / "probe.exe"
    _compile(SOURCE, assembly, "library")
    _compile(harness, executable, "exe")
    result = subprocess.run(
        [str(executable), str(assembly), str(package), str(tmp_path)],
        capture_output=True,
        text=True,
        encoding="utf-8-sig",
        timeout=60,
        check=False,
        env={**os.environ, "TEMP": str(tmp_path), "TMP": str(tmp_path)},
        creationflags=subprocess.CREATE_NO_WINDOW,
    )
    assert result.returncode == 0, result.stdout + result.stderr
    report = json.loads(result.stdout)
    assert report == {"percentages": [2, 11, 23, 68, 98, 99], "scales": 3}
    for name in ("settings", "installing", "details", "complete"):
        assert (tmp_path / f"{name}.png").stat().st_size > 2000
