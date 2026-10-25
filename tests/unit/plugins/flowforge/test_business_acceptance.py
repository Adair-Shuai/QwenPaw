"""Business acceptance through real catalog, policy and durable runtime.

Only external business functions/model responses are deterministic fixtures.
Discovery, policy decisions, scheduling and persistence use real components.
"""

import asyncio
import copy
import json
import threading
import time
from types import SimpleNamespace

import pytest

from qwenpaw.app.workspace.local_workspace import QwenPawLocalWorkspace
from qwenpaw.app.workspace.workspace_plugins import WorkspacePlugins
from qwenpaw.governance.policy import GovernancePolicy
from qwenpaw.governance.resource_governor import ResourceGovernor
from qwenpaw.governance.tool_registry import ToolRegistry as GovernanceRegistry
from qwenpaw.plugins_bundle.flowforge.node_catalog import AgentNodeCatalog
from qwenpaw.plugins_bundle.flowforge.service import WorkflowService
from qwenpaw.runtime.tool_registry import ToolDescriptor


AGENT = "acceptance"


def wait(handle, timeout=10):
    deadline = time.monotonic() + timeout
    while not handle.is_done and time.monotonic() < deadline:
        time.sleep(0.01)
    assert handle.is_done, handle.to_dict()
    return handle.to_dict()


@pytest.fixture
def business(tmp_path, monkeypatch):
    """Actual host discovery + actual policy; never use OFF or raw dispatch."""
    registry = GovernanceRegistry()
    decisions, services = [], []
    plugins = WorkspacePlugins()
    root = tmp_path / "workspace"
    root.mkdir()
    config = SimpleNamespace(
        name=AGENT,
        description="",
        enabled=True,
        approval_level="smart",
        tools=SimpleNamespace(builtin_tools={}),
    )
    workspace = SimpleNamespace(
        agent_id=AGENT,
        workspace_dir=root,
        config=config,
        plugins=plugins,
        local_workspace=QwenPawLocalWorkspace(
            plugins.tool_registry, workdir=str(root)
        ),
    )

    class Manager:
        async def get_agent(self, agent_id):
            return workspace if agent_id == AGENT else None

    class RecordingGovernor(ResourceGovernor):
        def assert_policy(self, spec):
            decision = super().assert_policy(spec)
            decisions.append((spec.tool_name, decision.action.value))
            return decision

    def governor(workspace_dir, project_dir):
        instance = RecordingGovernor(
            str(workspace_dir),
            governance_dir=str(tmp_path / "governance"),
            coding_project_dir=str(project_dir),
        )
        instance._policy = GovernancePolicy(
            _registry=registry,
            execution_level="smart",
            audit_level="none",
        )
        return instance

    monkeypatch.setattr(
        "qwenpaw.governance.tool_adapter.DEFAULT_REGISTRY", registry
    )
    monkeypatch.setattr(
        "qwenpaw.governance.tool_registry.DEFAULT_REGISTRY", registry
    )
    monkeypatch.setattr(
        "qwenpaw.config.utils.load_config",
        lambda: SimpleNamespace(
            agents=SimpleNamespace(profiles={AGENT: config})
        ),
    )
    monkeypatch.setattr(
        "qwenpaw.config.config.load_agent_config", lambda _: config
    )
    monkeypatch.setattr(
        "qwenpaw.agents.skill_system.resolve_effective_skills",
        lambda *args: [],
    )
    monkeypatch.setattr(
        "qwenpaw.runtime.builder.AgentBuilder._init_governor", governor
    )
    monkeypatch.setattr(
        "qwenpaw.app.agent_context.get_agent_project_dir",
        lambda ws: ws.workspace_dir,
    )
    catalog = AgentNodeCatalog(Manager())

    def register(*functions):
        for fn in functions:
            descriptor = ToolDescriptor(name=fn.__name__, func=fn)
            plugins.tool_registry.register(descriptor)
            fn._tool_descriptor = descriptor
            # These fixtures perform only in-memory arithmetic/trace recording.
            # Their explicit registration is still revocable by real policy.
            registry.register(fn.__name__, "internal", "")
            registry.register_python_name(fn.__name__, fn.__name__)
            registry.set_owner(fn.__name__, "business-acceptance")

    def create_service():
        service = WorkflowService(flows_dir=tmp_path / "flows")
        service.node_catalog = catalog
        services.append(service)
        return service

    def stop_service(service):
        for handle in list(service._runs.values()):
            if not handle.is_done:
                service.cancel_run(handle.run_id)
                wait(handle)
        service._loop.call_soon_threadsafe(service._loop.stop)
        service._loop_thread.join(timeout=3)

    yield SimpleNamespace(
        service=create_service(),
        create_service=create_service,
        stop_service=stop_service,
        register=register,
        catalog=catalog,
        decisions=decisions,
        policy_registry=registry,
        workspace=workspace,
    )
    for service in services:
        if service._loop.is_running():
            stop_service(service)


