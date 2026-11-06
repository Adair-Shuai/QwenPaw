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
  upstreamIntegration: [
    "src/layouts/MainLayout/MainLayout.settings.test.tsx",
    "src/features/files-workspace/FilesWorkspace.directory-confirmation.test.tsx",
  ],
  deploymentConfiguration: ["vite.config.test.ts"],
  skillImport: ["src/pages/Agent/Skills/useSkills.paths.test.ts"],
  turnFileDelivery: [
    "src/api/modules/turnFiles.test.ts",
    "src/features/files-workspace/TurnFileSummary.test.tsx",
    "src/features/files-workspace/ResponseArtifactList.test.tsx",
    "src/features/files-workspace/responseArtifactRegistry.test.tsx",
    "src/features/files-workspace/ArtifactsWorkspace.test.tsx",
    "src/features/files-workspace/useSessionDeliverables.test.tsx",
    "src/features/files-workspace/openFilePreview.test.ts",
    "src/pages/Chat/sessionApi/sessionApi.test.ts",
  ],
  interfaceAppearance: [
    "src/pages/Chat/components/ChatHome.test.tsx",
    "src/pages/Chat/components/ExecutionProcess.test.tsx",
    "src/pages/Chat/HostBubbles.upstream-collapse.test.tsx",
    "src/pages/Chat/components/ComposerAddMenu.test.tsx",
    "src/utils/actionColors.test.ts",
    "src/pages/Market/index.test.tsx",
    "src/features/project-directory/SessionProjectDirectory.test.tsx",
    "src/pages/Chat/components/ApprovalToggle.test.tsx",
    "src/pages/Chat/components/ContextUsageIndicator/ContextUsageIndicator.test.tsx",
    "src/pages/Chat/components/ComposerOptions.test.tsx",
    "src/utils/pageStyle.test.tsx",
    "src/layouts/DockableSidebar.test.tsx",
    "src/layouts/sidebarSizing.test.ts",
    "src/contexts/ThemeContext.test.tsx",
    "src/layouts/Sidebar.render.test.tsx",
    "src/App.runtime.test.tsx",
  ],
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
    "src/pages/Chat/requestEditSnapshot.test.ts",
    "src/pages/Chat/chatInputDraft.test.ts",
    "src/pages/Chat/useChatInputDraft.test.tsx",
    "src/pages/Chat/chatInputDraft.sdk.test.tsx",
    "src/pages/Chat/components/MessageEditResend.inline.test.tsx",
    "src/pages/Chat/components/ComposerKeyboard.integration.test.tsx",
    "src/pages/Chat/hooks/useQueueSteering.test.tsx",
    "src/pages/Chat/components/MessageQueuePanel.test.tsx",
    "src/pages/Chat/components/MessageQueuePanel.keyboard.test.tsx",
    "src/pages/Chat/components/ChatSenderTabsPanel.test.tsx",
    "src/hooks/useAgentProcessTracking.test.tsx",
    "src/stores/backgroundTasksStore.test.ts",
    "src/hooks/useBackgroundTaskWatcher.test.ts",
    "src/components/Chat/ToolCards/shared/ToolCardShell.test.tsx",
    "src/pages/Chat/chatRunLifecycle.test.ts",
    "src/pages/Chat/sdkHostIntegration.test.tsx",
    "src/stores/messageQueueStore.test.ts",
    "src/pages/Chat/sdkRequestSnapshot.test.ts",
    "src/pages/Chat/pluginSubmission.test.ts",
  ],
  extensionsAndUpdates: [
    "src/api/modules/plugin.test.ts",
    "src/pages/Settings/PluginManager/PluginManager.upgrades.test.tsx",
    "src/pages/Settings/PluginManager/hooks/usePluginManager.test.ts",
    "src/pages/Settings/PluginManager/hooks/useOfficialPlugins.test.ts",
    "src/pages/Settings/PluginManager/hooks/useMarketPlugins.state.test.ts",
    "src/pages/Settings/PluginManager/components/InstalledPluginList.test.tsx",
    "src/pages/AppCenter/AppMarket.test.tsx",
    "src/pages/AppCenter/index.test.tsx",
    "src/pages/AppCenter/AppCenter.updates.test.tsx",
    "src/pages/AppCenter/AppCard.test.tsx",
    "src/plugins/usePluginLoader.test.ts",
    "src/os/osCleanup.test.ts",
    "src/contexts/DesktopUpdateContext.test.tsx",
    "src/layouts/Header.test.tsx",
    "src/layouts/constants.test.ts",
  ],
  workspaceAndPlugins: [
    "src/plugins/pluginRuntimeCleanup.test.ts",
    "src/plugins/pawapp-sdk/sessionRouting.test.ts",
    "src/os/DesktopAppLabels.test.tsx",
    "src/plugins/runCenterAdaptive.test.tsx",
    "src/plugins/openuiRunCenterIntegration.test.tsx",
    "src/features/user-input/InteractionPanel.integration.test.tsx",
    "src/plugins/simulationChat.test.tsx",
    "src/plugins/runCenterSimulation.test.tsx",
    "src/plugins/runCenterBundle.test.tsx",
    "src/plugins/uideas.test.tsx",
    "src/plugins/uproject.test.tsx",
    "src/plugins/visualizationEmbedding.test.tsx",
    "src/plugins/oilgasViewerUi.test.ts",
    "src/plugins/visualizationEngine.test.ts",
    "src/utils/openExternalLink.test.ts",
    "src/utils/openHtmlFile.test.ts",
    "src/layouts/SidebarSessionList.test.tsx",
    "src/components/SessionItem/SessionItem.test.tsx",
    "src/pages/Chat/HostBubbles.render.test.tsx",
    "src/plugins/expertSummon.test.tsx",
    "src/plugins/expertPresentation.test.tsx",
    "src/layouts/LocalAvatarPicker.test.tsx",
    "src/stores/localAvatarStore.test.ts",
    "src/layouts/SidebarSettingsPanel.test.tsx",
    "src/pages/Chat/ChatPage.openFilePreview.test.tsx",
    "src/features/files-workspace/FilesDrawer.test.tsx",
    "src/features/files-workspace/FilesWorkspace.test.tsx",
    "src/features/files-workspace/FilesWorkspace.integration.test.tsx",
    "src/features/files-workspace/FilesWorkspace.pending-diff.test.tsx",
    "src/features/files-workspace/FilesWorkspace.revalidation.test.tsx",
    "src/pages/Coding/FilePreview.test.tsx",
    "src/pages/Coding/MarkdownFileNavigation.integration.test.tsx",
    "src/pages/Coding/TabbedEditor.test.tsx",
    "src/components/RenderableCodeBlock/RenderableCodeBlock.test.tsx",
    "src/components/Workspace/renderers/__tests__/MarkdownRenderer.workspaceLinks.test.tsx",
    "src/features/files-workspace/filesDrawerState.test.ts",
    "src/components/Workspace/renderers/__tests__/OfficeDocRenderer.test.tsx",
    "src/components/Workspace/renderers/__tests__/OfficePreviewRenderer.test.tsx",
    "src/components/Workspace/renderers/__tests__/LightweightPdfViewer.test.tsx",
    "src/components/Workspace/store/__tests__/builtinRenderers.boundaries.test.ts",
    "src/stores/filesSurfaceStore.test.ts",
    "src/stores/codingTabsStore.test.ts",
    "src/pages/Chat/components/ChatActionGroup/ChatActionGroup.test.tsx",
    "src/plugins/ugsciSidebarBundle.test.tsx",
    "src/plugins/ugsciSettings.test.tsx",
    "src/plugins/domainEngines.test.tsx",
    "src/plugins/capabilitiesWorkspace.test.tsx",
    "src/pages/Agent/ACP/components/ACPDrawer.test.tsx",
    "src/pages/Agent/ACP/index.test.tsx",
    "src/pages/Agent/MCP/index.test.tsx",
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
    "vite.config.test.ts",
    [
      "keeps assets at the root when the basename is %j",
      "uses %j as the asset prefix %j",
      "builds extensionless assets with portable names and intact references (%s)",
    ],
  ],
  [
    "src/pages/Agent/Skills/useSkills.paths.test.ts",
    [
      "importFromHub: an empty task id exits the poll loop with success:false",
      "cancelImport: tolerates a start request that has not resolved yet",
    ],
  ],
  [
    "src/components/Workspace/renderers/__tests__/LightweightPdfViewer.test.tsx",
    [
      "uses authenticated strict Range loading for large workspace PDFs",
      "loads bundled Chinese CMaps on demand and reuses independent font buffers",
    ],
  ],
  [
    "src/features/user-input/InteractionPanel.integration.test.tsx",
    [
      "creates the demo from FilesDrawer, preserves zero and selected parameters in saved drafts, reopens and queues the exact scoped answer",
      "keeps false and zero after a rejected submit and accepts one retry without duplicate submission from a double click",
      "retries a failed queued acknowledgement after remount without sending the saved answer to chat twice",
      "discovers requests through useWorkbenchRequests, ignores another scope, and leaves the form being edited selected",
      "discards a late discovery response after switching agent and runtime session",
      "does not deliver a late submit result into a different conversation",
      "finishes an explicitly submitted answer after closing the drawer while the server response is pending",
      "retains a restored local draft when another window advances the revision and requires an explicit reload",
      "does not let an earlier list response erase the demo created and edited while it was in flight",
      "safely unloads the plugin and restores a persisted request and local draft after loading the shipped bundle again",
    ],
  ],
  [
    "src/api/modules/plugin.test.ts",
    [
      "catalog compatibility uses an exclusive 3.0 upper bound for %s",
      "replaceInstalledPlugin displays %s errors",
      "replaceInstalledPlugin interrupts only after confirmation: %s",
    ],
  ],
  [
    "src/pages/Settings/PluginManager/PluginManager.upgrades.test.tsx",
    [
      "queues signed upgrades from the real page and shows restart state",
      "replaces unmanaged catalog upgrades with their version and digest",
      "keeps core incompatibility blocked without attempting replacement",
      "updates installed Matrix dev1 to dev2 from the real %s page action",
    ],
  ],
  [
    "src/layouts/constants.test.ts",
    ["orders Matrix development updates before alpha beta rc and stable"],
  ],
  [
    "src/os/DesktopAppLabels.test.tsx",
    [
      "keeps the published document forms Chinese name across desktop surfaces without a sidebar menu",
      "updates localized route names and launcher search without remounting an open app",
      "keeps live menu callback names and unnamed plugin fallbacks on the real desktop",
    ],
  ],
  [
    "src/plugins/uproject.test.tsx",
    [
      "saves complete project fields and preserves a rejected creation draft",
      "edits task ownership scheduling and dependencies from the real board without losing a rejected draft",
      "generates agenda weekly and minutes while retaining persisted brief history and activity",
      "requires explicit confirmation before restoring demo projects",
      "blocks alignment until predecessors are agreed and then completes the real list workflow",
      "does not let a late project response replace the project opened after returning",
      "exports complete project bundles even when the project portfolio is filtered",
    ],
  ],
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
      "keeps technical identifiers in toggled details and makes results the primary action",
      "keeps run actions scoped to the owning agent and releases results on an agent switch",
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
      // The combined case was split under the same timeout; all three
      // behavioral paths remain mandatory, including first-page restoration.
      "paginates the real library in descending update order",
      "retains filters across keyboard navigation and restores the first page when cleared",
      "sorts the real library by title and filters by tags",
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
      "previews ordinary delivered CSV through the native table with the real visualization bundle installed",
      "retains explicit network CSV imports through the professional workspace viewer",
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
    "src/plugins/expertPresentation.test.tsx",
    [
      "filters real cards without exposing prompt metadata and keeps application routing labels",
      "preserves drafts across settings tabs and saves only display metadata",
      "preserves advanced drafts and unknown running configuration fields when saving",
      "retains failed saves and confirms discarding an unsaved draft",
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
      "persists %s from the actual appearance flyout and restores it on reopen",
      "keeps mobile appearance navigation in one panel with Back and persists a style choice",
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
  "links selection opinion facts to approval and candidate fields while preserving authored findings",
  "edits inline opinion prose and pastes plain text without detached reference blocks or HTML",
  "groups negotiation content into five ordered tabs without duplicating fields and keeps recipients, drafts and issue navigation",
  "uses workflow tabs in %s without shared reference blocks and preserves drafts through validation and attachments",
  "keeps template management, Excel transfers and saving in the live stage toolbar without losing drafts",
  "restores the live stage header and its actions after returning from overview and basic information",
  "imports shared information from the existing Excel template into a reviewed profile draft and preserves blank and unselected values",
  "separates approval documents from other attachments and lazily reuses direct PDF and image previews with retry",
  "deletes only the confirmed approval version, preserves numbering and preview state, and supports retry and undo",
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
  "UGSci fork feature: the mounted task panel stays collapsible during and after multi-agent execution",
  "UGSci fork feature: sender placeholder advertises @ Agent assignment in %s",
  "UGSci fork feature: @ opens the real Agent picker and keyboard selection inserts a mention",
  "UGSci fork feature: interface style changes preserve the mounted chat and sender draft",
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
requireCases("src/plugins/capabilitiesWorkspace.test.tsx", [
  "localizes configuration agent labels live while preserving custom names and selected IDs",
  "configures a real engine from its compact icon card and preserves advanced values after a failed save",
  "keeps built-in tools separate and embeds the original MCP and runtime managers",
  "shows skill controls without hovering and returns from focused details to the updated agent card",
  "ignores an old skill response after the configuration agent changes",
  "installs from the visible skill-pool card and refreshes the current expert without a page reload",
]);
requireCases("src/pages/Agent/MCP/components/MCPClientCard.test.tsx", [
  "keeps embedded MCP validation and saves through the original editor before returning to its card",
]);
requireCases("src/pages/Agent/ACP/components/ACPDrawer.test.tsx", [
  "keeps an embedded runtime edit open on failure and flushes the original form on return",
]);
// Native file behavior and fork panels must remain connected through the real host.
requireCases(
  "src/features/files-workspace/FilesWorkspace.integration.test.tsx",
  [
    "opens text decks in the native editor and preserves explicit preview intent",
    "keeps different same-name artifacts in independent tabs",
    "repairs a restored artifact identity on reopen without replacing the buffer",
    "releases a hidden file preview while preserving its tab and unsaved buffer",
    "saves actual artifact bytes with session and root scope and opens the returned conflict-renamed path",
    "keeps the artifact and retries a failed save using a new session's pending project directory",
    "cancels save-as without writing or changing the artifact",
    "keeps a later existing tab selected while the saved file is still loading",
    "does not reopen a saved file after the workspace switches to another session",
    "keeps preview-only document content visible with no route to a hidden navigator",
    "refreshes byte sizes when restoring, reloading and reselecting a file",
    "keeps streamed artifact previews, copy and saved bytes on the same current content",
    "rejects foreign-scope artifact updates and preserves unsaved buffers",
  ],
);
requireCases("src/features/files-workspace/FilesDrawer.test.tsx", [
  "opens %s in the scoped browser by default without creating a popup",
  "opens edited HTML from the preview button in the browser using the same dirty buffer",
  "does not let a slow HTML load replace a deliberately selected GenUI panel",
  "keeps archived HTML resources in their original turn when opened in the browser",
  "restores per-style file widths without replacing the active editor or its unsaved draft",
  "clears closed file actions instead of falling back to the opening request",
  "retains browser history, address drafts and the iframe across tool switches",
  "keeps native files usable after a compute plugin is removed",
  "releases the simulation view on hide and reflects provider removal",
  "shows native file size and keeps expansion available after a load failure",
]);
requireCases("src/utils/openHtmlFile.test.ts", [
  "contains untrusted markup only inside an opaque sandbox",
  "reserves a browser window before loading relative HTML resources",
]);
requireCases("src/pages/Coding/FilePreview.test.tsx", [
  "resolves scoped sibling stylesheets without giving credentials to HTML",
  "does not read nonasset local dependencies requested by HTML",
  "keeps archived HTML dependencies immutable when captured=%s",
  "keeps math code blocks in the renderable code block controls",
  "renders inline and display math through the registered Markdown renderer",
  "renders ICO through the registered image renderer after authenticated loading",
  "copies and downloads the original fenced code from Markdown preview",
  "contains renderer failures, exposes original text and recovers for another file",
  "retries a failed renderer without replacing the current file",
]);
requireCases("src/pages/Coding/TabbedEditor.test.tsx", [
  "releases hidden renderer resources and retains tabs and unsaved content",
  "keeps legacy artifact subscriptions unless its host manages updates",
]);
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
  "UGSci workspace: extension requests follow session ownership and late runtime identity",
  "UGSci workspace: legacy reveal requests retain the pending project directory",
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
requireCases("src/layouts/Sidebar.render.test.tsx", [
  "switches style layouts and restores independent sidebar choices without remounting plugins",
  "collapses a narrow sidebar on pointer %s and restores its previous width after reopening",
  "cancels a narrow resize without persisting a collapsed sidebar",
  "resizes the mounted sidebar by dragging and preserves its width and plugin state",
  "supports width limits, keyboard resizing and double-click reset on the mounted sidebar",
  "preserves the custom desktop width through the mobile overlay",
]);
requireCases("src/layouts/Header.test.tsx", [
  "uses the version as the only update entry",
  "shows background progress on the version and retries a failed download from it",
  "opens a downloaded update from the version and installs it only after confirmation",
]);
requireCases("src/utils/pageStyle.test.tsx", [
  "keeps the theme, layout and light-dark mode independent across switches and reloads",
  "synchronizes layout between windows without changing the color theme",
]);
requireCases("src/layouts/SidebarSettingsPanel.test.tsx", [
  "selects %s layout from Page style without changing the theme",
]);
requireCases("src/layouts/SidebarSessionList.test.tsx", [
  "opens minimal navigation search and preserves filtering when its presentation changes",
  "replaces the primary history header with focused search and restores it on Escape",
  "opens header search from collapsed history without losing its input across layouts",
]);
requireCases("src/layouts/Sidebar.render.test.tsx", [
  "keeps prototype navigation connected to registered apps, automation, workspace and plugin shortcuts",
  "groups More shortcuts and keeps settings in the account menu",
]);
requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: home common tasks fill the mounted composer without starting execution",
  "UGSci fork feature: composer approvals follow the active session and disappear on the home route",
  "UGSci fork feature: prototype Agent action opens real mention choices without submitting the draft",
]);
requireCases("src/pages/Chat/HostBubbles.render.test.tsx", [
  "shows real execution transitions in the mounted response without mistaking delivered arguments for completion",
  "mounts the persisted turn file summary in the real response and opens an immutable scoped version",
]);
requireCases("src/pages/Chat/HostBubbles.upstream-collapse.test.tsx", [
  "opens the current process while running and remounts it closed around the final answer",
  "applies %s to intermediate text and native process groups",
  "closes a %s turn and exposes a dangling native tool as interrupted",
  "keeps native thinking and tool disclosure independent inside the outer group",
  "hides thinking live without removing the native tool or final answer in expanded mode",
  "lazily mounts a real plugin record and preserves its draft, updates, and actions while open",
  "keeps approval requests visible outside process groups in %s",
]);
requireCases("src/pages/Chat/components/ExecutionProcess.test.tsx", [
  "lazily opens real native plugin records and preserves their live props and actions",
  "keeps a failed call visible after a later successful call and focuses its real record",
  "supports keyboard disclosure and never counts delivered arguments as completed execution",
]);
requireCases("src/pages/Chat/sessionApi/sessionApi.test.ts", [
  "restores the exact response attempt and client identity for persisted turn files",
]);
requireCases(
  "src/features/files-workspace/FilesWorkspace.integration.test.tsx",
  [
    "opens persistent delivered versions through the native editor without losing workspace drafts",
  ],
);
requireCases("src/features/files-workspace/TurnFileSummary.test.tsx", [
  "shows delivered images inline and links archived sibling pages without inventing deliveries",
  "prioritizes deliveries and keeps secondary archived changes accessible after expansion",
  "expands delivery and change lists independently without hiding unavailable deliveries",
  "opens the immutable version and current file through distinct scoped native targets",
  "never matches another attempt, agent, or session by a shared client message ID",
  "replaces misleading legacy hints even when the captured turn has no file changes",
]);
requireCases("src/pages/Chat/components/ComposerOptions.test.tsx", [
  "retains a control draft across dismissal and layout changes",
  "keeps portaled picker interaction open and closes on an outside pointer",
]);
requireCases("src/pages/Chat/components/ComposerAddMenu.test.tsx", [
  "delegates file selection to the original Upload without opening it for menu navigation",
  "keeps drafts while inserting available commands and mentions and restores focus on Escape",
]);
requireCases(
  "src/pages/Chat/components/ContextUsageIndicator/ContextUsageIndicator.test.tsx",
  [
    "keeps context controls available without inventing usage before a model is selected",
  ],
);
requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: composer add menu fills registered commands without sending or replacing the draft",
]);
requireCases(
  "src/features/project-directory/SessionProjectDirectory.test.tsx",
  [
    "closes the portaled directory picker when its containing composer menu closes",
  ],
);
requireCases("src/pages/Chat/components/ApprovalToggle.test.tsx", [
  "dismisses a nested %s approval picker without changing the saved policy",
]);
requireCases("src/contexts/ThemeContext.test.tsx", [
  "updates readable card action roles live across all palettes and modes without changing layout",
]);
requireCases("src/utils/actionColors.test.ts", [
  "uses WCAG luminance rather than a fixed light-dark text rule",
]);
requireCases("src/pages/Market/index.test.tsx", [
  "themes registered market cards without intercepting their install actions",
]);
requireCases("src/features/user-input/InteractionPanel.integration.test.tsx", [
  "creates the demo from FilesDrawer, preserves zero and selected parameters in saved drafts, reopens and queues the exact scoped answer",
  "retries a failed queued acknowledgement after remount without sending the saved answer to chat twice",
  "does not deliver a late submit result into a different conversation",
  "finishes an explicitly submitted answer after closing the drawer while the server response is pending",
  "retains a restored local draft when another window advances the revision and requires an explicit reload",
  "safely unloads the plugin and restores a persisted request and local draft after loading the shipped bundle again",
  "cancels an edited request without queuing it and cannot resurrect it from a stale poll or local draft",
  "retains the accepted answer when the real chat queue is full and retries admission after space becomes available",
  "keeps independent unsaved values when switching between requests with identical field names",
]);
requireCases("src/features/files-workspace/useSessionDeliverables.test.tsx", [
  "loads older pages with version deduplication, retries failures and resets on refresh",
  "discards an older history page after switching scope and restarts returning sessions at page zero",
  "rejects a non-advancing history cursor %s without losing results and retries the same page",
  "discards an in-flight history page when a turn update refreshes the first page",
  "ignores a pending response while hidden and reloads from the server when reopened",
]);
requireCases("src/plugins/expertPresentation.test.tsx", [
  "preserves drafts across settings tabs and saves only display metadata",
  "preserves advanced drafts and unknown running configuration fields when saving",
  "retains failed saves and confirms discarding an unsaved draft",
]);
requireCases("src/hooks/useBackgroundTaskWatcher.test.ts", [
  "isolates equal tool call ids when an older session is removed",
  "retries unavailable final output before completing the task",
  "confirms a missing status repeatedly before reading final output",
  "resolves a first-turn session after the original five-second window",
]);

