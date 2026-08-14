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
  refreshUpdates: () => Promise<boolean>;
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

  const refreshDesktopUpdate = useCallback(async (): Promise<boolean> => {
    if (!isDesktopApp()) return false;
    try {
      const info = await checkDesktopUpdate();
      if (!info) {
        if (hasCachedUpdateRef.current) {
          setHasUpdate(true);
          return true;
        }
        setHasUpdate(false);
        setBody("");
        setSupportsLaterInstall(false);
        return false;
      }
      setVersion((prev) => prev || info.version);
      setBody(info.body?.trim() ?? "");
      setHasUpdate(true);
      setSupportsLaterInstall(Boolean(info.supportsLaterInstall));
      return true;
    } catch (err) {
      console.warn("[updates] desktop update check failed", err);
      if (hasCachedUpdateRef.current) return true;
      throw err;
    }
  }, []);

  const refreshUpdates = useCallback(async () => {
    setCheckWarning(null);
    const [coreResult, componentResult] = await Promise.allSettled([
      refreshDesktopUpdate(),
      refreshComponentUpdates(),
    ]);
    const coreAvailable =
      coreResult.status === "fulfilled" ? coreResult.value : false;
    const componentCount =
      componentResult.status === "fulfilled" ? componentResult.value : 0;
    const failures = [
      coreResult.status === "rejected"
        ? `Desktop: ${toErrorMessage(coreResult.reason)}`
        : null,
      componentResult.status === "rejected"
        ? `Components: ${toErrorMessage(componentResult.reason)}`
        : null,
    ].filter((value): value is string => Boolean(value));
    if (failures.length > 0) {
      const detail = failures.join("; ");
      if (!coreAvailable && componentCount <= 0) {
        throw new Error(detail);
      }
      // One source can still offer a valid update, but the unified dialog
      // must disclose that the other source could not be checked.
      setCheckWarning(detail);
    }
    return coreAvailable || componentCount > 0;
  }, [refreshComponentUpdates, refreshDesktopUpdate]);

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
    // Re-check immediately before queuing. A previous partial OSS failure
    // must not silently turn a core update into a core-only update.
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