def inventory_flow(flow_id="inventory", threshold=0.03):
    return {
        "id": flow_id,
        "name": "库存双方法校核",
        "version": "1.0",
        "inputs": [{"name": "inventory", "type": "object", "required": True}],
        "metadata": {
            "positions": {
                "input": {"x": 0, "y": 100},
                "compare": {"x": 400, "y": 100},
            }
        },
        "nodes": {
            "input": {
                "class_type": "InputNode",
                "inputs": {"name": "inventory"},
            },
            "book": {
                "class_type": "Tool.book_inventory",
                "inputs": {"data": ["input", 0]},
            },
            "pressure": {
                "class_type": "Tool.pressure_inventory",
                "inputs": {"data": ["input", 0]},
            },
            "compare": {
                "class_type": "Tool.compare_inventory",
                "inputs": {"book": ["book", 0], "pressure": ["pressure", 0]},
            },
            "condition": {
                "class_type": "ConditionNode",
                "inputs": {"__flow_dependencies": [["compare", 0]]},
                "control": {
                    "conditions": [
                        {
                            "if": {
                                "left": "outputs.compare",
                                "operator": "gt",
                                "right": threshold,
                            },
                            "then_node": "review",
                        }
                    ],
                    "else_node": "normal_report",
                },
            },
            "review": {
                "class_type": "HumanReviewNode",
                "inputs": {
                    "reviewer": "inventory-owner",
                    "review_prompt": "偏差为 ${outputs.compare}，请审核。",
                },
                "control": {
                    "next": "approved_report",
                    "on_reject": "rejected_report",
                },
            },
            "normal_report": {
                "class_type": "OutputNode",
                "inputs": {
                    "value": {
                        "status": "normal",
                        "deviation": "${outputs.compare}",
                    }
                },
            },
            "approved_report": {
                "class_type": "OutputNode",
                "inputs": {
                    "value": {
                        "status": "approved",
                        "deviation": "${outputs.compare}",
                    }
                },
            },
            "rejected_report": {
                "class_type": "OutputNode",
                "inputs": {
                    "value": {
                        "status": "rejected",
                        "deviation": "${outputs.compare}",
                    }
                },
            },
        },
        "outputs": ["normal_report", "approved_report", "rejected_report"],
    }


def install_inventory(business):
    calls = []
    entered = set()
    rendezvous = asyncio.Event()

    async def arrive(name):
        entered.add(name)
        if entered == {"book", "pressure"}:
            rendezvous.set()
        # A serial scheduler fails, rather than merely appearing concurrent.
        await asyncio.wait_for(rendezvous.wait(), timeout=2)

    async def book_inventory(data: dict):
        calls.append("book")
        await arrive("book")
        return str(data["initial"] + data["injected"] - data["withdrawn"])

    async def pressure_inventory(data: dict):
        calls.append("pressure")
        await arrive("pressure")
        return str(data["pressure_estimate"])

    async def compare_inventory(book: str, pressure: str):
        calls.append("compare")
        return str(abs(float(book) - float(pressure)) / float(book))

    business.register(book_inventory, pressure_inventory, compare_inventory)
    return calls


def inventory_inputs(pressure=103):
    return {
        "inventory": {
            "initial": 100,
            "injected": 12,
            "withdrawn": 8,
            "pressure_estimate": pressure,
        }
    }


def test_parallel_inventory_join_low_deviation_publishes_only_normal_report(
    business,
):
    calls = install_inventory(business)
    business.service.save_flow("inventory", inventory_flow())
    result = wait(
        business.service.start_run(
            "inventory", inventory_inputs(), agent_id=AGENT
        )
    )
    assert result["status"] == "completed", result
    assert set(result["outputs"]) == {"normal_report"}
    assert result["outputs"]["normal_report"]["status"] == "normal"
    assert float(
        result["outputs"]["normal_report"]["deviation"]
    ) == pytest.approx(1 / 104)
    assert sorted(calls) == ["book", "compare", "pressure"]
    assert calls[-1] == "compare"
    assert {
        name for name, decision in business.decisions if decision == "allow"
    } == {
        "book_inventory",
        "pressure_inventory",
        "compare_inventory",
    }


