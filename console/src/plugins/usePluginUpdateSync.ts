import { useEffect } from "react";
import { synchronizeFrontendPlugins } from "./usePluginLoader";

const UPDATE_SYNC_INTERVAL_MS = 15_000;

export function usePluginUpdateSync(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    let stopped = false;
    let running = false;
    let timer: ReturnType<typeof setTimeout>;

    const synchronize = async () => {
      if (running || stopped) return;
      running = true;
      clearTimeout(timer);
      try {
        if (document.visibilityState !== "hidden") {
          await synchronizeFrontendPlugins();
        }
      } catch (error) {
        console.warn(
          "[PluginLoader] Background UI synchronization failed",
          error,
        );
      } finally {
        running = false;
        if (!stopped) timer = setTimeout(synchronize, UPDATE_SYNC_INTERVAL_MS);
      }
    };

    const resume = () => void synchronize();
    timer = setTimeout(synchronize, UPDATE_SYNC_INTERVAL_MS);
    window.addEventListener("focus", resume);
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener("focus", resume);
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [ready]);
}
