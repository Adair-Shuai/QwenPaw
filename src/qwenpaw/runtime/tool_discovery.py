# -*- coding: utf-8 -*-
"""Bound model-visible tools while retaining the policy-governed registry."""

from __future__ import annotations

import json
import logging
import math
import re
from collections import Counter
from copy import deepcopy
from typing import Any

from agentscope.message import TextBlock
from agentscope.permission import PermissionBehavior, PermissionDecision
from agentscope.tool import Toolkit, ToolBase, ToolChunk

logger = logging.getLogger(__name__)

_STATE_PREFIX = "qwenpaw:tool:"
_MAX_DIRECT_TOOLS = 24
_MAX_BASE_TOOLS = 16
_BASE_BYTES = 16_000
_VISIBLE_BYTES = 32_000
_MAX_RESULTS = 8
_CORE_TOOLS = (
    "CompressContext",
    "read_file",
    "write_file",
    "edit_file",
    "execute_shell_command",
    "web_search",
    "web_fetch",
    "ask_user",
    "request_user_input",
    "send_message_to_user",
    "view_image",
    "get_current_time",
    "spawn_agent",
    "send_message_to_agent",
    "wait_agent",
    "list_agents",
    "chat_with_agent",
    "compress_context",
    "skill_viewer",
)
_ALIASES = (
    (("金山", "kdocs"), "kdocs"),
    (("文档",), "document file"),
    (("文字", "word", "docx", "otl"), "word document"),
    (("表格", "table", "tables"), "table"),
    (
        (
            "电子表格",
            "智能表格",
            "excel",
            "xlsx",
            "xls",
            "ksheet",
            "spreadsheet",
            "sheet",
        ),
        "spreadsheet sheet",
    ),
    (("单元格", "cell", "cells"), "cell"),
    (("工作表", "worksheet", "worksheets"), "worksheet sheet spreadsheet"),
    (("演示", "ppt", "pptx", "presentation"), "presentation"),
    (("幻灯片", "slide", "slides"), "slide"),
    (("多维表",), "dbsheet database record"),
    (("读取", "阅读"), "read get"),
    (("查看", "获取"), "get"),
    (("列出", "列表"), "list"),
    (("打开",), "open"),
    (("创建", "新建"), "create"),
    (("添加",), "add"),
    (("写入", "修改", "更新", "编辑"), "write update edit set"),
    (("删除",), "delete remove"),
    (("搜索", "查找", "检索"), "search find"),
    (("我的", "个人", "personal"), "my personal"),
    (("名称", "文件名"), "name filename title"),
    (("正文", "全文", "内容"), "content"),
    (("空白", "blank", "empty"), "blank empty"),
    (("区域", "选区", "矩形", "range"), "range"),
    (("单位",), "unit units"),
    (("换算", "转换"), "convert conversion"),
    (("移动", "搬移"), "move"),
    (("上传",), "upload"),
    (("重命名",), "rename"),
    (("取消",), "cancel"),
    (("分享", "共享", "sharing"), "share"),
    (("依赖", "dependencies"), "dependency"),
    (("健康",), "health"),
    (("状态",), "status"),
)
_OPERATIONS = (
    (
        "read",
        (
            "read",
            "get",
            "fetch",
            "view",
            "读取",
            "阅读",
            "查询",
            "获取",
            "查看",
        ),
    ),
    ("list", ("list", "列出", "列表")),
    ("search", ("search", "find", "搜索", "查找", "检索")),
    ("create", ("create", "new", "创建", "新建")),
    (
        "write",
        (
            "write",
            "update",
            "edit",
            "set",
            "修改",
            "写入",
            "更新",
            "编辑",
            "设置",
        ),
    ),
    ("delete", ("delete", "remove", "删除", "移除")),
    ("copy", ("copy", "duplicate", "复制")),
    ("add", ("add", "insert", "添加", "插入")),
    ("move", ("move", "移动", "搬移")),
    ("upload", ("upload", "上传")),
    ("rename", ("rename", "重命名")),
    ("cancel", ("cancel", "取消")),
    ("share", ("share", "sharing", "分享", "共享")),
)
_NEGATED_OPERATION = re.compile(
    r"(?:不要|请勿|禁止|无需|不必|\bdo not\s+|\bdon't\s+)\s*(?:"
    + "|".join(
        re.escape(term) + (r"\b" if term.isascii() else "")
        for term in sorted(
            {term for _, terms in _OPERATIONS for term in terms},
            key=len,
            reverse=True,
        )
    )
    + ")",
    re.IGNORECASE,
)
_RESOURCES = (
    (
        "spreadsheet",
        (
            "电子表格",
            "智能表格",
            "工作表",
            "spreadsheet",
            "sheet",
            "worksheet",
            "worksheets",
            "excel",
            "xlsx",
            "xls",
            "ksheet",
        ),
    ),
    (
        "presentation",
        ("演示", "幻灯片", "presentation", "slide", "slides", "ppt", "pptx"),
    ),
    (
        "document",
        (
            "文档",
            "文件",
            "document",
            "documents",
            "file",
            "files",
            "word",
            "docx",
            "otl",
        ),
    ),
    ("folder", ("文件夹", "目录", "folder", "folders", "directory")),
    ("cell", ("单元格", "cell", "cells")),
)
_UNSUPPORTED = re.compile(
    r"(?:不支持|does not support|not supported|unsupported)[^\n。；;]*",
    re.IGNORECASE,
)
_FILE_FORMATS = frozenset(
    (
        "csv dbt doc docx et gif html jpeg jpg json ksheet md odt otl "
        "pdf png ppt pptx svg txt xls xlsx xml zip"
    ).split(),
)
_INSTRUCTIONS = (
    "Additional tools are available through search_tools. When the listed "
    "tools do not cover a task, search by the task or exact tool name before "
    "claiming that a capability is unavailable. Search activates matching "
    "tools for subsequent calls. Tool discovery does not grant permissions."
    " Match the requested service or application to its public tool name "
    "and parameter contract before executing."
)