requireCases("src/pages/Coding/MarkdownFileNavigation.integration.test.tsx", [
  "keeps loaded images when the link callback changes: %s",
  "loads relative images with the file's root and chat headers",
  "releases image blobs and cancels requests on replacement and unmount",
]);
requireCases("src/pages/Chat/components/ChatHome.test.tsx", [
  "resumes real recent sessions and updates scoped approval and running states",
  "inserts common tasks into the current composer without sending or replacing its draft",
]);
requireCases("src/pages/Chat/components/ApprovalQueueOverlay.test.tsx", [
  "mounts real approval controls in the composer anchor and removes them when resolved",
]);

requireCases("src/pages/Chat/hooks/useQueueSteering.test.tsx", [
  "steers explicitly without stopping and waits for adoption before removing the queued text",
  "quarantines an uncertain transport result and retries the identical request before receipt recovery",
  "preserves a refused run as a failed queue head without sending later messages",
  "restores an unresolved delivery after reload and adopts its receipt after the original run ends",
  "never retargets a delayed send receipt after navigating to a different agent and chat",
  "does not accept another run's receipt and a non-owner never retries an unknown delivery",
]);
requireCases("src/stores/messageQueueStore.test.ts", [
  "claims steering with a distinct persisted request identity and preserves the original FIFO",
  "keeps uncertain steering immutable through reload until the matching server receipt arrives",
  "returns unapplied steering as an explicit failed head and ignores receipts from an earlier attempt",
  "does not mistake a normal user history receipt for an applied steering receipt",
  "pins unresolved steering while allowing unrelated queue items to reorder",
  "preserves an already persisted steering claim when a stale tab calls %s",
  "does not resurrect a once-steered message from late pending or steering snapshots after %s",
  "ignores late receipt callbacks after an applied item removed its persisted queue",
  "retains the pending text and refuses steering when %s persistence fails",
  "does not erase unresolved steering through the legacy storage cleanup helper",
  "preserves authoritative %s before and after a late remote running snapshot for a steered queue",
  "does not write stale running over a returned steering error when a stale tab calls %s",
  "keeps a durable pause when a stale steering tab calls %s",
  "allows explicit retry and resume after steering returns while ignoring an older remote error snapshot",
  "keeps remote run-state updates unchanged for queues that never used steering",
]);
requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: the mounted queue steers the current run without cancelling or starting another turn",
  "UGSci fork feature: steering preserves attachments and Agent assignments in the normal queue",
  "UGSci fork feature: concurrent submission of one composer revision cannot create a second queued turn",
  "UGSci fork feature: %s Enter cannot enqueue the unchanged input while SDK admission is pending",
  "UGSci fork feature: a retyped identical draft remains a distinct submission during admission",
  "UGSci fork feature: repeated attachment-only admission queues one immutable attachment snapshot",
]);

requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: mounting recovers a paused other-chat steering receipt behind a pending head without sending it",
  "UGSci fork feature: navigation hands pending steering to background recovery before its original POST resolves",
  "UGSci fork feature: steering yields an automatic idle wait after reconnect without cancelling the active answer",
  "UGSci fork feature: unresolved steering behind the head blocks foreground sending through an idle transition until %s",
  "UGSci fork feature: another queued row cannot interrupt the current answer while any steering receipt is unresolved",
]);
requireCases("src/pages/Chat/chatRunLifecycle.test.ts", [
  "releases a pending readiness GET and gives the explicit steering claim the next send lock",
  "yields only the requested queue and unregisters completed readiness scopes",
  "releases the polling delay immediately and permits the next independent idle check",
  "leaves an unresolved sending marker intact when steering yields its receipt readiness wait",
]);
requireCases("src/pages/Chat/hooks/useQueueSteering.test.tsx", [
  "keeps the original history dirty when another tab adopts and removes the shared receipt first",
  "resolves an applied receipt while paused and preserves the remaining FIFO and agent identity",
  "retries an unknown background receipt using the original run id and request id without interrupting",
  "keeps uncertain background delivery quarantined and preserves a refused instruction as a failed head",
  "ignores a late background receipt after cancellation and rejects mismatched receipt text",
]);

requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: historical edit resend preserves the composer draft and attachments in a fresh queued turn",
  "UGSci fork feature: historical edit resend isolates Agent mention modes from the main composer and snapshots its own collaboration choice",
  "UGSci fork feature: historical edit resend retains its draft when the queue is full and submits once space is available",
  "UGSci fork feature: navigation invalidates a historical edit dialog and its retained action even after returning to the same Chat",
  "UGSci fork feature: historical edit %s Enter never sends or clears the separate composer draft",
]);
requireCases("src/pages/Chat/requestEditSnapshot.test.ts", [
  "reads native live builder content and keeps repeated text and attachments in order",
  "joins history text and labeled steering supplements without copying history metadata",
  "rebuilds native audio/video through fileList without changing their URLs or audio format",
  "keeps valid mixed attachments while declaring unsupported content instead of silently dropping it",
  "copies only validated mention modes from root metadata and strips all old request controls",
  "returns independent attachment and mode snapshots, preserving duplicate references",
]);

requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: historical edit replaces only its original bubble inline and cancel restores that bubble without a dialog",
]);
requireCases("src/pages/Chat/components/MessageEditResend.inline.test.tsx", [
  "edits at the original bubble while retaining plugin fallback, slots and footer instances through cancellation",
  "keeps one focused textarea while typing and edits only the selected identity among identical messages",
  "retains a draft across durable-identity refreshes and cancels a vanished legacy editor instead of moving it",
]);
requireCases("src/pages/Chat/requestEditSnapshot.test.ts", [
  "keeps a client identity across live/history clones and prefers it over original IDs",
  "uses outer or wrapped original metadata IDs with a separate namespace",
  "never matches different ID-less objects by identical text or second timestamps",
  "retains an opaque key for the same object and isolates each resolver closure",
]);

