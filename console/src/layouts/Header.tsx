import {
  Layout,
  Space,
  Badge,
  Spin,
  Tooltip,
  Dropdown,
  Alert,
  message,
  Button as AntButton,
} from "antd";
import type { MenuProps } from "antd";
import LanguageSwitcher, {
  LANGUAGE_LIST,
} from "../components/LanguageSwitcher/index";
import ThemeToggleButton from "../components/ThemeToggleButton";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "@agentscope-ai/design";
import styles from "./index.module.less";
import api from "../api";
import { openExternalLink } from "../utils/openExternalLink";
import { ExternalMarkdownLink } from "../components/Markdown/externalLinkComponents";
import {
  getDocsUrl,
  getReleaseNotesUrl,
  UPDATE_MD,
  compareVersions,
} from "./constants";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Slot } from "../plugins/registry/Slot";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDesktopUpdate } from "../contexts/DesktopUpdateContext";
import { isDesktopApp } from "../tauri/backendRuntime";
import { restartForComponentUpdates } from "../tauri/desktopUpdate";
import {
  clearResumeComponentUpdatesAfterCore,
  decideResumeComponentUpdates,
  hasResumeComponentUpdatesAfterCore,
  markResumeComponentUpdatesAfterCore,
  RESUME_COMPONENT_UPDATES_RETRY_MS,
} from "./updateResume";
import {
  CopyOutlined,
  CheckOutlined,
  TagOutlined,
  GithubOutlined,
  FileTextOutlined,
  ReadOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  DownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";

const { Header: AntHeader } = Layout;

declare const VITE_APP_VERSION: string;

const BUILD_VERSION =
  typeof VITE_APP_VERSION === "string" ? VITE_APP_VERSION.trim() : "";

// ── Code block with copy button ───────────────────────────────────────────
function UpdateCodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className={styles.codeBlock}>
      <code className={styles.codeBlockInner}>{code}</code>
      <button
        className={`${styles.copyBtn} ${
          copied ? styles.copyBtnCopied : styles.copyBtnDefault
        }`}
        onClick={handleCopy}
        title="Copy"
      >
        {copied ? <CheckOutlined /> : <CopyOutlined />}
      </button>
    </div>
  );
}

const updateMarkdownComponents: Components = {
  a: ExternalMarkdownLink,
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isBlock =
      node?.position?.start?.line !== node?.position?.end?.line || match;
    return isBlock ? (
      <UpdateCodeBlock code={String(children).replace(/\n$/, "")} />
    ) : (
      <code className={styles.codeInline} {...props}>
        {children}
      </code>
    );
  },
};