@pytest.mark.parametrize(
    "approved,output", [(True, "approved_report"), (False, "rejected_report")]
)
def test_high_deviation_requires_explicit_review_and_routes_decision(
    business, approved, output
):
    calls = install_inventory(business)
    business.service.save_flow("inventory", inventory_flow())
    original = business.service.start_run(
        "inventory", inventory_inputs(95), agent_id=AGENT
    )
    paused = wait(original)
    assert paused["status"] == "waiting_human", paused
    assert not {"normal_report", "approved_report", "rejected_report"} & set(
        paused["outputs"]
    )
    resumed = business.service.resume_run(
        original.run_id, {"approved": approved, "comments": "核对记录完成"}
    )
    result = wait(resumed)
    assert result["status"] == "completed", result
    assert set(result["outputs"]) == {output}
    assert float(result["outputs"][output]["deviation"]) == pytest.approx(
        9 / 104
    )
    assert sorted(calls) == ["book", "compare", "pressure"]
    assert resumed.run_id != original.run_id
    assert result["state_id"] == paused["state_id"]
    assert result["root_run_id"] == original.run_id
    assert result["resumed_from_run_id"] == original.run_id
    assert result["parent_run_id"] is None
    assert (
        business.service.get_run_record(original.run_id)["resumed_by_run_id"]
        == resumed.run_id
    )
    with pytest.raises(ValueError):
        business.service.resume_run(original.run_id, {"approved": approved})


def test_invalid_approval_does_not_consume_paused_business_run(business):
    calls = install_inventory(business)
    business.service.save_flow("inventory", inventory_flow())
    original = business.service.start_run(
        "inventory", inventory_inputs(95), agent_id=AGENT
    )
    assert wait(original)["status"] == "waiting_human"
    with pytest.raises(ValueError, match="approved|布尔"):
        business.service.resume_run(original.run_id, {"approved": "false"})
    assert (
        business.service.get_run_record(original.run_id).get(
            "resumed_by_run_id"
        )
        is None
    )
    assert len(business.service.list_runs()) == 1
    result = wait(
        business.service.resume_run(original.run_id, {"approved": False})
    )
    assert result["status"] == "completed", result
    assert set(result["outputs"]) == {"rejected_report"}
    assert sorted(calls) == ["book", "compare", "pressure"]


def test_restart_keeps_saved_revision_without_repeating_business_effects(
    business,
):
    calls = install_inventory(business)
    first = business.service
    first.save_flow("inventory", inventory_flow())
    original = first.start_run(
        "inventory", inventory_inputs(95), agent_id=AGENT
    )
    assert wait(original)["status"] == "waiting_human"
    stored = first._execution_repository.get(original.run_id)
    assert (
        stored["flow_snapshot"]["nodes"]["condition"]["control"]["conditions"][
            0
        ]["if"]["right"]
        == 0.03
    )
    first.save_flow(
        "inventory",
        {
            "id": "inventory",
            "nodes": {
                "wrong": {
                    "class_type": "OutputNode",
                    "inputs": {"value": "WRONG NEW VERSION"},
                }
            },
            "outputs": ["wrong"],
        },
    )
    business.stop_service(first)
    second = business.create_service()
    recovered = second.get_run_record(original.run_id)
    assert recovered["status"] == "waiting_human"
    assert "flow_snapshot" not in recovered
    continuation = second.resume_run(original.run_id, {"approved": True})
    result = wait(continuation)
    assert result["status"] == "completed", result
    assert set(result["outputs"]) == {"approved_report"}
    assert sorted(calls) == ["book", "compare", "pressure"]
    resumed_record = second._execution_repository.get(continuation.run_id)
    assert resumed_record["flow_snapshot"] == stored["flow_snapshot"]
    assert resumed_record["flow_revision"] == stored["flow_revision"]


def test_policy_revocation_after_catalog_prepare_prevents_function_call(
    business,
):
    calls = []

    async def publish_report(value: str):
        calls.append(value)
        return value

    business.register(publish_report)

    async def scenario():
        scoped = await business.catalog.prepare(
            business.service.executor, AGENT, {}
        )
        assert scoped.tool_registry is None
        assert scoped.node_registry.get("Tool.publish_report") is not None
        business.policy_registry.unregister_python_tool("publish_report")
        result = await scoped.tool_executor.execute(
            "publish_report", {"value": "must not publish"}
        )
        assert not result.result.success
        assert "denied" in result.result.error
        assert result.result.retryable is False

    asyncio.run(scenario())
    assert calls == []
    assert business.decisions[-1][1] == "deny"