def _tokens(text: str) -> Counter[str]:
    text = re.sub(r"read[_ -]?only", "readonly", text, flags=re.IGNORECASE)
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text).casefold()
    words = re.findall(r"[a-z0-9]+|[\u3400-\u9fff]+", text)
    result: Counter[str] = Counter()
    for word in words:
        if re.fullmatch(r"[\u3400-\u9fff]+", word):
            result.update(
                word
                if len(word) == 1
                else (word[i : i + 2] for i in range(len(word) - 1)),
            )
        else:
            result[word] += 1
    return result


def _schema_bytes(schema: dict) -> int:
    return len(json.dumps(schema, ensure_ascii=False).encode("utf-8"))


def _has_term(text: str, words: Counter, term: str) -> bool:
    return (
        term in text if re.search(r"[\u3400-\u9fff]", term) else term in words
    )


def _expanded_tokens(text: str) -> Counter[str]:
    words = _tokens(text)
    expanded = text
    for aliases, terms in _ALIASES:
        if any(_has_term(text, words, alias) for alias in aliases):
            expanded += " " + terms
    return _tokens(expanded)


def _operations(text: str) -> set[str]:
    words = _tokens(text)
    return {
        operation
        for operation, terms in _OPERATIONS
        if any(_has_term(text, words, term) for term in terms)
    }


def _resources(text: str) -> set[str]:
    text = text.replace("文件夹", "folder ")
    words = _tokens(text)
    return {
        resource
        for resource, terms in _RESOURCES
        if any(_has_term(text, words, term) for term in terms)
    }


