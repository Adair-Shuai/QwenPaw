import { Badge, message, Popover, Spin, Tooltip } from "antd";
import {
  CircleCheck as CheckCircleOutlined,
  Check as CheckOutlined,
  CloudDownload as CloudDownloadOutlined,
  Copy as CopyOutlined,
  CircleAlert as ExclamationCircleOutlined,
  RefreshCw as SyncOutlined,
  Tag as TagOutlined,
} from "lucide-react";
import { Button, Modal } from "@agentscope-ai/design";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import api from "../api";
import { ExternalMarkdownLink } from "../components/Markdown/externalLinkComponents";
import { useDesktopUpdate } from "../contexts/DesktopUpdateContext";
import { useTheme } from "../contexts/ThemeContext";
import { Slot } from "../plugins/registry/Slot";
import { isDesktopApp } from "../tauri/backendRuntime";
import { restartForComponentUpdates } from "../tauri/desktopUpdate";
import { openExternalLink } from "../utils/openExternalLink";
import { getReleaseNotesUrl, UPDATE_MD } from "./constants";
import styles from "./index.module.less";
import {
  clearResumeComponentUpdatesAfterCore,
  decideResumeComponentUpdates,
  hasResumeComponentUpdatesAfterCore,
  markResumeComponentUpdatesAfterCore,
  RESUME_COMPONENT_UPDATES_RETRY_MS,
} from "./updateResume";

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
        {copied ? <CheckOutlined size="1em" /> : <CopyOutlined size="1em" />}
      </button>
    </div>
  );
}

interface AppBrandProps {
  action?: ReactNode;
  hidden?: boolean;
  version?: string;
}

