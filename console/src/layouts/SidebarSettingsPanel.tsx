import { Popover, message } from "antd";
import {
  BookOpen,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Languages,
  ListCollapse,
  LogOut,
  MessageSquareText,
  Monitor,
  Moon,
  Palette,
  PanelsTopLeft,
  Settings,
  Sun,
  UnfoldHorizontal,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

import { applyLanguagePreference } from "../utils/languagePreference";
import { LANGUAGE_LIST } from "../constants/languageList";
import { useTheme, type ThemeMode } from "../contexts/ThemeContext";
import {
  getChatWideModePreference,
  setChatWideModePreference,
} from "../utils/chatLayoutPreference";
import {
  getAssistantMessageDisplayPreference,
  getShowThinkingPreference,
  getToolDisplayPreference,
  setAssistantMessageDisplayPreference,
  setShowThinkingPreference,
  setToolDisplayPreference,
  type AssistantMessageDisplayPreference,
  type ToolDisplayPreference,
} from "../utils/chatDisplayPreference";
import { openExternalLink } from "../utils/openExternalLink";
import styles from "./sidebarSettingsPanel.module.less";
import LocalAvatarPicker from "./LocalAvatarPicker";
import { COLOR_THEMES, type InterfaceStyle } from "../utils/interfaceStyle";
import { PAGE_STYLES, type PageStyle } from "../utils/pageStyle";
import { useIsMobile } from "../hooks/useIsMobile";

type ContentWidth = "standard" | "wide";

const UGSCI_WEBSITE_URL = "https://www.ugsci.cn/";

const LANGUAGES = LANGUAGE_LIST.map(({ key, label }) => ({
  value: key,
  label,
}));

interface SidebarSettingsPanelProps {
  version?: string;
  onClose?: () => void;
  onOpenDesktopMode: () => void;
  onOpenSettings: () => void;
  authEnabled?: boolean;
  onOpenAccount?: () => void;
  onLogout?: () => void;
}

interface FlyoutItemProps {
  icon: ReactNode;
  label: ReactNode;
  content: ReactNode;
}

interface FlyoutContextValue {
  setChildOpen: (id: string, open: boolean) => void;
}

// Popover content is portaled, so hovering a child can close its parent before
// the pointer reaches the child. Track open descendants to keep ancestors open.
const FlyoutContext = createContext<FlyoutContextValue | null>(null);
const CompactMenuContext = createContext<
  ((label: ReactNode, content: ReactNode) => void) | null
>(null);

function FlyoutItem({ icon, label, content }: FlyoutItemProps) {
  const openCompactPanel = useContext(CompactMenuContext);
  const parentFlyout = useContext(FlyoutContext);
  const flyoutId = useId();
  const [requestedOpen, setRequestedOpen] = useState(false);
  const [openChildIds, setOpenChildIds] = useState<Set<string>>(
    () => new Set(),
  );
  const open = requestedOpen || openChildIds.size > 0;
  const setChildOpen = useCallback((id: string, childOpen: boolean) => {
    setOpenChildIds((current) => {
      if (current.has(id) === childOpen) return current;
      const next = new Set(current);
      if (childOpen) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const contextValue = useMemo(() => ({ setChildOpen }), [setChildOpen]);

  useEffect(() => {
    parentFlyout?.setChildOpen(flyoutId, open);
  }, [flyoutId, open, parentFlyout]);

  useEffect(
    () => () => parentFlyout?.setChildOpen(flyoutId, false),
    [flyoutId, parentFlyout],
  );

  if (openCompactPanel) {
    return (
      <button
        type="button"
        className={styles.menuItem}
        onClick={() => openCompactPanel(label, content)}
      >
        {icon}
        <span>{label}</span>
        <ChevronRight className={styles.chevron} size={15} />
      </button>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={setRequestedOpen}
      placement="rightTop"
      trigger={["hover", "click"]}
      content={
        <FlyoutContext.Provider value={contextValue}>
          {content}
        </FlyoutContext.Provider>
      }
      classNames={{ root: styles.nestedPopover }}
      destroyOnHidden
      mouseEnterDelay={0.06}
      mouseLeaveDelay={0.18}
    >
      <button
        type="button"
        className={styles.menuItem}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {icon}
        <span>{label}</span>
        <ChevronRight className={styles.chevron} size={15} />
      </button>
    </Popover>
  );
}

interface Choice<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

function ChoicePanel<T extends string>({
  choices,
  value,
  onChange,
}: {
  choices: Choice<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className={styles.choicePanel}>
      {choices.map((choice) => {
        const selected = choice.value === value;
        return (
          <button
            type="button"
            key={choice.value}
            className={`${styles.choiceItem} ${
              selected ? styles.choiceItemSelected : ""
            }`}
            aria-current={selected ? "true" : undefined}
            onClick={() => onChange(choice.value)}
          >
            {choice.icon}
            <span>{choice.label}</span>
            {selected && <Check className={styles.check} size={16} />}
          </button>
        );
      })}
    </div>
  );
}

export default function SidebarSettingsPanel({
  version,
  onClose,
  onOpenDesktopMode,
  onOpenSettings,
  authEnabled = false,
  onOpenAccount,
  onLogout,
}: SidebarSettingsPanelProps) {
  const { t, i18n } = useTranslation();
  const compact = useIsMobile();
  const [panels, setPanels] = useState<
    Array<{ label: ReactNode; content: ReactNode }>
  >([]);
  const openPanel = useCallback((label: ReactNode, content: ReactNode) => {
    setPanels((current) => [...current, { label, content }]);
  }, []);
  const activePanel = compact ? panels[panels.length - 1] : undefined;
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelRef.current
      ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
      ?.focus({ preventScroll: true });
  }, [activePanel]);
  useEffect(() => {
    if (!compact) setPanels([]);
  }, [compact]);
  const {
    themeMode,
    setThemeMode,
    interfaceStyle = "classic",
    setInterfaceStyle,
    pageStyle = "classic",
    setPageStyle,
  } = useTheme();
  const [wideMode, setWideMode] = useState(getChatWideModePreference);
  const [showThinking, setShowThinking] = useState(getShowThinkingPreference);
  const [toolDisplayMode, setToolDisplayMode] = useState(
    getToolDisplayPreference,
  );
  const [assistantDisplayMode, setAssistantDisplayMode] = useState(
    getAssistantMessageDisplayPreference,
  );
  const rawLanguage = i18n.resolvedLanguage || i18n.language || "en";
  const currentLanguage = LANGUAGES.some(
    (language) => language.value === rawLanguage,
  )
    ? rawLanguage
    : rawLanguage.split("-")[0];

  const finishAction = (action: () => void) => {
    action();
    onClose?.();
  };

  const changeLanguage = (language: string) => {
    finishAction(() => {
      applyLanguagePreference(i18n, language, {
        onPersistError: () =>
          message.error(t("agentConfig.languageSaveFailed")),
      });
    });
  };

  const changeTheme = (theme: ThemeMode) => {
    finishAction(() => setThemeMode(theme));
  };

  const changeContentWidth = (width: ContentWidth) => {
    const enabled = width === "wide";
    finishAction(() => {
      setChatWideModePreference(enabled);
      setWideMode(enabled);
    });
  };

  const toggleThinkingDisplay = () => {
    const show = !showThinking;
    finishAction(() => {
      setShowThinkingPreference(show);
      setShowThinking(show);
    });
  };

  const changeToolDisplay = (mode: ToolDisplayPreference) => {
    finishAction(() => {
      setToolDisplayPreference(mode);
      setToolDisplayMode(mode);
    });
  };

  const changeAssistantDisplay = (mode: AssistantMessageDisplayPreference) => {
    finishAction(() => {
      setAssistantMessageDisplayPreference(mode);
      setAssistantDisplayMode(mode);
    });
  };

  const openLink = (url: string) => {
    finishAction(() => openExternalLink(url));
  };

  const languageChoices = (
    <ChoicePanel
      choices={LANGUAGES}
      value={currentLanguage}
      onChange={changeLanguage}
    />
  );

  const themeChoices = (
    <div className={styles.themePanel}>
      <p className={styles.choiceHeading}>
        {t("sidebar.settings.colorTheme", "Color palette")}
      </p>
      <ChoicePanel<InterfaceStyle>
        choices={COLOR_THEMES.map((theme) => ({
          value: theme.id,
          label: t(`sidebar.interfaceStyles.${theme.id}`, theme.label),
          icon: (
            <span
              className={styles.styleSwatch}
              style={{ backgroundColor: theme.swatch }}
              aria-hidden="true"
            />
          ),
        }))}
        value={interfaceStyle}
        onChange={(theme) => finishAction(() => setInterfaceStyle(theme))}
      />
      <p className={styles.choiceHeading}>
        {t("sidebar.settings.colorMode", "Light & dark")}
      </p>
      <ChoicePanel<ThemeMode>
        choices={[
          {
            value: "light",
            label: t("theme.light", "Light"),
            icon: <Sun size={15} />,
          },
          {
            value: "dark",
            label: t("theme.dark", "Dark"),
            icon: <Moon size={15} />,
          },
          {
            value: "system",
            label: t("theme.system", "System"),
            icon: <Monitor size={15} />,
          },
        ]}
        value={themeMode}
        onChange={changeTheme}
      />
    </div>
  );

  const widthChoices = (
    <ChoicePanel<ContentWidth>
      choices={[
        {
          value: "standard",
          label: t("settingsCenter.contentWidthStandard", "Standard"),
        },
        {
          value: "wide",
          label: t("settingsCenter.contentWidthWide", "Wide"),
        },
      ]}
      value={wideMode ? "wide" : "standard"}
      onChange={changeContentWidth}
    />
  );

  const toolDisplayChoices = (
    <ChoicePanel<ToolDisplayPreference>
      choices={[
        {
          value: "current",
          label: t("settingsCenter.toolDisplayCurrent", "Card view"),
        },
        {
          value: "raw-input-output",
          label: t("settingsCenter.toolDisplayRaw", "Raw parameters"),
        },
      ]}
      value={toolDisplayMode}
      onChange={changeToolDisplay}
    />
  );

  const assistantDisplayChoices = (
    <ChoicePanel<AssistantMessageDisplayPreference>
      choices={[
        {
          value: "expanded",
          label: t("settingsCenter.displayExpanded", "Expanded"),
        },
        {
          value: "process-collapsed",
          label: t(
            "settingsCenter.displayProcessCollapsed",
            "Collapse process",
          ),
        },
        {
          value: "result-collapsed",
          label: t("settingsCenter.displayResultCollapsed", "Collapse results"),
        },
      ]}
      value={assistantDisplayMode}
      onChange={changeAssistantDisplay}
    />
  );

  const appearanceContent = (
    <div className={styles.flyoutPanel}>
      <FlyoutItem
        icon={<Languages size={16} />}
        label={t("sidebar.settings.language", "Language")}
        content={languageChoices}
      />
      <FlyoutItem
        icon={<Palette size={16} />}
        label={t("sidebar.settings.theme", "Theme")}
        content={themeChoices}
      />
      <FlyoutItem
        icon={<PanelsTopLeft size={16} />}
        label={t("sidebar.settings.pageStyle", "Page style")}
        content={
          <ChoicePanel<PageStyle>
            choices={PAGE_STYLES.map((style) => ({
              value: style.id,
              label: t(`sidebar.pageStyles.${style.id}`, style.label),
              icon: <PanelsTopLeft size={16} />,
            }))}
            value={pageStyle}
            onChange={(style) => finishAction(() => setPageStyle(style))}
          />
        }
      />
      <button
        type="button"
        className={styles.menuItem}
        onClick={() => finishAction(onOpenDesktopMode)}
      >
        <Monitor size={16} />
        <span>{t("sidebar.settings.desktopMode", "Desktop mode")}</span>
      </button>
    </div>
  );

  const messageDisplayContent = (
    <div className={styles.flyoutPanel}>
      <FlyoutItem
        icon={<UnfoldHorizontal size={16} />}
        label={t("settingsCenter.contentWidth", "Message width")}
        content={widthChoices}
      />
      <FlyoutItem
        icon={<ListCollapse size={16} />}
        label={t(
          "settingsCenter.assistantDisplay",
          "Assistant message collapse",
        )}
        content={assistantDisplayChoices}
      />
      <button
        type="button"
        className={styles.menuItem}
        aria-pressed={showThinking}
        onClick={toggleThinkingDisplay}
      >
        <BrainCircuit size={16} />
        <span>{t("settingsCenter.thinkingDisplay", "Show thinking")}</span>
        {showThinking && <Check className={styles.check} size={16} />}
      </button>
      <FlyoutItem
        icon={<Wrench size={16} />}
        label={t("settingsCenter.toolDisplay", "Tool display")}
        content={toolDisplayChoices}
      />
    </div>
  );

  const rootContent = (
    <div ref={panelRef} className={styles.panel}>
      <LocalAvatarPicker />
      <FlyoutItem
        icon={<Palette size={16} />}
        label={t("sidebar.quickMenu.appearance", "Appearance")}
        content={appearanceContent}
      />
      <FlyoutItem
        icon={<MessageSquareText size={16} />}
        label={t("settingsCenter.chatDisplay", "Message display")}
        content={messageDisplayContent}
      />
      <button
        type="button"
        className={styles.menuItem}
        onClick={() => finishAction(onOpenSettings)}
      >
        <Settings size={16} />
        <span>{t("sidebar.quickMenu.settings", "Settings")}</span>
      </button>

      <div className={styles.divider} />
      <button
        type="button"
        className={styles.menuItem}
        onClick={() => openLink(UGSCI_WEBSITE_URL)}
      >
        <BookOpen size={16} />
        <span>{t("sidebar.quickMenu.manual", "Manual")}</span>
      </button>
      <button
        type="button"
        className={styles.menuItem}
        onClick={() => openLink(UGSCI_WEBSITE_URL)}
      >
        <Info size={16} />
        <span>{t("sidebar.quickMenu.about", "About UGSci")}</span>
        {version && <span className={styles.menuMeta}>v{version}</span>}
      </button>

      {authEnabled && (
        <>
          <div className={styles.divider} />
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => onOpenAccount && finishAction(onOpenAccount)}
          >
            <UserRound size={16} />
            <span>{t("account.title", "Account")}</span>
          </button>
          <button
            type="button"
            className={`${styles.menuItem} ${styles.dangerItem}`}
            onClick={() => onLogout && finishAction(onLogout)}
          >
            <LogOut size={16} />
            <span>{t("login.logout", "Logout")}</span>
          </button>
        </>
      )}
    </div>
  );

  return (
    <CompactMenuContext.Provider value={compact ? openPanel : null}>
      {activePanel ? (
        <div
          ref={panelRef}
          className={`${styles.panel} ${styles.compactPanel}`}
        >
          <button
            type="button"
            className={styles.menuItem}
            aria-label={t("common.back", "Back")}
            onClick={() => setPanels((current) => current.slice(0, -1))}
          >
            <ChevronLeft size={16} />
            <span>{activePanel.label}</span>
          </button>
          <div className={styles.divider} />
          {activePanel.content}
        </div>
      ) : (
        rootContent
      )}
    </CompactMenuContext.Provider>
  );
}
