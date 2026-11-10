import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { inspectForkTestSource } from "./fork-test-source.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const guardTests = spawnSync(
  process.execPath,
  [
    "--test",
    path.join(root, "scripts/fork-test-source.test.mjs"),
    path.join(root, "scripts/verify-brand-assets.test.mjs"),
  ],
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
requireCases("scripts/verify-brand-assets.test.mjs", [
  "keeps content verification before every shared plugin release pack step",
  "verifies actual shipped assets and rejects changed installer content",
  "rejects missing mobile and extension icons",
  "checks built public assets and catches the desktop favicon regression",
]);
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
  workspaceTerminals: [
    "src/features/terminal/TerminalDock.test.tsx",
    "src/features/terminal/TerminalView.test.tsx",
    "src/features/terminal/terminalApi.test.ts",
    "src/features/terminal/terminalIdentity.test.ts",
    "src/features/terminal/terminalInput.test.ts",
    "src/features/terminal/terminalStyles.test.ts",
    "src/features/terminal/useTerminalEnabled.test.tsx",
    "src/stores/terminalSurfaceStore.test.ts",
  ],
  toolControlPolling: ["src/hooks/useToolCallControl.test.ts"],
  answerFileReferences: [
    "src/pages/Chat/fileReferenceMarkdown.test.ts",
    "src/features/files-workspace/internalFileLinks.test.ts",
    "src/pages/Chat/AssistantMarkdown.test.tsx",
  ],
  assistantVisuals: [
    "src/components/UgsciAssistantVisual.test.tsx",
    "src/components/UgsciMotion/index.test.tsx",
    "src/components/UgsciMotion/BackendLoadingPage.test.tsx",
    "src/components/LoadingState/index.test.tsx",
    "src/pages/Settings/Models/components/sections/LoadingState.test.tsx",
    "src/pages/Chat/components/ChatSessionTransition.test.tsx",
  ],
  upstreamIntegration: [
    "src/api/modules/pawapp.contract.test.ts",
    "src/layouts/useSidebarAppEntries.test.tsx",
    "src/layouts/MainLayout/MainLayout.settings.test.tsx",
    "src/features/files-workspace/FilesWorkspace.directory-confirmation.test.tsx",
  ],
  contextInspection: [
    "src/api/modules/chatContext.test.ts",
    "src/pages/Chat/hooks/useContextInspection.test.tsx",
    "src/pages/Chat/hooks/useContextDraftSources.test.tsx",
    "src/pages/Chat/components/ContextUsageIndicator/ContextInspector.test.tsx",
  ],
  sessionThinkingLifecycle: [
    "src/features/thinking/SessionThinking.test.tsx",
    "src/features/thinking/SessionThinking.saving.test.tsx",
  ],
  globalSearch: ["src/features/global-search/GlobalSearch.test.tsx"],
  deploymentConfiguration: ["vite.config.test.ts"],
  skillImport: ["src/pages/Agent/Skills/useSkills.paths.test.ts"],
  turnFileDelivery: [
    "src/api/modules/turnFiles.test.ts",
    "src/features/files-workspace/TurnFileSummary.test.tsx",
    "src/features/files-workspace/DeliveryFileActions.test.tsx",
    "src/features/files-workspace/deliveryFileNative.test.ts",
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
    "src/pages/Chat/LazyAccordion.test.tsx",
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
    "src/layouts/Sidebar.test.tsx",
    "src/App.runtime.test.tsx",
  ],
  mentions: [
    "src/pages/Chat/ChatPage.coverage.test.tsx",
    "src/pages/Chat/ChatPage.test.tsx",
    "src/pages/Chat/agentMentionSubmission.test.ts",
    "src/pages/Chat/components/useAgentMention.test.tsx",
    "src/pages/Chat/components/AgentMentionPopup.test.tsx",
    "src/pages/Chat/components/agentMentionModes.test.ts",
    "src/pages/Chat/components/agentMentionUtils.test.ts",
    "src/pages/Chat/components/ComposerTokenHighlights.test.tsx",
  ],
  submission: [
    "src/pages/Chat/answerQuotes.test.ts",
    "src/pages/Chat/components/AnswerQuoteComposer.test.tsx",
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
    "src/plugins/visualizationCapabilities.test.ts",
    "src/plugins/visualizationRenderers.test.ts",
    "src/plugins/visualizationDomains.integration.test.ts",
    "src/plugins/visualizationImports.test.ts",
    "src/plugins/visualizationArchitecture.test.ts",
    "src/plugins/visualizationCatalog.test.ts",
    "src/plugins/visualizationInspector.test.ts",
    "src/plugins/visualizationLayout.test.ts",
    "src/plugins/visualizationWorkbench.integration.test.ts",
    "src/plugins/visualizationWorkbench.races.test.ts",
    "src/utils/openExternalLink.test.ts",
    "src/utils/openHtmlFile.test.ts",
    "src/layouts/SidebarSessionList.test.tsx",
    "src/components/SessionItem/SessionItem.test.tsx",
    "src/pages/Chat/HostBubbles.render.test.tsx",
    "src/plugins/expertSummon.test.tsx",
    "src/plugins/expertPresentation.test.tsx",
    "src/plugins/expertAvatar.test.ts",
    "src/layouts/LocalAvatarPicker.test.tsx",
    "src/stores/localAvatarStore.test.ts",
    "src/layouts/SidebarSettingsPanel.test.tsx",
    "src/pages/Chat/ChatPage.openFilePreview.test.tsx",
    "src/features/files-workspace/FilesDrawer.test.tsx",
    "src/features/files-workspace/workbenchTabsStore.test.ts",
    "src/features/terminal/TerminalWorkbench.integration.test.tsx",
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
    "src/plugins/flowForgeGraph.test.tsx",
    "src/plugins/flowForgeEditor.test.tsx",
    "src/plugins/flowForgeInspector.test.tsx",
    "src/plugins/flowForgeRunInspector.test.tsx",
    "src/plugins/flowForgeI18n.test.ts",
    "src/plugins/flowForgeWorkbench.test.tsx",
    "src/plugins/flowForgeRunComparison.test.tsx",
    "src/plugins/flowForgeVariableBindings.test.tsx",
    "src/plugins/flowForgeRunAnalytics.test.tsx",
    "src/plugins/flowForgeApp.test.tsx",
    "src/layouts/MainLayout/NavigationGuard.test.tsx",
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
      "rotates mounted views around their displayed up axis and clears inertia across camera changes",
      "keeps mounted drag gestures out of hover picking and selection while ordinary clicks still select",
      "mounts two real engines with independent stores and keeps the surviving engine usable after disposal",
      "deletes a well overlay through its owner and releases detached and rendered resources exactly once",
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
    "src/plugins/visualizationDomains.integration.test.ts",
    [
      "loads every domain through real engine instances and preserves overlays, views, colors and independent disposal",
    ],
  ],
  [
    "src/plugins/visualizationImports.test.ts",
    [
      "keeps CSV explicit and preserves same-model companion selection across entry points",
      "aborts during the polling delay without another request or cancelling the conversion",
      "ignores late completion after disposal and keeps another observer independent",
      "preserves terminal failure identity for retry decisions and rejects empty results",
    ],
  ],
  [
    "src/plugins/visualizationCapabilities.test.ts",
    [
      "groups every spatial well alias as a selectable well and routes the actual tree selection",
      "keeps depth-only well aliases and unplaced logs out of spatial visibility",
      "opens a dimensioned slice in the section view even when the current view is reservoir",
    ],
  ],
  [
    "src/plugins/visualizationRenderers.test.ts",
    [
      "uses the same topology for primary and overlay surface, network and well objects",
      "retains slice converter hex cells and edge filtering while navigating to sections",
      "preserves explicit network segments and tube surfaces for actual ray picking",
      "keeps reservoir fill and edge filtering synchronized without changing source buffers",
      "releases shared geometry and material once and leaves another handle usable",
    ],
  ],
  [
    "src/plugins/visualizationCatalog.test.ts",
    [
      "shows only populated data groups and keeps search independent of saved folds",
      "lists only visible spatial layers and removes hidden rows on the next render",
      "keeps selection independent of the active analysis and opens only through its explicit action",
      "updates selection in place while retaining keyboard focus and the full double-click sequence",
      "shows declared parent provenance and searchable sources without inferring name-based relationships",
      "keeps depth-only logs openable while preventing their spatial visibility",
      "preserves legacy selection and isolates keyboard open, focus, visibility, deletion and context actions",
    ],
  ],
  [
    "src/plugins/visualizationInspector.test.ts",
    [
      "keeps stable tab IDs and original control keys while using object, analysis and scene labels",
      "groups current grid controls without replacing nodes, listeners or entered values",
      "retains IJK operations for a dimensioned slice but rejects missing or invalid dimensions",
      "keeps well and depth-log attributes available while limiting geometry operations to their supported targets",
      "hides current-dataset actions when an overlay is selected and preserves global access with no object",
      "restores applicable rows with their original values and keeps separate inspectors independent",
      "synchronizes disabled switch buttons and ignores disabled interaction until reenabled",
    ],
  ],
  [
    "src/plugins/visualizationLayout.test.ts",
    [
      "reserves one central corridor and separates the top and bottom control rows",
      "stacks measured overlays clear of the footer and each other",
      "preserves feature visibility and releases space from hidden controls on resize",
      "prioritizes readable details in short windows without negative or offscreen bounds",
      "keeps a narrow log chart between the tabs and footer without 3D overlays",
      "navigates only the visible workbench tabs while retaining the legacy default",
    ],
  ],
  [
    "src/plugins/visualizationWorkbench.integration.test.ts",
    [
      "inspects without replacing analysis and preserves scene handles plus saved analysis settings on explicit open",
      "keeps selection, layer visibility, analysis switches and disposal isolated between mounted workbenches",
      "preserves per-layer clipping through origin and vertical-scale changes and restores clipping plus K-layer controls",
    ],
  ],
  [
    "src/plugins/visualizationWorkbench.races.test.ts",
    [
      "keeps an existing layer hidden when its visibility changes during another analysis load",
      "offers a working retry on the selected object card after an analysis request fails",
      "rejects earlier A and B completions while the latest A generation owns analysis and geometry",
      "stops old time-step playback as soon as a different analysis starts loading",
      "rejects delayed cell details after selecting a well or opening network analysis",
      "preserves isolate and show-all visibility when reopening cached analysis",
      "limits the footer reset to the selected current analysis without changing another layer",
      "disables object visibility for empty catalogs and depth-only logs and clears playback on empty refresh",
      "stops grid time and slice playback when the refreshed catalog becomes empty",
    ],
  ],
  [
    "src/plugins/visualizationArchitecture.test.ts",
    [
      "keeps capability and import catalogs independent of rendering, UI, transport and host modules",
      "keeps domain renderers and shared scene resources independent of workbench orchestration",
      "has no runtime dependency cycles across catalogs, domain renderers and shared geometry helpers",
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
requireCases("src/pages/Coding/TabbedEditor.test.tsx", [
  "applies a pending file reference after the destination tab becomes active",
]);
requireCases("src/hooks/useToolCallControl.test.ts", [
  "bounds slow polling requests and resumes after failure without losing offload detection",
  "ignores slow polling results from a previous tool after switching identity",
]);
requireCases("src/pages/Chat/AssistantMarkdown.test.tsx", [
  "does not rerender unchanged answer plugins during unrelated composer updates",
  "keeps slash-separated prose literal beside real file and directory references with plugins=%s",
  "opens inline directory locations in the file manager with original scope and plugins=%s",
  "opens inline and plain filenames from historical answers with plugins=%s",
  "keeps file mention routing when a streamed filename finishes and is restored from history",
  "opens file references through the real Markdown renderer with plugins=%s",
  "keeps streamed file references and history on the same original destination",
  "keeps answer text selectable for quoting across a file reference",
  "adopts a newly allocated session and keeps references bound to it across later navigation",
]);
requireCases("src/features/files-workspace/internalFileLinks.test.ts", [
  "opts into directory roots and trailing separators without weakening file parsing",
]);
requireCases("src/pages/Chat/fileReferenceMarkdown.test.ts", [
  "preserves every byte and reference in a large mixed file list",
  "keeps slash-separated prose literal across Unicode words and inline formatting",
  "recognizes separated and explicitly formatted paths while excluding joined prose",
  "decorates full Windows and POSIX directory paths and preserves file line suffixes",
  "decorates inline and plain file mentions without nesting links or modifying fenced examples",
  "supports quoted Chinese and spaced filenames and consumes URLs before file matching",
  "preserves long non-file tokens while recognizing the following filename",
]);
requireCases("src/pages/Chat/HostBubbles.render.test.tsx", [
  "turns a historical inline PROFILE.md mention in the real assistant response into a scoped configuration link",
  "opens a file citation from the actual assistant response with its original session and line range",
]);
requireCases("src/pages/Chat/ChatPage.openFilePreview.test.tsx", [
  "opens an actual directory citation through ChatPage's scoped file manager handler",
  "opens an actual file citation inside ChatPage without losing its scope or line range to capture delegation",
]);
requireCases("src/features/files-workspace/FilesWorkspace.test.tsx", [
  "opens a bare configuration citation through the original agent configuration API",
  "reuses a dirty configuration buffer for an absolute agent workspace citation",
  "opens absolute answer references in a secondary bound directory and forwards line navigation",
  "rejects absolute answer references outside the session directories",
]);
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
requireCases("src/layouts/Sidebar.test.tsx", [
  "registers Workflows after Experts against the optional FlowForge route",
]);
requireCases("src/layouts/Sidebar.render.test.tsx", [
  "keeps visualization full width through late registration and restores the saved sidebar in $pageStyle with collapse $savedCollapsed",
  "opens visualization from the rail and restores mounted conversation and plugin drafts on return",
  "keeps workspace and app links full width in $pageStyle at $path with saved collapse $savedCollapsed",
  "opens workspace and apps full width from chat and restores drafts in %s",
  "keeps the full extension area on the rail across real marketplace tab navigation",
  "hides conversations before the workflow plugin finishes registering its route",
  "uses the navigation rail for direct workflow pages in %s",
  "keeps the workflow rail compact across mobile and desktop viewports",
  "opens Workflows below Experts with a full workspace and restores conversation state in %s",
  "keeps direct workflow links full width with saved conversation collapse %s",
  "hides the workflow shortcut when its route is unavailable or explicitly hidden",
  "switches style layouts and restores independent sidebar choices without remounting plugins",
  "connects Dual sidebar Home schedules experts workspace and plugin shortcuts through registered routes",
  "keeps Dual sidebar conversation and plugin drafts mounted while its second pane collapses and styles switch",
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
  "restores the retired layout as Simple style and offers only supported choices",
  "persists Dual sidebar independently from the palette and restores it after reload",
]);
requireCases("src/pages/Chat/LazyAccordion.test.tsx", [
  "supports keyboard disclosure and connects the summary to its process region",
  "does not render process children until the closed group is opened",
  "unmounts process children when the group closes again",
  "ignores clicks on an accordion nested inside process content",
  "keeps the clicked header anchored when opening shifts its position",
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
requireCases("src/components/UgsciAssistantVisual.test.tsx", [
  "replaces animated SVG images immediately when the system motion preference changes",
]);
requireCases("src/pages/Chat/HostBubbles.render.test.tsx", [
  "keeps an errored provisional response terminal after a later response completes",
  "does not attribute legacy ambient files or snapshot warnings to a saved greeting without tools",
  "uses supplied assistant motion for active tools and static results after the turn ends",
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
  "opens concrete capture reasons directly from the incomplete warning",
  "keeps proven deliveries when hiding unowned ambient changes from a legacy turn",
  "keeps browser card and primary preview on the archived version with menu downloads",
  "disables unavailable browser delivery actions while retaining the available turn archive",
  "shows delivered images inline and links archived sibling pages without inventing deliveries",
  "prioritizes deliveries and keeps secondary archived changes accessible after expansion",
  "expands delivery and change lists independently without hiding unavailable deliveries",
  "opens the immutable version and current file through distinct scoped native targets",
  "never matches another attempt, agent, or session by a shared client message ID",
  "replaces misleading legacy hints even when the captured turn has no file changes",
]);
requireCases("src/features/files-workspace/DeliveryFileActions.test.tsx", [
  "uses built-in preview in browsers and exposes no native application or location actions",
  "shows the actual default application icon and directly opens the archived target with its scope",
  "opens a chosen Word application once without changing the system default shown on the primary button",
  "reveals the same archive version and scope while filtering the legacy workspace location action",
  "offers built-in preview after association enumeration fails and retries the real menu request",
  "keeps unavailable archive actions disabled while allowing an explicit current-workspace extra action",
  "invalidates an in-flight native action when navigation changes scope and ignores its late failure",
  "invalidates callbacks on unmount and ignores a native action's later rejection",
  "closes the actual dropdown on Escape and restores focus to its trigger",
]);
requireCases("src/features/files-workspace/deliveryFileNative.test.ts", [
  "fetches exact archived bytes with owning scope headers and opens only its native token",
  "never falls back to the workspace when an archive has no URL or returns an error",
  "invalidates a failed native copy so the next explicit action re-stages the archive",
  "does not stage an old account's late response after credentials change",
  "does not open a program after a late staging response",
  "rejects mismatched artifact ownership without reading bytes",
  "rejects an external archive URL before sending credentials or reading a fallback URL",
  "sends scope headers to the configured desktop backend even when it differs from the WebView origin",
  "does not trust the WebView origin as an archive backend after a desktop backend is configured",
  "reads legacy external files without private headers or cookies and refuses redirects",
  "does not stage or retry a backend response when fetch rejects a redirect",
  "cancels a late response when the configured backend changes",
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
  "renders the approved compact single-page avatar workshop without duplicate role previews",
  "retains inline avatar colors across expert settings tabs and resets the palette independently",
  "opens a read-only full introduction from the expert name and keeps configuration in settings",
  "assigns and persists an identity-matched avatar through actual blank expert creation",
  "assigns an identity-matched avatar when creating an expert from a template",
  "discards a late avatar load after closing a card and opening a different expert",
  "matches legacy expert identities and opens the local avatar studio from the actual card",
  "persists composed avatar recipes from cards and restores them after remount without overwriting display metadata",
  "retains avatar edits on conflicts and supports retry and identity rematching",
  "preserves drafts across settings tabs and saves only display metadata",
  "preserves advanced drafts and unknown running configuration fields when saving",
  "retains failed saves and confirms discarding an unsaved draft",
]);
requireCases("src/plugins/expertAvatar.test.ts", [
  "reuses bounded SVG templates and invalidates every rendered recipe input",
  "evicts old templates by count and text budget and bypasses oversized entries",
  "preserves mounted SVG nodes during unrelated updates and refreshes changed colors",
  "colors every composed part independently across all roles while preserving theme defaults and transparent cutouts",
  "renders all 72 original roles and maps their identities to the same valid recipes",
  "escapes custom labels and keeps composed badge clip paths distinct",
  "prioritizes the expert name and ignores boilerplate identity trailers",
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
  "persists the explicit keep-original choice %s and resets each new edit to replacement",
  "blocks replacement without a durable target and permits explicit preservation",
  "edits at the original bubble while retaining plugin fallback, slots and footer instances through cancellation",
  "keeps one focused textarea while typing and edits only the selected identity among identical messages",
  "retains a draft across durable-identity refreshes and cancels a vanished legacy editor instead of moving it",
]);
requireCases("src/pages/Chat/requestEditSnapshot.test.ts", [
  "resolves backend rewind targets from client or original IDs without inferring request IDs",
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
  "avoids document scans during answer mutations and still restores a replaced real sender",
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

requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: historical edit keep-original %s reaches the transport and refreshes replacement history",
]);

requireCases("src/pages/Chat/answerQuotes.test.ts", [
  "isolates persistent quote drafts and consumes only the admitted selection",
  "preserves quotes through mention dispatch, attachment transport, retry and edit reconstruction",
]);
requireCases("src/pages/Chat/components/AnswerQuoteComposer.test.tsx", [
  "quotes rendered text and code independently while preserving draft and plugin inputs",
  "rejects non-answer, cross-message and interactive selections and dismisses stale menus",
  "renders stored quotes collapsed with the real SDK card and retains media and actions",
]);
requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: answer quote admission freezes multiple passages and keeps newer selections",
  "UGSci fork feature: answer quotes survive durable queue admission and full queue rejection",
  "UGSci fork feature: keyboard queue submission includes the mounted compact quote draft",
]);
requireCases("src/pages/Chat/components/MessageEditResend.inline.test.tsx", [
  "preserves quoted passages when editing and resending a real SDK request",
]);

console.log(`Fork feature inventory verified: ${files.length} suites.`);
requireCases("src/features/global-search/GlobalSearch.test.tsx", [
  "searches real scoped APIs from the mounted dialog and opens an exact message without changing the draft",
  "cancels obsolete searches and keeps the query when reopening with the keyboard",
  "searches immutable delivery records and reports partial failures instead of an empty success",
  "locates a loaded message only inside the target agent and chat",
  "filters delivery results and exposes a recoverable list error in the mounted dialog",
]);
requireCases("src/layouts/MainLayout/MainLayout.accessibility.test.tsx", [
  "mounts global search without replacing the active route",
]);
requireCases("src/api/modules/chatContext.test.ts", [
  "reads an explicitly scoped encoded chat without creating messages or model calls",
]);
requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "UGSci fork feature: mounted context inspector removes and restores real draft quotes before submission and invalidates undo",
  "UGSci fork feature: mounted context inspector retries scoped inspection and keeps saved sources and summaries read-only",
  "UGSci fork feature: mounted context inspector discards a previous chat response after navigation",
  "UGSci fork feature: mounted context inspector closes when runtime identity changes within the same chat",
  "UGSci fork feature: mounted context inspector new chat preserves unknown capacity and resets only known context windows",
]);
requireCases("src/pages/Chat/hooks/useContextInspection.test.tsx", [
  "loads only while open and refreshes the saved snapshot after execution changes",
  "aborts old visits and never shows a late result after switching away and back",
  "rejects mismatched session evidence and offers retry without retaining prior records",
  "marks legacy sources unknown and avoids querying new chats or unsupported backends",
]);
requireCases("src/pages/Chat/hooks/useContextDraftSources.test.tsx", [
  "UGSci fork feature: removes real pending quotes and restores their identity without replacing newer draft selections",
  "invalidates undo on submission without changing its immutable quote snapshot",
  "rejects stale actions across agent or chat visits even after returning to the original draft",
]);
requireCases(
  "src/pages/Chat/components/ContextUsageIndicator/ContextInspector.test.tsx",
  [
    "opens from the existing dial on click and preserves usage and cache details",
    "previews supplied draft text and delegates removal and undo without changing saved sources",
    "shows recorded evidence and the exact stored summary without inventing rule or memory inclusion",
    "keeps drafts available during remote loading and replaces stale records with retryable errors",
    "supports keyboard tabs and Escape, and closes on scope or containing overlay changes",
    "disables compaction while executing but preserves the new conversation action",
    "keeps sources usable without model capacity and distinguishes unavailable and uncompressed summaries",
  ],
);
requireCases("src/plugins/flowForgeGraph.test.tsx", [
  "rejects incompatible occupied and cyclic data bindings without coercing runtime types",
  "preserves bounded refinement routes while rejecting duplicate control destinations",
  "binds the selected typed output through the real canvas serializer and keeps other inputs",
  "keeps explicit zero defaults and exposes node-addressable errors from old and new servers",
]);

