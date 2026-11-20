import "../../monacoSetup";
import { DiffEditor } from "@monaco-editor/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import type { TurnFileDiff } from "../../api/modules/turnFiles";
import styles from "./TurnFileDiffViewer.module.less";

export default function TurnFileDiffViewer({
  diff,
  sideBySide: controlledSplit,
  wrapLines: controlledWrap,
  hideToolbar = false,
}: {
  diff: TurnFileDiff;
  sideBySide?: boolean;
  wrapLines?: boolean;
  hideToolbar?: boolean;
}) {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [sideBySide, setSideBySide] = useState(false);
  const [wrap, setWrap] = useState(true);
  return (
    <div>
      {!hideToolbar && (
        <div className={styles.toolbar}>
          <button
            type="button"
            aria-pressed={sideBySide}
            onClick={() => setSideBySide(true)}
          >
            {t("turnFiles.diffSplit")}
          </button>
          <button
            type="button"
            aria-pressed={!sideBySide}
            onClick={() => setSideBySide(false)}
          >
            {t("turnFiles.diffUnified")}
          </button>
          <label>
            <input
              type="checkbox"
              checked={wrap}
              onChange={(event) => setWrap(event.target.checked)}
            />
            {t("turnFiles.diffWrap")}
          </label>
        </div>
      )}
      <DiffEditor
        height="320px"
        original={diff.before}
        modified={diff.after}
        theme={isDark ? "vs-dark" : "light"}
        options={{
          readOnly: true,
          originalEditable: false,
          renderSideBySide: controlledSplit ?? sideBySide,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: controlledWrap ?? wrap ? "on" : "off",
          renderOverviewRuler: false,
          hideUnchangedRegions: { enabled: true },
          accessibilitySupport: "on",
        }}
      />
    </div>
  );
}
