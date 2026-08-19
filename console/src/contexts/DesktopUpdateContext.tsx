import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  checkDesktopUpdate,
  checkCachedUpdate,
  downloadDesktopUpdate,
  installDesktopUpdate,
  installDownloadedUpdate,
  onUpdateEvent,
  type UpdateError,
  type UpdateProgress,
} from "../tauri/desktopUpdate";
import { isDesktopApp } from "../tauri/backendRuntime";
import api from "../api";

export type UpdatePhase =
  | "idle"
  | "checking"
  | "downloading"
  | "installing"
  | "downloaded"
  | "failed";

export type RefreshUpdatesScope = "all" | "components";

export interface RefreshUpdatesResult {
  available: boolean;
  hasCoreUpdate: boolean;
  /** False when a desktop-core update is present and components were skipped. */
  componentsChecked: boolean;
  componentCount: number;
  version: string;
  body: string;
}

interface ContextValue {
  phase: UpdatePhase;
  isBackground: boolean;
  hasCoreUpdate: boolean;
  componentUpdateCount: number;
  supportsLaterInstall: boolean;
  version: string;
  body: string;
  downloaded: number;
  total: number | null;
  throughputBps: number;
  error: UpdateError | null;
  checkWarning: string | null;
  startInstall: () => Promise<void>;
  startBackgroundDownload: () => Promise<void>;
  installDownloaded: () => Promise<void>;
  retry: () => Promise<void>;
  refreshUpdates: (
    scope?: RefreshUpdatesScope,
  ) => Promise<RefreshUpdatesResult>;
  queueComponentUpdates: () => Promise<boolean>;
  dismissFailure: () => void;
}

const DesktopUpdateContext = createContext<ContextValue | null>(null);

const THROUGHPUT_WINDOW_MS = 5_000;

function toErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return JSON.stringify(err);
}