requireCases("src/plugins/flowForgeEditor.test.tsx", [
  "groups infrequent actions without losing version input configuration or layout in %s",
  "locates a required field in the real inspector and saves its corrected value",
  "rejects an obsolete successful validation when the draft changes before trial execution",
  "does not open a run after leaving the editor while validation is pending",
  "isolates a late save across flow visits including returning to the original flow",
  "resolves existing input bindings after the node catalogue arrives later than the flow",
  "identifies and selects an edge-only diagnostic from %s so the actual editor can remove that connection",
]);

requireCases("src/plugins/flowForgeInspector.test.tsx", [
  "focuses structured schema JSON pointer errors in the actual field without losing their detail",
  "edits structured model schemas through the real inspector and preserves bilingual business keys",
  "edits bilingual system instructions while preserving the linked user prompt",
  "loads real host agent choices without replacing saved ids and edits multiline tasks",
  "aborts old directory requests and rejects late responses across agent and flow scope",
  "keeps saved values on directory failures and retries malformed responses explicitly",
  "uses current edges as read-only input sources before serialization and preserves controls",
  "localizes schema fields and focuses validation without offering an unsupported model override",
  "renders named typed ports and keeps configuration diagnostics separate from actual run status",
]);

requireCases("src/plugins/flowForgeRunInspector.test.tsx", [
  "preserves node identity output keys while masking credentials inside their values",
  "ignores a late review response after %s of the run monitor",
  "inspects immutable node observations and distinguishes waiting skipped and unexecuted nodes",
  "shows node errors and fallback event timings without exposing legacy credential fields",
  "keeps review resume cancellation and parent child run navigation on the actual monitor",
  "reconnects authenticated SSE with CRLF frames and preserves repeated events without replay duplicates",
  "isolates late record responses after switching runs and aborts the old event request",
]);

