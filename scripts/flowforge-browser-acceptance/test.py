"""Run the shipped FlowForge plugin against its real service in Chromium.

Only the model is a declared deterministic fixture (see server.py). Screenshots,
run records and the result ledger are written outside the git worktree. Use
--smoke for mounting/visual inspection while iterating, full mode for acceptance.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
from pathlib import Path
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
ARTIFACTS = ROOT.parent / "browser-qa"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--smoke", action="store_true")
    args = parser.parse_args()
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    # Freeze the shipped bundle for the entire run, even if a developer rebuilds
    # it concurrently. Every route reload and the final digest use these bytes.
    shutil.copyfile(
        ROOT / "src/qwenpaw/plugins_bundle/flowforge/static/index.js",
        ARTIFACTS / "plugin.js",
    )
    subprocess.run(
        [
            str(ROOT / "console/node_modules/.bin/esbuild"),
            str(HERE / "host.tsx"),
            "--bundle",
            f"--outfile={ARTIFACTS / 'host.js'}",
            '--define:process.env.NODE_ENV="production"',
            "--minify",
        ],
        check=True,
        cwd=ROOT,
    )
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    base = f"http://127.0.0.1:{port}"
    ledger, browser_errors = [], []
    with tempfile.TemporaryDirectory(prefix="flowforge-browser-") as data_dir:
        env = {
            **os.environ,
            "PYTHONPATH": str(ROOT / "src"),
            "FLOWFORGE_QA_DATA": data_dir,
            "FLOWFORGE_QA_ARTIFACTS": str(ARTIFACTS),
        }
        with (ARTIFACTS / "server.log").open("w") as log:
            server = subprocess.Popen(
                [
                    sys.executable,
                    "-m",
                    "uvicorn",
                    "server:app",
                    "--app-dir",
                    str(HERE),
                    "--host",
                    "127.0.0.1",
                    "--port",
                    str(port),
                    "--log-level",
                    "warning",
                ],
                env=env,
                cwd=ROOT,
                stdout=log,
                stderr=subprocess.STDOUT,
            )
            try:
                deadline = time.monotonic() + 30
                while time.monotonic() < deadline:
                    if server.poll() is not None:
                        raise RuntimeError((ARTIFACTS / "server.log").read_text())
                    try:
                        with urllib.request.urlopen(
                            base + "/api/flowforge/health", timeout=1
                        ) as response:
                            if response.status == 200:
                                break
                    except Exception:
                        time.sleep(0.1)
                else:
                    raise RuntimeError("Acceptance HTTP host did not start")
                with sync_playwright() as playwright:
                    browser = playwright.chromium.launch(
                        headless=True, args=["--no-sandbox"]
                    )
                    page = browser.new_page(
                        viewport={"width": 1440, "height": 1000},
                        device_scale_factor=1,
                    )
                    page.on(
                        "pageerror",
                        lambda error: browser_errors.append(str(error)),
                    )
                    page.set_default_timeout(12000)
                    try:
                        page.goto(base + "/flowforge?flow=inventory-review")
                        page.wait_for_function("window.__flowforgeMounted === true")
                        expect(page.locator(".react-flow__node")).to_have_count(6)
                        expect(page.locator(".react-flow__edge")).to_have_count(5)
                        ledger.append({"case": "真实插件加载六节点及数据/控制边", "status": "passed"})
                        page.screenshot(
                            path=str(ARTIFACTS / "desktop.png"), full_page=True
                        )
                        if args.smoke:
                            (ARTIFACTS / "smoke-body.txt").write_text(
                                page.locator("body").inner_text()
                            )
                        else:
                            acceptance(page, base, ledger)
                        page.goto(base + "/flowforge?flow=inventory-review")
                        expect(page.locator(".react-flow__node")).to_have_count(6)
                        page.screenshot(
                            path=str(ARTIFACTS / "desktop.png"), full_page=True
                        )
                        page.set_viewport_size({"width": 390, "height": 844})
                        page.reload()
                        expect(page.locator(".react-flow__node")).to_have_count(6)
                        page.locator(".react-flow__controls-fitview").click()
                        page.wait_for_timeout(350)
                        page.screenshot(
                            path=str(ARTIFACTS / "mobile.png"), full_page=True
                        )
                        sizes = page.evaluate(
                            "({width:innerWidth,body:document.body.scrollWidth,root:document.documentElement.scrollWidth})"
                        )
                        assert (
                            sizes["body"] <= sizes["width"] + 1
                            and sizes["root"] <= sizes["width"] + 1
                        ), sizes
                        ledger.append(
                            {
                                "case": "390px窗口无页面水平溢出",
                                "status": "passed",
                                "sizes": sizes,
                            }
                        )
                        page.get_by_role("button", name="✦ AI 搭建", exact=True).click()
                        prompt = page.get_by_label("业务目标与修改要求")
                        expect(prompt).to_be_visible()
                        prompt.fill("在窄窗口检查业务要求输入和预览按钮。")
                        expect(
                            page.get_by_role("button", name="生成变更预览", exact=True)
                        ).to_be_visible()
                        drawer = page.locator(".ant-drawer-content:visible")
                        assert drawer.bounding_box()["width"] <= 390
                        page.wait_for_function(
                            """() => {
                            const panel = document.querySelector('.ant-drawer-open .ant-drawer-content');
                            if (!panel) return false;
                            const bounds = panel.getBoundingClientRect();
                            return bounds.x >= 0 && bounds.right <= innerWidth + 1;
                        }"""
                        )
                        expect(drawer.locator(".ant-drawer-close")).to_be_in_viewport()
                        expect(
                            drawer.locator(".ant-drawer-footer").get_by_role("button")
                        ).to_be_in_viewport()
                        page.screenshot(
                            path=str(ARTIFACTS / "mobile-authoring.png"), full_page=True
                        )
                        ledger.append(
                            {"case": "390px自然语言面板输入、预览及关闭按钮可达", "status": "passed"}
                        )
                        assert not browser_errors, browser_errors
                    except Exception as exc:
                        page.screenshot(
                            path=str(ARTIFACTS / "failure.png"), full_page=True
                        )
                        (ARTIFACTS / "failure-body.txt").write_text(
                            page.locator("body").inner_text()
                        )
                        ledger.append(
                            {
                                "case": "browser acceptance",
                                "status": "failed",
                                "error": str(exc),
                            }
                        )
                        raise
                    finally:
                        (ARTIFACTS / "results.json").write_text(
                            json.dumps(
                                {
                                    "model": "explicit deterministic fixture; live model not exercised",
                                    "browser": browser.version,
                                    "plugin_sha256": hashlib.sha256(
                                        (ARTIFACTS / "plugin.js").read_bytes()
                                    ).hexdigest(),
                                    "cases": ledger,
                                    "browser_errors": browser_errors,
                                },
                                ensure_ascii=False,
                                indent=2,
                            )
                        )
                        browser.close()
            finally:
                server.terminate()
                try:
                    server.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    server.kill()
    print(
        json.dumps(
            {"passed": len(ledger), "artifact_directory": str(ARTIFACTS)},
            ensure_ascii=False,
        )
    )


def acceptance(page, base, ledger):
    """Real interaction cases; selectors follow actual user-visible labels."""

    def passed(case, **evidence):
        ledger.append({"case": case, "status": "passed", **evidence})

    def get_flow(flow_id="inventory-review"):
        response = page.request.get(f"{base}/api/flowforge/flows/{flow_id}")
        assert response.ok, response.text()
        return response.json()

    def threshold(flow):
        return flow["nodes"]["gate"]["control"]["conditions"][0]["if"]["right"]

    def close_drawer():
        page.locator(".ant-drawer-content:visible .ant-drawer-close").last.click()
        expect(page.locator(".ant-drawer-content:visible")).to_have_count(0)

    def visible_threshold(expected):
        page.locator('.react-flow__node[data-id="gate"]').click()
        field = (
            page.locator(".ff-condition .ant-form-item")
            .filter(has_text="比较值（数字、布尔值或文本）")
            .locator("input")
        )
        expect(field).to_have_value(str(expected))
        close_drawer()

    def wait_run(run_id, status):
        deadline = time.monotonic() + 12
        while time.monotonic() < deadline:
            response = page.request.get(f"{base}/api/flowforge/runs/{run_id}")
            assert response.ok, response.text()
            record = response.json()
            if record["status"] == status:
                return record
            if record["status"] in {"failed", "cancelled", "timeout"}:
                raise AssertionError(record)
            page.wait_for_timeout(100)
        raise AssertionError(record)

    def start_run(value):
        page.get_by_role("button", name="试运行", exact=True).click()
        dialog = page.get_by_role("dialog")
        expect(dialog.get_by_text("将执行已保存版本", exact=True)).to_be_visible()
        dialog.get_by_role("spinbutton").fill(str(value))
        with page.expect_response(
            lambda response: response.request.method == "POST"
            and response.url.endswith("/inventory-review/run")
        ) as pending:
            dialog.get_by_role("button", name="开始运行", exact=True).click()
        response = pending.value
        assert response.ok, response.text()
        assert response.request.post_data_json == {"inputs": {"deviation": value}}
        return response.json()["run_id"]

    before = get_flow()
    assert threshold(before) == 3 and before["revision"] == 1
    assert {edge["kind"] for edge in before["edges"]} == {"data", "control"}
    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/node-types/refresh")
    ) as refreshed:
        page.get_by_role("button", name="刷新节点", exact=True).click()
    assert refreshed.value.ok
    assert refreshed.value.request.headers["x-agent-id"] == "default"
    passed("专家节点目录手动刷新保留专家上下文", nodes=len(refreshed.value.json()))

    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/flows/validate")
    ) as validated:
        page.get_by_role("button", name="验证", exact=True).click()
    assert validated.value.json()["ok"], validated.value.text()
    expect(page.get_by_text("工作流结构验证通过", exact=True)).to_be_visible()
    passed("画布验证使用真实后端结构校验")

    page.get_by_role("button", name="✦ 用自然语言修改", exact=True).click()
    prompt = page.get_by_label("业务目标与修改要求")
    prompt.fill("把库存偏差阈值从 3 改为 5，保留人工审核和其他节点。")
    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/authoring/proposals")
    ) as proposed:
        page.get_by_role("button", name="生成变更预览", exact=True).click()
    proposal = proposed.value.json()
    assert proposed.value.ok and proposal["validation"]["ok"], proposal
    assert threshold(proposal["flow"]) == 5
    assert get_flow() == before, "Preview must never persist the proposed workflow"
    expect(page.get_by_text("结构验证通过，请检查业务逻辑", exact=True)).to_be_visible()
    expect(page.locator(".ff-diff-table").filter(has_text="right")).to_have_count(1)
    page.screenshot(path=str(ARTIFACTS / "proposal.png"), full_page=True)
    passed("自然语言预览列出3到5变更且不保存", proposal_id=proposal["proposal_id"])

    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/apply")
    ) as applied:
        page.get_by_role("button", name="应用并保存", exact=True).click()
    assert applied.value.ok, applied.value.text()
    expect(page.locator("#ff-prompt")).not_to_be_visible()
    after_apply = get_flow()
    assert threshold(after_apply) == 5 and after_apply["revision"] == 2
    visible_threshold(5)
    passed("应用方案真实持久化阈值并新增版本", revision=after_apply["revision"])

    page.get_by_role("button", name=re.compile(r"^撤\s*销$")).click()
    visible_threshold(3)
    expect(page.get_by_text("有未保存修改", exact=True)).to_be_visible()
    assert get_flow() == after_apply
    page.get_by_role("button", name=re.compile(r"^重\s*做$")).click()
    visible_threshold(5)
    expect(page.get_by_text("已保存", exact=True)).to_be_visible()
    passed("AI应用可撤销为草稿并重做，未意外改写保存版本")

    normal_id = start_run(2)
    normal = wait_run(normal_id, "completed")
    assert normal["node_statuses"]["normal"] == "success", normal
    assert normal["node_statuses"]["review"] == "skipped", normal
    assert "正常，无需复核" in json.dumps(normal["outputs"], ensure_ascii=False), normal
    page.get_by_role("tab", name="输出", exact=True).click()
    expect(page.locator(".ant-drawer-content:visible .ff-code")).to_contain_text(
        "正常，无需复核"
    )
    close_drawer()
    passed("数字输入保持number并正确走正常分支", run_id=normal_id)

    review_id = start_run(8)
    review = wait_run(review_id, "waiting_human")
    assert review["node_statuses"]["review"] in {
        "blocked",
        "waiting_human",
    }, review
    expect(page.get_by_text("等待人工处理", exact=True)).to_be_visible()
    page.get_by_label("审核意见").fill("已核验压力与注采数据，同意继续。")
    page.screenshot(path=str(ARTIFACTS / "human-review.png"), full_page=True)
    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith(f"/runs/{review_id}/resume")
    ) as resumed:
        page.get_by_role("button", name="通过并继续", exact=True).click()
    assert resumed.value.ok, resumed.value.text()
    continued_id = resumed.value.json()["run_id"]
    continued = wait_run(continued_id, "completed")
    assert continued["node_statuses"]["approved"] == "success", continued
    assert continued["node_statuses"]["rejected"] == "skipped", continued
    assert "人工复核通过" in json.dumps(continued["outputs"], ensure_ascii=False), continued
    page.get_by_role("tab", name="输出", exact=True).click()
    expect(page.locator(".ant-drawer-content:visible .ff-code")).to_contain_text(
        "人工复核通过"
    )
    close_drawer()
    passed(
        "人工审核暂停、意见提交、恢复及通过分支真实执行",
        initial_run=review_id,
        resumed_run=continued_id,
    )

    page.get_by_role("button", name="运行记录", exact=True).click()
    expect(page.get_by_text("当前工作流运行记录", exact=True)).to_be_visible()
    expect(page.locator(".ant-drawer-content:visible tbody tr")).to_have_count(3)
    expect(page.locator(".ant-drawer-content:visible")).to_contain_text("已恢复")
    close_drawer()
    passed("运行历史保存原运行、审核恢复运行及状态")

    page.get_by_role("button", name=re.compile(r"^版\s*本$")).click()
    page.locator(".ff-version").filter(
        has=page.get_by_text("版本 1", exact=True)
    ).get_by_role("button", name=re.compile(r"恢\s*复")).click()
    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/versions/1/restore")
    ) as restored:
        page.get_by_role("button", name="恢复版本", exact=True).click()
    assert restored.value.ok, restored.value.text()
    restored_flow = get_flow()
    assert threshold(restored_flow) == 3 and restored_flow["revision"] == 3
    versions = page.request.get(
        f"{base}/api/flowforge/flows/inventory-review/versions"
    ).json()
    assert len(versions) == 3
    visible_threshold(3)
    passed("恢复历史内容产生新版本而保留全部旧版本", revision=restored_flow["revision"])

    page.get_by_role("button", name="✦ 用自然语言修改", exact=True).click()
    offline_prompt = "离线验收：请保留这段要求和当前工作流"
    prompt = page.get_by_label("业务目标与修改要求")
    prompt.fill(offline_prompt)
    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/authoring/proposals")
    ) as unavailable:
        page.get_by_role("button", name="生成变更预览", exact=True).click()
    assert unavailable.value.status >= 500, unavailable.value.text()
    expect(page.get_by_text("方案未应用", exact=True)).to_be_visible()
    expect(prompt).to_have_value(offline_prompt)
    assert get_flow() == restored_flow
    page.screenshot(path=str(ARTIFACTS / "model-offline.png"), full_page=True)
    close_drawer()
    passed("模型离线明确报错且保留要求与工作流")

    page.get_by_role("button", name="← 返回", exact=True).click()
    page.get_by_role("button", name=re.compile("新建工作流")).click()
    page.get_by_placeholder("输入工作流名称（如：库存日评估）").fill("自然语言搭建验收")
    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/flowforge/flows")
    ) as created:
        page.get_by_role("dialog").get_by_role(
            "button", name=re.compile(r"^创\s*建$")
        ).click()
    assert created.value.ok, created.value.text()
    new_id = created.value.json()["id"]
    expect(page.locator(".react-flow__node")).to_have_count(0)
    expect(page.get_by_text("从业务目标开始", exact=True)).to_be_visible()
    page.get_by_role("button", name="描述我的工作流", exact=True).click()
    page.get_by_label("业务目标与修改要求").fill("创建库存偏差复核流程：输入偏差数字，大于3交工程师审核，否则输出正常；审核分通过和退回。")
    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/authoring/proposals")
    ) as new_proposed:
        page.get_by_role("button", name="生成变更预览", exact=True).click()
    assert (
        new_proposed.value.ok and new_proposed.value.json()["validation"]["ok"]
    ), new_proposed.value.text()
    assert get_flow(new_id)["nodes"] == {}
    with page.expect_response(
        lambda response: response.request.method == "POST"
        and response.url.endswith("/apply")
    ) as new_applied:
        page.get_by_role("button", name="应用并保存", exact=True).click()
    assert new_applied.value.ok, new_applied.value.text()
    expect(page.locator(".react-flow__node")).to_have_count(6)
    expect(page.locator(".react-flow__edge")).to_have_count(5)
    created_flow = get_flow(new_id)
    assert created_flow["revision"] == 2 and threshold(created_flow) == 3
    passed("空白工作流自然语言创建、预览与应用", flow_id=new_id)

    (ARTIFACTS / "run-records.json").write_text(
        json.dumps([normal, review, continued], ensure_ascii=False, indent=2)
    )


if __name__ == "__main__":
    main()
