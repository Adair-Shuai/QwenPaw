import {
  ArrowUp,
  Check,
  FileText,
  FolderOpen,
  Layers,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

/** Illustrative workflow, explicitly labelled as a preview. */
export function WorkspacePreview() {
  const { t } = useTranslation();

  return (
    <figure className="studio-preview">
      <figcaption className="studio-preview-caption">
        <span>{t("studio.preview.label")}</span>
        <span>01 / WORKSPACE</span>
      </figcaption>
      <div className="studio-window">
        <div className="studio-window-bar" aria-hidden>
          <div className="studio-window-dots">
            <i />
            <i />
            <i />
          </div>
          <span>UGSci</span>
          <MoreHorizontal size={17} />
        </div>
        <div className="studio-workspace">
          <aside
            className="studio-preview-sidebar"
            aria-label={t("studio.preview.sidebar")}
          >
            <div className="studio-preview-logo">
              <img src="/logo.svg" alt="" width={25} height={25} />
              <strong>UGSci</strong>
            </div>
            <div className="studio-preview-new">
              <Plus size={13} aria-hidden />
              {t("studio.preview.newTask")}
            </div>
            <div className="studio-preview-nav">
              <Search size={13} aria-hidden />
              {t("studio.preview.search")}
            </div>
            <div className="studio-preview-nav is-selected">
              <Layers size={13} aria-hidden />
              {t("studio.preview.workspace")}
            </div>
            <div className="studio-preview-nav">
              <Users size={13} aria-hidden />
              {t("studio.preview.team")}
            </div>
            <div className="studio-preview-nav">
              <FolderOpen size={13} aria-hidden />
              {t("studio.preview.files")}
            </div>
            <div className="studio-preview-project">
              {t("studio.preview.project")}
            </div>
            <div className="studio-preview-project-name">
              <span />
              {t("studio.preview.projectName")}
            </div>
            <div className="studio-preview-user">
              <span>U</span>
              <span>{t("studio.preview.personal")}</span>
            </div>
          </aside>
          <div className="studio-preview-main">
            <div className="studio-preview-heading">
              <span>{t("studio.preview.task")}</span>
              <MoreHorizontal size={15} aria-hidden />
            </div>
            <div className="studio-preview-conversation">
              <p className="studio-preview-prompt">
                {t("studio.preview.prompt")}
              </p>
              <div className="studio-preview-assistant">
                <img src="/logo.svg" alt="" width={24} height={24} />
                <strong>UGSci</strong>
                <span>{t("studio.preview.collaboration")}</span>
              </div>
              <p className="studio-preview-response">
                {t("studio.preview.response")}
              </p>
              <div className="studio-preview-steps">
                {["research", "analysis", "report"].map((key, index) => (
                  <div className="studio-preview-step" key={key}>
                    <span className="studio-preview-step-icon">
                      <Check size={12} aria-hidden />
                    </span>
                    <span>{t(`studio.preview.steps.${key}`)}</span>
                    <span className="studio-preview-step-number">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="studio-preview-artifact">
                <FileText size={22} strokeWidth={1.3} aria-hidden />
                <div>
                  <strong>{t("studio.preview.artifact")}</strong>
                  <span>Markdown · {t("studio.preview.ready")}</span>
                </div>
                <Check size={14} aria-hidden />
              </div>
            </div>
            <div className="studio-preview-composer">
              <span>{t("studio.preview.composer")}</span>
              <span className="studio-preview-send">
                <ArrowUp size={14} aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="studio-preview-footnote">
        <span className="studio-status-dot" />
        {t("studio.preview.footnote")}
      </div>
    </figure>
  );
}