requireCases("src/features/thinking/SessionThinking.test.tsx", [
  "does not reload session thinking when only notifications change",
  "reports a pending thinking load failure through current notifications",
]);
requireCases("src/features/thinking/SessionThinking.saving.test.tsx", [
  "finishes submitted saves after switching away (first fails=%s)",
  "waits for the same chat's writes after return or remount (remount=%s)",
]);

requireCases("src/layouts/MainLayout/NavigationGuard.test.tsx", [
  "guards real BrowserRouter-compatible pushes and retries exactly once with original state",
  "preserves replace semantics and invalidates a pending retry on unmount",
]);

requireCases("src/plugins/flowForgeApp.test.tsx", [
  "resizes the mounted debug dock with mouse and touch while preserving bilingual run content",
  "clamps dragged and keyboard dock heights to the real available workspace",
  "releases dock resize capture on cancellation blur collapse close and unmount",
  "opens the actual editor from the workflow list and preserves router history state",
  "mounts a deep-linked run in the bottom debugger and clears it when the selected agent changes",
  "switches the real workflow list to English while preserving names and revision values",
  "keeps the latest requested run inputs and rejects a late response after opening another workflow",
]);

requireCases("src/plugins/flowForgeRunComparison.test.tsx", [
  "compares immutable run inputs outputs and configuration while retaining zero and masking credentials",
  "rejects unrelated workflow snapshots and ignores a late comparison across run and agent scope",
  "filters real run history and compares two selected saved runs",
  "clears an aborted comparison spinner and retains nodes whose only difference is duration",
  "keeps docked monitoring and actual record callbacks alive while collapsed and switches its interface language",
  "keeps draft identity stable across token refresh and isolates a late account response",
]);

