import { createGlobalStyle } from "antd-style";
import {
  ConfigProvider,
  bailianDarkTheme,
  bailianTheme,
} from "@agentscope-ai/design";
import { App as AntdApp, Spin, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import ruRU from "antd/locale/ru_RU";
import idID from "antd/locale/id_ID";
import type { Locale } from "antd/es/locale";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";
import "dayjs/locale/ja";
import "dayjs/locale/ru";
import "dayjs/locale/id";
dayjs.extend(relativeTime);
import MainLayout from "./layouts/MainLayout";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { PluginProvider, usePlugins } from "./plugins/PluginContext";
import { ApprovalProvider } from "./contexts/ApprovalContext";
import { DesktopUpdateProvider } from "./contexts/DesktopUpdateContext";
import { UpdateTakeoverGate } from "./components/UpdateTakeoverPage";
import { Suspense, lazy } from "react";
import { lazyImportWithRetry } from "./utils/lazyWithRetry";
import {
  addRouterBasename,
  getLoginHref,
  getLoginPath,
  getRouterBasename,
  isOsPath,
} from "./utils/navigationMode";

const LoginPage = lazyImportWithRetry("./pages/Login/index");
const HubPage = lazyImportWithRetry("./pages/Hub/index");
// Desktop OS shell. Uses React.lazy (not lazyImportWithRetry, which only
// resolves the ./pages/** glob) so it can load from ./os/.
const DesktopOSPage = lazy(() => import("./os/DesktopOS"));
import { languageApi } from "./api/modules/language";
import { useUploadLimitStore } from "./stores/uploadLimitStore";
import CloseWindowPrompt from "./tauri/CloseWindowPrompt";
import BackendLoadingPage from "./tauri/BackendLoadingPage";
import {
  resolveAuthGate,
  resolveBackendInfo,
  type BackendInfo,
} from "./auth/gate";
import type { AuthStatusResponse } from "./api/modules/auth";
import { hubApi, type HubHealth } from "./api/modules/hub";
import { isTauri } from "@tauri-apps/api/core";
import { isDesktopTauriRuntime } from "./utils/openExternalLink";
import { interceptBlankLinkClicks } from "./utils/interceptBlankLinkClicks";
import "./styles/layout.css";
import "./styles/form-override.css";
import "./styles/lobehub-override.css";

const antdLocaleMap: Record<string, Locale> = {
  zh: zhCN,
  en: enUS,
  ja: jaJP,
  ru: ruRU,
  id: idID,
};

const dayjsLocaleMap: Record<string, string> = {
  zh: "zh-cn",
  en: "en",
  ja: "ja",
  ru: "ru",
  id: "id",
};

const GlobalStyle = createGlobalStyle`
* {
  margin: 0;
  box-sizing: border-box;
}
`;

function FullPagePreparing({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--ant-color-bg-layout, #f8f8f8)",
        color: "var(--ant-color-text-secondary, #666)",
      }}
    >
      <Spin size="large" />
      <span>{message}</span>
    </div>
  );
}

function AuthGuard({
  children,
  authStatus,
  useHardRedirect = false,
}: {
  children: React.ReactNode;
  authStatus: AuthStatusResponse;
  useHardRedirect?: boolean;
}) {
  const [status, setStatus] = useState<
    "loading" | "auth-required" | "ok" | "error"
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage("");
    resolveAuthGate(authStatus)
      .then((nextStatus) => {
        if (!cancelled) setStatus(nextStatus);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Authentication failed",
        );
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, retryKey]);

  if (status === "loading") {
    return null;
  }
  if (status === "error") {
    return (
      <BackendLoadingPage
        status="error"
        elapsed={0}
        totalSec={1}
        errorMessage={errorMessage}
        onRetry={() => setRetryKey((current) => current + 1)}
      />
    );
  }
  if (status === "auth-required") {
    const loginTo = getLoginPath(window.location);
    if (useHardRedirect) {
      // The OS shell renders outside a Router, so <Navigate> is unavailable.
      window.location.replace(getLoginHref(window.location));
      return null;
    }
    return <Navigate to={loginTo} replace />;
  }
  return <>{children}</>;
}