@pytest.mark.parametrize(
    "node_type", ["Tool.publish_report", "ToolNode", "ToolCallNode"]
)
def test_governance_denial_is_not_retried_even_with_retry_budget(
    business, node_type
):
    calls = []

    async def publish_report(value: str):
        calls.append(value)
        return value

    business.register(publish_report)
    # The capability remains in the catalog; actual policy revokes it.
    business.policy_registry.unregister_python_tool("publish_report")
    inputs = (
        {"value": "forbidden"}
        if node_type == "Tool.publish_report"
        else {"tool_name": "publish_report", "args": {"value": "forbidden"}}
        if node_type == "ToolNode"
        else {"tool": "publish_report", "params": {"value": "forbidden"}}
    )
    business.service.save_flow(
        "denied",
        {
            "id": "denied",
            "nodes": {
                "tool": {
                    "class_type": node_type,
                    "inputs": inputs,
                    "control": {"max_retries": 2, "retry_delay_sec": 0},
                },
            },
            "outputs": ["tool"],
        },
    )
    result = wait(business.service.start_run("denied", agent_id=AGENT))
    assert result["status"] == "failed", result
    assert "denied" in str(result["errors"] or result["error"])
    assert calls == []
    assert len(business.decisions) == 1, business.decisions
    assert business.decisions[0][1] == "deny"


def test_unknown_tool_never_publishes_downstream_report(business):
    flow = {
        "id": "unknown",
        "nodes": {
            "missing": {
                "class_type": "ToolNode",
                "inputs": {"tool_name": "unregistered_inventory", "args": {}},
            },
            "publish": {
                "class_type": "OutputNode",
                "inputs": {"value": ["missing", 0]},
            },
        },
        "outputs": ["publish"],
    }
    # Drafts may be incomplete; start or scoped admission must fail.
    business.service.save_flow("unknown", flow)
    try:
        handle = business.service.start_run("unknown", agent_id=AGENT)
    except ValueError as exc:
        assert "unregistered_inventory" in str(exc)
        assert business.service.list_runs() == []
    else:
        result = wait(handle)
        assert result["status"] == "failed", result
        assert result["outputs"] == {}
        assert "unregistered_inventory" in str(
            result["errors"] or result["error"]
        )
        assert result["node_statuses"].get("publish") != "success"
    assert business.decisions == []


def test_real_cancel_interrupts_governed_call_and_never_publishes(business):
    started, stopped = threading.Event(), threading.Event()

    async def await_external_inventory():
        started.set()
        try:
            await asyncio.sleep(60)
        finally:
            stopped.set()

    business.register(await_external_inventory)
    business.service.save_flow(
        "cancel",
        {
            "id": "cancel",
            "nodes": {
                "wait": {"class_type": "Tool.await_external_inventory"},
                "publish": {
                    "class_type": "OutputNode",
                    "inputs": {"value": ["wait", 0]},
                },
            },
            "outputs": ["publish"],
        },
    )
    handle = business.service.start_run("cancel", agent_id=AGENT)
    assert started.wait(5), handle.to_dict()
    assert business.service.cancel_run(handle.run_id)
    result = wait(handle)
    assert result["status"] == "cancelled", result
    assert stopped.wait(2)
    assert result["outputs"] == {}
    assert result["node_statuses"].get("publish") != "success"
    assert (
        business.service.get_run_record(handle.run_id)["status"] == "cancelled"
    )


def parent_flow():
    return {
        "id": "parent",
        "name": "库存审批父流程",
        "nodes": {
            "inventory_child": {
                "class_type": "SubworkflowNode",
                "inputs": {
                    "subworkflow_id": "inventory",
                    "subworkflow_inputs": inventory_inputs(95),
                },
            },
        },
        "outputs": ["inventory_child"],
    }