requireCases("src/plugins/flowForgeWorkbench.test.tsx", [
  "recovers bilingual drafts after remount and clears only the successfully saved content",
  "isolates local drafts by authenticated account and execution agent",
  "keeps newer edits when an earlier save completes and refreshes the draft revision",
  "preserves another editor draft when one concurrent editor saves",
  "reports unavailable local draft storage and still allows a server save",
  "guards host sidebar navigation and preserves an acknowledged draft before retrying once",
  "keeps a stale recovered draft on revision conflict without overwriting the newer server revision",
  "docks a resizable inspector beside the real canvas and keeps optional node ports compact",
  "runs a selected node with fixed bilingual slots while leaving normal run inputs independent",
  "saves named Chinese English and mixed test cases and excludes another agent's run variables",
  "recovers valid drafts alongside a corrupt record while retaining the corrupt source",
  "requires confirmation again after an acknowledged same-page navigation",
  "guards native browser back and consumes approval for only the requested history entry",
  "ignores a late debug response after switching the execution agent",
  "keeps invalid debug JSON editable and sends no execution request",
  "preserves source run revision and edited provenance when a named sample is restored",
  "localizes the mounted workbench while preserving authored bilingual node content",
]);

requireCases("src/plugins/flowForgeVariableBindings.test.tsx", [
  "hides values only for changed source configurations while preserving unaffected upstream observations",
  "binds observed nested bilingual object fields and locates their real source output",
  "retains typed whole-output bindings and named canvas handles through the existing serializer",
  "withholds stale foreign unversioned and unrecorded values without reading configured or summary values",
  "completes stable slot expressions and validates missing fields types cycles and incomplete paths immediately",
  "exposes text model content through slot zero while withholding the inactive parsed slot",
  "offers parsed fields only in structured mode and keeps array slot paths executable",
  "localizes the actual variable inspector and completion while keeping authored Unicode keys intact",
]);