requireCases(
  "src/pages/Chat/components/ComposerKeyboard.integration.test.tsx",
  [
    "never admits or submits a composing Chinese Enter and submits the committed text on the next Enter",
    "keeps Shift Enter as an editable newline and sends the complete multiline draft only on plain Enter",
    "retains an inline Chinese edit during composing Enter and Escape, then cancels without queuing and restores action focus",
    "keeps a full-queue inline draft on %s Enter and enqueues exactly once after capacity returns without clearing the main input",
    "appends an inline keyboard resend without resolving or replacing an unconfirmed steering item",
  ],
);

requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: mounted normal queue editing sorting deletion and clearing update persisted items while paused",
  "UGSci fork feature: mounted normal queue pause and resume drain accepted turns once in FIFO order",
  "UGSci fork feature: mounted failed queue %s advances through real persisted state and SDK acceptance",
  "UGSci fork feature: mounted interrupt and send waits for %s cancellation and backend idle before dispatch",
]);

requireCases("src/pages/Chat/components/MessageQueuePanel.keyboard.test.tsx", [
  "keeps candidate confirmation Enter in the queue editor (%s) and saves only the committed legitimate Enter",
  "keeps the editor during composing Escape and cancels only a legitimate Escape without persisting its draft",
  "saves one ordinary Enter edit without changing identity, attachments or pause state",
  "gives every queue action a localized accessible button name and updates pause or resume with its run state",
  "preserves explicit blur saving and resets composition state before the next edit",
]);

