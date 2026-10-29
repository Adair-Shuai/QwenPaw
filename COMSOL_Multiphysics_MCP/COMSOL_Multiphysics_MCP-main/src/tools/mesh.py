# -*- coding: utf-8 -*-
"""Mesh tools for COMSOL MCP Server."""

from typing import Optional
from mcp.server.fastmcp import FastMCP

from .session import session_manager


def register_mesh_tools(mcp: FastMCP) -> None:
    """Register mesh tools with the MCP server."""

    @mcp.tool()
    def mesh_list(model_name: Optional[str] = None) -> dict:
        (
            "\n        List all mesh sequences in a model.\n        \n        "
            "Args:\n            model_name: Model name (default: current model"
            ")\n        \n        Returns:\n            List of mesh sequence "
            "names\n        "
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
            meshes = model.meshes()
            return {
                "success": True,
                "meshes": meshes,
                "count": len(meshes),
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to list meshes: {str(e)}",
            }

    @mcp.tool()
    def mesh_create(
        mesh_name: Optional[str] = None,
        model_name: Optional[str] = None,
    ) -> dict:
        (
            "\n        Run a mesh sequence to generate the mesh.\n        \n  "
            "      This executes the meshing operations defined in the mesh se"
            "quence.\n        \n        Args:\n            mesh_name: Mesh seq"
            "uence name (default: run all mesh sequences)\n            model_n"
            "ame: Model name (default: current model)\n        \n        Retur"
            "ns:\n            Mesh generation status\n        "
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
            model.mesh(mesh_name)
            return {
                "success": True,
                "mesh": mesh_name,
                "message": f"Mesh created: {mesh_name or 'all meshes'}",
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create mesh: {str(e)}",
            }

    @mcp.tool()
    def mesh_info(
        mesh_name: Optional[str] = None,
        model_name: Optional[str] = None,
    ) -> dict:
        (
            "\n        Get information about a mesh.\n        \n        Args:"
            "\n            mesh_name: Mesh sequence name (default: first mesh)"
            "\n            model_name: Model name (default: current model)\n  "
            "      \n        Returns:\n            Mesh statistics including e"
            "lement counts\n        "
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
            meshes = model.meshes()
            if not meshes:
                return {
                    "success": False,
                    "error": "No meshes defined in model.",
                }

            target = mesh_name or meshes[0]
            if target not in meshes:
                return {"success": False, "error": f"Mesh not found: {target}"}

            mesh_node = model / "meshes" / target

            info = {
                "name": target,
            }

            try:
                java_mesh = mesh_node.java
                if hasattr(java_mesh, "getVertex"):
                    info["num_vertices"] = java_mesh.getVertex().size()
                if hasattr(java_mesh, "getElement"):
                    info["num_elements"] = java_mesh.getElement().size()
            except Exception:
                pass

            try:
                children = [child.name() for child in mesh_node.children()]
                info["features"] = children
            except Exception:
                pass

            return {
                "success": True,
                "mesh": info,
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to get mesh info: {str(e)}",
            }
