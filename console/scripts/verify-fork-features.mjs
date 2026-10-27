import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { inspectForkTestSource } from "./fork-test-source.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const guardTests = spawnSync(
  process.execPath,
  ["--test", path.join(root, "scripts/fork-test-source.test.mjs")],
  { stdio: "inherit" },
);
if (guardTests.error) throw guardTests.error;
if (guardTests.status !== 0)
  throw new Error("Fork regression guard self-tests failed");
const requireCases = (file, titles) =>
  inspectForkTestSource(
    file,
    readFileSync(path.join(root, file), "utf8"),
    titles,
  );
const teamArtifactsSuite = path.join(
  root,
  "../tests/unit/plugins/ugsci/test_team_artifacts.py",
);
if (!existsSync(teamArtifactsSuite))
  throw new Error(
    "Required UGSci team artifact publication regression suite missing",
  );
// Keep this inventory separate from Vitest discovery: deleting a feature's
// tests during a merge must fail verification instead of silently reducing it.
const suites = {
  mentions: [
    "src/pages/Chat/ChatPage.coverage.test.tsx",
    "src/pages/Chat/agentMentionSubmission.test.ts",
    "src/pages/Chat/components/useAgentMention.test.tsx",
    "src/pages/Chat/components/AgentMentionPopup.test.tsx",
    "src/pages/Chat/components/agentMentionModes.test.ts",
    "src/pages/Chat/components/agentMentionUtils.test.ts",
    "src/pages/Chat/components/ComposerTokenHighlights.test.tsx",
  ],
  submission: [
    "src/hooks/useAgentProcessTracking.test.tsx",
    "src/stores/backgroundTasksStore.test.ts",
    "src/components/Chat/ToolCards/shared/ToolCardShell.test.tsx",
    "src/pages/Chat/chatRunLifecycle.test.ts",
    "src/pages/Chat/sdkHostIntegration.test.tsx",
    "src/stores/messageQueueStore.test.ts",
    "src/pages/Chat/sdkRequestSnapshot.test.ts",
    "src/pages/Chat/pluginSubmission.test.ts",
  ],
  extensionsAndUpdates: [
    "src/pages/AppCenter/AppMarket.test.tsx",
    "src/pages/AppCenter/index.test.tsx",
    "src/contexts/DesktopUpdateContext.test.tsx",
    "src/layouts/Header.test.tsx",
    "src/layouts/constants.test.ts",
  ],
  workspaceAndPlugins: [
    "src/plugins/pluginRuntimeCleanup.test.ts",
    "src/plugins/pawapp-sdk/sessionRouting.test.ts",
    "src/plugins/runCenterAdaptive.test.tsx",
    "src/plugins/openuiRunCenterIntegration.test.tsx",
    "src/plugins/simulationChat.test.tsx",
    "src/plugins/runCenterSimulation.test.tsx",
    "src/plugins/runCenterBundle.test.tsx",
    "src/plugins/uideas.test.tsx",
    "src/plugins/visualizationEmbedding.test.tsx",
    "src/plugins/oilgasViewerUi.test.ts",
    "src/plugins/visualizationEngine.test.ts",
    "src/utils/openExternalLink.test.ts",
    "src/layouts/SidebarSessionList.test.tsx",
    "src/components/SessionItem/SessionItem.test.tsx",
    "src/pages/Chat/HostBubbles.render.test.tsx",
    "src/plugins/expertSummon.test.tsx",
    "src/layouts/LocalAvatarPicker.test.tsx",
    "src/stores/localAvatarStore.test.ts",
    "src/layouts/SidebarSettingsPanel.test.tsx",
    "src/pages/Chat/ChatPage.openFilePreview.test.tsx",
    "src/features/files-workspace/FilesDrawer.test.tsx",
    "src/features/files-workspace/FilesWorkspace.test.tsx",
    "src/features/files-workspace/filesDrawerState.test.ts",
    "src/components/Workspace/renderers/__tests__/OfficeDocRenderer.test.tsx",
    "src/components/Workspace/renderers/__tests__/OfficePreviewRenderer.test.tsx",
    "src/components/Workspace/store/__tests__/builtinRenderers.boundaries.test.ts",
    "src/stores/filesSurfaceStore.test.ts",
    "src/pages/Chat/components/ChatActionGroup/ChatActionGroup.test.tsx",
    "src/plugins/ugsciSidebarBundle.test.tsx",
    "src/plugins/ugsciSettings.test.tsx",
    "src/plugins/domainEngines.test.tsx",
    "src/plugins/mcpCatalog.test.tsx",
    "src/plugins/marketLoading.test.tsx",
    "src/plugins/marketCache.test.ts",
    "src/components/UGSciPublisher/UGSciPublisherModal.test.tsx",
    "src/pages/Agent/MCP/components/MCPAccessModal.largeCatalog.test.tsx",
    "src/pages/Agent/MCP/components/MCPClientCard.test.tsx",
    "src/plugins/documentForms.test.tsx",
    "src/plugins/storageCapacity.test.tsx",
    "src/plugins/hostSdk/ugsciWorkflow.test.tsx",
    "src/plugins/hostSdk/ugsciAuthoring.test.tsx",
    "src/plugins/hostSdk/flowforgeModel.test.ts",
  ],
};
const files = [...new Set(Object.values(suites).flat())];
const teamOwnershipSuite = path.join(
  root,
  "../tests/unit/plugins/ugsci/test_team_ownership.py",
);
if (!existsSync(teamOwnershipSuite))
  throw new Error(
    "Required UGSci team ownership backend regression suite missing",
  );