export function DesktopUpdateProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<UpdatePhase>("idle");
  const [isBackground, setIsBackground] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [componentUpdateCount, setComponentUpdateCount] = useState(0);
  const [supportsLaterInstall, setSupportsLaterInstall] = useState(false);
  const [version, setVersion] = useState("");
  const [body, setBody] = useState("");
  const [downloaded, setDownloaded] = useState(0);
  const [total, setTotal] = useState<number | null>(null);
  const [throughputBps, setThroughputBps] = useState(0);
  const [error, setError] = useState<UpdateError | null>(null);
  const [checkWarning, setCheckWarning] = useState<string | null>(null);

  const samplesRef = useRef<{ t: number; downloaded: number }[]>([]);
  const hasCachedUpdateRef = useRef(false);

  const refreshComponentUpdates = useCallback(async (): Promise<number> => {
    try {
      const result = await api.checkComponentUpdates();
      setComponentUpdateCount(result.updates.length);
      return result.updates.length;
    } catch (err) {
      // Never leave a stale badge/action behind after the source could not be
      // checked. The caller still receives the error and can block install.
      setComponentUpdateCount(0);
      throw err;
    }
  }, []);

  const refreshDesktopUpdate = useCallback(async (): Promise<{
    available: boolean;
    version: string;
    body: string;
  }> => {
    if (!isDesktopApp()) {
      return { available: false, version: "", body: "" };
    }
    try {
      const info = await checkDesktopUpdate();
      if (!info) {
        if (hasCachedUpdateRef.current) {
          setHasUpdate(true);
          return { available: true, version: "", body: "" };
        }
        setHasUpdate(false);
        setBody("");
        setSupportsLaterInstall(false);
        return { available: false, version: "", body: "" };
      }
      const nextVersion = info.version;
      const nextBody = info.body?.trim() ?? "";
      setVersion((prev) => prev || nextVersion);
      setBody(nextBody);
      setHasUpdate(true);
      setSupportsLaterInstall(Boolean(info.supportsLaterInstall));
      return { available: true, version: nextVersion, body: nextBody };
    } catch (err) {
      console.warn("[updates] desktop update check failed", err);
      if (hasCachedUpdateRef.current) {
        return { available: true, version: "", body: "" };
      }
      throw err;
    }
  }, []);

  const refreshUpdates = useCallback(
    async (
      scope: RefreshUpdatesScope = "all",
    ): Promise<RefreshUpdatesResult> => {
      setCheckWarning(null);
      // Post-restart resume must probe signed components even if a leftover
      // desktop-core advertisement would otherwise skip that check.
      if (scope === "components") {
        const componentCount = await refreshComponentUpdates();
        return {
          available: componentCount > 0,
          hasCoreUpdate: false,
          componentsChecked: true,
          componentCount,
          version: "",
          body: "",
        };
      }
      let core: { available: boolean; version: string; body: string } = {
        available: false,
        version: "",
        body: "",
      };
      let coreError: unknown = null;
      try {
        core = await refreshDesktopUpdate();
      } catch (err) {
        coreError = err;
      }
      // Signed component packages for a newer desktop often declare a higher
      // core_min_version. Checking them on the old core fails closed and used
      // to abort the whole Header flow. Install the desktop core first; the
      // next session (or a later button click) checks components.
      if (core.available) {
        setComponentUpdateCount(0);
        return {
          available: true,
          hasCoreUpdate: true,
          componentsChecked: false,
          componentCount: 0,
          version: core.version,
          body: core.body,
        };
      }
      let componentCount = 0;
      try {
        componentCount = await refreshComponentUpdates();
      } catch (err) {
        if (coreError) {
          throw new Error(
            `Desktop: ${toErrorMessage(
              coreError,
            )}; Components: ${toErrorMessage(err)}`,
          );
        }
        throw err;
      }
      if (coreError) {
        if (componentCount <= 0) {
          throw coreError instanceof Error
            ? coreError
            : new Error(`Desktop: ${toErrorMessage(coreError)}`);
        }
        setCheckWarning(`Desktop: ${toErrorMessage(coreError)}`);
      }
      return {
        available: componentCount > 0,
        hasCoreUpdate: false,
        componentsChecked: true,
        componentCount,
        version: "",
        body: "",
      };
    },
    [refreshComponentUpdates, refreshDesktopUpdate],
  );

  // Probe only the local cache on mount. Remote core/component discovery is
  // deliberately owned by the version-number update button so startup never
  // contacts OSS or starts an update flow without an explicit user action.
  useEffect(() => {
    if (!isDesktopApp()) return;
    let cancelled = false;

    // Check if there's a cached (already downloaded) update on disk.
    checkCachedUpdate()
      .then((cachedVersion) => {
        if (cancelled || !cachedVersion) return;
        hasCachedUpdateRef.current = true;
        setVersion(cachedVersion);
        setHasUpdate(true);
        setSupportsLaterInstall(true);
        setPhase("downloaded");
        setIsBackground(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const queueComponentUpdates = useCallback(async () => {
    // Re-check immediately before queuing. Used only after the desktop core
    // is current; a source failure must not look like "nothing to install".
    const available = await refreshComponentUpdates();
    setCheckWarning(null);
    if (available <= 0) return false;
    const result = await api.queueAllComponentUpdates();
    const queued = result.queued.length > 0;
    if (queued) setComponentUpdateCount(0);
    return queued;
  }, [refreshComponentUpdates]);

  const handleProgress = useCallback((p: UpdateProgress) => {
    const now = Date.now();
    samplesRef.current.push({ t: now, downloaded: p.downloaded });
    samplesRef.current = samplesRef.current.filter(
      (s) => now - s.t <= THROUGHPUT_WINDOW_MS,
    );
    const oldest = samplesRef.current[0];
    const dt = oldest ? (now - oldest.t) / 1000 : 0;
    const dBytes = oldest ? p.downloaded - oldest.downloaded : 0;
    setPhase("downloading");
    setDownloaded(p.downloaded);
    setTotal(p.total ?? null);
    setThroughputBps(dt > 0 ? Math.max(0, dBytes / dt) : 0);
  }, []);

  const beginUpdate = useCallback((background: boolean) => {
    samplesRef.current = [];
    setIsBackground(background);
    setPhase("checking");
    setDownloaded(0);
    setTotal(null);
    setThroughputBps(0);
    setError(null);
  }, []);

  // Subscribe to Rust-side update:* events.
  useEffect(() => {
    if (!isDesktopApp()) return;
    let unlisten: (() => void) | null = null;
    let cancelled = false;
    onUpdateEvent({
      onCheckStart: () => setPhase("checking"),
      onDownloadProgress: handleProgress,
      onInstallStart: () => setPhase("installing"),
      onDownloadDone: (payload) => {
        hasCachedUpdateRef.current = true;
        setHasUpdate(true);
        setPhase("downloaded");
        setVersion(payload.version);
      },
      onError: (err) => {
        setPhase("failed");
        setError(err);
      },
    }).then((u) => {
      if (cancelled) u();
      else unlisten = u;
    });
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [handleProgress]);

  // "Install and Restart" immediate full takeover path.
  const startInstall = useCallback(async () => {
    beginUpdate(false);
    try {
      await installDesktopUpdate();
    } catch (err) {
      setPhase("failed");
      setError({ stage: "check", kind: "other", message: toErrorMessage(err) });
      throw err;
    }
  }, [beginUpdate]);

  // "Update Later" caches the update in the background, no UI takeover.
  const startBackgroundDownload = useCallback(async () => {
    beginUpdate(true);
    try {
      await downloadDesktopUpdate();
    } catch (err) {
      setPhase("failed");
      setError({ stage: "check", kind: "other", message: toErrorMessage(err) });
      throw err;
    }
  }, [beginUpdate]);

  // Install a previously downloaded update.
  const installDownloadedFn = useCallback(async () => {
    setIsBackground(false);
    setPhase("installing");
    setError(null);
    try {
      await installDownloadedUpdate();
    } catch (err) {
      setPhase("failed");
      setIsBackground(false);
      setError({
        stage: "install",
        kind: "other",
        message: toErrorMessage(err),
      });
      throw err;
    }
  }, []);

  const dismissFailure = useCallback(() => {
    setPhase("idle");
    setError(null);
    setIsBackground(false);
  }, []);

  const value = useMemo<ContextValue>(
    () => ({
      phase,
      isBackground,
      hasCoreUpdate: hasUpdate || phase === "downloaded",
      componentUpdateCount,
      supportsLaterInstall,
      version,
      body,
      downloaded,
      total,
      throughputBps,
      error,
      checkWarning,
      startInstall,
      startBackgroundDownload,
      installDownloaded: installDownloadedFn,
      retry: startInstall,
      refreshUpdates,
      queueComponentUpdates,
      dismissFailure,
    }),
    [
      phase,
      isBackground,
      hasUpdate,
      componentUpdateCount,
      supportsLaterInstall,
      version,
      body,
      downloaded,
      total,
      throughputBps,
      error,
      checkWarning,
      startInstall,
      startBackgroundDownload,
      installDownloadedFn,
      dismissFailure,
      refreshUpdates,
      queueComponentUpdates,
    ],
  );

  return (
    <DesktopUpdateContext.Provider value={value}>
      {children}
    </DesktopUpdateContext.Provider>
  );
}

export function useDesktopUpdate(): ContextValue {
  const ctx = useContext(DesktopUpdateContext);
  if (!ctx) {
    throw new Error(
      "useDesktopUpdate must be used inside <DesktopUpdateProvider>",
    );
  }
  return ctx;
}
