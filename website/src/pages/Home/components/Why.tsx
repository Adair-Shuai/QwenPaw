import { ArrowUpRight, Blocks, FolderOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteConfig } from "@/config-context";

const principles = [
  { key: "collaborate", icon: Users, slug: "multi-agent" },
  { key: "context", icon: FolderOpen, slug: "memory" },
  { key: "extend", icon: Blocks, slug: "plugins" },
] as const;

export function Why() {
  const { t } = useTranslation();
  const { docsPath } = useSiteConfig();
  const docsBase = docsPath.replace(/\/$/, "");

  return (
    <section
      className="studio-principles"
      aria-labelledby="studio-principles-heading"
    >
      <div className="studio-container">
        <div className="studio-section-heading">
          <p className="studio-eyebrow">BUILT AROUND YOUR WORK</p>
          <h2 id="studio-principles-heading">{t("studio.principles.title")}</h2>
          <p>{t("studio.principles.description")}</p>
        </div>
        <div className="studio-principles-grid">
          {principles.map(({ key, icon: Icon, slug }, index) => (
            <Link
              to={`${docsBase}/${slug}`}
              className="studio-principle"
              key={key}
            >
              <div className="studio-principle-top">
                <Icon size={23} strokeWidth={1.4} aria-hidden />
                <span>0{index + 1}</span>
              </div>
              <h3>{t(`studio.principles.${key}.title`)}</h3>
              <p>{t(`studio.principles.${key}.description`)}</p>
              <span className="studio-principle-link">
                {t("worksForYou.learnMore")}
                <ArrowUpRight size={15} aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
