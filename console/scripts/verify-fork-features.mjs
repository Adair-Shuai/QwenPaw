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
    "src/pages/Agent/MCP/components/MCPAccessModal.largeCatalog.test.tsx",
    "src/pages/Agent/MCP/components/MCPClientCard.test.tsx",
    "src/plugins/documentForms.test.tsx",
    "src/plugins/storageCapacity.test.tsx",
    "src/plugins/hostSdk/ugsciWorkflow.test.tsx",
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
    "src/plugins/storageCapacity.test.tsx",
    [
      "runs the mounted page from editable parameters to report and invalidates stale exports",
      "maps uploaded evidence into real unit inputs without overwriting existing units",
      "keeps deterministic results available when optional agent review fails",
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
]) {
  if (
    !inspectForkTestSource(
      "ChatPage.openFilePreview.test.tsx",
      workspaceTests,
    ).has(title)
  )
    throw new Error(`Required workspace integration case missing: ${title}`);
}
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
