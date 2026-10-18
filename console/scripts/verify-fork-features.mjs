import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
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
    "src/pages/Chat/ChatPage.openFilePreview.test.tsx",
    "src/features/files-workspace/FilesDrawer.test.tsx",
    "src/features/files-workspace/FilesWorkspace.test.tsx",
    "src/features/files-workspace/filesDrawerState.test.ts",
    "src/stores/filesSurfaceStore.test.ts",
    "src/pages/Chat/components/ChatActionGroup/ChatActionGroup.test.tsx",
    "src/plugins/ugsciSidebarBundle.test.tsx",
    "src/plugins/ugsciSettings.test.tsx",
    "src/plugins/hostSdk/ugsciWorkflow.test.tsx",
  ],
};
const files = [...new Set(Object.values(suites).flat())];
for (const file of files) {
  if (!existsSync(path.join(root, file)))
    throw new Error(`Required fork regression suite missing: ${file}`);
}
const chatTests = readFileSync(path.join(root, suites.mentions[0]), "utf8");
for (const title of [
  "UGSci fork feature: sender placeholder advertises @ Agent assignment in %s",
  "UGSci fork feature: @ opens the real Agent picker and keyboard selection inserts a mention",
  "UGSci fork feature: @ %s survives SDK input clearing and routes the actual request",
  "UGSci fork feature: queued @ collaboration keeps the enqueue-time selection",
]) {
  if (!chatTests.includes(title))
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
  if (!settingsTests.includes(title))
    throw new Error(
      `Required UGSci settings integration case missing: ${title}`,
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
  if (!workspaceTests.includes(title))
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
