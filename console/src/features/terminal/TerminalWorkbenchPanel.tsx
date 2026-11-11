import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import {
  useSessionTerminalOpen,
  useTerminalSurfaceStore,
} from "../../stores/terminalSurfaceStore";
import { filesWorkspaceScopeKey } from "../files-workspace/filesWorkspaceScope";
import { TerminalSessionPanel } from "./TerminalDock";
import type { TerminalScope } from "./terminalApi";
import { terminalGroup } from "./terminalIdentity";
import { useTerminalEnabled } from "./useTerminalEnabled";
import styles from "./TerminalDock.module.less";

/** A second presentation of the existing session terminal, with one I/O owner. */
export default function TerminalWorkbenchPanel({
  scope,
  active,
  onClose,
  terminalTarget,
}: {
  scope: TerminalScope;
  active: boolean;
  onClose?: () => void;
  terminalTarget?: { id: string; nonce: string };
}) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const capability = useTerminalEnabled(scope.agentId);
  const scopeKey = filesWorkspaceScopeKey(scope);
  const dockOpen = useSessionTerminalOpen(scopeKey);
  const group = terminalGroup(scope.agentId, scope.sessionId);

  return (
    <div className={styles.workspace}>
      {!capability.confirmed ? (
        <div className={styles.empty} role="status">
          {t("common.loading")}
        </div>
      ) : !capability.enabled ? (
        <div className={styles.empty} role="status">
          {t(
            capability.reason === "dependency_missing"
              ? "terminal.dependencyMissing"
              : capability.reason === "unavailable"
              ? "terminal.unavailable"
              : "terminal.authRequired",
          )}
        </div>
      ) : dockOpen ? (
        <div className={styles.empty} role="status">
          <p>{t("terminal.inBottomPanel")}</p>
          <button
            type="button"
            onClick={() =>
              useTerminalSurfaceStore.getState().setSessionOpen(scopeKey, false)
            }
          >
            {t("terminal.moveToWorkspace")}
          </button>
        </div>
      ) : (
        <TerminalSessionPanel
          key={group}
          group={group}
          terminalTarget={terminalTarget}
          scope={scope}
          isDark={isDark}
          open={active}
          hideLabel={t("terminal.closeView")}
          setOpen={(open) => {
            if (!open) onClose?.();
          }}
        />
      )}
    </div>
  );
}
