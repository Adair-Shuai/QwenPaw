/**
 * Computation engine types, API, card, and section components.
 */

import { getHost, apiUrl, apiFetch } from "../core/runtime";
import { PRIMARY_BTN_STYLE, PageHeader } from "../core/shared";

// ─── Computation Engine Types & Helpers ───────────────────────────────────────

export interface EngineInfo {
  id: string;
  name: string;
  vendor: string;
  version: string;
  executable_path: string;
  install_dir: string;
  category: string;
  description: string;
  invocation_hint: string;
  license_server: string;
  extra_paths: string[];
  status: "configured" | "detected" | "not_found" | "error";
  is_default: boolean;
  is_custom: boolean;
  // Detected sub-modules (e.g. CMG IMEX/GEM/STARS/Builder/Results)
  modules?: string[];
  // Map of module name → executable path
  module_paths?: Record<string, string>;
}

export const CATEGORY_LABELS: Record<string, string> = {
  reservoir_simulation: "油藏数值模拟",
  geological_modeling: "地质建模",
  well_log_analysis: "测井分析",
  production_engineering: "采油工程",
  post_processing: "后处理与可视化",
  multiphysics: "多物理场仿真",
};

export const CATEGORY_ICONS: Record<string, string> = {
  reservoir_simulation: "🛢️",
  geological_modeling: "🏔️",
  well_log_analysis: "📡",
  production_engineering: "⚙️",
  post_processing: "📊",
  multiphysics: "🔬",
};

// Engine IDs that have custom PNG icons in engine/icons/
export const ENGINE_ICON_IDS = new Set(["cmg", "comsol", "tnavigator", "eclipse", "intersect","visage"]);

export function getEngineIconUrl(engineId: string): string {
  return apiUrl(`/ugsci/engines/icon/${encodeURIComponent(engineId)}`);
}

export async function fetchEngines(): Promise<{ engines: EngineInfo[] }> {
  return apiFetch<{ engines: EngineInfo[] }>("/ugsci/engines/list");
}

export async function fetchEngine(engineId: string): Promise<EngineInfo> {
  return apiFetch<EngineInfo>(`/ugsci/engines/${encodeURIComponent(engineId)}`);
}