requireCases("src/plugins/flowForgeRunAnalytics.test.tsx", [
  "falls back to raw output when the same observed node changes to an incompatible result shape",
  "resets output views and slots when switching observed nodes and closes the previous node file loader",
  "uses recorded timestamps and explicit retries with honest legacy gaps and failure aggregation",
  "estimates only recorded token usage with explicit currency and per-million rates including zero",
  "switches actual node output between raw text expandable JSON and object-array tables without changing zero false or bilingual values",
  "bounds table pages JSON expansion and file discovery while preserving the complete raw value",
  "opens safe files through the real host preview contract using the recorded agent and redacted content",
  "previews desktop SDK API files across origins while keeping record URLs and credentials scoped",
  "views actual LLM and script output slots explicitly while preserving bilingual zero false and complete raw outputs",
  "closes an old slot file preview and ignores its late loader after choosing another observed slot",
  "keeps failed host preview loading visible and retryable while legacy records without agent context stay disabled",
  "translates a file preview availability error live without repeating a file request",
  "ignores a late preview resolver after switching runs and keeps arbitrary remote links as recorded text",
]);

requireCases("src/plugins/flowForgeI18n.test.ts", [
  "localizes unavailable structured output diagnostics while retaining field and edge locations",
  "localizes actual builtin class ids and distinguishes validated JSON calls without rewriting business values",
  "localizes connection and required-input diagnostics while retaining node and field identities",
  "covers every static workflow interface translation with an English resource",
  "interpolates bilingual business values while keeping stored identifiers intact",
  "uses the host language with regional codes and retains the legacy Chinese fallback",
]);

