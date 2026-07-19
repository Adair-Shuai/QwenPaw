# -*- coding: utf-8 -*-
"""Tests for flowforge.engine.types — runtime models + condition evaluation.

Mirrors the LeAgent base-model tests: status enum, template resolution,
condition operators, state get/set/fork.
"""

from __future__ import annotations

import pytest

from plugins.bundle.flowforge.engine.types import (
    ConditionExpression,
    ConditionOperator,
    NodeExecutionResult,
    WorkflowResult,
    WorkflowState,
    WorkflowStatus,
)


class TestWorkflowStatus:
    def test_status_is_str_enum(self):
        assert WorkflowStatus.PENDING == "pending"
        assert WorkflowStatus.RUNNING.value == "running"
        assert WorkflowStatus.WAITING_HUMAN.value == "waiting_human"

    def test_all_terminal_states_present(self):
        terminal = {
            WorkflowStatus.COMPLETED,
            WorkflowStatus.FAILED,
            WorkflowStatus.CANCELLED,
            WorkflowStatus.TIMEOUT,
        }
        assert terminal.issubset(set(WorkflowStatus))


class TestConditionExpression:
    @pytest.mark.parametrize(
        "left,op,right,ctx,expected",
        [
            ("amount", "eq", 100, {"amount": 100}, True),
            ("amount", "eq", 100, {"amount": 200}, False),
            ("amount", "ne", 100, {"amount": 200}, True),
            ("count", "gt", 5, {"count": 10}, True),
            ("count", "gt", 5, {"count": 3}, False),
            ("count", "ge", 5, {"count": 5}, True),
            ("count", "lt", 5, {"count": 3}, True),
            ("count", "le", 5, {"count": 5}, True),
            ("name", "contains", "foo", {"name": "foobar"}, True),
            ("name", "starts_with", "foo", {"name": "foobar"}, True),
            ("name", "ends_with", "bar", {"name": "foobar"}, True),
            ("name", "matches", r"^foo", {"name": "foobar"}, True),
            ("amount", "is_null", None, {"amount": None}, True),
            ("amount", "is_not_null", None, {"amount": 0}, True),
            ("status", "in", ["ok", "good"], {"status": "ok"}, True),
            ("status", "not_in", ["ok", "good"], {"status": "bad"}, True),
        ],
    )
    def test_comparison_operators(self, left, op, right, ctx, expected):
        expr = ConditionExpression(left=left, operator=op, right=right)
        assert expr.evaluate(ctx) is expected

    def test_string_numeric_coercion(self):
        expr = ConditionExpression(left="amount", operator="gt", right="50")
        assert expr.evaluate({"amount": 100}) is True
        assert expr.evaluate({"amount": 30}) is False

    def test_template_right_value_resolves(self):
        # right = "${threshold}" → resolves against context
        expr = ConditionExpression(
            left="amount", operator="gt", right="${threshold}",
        )
        assert expr.evaluate({"amount": 100, "threshold": 50}) is True
        assert expr.evaluate({"amount": 30, "threshold": 50}) is False

    def test_and_or_not_logical(self):
        a = ConditionExpression(left="x", operator="eq", right=1)
        b = ConditionExpression(left="y", operator="eq", right=2)
        and_expr = ConditionExpression(
            left="", operator="and", conditions=[a, b],
        )
        assert and_expr.evaluate({"x": 1, "y": 2}) is True
        assert and_expr.evaluate({"x": 1, "y": 0}) is False
        or_expr = ConditionExpression(
            left="", operator="or", conditions=[a, b],
        )
        assert or_expr.evaluate({"x": 1, "y": 0}) is True
        not_expr = ConditionExpression(
            left="", operator="not", conditions=[a],
        )
        assert not_expr.evaluate({"x": 0}) is True


class TestWorkflowState:
    def test_set_and_get_variable(self):
        state = WorkflowState(workflow_id="wf")
        state.set("count", 42)
        assert state.get("count") == 42

    def test_get_with_dot_notation(self):
        state = WorkflowState(workflow_id="wf")
        state.set("user", {"name": "alice", "age": 30})
        assert state.get("user.name") == "alice"
        assert state.get("user.age") == 30

    def test_get_missing_returns_default(self):
        state = WorkflowState(workflow_id="wf")
        assert state.get("missing", "fallback") == "fallback"

    def test_resolve_template(self):
        state = WorkflowState(workflow_id="wf")
        state.set("name", "world")
        state.inputs = {"greeting": "hello"}
        assert state.resolve_template("${name}") == "world"
        assert state.resolve_template("${greeting}, ${name}!") == "hello, world!"

    def test_record_execution_stores_output(self):
        state = WorkflowState(workflow_id="wf")
        result = NodeExecutionResult(
            node_id="n1",
            status=WorkflowStatus.COMPLETED,
            output={"reply": "ok"},
        )
        state.record_execution(result)
        assert state.outputs["n1"] == {"reply": "ok"}
        assert len(state.execution_history) == 1

    def test_fork_creates_child(self):
        state = WorkflowState(workflow_id="wf")
        state.set("shared", "value")
        forked = state.fork(extra_vars={"extra": 1})
        assert forked.parent_state_id == state.id
        assert forked.id in state.child_states
        assert forked.variables["shared"] == "value"
        assert forked.variables["extra"] == 1

    def test_to_summary(self):
        state = WorkflowState(workflow_id="wf", status=WorkflowStatus.COMPLETED)
        summary = state.to_summary()
        assert summary["workflow_id"] == "wf"
        assert summary["status"] == "completed"


class TestWorkflowResult:
    def test_success_property(self):
        state = WorkflowState(workflow_id="wf")
        result = WorkflowResult(
            workflow_id="wf",
            state_id=state.id,
            status=WorkflowStatus.COMPLETED,
        )
        assert result.success is True

    def test_failure_is_not_success(self):
        state = WorkflowState(workflow_id="wf")
        result = WorkflowResult(
            workflow_id="wf",
            state_id=state.id,
            status=WorkflowStatus.FAILED,
            errors=["boom"],
        )
        assert result.success is False
