import { UgsciMotion } from "../../components/UgsciMotion";
import { Dropdown, type MenuProps } from "antd";
import {
  AppWindow,
  ChevronDown,
  FolderOpen,
  PanelRight,
  RotateCw,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { SessionFilesScope } from "../../api/modules/turnFiles";
import { useAppMessage } from "../../hooks/useAppMessage";
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
  onPreview: (trigger: HTMLElement) => void;
  moreActions?: DeliveryFileAction[];
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
  return <AppWindow size={18} aria-hidden="true" />;
}

/** All actions use the card's version; opening the current workspace is explicit. */
export default function DeliveryFileActions({
  name,
  target,
  scope,
  disabled = false,
  onPreview,
  moreActions = [],
}: Props) {
  const { t } = useTranslation();
  const { message } = useAppMessage();
  const primary = useRef<HTMLButtonElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
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
  ]);
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  const alive = useRef(true);
  const actionSequence = useRef(0);
  const native = Boolean(scope && isDeliveryNativeAvailable());
  const listed = listing?.identity === identity ? listing : undefined;
  const applications = listed?.value;
  const loading = native && !disabled && !listed;
  const defaultApp = applications?.applications.find(
    (application) => application.isDefault,
  );
  const openExternally = native && applications?.canOpenDefault;
  const applicationName = defaultApp?.name || t("delivery.systemDefault");

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      actionSequence.current += 1;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setOpen(false);
    setBusy(false);
    actionSequence.current += 1;
    if (!native || disabled) return;
    setListing(undefined);
    void listDeliveryApplications(name).then(
      (value) => {
        if (!cancelled) setListing({ identity, value });
      },
      () => {
        if (!cancelled) setListing({ identity, failed: true });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [identity, name, native, disabled, revision]);

  const runNative = async (applicationId?: string, reveal = false) => {
    if (!scope || !native || disabled || busy) return;
    const sequence = ++actionSequence.current;
    const isCurrent = () =>
      alive.current &&
      currentIdentity.current === identity &&
      actionSequence.current === sequence;
    setBusy(true);
    setOpen(false);
    menuTrigger.current?.focus();
    try {
      if (reveal) await revealDeliveryFile(target, scope, { isCurrent });
      else await openDeliveryFile(target, scope, applicationId, { isCurrent });
    } catch (error) {
      if (
        isCurrent() &&
        !(error instanceof Error && error.name === "AbortError")
      ) {
        message.error(
          t(reveal ? "delivery.revealFailed" : "delivery.openFailed"),
        );
      }
    } finally {
      if (isCurrent()) setBusy(false);
    }
  };
  const trigger = () => menuTrigger.current || primary.current!;
  const items: MenuProps["items"] = [];
  if (loading)
    items.push({
      key: "loading",
      disabled: true,
      icon: <UgsciMotion variant="button" size={16} />,
      label: t("delivery.loadingApps"),
    });
  if (listed?.failed) {
    items.push({
      key: "failed",
      disabled: true,
      label: t("delivery.appsFailed"),
    });
    items.push({
      key: "retry",
      icon: <RotateCw size={16} />,
      label: t("delivery.retryApps"),
      onClick: () => setRevision((value) => value + 1),
    });
  }
  for (const application of applications?.applications ?? []) {
    if (!applications?.canChooseApplication && !application.isDefault) continue;
    items.push({
      key: `app:${application.id}`,
      icon: (
        <span className={styles.appIcon}>
          <ApplicationIcon application={application} />
        </span>
      ),
      label: (
        <span>
          {application.name}
          {application.isDefault && (
            <span className={styles.defaultLabel}>{t("delivery.default")}</span>
          )}
        </span>
      ),
      disabled: disabled || busy,
      onClick: () =>
        void runNative(application.isDefault ? undefined : application.id),
    });
  }
  if (openExternally && !defaultApp)
    items.push({
      key: "default",
      icon: <AppWindow size={18} />,
      label: `${t("delivery.systemDefault")}${t("delivery.default")}`,
      disabled: disabled || busy,
      onClick: () => void runNative(),
    });
  items.push({
    key: "preview",
    icon: <PanelRight size={18} />,
    label: t("delivery.preview"),
    disabled,
    onClick: () => onPreview(trigger()),
  });
  const extras = moreActions.filter(
    (action) => !(native && action.key === "legacy-location"),
  );
  if (native || extras.length) items.push({ type: "divider" });
  if (native)
    items.push({
      key: "location",
      icon: <FolderOpen size={18} />,
      label: t("delivery.showLocation"),
      disabled: disabled || busy,
      onClick: () => void runNative(undefined, true),
    });
  items.push(
    ...extras.map((action) => ({
      key: action.key,
      label: action.label,
      icon: action.icon,
      disabled: action.disabled || busy,
      onClick: () => action.onSelect(trigger()),
    })),
  );

  return (
    <div className={styles.actions} data-testid="delivery-file-actions">
      <button
        ref={primary}
        type="button"
        className={styles.primary}
        disabled={disabled || loading || busy}
        aria-busy={loading || busy}
        aria-label={`${
          openExternally
            ? t("delivery.openUsing", { application: applicationName })
            : t("delivery.open")
        } ${name}`}
        title={
          openExternally
            ? t("delivery.openUsing", { application: applicationName })
            : t("delivery.preview")
        }
        onClick={(event) => {
          event.stopPropagation();
          if (openExternally) void runNative();
          else onPreview(event.currentTarget);
        }}
      >
        {loading || busy ? (
          <UgsciMotion variant="button" size={17} />
        ) : openExternally ? (
          <ApplicationIcon application={defaultApp} />
        ) : (
          <PanelRight size={18} />
        )}
      </button>
      <Dropdown
        autoFocus
        destroyOnHidden
        trigger={["click"]}
        placement="bottomRight"
        open={open}
        onOpenChange={setOpen}
        overlayClassName={styles.menu}
        overlayStyle={{ width: 248, maxWidth: "calc(100vw - 24px)" }}
        menu={{
          items,
          onClick: () => {
            setOpen(false);
          },
          onKeyDown: (event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
              menuTrigger.current?.focus();
            }
          },
        }}
      >
        <button
          ref={menuTrigger}
          type="button"
          className={styles.chevron}
          aria-label={`${t("delivery.openWith")} ${name}`}
          title={t("delivery.openWith")}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
              menuTrigger.current?.focus();
            }
          }}
        >
          <ChevronDown size={13} />
        </button>
      </Dropdown>
    </div>
  );
}
