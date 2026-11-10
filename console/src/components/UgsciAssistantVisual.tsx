import { useTheme } from "@/contexts/ThemeContext";
import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export type AssistantVisualState =
  | "ready"
  | "thinking"
  | "tool-running"
  | "needs-approval"
  | "completed"
  | "failed";

/** Switch to a static asset when reduced motion is requested. */
export function UgsciAssistantVisual({
  state,
  size = 24,
  className,
}: {
  state: AssistantVisualState;
  size?: number;
  className?: string;
}) {
  const { isDark } = useTheme();
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const folder =
    !reducedMotion && (state === "thinking" || state === "tool-running")
      ? "motion"
      : "states";
  return (
    <img
      src={`${
        import.meta.env.BASE_URL
      }ugsci-mono/assistant/${folder}/${state}.svg`}
      alt=""
      aria-hidden="true"
      data-assistant-state={state}
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        filter: isDark ? "invert(1)" : undefined,
      }}
    />
  );
}
