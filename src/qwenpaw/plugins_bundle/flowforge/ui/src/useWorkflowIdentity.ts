import { useEffect, useState } from "react";
import type { Api } from "./model";

/** Stable account scope survives token rotation and rejects late account reads. */
export function useWorkflowIdentity(api: Api) {
  const [identity, setIdentity] = useState<string | undefined>();
  const [error, setError] = useState("");
  useEffect(() => {
    let current: AbortController | undefined;
    const refresh = () => {
      current?.abort();
      const controller = new AbortController();
      current = controller;
      setIdentity(undefined);
      setError("");
      void (async () => {
        try {
          const status = await api<{ enabled: boolean }>("/auth/status", {
            signal: controller.signal,
          });
          let userId = "local";
          if (status.enabled) {
            const user = await api<{ valid: boolean; username: string }>(
              "/auth/verify",
              { signal: controller.signal },
            );
            if (!user.valid || !user.username)
              throw new Error("Account identity is unavailable");
            userId = `account:${user.username}`;
          }
          if (!controller.signal.aborted) setIdentity(userId);
        } catch (failure: any) {
          if (!controller.signal.aborted) setError(failure.message);
        }
      })();
    };
    refresh();
    window.addEventListener("qwenpaw:auth-changed", refresh);
    return () => {
      current?.abort();
      window.removeEventListener("qwenpaw:auth-changed", refresh);
    };
  }, [api]);
  return { identity, error };
}