requireCases("src/pages/Chat/chatInputDraft.sdk.test.tsx", [
  "restores a typed draft and its selection after a complete remount with the real metadata toolbar before the sender",
  "restores after a sender mounts beyond the old polling window without repeatedly rewriting an already mounted input",
  "restores the latest user revision into a replaced SDK sender and never resurrects a deliberately cleared draft",
  "does not resurrect a %s draft when host admission clears storage without a native input event",
  "uses the current stored revision for a replacement without rewriting the input still being edited",
]);

requireCases("src/plugins/usePluginLoader.test.ts", [
  "cleans partial registrations after evaluation failure without executing fallback",
  "serializes startup and deduplicates concurrent forced reloads",
  "removes a disabled plugin after an in-flight startup and rejects stale manifests",
  "does not remove a newly loaded app when an older manifest arrives late",
  "preserves a new load requested after an intervening unload",
]);
requireCases("src/pages/AppCenter/AppCenter.updates.test.tsx", [
  "updates through the real market and replacement API and opens the new registered UI",
  "keeps unavailable installed apps visible and never mounts their stale route",
  "follows dependency confirmation from the app market (apply=%s)",
  "updates an unavailable app without falsely activating its frontend",
]);
requireCases("src/pages/AppCenter/AppCard.test.tsx", [
  "keeps %s apps inspectable without opening them",
]);

requireCases("src/os/osCleanup.test.ts", [
  "awaits an in-flight bundle and removes its late route and desktop state",
]);
requireCases(
  "src/pages/Settings/PluginManager/hooks/usePluginManager.test.ts",
  ["updates disabled apps successfully without activating their UI (%s)"],
);

requireCases(
  "src/pages/Settings/PluginManager/hooks/useOfficialPlugins.test.ts",
  ["preserves the disabled runtime state when an official update completes"],
);
requireCases(
  "src/pages/Settings/PluginManager/hooks/useMarketPlugins.state.test.ts",
  ["preserves the disabled runtime state when a community update completes"],
);

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
