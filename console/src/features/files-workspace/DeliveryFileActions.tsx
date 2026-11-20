import { UgsciMotion } from "../../components/UgsciMotion";
import { Dropdown, type MenuProps } from "antd";
import {
  AppWindow,
  ChevronDown,
  Copy,
  Download,
  FolderOpen,
  PanelsTopLeft,
  PanelRight,
  RotateCw,
} from "lucide-react";
import {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { getApiToken, getApiUrl } from "../../api/config";
import type { SessionFilesScope } from "../../api/modules/turnFiles";
import { useAppMessage } from "../../hooks/useAppMessage";
import { copyText } from "../../utils/clipboard";
import { DownloadCancelledError } from "../../utils/downloadFileFromUrl";
import {
  copyDeliveryImage,
  downloadDeliveryContent,
} from "./deliveryFileContent";
import type { FileTarget } from "./types";
import {
  isDeliveryNativeAvailable,
  listDeliveryApplications,
  openDeliveryFile,
  revealDeliveryFile,
  type DeliveryApplication,
  type DeliveryApplications,
} from "./deliveryFileNative";
import styles from "./DeliveryFileActions.module.less";

export interface DeliveryFileAction {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  onSelect: (trigger: HTMLElement) => void;
}

interface Props {
  name: string;
  target: FileTarget;
  scope?: SessionFilesScope;
  disabled?: boolean;
  onPreview: (trigger: HTMLElement, presentation?: "floating") => void;
  moreActions?: DeliveryFileAction[];
  compact?: boolean;
  children?: (actions: ReactNode) => ReactElement;
}

function ApplicationIcon({
  application,
}: {
  application?: DeliveryApplication;
}) {
  const [failed, setFailed] = useState(false);
  const source = application?.iconDataUrl;
  useEffect(() => setFailed(false), [source]);
  if (
    !failed &&
    source &&
    /^data:image\/(?:png|ico|x-icon|vnd\.microsoft\.icon);base64,/i.test(source)
  ) {
    return (
      <img
        src={source}
        alt=""
        aria-hidden="true"
        onError={() => setFailed(true)}
      />
    );
  }
  return <AppWindow size={14} aria-hidden="true" />;
}

/** Native and context menus share one pending operation and the card's exact version. */
export default function DeliveryFileActions({
  name,
  target,
  scope,
  disabled = false,
  onPreview,
  moreActions = [],
  compact = false,
  children,
}: Props) {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const primary = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const applicationMenu = useRef<HTMLDivElement>(null);
  const cardMenu = useRef<HTMLDivElement>(null);
  const contextTrigger = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [contextAtCursor, setContextAtCursor] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [listing, setListing] = useState<{
    identity: string;
    value?: DeliveryApplications;
    failed?: boolean;
  }>();
  const identity = JSON.stringify([
    scope,
    target.source,
    target.root,
    target.path,
    target.artifactUrl,
    target.artifact?.id,
    target.artifact?.binaryUrl,
    target.artifact?.meta,
    target.artifact?.textContent,
  ]);
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  const alive = useRef(true);
  const actionSequence = useRef(0);
  const listSequence = useRef(0);
  const native = Boolean(scope && isDeliveryNativeAvailable());
  const listed = listing?.identity === identity ? listing : undefined;
  const applications = listed?.value;
  const editorOnly = applications?.editorOnly === true;
  const loading = native && !disabled && !listed;
  const defaultApp = applications?.applications.find(
    (application) => application.isDefault,
  );
  const preferred = editorOnly
    ? undefined
    : defaultApp ??
      (applications?.canChooseApplication
        ? applications.applications[0]
        : undefined);
  const openExternally =
    native && !editorOnly && Boolean(applications?.canOpenDefault || preferred);
  const revealDefault = native && !disabled && !loading && !openExternally;
  const applicationName = preferred?.name || t("delivery.systemDefault");
  const hasApplicationMenu =
    native &&
    (loading || disabled || listed?.failed || openExternally || editorOnly);
  const trigger = () =>
    (contextOpen ? contextTrigger.current : menuTrigger.current) ||
    primary.current!;
  const preferredId =
    preferred && (!preferred.isDefault || !applications?.canOpenDefault)
      ? preferred.id
      : undefined;

  const loadApplications = useCallback(
    (refresh = false) => {
      if (!native || disabled) return;
      const request = ++listSequence.current;
      void listDeliveryApplications(name, refresh, scope).then(
        (value) => {
          if (
            alive.current &&
            currentIdentity.current === identity &&
            listSequence.current === request
          )
            setListing({ identity, value });
        },
        () => {
          if (
            alive.current &&
            currentIdentity.current === identity &&
            listSequence.current === request
          )
            setListing({ identity, failed: true });
        },
      );
    },
    // identity includes every scope field used by application discovery.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [native, disabled, name, identity],
  );
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      actionSequence.current += 1;
      listSequence.current += 1;
    };
  }, []);
  useEffect(() => {
    setOpen(false);
    setContextOpen(false);
    setBusy(false);
    busyRef.current = false;
    actionSequence.current += 1;
    setListing(undefined);
    loadApplications();
    return () => {
      listSequence.current += 1;
    };
  }, [loadApplications]);

  useEffect(() => {
    if (!open && !contextOpen) return;
    const frame = requestAnimationFrame(() => {
      const root =
        contextOpen && (native || contextAtCursor)
          ? cardMenu.current
          : applicationMenu.current;
      if (root && !root.contains(document.activeElement)) {
        root
          .querySelector<HTMLElement>(
            '[role="menuitem"]:not([aria-disabled="true"])',
          )
          ?.focus();
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [open, contextOpen, contextAtCursor, native, listing]);

  const run = async (
    operation: (isCurrent: () => boolean) => Promise<void>,
    failure: string,
    success?: string,
  ) => {
    if (busyRef.current) return;
    const sequence = ++actionSequence.current;
    const credential = getApiToken();
    const backend = getApiUrl("/");
    const isCurrent = () =>
      alive.current &&
      currentIdentity.current === identity &&
      actionSequence.current === sequence &&
      getApiToken() === credential &&
      getApiUrl("/") === backend;
    const origin = trigger();
    busyRef.current = true;
    setBusy(true);
    setOpen(false);
    setContextOpen(false);
    origin?.focus();
    try {
      await operation(isCurrent);
      if (isCurrent() && success) message.success(t(success));
    } catch (error) {
      if (
        isCurrent() &&
        !(error instanceof DownloadCancelledError) &&
        !(error instanceof Error && error.name === "AbortError")
      )
        message.error(t(failure));
    } finally {
      if (isCurrent()) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };
  const runNative = (applicationId?: string, reveal = false) => {
    if (!scope || !native || disabled || loading) return;
    void run(
      (isCurrent) =>
        reveal
          ? revealDeliveryFile(target, scope, { isCurrent })
          : openDeliveryFile(target, scope, applicationId, { isCurrent }),
      reveal ? "delivery.revealFailed" : "delivery.openFailed",
    );
  };
  const closeContext = () => {
    setContextOpen(false);
    contextTrigger.current?.focus();
  };
  const preview = (presentation?: "floating") => {
    const origin = trigger();
    setContextOpen(false);
    if (presentation) onPreview(origin, presentation);
    else onPreview(origin);
  };
  const location = {
    key: "location",
    icon: <FolderOpen size={14} />,
    label: t("delivery.showLocation"),
    disabled: disabled || busy,
    onClick: () => runNative(undefined, true),
  };
  const previewItem = {
    key: "preview",
    icon: <PanelRight size={14} />,
    label: t("delivery.preview"),
    disabled,
    onClick: () => preview(),
  };
  const appItems: MenuProps["items"] = editorOnly ? [previewItem] : [];
  const appRows: MenuProps["items"] = (applications?.applications ?? [])
    .filter(
      (application) =>
        applications?.canChooseApplication || application.isDefault,
    )
    .map((application) => ({
      key: `app:${application.id}`,
      icon: (
        <span className={styles.appIcon}>
          <ApplicationIcon application={application} />
        </span>
      ),
      label: (
        <span>
          {application.name}
          {(editorOnly
            ? application.isDefault
            : application.id === preferred?.id) && (
            <span className={styles.defaultLabel}>{t("delivery.default")}</span>
          )}
        </span>
      ),
      disabled: disabled || busy,
      onClick: () =>
        runNative(
          application.isDefault && applications?.canOpenDefault
            ? undefined
            : application.id,
        ),
    }));
  if (openExternally && !preferred)
    appRows.push({
      key: "default",
      icon: <AppWindow size={14} />,
      label: `${t("delivery.systemDefault")}${t("delivery.default")}`,
      disabled: disabled || busy,
      onClick: () => runNative(),
    });
  if (loading)
    appRows.push({
      key: "loading",
      disabled: true,
      label: t("delivery.loadingApps"),
    });
  if (listed?.failed) {
    appRows.push({
      key: "failed",
      disabled: true,
      label: t("delivery.appsFailed"),
    });
    appRows.push({
      key: "retry",
      icon: <RotateCw size={14} />,
      label: t("delivery.retryApps"),
      onClick: () => loadApplications(true),
    });
  }
  if (appRows.length)
    appItems.push({
      key: "applications",
      type: "group",
      className: styles.applicationList,
      children: appRows,
    });
  appItems.push({ type: "divider" }, location);

  const extras = moreActions.filter(
    (action) => !(native && action.key === "legacy-location"),
  );
  const contextItems: MenuProps["items"] = [
    previewItem,
    {
      key: "float",
      icon: <PanelsTopLeft size={14} />,
      label: t("delivery.floatPreview"),
      disabled,
      onClick: () => preview("floating"),
    },
    ...(native
      ? [
          location,
          ...(editorOnly
            ? appRows
            : [
                {
                  key: "default",
                  icon: <ApplicationIcon application={preferred} />,
                  label: openExternally
                    ? t("delivery.openUsing", { application: applicationName })
                    : t("delivery.systemDefault"),
                  disabled: disabled || busy || !openExternally,
                  onClick: () => runNative(preferredId),
                },
              ]),
        ]
      : []),
    {
      key: "copy-path",
      icon: <Copy size={14} />,
      label: t("delivery.copyPath"),
      onClick: () =>
        void run(
          () => copyText(target.path),
          "delivery.copyFailed",
          "delivery.copied",
        ),
    },
  ];
  if (/\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i.test(name))
    contextItems.push({
      key: "copy-image",
      icon: <Copy size={14} />,
      label: t("delivery.copyImage"),
      disabled:
        disabled ||
        !scope ||
        !navigator.clipboard?.write ||
        typeof ClipboardItem === "undefined",
      onClick: () => {
        if (scope)
          void run(
            (isCurrent) => copyDeliveryImage(target, scope, isCurrent),
            "delivery.copyFailed",
            "delivery.copied",
          );
      },
    });
  if (extras.length) contextItems.push({ type: "divider" });
  contextItems.push(
    ...extras.map((action) => ({
      key: action.key,
      label:
        native && action.key === "download"
          ? t("delivery.saveAs")
          : action.label,
      icon: action.icon,
      disabled: action.disabled || busy,
      onClick: () => action.onSelect(trigger()),
    })),
  );
  if (!extras.some((action) => action.key === "download"))
    contextItems.push({
      key: "download",
      icon: <Download size={14} />,
      label: t(native ? "delivery.saveAs" : "delivery.download"),
      disabled: disabled || !scope || busy,
      onClick: () => {
        if (scope)
          void run(
            () => downloadDeliveryContent(target, scope),
            "turnFiles.downloadFailed",
          );
      },
    });

  const contextMenu: MenuProps = {
    items: contextItems,
    onClick: () => setContextOpen(false),
    onKeyDown: (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeContext();
      }
    },
  };
  const primaryLabel = revealDefault
    ? t("delivery.showLocation")
    : openExternally
    ? t("delivery.openUsing", { application: applicationName })
    : t("delivery.open");
  const control = (
    <div
      className={`${styles.actions}${compact ? ` ${styles.compact}` : ""}`}
      data-testid="delivery-file-actions"
    >
      <button
        ref={primary}
        type="button"
        className={styles.primary}
        disabled={disabled || loading || busy}
        aria-busy={loading || busy}
        aria-label={`${primaryLabel} ${name}`}
        title={
          revealDefault
            ? t("delivery.showLocation")
            : openExternally
            ? primaryLabel
            : t("delivery.preview")
        }
        onClick={(event) => {
          event.stopPropagation();
          if (revealDefault) runNative(undefined, true);
          else if (openExternally) runNative(preferredId);
          else onPreview(event.currentTarget);
        }}
      >
        {loading || busy ? (
          <UgsciMotion variant="button" size={13} />
        ) : revealDefault ? (
          <FolderOpen size={14} />
        ) : openExternally ? (
          <ApplicationIcon application={preferred} />
        ) : (
          <PanelRight size={14} />
        )}
      </button>
      {(hasApplicationMenu || !native || disabled) && (
        <Dropdown
          autoFocus
          destroyOnHidden
          trigger={["click"]}
          placement="bottomRight"
          open={
            native ? open && !loading && !busy : contextOpen && !contextAtCursor
          }
          onOpenChange={(next) => {
            if (native) {
              setOpen(next);
              if (next && !listed?.failed) loadApplications(true);
            } else {
              contextTrigger.current = menuTrigger.current;
              setContextAtCursor(false);
              setContextOpen(next);
            }
          }}
          popupRender={(menu) => <div ref={applicationMenu}>{menu}</div>}
          overlayClassName={styles.menu}
          overlayStyle={{
            minWidth: 144,
            maxWidth: "min(360px, calc(100vw - 24px))",
            width: "max-content",
          }}
          menu={
            native
              ? {
                  items: appItems,
                  onClick: () => setOpen(false),
                  onKeyDown: (event) => {
                    if (event.key === "Escape") {
                      event.stopPropagation();
                      setOpen(false);
                      menuTrigger.current?.focus();
                    }
                  },
                }
              : contextMenu
          }
        >
          <button
            ref={menuTrigger}
            type="button"
            className={styles.chevron}
            disabled={native && (loading || busy)}
            aria-label={`${t("delivery.openWith")} ${name}`}
            title={t(native ? "delivery.openWith" : "delivery.fileMenu")}
            aria-haspopup="menu"
            aria-expanded={native ? open && !loading && !busy : contextOpen}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setOpen(false);
                closeContext();
                menuTrigger.current?.focus();
              }
            }}
          >
            <ChevronDown size={10} />
          </button>
        </Dropdown>
      )}
    </div>
  );
  const card = children ? children(control) : control;
  return (
    <Dropdown
      autoFocus
      destroyOnHidden
      trigger={["contextMenu"]}
      open={contextOpen && (native || contextAtCursor)}
      onOpenChange={(next) => {
        setContextAtCursor(true);
        setContextOpen(next);
      }}
      popupRender={(menu) => <div ref={cardMenu}>{menu}</div>}
      overlayClassName={styles.menu}
      overlayStyle={{
        minWidth: 180,
        maxWidth: "min(360px, calc(100vw - 24px))",
      }}
      menu={contextMenu}
    >
      {cloneElement(card, {
        onContextMenu: (event: React.MouseEvent<HTMLElement>) => {
          contextTrigger.current =
            event.currentTarget.querySelector<HTMLButtonElement>(
              "button:not(:disabled)",
            ) || event.currentTarget;
          setOpen(false);
          setContextAtCursor(true);
          setContextOpen(true);
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
          if (
            event.key === "ContextMenu" ||
            (event.key === "F10" && event.shiftKey)
          ) {
            event.preventDefault();
            contextTrigger.current = event.target as HTMLElement;
            setOpen(false);
            setContextAtCursor(true);
            setContextOpen(true);
          }
        },
      } as HTMLAttributes<HTMLElement>)}
    </Dropdown>
  );
}