export default function AppBrand({
  action,
  hidden = false,
  version: versionProp,
}: AppBrandProps) {
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const desktop = useDesktopUpdate();
  const refreshUpdates = desktop.refreshUpdates;
  const onDesktop = isDesktopApp();
  const [loadedVersion, setLoadedVersion] = useState("");
  const version = versionProp ?? loadedVersion;
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateMarkdown, setUpdateMarkdown] = useState("");
  const [unifiedUpdateBusy, setUnifiedUpdateBusy] = useState(false);
  const unifiedUpdateBusyRef = useRef(false);
  const installActionRef = useRef(false);
  const logoClicksRef = useRef<number[]>([]);

  useEffect(() => {
    if (versionProp !== undefined) return;
    void api
      .getVersion()
      .then((response) => setLoadedVersion(response?.version ?? ""))
      .catch(() => {});
  }, [versionProp]);

  // Web/source builds must not consult public PyPI: this fork is distributed
  // through its own signed component channel. Desktop update state is the
  // authoritative source for the badge and modal.
  const hasUpdate =
    onDesktop && (desktop.hasCoreUpdate || desktop.componentUpdateCount > 0);
  const modalVersion = onDesktop ? desktop.version : version;
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
          "sidebar.updateModal.backgroundDownloading",
        )} ${backgroundDownloadPercent}%`
      : t("sidebar.updateModal.backgroundDownloading");
  const backgroundFailureTitle = desktop.error?.message
    ? `${t("sidebar.updateModal.backgroundFailed")}: ${desktop.error.message}`
    : t("sidebar.updateModal.backgroundFailed");

  useEffect(() => {
    if (!onDesktop || !hasResumeComponentUpdatesAfterCore()) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRetry = () => {
      if (!cancelled)
        timer = setTimeout(run, RESUME_COMPONENT_UPDATES_RETRY_MS);
    };
    const run = () => {
      void refreshUpdates("components")
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
          if (decision === "open") {
            setUpdateMarkdown(t("sidebar.updateModal.unifiedInstallHint"));
            setUpdateModalOpen(true);
          }
        })
        .catch(scheduleRetry);
    };

    run();
    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [onDesktop, refreshUpdates, t]);

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
          if (isReady) await desktop.installDownloaded();
          else await desktop.startInstall();
        } catch (error) {
          clearResumeComponentUpdatesAfterCore();
          throw error;
        }
        return;
      }
      const queued = await desktop.queueComponentUpdates();
      if (queued) await restartForComponentUpdates();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      message.error(`${t("sidebar.updateModal.failedTitle")}: ${detail}`);
      setUpdateModalOpen(true);
    } finally {
      installActionRef.current = false;
      unifiedUpdateBusyRef.current = false;
      setUnifiedUpdateBusy(false);
    }
  };

  const unifiedUpdateTitle = isBackgroundActive
    ? backgroundDownloadTitle
    : isReady
    ? t("sidebar.updateModal.readyToInstall")
    : isBackgroundFailed
    ? backgroundFailureTitle
    : hasUpdate
    ? t("sidebar.updateModal.updateAvailable")
    : t("sidebar.updateModal.checkUpdates");
  const handleOpenUpdateModal = () => {
    setUpdateMarkdown("");
    setUpdateModalOpen(true);
    const language = i18n.language?.startsWith("zh")
      ? "zh"
      : i18n.language?.startsWith("ru")
      ? "ru"
      : "en";

    if (onDesktop) {
      const fallback = desktop.hasCoreUpdate
        ? t("sidebar.updateModal.coreFirstInstallHint", {
            version: desktop.version,
            defaultValue:
              "The desktop core will be installed first. Component updates will be checked after restart.",
          })
        : t("sidebar.updateModal.unifiedInstallHint");
      setUpdateMarkdown(desktop.body || fallback);
      return;
    }

    const faqLanguage = language === "zh" ? "zh" : "en";
    fetch(`https://qwenpaw.agentscope.io/docs/faq.${faqLanguage}.md`, {
      cache: "no-cache",
    })
      .then((response) => (response.ok ? response.text() : Promise.reject()))
      .then((text) => {
        const zhPattern = /###\s*QwenPaw如何更新[\s\S]*?(?=\n###|$)/;
        const enPattern = /###\s*How to update QwenPaw[\s\S]*?(?=\n###|$)/;
        const match = text.match(faqLanguage === "zh" ? zhPattern : enPattern);
        setUpdateMarkdown(
          match && language !== "ru"
            ? match[0].trim()
            : UPDATE_MD[language] ?? UPDATE_MD.en,
        );
      })
      .catch(() => {
        setUpdateMarkdown(UPDATE_MD[language] ?? UPDATE_MD.en);
      });
  };

  const handleLogoClick = () => {
    if (!onDesktop) return;
    const now = Date.now();
    logoClicksRef.current = logoClicksRef.current.filter(
      (time) => time > now - 3000,
    );
    logoClicksRef.current.push(now);
    if (logoClicksRef.current.length < 8) return;

    logoClicksRef.current = [];
    void invoke("open_devtools")
      .then(() => message.success("DevTools opened"))
      .catch((error: unknown) => {
        const detail = error instanceof Error ? error.message : String(error);
        console.error("Failed to open DevTools:", detail);
        message.error(`DevTools error: ${detail}`);
      });
  };

  const versionContent = (
    <span className={styles.appBrandVersionArea}>
      {version && (
        <Badge
          dot={hasUpdate && !isReady && !isBackgroundActive}
          color="rgba(255, 157, 77, 1)"
          offset={[3, 1]}
        >
          <span
            className={`${styles.versionBadge} ${
              hasUpdate && !isReady ? styles.versionBadgeClickable : ""
            }`}
            onClick={hasUpdate && !isReady ? handleOpenUpdateModal : undefined}
          >
            v{version}
          </span>
        </Badge>
      )}
      {isBackgroundActive && (
        <Tooltip title={backgroundDownloadTitle}>
          <SyncOutlined
            size="1em"
            data-spinning={true}
            className={styles.appBrandUpdateIcon}
          />
        </Tooltip>
      )}
      {isReady && (
        <Popover
          content={
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: 12 }}>
                {t("sidebar.updateModal.readyToInstallHint", {
                  version: desktop.version,
                })}
              </p>
              <Button
                type="primary"
                size="small"
                onClick={() => void desktop.installDownloaded()}
                loading={isApplyingDownloadedUpdate}
              >
                {t("sidebar.updateModal.restartNow")}
              </Button>
            </div>
          }
          title={t("sidebar.updateModal.readyToInstall")}
          trigger="click"
        >
          <Tooltip title={t("sidebar.updateModal.readyToInstall")}>
            <CheckCircleOutlined
              size="1em"
              className={styles.appBrandReadyIcon}
            />
          </Tooltip>
        </Popover>
      )}
      {isBackgroundFailed && (
        <Tooltip title={backgroundFailureTitle}>
          <ExclamationCircleOutlined
            size="1em"
            className={styles.appBrandFailedIcon}
            onClick={() => void desktop.startBackgroundDownload()}
          />
        </Tooltip>
      )}
      <Badge
        dot={hasUpdate && !isReady && !isBackgroundActive}
        color="rgba(37, 99, 235, 1)"
        offset={[-1, 3]}
      >
        <Tooltip title={unifiedUpdateTitle}>
          <Button
            type="text"
            size="small"
            aria-label={unifiedUpdateTitle}
            aria-busy={
              unifiedUpdateBusy ||
              isBackgroundActive ||
              isApplyingDownloadedUpdate
            }
            icon={<CloudDownloadOutlined />}
            loading={
              unifiedUpdateBusy ||
              isBackgroundActive ||
              isApplyingDownloadedUpdate
            }
            onClick={async (event) => {
              event.stopPropagation();
              if (unifiedUpdateBusyRef.current || installActionRef.current) {
                return;
              }
              if (!onDesktop || hasUpdate) {
                handleOpenUpdateModal();
                return;
              }
              unifiedUpdateBusyRef.current = true;
              setUnifiedUpdateBusy(true);
              try {
                const result = await desktop.refreshUpdates();
                if (result.available) handleOpenUpdateModal();
                else message.success(t("sidebar.updateModal.upToDate"));
              } catch (error) {
                const detail =
                  error instanceof Error ? error.message : String(error);
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
    </span>
  );

  return (
    <>
      <div className={styles.appBrand} hidden={hidden}>
        <span className={styles.appBrandLogo} onClick={handleLogoClick}>
          <Slot name="header.logo" kind="replace">
            <img
              src={isDark ? "/logo-dark.svg" : "/logo-light.svg"}
              alt="QwenPaw"
              className={styles.logoImg}
            />
          </Slot>
        </span>
        <span className={styles.logoDivider} />
        {versionContent}
        {action && <span className={styles.appBrandAction}>{action}</span>}
      </div>

      <Modal
        title={null}
        open={updateModalOpen}
        onCancel={() => setUpdateModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setUpdateModalOpen(false)}>
            {t("common.close")}
          </Button>,
          onDesktop && desktop.hasCoreUpdate && desktop.supportsLaterInstall ? (
            <Button
              key="later"
              onClick={() => {
                setUpdateModalOpen(false);
                void desktop.startBackgroundDownload().catch(() => {});
              }}
            >
              {t("sidebar.updateModal.updateLater")}
            </Button>
          ) : null,
          onDesktop ? (
            <Button
              key="install"
              type="primary"
              className={styles.updateViewReleasesBtn}
              onClick={() => void handleStartInstall()}
              loading={unifiedUpdateBusy}
            >
              {t("sidebar.updateModal.installUpdate")}
            </Button>
          ) : (
            <Button
              key="releases"
              type="primary"
              className={styles.updateViewReleasesBtn}
              onClick={() =>
                openExternalLink(getReleaseNotesUrl(i18n.language))
              }
            >
              {t("sidebar.updateModal.viewReleases")}
            </Button>
          ),
        ].filter(Boolean)}
        width={960}
        className={styles.updateModal}
      >
        <div className={styles.updateModalBanner}>
          <div className={styles.updateModalBannerLeft}>
            <span className={styles.updateModalVersionTag}>
              <TagOutlined size="1em" />
              Version {modalVersion || version}
            </span>
            <div className={styles.updateModalBannerTitle}>
              {t("sidebar.updateModal.title", {
                version: modalVersion || version,
              })}
            </div>
          </div>
        </div>

        <div className={styles.updateModalBody}>
          {updateMarkdown ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                a: ExternalMarkdownLink,
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isBlock =
                    node?.position?.start?.line !== node?.position?.end?.line ||
                    match;
                  return isBlock ? (
                    <UpdateCodeBlock
                      code={String(children).replace(/\n$/, "")}
                    />
                  ) : (
                    <code className={styles.codeInline} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
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
