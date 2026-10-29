# -*- coding: utf-8 -*-
"""Parameter management tools for COMSOL MCP Server."""

from typing import Optional, Union
from mcp.server.fastmcp import FastMCP

from .session import session_manager


def register_parameter_tools(mcp: FastMCP) -> None:
    """Register parameter management tools with the MCP server."""

    @mcp.tool()
    def param_get(
        name: str,
        model_name: Optional[str] = None,
        evaluate: bool = False,
    ) -> dict:
        (
            "\n        Get the value of a model parameter.\n        \n    "
            "    Args:\n            name: Parameter name\n            "
            "model_name: Model name (default: current model)\n            "
            "evaluate: If True, return evaluated numerical value; if "
            "False, return expression string\n        \n        Returns:\n"
            "            Parameter value and description, or error "
            "message\n        "
        )
        model = session_manager.get_model(model_name)
        if model is None:
            return {
                "success": False,
                "error": (
                    f"Model not found: {model_name or 'no current model'}"
                ),
            }

        try:
            value = model.parameter(name, evaluate=evaluate)
            description = model.description(name)

            return {
                "success": True,
                "parameter": name,
                "value": value,
                "description": description,
                "evaluated": evaluate,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get parameter: {str(e)}",
            }

    @mcp.tool()
    def param_set(
        name: str,
        value: str,
        model_name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> dict:
        (
            "\n        Set the value of a model parameter.\n        \n        "
            "Args:\n            name: Parameter name\n            value: Param"
            'eter value (can include units, e.g., "5[V]", "1.5[mm]")\n        '
            "    model_name: Model name (default: current model)\n            "
            "description: Optional description for the parameter\n        \n  "
            "      Returns:\n            Confirmation with new value, or error"
            " message\n        "
        )
        model = session_manager.get_model(model_name)
        if model is None:
            return {
                "success": False,
                "error": (
                    f"Model not found: {model_name or 'no current model'}"
                ),
            }

        try:
            model.parameter(name, value)

            if description:
                model.description(name, description)

            return {
                "success": True,
                "parameter": name,
                "value": value,
                "description": description,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to set parameter: {str(e)}",
            }

    @mcp.tool()
    def param_list(
        model_name: Optional[str] = None,
        evaluate: bool = False,
    ) -> dict:
        (
            "\n        List all parameters in a model.\n        \n        "
            "Args:\n            model_name: Model name (default: current "
            "model)\n            evaluate: If True, return numerical "
            "values; if False, return expressions\n        \n        "
            "Returns:\n            Dictionary of all parameters with "
            "values and descriptions\n        "
        )
        model = session_manager.get_model(model_name)
        if model is None:
            return {
                "success": False,
                "error": (
                    f"Model not found: {model_name or 'no current model'}"
                ),
            }

        try:
            params = model.parameters(evaluate=evaluate)
            descriptions = model.descriptions()

            param_list = []
            for name, value in params.items():
                param_list.append(
                    {
                        "name": name,
                        "value": value,
                        "description": descriptions.get(name, ""),
                    },
                )

            return {
                "success": True,
                "parameters": param_list,
                "count": len(param_list),
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to list parameters: {str(e)}",
            }

    @mcp.tool()
    def param_sweep_setup(
        parameter_name: str,
        values: list[Union[str, float]],
        model_name: Optional[str] = None,
        study_name: Optional[str] = None,
    ) -> dict:
        (
            "\n        Set up a parametric sweep for a parameter.\n        \n "
            "       Args:\n            parameter_name: Name of the parameter t"
            "o sweep\n            values: List of parameter values to sweep th"
            "rough\n            model_name: Model name (default: current model"
            ")\n            study_name: Study to attach sweep to (default: fir"
            "st study)\n        \n        Returns:\n            Sweep configur"
            "ation confirmation, or error message\n        "
        )
        model = session_manager.get_model(model_name)
        if model is None:
            return {
                "success": False,
                "error": (
                    f"Model not found: {model_name or 'no current model'}"
                ),
            }

        try:
            studies = model.studies()
            if not studies:
                return {
                    "success": False,
                    "error": "No studies found in model.",
                }

            target_study = study_name or studies[0]
            if target_study not in studies:
                return {
                    "success": False,
                    "error": f"Study not found: {target_study}",
                }

            study_node = model / "studies" / target_study

            sweep_node = None
            try:
                sweep_node = study_node.create("ParametricSweep")
            except Exception:
                existing_features = [
                    child.name() for child in study_node.children()
                ]
                for feat in existing_features:
                    if "parametric" in feat.lower() or "sweep" in feat.lower():
                        sweep_node = study_node.child(feat)
                        break

            if sweep_node is None:
                return {
                    "success": False,
                    "error": "Could not create or find parametric sweep.",
                }

            sweep_node.property("pname", [parameter_name])
            sweep_node.property("plist", values)

            return {
                "success": True,
                "study": target_study,
                "parameter": parameter_name,
                "values": values,
                "sweep_node": sweep_node.name()
                if hasattr(
                    sweep_node,
                    "name",
                )
                else "ParametricSweep",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to set up parametric sweep: {str(e)}",
            }

    @mcp.tool()
    def param_description(
        name: str,
        text: Optional[str] = None,
        model_name: Optional[str] = None,
    ) -> dict:
        (
            "\n        Get or set the description of a parameter.\n        \n "
            "       Args:\n            name: Parameter name\n            text:"
            " New description text (if None, returns current description)\n   "
            "         model_name: Model name (default: current model)\n       "
            " \n        Returns:\n            Parameter description, or confir"
            "mation of update\n        "
        )
        model = session_manager.get_model(model_name)
        if model is None:
            return {
                "success": False,
                "error": (
                    f"Model not found: {model_name or 'no current model'}"
                ),
            }

        try:
            if text is not None:
                model.description(name, text)
                return {
                    "success": True,
                    "parameter": name,
                    "description": text,
                }
            else:
                description = model.description(name)
                return {
                    "success": True,
                    "parameter": name,
                    "description": description,
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get/set description: {str(e)}",
            }
