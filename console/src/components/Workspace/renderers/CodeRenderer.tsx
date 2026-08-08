/**
 * Thin renderer-registry adapter around the upstream Files Workspace Monaco
 * editor. File navigation, tabs, saving and diffs remain owned by
 * pages/Coding/TabbedEditor; this component supplies the same editor surface
 * for compact file previews and JSON raw mode.
 */
import React, { useCallback } from "react";
import Editor, { type BeforeMount } from "@monaco-editor/react";
import { getLanguage } from "../../../pages/Coding/getLanguage";
import type { RendererContext } from "../types";

const CodeRenderer: React.FC<RendererContext> = ({
  artifact,
  readOnly,
  theme,
  workspace,
}) => {
  const content = artifact.textContent ?? "";
  const displayPath = artifact.workspacePath || artifact.title;
  const language = getLanguage(displayPath);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      allowSyntheticDefaultImports: true,
      jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  }, []);

  return (
    <Editor
      height="100%"
      path={`workspace-preview/${artifact.id}/${displayPath}`}
      value={content}
      language={language}
      theme={theme === "dark" ? "vs-dark" : "light"}
      beforeMount={handleBeforeMount}
      onChange={(value) => {
        if (!readOnly) {
          workspace.updateArtifact(artifact.id, {
            textContent: value ?? "",
          });
        }
      }}
      loading={
        <div
          style={{
            display: "grid",
            placeItems: "center",
            height: "100%",
            color: "var(--ant-color-text-tertiary)",
            fontSize: 13,
          }}
        >
          加载编辑器...
        </div>
      }
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        wordWrap: "off",
        tabSize: 2,
        renderLineHighlight: "line",
        suggestOnTriggerCharacters: !readOnly,
        acceptSuggestionOnCommitCharacter: !readOnly,
        quickSuggestions: !readOnly,
        readOnly,
        parameterHints: { enabled: !readOnly },
        hover: { enabled: true },
        gotoLocation: { multiple: "goto" },
        folding: true,
        renderWhitespace: "selection",
        automaticLayout: true,
      }}
    />
  );
};

export default CodeRenderer;