def test_parent_child_restart_resume_pins_both_revisions_and_lineage(business):
    calls = install_inventory(business)
    service = business.service
    service.save_flow("inventory", inventory_flow())
    service.save_flow("parent", parent_flow())
    parent = service.start_run("parent", agent_id=AGENT)
    paused = wait(parent)
    assert paused["status"] == "waiting_human", paused
    child = next(r for r in service.list_runs() if r["flow_id"] == "inventory")
    assert child["parent_run_id"] == parent.run_id
    assert child["root_run_id"] == parent.run_id
    assert child["workflow_stack"] == ["parent", "inventory"]
    snapshots = {
        r["flow_id"]: service._execution_repository.get(r["run_id"])
        for r in service.list_runs()
    }
    # Deleted definitions force restart to use run snapshots.
    service.delete_flow("inventory")
    service.delete_flow("parent")
    business.stop_service(service)
    restarted = business.create_service()
    continuation = restarted.resume_run(parent.run_id, {"approved": True})
    result = wait(continuation)
    assert result["status"] == "completed", result
    assert set(result["outputs"]["inventory_child"]) == {"approved_report"}
    assert sorted(calls) == ["book", "compare", "pressure"]
    child_continuation = next(
        r
        for r in restarted.list_runs()
        if r.get("resumed_from_run_id") == child["run_id"]
    )
    assert child_continuation["parent_run_id"] == continuation.run_id
    assert child_continuation["root_run_id"] == parent.run_id
    for resumed in (result, child_continuation):
        record = restarted._execution_repository.get(resumed["run_id"])
        original = snapshots[resumed["flow_id"]]
        assert record["flow_snapshot"] == original["flow_snapshot"]
        assert record["flow_revision"] == original["flow_revision"]


def test_cancel_parent_propagates_to_running_governed_child(business):
    started, stopped = threading.Event(), threading.Event()

    async def external_calculation():
        started.set()
        try:
            await asyncio.sleep(60)
        finally:
            stopped.set()

    business.register(external_calculation)
    business.service.save_flow(
        "inventory",
        {
            "id": "inventory",
            "nodes": {"wait": {"class_type": "Tool.external_calculation"}},
            "outputs": ["wait"],
        },
    )
    business.service.save_flow("parent", parent_flow())
    parent = business.service.start_run("parent", agent_id=AGENT)
    assert started.wait(5), parent.to_dict()
    assert business.service.cancel_run(parent.run_id)
    assert wait(parent)["status"] == "cancelled"
    assert stopped.wait(2)
    records = business.service.list_runs()
    assert len(records) == 2
    for record in records:
        assert (
            wait(business.service.get_run(record["run_id"]))["status"]
            == "cancelled"
        )
        assert (
            business.service.get_run_record(record["run_id"])["status"]
            == "cancelled"
        )
        with pytest.raises(ValueError):
            business.service.resume_run(record["run_id"], {"approved": True})


def test_parallel_child_approvals_target_one_child_without_repeating_either(
    business,
):
    calls = install_inventory(business)
    business.service.save_flow("inventory", inventory_flow())
    child = parent_flow()["nodes"]["inventory_child"]
    business.service.save_flow(
        "parent",
        {
            "id": "parent",
            "nodes": {
                "child_a": copy.deepcopy(child),
                "child_b": copy.deepcopy(child),
            },
            "outputs": ["child_a", "child_b"],
        },
    )
    original = business.service.start_run("parent", agent_id=AGENT)
    assert wait(original)["status"] == "waiting_human"
    assert sorted(calls) == [
        "book",
        "book",
        "compare",
        "compare",
        "pressure",
        "pressure",
    ]
    with pytest.raises(ValueError, match="node_id"):
        business.service.resume_run(original.run_id, {"approved": True})
    first = business.service.resume_run(
        original.run_id,
        {
            "node_id": "child_a",
            "child_inputs": {"node_id": "review", "approved": True},
        },
    )
    first_result = wait(first)
    assert first_result["status"] == "waiting_human", first_result
    second = business.service.resume_run(
        first.run_id,
        {
            "node_id": "child_b",
            "child_inputs": {"node_id": "review", "approved": False},
        },
    )
    result = wait(second)
    assert result["status"] == "completed", result
    assert set(result["outputs"]["child_a"]) == {"approved_report"}
    assert set(result["outputs"]["child_b"]) == {"rejected_report"}
    assert sorted(calls) == [
        "book",
        "book",
        "compare",
        "compare",
        "pressure",
        "pressure",
    ]
    assert result["root_run_id"] == original.run_id
    children = [
        r for r in business.service.list_runs() if r["flow_id"] == "inventory"
    ]
    assert (
        len(children) == 4
    )  # Two paused originals, exactly one continuation each.


