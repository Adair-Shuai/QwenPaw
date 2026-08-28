# -*- coding: utf-8 -*-
from __future__ import annotations
import asyncio
import json
import pytest
from qwenpaw.plugins_bundle.ugsci.domain.common.replay import (
    encode_replay_token,
    verify_replay_token,
)
from qwenpaw.plugins_bundle.ugsci.domain.common.unit_audit import audit_units
from qwenpaw.plugins_bundle.ugsci.domain.trace.tools import (
    ugsci_replay_calculation,
    ugsci_trace_calculation,
)

INPUTS = {
    "produced_gas": 1e9,
    "initial_pressure": 3000,
    "initial_z_factor": 0.85,
    "current_pressure": 2000,
    "current_z_factor": 0.88,
}


@pytest.fixture(autouse=True)
def replay_secret(monkeypatch):
    monkeypatch.setenv(
        "QWENPAW_UGSCI_REPLAY_SECRET",
        "test-only-replay-secret",
    )


def run(coro):
    value = asyncio.run(coro)
    return (
        json.loads(value.content[0].text)
        if hasattr(value, "content")
        else value["payload"]
    )


def test_curated_result_has_complete_trust_metadata():
    data = run(ugsci_trace_calculation("gas_material_balance_pz", INPUTS))
    audit = data["provenance"]
    assert audit["source"] == "curated"
    assert audit["reference"]
    assert audit["formula_id"] == "gas_material_balance_pz"
    assert audit["unit_audit"]["ok"] is True
    assert audit["gate"]
    assert audit["parameter_sources"]["produced_gas"]["source"] == "user_input"
    assert audit["parameter_sources"]["initial_pz"]["source"] == "derived_from"
    assert (
        verify_replay_token(audit["replay_token"])["inputs"]["produced_gas"]
        == 1e9
    )


def test_unit_audit_identifies_mismatch():
    audit = audit_units({"p": "pressure"}, {"p": 1, "pressure_unit": "scf"})
    assert audit["ok"] is False
    assert audit["per_symbol"]["p"]["ok"] is False


def test_replay_is_reproducible_and_tamper_is_rejected():
    first = run(ugsci_trace_calculation("gas_material_balance_pz", INPUTS))
    token = first["provenance"]["replay_token"]
    replayed = run(ugsci_replay_calculation(token))
    assert replayed["status"] == "reproducible"
    assert replayed["replay_id"]
    assert replayed["diff"] == {}
    broken = run(
        ugsci_replay_calculation(
            token[:-1] + ("0" if token[-1] != "0" else "1"),
        ),
    )
    assert broken["code"] == "invalid_input"


def test_replay_reports_version_change():
    first = run(ugsci_trace_calculation("gas_material_balance_pz", INPUTS))
    payload = verify_replay_token(first["provenance"]["replay_token"])
    payload["provider_version"] = "0.0.0"
    replayed = run(ugsci_replay_calculation(encode_replay_token(payload)))
    assert replayed["status"] == "version_changed"
    assert "provider_version" in replayed["diff"]


def test_token_rejects_non_curated_and_oversized():
    token = encode_replay_token({"kind": "freeform", "formula_id": "x"})
    with pytest.raises(ValueError):
        verify_replay_token(token)
    with pytest.raises(ValueError):
        verify_replay_token("x" * 40000)
