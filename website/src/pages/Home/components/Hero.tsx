import { ArrowDown, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteConfig } from "@/config-context";
import { trackHeroQuickTryClick } from "@/lib/analytics";
import { WorkspacePreview } from "./WorkspacePreview";

export function Hero() {
  const { t } = useTranslation();
  const { docsPath } = useSiteConfig();

  const scrollToQuickStart = () => {
    document.getElementById("qwenpaw-quickstart")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <section className="studio-hero" aria-labelledby="qwenpaw-hero-heading">
      <div className="studio-container">
        <div className="studio-hero-topline">
          <span className="studio-eyebrow">UGSCI / AGENT WORKSPACE</span>
          <Link to="/release-notes" className="studio-release-link">
            {t("studio.release")}
            <ArrowUpRight size={14} aria-hidden />
          </Link>
        </div>
        <div className="studio-hero-grid">
          <div className="studio-hero-copy">
            <div className="studio-hero-brand" aria-hidden>
              <img src="/logo.svg" alt="" width={40} height={40} />
              <span>UGSci</span>
            </div>
            <h1 id="qwenpaw-hero-heading">
              {t("studio.title")}
              <span>{t("studio.titleSecond")}</span>
            </h1>
            <p className="studio-hero-description">{t("studio.description")}</p>
            <div className="studio-hero-actions">
              <Link
                to="/downloads"
                className="studio-button studio-button-primary"
              >
                {t("nav.download")}
                <ArrowRight size={17} aria-hidden />
              </Link>
              <button
                type="button"
                className="studio-button studio-button-secondary"
                onClick={scrollToQuickStart}
              >
                {t("hero.quickStart")}
                <ArrowDown size={16} aria-hidden />
              </button>
            </div>
            <div className="studio-hero-notes">
              {["local", "agents", "extensible"].map((key) => (
                <span key={key}>
                  <Check size={13} aria-hidden />
                  {t(`studio.notes.${key}`)}
                </span>
              ))}
            </div>
            <a
              className="studio-text-link"
              href="https://platform.agentscope.io/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackHeroQuickTryClick}
            >
              {t("studio.tryPlatform")}
              <ArrowUpRight size={14} aria-hidden />
            </a>
          </div>
          <WorkspacePreview />
        </div>
        <div className="studio-hero-bottomline">
          <span>{t("studio.bottomline")}</span>
          <Link to={docsPath} className="studio-text-link">
            {t("hero.cta")}
            <ArrowUpRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
