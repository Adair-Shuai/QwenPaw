import { useContext, useLayoutEffect } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

/** Lets mounted workbenches protect unsaved drafts under BrowserRouter. */
export function NavigationGuard() {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  useLayoutEffect(() => {
    let active = true;
    const originalPush = navigator.push;
    const originalReplace = navigator.replace;
    const originalGo = navigator.go;
    const requestNavigation = (
      to: string,
      method: string,
      perform: () => void,
    ) => {
      let retried = false;
      const retry = () => {
        if (!active || retried) return;
        retried = true;
        perform();
      };
      const allowed = window.dispatchEvent(
        new CustomEvent("qwenpaw:before-navigate", {
          cancelable: true,
          detail: { to, retry, method },
        }),
      );
      if (allowed) retry();
    };
    const protect =
      (original: typeof navigator.push, method: "push" | "replace") =>
      (...args: Parameters<typeof navigator.push>) => {
        const target = args[0];
        const to =
          typeof target === "string"
            ? target
            : `${target.pathname || ""}${target.search || ""}${
                target.hash || ""
              }`;
        requestNavigation(to, method, () => original.apply(navigator, args));
      };
    const push = protect(originalPush, "push");
    const replace = protect(originalReplace, "replace");
    navigator.push = push;
    navigator.replace = replace;
    const go = (delta: number) =>
      requestNavigation(`history:${delta}`, "go", () =>
        originalGo.call(navigator, delta),
      );
    navigator.go = go;
    return () => {
      active = false;
      if (navigator.push === push) navigator.push = originalPush;
      if (navigator.replace === replace) navigator.replace = originalReplace;
      if (navigator.go === go) navigator.go = originalGo;
    };
  }, [navigator]);
  return null;
}
