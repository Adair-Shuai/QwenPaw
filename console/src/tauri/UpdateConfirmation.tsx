import { invoke } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, PanelsTopLeft, RotateCw, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import type { UpdateConfirmationRequest } from "./desktopUpdate";
import styles from "./DesktopClient.module.less";

export default function UpdateConfirmation({
  request,
}: {
  request: UpdateConfirmationRequest;
}) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dialog.current?.showModal();
    cancel.current?.focus({ preventScroll: true });
  }, []);

  async function answer(confirmed: boolean) {
    if (pending.current) return;
    pending.current = true;
    setSubmitting(true);
    setError("");
    try {
      await invoke("confirm_desktop_update", {
        requestId: request.requestId,
        confirmed,
      });
    } catch (reason) {
      pending.current = false;
      setSubmitting(false);
      setError(String(reason));
    }
  }

  return (
    <dialog
      ref={dialog}
      className={`${styles.closeDialog} ${styles.updateDialog}`}
      aria-labelledby="desktop-update-title"
      aria-describedby={
        request.otherWindows > 0
          ? "desktop-update-description desktop-update-windows"
          : "desktop-update-description"
      }
      aria-busy={submitting}
      onCancel={(event) => {
        event.preventDefault();
        void answer(false);
      }}
    >
      <header className={styles.closeHeader}>
        <img
          className={styles.updateLogo}
          src={`${import.meta.env.BASE_URL}ugsci-mono/brand/lockup-${
            isDark ? "white" : "black"
          }.svg`}
          alt="UGSci"
          width={114}
          height={32}
        />
        <button
          className={styles.dismissClose}
          aria-label={t("common.cancel")}
          disabled={submitting}
          onClick={() => void answer(false)}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>
      <h2 id="desktop-update-title">{t("desktop.update.title")}</h2>
      <p id="desktop-update-description">{t("desktop.update.description")}</p>
      {request.otherWindows > 0 && (
        <p id="desktop-update-windows" className={styles.updateWindows}>
          <PanelsTopLeft size={18} aria-hidden="true" />
          <span>
            {t("desktop.update.otherWindows", { count: request.otherWindows })}
          </span>
        </p>
      )}
      {error && (
        <div className={styles.closeError} role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      <footer>
        <button
          ref={cancel}
          data-press
          disabled={submitting}
          onClick={() => void answer(false)}
        >
          {t("common.cancel")}
        </button>
        <button
          data-press
          className={styles.installUpdate}
          disabled={submitting}
          onClick={() => void answer(true)}
        >
          <RotateCw size={16} aria-hidden="true" />
          {t(
            submitting ? "desktop.update.preparing" : "desktop.update.confirm",
          )}
        </button>
      </footer>
    </dialog>
  );
}
