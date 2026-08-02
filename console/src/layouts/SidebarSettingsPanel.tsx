import React from "react";
import { useTranslation } from "react-i18next";

import { Select } from "antd";
import { isTauriRuntime } from "../tauri/backendRuntime";
import {
  clearRememberedCloseAction,
  getRememberedCloseAction,
  setRememberedCloseAction,
  type CloseAction,
} from "../tauri/closeWindowPreference";
import styles from "./sidebarSettingsPanel.module.less";

type CloseBehavior = "ask" | CloseAction;

// ── Component ─────────────────────────────────────────────────────────────

interface SidebarSettingsPanelProps {
  onClose?: () => void;
}

export default function SidebarSettingsPanel({}: SidebarSettingsPanelProps) {
  const { t } = useTranslation();
  const [closeBehavior, setCloseBehavior] = React.useState<CloseBehavior>(() =>
    isTauriRuntime() ? getRememberedCloseAction() ?? "ask" : "ask",
  );

  const changeCloseBehavior = (value: CloseBehavior) => {
    if (value === "ask") {
      clearRememberedCloseAction();
    } else {
      setRememberedCloseAction(value);
    }
    setCloseBehavior(value);
  };

  return (
    <div className={styles.panel}>
      {/* ── Close Window (desktop only) ──────────────────── */}
      {isTauriRuntime() ? (
        <div className={styles.row}>
          <span className={styles.label}>
            {t("desktop.closeWindow.preference", "Close Window")}
          </span>
          <Select<CloseBehavior>
            size="small"
            style={{ width: "100%" }}
            value={closeBehavior}
            onChange={changeCloseBehavior}
            options={[
              {
                value: "ask",
                label: t("desktop.closeWindow.askEveryTime", "Ask every time"),
              },
              {
                value: "minimize-to-tray",
                label: t(
                  "desktop.closeWindow.minimizeToTray",
                  "Minimize to Tray",
                ),
              },
              {
                value: "quit",
                label: t("desktop.closeWindow.quitApp", "Quit App"),
              },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