class DiscoveryToolkit(Toolkit):
    """Keep exposure state in AgentState's persisted tool context.

    All calls still pass through the SDK toolkit and the existing permission
    wrappers. Saved names are resolved against the newly filtered registry on
    every request, so restoring a session cannot resurrect a removed tool.
    """

    def __init__(self, *, tools: list, skills_or_loaders=()) -> None:
        super().__init__(tools=tools, skills_or_loaders=skills_or_loaders)
        self._search = SearchTools(self)
        # Avoid replacing an integration's own tool with the same name.
        names = {tool.name for tool in tools}
        while self._search.name in names:
            self._search.name = "qwenpaw_" + self._search.name
        self.tool_groups[0].tools.append(self._search)
        self._schemas: dict[str, tuple[tuple, dict, int]] = {}
        self._index_key: tuple = ()
        self._index: dict[str, Counter] = {}
        self._parameter_index: dict[str, Counter] = {}
        self._frequency: Counter = Counter()
        self._name_terms: dict[str, Counter] = {}
        self._operations: dict[str, set] = {}
        self._resources: dict[str, set] = {}
        self._format_resources: dict[str, set] = {}
        self._unsupported: dict[str, Counter] = {}
        self._average_length = 1.0

    def _schema(self, registered) -> tuple[dict, int]:
        tool = registered.tool
        key = (
            id(tool),
            tool.description,
            json.dumps(tool.input_schema, ensure_ascii=False),
            id(registered.extended_model),
        )
        cached = self._schemas.get(tool.name)
        if cached is None or cached[0] != key:
            schema = registered.get_tool_schema()
            cached = (key, schema, _schema_bytes(schema))
            self._schemas[tool.name] = cached
        return cached[1], cached[2]

    def _base_and_active(self, available: dict, groups: list[str]):
        ordinary = [name for name in available if name != self._search.name]
        if (
            len(ordinary) <= _MAX_DIRECT_TOOLS
            and 2
            + 2 * max(len(ordinary) - 1, 0)
            + sum(self._schema(available[name])[1] for name in ordinary)
            <= _VISIBLE_BYTES
        ):
            return ordinary, []

        base = [self._search.name]
        used = 2 + self._schema(available[self._search.name])[1]
        # Include the SDK's actual skill/compression names, which vary by SDK.
        core = (self.builtin_skill_viewer.tool.name,) + _CORE_TOOLS
        for name in dict.fromkeys(core):
            if name not in available or name in base:
                continue
            size = 2 + self._schema(available[name])[1]
            if len(base) < _MAX_BASE_TOOLS and used + size <= _BASE_BYTES:
                base.append(name)
                used += size

        recent = list(
            dict.fromkeys(
                group[len(_STATE_PREFIX) :]
                for group in groups
                if group.startswith(_STATE_PREFIX)
            ),
        )
        active = []
        for name in reversed(recent):
            if name not in available or name in base:
                continue
            size = 2 + self._schema(available[name])[1]
            # One individually oversized schema remains usable when selected.
            if len(base) + len(active) >= _MAX_DIRECT_TOOLS:
                break
            if not active:
                while len(base) > 1 and used + size > _VISIBLE_BYTES:
                    removed = base.pop()
                    used -= 2 + self._schema(available[removed])[1]
            if active and used + size > _VISIBLE_BYTES:
                continue
            active.append(name)
            used += size
        return base, list(reversed(active))

    async def get_tool_schemas(self, groups=None) -> list[dict]:
        available = await self._get_available_tools(groups)
        base, active = self._base_and_active(available, groups or [])
        schemas = [
            deepcopy(self._schema(available[name])[0])
            for name in base + active
        ]
        logger.debug(
            "tool exposure registered=%d visible=%d schema_bytes=%d",
            len(available) - 1,
            len(schemas),
            2
            + 2 * max(len(schemas) - 1, 0)
            + sum(_schema_bytes(schema) for schema in schemas),
        )
        return schemas

    async def get_skill_instructions(self, activated_groups=None):
        instructions = await super().get_skill_instructions(activated_groups)
        available = await self._get_available_tools(activated_groups)
        base, _ = self._base_and_active(available, activated_groups or [])
        if self._search.name not in base:
            return instructions
        namespaces = set()
        for item in available.values():
            capability = getattr(item.tool, "_capability", None)
            server = getattr(capability, "driver_name", "")
            if server:
                namespaces.add(server)
            source = getattr(item.tool, "source_function", None)
            descriptor = getattr(source, "_tool_descriptor", None)
            owner = getattr(descriptor, "owner_plugin_id", "")
            if owner and item.tool.name.startswith(owner + "_"):
                namespaces.add(owner + "_")
        namespace_instructions = (
            "Additional tool namespaces or prefixes include "
            + ", ".join(sorted(namespaces))
            + ". For a task naming one of these services, discover its "
            "tools in that namespace."
            if namespaces
            else ""
        )
        return "\n\n".join(
            filter(
                None,
                (
                    instructions,
                    _INSTRUCTIONS.replace(
                        "search_tools",
                        self._search.name,
                    ),
                    namespace_instructions,
                ),
            ),
        )

    def _rank(self, available: dict, query: str, namespace: str) -> list[str]:
        # pylint: disable=too-many-branches,too-many-statements
        if not query:
            return []
        server_matches = {
            name
            for name, item in available.items()
            if namespace
            and namespace.casefold()
            == str(
                getattr(
                    getattr(item.tool, "_capability", None),
                    "driver_name",
                    "",
                ),
            ).casefold()
        }
        available = {
            name: item
            for name, item in available.items()
            if name != self._search.name
            and (
                not namespace
                or name in server_matches
                or (
                    not server_matches
                    and name.casefold().startswith(namespace.casefold())
                )
            )
        }
        if query in available:
            return [query]
        exact = [
            name for name in available if name.casefold() == query.casefold()
        ]
        if exact:
            return exact
        capability_matches = []
        for name, item in available.items():
            capability = getattr(item.tool, "_capability", None)
            if capability is not None and query.casefold() in (
                capability.name.casefold(),
                f"{capability.driver_name}__{capability.name}".casefold(),
            ):
                capability_matches.append(name)
        if capability_matches:
            return capability_matches
        if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_.-]*", query) and any(
            separator in query for separator in "_."
        ):
            identifier = query.replace(".", "_").casefold()
            matches = sorted(
                name
                for name in available
                if name.casefold() == identifier
                or name.casefold().endswith("__" + identifier)
            )
            # A schema identifier is also a useful exact metadata query.
            # Never substitute a different function based on token overlap.
            return matches or [
                name
                for name, item in available.items()
                if query.casefold() == item.tool.description.casefold()
                or any(
                    query.casefold()
                    in (
                        key.casefold(),
                        str(value.get("description", "")).casefold(),
                    )
                    for key, value in item.tool.input_schema.get(
                        "properties",
                        {},
                    ).items()
                    if isinstance(value, dict)
                )
            ]
        key = tuple(
            (name, self._schema(item)[0]) for name, item in available.items()
        )
        if key != self._index_key:
            self._index = {}
            self._parameter_index = {}
            self._frequency = Counter()
            self._name_terms = {}
            self._operations = {}
            self._resources = {}
            self._format_resources = {}
            self._unsupported = {}
            for name, item in available.items():
                if name == self._search.name:
                    continue
                properties = item.tool.input_schema.get("properties", {})
                parameters = " ".join(
                    f"{key} {value.get('description', '')}"
                    for key, value in properties.items()
                    if isinstance(value, dict)
                )
                description = item.tool.description
                unsupported = " ".join(
                    _UNSUPPORTED.findall(description + " " + parameters),
                )
                text = " ".join((name, _UNSUPPORTED.sub("", description)))
                terms = _expanded_tokens(text)
                self._index[name] = terms
                self._parameter_index[name] = _expanded_tokens(parameters)
                self._name_terms[name] = _tokens(name)
                heading = description.split("\n", 1)[0].split("。", 1)[0]
                self._operations[name] = _operations(name + " " + heading)
                extension = properties.get("file_extension", {})
                extension_text = json.dumps(extension, ensure_ascii=False)
                self._format_resources[name] = _resources(
                    _UNSUPPORTED.sub("", extension_text),
                )
                self._resources[name] = _resources(
                    _UNSUPPORTED.sub(
                        "",
                        name + " " + heading + " " + extension_text,
                    ),
                )
                self._unsupported[name] = _tokens(unsupported)
                self._frequency.update(terms.keys())
            self._index_key = key
            self._average_length = sum(
                sum(item.values()) for item in self._index.values()
            ) / max(len(self._index), 1)
        excluded_operations = _operations(
            " ".join(_NEGATED_OPERATION.findall(query)),
        )
        positive_query = _NEGATED_OPERATION.sub("", query)
        terms = _expanded_tokens(positive_query)
        requested_operations = _operations(positive_query)
        requested_resources = _resources(query)
        raw_terms = _tokens(query)
        scores = []
        for name, document in self._index.items():
            if (
                excluded_operations & self._operations[name]
                and not requested_operations & self._operations[name]
            ):
                continue
            if (
                raw_terms.keys()
                & self._unsupported[name].keys()
                & _FILE_FORMATS
            ):
                continue
            score = 0.0
            length = sum(document.values())
            name_terms = self._name_terms[name]
            for term in terms:
                frequency = document.get(term, 0)
                inverse = math.log(
                    1
                    + (len(self._index) - self._frequency[term] + 0.5)
                    / (self._frequency[term] + 0.5),
                )
                if frequency:
                    score += (
                        inverse
                        * frequency
                        * 2.2
                        / (
                            frequency
                            + 1.2
                            * (
                                0.25
                                + 0.75 * length / max(self._average_length, 1)
                            )
                        )
                    )
                    if term in name_terms:
                        score += 3 * inverse
                elif term in self._parameter_index[name]:
                    # Long parameter contracts remain searchable without
                    # overwhelming the tool's name and task description.
                    score += 0.2 * inverse
            if query.casefold() == name.casefold():
                score += 100
            elif query.casefold() in name.casefold():
                score += 20
            matching_operations = requested_operations & self._operations[name]
            if score and requested_operations:
                score *= 1 + 2 * len(matching_operations)
                if requested_operations & name_terms.keys():
                    score *= 2
            if score and requested_resources:
                score *= (
                    1 + 4 * len(requested_resources & self._resources[name])
                ) / (1 + 4 * len(requested_resources))
                if (
                    "create" in requested_operations
                    and requested_operations <= {"create", "write"}
                ):
                    score *= 1 + 3 * len(
                        requested_resources & self._format_resources[name],
                    )
            if score > 0:
                scores.append((-score, name))
        return [name for _, name in sorted(scores)]

    async def search(self, query, namespace, limit, state) -> dict:
        available = await self._get_available_tools(
            state.tool_context.activated_groups,
        )
        names = self._rank(available, query.strip(), namespace.strip())[:limit]
        previous = state.tool_context.activated_groups
        retained = [
            group
            for group in previous
            if not group.startswith(_STATE_PREFIX)
            or group[len(_STATE_PREFIX) :] not in names
        ]
        # The most relevant new result gets first claim on the schema budget.
        proposed = retained + [
            _STATE_PREFIX + name for name in reversed(names)
        ]
        base, active = self._base_and_active(available, proposed)
        state.tool_context.activated_groups = [
            group for group in previous if not group.startswith(_STATE_PREFIX)
        ] + [_STATE_PREFIX + name for name in active]
        visible = set(base + active)
        return {
            "tools": [
                {
                    "name": name,
                    "description": available[name].tool.description[:500],
                    "activated": name in visible,
                }
                for name in names
            ],
            "instruction": (
                "Activated tools are available in the next model step. "
                "Check each candidate's full description and parameter "
                "contract against the task before calling it. "
                "Narrow the query or use an exact name for other tools."
            ),
        }