requireCases("src/plugins/hostSdk/flowforgeModel.test.ts", [
  "localizes model call presentation and runtime diagnostics while retaining legacy identities",
]);

requireCases("src/plugins/flowForgeInspector.test.tsx", [
  "switches live node settings between Chinese and English while preserving model overrides and business values",
  "translates a recorded agent directory failure after a live language switch without refetching",
]);

requireCases("src/plugins/flowForgeApp.test.tsx", [
  "isolates an admitted run dialog and its late failure after changing the execution agent",
  "follows run query changes through browser history and clears an externally removed run",
]);

requireCases("src/plugins/flowForgeWorkbench.test.tsx", [
  "tracks clean and acknowledged same-page pushes before guarding native back",
  "recovers valid named samples alongside corruption and resets case state across scopes",
]);

requireCases("src/plugins/flowForgeApp.test.tsx", [
  "writes the admitted run into its URL and clears it when monitoring closes",
]);

requireCases("src/components/UgsciMotion/index.test.tsx", [
  "uses local browser-cacheable assets for %s and reuses the mounted image",
  "shares observers and subscriptions and releases them after the last instance",
  "stops offscreen and hidden-page animations and responds to reduced motion",
  "does not create frame callbacks or timers while rendering and updating",
  "keeps native button busy guards and removes the icon after completion",
  "uses cached startup assets in the pre-React bootstrap without a script loop",
  "loops assembled startup eyes rightward and traces all four rounded page edges",
  "ships only twelve bounded vector assets with finite logo assembly and static fallbacks",
]);
requireCases("src/components/UgsciMotion/BackendLoadingPage.test.tsx", [
  "uses the startup mark with actual progress and stops on failure while preserving retry",
]);