function RuntimeAvailabilityGuard({
  children,
  enabled,
}: {
  children: React.ReactNode;
  enabled: boolean;
}) {
  const { t } = useTranslation();
  const [health, setHealth] = useState<HubHealth | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [restarting, setRestarting] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setHealth(null);
    setErrorMessage("");
    hubApi
      .getHealth()
      .then((nextHealth) => {
        if (!cancelled) setHealth(nextHealth);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Runtime security preflight failed",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, retryKey]);

  const restartRuntime = async () => {
    setRestarting(true);
    setErrorMessage("");
    try {
      await hubApi.restartOwnRuntime();
      setRetryKey((current) => current + 1);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Runtime restart failed",
      );
    } finally {
      setRestarting(false);
    }
  };

  useEffect(() => {
    if (!enabled || !health || health.runtime_available) return;
    window.location.replace(
      addRouterBasename(window.location.pathname, "/hub/admin"),
    );
  }, [enabled, health]);

  if (!enabled) return <>{children}</>;
  if (!health && !errorMessage) return null;
  if (health?.runtime_desired_state === "stopped") {
    const ownerCanStart = health.runtime_start_policy === "owner_allowed";
    return (
      <BackendLoadingPage
        status="error"
        elapsed={0}
        totalSec={1}
        statusText={t(
          ownerCanStart
            ? "account.runtimeStoppedTitle"
            : "account.runtimeDisabledTitle",
        )}
        hintText={t(
          ownerCanStart
            ? "account.runtimeStoppedDescription"
            : "account.runtimeDisabledDescription",
        )}
        errorMessage={errorMessage}
        onRetry={restartRuntime}
        retryLabel={
          restarting
            ? t("account.runtimeRestarting")
            : t("account.runtimeRestart")
        }
        showRetry={ownerCanStart}
        retryDisabled={restarting}
      />
    );
  }
  if (health?.runtime_available) return <>{children}</>;

  if (health) return null;

  return (
    <BackendLoadingPage
      status="error"
      elapsed={0}
      totalSec={1}
      errorMessage={errorMessage}
      onRetry={() => setRetryKey((current) => current + 1)}
    />
  );
}

function AppInner({ backendInfo }: { backendInfo: BackendInfo }) {
  const hubMode = backendInfo.mode === "hub";
  const basename = getRouterBasename(window.location.pathname);
  const { i18n } = useTranslation();
  const { isDark } = useTheme();
  const { loading: pluginsLoading } = usePlugins();
  const selectedTheme = isDark ? bailianDarkTheme : bailianTheme;
  const lang = i18n.resolvedLanguage || i18n.language || "en";
  const [antdLocale, setAntdLocale] = useState<Locale>(
    antdLocaleMap[lang] ?? enUS,
  );

  useEffect(() => {
    if (!localStorage.getItem("language")) {
      languageApi
        .getLanguage()
        .then(({ language }) => {
          if (language && language !== i18n.language) {
            i18n.changeLanguage(language);
            localStorage.setItem("language", language);
          }
        })
        .catch((err) =>
          console.error("Failed to fetch language preference:", err),
        );
    }
    useUploadLimitStore.getState().fetch();
  }, []);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const shortLng = lng.split("-")[0];
      setAntdLocale(antdLocaleMap[shortLng] ?? enUS);
      dayjs.locale(dayjsLocaleMap[shortLng] ?? "en");
    };

    // Set initial dayjs locale
    dayjs.locale(dayjsLocaleMap[lang.split("-")[0]] ?? "en");

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  // Disable the default browser context menu in the Tauri desktop build so
  // users cannot open DevTools via right-click. DevTools is still available
  // through the hidden 8-click logo gesture handled in Header.tsx.
  useEffect(() => {
    if (!isTauri()) return;
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    window.addEventListener("contextmenu", preventContextMenu);
    return () => window.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  // Vendor-rendered markdown (e.g. chat bubbles) emits native
  // `<a target="_blank">` anchors we cannot override at the React level. The
  // Tauri WebView ignores such clicks, so route them to the system browser.
  useEffect(() => {
    if (!isDesktopTauriRuntime()) return;
    return interceptBlankLinkClicks();
  }, []);

  // Wait for plugins to load before rendering routes that might be patched
  if (pluginsLoading) {
    return <FullPagePreparing message="正在加载功能模块…" />;
  }

  const osActive = isOsPath(window.location.pathname);

  // The Desktop OS shell renders OUTSIDE any Router: each window supplies its
  // own MemoryRouter (WindowRouter.tsx) and React Router forbids nesting a
  // <Router> inside another. The classic browser layout keeps its BrowserRouter.
  const routedContent = osActive ? (
    <AuthGuard authStatus={backendInfo.authStatus} useHardRedirect>
      <RuntimeAvailabilityGuard enabled={hubMode}>
        <Suspense fallback={null}>
          <DesktopOSPage />
        </Suspense>
      </RuntimeAvailabilityGuard>
    </AuthGuard>
  ) : (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={null}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/hub/admin"
          element={
            hubMode ? (
              <AuthGuard authStatus={backendInfo.authStatus}>
                <Suspense fallback={null}>
                  <HubPage />
                </Suspense>
              </AuthGuard>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/*"
          element={
            <AuthGuard authStatus={backendInfo.authStatus}>
              <RuntimeAvailabilityGuard enabled={hubMode}>
                <MainLayout hubMode={hubMode} />
              </RuntimeAvailabilityGuard>
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );

  return (
    <>
      <GlobalStyle />
      <ConfigProvider
        {...selectedTheme}
        prefix="qwenpaw"
        prefixCls="qwenpaw"
        locale={antdLocale}
        theme={{
          ...(selectedTheme as { theme?: ThemeConfig }).theme,
          algorithm: isDark
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
          token: {
            // ── LobeHub design system tokens ──────────────────────────
            // Primary: UGSci brand blue (overrides LobeHub default monochrome)
            colorPrimary: "#2563EB",
            colorSuccess: isDark ? "#c4f042" : "#379d4a",
            colorWarning: isDark ? "#ffb224" : "#ee9e0b",
            colorError: isDark ? "#f4416c" : "#ec5e41",
            colorInfo: isDark ? "#60b1ff" : "#0072f5",
            // Text — solid neutrals
            colorText: isDark ? "#ffffff" : "#080808",
            colorTextSecondary: isDark ? "#aaaaaa" : "#666666",
            colorTextTertiary: isDark ? "#6f6f6f" : "#999999",
            colorTextQuaternary: isDark ? "#555555" : "#bbbbbb",
            // Surfaces
            colorBgLayout: isDark ? "#000000" : "#f8f8f8",
            colorBgContainer: isDark ? "#0d0d0d" : "#ffffff",
            colorBgElevated: isDark ? "#1a1a1a" : "#ffffff",
            colorBgSpotlight: isDark ? "#2d2d2d" : "#dddddd",
            // Borders & fills
            colorBorder: isDark ? "#202020" : "#e3e3e3",
            colorBorderSecondary: isDark ? "#1a1a1a" : "#eeeeee",
            colorFill: isDark
              ? "rgba(255, 255, 255, 0.16)"
              : "rgba(0, 0, 0, 0.12)",
            colorFillSecondary: isDark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.06)",
            colorFillTertiary: isDark
              ? "rgba(255, 255, 255, 0.06)"
              : "rgba(0, 0, 0, 0.03)",
            colorFillQuaternary: isDark
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.015)",
            // Typography — Geist font family (LobeHub design system)
            fontFamily:
              'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, "HarmonyOS Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", ui-sans-serif, system-ui, sans-serif',
            fontFamilyCode:
              '"Geist Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, "Cascadia Code", Consolas, "HarmonyOS Sans SC", monospace',
            fontSize: 14,
            fontSizeSM: 12,
            fontSizeLG: 16,
            lineHeight: 1.5714,
            // Radius — soft but tight (LobeHub)
            borderRadiusXS: 4,
            borderRadiusSM: 6,
            borderRadius: 8,
            borderRadiusLG: 12,
            // Controls
            controlHeightSM: 28,
            controlHeight: 36,
            controlHeightLG: 40,
            // Shadows — shared across light & dark
            boxShadowTertiary: "0 3px 1px -1px rgba(26, 26, 26, 0.06)",
            boxShadowSecondary: "0 8px 16px -4px rgba(0, 0, 0, 0.2)",
            boxShadow: "0 20px 20px -8px rgba(0, 0, 0, 0.24)",
          },
        }}
      >
        <AntdApp>
          <CloseWindowPrompt />
          <DesktopUpdateProvider>
            <UpdateTakeoverGate>
              <ApprovalProvider>{routedContent}</ApprovalProvider>
            </UpdateTakeoverGate>
          </DesktopUpdateProvider>
        </AntdApp>
      </ConfigProvider>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BackendModeRouter />
    </ThemeProvider>
  );
}

function BackendModeRouter() {
  const [backendInfo, setBackendInfo] = useState<
    "loading" | "error" | BackendInfo
  >("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setBackendInfo("loading");
    setErrorMessage("");
    resolveBackendInfo()
      .then((nextInfo) => {
        if (!cancelled) setBackendInfo(nextInfo);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Backend detection failed",
        );
        setBackendInfo("error");
      });
    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  if (backendInfo === "loading") {
    return null;
  }
  if (backendInfo === "error") {
    return (
      <BackendLoadingPage
        status="error"
        elapsed={0}
        totalSec={1}
        errorMessage={errorMessage}
        onRetry={() => setRetryKey((current) => current + 1)}
      />
    );
  }
  return (
    <PluginProvider>
      <AppInner backendInfo={backendInfo} />
    </PluginProvider>
  );
}

export default App;
