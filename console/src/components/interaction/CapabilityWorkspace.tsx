import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Plug } from "lucide-react";
import { Button, type ModalProps } from "antd";
import { useTranslation } from "react-i18next";
import { SharedModal } from "./SharedModal";
import styles from "./CapabilityWorkspace.module.less";

const Context = createContext<{
  target: HTMLDivElement | null;
  setActive: (id: string | null) => void;
} | null>(null);

/** Keeps the original editors mounted while presenting one focused editor. */
export function CapabilityWorkspace({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const value = useMemo(() => ({ target, setActive }), [target]);
  if (!enabled) return children;
  return (
    <Context.Provider value={value}>
      <div className={styles.workspace}>
        <div hidden={!!active}>{children}</div>
        <div ref={setTarget} />
      </div>
    </Context.Provider>
  );
}

export function useCapabilityWorkspace() {
  return !!useContext(Context);
}

/** Only the configuration surface changes; validation and save/close stay owned by callers. */
export function CapabilityConfig({
  children,
  title,
  open,
  onCancel,
  footer,
  autoSave = false,
  ...props
}: Omit<ModalProps, "footer"> & {
  surfaceId?: string;
  footer?: ReactNode;
  autoSave?: boolean;
}) {
  const workspace = useContext(Context);
  const id = useId();
  const panel = useRef<HTMLElement>(null);
  const { t } = useTranslation();
  useEffect(() => {
    if (!workspace || !open) return;
    workspace.setActive(id);
    return () => workspace.setActive(null);
  }, [workspace, open, id]);
  useEffect(() => {
    if (!workspace?.target || !open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, [workspace?.target, open]);
  if (!workspace)
    return (
      <SharedModal
        {...props}
        title={title}
        open={open}
        onCancel={onCancel}
        footer={footer}
      >
        {children}
      </SharedModal>
    );
  if (!open || !workspace.target) return null;
  return createPortal(
    <section
      ref={panel}
      tabIndex={-1}
      className={styles.focus}
      aria-label={typeof title === "string" ? title : t("common.configure")}
    >
      <Button type="text" icon={<ArrowLeft size={16} />} onClick={onCancel}>
        {t("common.back", { defaultValue: "返回列表" })}
      </Button>
      <div className={styles.panel}>
        <h2>
          <Plug size={24} />
          {title}
        </h2>
        {autoSave && (
          <p className={styles.hint}>{t("common.configAutoSaveHint")}</p>
        )}
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </section>,
    workspace.target,
  );
}
