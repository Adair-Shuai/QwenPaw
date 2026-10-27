# -*- coding: utf-8 -*-
"""Public execution and durable scheduling contracts for both bundles."""

import asyncio
import importlib

import pytest


pytestmark = pytest.mark.parametrize(
    "namespace",
    [
        "plugins.bundle.flowforge.engine",
        "qwenpaw.plugins_bundle.flowforge.engine",
    ],
)


@pytest.mark.parametrize("mode", ["mute", "bypass"])
def test_executor_retains_passthrough_without_tool_side_effect(
    namespace,
    mode,
):
    engine = importlib.import_module(namespace)
    calls = []
    definition = {
        "id": "passthrough-contract",
        "nodes": {
            "source": {
                "class_type": "ToolNode",
                "inputs": {"tool_name": "source", "args": {}},
            },
            "muted": {
                "class_type": "ToolNode",
                "inputs": {
                    "tool_name": ["source", 0],
                    "args": {},
                },
                "control": {"mode": mode},
            },
            "out": {
                "class_type": "OutputNode",
                "inputs": {"value": ["muted", 0]},
            },
        },
        "outputs": ["out"],
    }
    executor = engine.WorkflowExecutor(
        tool_registry={
            "source": lambda: 0,
            "unused": lambda: calls.append("unwanted"),
        },
    )
    result = asyncio.run(executor.execute(definition))
    assert result.status == engine.WorkflowStatus.COMPLETED
    assert result.outputs == {"out": 0}
    assert not calls
    assert [entry.node_id for entry in result.execution_history] == [
        "source",
        "muted",
        "out",
    ]


@pytest.mark.parametrize("supplied", [{}, {"pressure": 0}, {"pressure": 2}])
def test_executor_retains_input_defaults_and_metadata(namespace, supplied):
    engine = importlib.import_module(namespace)
    store_module = importlib.import_module(f"{namespace}.state_store")

    async def scenario():
        store = store_module.InMemoryWorkflowStateStore()
        executor = engine.WorkflowExecutor(state_store=store)
        document = engine.load(
            {
                "id": "defaults-contract",
                "inputs": [
                    {
                        "name": "pressure",
                        "type": "number",
                        "default": 7,
                        "minimum": 0,
                    },
                ],
                "nodes": {
                    "out": {
                        "class_type": "OutputNode",
                        "inputs": {"value": "${inputs.pressure}"},
                    },
                },
                "outputs": ["out"],
                "metadata": {"label": "document", "prompt_id": "ignored"},
            },
        )
        result = await executor.execute_async(
            document,
            supplied,
            prompt_id="contract-prompt",
            extra_data={"label": "caller", "zero": 0, "absent": None},
        )
        snapshot = await store.load(result.state_id)
        assert snapshot is not None
        assert snapshot.state.inputs == {
            "pressure": supplied.get("pressure", 7),
        }
        assert snapshot.state.metadata["label"] == "document"
        assert snapshot.state.metadata["zero"] == 0
        assert "absent" not in snapshot.state.metadata
        assert snapshot.state.metadata["prompt_id"] == "contract-prompt"
        assert snapshot.dynamic_prompt == document.nodes
        assert snapshot.blocked_nodes == []
        assert snapshot.state.metadata["scheduler_checkpoint"] == {
            "completed": ["out"],
            "skipped": [],
            "active_successors": {},
            "pruned_edges": [],
        }
        assert result.status == engine.WorkflowStatus.COMPLETED
        assert result.outputs == {"out": supplied.get("pressure", 7)}

    asyncio.run(scenario())


