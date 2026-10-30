import "../../monacoSetup";
import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from "../../contexts/ThemeContext";
import type { TurnFileDiff } from "../../api/modules/turnFiles";

export default function TurnFileDiffViewer({ diff }: { diff: TurnFileDiff }) {
  const { isDark } = useTheme();
  return (
    <DiffEditor
      height="320px"
      original={diff.before}
      modified={diff.after}
      theme={isDark ? "vs-dark" : "light"}
      options={{
        readOnly: true,
        originalEditable: false,
        renderSideBySide: false,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on",
        renderOverviewRuler: false,
        hideUnchangedRegions: { enabled: true },
        accessibilitySupport: "on",
      }}
    />
  );
}
