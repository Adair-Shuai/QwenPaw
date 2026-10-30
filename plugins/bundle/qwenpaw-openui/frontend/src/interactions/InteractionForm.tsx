import { useCallback, useState } from "react";
import { Renderer, type OpenUIError } from "@openuidev/react-lang";
import { ThemeProvider } from "@openuidev/react-ui";
import { getHost } from "../host";
import { useOpenUIStyles } from "../styles";
import { useOpenUITheme } from "../theme";
import { InteractionContext } from "./context";
import { interactionLibrary, interactionSource } from "./library";
import type { InteractionFormProps } from "./types";

export type {
  InteractionField,
  InteractionFormProps,
  InteractionValue,
  InteractionValues,
} from "./types";

/** Controlled rendering only: the host owns drafts, status and submission. */
export function InteractionForm(props: InteractionFormProps) {
  const host = getHost();
  const mode = host.host.useTheme();
  const zh = host.host.useLocale().startsWith("zh");
  const themes = useOpenUITheme();
  const [failed, setFailed] = useState(false);
  useOpenUIStyles();
  const onError = useCallback((errors: OpenUIError[]) => {
    if (errors.some((error) => error.severity !== "warning")) setFailed(true);
  }, []);
  return (
    <section
      className="qwenpaw-openui"
      data-openui-interaction={props.requestId}
    >
      <ThemeProvider mode={mode} {...themes} cssSelector=".qwenpaw-openui">
        <InteractionContext.Provider value={{ ...props, zh }}>
          <form
            aria-label={props.title}
            onSubmit={(event) => {
              event.preventDefault();
              if (
                !props.disabled &&
                !failed &&
                event.currentTarget.reportValidity()
              )
                props.onSubmit();
            }}
          >
            <Renderer
              response={interactionSource}
              library={interactionLibrary}
              isStreaming={false}
              onError={onError}
              toolProvider={null}
              publishObservability={false}
            />
            {failed && (
              <p role="alert">
                {zh
                  ? "交互界面暂时无法显示，请关闭面板后重新打开。"
                  : "This interface could not be displayed. Close and reopen the panel."}
              </p>
            )}
          </form>
        </InteractionContext.Provider>
      </ThemeProvider>
    </section>
  );
}
