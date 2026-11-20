import { getHost, apiFetch, clearAgentCache } from "../core/runtime";
import { PRIMARY_BTN_STYLE, renderMarkdown } from "../core/shared";
import {
  fetchKnowledgeFiles,
  normalizeKnowledgeFilename,
  saveKnowledgeFile,
  updateAgentSystemPromptFiles,
  writeKnowledgeFile,
  type KnowledgeFileInfo,
} from "./expertApi";
import { DEFAULT_PROMPT_FILES } from "./expertUtils";
import { EXPERT_FILE_STYLES } from "./expertFileStyles";

interface FileDraft {
  name: string;
  content: string;
  baseline: string;
  isNew: boolean;
  loading: boolean;
  error: string;
}

const NEW_FILE = "__new_markdown__";
const FILE_PURPOSE: Record<string, string> = {
  "AGENTS.md": "行为规则与工作约定",
  "SOUL.md": "角色定位与表达风格",
  "PROFILE.md": "身份与背景资料",
  "BOOTSTRAP.md": "首次启动引导",
  "HEARTBEAT.md": "自动检查任务",
  "MEMORY.md": "长期记忆",
};

function isDirty(draft: FileDraft) {
  return draft.isNew
    ? Boolean(draft.name || draft.content)
    : draft.content !== draft.baseline;
}