class SearchTools(ToolBase):
    """Pure host metadata lookup with state injection."""

    name = "search_tools"
    description = (
        "Find and activate additional tools by task, exact name, "
        "or capability. "
        "Search in Chinese or English, e.g. 金山文档读取, "
        "spreadsheet cells, "
        "or create presentation. Returns a bounded set of matches, whose "
        "full parameter definitions become available on the next step."
    )
    input_schema = {
        "type": "object",
        "properties": {
            "query": {"type": "string", "minLength": 1},
            "namespace": {
                "type": "string",
                "default": "",
                "description": "Optional server or tool-name prefix.",
            },
            "limit": {
                "type": "integer",
                "minimum": 1,
                "maximum": _MAX_RESULTS,
                "default": 5,
            },
        },
        "required": ["query"],
    }
    is_concurrency_safe = False
    is_read_only = True
    is_state_injected = True

    def __init__(self, toolkit: DiscoveryToolkit) -> None:
        super().__init__()
        self.toolkit = toolkit

    async def check_permissions(self, *_args, **_kwargs):
        return PermissionDecision(
            behavior=PermissionBehavior.ALLOW,
            message="Host tool metadata discovery is read-only.",
        )

    async def __call__(
        self,
        query: str,
        namespace: str = "",
        limit: int = 5,
        _agent_state: Any = None,
    ) -> ToolChunk:
        result = await self.toolkit.search(
            query,
            namespace,
            max(1, min(limit, _MAX_RESULTS)),
            _agent_state,
        )
        return ToolChunk(
            content=[
                TextBlock(
                    type="text",
                    text=json.dumps(result, ensure_ascii=False),
                ),
            ],
        )