requireCases("src/features/files-workspace/FilesDrawer.test.tsx", [
  "keeps seven labelled side activities and docked controls available with an empty workspace",
]);
requireCases(
  "src/features/files-workspace/FilesWorkspace.integration.test.tsx",
  [
    "keeps docked controls and native drafts while folding the file navigator",
    "restores the folded navigator from a graph tab in the unified workspace",
  ],
);
requireCases(
  "src/features/files-workspace/FilesNavigator.interaction.test.tsx",
  [
    "switches compact file sources and memory tags through the actual source menu",
  ],
);

requireCases("src/pages/Chat/ChatPage.test.tsx", [
  "keeps plugin renderer identities through unrelated chat updates",
]);
requireCases("src/pages/Chat/ChatPage.coverage.test.tsx", [
  "does not inherit queue-only ownership or reload history when switching chats",
]);
requireCases("src/pages/Chat/sessionApi/sessionApi.test.ts", [
  "starts a fresh load when returning to an aborted in-flight session",
  "rejects an already aborted switch even when its history is cached",
]);

requireCases("src/layouts/MainLayout/MainLayout.settings.test.tsx", [
  "retains the dual-sidebar feature rail across core and plugin settings and history",
]);
requireCases("src/layouts/Sidebar.render.test.tsx", [
  "keeps only the feature rail in settings and restores conversation state on return",
  "preserves the app return target when reopening settings from the rail (plugin %s)",
]);

