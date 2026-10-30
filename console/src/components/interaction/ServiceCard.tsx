import { useState, type ReactNode } from "react";
import { Button, Switch } from "antd";
import { Settings2, Plug } from "lucide-react";
import { useCapabilityWorkspace } from "./CapabilityWorkspace";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "motion/react";
import InlineHelp from "@/components/InlineHelp";
import { InteractiveCard } from "./InteractiveCard";
import styles from "./ServiceCard.module.less";

export function ServiceCard({
  name,
  description,
  metadata,
  enabled,
  onConfigure,
  onToggle,
  actions,
  surfaceId,
  icon,
}: {
  surfaceId?: string;
  icon?: ReactNode;
  name: string;
  description?: ReactNode;
  metadata?: ReactNode;
  enabled: boolean;
  onConfigure: () => void;
  onToggle: () => Promise<void> | void;
  actions?: ReactNode;
}) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [pending, setPending] = useState(false);
  const compact = useCapabilityWorkspace();
  return (
    <motion.div
      className={styles.frame}
      layout
      transition={{
        layout: reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 340, damping: 36 },
      }}
    >
      <InteractiveCard
        data-themed-card="true"
        tilt={0}
        layoutId={reducedMotion ? undefined : surfaceId}
        style={{ borderRadius: compact ? 12 : 20 }}
        className={`${styles.card} ${compact ? styles.compact : ""}`}
        onClick={(event) => {
          if (
            !(event.target instanceof Element) ||
            event.target.closest(
              'button, a, input, [role="button"], [role="switch"]',
            )
          )
            return;
          onConfigure();
        }}
      >
        <div className={styles.heading}>
          {compact && (
            <span className={styles.avatar}>{icon || <Plug size={21} />}</span>
          )}
          <h3>
            <button type="button" title={name} onClick={onConfigure}>
              {name}
            </button>
          </h3>
          {description && <InlineHelp>{description}</InlineHelp>}
        </div>
        {compact && <div className={styles.description}>{description}</div>}
        <div className={styles.metadata}>{metadata}</div>
        <div className={styles.actions}>
          <Button
            type="text"
            icon={<Settings2 size={16} />}
            onClick={onConfigure}
          >
            {t("common.configure")}
          </Button>
          <div className={styles.trailing}>
            {actions}
            <Switch
              checked={enabled}
              loading={pending}
              aria-label={`${t(
                enabled ? "common.disable" : "common.enable",
              )}: ${name}`}
              onChange={async () => {
                setPending(true);
                try {
                  await onToggle();
                } finally {
                  setPending(false);
                }
              }}
            />
          </div>
        </div>
      </InteractiveCard>
    </motion.div>
  );
}
