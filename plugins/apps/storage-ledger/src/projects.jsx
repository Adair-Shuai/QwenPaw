const React = window.QwenPaw.host.React;
const { useEffect, useState } = React;
export async function saveFile(response, name) {
  const url = URL.createObjectURL(await response.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function json(method, value) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  };
}
const blank = { name: "", operator: "", region: "", description: "" };
export function ProjectLibrary({ api, open, css, initialId }) {
  const [items, setItems] = useState([]),
    [form, setForm] = useState(null),
    [error, fail] = useState(""),
    [busy, spin] = useState(false),
    [ready, setReady] = useState(false),
    [q, search] = useState(""),
    [archived, filter] = useState(false),
    [revision, reload] = useState(0),
    [message, say] = useState("");
  const file = React.useRef(null);
  useEffect(() => {
    let live = true;
    api("/projects")
      .then((r) => r.json())
      .then((rows) => {
        if (live) {
          const requested = initialId && rows.find((p) => p.id === initialId);
          if (requested) {
            open(requested);
            return;
          }
          setItems(rows);
          setReady(true);
        }
      })
      .catch((e) => {
        if (live) fail(e.message);
      });
    return () => {
      live = false;
    };
  }, [revision]);
  async function perform(fn) {
    spin(true);
    fail("");
    say("");
    try {
      await fn();
      reload((v) => v + 1);
    } catch (e) {
      fail(e.message);
    } finally {
      spin(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    await perform(async () => {
      const r = await api(
        form.id ? "/projects/" + form.id : "/projects",
        json(form.id ? "PATCH" : "POST", form),
      );
      const p = await r.json();
      setForm(null);
      if (!form.id) open(p);
      else say("已保存项目资料");
    });
  }
  const filtered = items.filter(
    (p) =>
      Boolean(p.archived) === archived &&
      [p.name, p.region, p.operator]
        .join(" ")
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  return (
    <main className="sl-app sl-library">
      <style>{css}</style>
      <header className="sl-head">
        <div>
          <h1>储气库数据管理</h1>
          <p>项目库</p>
        </div>
        <div className="sl-actions">
          <button disabled={busy} onClick={() => file.current.click()}>
            从备份恢复
          </button>
          <button
            className="sl-primary"
            disabled={busy}
            onClick={() => setForm({ ...blank })}
          >
            ＋ 新建项目
          </button>
        </div>
      </header>
      <input
        ref={file}
        type="file"
        accept=".ugsdb"
        hidden
        aria-label="选择项目备份"
        onChange={(e) => {
          const f = e.target.files[0];
          e.target.value = "";
          if (!f) return;
          perform(async () => {
            const b = new FormData();
            b.append("file", f);
            const p = await (
              await api("/projects/restore", { method: "POST", body: b })
            ).json();
            open(p);
          });
        }}
      />
      {error && (
        <p className="sl-alert" role="alert">
          {error} <button onClick={() => reload((v) => v + 1)}>刷新</button>
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {form && (
        <form className="sl-form" onSubmit={submit}>
          <h2>{form.id ? "项目资料" : "新建储气库项目"}</h2>
          <div className="sl-fields">
            {[
              ["name", "项目名称"],
              ["operator", "运营单位"],
              ["region", "所在地区"],
              ["description", "项目说明"],
            ].map(([k, label]) => (
              <label key={k}>
                {label}
                <input
                  autoFocus={k === "name"}
                  required={k === "name"}
                  maxLength={
                    k === "description" ? 1600 : k === "name" ? 100 : 120
                  }
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <div className="sl-actions">
            <button
              type="submit"
              className="sl-primary"
              disabled={busy || !form.name.trim()}
            >
              {form.id ? "保存资料" : "创建并打开"}
            </button>
            <button type="button" onClick={() => setForm(null)}>
              取消
            </button>
          </div>
        </form>
      )}
      <div className="sl-library-filter">
        <nav aria-label="项目状态">
          {[
            [false, "使用中"],
            [true, "已归档"],
          ].map(([state, name]) => (
            <button
              key={name}
              aria-current={archived === state ? "page" : undefined}
              onClick={() => filter(state)}
            >
              {name}　
              {items.filter((p) => Boolean(p.archived) === state).length}
            </button>
          ))}
        </nav>
        <input
          type="search"
          aria-label="搜索项目"
          placeholder="搜索项目、地区或单位"
          value={q}
          onChange={(e) => search(e.target.value)}
        />
      </div>
      <div className="se-library-grid">
        <table aria-label="工程目录">
          <thead>
            <tr>
              <th>项目名称</th>
              <th>所在地区 / 运营单位</th>
              <th>资料</th>
              <th>记录</th>
              <th>项目操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <button className="sl-title" onClick={() => open(p)}>
                    {p.name}
                  </button>
                  {p.description && <small>{p.description}</small>}
                </td>
                <td>
                  {[p.region, p.operator].filter(Boolean).join(" / ") || "—"}
                </td>
                <td>{p.sources}</td>
                <td>{p.records.toLocaleString()}</td>
                <td>
                  {" "}
                  <div className="sl-actions">
                    <button className="sl-primary" onClick={() => open(p)}>
                      {p.archived ? "查看项目" : "进入项目"}
                    </button>
                    <button disabled={busy} onClick={() => setForm({ ...p })}>
                      编辑资料
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        perform(async () => {
                          await saveFile(
                            await api("/projects/" + p.id + "/backup"),
                            p.name + ".ugsdb",
                          );
                          say("项目备份已导出");
                        })
                      }
                    >
                      备份
                    </button>
                    <button
                      disabled={busy}
                      onClick={() =>
                        perform(async () => {
                          await api(
                            "/projects/" + p.id,
                            json("PATCH", { ...p, archived: !p.archived }),
                          );
                          say(
                            p.archived
                              ? "项目已恢复使用"
                              : "项目已归档，可在已归档列表中查看和恢复",
                          );
                        })
                      }
                    >
                      {p.archived ? "恢复使用" : "归档"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filtered.length && (
        <div className="sl-empty">
          {!ready
            ? "正在读取项目…"
            : q
            ? "没有匹配的项目"
            : archived
            ? "暂无归档项目"
            : "从新建项目开始，或恢复已有项目备份。"}
        </div>
      )}
    </main>
  );
}
