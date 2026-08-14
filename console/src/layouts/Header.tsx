import { Layout, Space, Badge, Spin, Tooltip, Dropdown, message } from "antd";
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
  PYPI_URL,
  ONE_HOUR_MS,
  UPDATE_MD,
  isStableVersion,
  compareVersions,
} from "./constants";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Slot } from "../plugins/registry/Slot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDesktopUpdate } from "../contexts/DesktopUpdateContext";
import { isDesktopApp } from "../tauri/backendRuntime";
import { restartForComponentUpdates } from "../tauri/desktopUpdate";
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

export default function Header() {
  const { t, i18n } = useTranslation();
  const { isDark, setThemeMode } = useTheme();
  const desktop = useDesktopUpdate();
  const onDesktop = isDesktopApp();
  const [version, setVersion] = useState<string>("");
  const [latestVersion, setLatestVersion] = useState<string>("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateMarkdown, setUpdateMarkdown] = useState<string>("");
  const [unifiedUpdateBusy, setUnifiedUpdateBusy] = useState(false);
  const logoClicksRef = useRef<number[]>([]);

  useEffect(() => {
    api
      .getVersion()
      .then((res) => setVersion(res?.version ?? ""))
      .catch(() => {});
  }, []);

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

  // Browser-only fallback. Like desktop OSS checks, PyPI is contacted only
  // after the user clicks the version-number update button.
  const refreshWebUpdate = async (): Promise<boolean> => {
    const response = await fetch(PYPI_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`PyPI update check failed (${response.status})`);
    }
    const data = await response.json();
    const releases = data?.releases ?? {};
    const versionsWithTime = Object.entries(releases)
      .filter(([candidate]) => isStableVersion(candidate))
      .map(([candidate, files]) => {
        const fileList = files as Array<{ upload_time_iso_8601?: string }>;
        const latestUpload = fileList
          .map((file) => file.upload_time_iso_8601)
          .filter(Boolean)
          .sort()
          .pop();
        return { version: candidate, uploadTime: latestUpload || "" };
      });

    versionsWithTime.sort((a, b) => {
      const timeDiff =
        new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
      return timeDiff !== 0 ? timeDiff : compareVersions(b.version, a.version);
    });

    const latest = versionsWithTime[0]?.version ?? data?.info?.version ?? "";
    const releaseTime = versionsWithTime.find(
      (candidate) => candidate.version === latest,
    )?.uploadTime;
    const isOldEnough =
      !!releaseTime &&
      new Date(releaseTime) <= new Date(Date.now() - ONE_HOUR_MS);
    const available =
      isOldEnough &&
      !!version &&
      !!latest &&
      compareVersions(latest, version) > 0;
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
      setUpdateMarkdown(
        desktop.body || t("sidebar.updateModal.unifiedInstallHint"),
      );
      return;
    }

    const faqLang = lang === "zh" ? "zh" : "en";
    const url = `https://qwenpaw.agentscope.io/docs/faq.${faqLang}.md`;
    fetch(url, { cache: "no-cache" })
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((text) => {
        const zhPattern = /###\s*QwenPaw如何更新[\s\S]*?(?=\n###|$)/;
        const enPattern = /###\s*How to update QwenPaw[\s\S]*?(?=\n###|$)/;
        const match = text.match(faqLang === "zh" ? zhPattern : enPattern);
        setUpdateMarkdown(
          match && lang !== "ru"
            ? match[0].trim()
            : UPDATE_MD[lang] ?? UPDATE_MD.en,
        );
      })
      .catch(() => {
        setUpdateMarkdown(UPDATE_MD[lang] ?? UPDATE_MD.en);
      });
  };

  const handleStartInstall = async () => {
    if (unifiedUpdateBusy) return;
    setUnifiedUpdateBusy(true);
    setUpdateModalOpen(false);
    try {
      const queuedComponents = await desktop.queueComponentUpdates();
      if (desktop.hasCoreUpdate) {
        if (isReady) {
          await desktop.installDownloaded();
        } else {
          await desktop.startInstall();
        }
        return;
      }
      if (queuedComponents) {
        await restartForComponentUpdates();
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      message.error(`${t("sidebar.updateModal.failedTitle")}: ${detail}`);
    } finally {
      setUnifiedUpdateBusy(false);
    }
  };

  const handleUpdateLater = () => {
    setUpdateModalOpen(false);
    void desktop.startBackgroundDownload();
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
              <Button
                type="text"
                size="small"
                aria-label={t("sidebar.updateModal.checkUpdates")}
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
                onClick={async () => {
                  if (hasUpdate) {
                    handleOpenUpdateModal();
                    return;
                  }
                  setUnifiedUpdateBusy(true);
                  try {
                    const found = onDesktop
                      ? await desktop.refreshUpdates()
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
          {updateMarkdown ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ExternalMarkdownLink,
                code({ node, className, children, ...props }: any) {
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
