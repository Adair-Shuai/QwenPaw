import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildAuthHeaders } from "@/api/authHeaders";
import { getApiUrl } from "@/api/config";
import styles from "./index.module.less";

type PackageReport = {
  candidates: { version: string; metadata_path: string }[];
  observed_metadata_path: string | null;
  loaded_modules: Record<string, string>;
  requirements: string[];
  action:
    | "reuse"
    | "compatible_candidates"
    | "review_versions"
    | "review_files";
};

export function DependencyDetails({
  pluginId,
  warnings,
}: {
  pluginId: string;
  warnings: Set<string>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [packages, setPackages] = useState<Record<string, PackageReport>>({});

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch(
      getApiUrl(
        `/plugins/${encodeURIComponent(pluginId)}/dependency-diagnostics`,
      ),
      {
        headers: buildAuthHeaders(),
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) return;
        const report = await response.json();
        if (!controller.signal.aborted && report.consumer === "host") {
          setPackages(report.packages ?? {});
        }
      })
      .catch(() => {}); // The original diagnostics also work with older hosts.
    return () => controller.abort();
  }, [open, pluginId]);

  return (
    <details
      className={styles.cardDependencyDetails}
      onToggle={(event) => {
        setOpen(event.currentTarget.open);
        if (!event.currentTarget.open) setPackages({});
      }}
    >
      <summary>{t("appCenter.duplicatePythonDependencies")}</summary>
      <ul>
        {[...warnings].map((warning) => {
          const name = warning.split(":", 1)[0];
          const report = packages[name];
          if (!report) return <li key={warning}>{warning}</li>;
          return (
            <li key={warning}>
              <strong>{report.requirements.join(", ") || name}</strong>
              <div>{t(`appCenter.dependencyAdvice.${report.action}`)}</div>
              {report.candidates.map((p) => (
                <div key={p.metadata_path}>
                  {p.metadata_path === report.observed_metadata_path &&
                    t("appCenter.dependencyAdvice.observed") + " · "}
                  <code>
                    {p.version} · {p.metadata_path}
                  </code>
                </div>
              ))}
              {Object.entries(report.loaded_modules).map(([module, path]) => (
                <div key={module}>
                  <code>
                    {module} → {path}
                  </code>
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