export async function addEngine(data: Partial<EngineInfo>): Promise<EngineInfo> {
  return apiFetch<EngineInfo>("/ugsci/engines/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEngine(
  engineId: string,
  data: Partial<EngineInfo>,
): Promise<EngineInfo> {
  return apiFetch<EngineInfo>(`/ugsci/engines/${encodeURIComponent(engineId)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEngine(engineId: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(
    `/ugsci/engines/${encodeURIComponent(engineId)}`,
    { method: "DELETE" },
  );
}

export async function detectEngines(): Promise<{ engines: EngineInfo[] }> {
  return apiFetch<{ engines: EngineInfo[] }>("/ugsci/engines/detect/refresh", {
    method: "POST",
  });
}

// ─── Engine Card ──────────────────────────────────────────────────────────────

export function EngineCard({
  engine,
  onClick,
}: {
  engine: EngineInfo;
  onClick: () => void;
}) {
  const React = getHost().React;
  const { Card, Tag, Typography } = getHost().antd;
  const { Text } = Typography;

  const isDetected = engine.status === "detected";
  const icon = CATEGORY_ICONS[engine.category] || "📦";
  const hasCustomIcon = ENGINE_ICON_IDS.has(engine.id);
  const iconElement = hasCustomIcon
    ? React.createElement("img", {
        src: getEngineIconUrl(engine.id),
        alt: engine.name,
        style: { width: 24, height: 24, objectFit: "contain" },
      })
    : React.createElement("span", { style: { fontSize: 20 } }, icon);

  return React.createElement(
    Card,
    {
      hoverable: true,
      onClick,
      size: "small",
      style: {
        cursor: "pointer",
        borderColor: isDetected ? undefined : "#d9d9d9",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      },
      styles: {
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flex: 1,
        },
      },
    },
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        },
      },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8 } },
        iconElement,
        React.createElement(
          "div",
          null,
          React.createElement(
            Text,
            { strong: true, style: { fontSize: 14 } },
            engine.name,
          ),
          React.createElement("br"),
          React.createElement(
            Text,
            { type: "secondary", style: { fontSize: 11 } },
            engine.vendor || "—",
          ),
        ),
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" } },
        isDetected
          ? React.createElement(
              Tag,
              { color: "success", style: { fontSize: 11 } },
              "✅ 已检测",
            )
          : engine.executable_path
            ? React.createElement(
                Tag,
                { color: "warning", style: { fontSize: 11 } },
                "⚠ 路径无效",
              )
            : React.createElement(
                Tag,
                { style: { fontSize: 11 } },
                "🔧 待配置",
              ),
        engine.is_default
          ? React.createElement(
              Tag,
              { color: "blue", style: { fontSize: 10 } },
              "默认",
            )
          : engine.is_custom
            ? React.createElement(
                Tag,
                { color: "purple", style: { fontSize: 10 } },
                "自定义",
              )
            : null,
      ),
    ),
    React.createElement(
      "div",
      { style: { flex: 1, minHeight: 32 } },
      React.createElement(
        Text,
        { type: "secondary", style: { fontSize: 12 } },
        engine.description || "暂无描述",
      ),
    ),
    React.createElement(
      "div",
      {
        style: {
          marginTop: 8,
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
        },
      },
      engine.category
        ? React.createElement(
            Tag,
            { style: { fontSize: 11 } },
            CATEGORY_LABELS[engine.category] || engine.category,
          )
        : null,
      engine.version
        ? React.createElement(
            Tag,
            { color: "blue", style: { fontSize: 11 } },
            `v${engine.version}`,
          )
        : null,
      // Display detected modules (e.g. IMEX, GEM, STARS)
      ...(engine.modules || []).map((mod) =>
        React.createElement(
          Tag,
          { key: mod, color: "cyan", style: { fontSize: 10 } },
          mod,
        ),
      ),
    ),
  );
}

// ─── Engine Section ───────────────────────────────────────────────────────────

export function EngineSection() {
  const React = getHost().React;
  const { useState, useEffect, useCallback, useMemo } = React;
  const {
    Spin,
    Empty,
    Button,
    message: antdMsg,
    Row,
    Col,
    Drawer,
    Descriptions,
    Tag,
    Typography,
    Modal,
    Input,
    Select,
    Popconfirm,
    Space,
  } = getHost().antd;
  const {
    ReloadOutlined,
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CopyOutlined,
    ExperimentOutlined,
  } = getHost().antdIcons || {};
  const { Text, Paragraph } = Typography;

  const [engines, setEngines] = useState<EngineInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeEngine, setActiveEngine] = useState<EngineInfo | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEngine, setEditingEngine] = useState<EngineInfo | null>(null);
  const [formData, setFormData] = useState<Partial<EngineInfo>>({});
  const [saving, setSaving] = useState(false);

  const loadEngines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEngines();
      setEngines(data.engines || []);
    } catch (err: any) {
      antdMsg.error(err.message || "加载引擎列表失败");
      setEngines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEngines();
  }, [loadEngines]);

  const filteredEngines = useMemo(() => {
    if (!searchText.trim()) return engines;
    const q = searchText.toLowerCase();
    return engines.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.vendor.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q),
    );
  }, [engines, searchText]);

  const detectedCount = engines.filter((e) => e.status === "detected").length;

  const handleCopyPath = useCallback((path: string) => {
    navigator.clipboard
      .writeText(path)
      .then(() => antdMsg.success("路径已复制"))
      .catch(() => antdMsg.error("复制失败"));
  }, []);

  const openAddModal = useCallback(() => {
    setEditingEngine(null);
    setFormData({
      name: "",
      vendor: "",
      version: "",
      executable_path: "",
      category: "",
      description: "",
      invocation_hint: "",
    });
    setEditModalOpen(true);
  }, []);

  const openEditModal = useCallback((engine: EngineInfo) => {
    setEditingEngine(engine);
    setFormData({ ...engine });
    setEditModalOpen(true);
    setDrawerOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.name?.trim()) {
      antdMsg.warning("请输入引擎名称");
      return;
    }
    setSaving(true);
    try {
      if (editingEngine) {
        await updateEngine(editingEngine.id, formData);
        antdMsg.success("引擎已更新");
      } else {
        await addEngine(formData);
        antdMsg.success("引擎已添加");
      }
      setEditModalOpen(false);
      loadEngines();
    } catch (err: any) {
      antdMsg.error(err.message || "保存失败");
    } finally {
      setSaving(false);
    }
  }, [formData, editingEngine, loadEngines]);

  const handleDelete = useCallback(
    async (engineId: string) => {
      try {
        await deleteEngine(engineId);
        antdMsg.success("引擎已删除");
        setDrawerOpen(false);
        loadEngines();
      } catch (err: any) {
        antdMsg.error(err.message || "删除失败");
      }
    },
    [loadEngines],
  );

  const handleDetect = useCallback(async () => {
    setLoading(true);
    try {
      const data = await detectEngines();
      setEngines(data.engines || []);
      antdMsg.success("自动检测完成");
    } catch (err: any) {
      antdMsg.error(err.message || "检测失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // Form field helper
  const formField = useCallback(
    (label: string, key: keyof EngineInfo, opts?: { textarea?: boolean; select?: { options: { label: string; value: string }[] } }) => {
      const value = (formData[key] as string) || "";
      return React.createElement(
        "div",
        { style: { marginBottom: 12 } },
        React.createElement(
          Text,
          { style: { fontSize: 13, display: "block", marginBottom: 4 } },
          label,
        ),
        opts?.select
          ? React.createElement(Select, {
              value: value || undefined,
              onChange: (v: string) =>
                setFormData((prev: any) => ({ ...prev, [key]: v })),
              style: { width: "100%" },
              options: opts.select.options,
              allowClear: true,
              placeholder: `选择${label}`,
            })
          : opts?.textarea
            ? React.createElement(Input.TextArea, {
                value,
                onChange: (e: any) =>
                  setFormData((prev: any) => ({ ...prev, [key]: e.target.value })),
                rows: 3,
                placeholder: `输入${label}`,
              })
            : React.createElement(Input, {
                value,
                onChange: (e: any) =>
                  setFormData((prev: any) => ({ ...prev, [key]: e.target.value })),
                placeholder: `输入${label}`,
              }),
      );
    },
    [formData],
  );

  return React.createElement(
    "div",
    null,
    // Action bar
    React.createElement(
      "div",
      {
        style: {
          marginBottom: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        },
      },
      React.createElement(Input, {
        placeholder: "搜索引擎名称、厂商...",
        prefix: SearchOutlined
          ? React.createElement(SearchOutlined)
          : undefined,
        value: searchText,
        onChange: (e: any) => setSearchText(e.target.value),
        allowClear: true,
        style: { maxWidth: 280 },
      }),
      React.createElement(
        Button,
        {
          icon: ReloadOutlined
            ? React.createElement(ReloadOutlined)
            : undefined,
          onClick: handleDetect,
          loading,
        },
        "自动检测",
      ),
      React.createElement(
        Button,
        {
          type: "primary",
          icon: PlusOutlined
            ? React.createElement(PlusOutlined)
            : undefined,
          onClick: openAddModal,
          style: PRIMARY_BTN_STYLE,
        },
        "添加引擎",
      ),
    ),
    // Content
    loading
      ? React.createElement(
          "div",
          { style: { textAlign: "center", padding: 60 } },
          React.createElement(Spin, {
            size: "large",
            tip: "正在加载计算引擎...",
          }),
        )
      : filteredEngines.length === 0
        ? React.createElement(Empty, {
            description: searchText ? "无匹配引擎" : "暂无引擎，点击「添加引擎」开始",
          })
        : React.createElement(
            Row,
            { gutter: [12, 12], align: "stretch" },
            ...filteredEngines.map((engine) =>
              React.createElement(
                Col,
                {
                  key: engine.id,
                  xs: 24,
                  sm: 12,
                  md: 8,
                  lg: 6,
                  style: { display: "flex" },
                },
                React.createElement(EngineCard, {
                  engine,
                  onClick: () => {
                    setActiveEngine(engine);
                    setDrawerOpen(true);
                  },
                }),
              ),
            ),
          ),
    // Detail drawer
    activeEngine
      ? React.createElement(
          Drawer,
          {
            title: React.createElement(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 8 } },
              React.createElement(
                "span",
                { style: { display: "flex", alignItems: "center" } },
                ENGINE_ICON_IDS.has(activeEngine.id)
                  ? React.createElement("img", {
                      src: getEngineIconUrl(activeEngine.id),
                      alt: activeEngine.name,
                      style: { width: 20, height: 20, objectFit: "contain" },
                    })
                  : React.createElement(
                      "span",
                      { style: { fontSize: 18 } },
                      CATEGORY_ICONS[activeEngine.category] || "📦",
                    ),
              ),
              React.createElement("span", null, activeEngine.name),
            ),
            open: drawerOpen,
            onClose: () => setDrawerOpen(false),
            width: 520,
            extra: React.createElement(
              Space,
              null,
              React.createElement(
                Button,
                {
                  size: "small",
                  icon: EditOutlined
                    ? React.createElement(EditOutlined)
                    : undefined,
                  onClick: () => openEditModal(activeEngine),
                },
                "编辑",
              ),
              !activeEngine.is_default
                ? React.createElement(
                    Popconfirm,
                    {
                      title: "确认删除此引擎？",
                      description: activeEngine.name,
                      onConfirm: () => handleDelete(activeEngine.id),
                      okText: "删除",
                      cancelText: "取消",
                      okButtonProps: { danger: true },
                    },
                    React.createElement(
                      Button,
                      {
                        size: "small",
                        danger: true,
                        icon: DeleteOutlined
                          ? React.createElement(DeleteOutlined)
                          : undefined,
                      },
                      "删除",
                    ),
                  )
                : null,
            ),
          },
          React.createElement(
            Descriptions,
            { column: 1, bordered: true, size: "small" },
            React.createElement(
              Descriptions.Item,
              { label: "引擎名称" },
              activeEngine.name,
            ),
            React.createElement(
              Descriptions.Item,
              { label: "厂商" },
              activeEngine.vendor || "—",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "分类" },
              activeEngine.category
                ? CATEGORY_LABELS[activeEngine.category] || activeEngine.category
                : "—",
            ),
            React.createElement(
              Descriptions.Item,
              { label: "状态" },
              React.createElement(
                Tag,
                {
                  color:
                    activeEngine.status === "detected"
                      ? "success"
                      : activeEngine.status === "not_found"
                        ? "error"
                        : "default",
                },
                activeEngine.status === "detected"
                  ? "✅ 已检测"
                  : activeEngine.status === "not_found"
                    ? "❌ 路径无效"
                    : "🔧 待配置",
              ),
            ),
            React.createElement(
              Descriptions.Item,
              { label: "版本" },
              activeEngine.version || "—",
            ),
            activeEngine.executable_path
              ? React.createElement(
                  Descriptions.Item,
                  { label: "可执行文件" },
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      },
                    },
                    React.createElement(
                      "code",
                      {
                        style: {
                          fontSize: 12,
                          wordBreak: "break-all",
                        },
                      },
                      activeEngine.executable_path,
                    ),
                    React.createElement(
                      Button,
                      {
                        size: "small",
                        type: "text",
                        icon: CopyOutlined
                          ? React.createElement(CopyOutlined)
                          : undefined,
                        onClick: () =>
                          handleCopyPath(activeEngine.executable_path),
                      },
                    ),
                  ),
                )
              : null,
            activeEngine.install_dir
              ? React.createElement(
                  Descriptions.Item,
                  { label: "安装目录" },
                  React.createElement(
                    "code",
                    { style: { fontSize: 12, wordBreak: "break-all" } },
                    activeEngine.install_dir,
                  ),
                )
              : null,
            // Display detected modules with paths
            activeEngine.modules && activeEngine.modules.length > 0
              ? React.createElement(
                  Descriptions.Item,
                  { label: "已检测模块" },
                  React.createElement(
                    "div",
                    { style: { display: "flex", flexDirection: "column", gap: 4 } },
                    ...activeEngine.modules.map((mod) =>
                      React.createElement(
                        "div",
                        {
                          key: mod,
                          style: { display: "flex", alignItems: "center", gap: 8 },
                        },
                        React.createElement(
                          Tag,
                          { color: "cyan", style: { fontSize: 11 } },
                          mod,
                        ),
                        activeEngine.module_paths && activeEngine.module_paths[mod]
                          ? React.createElement(
                              "code",
                              { style: { fontSize: 11, wordBreak: "break-all" } },
                              activeEngine.module_paths[mod],
                            )
                          : null,
                      ),
                    ),
                  ),
                )
              : null,
            activeEngine.license_server
              ? React.createElement(
                  Descriptions.Item,
                  { label: "许可证服务器" },
                  activeEngine.license_server,
                )
              : null,
            React.createElement(
              Descriptions.Item,
              { label: "描述" },
              activeEngine.description || "—",
            ),
          ),
          // Invocation hint
          activeEngine.invocation_hint
            ? React.createElement(
                "div",
                {
                  style: {
                    marginTop: 16,
                    padding: 12,
                    background: "#e6f4ff",
                    borderRadius: 8,
                  },
                },
                React.createElement(
                  Text,
                  { strong: true, style: { fontSize: 13 } },
                  "💡 调用方式",
                ),
                React.createElement(
                  "div",
                  { style: { marginTop: 8, fontSize: 13, lineHeight: 1.6 } },
                  activeEngine.invocation_hint,
                ),
              )
            : null,
          // Type badge
          React.createElement(
            "div",
            { style: { marginTop: 12 } },
            activeEngine.is_default
              ? React.createElement(
                  Tag,
                  { color: "blue" },
                  "默认引擎",
                )
              : activeEngine.is_custom
                ? React.createElement(
                    Tag,
                    { color: "purple" },
                    "自定义引擎",
                  )
                : null,
          ),
        )
      : null,
    // Add/Edit modal
    React.createElement(
      Modal,
      {
        title: editingEngine ? "编辑引擎" : "添加计算引擎",
        open: editModalOpen,
        onOk: handleSave,
        onCancel: () => setEditModalOpen(false),
        okText: editingEngine ? "保存" : "添加",
        cancelText: "取消",
        confirmLoading: saving,
        width: 560,
      },
      React.createElement(
        "div",
        { style: { maxHeight: 480, overflow: "auto", paddingRight: 8 } },
        formField("引擎名称 *", "name"),
        formField("厂商", "vendor"),
        formField("版本", "version"),
        formField("可执行文件路径", "executable_path"),
        formField("安装目录", "install_dir"),
        formField("分类", "category", {
          select: {
            options: Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              label,
              value,
            })),
          },
        }),
        formField("描述", "description", { textarea: true }),
        formField("调用方式提示", "invocation_hint", { textarea: true }),
        formField("许可证服务器", "license_server"),
      ),
    ),
  );
}