class ThresholdModel:
    """Deterministic external model; exercises the actual proposal protocol."""

    async def complete(self, messages, **kwargs):
        request = json.loads(messages[-1].content)
        candidate = copy.deepcopy(request["current_flow"])
        candidate["nodes"]["condition"]["control"]["conditions"][0]["if"][
            "right"
        ] = 0.05
        return SimpleNamespace(
            content=json.dumps({"flow": candidate, "warnings": []})
        )


def test_natural_language_creation_previews_before_persisting_or_executing(
    business,
):
    calls = install_inventory(business)

    class CreationModel:
        async def complete(self, messages, **kwargs):
            request = json.loads(messages[-1].content)
            assert request["current_flow"] is None
            assert set(request["available_tools"]) == {
                "book_inventory",
                "pressure_inventory",
                "compare_inventory",
            }
            candidate = inventory_flow(request["flow_id"])
            return SimpleNamespace(
                content=json.dumps({"flow": candidate, "warnings": []})
            )

    business.service.executor.llm_service = CreationModel()

    async def scenario():
        proposal = await business.service.create_proposal(
            "并行计算账面库存与压力库存，汇合比较；偏差超过3%由负责人审核，通过或拒绝分别输出报告，否则自动输出正常报告。",
            agent_id=AGENT,
        )
        assert proposal["validation"]["ok"] is True, proposal
        assert proposal["base_revision"] == 0
        assert proposal["changes"]
        assert business.service.list_flows() == []
        assert business.service.list_runs() == []
        assert calls == [] and business.decisions == []
        return await business.service.apply_proposal_for_agent(
            proposal["proposal_id"],
            expected_revision=0,
            agent_id=AGENT,
        )

    saved = asyncio.run(scenario())
    assert saved["revision"] == 1
    result = wait(
        business.service.start_run(
            saved["id"], inventory_inputs(), agent_id=AGENT
        )
    )
    assert result["status"] == "completed", result
    assert set(result["outputs"]) == {"normal_report"}


def test_threshold_proposal_changes_only_condition_after_apply(
    business,
):
    install_inventory(business)
    business.service.save_flow("inventory", inventory_flow())
    business.service.executor.llm_service = ThresholdModel()

    async def scenario():
        before = business.service.get_flow("inventory")
        proposal = await business.service.create_proposal(
            "将偏差阈值从3%改为5%，保留其他所有节点和布局", flow=before, agent_id=AGENT
        )
        assert proposal["validation"]["ok"] is True, proposal
        assert business.service.get_flow("inventory") == before
        candidate = copy.deepcopy(proposal["flow"])
        candidate["nodes"]["condition"]["control"]["conditions"][0]["if"][
            "right"
        ] = 0.03
        assert candidate["nodes"] == before["nodes"]
        assert (
            candidate["metadata"]["positions"]
            == before["metadata"]["positions"]
        )
        applied = await business.service.apply_proposal_for_agent(
            proposal["proposal_id"],
            expected_revision=before["revision"],
            agent_id=AGENT,
        )
        assert applied["revision"] > before["revision"]
        assert (
            applied["nodes"]["condition"]["control"]["conditions"][0]["if"][
                "right"
            ]
            == 0.05
        )
        return applied

    asyncio.run(scenario())
    # 4% lies between the old and new thresholds, proving changed behavior.
    result = wait(
        business.service.start_run(
            "inventory", inventory_inputs(99.84), agent_id=AGENT
        )
    )
    assert result["status"] == "completed", result
    assert set(result["outputs"]) == {"normal_report"}
    assert float(
        result["outputs"]["normal_report"]["deviation"]
    ) == pytest.approx(0.04)


def test_stale_ai_proposal_cannot_overwrite_newer_business_revision(business):
    install_inventory(business)
    business.service.save_flow("inventory", inventory_flow())
    business.service.executor.llm_service = ThresholdModel()

    async def scenario():
        base = business.service.get_flow("inventory")
        proposal = await business.service.create_proposal(
            "阈值改为5%", flow=base, agent_id=AGENT
        )
        manual = copy.deepcopy(base)
        manual["description"] = "人工更新业务解释，不得被过期提案覆盖"
        business.service.save_flow("inventory", manual)
        newer = business.service.get_flow("inventory")
        with pytest.raises(ValueError, match="revision|版本|conflict|冲突"):
            await business.service.apply_proposal_for_agent(
                proposal["proposal_id"],
                expected_revision=base["revision"],
                agent_id=AGENT,
            )
        assert business.service.get_flow("inventory") == newer
        assert (
            newer["nodes"]["condition"]["control"]["conditions"][0]["if"][
                "right"
            ]
            == 0.03
        )

    asyncio.run(scenario())
