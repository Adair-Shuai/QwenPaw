import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteConfig } from "@/config-context";

export function FinalCTA() {
  const { t } = useTranslation();
  const { docsPath } = useSiteConfig();

  return (
    <section className="studio-final" aria-labelledby="studio-final-heading">
      <div className="studio-container studio-final-inner">
        <div>
          <p className="studio-eyebrow">YOUR NEXT CHAPTER</p>
          <h2 id="studio-final-heading">{t("studio.final.title")}</h2>
          <p>{t("studio.final.description")}</p>
        </div>
        <div className="studio-final-actions">
          <Link to="/downloads" className="studio-button studio-button-primary">
            {t("nav.download")} UGSci
            <ArrowRight size={17} aria-hidden />
          </Link>
          <Link to={docsPath} className="studio-button studio-button-secondary">
            <BookOpen size={16} aria-hidden />
            {t("hero.cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