export function KnowledgeBaseTab({
  agentId,
  systemPromptFiles,
  onRefresh,
  onDirtyChange,
  onEditorOpenChange,
  onSavingChange,
}: {
  agentId: string;
  systemPromptFiles: string[];
  onRefresh: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onEditorOpenChange?: (open: boolean) => void;
  onSavingChange?: (saving: boolean) => void;
}) {
  const React = getHost().React;
  const { useState, useEffect, useRef } = React;
  const {
    Button,
    Input,
    List,
    Switch,
    Tag,
    Spin,
    Empty,
    Segmented,
    Alert,
    Modal,
    message,
  } = getHost().antd;
  const [confirmModal, confirmContext] = Modal.useModal();
  const [files, setFiles] = useState<KnowledgeFileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [enabledFiles, setEnabledFiles] = useState(systemPromptFiles);
  const [mounting, setMounting] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, FileDraft>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState("split");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const alive = useRef(true);
  const listRequest = useRef(0);
  const readRequests = useRef(new Map<string, number>());
  const nextReadRequest = useRef(0);
  const busy = useRef(false);
  const dirty = Object.values(drafts).some(isDirty);
  const current = selected ? drafts[selected] : undefined;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    onSavingChange?.(saving || mounting);
  }, [saving, mounting, onSavingChange]);
  useEffect(() => {
    if (!busy.current) setEnabledFiles(systemPromptFiles);
  }, [systemPromptFiles]);

  async function loadFiles() {
    const request = ++listRequest.current;
    setLoading(true);
    setListError("");
    clearAgentCache(agentId);
    try {
      const data = await fetchKnowledgeFiles(agentId);
      if (alive.current && request === listRequest.current) setFiles(data);
    } catch (error: any) {
      if (alive.current && request === listRequest.current)
        setListError(error.message || "加载工作区文档失败");
    } finally {
      if (alive.current && request === listRequest.current) setLoading(false);
    }
  }
  useEffect(() => {
    void loadFiles();
  }, [agentId]);

  async function readFile(filename: string) {
    const request = ++nextReadRequest.current;
    readRequests.current.set(filename, request);
    setDrafts((previous) => ({
      ...previous,
      [filename]: {
        name: filename,
        content: "",
        baseline: "",
        isNew: false,
        loading: true,
        error: "",
      },
    }));
    try {
      const data = await apiFetch<{ content: string }>(
        `/workspace/files/${encodeURIComponent(filename)}`,
        {
          headers: { "X-Agent-Id": agentId },
          bypassCache: true,
        },
      );
      if (!alive.current || readRequests.current.get(filename) !== request)
        return;
      setDrafts((previous) => ({
        ...previous,
        [filename]: {
          ...previous[filename],
          content: data.content || "",
          baseline: data.content || "",
          loading: false,
        },
      }));
    } catch (error: any) {
      if (!alive.current || readRequests.current.get(filename) !== request)
        return;
      setDrafts((previous) => ({
        ...previous,
        [filename]: {
          ...previous[filename],
          loading: false,
          error: error.message || "读取文件失败",
        },
      }));
    }
  }

  function openFile(filename: string) {
    onEditorOpenChange?.(true);
    setSelected(filename);
    setSaveError("");
    if (!drafts[filename]) void readFile(filename);
  }
  function newFile() {
    onEditorOpenChange?.(true);
    setDrafts((previous) =>
      previous[NEW_FILE]
        ? previous
        : {
            ...previous,
            [NEW_FILE]: {
              name: "",
              content: "",
              baseline: "",
              isNew: true,
              loading: false,
              error: "",
            },
          },
    );
    setSelected(NEW_FILE);
    setSaveError("");
  }
  function editCurrent(patch: Partial<FileDraft>) {
    if (!selected) return;
    setDrafts((previous) => ({
      ...previous,
      [selected]: { ...previous[selected], ...patch },
    }));
    setSaveError("");
  }
  function back() {
    if (busy.current) return;
    const leave = () => {
      readRequests.current.clear();
      onEditorOpenChange?.(false);
      setDrafts({});
      setSelected(null);
      setSaveError("");
    };
    if (!dirty) return leave();
    confirmModal.confirm({
      title: "还有未保存的文档修改",
      content: "返回将放弃所有文档草稿，已保存的文件会保留。",
      okText: "放弃修改并返回",
      cancelText: "继续编辑",
      onOk: leave,
    });
  }

  async function toggleMount(filename: string, checked: boolean) {
    if (busy.current) return;
    if (!checked && filename === "AGENTS.md") {
      message.warning("AGENTS.md 是核心配置文件，不能取消挂载");
      return;
    }
    const before = enabledFiles;
    const next = checked
      ? [...new Set([...before, filename])]
      : before.filter((name) => name !== filename);
    busy.current = true;
    setMounting(true);
    setEnabledFiles(next);
    try {
      await updateAgentSystemPromptFiles(agentId, next);
      if (!alive.current) return;
      message.success(checked ? "已挂载到系统提示" : "已取消挂载");
      onRefresh();
    } catch (error: any) {
      if (!alive.current) return;
      setEnabledFiles(before);
      message.error(error.message || "更新挂载失败");
    } finally {
      busy.current = false;
      if (alive.current) setMounting(false);
    }
  }

  async function save() {
    if (
      !selected ||
      !current ||
      current.loading ||
      current.error ||
      !isDirty(current) ||
      busy.current
    )
      return;
    const key = selected;
    const snapshot = current;
    let filename: string;
    try {
      filename = normalizeKnowledgeFilename(snapshot.name);
      if (
        snapshot.isNew &&
        files.some(
          (file) => file.filename.toLowerCase() === filename.toLowerCase(),
        )
      )
        throw new Error("同名文件已存在，请更换文件名");
      if (!snapshot.content.trim()) throw new Error("请输入文档内容");
      if (new TextEncoder().encode(snapshot.content).length > 1024 * 1024)
        throw new Error("文档内容不能超过 1 MB");
    } catch (error: any) {
      setSaveError(error.message);
      return;
    }
    busy.current = true;
    setSaving(true);
    setSaveError("");
    try {
      if (snapshot.isNew) {
        const result = await saveKnowledgeFile(
          agentId,
          filename,
          snapshot.content,
          true,
        );
        if (!alive.current) return;
        setEnabledFiles(result.system_prompt_files);
      } else await writeKnowledgeFile(agentId, filename, snapshot.content);
      if (!alive.current) return;
      setDrafts((previous) => {
        const next = { ...previous };
        next[filename] = {
          ...previous[key],
          name: filename,
          baseline: snapshot.content,
          isNew: false,
        };
        if (key !== filename) delete next[key];
        return next;
      });
      setSelected((active) => (active === key ? filename : active));
      message.success("文档已保存");
      void loadFiles();
      onRefresh();
    } catch (error: any) {
      if (alive.current) setSaveError(error.message || "保存失败，请重试");
    } finally {
      busy.current = false;
      if (alive.current) setSaving(false);
    }
  }

  const mountSwitch = (filename: string) => (
    <Switch
      aria-label={`挂载 ${filename}`}
      size="small"
      checked={enabledFiles.includes(filename)}
      disabled={saving || mounting || filename === "AGENTS.md"}
      onChange={(checked: boolean) => void toggleMount(filename, checked)}
    />
  );
  const newButton = (
    <Button onClick={newFile} disabled={saving || mounting}>
      新建 Markdown 文档
    </Button>
  );
  const listFeedback = listError ? (
    <Alert
      type="error"
      showIcon
      message={listError}
      action={<Button onClick={() => void loadFiles()}>重试</Button>}
    />
  ) : null;

  if (selected === null)
    return (
      <div className="ugsci-expert-files">
        <style>{EXPERT_FILE_STYLES}</style>
        {confirmContext}
        <div className="ugsci-file-list-toolbar">
          <span>
            工作区文档 ({files.length}){" "}
            <small>· {enabledFiles.length} 个已挂载</small>
          </span>
          <div>
            <Button onClick={() => void loadFiles()} loading={loading}>
              刷新
            </Button>
            {newButton}
          </div>
        </div>
        {listFeedback}
        <Spin spinning={loading}>
          <List
            dataSource={files}
            locale={{
              emptyText: (
                <Empty
                  description="暂无 Markdown 文档"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            renderItem={(file: KnowledgeFileInfo) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    type="link"
                    aria-label={`编辑 ${file.filename}`}
                    onClick={() => openFile(file.filename)}
                  >
                    编辑
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <span>
                      {file.filename}{" "}
                      <Tag>
                        {DEFAULT_PROMPT_FILES.includes(file.filename)
                          ? "内置"
                          : "工作文档"}
                      </Tag>
                    </span>
                  }
                  description={`${
                    FILE_PURPOSE[file.filename] || "自定义参考文档"
                  } · ${(file.size / 1024).toFixed(1)} KB · 修改于 ${new Date(
                    file.modified_time,
                  ).toLocaleString()}`}
                />
                {mountSwitch(file.filename)}
              </List.Item>
            )}
          />
        </Spin>
      </div>
    );

  const fileKeys = [
    ...files.map((file) => file.filename),
    ...Object.keys(drafts).filter(
      (key) => !files.some((file) => file.filename === key),
    ),
  ];
  return (
    <div
      className="ugsci-expert-files ugsci-file-workbench"
      role="region"
      aria-label="专家文档工作台"
    >
      <style>{EXPERT_FILE_STYLES}</style>
      {confirmContext}
      <header className="ugsci-file-workbench-toolbar">
        <Button onClick={back} disabled={saving || mounting}>
          返回专家设置
        </Button>
        <span className="ugsci-file-workbench-title">文件与提示词</span>
        {newButton}
      </header>
      <div className="ugsci-file-workbench-body">
        <aside className="ugsci-file-nav" aria-label="工作区文档">
          <div className="ugsci-file-nav-heading">
            <strong>工作区文档</strong>
            <Button
              size="small"
              onClick={() => void loadFiles()}
              loading={loading}
            >
              刷新
            </Button>
          </div>
          {listFeedback}
          <nav>
            {fileKeys.map((key) => {
              const draft = drafts[key];
              const name =
                draft?.name || (key === NEW_FILE ? "未命名文档" : key);
              return (
                <button
                  key={key}
                  type="button"
                  className="ugsci-file-nav-item"
                  disabled={saving || mounting}
                  aria-current={selected === key ? "page" : undefined}
                  onClick={() => openFile(key)}
                >
                  <span>
                    {name}
                    <small>
                      {draft && isDirty(draft)
                        ? "未保存"
                        : enabledFiles.includes(key)
                        ? "已挂载"
                        : "未挂载"}
                    </small>
                  </span>
                  <small>
                    {FILE_PURPOSE[key] ||
                      (key === NEW_FILE ? "保存后自动挂载" : "自定义参考文档")}
                  </small>
                </button>
              );
            })}
          </nav>
          <p>已挂载的文件会加入专家的系统提示。</p>
        </aside>
        <main className="ugsci-file-document">
          <div className="ugsci-file-document-heading">
            <div>
              <h3>{current?.isNew ? "新建文档" : selected}</h3>
              <p>{FILE_PURPOSE[selected] || "自定义参考文档"}</p>
            </div>
            {current && !current.isNew && (
              <label className="ugsci-file-mount">
                加入系统提示 {mountSwitch(selected)}
              </label>
            )}
          </div>
          {current?.isNew && (
            <div className="ugsci-file-name">
              <label htmlFor="ugsci-new-document-name">文件名</label>
              <Input
                id="ugsci-new-document-name"
                value={current.name}
                disabled={saving}
                placeholder="例如 REFERENCE.md"
                onChange={(event: any) =>
                  editCurrent({ name: event.target.value })
                }
              />
              <small>保存后自动挂载到系统提示</small>
            </div>
          )}
          <div className="ugsci-file-viewbar">
            <Segmented
              aria-label="文档视图"
              options={[
                { label: "源码", value: "source" },
                { label: "分栏", value: "split" },
                { label: "预览", value: "preview" },
              ]}
              value={mode}
              onChange={(value: string) => setMode(value)}
            />
            <small>Markdown</small>
          </div>
          {saveError && <Alert type="error" showIcon message={saveError} />}
          {current?.loading ? (
            <div className="ugsci-file-feedback">
              <Spin />
              <span role="status">正在读取文档</span>
            </div>
          ) : current?.error ? (
            <div className="ugsci-file-feedback">
              <Alert
                type="error"
                showIcon
                message={current.error}
                action={
                  <Button onClick={() => void readFile(selected)}>
                    重新读取
                  </Button>
                }
              />
            </div>
          ) : (
            current && (
              <div className={`ugsci-file-editors ugsci-file-view-${mode}`}>
                {mode !== "preview" && (
                  <div className="ugsci-file-source">
                    <Input.TextArea
                      aria-label="Markdown 源码"
                      spellCheck={false}
                      value={current.content}
                      onChange={(event: any) =>
                        editCurrent({ content: event.target.value })
                      }
                      onKeyDown={(event: any) => {
                        if (
                          (event.ctrlKey || event.metaKey) &&
                          event.key.toLowerCase() === "s"
                        ) {
                          event.preventDefault();
                          void save();
                        }
                      }}
                    />
                  </div>
                )}
                {mode !== "source" && (
                  <article
                    className="ugsci-file-preview"
                    aria-label="Markdown 预览"
                    style={{
                      whiteSpace:
                        getHost().ReactMarkdown && getHost().remarkGfm
                          ? "normal"
                          : "pre-wrap",
                    }}
                  >
                    {current.content ? (
                      renderMarkdown(current.content, React)
                    ) : (
                      <Empty
                        description="输入 Markdown 后在这里预览"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    )}
                  </article>
                )}
              </div>
            )
          )}
          <footer className="ugsci-file-document-footer">
            <span role="status">
              {current && !current.loading && !current.error
                ? `${current.content.length} 字符 · 约 ${Math.ceil(
                    current.content.length / 4,
                  )} tokens · ${
                    current.isNew
                      ? "待创建"
                      : isDirty(current)
                      ? "未保存"
                      : "已保存"
                  }`
                : ""}
            </span>
            <Button
              type="primary"
              style={PRIMARY_BTN_STYLE}
              onClick={() => void save()}
              loading={saving}
              disabled={
                !current ||
                current.loading ||
                Boolean(current.error) ||
                mounting ||
                !isDirty(current)
              }
            >
              保存文档
            </Button>
          </footer>
        </main>
      </div>
    </div>
  );
}