for (const file of files) {
  if (!existsSync(path.join(root, file)))
    throw new Error(`Required fork regression suite missing: ${file}`);
  requireCases(file, []);
}
for (const [file, titles] of [
  [
    "src/plugins/openuiRunCenterIntegration.test.tsx",
    [
      "renders Run Center result panels through the published OpenUI runtime and preserves tab and DOM state across polling",
      "uses the real plugin cleanup to revoke OpenUI and keep Run Center results readable in the native layout",
    ],
  ],
  [
    "src/plugins/runCenterAdaptive.test.tsx",
    [
      "projects analysis metrics/tables and bounded raw data without interpreting input text or calling simulation APIs",
      "uses newest result events for comparisons and shows stage metrics for workflows",
      "imports a real dataset reference, preserves the viewer across updates/layout and saves/reloads presentation",
      "retains unsaved edits through remote revisions and reports a save conflict instead of overwriting",
      "disables draft changes and pauses plan polling during a pending save",
      "honors saved compact panel titles/order and directs unsupported field panels to the full sidebar",
      "skips malformed series points while preserving an explicit missing value as an ECharts gap",
      "ignores a delayed old scope response and rejects malformed plans with readable native fallback",
      "loads the published OpenUI runtime on readiness and falls back when the plugin is disposed",
      "applies simulation plan defaults once while retaining manual filters and field state across plan changes",
    ],
  ],
  [
    "../plugins/bundle/qwenpaw-openui/frontend/test/TaskLayout.test.tsx",
    [
      "uses the real runtime and preserves host viewers across polling, tabs, layout, titles and filtering",
      "appends new panels without replacing existing host elements or tab state",
      "treats quoted panel IDs and model text as inert data and isolates task instances",
      "publishes a replaceable API and releases its global reference on disposal",
    ],
  ],
  [
    "../plugins/bundle/qwenpaw-openui/frontend/test/bundle.test.tsx",
    [
      "ships the task-layout API using the real renderer and keeps panels alive through live updates",
    ],
  ],
  [
    "src/plugins/marketLoading.test.tsx",
    [
      "paints skills and MCP before a slow expert catalog and limits initial cards",
      "searches the whole catalog beyond the first batch and keeps cards on refresh failure",
      "opens the expert publisher from the real market and blocks unconfigured OSS uploads",
    ],
  ],
  [
    "src/components/UGSciPublisher/UGSciPublisherModal.test.tsx",
    [
      "requires package inspection and consent before upload then shows the OSS receipt",
      "keeps local preparation distinct from a remote submission and clears the temporary token",
    ],
  ],
  [
    "src/plugins/marketCache.test.ts",
    [
      "shares cold requests and reuses a fresh catalog when reopening",
      "returns stale cards immediately and notifies once background validation finishes",
      "follows backend stale responses without blocking the first catalog paint",
    ],
  ],
  [
    "src/plugins/pluginRuntimeCleanup.test.ts",
    [
      "revokes the shared OpenUI renderer when its owner is removed",
      "still removes registrations and stale OpenUI capability after a cleanup error",
    ],
  ],
  [
    "src/plugins/simulationChat.test.tsx",
    [
      "only accepts simulation tool references from live and historical messages",
      "registers a real chat card that opens a scoped monitor without automatically subscribing",
      "mounts the shared sidebar monitor with session scope and handles late plugin loading",
    ],
  ],
  [
    "src/plugins/runCenterSimulation.test.tsx",
    [
      "mounts monitoring from the real run page, keeps logs and disables unsupported pause",
      "filters multiple well curves, keeps missing values and exports the complete selected series with host scope",
      "refreshes live fields in place, preserves manual timestep and disposes the viewer and timers",
      "continues polling after solver exit until final results, then retains the final snapshot",
      "uses archived ISO timestamps and job status without chat props and only collects history on request",
      "uses SSE updates, falls back to polling, retains old results on failure and retries",
      "isolates a delayed old run response, captures Agent scope and tolerates a missing UGSci viewer",
    ],
  ],
  [
    "src/plugins/uideas.test.tsx",
    [
      "captures inline metadata without accidental Enter submission and retains drafts across tabs",
      "searches full content and expansion, clears filters, reads full ideas and navigates cluster sources",
      "preserves edited text during realtime refresh and retains explicit experiment links",
      "archives and restores original status from the mounted idea board",
      "paginates and sorts the real library while keyboard navigation retains filters",
      "adopts a suggestion then completes and reopens its action without SSE",
      "keeps queued jobs busy across tabs and polls completion without realtime events",
      "shows recoverable task failures and retries from the real page",
      "retries loading errors and exports all records including archived ideas",
    ],
  ],
  [
    "src/plugins/visualizationEngine.test.ts",
    [
      "mounts two real engines with independent stores and keeps the surviving engine usable after disposal",
      "retains loaded scalars for filtering and exposes selected objects to the embedding host",
      "waits for initialization before open and rejects invalid geometry instead of acknowledging success",
      "silently synchronizes loaded tube, depth-log and spatial-well views without selecting a different dataset",
      "saves and restores scenes and cameras independently across real engines and custom card namespaces",
      "cancels a deferred scene restoration when Agent scope changes without altering the new restoration",
    ],
  ],
  [
    "src/plugins/visualizationEmbedding.test.tsx",
    [
      "mounts the registered page and disposes its own viewer without reloading the host",
      "opens the imported dataset with captured workspace scope through host navigation",
      "does not execute a late command after the viewer is disposed",
    ],
  ],
  [
    "src/plugins/oilgasViewerUi.test.ts",
    [
      "localizes inspector controls and switches tabs by keyboard without duplicate ARIA IDs",
      "renders matching objects inside folded groups and exposes real keyboard-selectable controls",
    ],
  ],
  [
    "src/plugins/storageCapacity.test.tsx",
    [
      "runs the mounted page from editable parameters to report and invalidates stale exports",
      "maps uploaded evidence into real unit inputs without overwriting existing units",
      "keeps deterministic results available when optional agent review fails",
      "runs an independent PVT node and retains the editable form beside its result",
      "fills the mounted form through conversation and supports undo and adjustable assistant",
      "uploads conversation attachments before sending their evidence IDs to the assistant",
      "opens independent result windows and preserves snapshots while moving resizing and editing",
      "plots source data without converting missing observations into zero or inventing map results",
    ],
  ],
  [
    "src/plugins/expertSummon.test.tsx",
    [
      "opens a fresh chat for %s through the page router",
      "opens the owning app for %s, drawer=%s",
      "preserves the host basename when summoning",
    ],
  ],
  [
    "src/layouts/LocalAvatarPicker.test.tsx",
    [
      "offers both built-in avatars and restores a saved choice without fetching a private image",
      "keeps uploaded GIF bytes instead of flattening animation through canvas",
    ],
  ],
  [
    "src/stores/localAvatarStore.test.ts",
    ["ignores an old account response after authentication changes"],
  ],
  [
    "src/hooks/useAgentProcessTracking.test.tsx",
    [
      "merges streamed spawn and check identities without leaving provisional running rows",
      "does not reopen completed batch members or finish their still-running siblings",
    ],
  ],
  [
    "src/pages/Agent/MCP/components/MCPAccessModal.largeCatalog.test.tsx",
    [
      "bounds mounted editors, searches all tools, lazily shows schemas and closes the real modal",
    ],
  ],
  [
    "src/pages/Agent/MCP/components/MCPClientCard.test.tsx",
    [
      "uses static %s credentials without offering an OAuth flow",
      "retains OAuth for unconfigured or existing OAuth connections: %j",
    ],
  ],

  [
    "src/layouts/SidebarSettingsPanel.test.tsx",
    [
      "restores Manual and About links to UGSci while keeping settings available",
    ],
  ],
  [
    "src/plugins/mcpCatalog.test.tsx",
    [
      "imports the actual market remote URL headers and user credential after confirmation",
      "keeps OAuth catalog connections disabled until the user authorizes them",
      "refreshes the OSS catalog explicitly without relying on the browser cache",
      "authorizes from the actual marketplace and verifies tools before reporting connected",
      "retries denied marketplace authorization and cancels without enabling or duplicating clients",
      "keeps saved token connections retryable without displaying upstream credentials",
    ],
  ],
  [
    "src/components/Workspace/renderers/__tests__/OfficePreviewRenderer.test.tsx",
    [
      "keeps real reading and print renderers reachable with scoped requests",
      "retains the mode selector after print failure so print can be retried",
      "resets print state and rejects a late response when changing chat scope",
      "pages the real print renderer, bounds zoom, and resets page on chat change",
      "does not display late HTML from the previous chat",
    ],
  ],
  [
    "src/pages/Chat/chatRunLifecycle.test.ts",
    [
      "releases pending headers, keeps unknown receipt sending and cancels a late HTTP %s body",
      "cancels a silent reader and releases both locks without awaiting its cancellation hook",
      "retains an actual pre-acceptance HTTP failure as failed",
    ],
  ],
  [
    "src/pages/Chat/sdkHostIntegration.test.tsx",
    ["enqueues an uploaded attachment with empty text on busy Enter"],
  ],
  [
    "src/components/Workspace/renderers/__tests__/OfficeDocRenderer.test.tsx",
    ["retries OfficeCLI after reopening a simplified detached preview"],
  ],
]) {
  const source = readFileSync(path.join(root, file), "utf8");
  for (const title of titles) {
    if (!inspectForkTestSource(file, source).has(title))
      throw new Error(`Required fork integration case missing: ${title}`);
  }
}
const chatTests = readFileSync(path.join(root, suites.mentions[0]), "utf8");
const documentFormsTests = readFileSync(
  path.join(root, "src/plugins/documentForms.test.tsx"),
  "utf8",
);
for (const title of [
  "imports Excel, edits the real form, requires review and confirmation, then previews generated Word with the host Office component",
  "automatically loads the five bundled templates and downloads their blank Excel kit",
  "organizes projects into seven stages and keeps material versions and submission details on the packaged page",
  "reviews shared project differences before selectively updating a stage form and protects unsaved edits",
  "opens the response review agent only in negotiation and starts with explicitly selected project files",
  "keeps a single project form in the middle while questions and Office preview stay in the right column",
  "fills plan-specific information, keeps common fields in the basic profile and previews generated Excel through Office",
  "fills selection opinion and upload fields with shared project references and previews generated files",
]) {
  if (
    !inspectForkTestSource("documentForms.test.tsx", documentFormsTests).has(
      title,
    )
  ) {
    throw new Error(
      `Required document forms page integration case missing: ${title}`,
    );
  }
}
for (const title of [
  "UGSci fork feature: sender placeholder advertises @ Agent assignment in %s",
  "UGSci fork feature: @ opens the real Agent picker and keyboard selection inserts a mention",
  "UGSci fork feature: @ %s survives SDK input clearing and routes the actual request",
  "UGSci fork feature: queued @ collaboration keeps the enqueue-time selection",
]) {
  if (!inspectForkTestSource(suites.mentions[0], chatTests).has(title))
    throw new Error(`Required ChatPage integration case missing: ${title}`);
}
const settingsTests = readFileSync(
  path.join(root, "src/plugins/ugsciSettings.test.tsx"),
  "utf8",
);
for (const title of [
  "opens packaged UGSci settings in Settings Center and persists the GenUI switch",
  "redirects the old GenUI address into UGSci settings",
  "keeps GenUI settings disabled when the backend is unavailable",
]) {
  if (
    !inspectForkTestSource("ugsciSettings.test.tsx", settingsTests).has(title)
  )
    throw new Error(
      `Required UGSci settings integration case missing: ${title}`,
    );
}
const domainEngineTests = readFileSync(
  path.join(root, "src/plugins/domainEngines.test.tsx"),
  "utf8",
);
for (const title of [
  "keeps domain grouping, collapsed search, function details, and the management entry on the packaged page",
  "shows status evidence for $label on the packaged detail page",
  "installs a missing runtime from its real card only after confirmation and refreshes tool availability",
  "keeps failed runtime installs actionable and retries from the real dialog",
  "explains managed runtime restrictions before starting any installation",
  "resumes a background installation from the card without starting another download",
  "recovers a missing install receipt by checking the actual runtime before reporting failure",
]) {
  if (
    !inspectForkTestSource("domainEngines.test.tsx", domainEngineTests).has(
      title,
    )
  )
    throw new Error(
      `Required domain engine page integration case missing: ${title}`,
    );
}
const workspaceTests = readFileSync(
  path.join(root, "src/pages/Chat/ChatPage.openFilePreview.test.tsx"),
  "utf8",
);
for (const title of [
  "UGSci workspace: the real header opens, expands and closes the current session panel",
  "UGSci workspace: compute opens atomically and a later file request takes priority",
  "UGSci workspace: inactive chat ignores global file and compute requests",
  "UGSci simulation: the real chat opens the requested run and rejects another agent or session",
  "UGSci simulation: accepts the current runtime session when its Chat UUID differs",
]) {
  if (
    !inspectForkTestSource(
      "ChatPage.openFilePreview.test.tsx",
      workspaceTests,
    ).has(title)
  )
    throw new Error(`Required workspace integration case missing: ${title}`);
}
requireCases("src/plugins/pawapp-sdk/sessionRouting.test.ts", [
  "preserves the current dialogue in the request body",
  "respects an explicit session instead of the active dialogue",
  "resolves a normal chat route to its backend session",
  "infers the active PawApp from the browser path",
]);
console.log(`Fork feature inventory verified: ${files.length} suites.`);
if (!process.argv.includes("--check")) {
  const result = spawnSync(
    process.execPath,
    [
      "--max-old-space-size=4096",
      path.join(root, "node_modules/vitest/vitest.mjs"),
      "run",
      "--maxWorkers=2",
      ...files,
    ],
    { cwd: root, stdio: "inherit" },
  );
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