def test_graph_snapshot_and_reopen_keep_visible_nodes_and_branches(namespace):
    graph = importlib.import_module(f"{namespace}.graph")
    first = {"class_type": "InputNode", "inputs": {}}
    prompt = graph.DynamicPrompt({"empty": {}, "first": first})
    frame = graph.ExpandFrame(
        parent_id="first",
        call_idx=0,
        nodes={"child": {"class_type": "OutputNode"}, "empty": {}},
    )
    added = prompt.add_expanded(frame)
    assert prompt.ephemeral_ids == tuple(added)
    assert prompt.snapshot_nodes() == {
        "empty": {},
        "first": first,
        "first:0:child": {"class_type": "OutputNode"},
    }
    assert prompt.snapshot_nodes()["first"] is first
    detached = prompt.snapshot_nodes()
    detached.pop("first")
    assert prompt.get("first") is first
    prompt.remove(added[0])
    assert prompt.ephemeral_ids == (added[1],)
    assert prompt.parent_of(added[0]) is None
    topo = graph.TopologicalSort(prompt)
    topo.set_active_successors("first", ["z", "a"])
    topo.set_active_successors("empty", [])
    topo.prune("first", ["omitted"])
    snapshot = topo.active_successors_snapshot()
    assert snapshot == {"first": ["a", "z"], "empty": []}
    snapshot["first"].append("unwanted")
    assert topo.successors_of("first") == {"a", "z"}
    topo.clear_branch("first")
    assert topo.active_successors_snapshot() == {"empty": []}
    assert topo.successors_of("first") == set()
    topo.clear_branch("missing")


@pytest.mark.parametrize("supplied", [{"pressure": -1}, {"pressure": "2"}])
def test_executor_rejects_invalid_input_before_execution(namespace, supplied):
    engine = importlib.import_module(namespace)
    errors = importlib.import_module(f"{namespace}.errors")
    calls = []
    executor = engine.WorkflowExecutor(
        tool_registry={"effect": lambda: calls.append(True)},
    )
    document = {
        "id": "invalid-input-contract",
        "inputs": [
            {"name": "pressure", "type": "number", "minimum": 0},
        ],
        "nodes": {
            "effect": {
                "class_type": "ToolNode",
                "inputs": {"tool_name": "effect", "args": {}},
            },
        },
        "outputs": ["effect"],
    }
    with pytest.raises(errors.ValidationError, match="inputs are invalid"):
        asyncio.run(executor.execute(document, supplied))
    assert not calls


def test_executor_restart_retains_siblings_and_review_guards(
    namespace,
    tmp_path,
):
    engine = importlib.import_module(namespace)
    stores = importlib.import_module(f"{namespace}.state_store")
    calls = []
    document = engine.load(
        {
            "id": "restart-contract",
            "nodes": {
                "review": {
                    "class_type": "HumanReviewNode",
                    "inputs": {"reviewer": "operator"},
                },
                "effect": {
                    "class_type": "ToolNode",
                    "inputs": {"tool_name": "effect", "args": {}},
                },
            },
            "outputs": ["review", "effect"],
        },
    )

    async def scenario():
        executor = engine.WorkflowExecutor(
            tool_registry={"effect": lambda: calls.append(True) or "saved"},
            state_store=stores.JsonWorkflowStateStore(tmp_path),
        )
        paused = await executor.execute(document)
        assert paused.status == engine.WorkflowStatus.WAITING_HUMAN
        snapshot = await executor.state_store.load(paused.state_id)
        assert snapshot is not None
        assert snapshot.blocked_nodes == ["review"]
        assert snapshot.state.metadata["scheduler_checkpoint"][
            "completed"
        ] == ["effect"]
        assert snapshot.dynamic_prompt == document.nodes
        restarted = engine.WorkflowExecutor(
            tool_registry={"effect": lambda: calls.append(True) or "saved"},
            state_store=stores.JsonWorkflowStateStore(tmp_path),
        )
        with pytest.raises(ValueError, match="does not identify"):
            await restarted.resume(
                document,
                paused.state_id,
                {"node_id": "missing", "approved": True},
            )
        with pytest.raises(ValueError, match="boolean approved"):
            await restarted.resume(
                document,
                paused.state_id,
                {"approved": 1},
            )
        result = await restarted.resume(
            document,
            paused.state_id,
            {"approved": True},
        )
        assert result.status == engine.WorkflowStatus.COMPLETED
        assert result.outputs["effect"] == "saved"
        assert result.outputs["review"]["approved"] is True
        assert calls == [True]
        assert (
            sum(
                entry.node_id == "effect" for entry in result.execution_history
            )
            == 1
        )
        with pytest.raises(ValueError, match="only paused"):
            await restarted.resume(
                document,
                paused.state_id,
                {"approved": True},
            )

    asyncio.run(scenario())