requireCases("src/layouts/Sidebar.render.test.tsx", [
  "renders ordered custom apps and modules below More and follows their real routes",
]);
requireCases("src/pages/SettingsCenter/NavigationSettings.test.tsx", [
  "adds apps and modules to the dual-sidebar rail without changing the original shortcuts",
  "removes and resets dual-sidebar shortcuts through the existing editor",
  "keeps the existing More menu editor available beside custom rail settings",
]);
requireCases("src/stores/sidebarStore.test.ts", [
  "persists custom rail order independently and keeps unavailable app identities",
]);
requireCases("src/layouts/useSidebarAppEntries.test.tsx", [
  "uses available installed apps and refreshes after install, disable and uninstall",
  "ignores stale replies and supports retry after a failed app list request",
]);

requireCases("src/api/modules/pawapp.contract.test.ts", [
  "refreshes app shortcuts only after a confirmed successful uninstall",
]);

requireCases("src/features/files-workspace/workbenchTabsStore.test.ts", [
  "keeps tool selection when native file references hydrate and change",
  "closes adjacent views and retains exact scoped identities in recent content",
  "migrates pending scopes explicitly and removes deleted conversation content",
  "clears rebound project resources from open and recent tabs while preserving workspace files and remote browser drafts",
]);
requireCases("src/features/files-workspace/FilesDrawer.test.tsx", [
  "opens mixed content in one strip and restores an independent browser draft from recent content",
  "keeps dirty native buffers after cancel or save failure and closes only after a successful scoped save",
  "shows only this runtime's running tasks in the empty workspace and closes their view without cancelling work",
  "does not reopen a late file read after the user closes the remaining content",
  "closes several native file views atomically and clears the final active buffer reference",
  "opens a Codex-style new tab with working tools and restores recent views without losing the native draft",
  "applies the native directory-rebinding boundary to content tabs and recent files without resetting remote drafts",
]);
requireCases("src/features/user-input/InteractionPanel.integration.test.tsx", [
  "preserves the shipped interaction form draft across content tabs and suspends hidden panel polling",
]);

requireCases("src/features/terminal/TerminalWorkbench.integration.test.tsx", [
  "opens a scoped terminal from the mounted new tab and restores its process after closing only the view",
  "moves the same terminal between the workspace and bottom panel with only one active rendering surface",
  "keeps the existing terminal authentication requirement and never creates a process when capability is disabled",
  "keeps terminal ownership separate when the mounted workspace changes experts",
]);

requireCases("src/styles/layout.test.ts", [
  "uses shared control metrics and inverse foregrounds on accent-filled workspace buttons",
]);

requireCases("src/pages/AppCenter/index.test.tsx", [
  "returns sidebar-launched apps to their exact origin via %s",
  "closes a fresh app deep link to the chat home",
  "keeps slow app entry inside its own shell without mounting the catalog",
  "never mounts the catalog while returning from a router-launched app",
  "keeps failed app entry in its shell and retries the real app list",
]);

requireCases("src/features/terminal/TerminalDock.test.tsx", [
  "adds and switches independent tabs, and collapses without terminating",
  "does not remount the chat SDK or show another conversation's tabs",
  "closes the selected process only when its close button is pressed",
]);
requireCases("src/features/terminal/TerminalView.test.tsx", [
  "delivers accepted input even when the user switches tabs immediately",
  "waits for rendering before requesting more output and cancels on unmount",
  "preserves paste order and changes theme without restarting the PTY view",
]);
requireCases("src/features/terminal/terminalApi.test.ts", [
  "uses the server chat directory for a saved conversation",
  "does not create a terminal in a fallback directory while loading a chat",
]);
requireCases("src/features/terminal/terminalIdentity.test.ts", [
  "keeps the PTY group through both stages of draft allocation",
  "isolates different agents and conversations",
]);
requireCases("src/features/terminal/terminalInput.test.ts", [
  "keeps supplementary Unicode intact at the frame boundary",
]);
requireCases("src/features/terminal/terminalStyles.test.ts", [
  "covers the unused row space with the terminal theme, not xterm black",
]);
requireCases("src/features/terminal/useTerminalEnabled.test.tsx", [
  "fails closed when capability loading fails",
  "restores the cached status when switching back to an agent",
]);
requireCases("src/stores/terminalSurfaceStore.test.ts", [
  "isolates visibility by session",
  "migrates an open draft to its persisted session",
]);

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
