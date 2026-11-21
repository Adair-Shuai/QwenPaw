import baseCss from "./ledger.css";
import studioCss from "./studio.css";
import { ProjectLibrary } from "./projects.jsx";
import { Studio } from "./studio.jsx";
const Q = window.QwenPaw,
  React = Q.host.React;
const css = baseCss + "\n" + studioCss;
async function hostRequest(path, options) {
  const response = await Q.host.fetch("/storage-ledger" + path, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Error(
      typeof error.detail === "string"
        ? error.detail
        : "请求失败 · " + response.status,
    );
  }
  return response;
}
function Library() {
  const [project, setProject] = React.useState(null);
  const [initialId] = React.useState(() =>
    new URLSearchParams(location.search).get("project"),
  );
  function change(p) {
    setProject(p);
    const url = new URL(location.href);
    if (p) url.searchParams.set("project", p.id);
    else url.searchParams.delete("project");
    window.history.replaceState(window.history.state, "", url);
  }
  const [first, setFirst] = React.useState(true);
  function enter(p) {
    setFirst(false);
    change(p);
  }
  return project ? (
    <Studio
      key={project.id}
      project={project}
      apiHost={hostRequest}
      css={css}
      close={() => change(null)}
    />
  ) : (
    <ProjectLibrary
      api={hostRequest}
      css={css}
      open={enter}
      initialId={first ? initialId : null}
    />
  );
}
function Scoped() {
  const ctx = Q.host.useSelectedAgent?.();
  return <Library key={ctx?.id || "default"} />;
}
Q.registerRoutes("storage-ledger", [
  {
    path: "/apps/storage-ledger",
    label: "储气库数据管理",
    icon: "▥",
    component: Scoped,
  },
]);
