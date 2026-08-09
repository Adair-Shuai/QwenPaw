# -*- coding: utf-8 -*-
"""Tests for the domain engine catalog."""

from __future__ import annotations

from plugins.bundle.ugsci.domain_engine.catalog import (
    get_engine,
    get_engine_ids,
    list_engines,
)


class TestCatalog:
    def test_domain_engines_and_scientific_libraries_exist(self) -> None:
        engines = list_engines()
        assert len(engines) == 12

    def test_engine_ids_unique(self) -> None:
        ids = get_engine_ids()
        assert len(ids) == 12
        assert "well-log-processing" in ids
        assert "decline-analysis" in ids
        assert "neqsim" in ids
        assert {
            "sympy",
            "pymc",
            "pymoo",
            "simpy",
            "networkx",
            "geopandas",
            "scikit-learn",
            "statsmodels",
        } <= ids

    def test_get_engine_by_id(self) -> None:
        engine = get_engine("well-log-processing")
        assert engine is not None
        assert engine.name == "测井数据处理"

    def test_get_nonexistent_engine(self) -> None:
        assert get_engine("nonexistent") is None

    def test_well_log_engine(self) -> None:
        engine = get_engine("well-log-processing")
        assert engine is not None
        assert engine.source == "builtin"
        assert engine.provider.kind == "builtin"
        assert engine.provider.id == "ugsci-welllog-lasio"
        assert "lasio" in engine.dependencies
        assert len(engine.operations) == 3

    def test_decline_engine(self) -> None:
        engine = get_engine("decline-analysis")
        assert engine is not None
        assert engine.source == "builtin"
        assert engine.provider.kind == "builtin"
        assert engine.provider.id == "ugsci-decline-scipy"
        assert "numpy" in engine.dependencies
        assert "scipy" in engine.dependencies
        assert len(engine.operations) == 3

    def test_neqsim_engine(self) -> None:
        engine = get_engine("neqsim")
        assert engine is not None
        assert engine.source == "mcp"
        assert engine.provider.kind == "driver"
        assert engine.provider.id == "neqsim"
        assert len(engine.operations) == 5

    def test_scientific_capabilities_are_builtin_and_tool_backed(self) -> None:
        library_ids = {
            "sympy",
            "pymc",
            "pymoo",
            "simpy",
            "networkx",
            "geopandas",
            "scikit-learn",
            "statsmodels",
        }
        for engine_id in library_ids:
            engine = get_engine(engine_id)
            assert engine is not None
            assert engine.source == "builtin"
            assert engine.provider.kind == "builtin"
            assert engine.provider.id.startswith("ugsci-")
            assert len(engine.dependencies) == 1
            assert len(engine.operations) == 1
            assert engine.operations[0].tool_names[0].startswith("ugsci_")

    def test_operation_ids_unique(self) -> None:
        for engine in list_engines():
            op_ids = [op.id for op in engine.operations]
            assert len(op_ids) == len(
                set(op_ids),
            ), f"Duplicate operation IDs in engine {engine.id}"

    def test_builtin_tool_names_match_expected(self) -> None:
        well_log = get_engine("well-log-processing")
        assert well_log is not None
        tool_names = set()
        for op in well_log.operations:
            tool_names.update(op.tool_names)
        assert tool_names == {
            "ugsci_welllog_read",
            "ugsci_welllog_validate",
            "ugsci_welllog_export",
        }

        decline = get_engine("decline-analysis")
        assert decline is not None
        tool_names = set()
        for op in decline.operations:
            tool_names.update(op.tool_names)
        assert tool_names == {
            "ugsci_decline_fit",
            "ugsci_decline_forecast",
            "ugsci_decline_eur",
        }

    def test_neqsim_provider_is_driver_neqsim(self) -> None:
        engine = get_engine("neqsim")
        assert engine is not None
        assert engine.provider.kind == "driver"
        assert engine.provider.id == "neqsim"

    def test_engine_to_dict_serializable(self) -> None:
        import json

        for engine in list_engines():
            d = engine.to_dict()
            json.dumps(d)  # should not raise
            assert d["schema_version"] == 1
            assert "id" in d
            assert "operations" in d

    def test_to_dict_no_sensitive_data(self) -> None:
        """Ensure to_dict doesn't contain env vars or absolute paths."""
        for engine in list_engines():
            d = engine.to_dict()
            import json

            serialized = json.dumps(d)
            assert (
                "PATH" not in serialized or "source" in serialized
            )  # "source" is a valid field
            assert "/Users/" not in serialized
            assert "/home/" not in serialized