export default function Header() {
  const { t, i18n } = useTranslation();
  const { isDark, setThemeMode } = useTheme();
  const desktop = useDesktopUpdate();
  const onDesktop = isDesktopApp();
  const [version, setVersion] = useState<string>(BUILD_VERSION);
  const [latestVersion, setLatestVersion] = useState<string>("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateMarkdown, setUpdateMarkdown] = useState<string>("");
  const [unifiedUpdateBusy, setUnifiedUpdateBusy] = useState(false);
  const unifiedUpdateBusyRef = useRef(false);
  const installActionRef = useRef(false);
  const logoClicksRef = useRef<number[]>([]);

  useEffect(() => {
    api
      .getVersion()
      .then((res) => {
        const runtimeVersion = res?.version?.trim();
        if (runtimeVersion) setVersion(runtimeVersion);
      })
      .catch(() => {});
  }, []);

  // After a desktop-core install/restart, continue with signed components.
  // The sidecar answers /api/version before background startup finishes, so
  // a first probe can fail while the backend is still starting. Keep the
  // durable flag and retry until a component check actually completes.
  useEffect(() => {
    if (!onDesktop) return;
    if (!hasResumeComponentUpdatesAfterCore()) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRetry = () => {
      if (cancelled) return;
      timer = setTimeout(run, RESUME_COMPONENT_UPDATES_RETRY_MS);
    };

    const run = () => {
      void desktop
        .refreshUpdates("components")
        .then((result) => {
          if (cancelled) return;
          const decision = decideResumeComponentUpdates({
            ok: true,
            componentsChecked: result.componentsChecked,
            componentCount: result.componentCount,
          });
          if (decision === "retry") {
            scheduleRetry();
            return;
          }
          clearResumeComponentUpdatesAfterCore();
          if (decision !== "open") return;
          setUpdateMarkdown(t("sidebar.updateModal.unifiedInstallHint"));
          setUpdateModalOpen(true);
        })
        .catch(() => {
          if (cancelled) return;
          scheduleRetry();
        });
    };

    run();
    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [desktop.refreshUpdates, onDesktop, t]);

  // Hidden gesture: 8 rapid clicks on the logo within 3 seconds toggles DevTools
  // in the Tauri desktop build. This keeps DevTools inaccessible via the default
  // context menu or keyboard shortcuts while still allowing support/debugging.
  const handleLogoClick = () => {
    if (!onDesktop) return;
    const now = Date.now();
    const windowStart = now - 3000;
    logoClicksRef.current = logoClicksRef.current.filter(
      (time) => time > windowStart,
    );
    logoClicksRef.current.push(now);
    if (logoClicksRef.current.length >= 8) {
      logoClicksRef.current = [];
      invoke("open_devtools")
        .then(() => message.success("DevTools opened"))
        .catch((err: unknown) => {
          const errMsg =
            err instanceof Error
              ? err.message
              : typeof err === "string"
              ? err
              : JSON.stringify(err);
          console.error("Failed to open DevTools:", errMsg);
          message.error(`DevTools error: ${errMsg}`);
        });
    }
  };

  // Browser-only fallback. The same promoted OSS metadata as the desktop
  // updater is fetched through the local backend to avoid browser CORS.
  const refreshWebUpdate = async (): Promise<boolean> => {
    const data = await api.getLatestCoreVersion();
    const latest = typeof data?.version === "string" ? data.version.trim() : "";
    const available =
      !!version && !!latest && compareVersions(latest, version) > 0;
    setLatestVersion(available ? latest : "");
    return available;
  };

  const hasUpdate = onDesktop
    ? desktop.hasCoreUpdate || desktop.componentUpdateCount > 0
    : !!version &&
      !!latestVersion &&
      compareVersions(latestVersion, version) > 0;

  const resourcesMenuItems: MenuProps["items"] = [
    {
      key: "tutorial",
      icon: <ReadOutlined />,
      label: t("header.tutorial"),
      onClick: () => handleNavClick(getDocsUrl(i18n.language)),
    },
    {
      key: "featureDemos",
      icon: <PlayCircleOutlined />,
      label: t("header.featureDemos"),
      disabled: true,
    },
    {
      key: "changelog",
      icon: <FileTextOutlined />,
      label: t("header.changelog"),
      disabled: true,
    },
    {
      key: "faq",
      icon: <InfoCircleOutlined />,
      label: t("header.faq"),
      disabled: true,
    },
  ];

  // The standalone GitHub button is hidden on mobile, so the entry is only
  // surfaced inside the mobile menu to avoid a duplicated link on desktop.
  const githubMenuItem: MenuProps["items"] = [
    {
      key: "github",
      icon: <GithubOutlined />,
      label: t("header.github"),
      disabled: true,
    },
  ];

  const mobileMenuItems: MenuProps["items"] = [
    {
      key: "language",
      label: t("sidebar.settings.language"),
      children: LANGUAGE_LIST.map(({ key, label }) => ({
        key,
        label,
        onClick: () => {
          i18n.changeLanguage(key);
          localStorage.setItem("language", key);
        },
      })),
    },
    {
      key: "theme",
      label: t("sidebar.settings.theme"),
      children: [
        {
          key: "light",
          label: t("theme.light"),
          onClick: () => setThemeMode("light"),
        },
        {
          key: "dark",
          label: t("theme.dark"),
          onClick: () => setThemeMode("dark"),
        },
        {
          key: "system",
          label: t("theme.system"),
          onClick: () => setThemeMode("system"),
        },
      ],
    },
    { type: "divider" },
    ...resourcesMenuItems,
    ...githubMenuItem,
  ];

  const handleOpenUpdateModal = () => {
    setUpdateMarkdown("");
    setUpdateModalOpen(true);
    const lang = i18n.language?.startsWith("zh")
      ? "zh"
      : i18n.language?.startsWith("ru")
      ? "ru"
      : "en";

    if (onDesktop) {
      const fallback = desktop.hasCoreUpdate
        ? t("sidebar.updateModal.coreFirstInstallHint", {
            version: desktop.version,
            defaultValue:
              "UGSci Desktop {{version}} will be installed first and the app will restart. Component updates will be checked after the new version starts.",
          })
        : t("sidebar.updateModal.unifiedInstallHint");
      setUpdateMarkdown(desktop.body || fallback);
      return;
    }

    setUpdateMarkdown(UPDATE_MD[lang] ?? UPDATE_MD.en);
  };

  const handleStartInstall = async () => {
    if (unifiedUpdateBusyRef.current || installActionRef.current) return;
    unifiedUpdateBusyRef.current = true;
    installActionRef.current = true;
    setUnifiedUpdateBusy(true);
    setUpdateModalOpen(false);
    try {
      if (desktop.hasCoreUpdate) {
        markResumeComponentUpdatesAfterCore();
        try {
          if (isReady) {
            await desktop.installDownloaded();
          } else {
            await desktop.startInstall();
          }
        } catch (err) {
          clearResumeComponentUpdatesAfterCore();
          throw err;
        }
        return;
      }
      const queuedComponents = await desktop.queueComponentUpdates();
      if (queuedComponents) {
        await restartForComponentUpdates();
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      message.error(`${t("sidebar.updateModal.failedTitle")}: ${detail}`);
      setUpdateModalOpen(true);
    } finally {
      installActionRef.current = false;
      unifiedUpdateBusyRef.current = false;
      setUnifiedUpdateBusy(false);
    }
  };

  const handleUpdateLater = () => {
    setUpdateModalOpen(false);
    // The update context records and renders background-download failures.
    // Consume the rejected promise here so a network failure does not also
    // surface as an unhandled rejection in the desktop webview.
    void desktop.startBackgroundDownload().catch(() => {});
  };

  const handleNavClick = (url: string) => {
    openExternalLink(url);
  };

  // Background download/ready state for inline header indicator.
  const isBackgroundActive =
    onDesktop &&
    desktop.isBackground &&
    (desktop.phase === "checking" || desktop.phase === "downloading");
  const isReady = onDesktop && desktop.phase === "downloaded";
  const isApplyingDownloadedUpdate =
    onDesktop && desktop.phase === "installing";
  const isBackgroundFailed =
    onDesktop && desktop.isBackground && desktop.phase === "failed";
  const backgroundDownloadPercent =
    isBackgroundActive && desktop.phase === "downloading" && desktop.total
      ? Math.min(99, Math.round((desktop.downloaded / desktop.total) * 100))
      : undefined;
  const backgroundDownloadTitle =
    backgroundDownloadPercent !== undefined
      ? `${t(
          `sidebar.updateModal.backgroundDownloading`,
        )} ${backgroundDownloadPercent}%`
      : t(`sidebar.updateModal.backgroundDownloading`);
  const backgroundFailureTitle = desktop.error?.message
    ? `${t(`sidebar.updateModal.backgroundFailed`)}: ${desktop.error.message}`
    : t(`sidebar.updateModal.backgroundFailed`);
  const unifiedUpdateTitle = isBackgroundActive
    ? backgroundDownloadTitle
    : isReady
    ? t(`sidebar.updateModal.readyToInstall`)
    : isBackgroundFailed
    ? backgroundFailureTitle
    : hasUpdate
    ? t("sidebar.updateModal.updateAvailable")
    : t("sidebar.updateModal.checkUpdates");

  return (
    <>
      <AntHeader className={styles.header}>
        <div className={styles.logoWrapper} onClick={handleLogoClick}>
          {/*
            Slot lets a plugin replace the brand logo (e.g. a per-agent
            branding override). When no plugin registers a replacement —
            or when the registered render returns null — the host default
            <img> below paints.
          */}
          <Slot name="header.logo" kind="replace">
            <img
              src={isDark ? "/logo-dark.svg" : "/logo-light.svg"}
              alt="QwenPaw"
              className={styles.logoImg}
            />
          </Slot>
          <div className={styles.logoDivider} />
          {version && <span className={styles.versionBadge}>v{version}</span>}
          <Badge
            dot={hasUpdate && !isReady && !isBackgroundActive}
            color="rgba(37, 99, 235, 1)"
            offset={[-1, 3]}
          >
            <Tooltip title={unifiedUpdateTitle}>
              <AntButton
                type="text"
                size="small"
                aria-label={unifiedUpdateTitle}
                aria-busy={
                  unifiedUpdateBusy ||
                  isBackgroundActive ||
                  isApplyingDownloadedUpdate
                }
                className={`${styles.unifiedUpdateButton} ${
                  hasUpdate ? styles.unifiedUpdateButtonActive : ""
                }`}
                icon={
                  isReady ? (
                    <CheckCircleOutlined />
                  ) : isBackgroundFailed ? (
                    <ExclamationCircleOutlined />
                  ) : (
                    <CloudDownloadOutlined />
                  )
                }
                loading={
                  unifiedUpdateBusy ||
                  isBackgroundActive ||
                  isApplyingDownloadedUpdate
                }
                onClick={async (event) => {
                  // The update action sits beside the version inside the
                  // clickable brand group. Do not let update clicks count as
                  // logo clicks (the logo owns the hidden DevTools gesture).
                  event.stopPropagation();
                  if (unifiedUpdateBusyRef.current || installActionRef.current)
                    return;
                  if (hasUpdate) {
                    handleOpenUpdateModal();
                    return;
                  }
                  unifiedUpdateBusyRef.current = true;
                  setUnifiedUpdateBusy(true);
                  try {
                    const found = onDesktop
                      ? (await desktop.refreshUpdates()).available
                      : await refreshWebUpdate();
                    if (found) handleOpenUpdateModal();
                    else message.success(t("sidebar.updateModal.upToDate"));
                  } catch (err) {
                    const detail =
                      err instanceof Error ? err.message : String(err);
                    message.error(
                      `${t("sidebar.updateModal.failedTitle")}: ${detail}`,
                    );
                  } finally {
                    unifiedUpdateBusyRef.current = false;
                    setUnifiedUpdateBusy(false);
                  }
                }}
              />
            </Tooltip>
          </Badge>
        </div>
        <Slot name="header.left" kind="fill" />
        <Space size="middle">
          <Slot name="header.right" kind="fill" />
          {resourcesMenuItems.length > 0 && (
            <Dropdown menu={{ items: resourcesMenuItems }}>
              <Button type="text" className={styles.hideOnMobile}>
                {t("header.resources")} <DownOutlined />
              </Button>
            </Dropdown>
          )}
          <div className={styles.headerDivider} />
          <span className={styles.hideOnMobile}>
            <LanguageSwitcher />
          </span>
          <span className={styles.hideOnMobile}>
            <ThemeToggleButton />
          </span>
          <Dropdown menu={{ items: mobileMenuItems }} placement="bottomRight">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              className={styles.showOnMobile}
              title={t("header.resources")}
            />
          </Dropdown>
        </Space>
      </AntHeader>

      <Modal
        title={null}
        open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setUpdateModalOpen(false)}>
            {t("common.close")}
          </Button>,
          onDesktop && desktop.hasCoreUpdate && desktop.supportsLaterInstall ? (
            <Button key="later" onClick={handleUpdateLater}>
              {t("sidebar.updateModal.updateLater")}
            </Button>
          ) : null,
          onDesktop ? (
            <Button
              key="install"
              type="primary"
              className={styles.updateViewReleasesBtn}
              onClick={handleStartInstall}
              loading={unifiedUpdateBusy}
            >
              {t("sidebar.updateModal.installUpdate")}
            </Button>
          ) : (
            <Button
              key="releases"
              type="primary"
              className={styles.updateViewReleasesBtn}
              onClick={() => handleNavClick(getReleaseNotesUrl(i18n.language))}
            >
              {t("sidebar.updateModal.viewReleases")}
            </Button>
          ),
        ].filter(Boolean)}
        width={960}
        className={styles.updateModal}
      >
        {/* Banner area */}
        <div className={styles.updateModalBanner}>
          <div className={styles.updateModalBannerLeft}>
            <span className={styles.updateModalVersionTag}>
              <TagOutlined />
              {t("sidebar.updateModal.updateAvailable")}
            </span>
            <div className={styles.updateModalBannerTitle}>
              {t("sidebar.updateModal.unifiedTitle")}
            </div>
          </div>
        </div>

        {/* Markdown content */}
        <div className={styles.updateModalBody}>
          {desktop.checkWarning && (
            <Alert
              type="warning"
              showIcon
              message={t("sidebar.updateModal.partialCheckWarning", {
                defaultValue:
                  "Some update sources could not be checked. They will be checked again before installation.",
              })}
              description={desktop.checkWarning}
              style={{ marginBottom: 16 }}
            />
          )}
          {updateMarkdown ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={updateMarkdownComponents}
            >
              {updateMarkdown}
            </ReactMarkdown>
          ) : (
            <div className={styles.updateModalSpinWrapper}>
              <Spin />
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
