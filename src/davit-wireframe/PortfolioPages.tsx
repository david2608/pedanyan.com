import React, { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Linkedin, Shield } from "lucide-react";
import portfolioManifest from "./portfolio-content.json";
import "@fontsource/syne/400.css";
import "@fontsource/syne/500.css";
import "@fontsource/syne/600.css";
import "@fontsource/syne/700.css";
import "./portfolioPages.css";

gsap.registerPlugin(ScrollTrigger);

type PortfolioAsset = {
  packagePath: string;
  alt?: string;
  width?: number;
  height?: number;
};

type PortfolioBackground = {
  color?: string;
  gradient?: string;
  asset?: string;
  position?: string;
  radius?: string;
  scope?: string;
};

type PortfolioColumn = {
  title?: string;
  body?: string;
  asset?: string;
};

type PortfolioSection = {
  id: string;
  type: string;
  layout?: "contained" | "wide";
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  body?: string;
  caption?: string;
  captionUrl?: string;
  media?: string;
  asset?: string;
  avatar?: string;
  quote?: string;
  textColor?: string;
  headingGradient?: string;
  background?: PortfolioBackground;
  paddingTop?: string;
  paddingBottom?: string;
  columns?: number | PortfolioColumn[];
  metadata?: Array<{ label: string; value: string }>;
  items?: Array<{
    asset?: string;
    icon?: string;
    caption?: string;
    text?: string;
    value?: string;
    label?: string;
    url?: string;
  } | string>;
  person?: { name: string; role: string; url?: string };
  showLinkedin?: boolean;
  annotationText?: string;
  back?: { label: string; url: string };
};

export type PortfolioProject = {
  project: { title: string; slug: string };
  assets: Record<string, PortfolioAsset>;
  sections: PortfolioSection[];
};

const projects = portfolioManifest.projects as PortfolioProject[];

const projectAccents: Record<string, { accent: string; surface: string }> = {
  cloudchipr: { accent: "#5635ef", surface: "#ebe7ff" },
  "material-exchange": { accent: "#325d45", surface: "#eaf4ed" },
  securion: { accent: "#6658ff", surface: "#eae8ff" },
  "material-exchange-photo-lab": { accent: "#157a63", surface: "#e6f8f1" },
  "hotel-apartments": { accent: "#795d46", surface: "#f1e9e2" }
};

function isStorybook() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.includes("iframe.html") || window.location.search.includes("path=/story/");
}

function projectHref(slug: string) {
  return isStorybook()
    ? `/?path=/story/mvp-pages--project-${slug}`
    : `/am/projects/${slug}`;
}

function portfolioHref() {
  return isStorybook() ? "/?path=/story/mvp-pages--designer" : "/am/designer";
}

function projectSlugFromLegacyUrl(url = "") {
  return url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/|\/$/g, "");
}

function assetUrl(project: PortfolioProject, key?: string) {
  if (!key) return "";
  const source = project.assets[key];
  if (!source?.packagePath) return "";
  return `/${source.packagePath.replace(/^assets\//, "portfolio-assets/")}`;
}

function assetAlt(project: PortfolioProject, key?: string) {
  if (!key) return "";
  return project.assets[key]?.alt || `${project.project.title} project visual`;
}

function placeholderImage(label: string) {
  const safeLabel = label.replace(/[&<>"']/g, " ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#f2f2f0"/><text x="600" y="360" dominant-baseline="middle" text-anchor="middle" fill="#767670" font-family="Arial,sans-serif" font-size="34">${safeLabel}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function sectionStyle(project: PortfolioProject, section: PortfolioSection): CSSProperties {
  const backgroundAsset = section.background?.asset;
  return {
    color: section.textColor,
    backgroundColor: section.background?.color,
    backgroundImage: section.background?.gradient || (backgroundAsset ? `url(${assetUrl(project, backgroundAsset)})` : undefined),
    backgroundPosition: section.background?.position,
    backgroundSize: backgroundAsset ? "cover" : undefined,
    paddingTop: section.paddingTop,
    paddingBottom: section.paddingBottom
  };
}

function Html({ html, className = "" }: { html?: string; className?: string }) {
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function ProjectImage({
  project,
  assetKey,
  eager = false
}: {
  project: PortfolioProject;
  assetKey?: string;
  eager?: boolean;
}) {
  if (!assetKey || !project.assets[assetKey]) return null;
  const source = project.assets[assetKey];
  return (
    <img
      src={assetUrl(project, assetKey)}
      alt={assetAlt(project, assetKey)}
      width={source.width}
      height={source.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={(event) => {
        const image = event.currentTarget;
        image.onerror = null;
        image.src = placeholderImage(assetAlt(project, assetKey));
      }}
    />
  );
}

function ProjectTitle({ title }: { title?: string }) {
  if (!title) return null;
  const yearMatch = title.match(/^(.*)\s(20\d{2})$/);
  if (!yearMatch) return <>{title}</>;
  return <>{yearMatch[1]} <span className="dw-case-title-year">{yearMatch[2]}</span></>;
}

function sectionClass(section: PortfolioSection, extra = "") {
  return [
    "dw-case-section",
    `dw-case-${section.layout || (section.type === "prose" ? "contained" : "wide")}`,
    `dw-case-type-${section.type}`,
    `dw-case-section-${section.id}`,
    extra
  ].filter(Boolean).join(" ");
}

function SectionHeading({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  if (!section.title) return null;
  if (project.project.slug === "material-exchange-photo-lab" && section.id === "problem-intro") {
    const lead = "Why Are Some Materials Overlooked by Brands?";
    const rest = section.title.slice(lead.length).trim();
    return <><span className="dw-case-heading-accent">{lead} </span><span>{rest}</span></>;
  }
  if (project.project.slug === "cloudchipr" && section.id === "product-direction-one") {
    return <>Automatically optimize cloud costs using <span className="dw-cloudchipr-title-accent">FinOps best practices</span></>;
  }
  if (project.project.slug === "cloudchipr" && section.id === "product-direction-two") {
    return <>Remove Friction around costs between <span className="dw-cloudchipr-title-accent">Engineering and Finance</span></>;
  }
  return <>{section.title}</>;
}

const cloudchiprCollaborators: Record<string, string> = {
  "Bella Hayrapetyan": "/portfolio-assets/cloudchipr/collaborators/bella-hayrapetyan.png",
  "Habet Ayvazyan": "/portfolio-assets/cloudchipr/collaborators/habet-ayvazyan.png",
  "Zhanna Voskanyan": "/portfolio-assets/cloudchipr/collaborators/zhanna-voskanyan.png"
};

function IntroSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const style = sectionStyle(project, section);
  const isCloudChipr = project.project.slug === "cloudchipr";
  const isSecurion = project.project.slug === "securion";
  const isPhotoLab = project.project.slug === "material-exchange-photo-lab";
  if (section.background?.radius) style.borderRadius = section.background.radius;

  return (
    <section className="dw-case-intro dw-case-wide" id={section.id} data-portfolio-reveal>
      <div className="dw-case-intro-surface" style={style}>
        <div className="dw-case-intro-heading">
          <p>Selected case study</p>
          <h1><ProjectTitle title={section.title} /></h1>
          <h2>{section.subtitle}</h2>
        </div>
        <dl className="dw-case-meta">
          {section.metadata?.map((item) => (
            <div className={`dw-case-meta-${item.label.replace(/:$/, "").toLowerCase().replace(/[^a-z]+/g, "-")}`} key={item.label}>
              <dt>{item.label.replace(/:$/, "")}</dt>
              {isSecurion && item.label.startsWith("Tools") ? (
                <dd className="dw-case-tool-icons dw-securion-tool-icons" aria-label="Figma, Sketch, Photoshop, and Illustrator">
                  <img src="/portfolio-assets/securion/tools.png" alt="Figma, Sketch, Photoshop, and Illustrator" />
                </dd>
              ) : isPhotoLab && item.label.startsWith("Tools") ? (
                <dd className="dw-case-tool-icons dw-photo-lab-tool-icons" aria-label="Figma, Sketch, Microsoft Teams, and Jira">
                  {['Figma','Sketch','Teams','Jira'].map((tool) => <span className="dw-photo-lab-tool" key={tool}>{tool}</span>)}
                </dd>
              ) : isCloudChipr && item.label.startsWith("Tools") ? (
                <dd className="dw-case-tool-icons" aria-label="Figma, Notion, and Slack">
                  <img src="/portfolio-assets/cloudchipr/tools/figma.svg" alt="Figma" />
                  <img src="/portfolio-assets/cloudchipr/tools/notion.svg" alt="Notion" />
                  <img src="/portfolio-assets/cloudchipr/tools/slack.svg" alt="Slack" />
                </dd>
              ) : isCloudChipr && item.label.startsWith("Co-Designers") ? (
                <dd className="dw-case-collaborators">
                  {item.value.split(",").map((name) => {
                    const collaborator = name.trim();
                    return (
                      <span key={collaborator}>
                        <img src={cloudchiprCollaborators[collaborator]} alt="" />
                        {collaborator}
                      </span>
                    );
                  })}
                </dd>
              ) : (
                <dd dangerouslySetInnerHTML={{ __html: item.value }} />
              )}
            </div>
          ))}
        </dl>
        {isSecurion ? (
          <div className="dw-securion-tools" aria-label="Tools used: Sketch, Confluence, Slack, and Asana">
            <span>Used tools</span>
            <img src="/portfolio-assets/securion/tools.png" alt="Sketch, Confluence, Slack, and Asana" />
          </div>
        ) : null}
        <div className="dw-case-intro-media" data-portfolio-parallax>
          <ProjectImage project={project} assetKey={section.media} eager />
          {isSecurion ? (
            <img
              className="dw-securion-hero-logo"
              src="/portfolio-assets/securion/logo-mark.svg"
              alt="Securion shield logo"
              width="460"
              height="460"
            />
          ) : null}
        </div>
        {isCloudChipr ? <span className="dw-case-project-rail" aria-hidden="true">Projects</span> : null}
      </div>
    </section>
  );
}

function HotelMark({ label = true }: { label?: boolean }) {
  return (
    <span className="dw-hotel-mark-lockup" aria-label={label ? "Hotel Apartments" : undefined} aria-hidden={!label}>
      <span className="dw-hotel-mark" aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      {label ? <span><small>Hotel</small><strong>Apartments</strong></span> : null}
    </span>
  );
}

function HotelIntro({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-hotel-intro" id={section.id} data-hotel-intro>
      <div className="dw-hotel-intro-heading" data-portfolio-reveal>
        <div>
          <p>Selected case study / Hospitality</p>
          <h1>{section.title}</h1>
        </div>
        <p className="dw-hotel-intro-subtitle">{section.subtitle}</p>
      </div>
      <div className="dw-hotel-intro-visual" data-portfolio-parallax>
        <ProjectImage project={project} assetKey={section.media} eager />
      </div>
    </section>
  );
}

function HotelProject({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const intro = project.sections.find((item) => item.type === "intro");
  const metadata = intro?.metadata || [];
  return (
    <section
      className="dw-case-section dw-hotel-project"
      id={section.id}
      style={{ "--hotel-project-image": `url(${assetUrl(project, "hero")})` } as CSSProperties}
    >
      <div className="dw-hotel-project-inner" data-portfolio-reveal>
        <header>
          <p>Hotel Apartments / Smart Stay technologies</p>
          <h2>The Project</h2>
        </header>
        <Html html={section.body} className="dw-hotel-project-copy" />
        <dl className="dw-hotel-project-meta">
          {metadata.map((item) => (
            <div key={item.label}>
              <dt>{item.label.replace(/:$/, "")}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function HotelMigration({ section }: { section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-hotel-migration" id={section.id}>
      <div className="dw-hotel-reading" data-portfolio-reveal>
        <p>
          Since the start of the <strong>Russian-Ukrainian War in February 2022</strong>, there has been a
          significant increase in the number of <strong>Russians moving to Dubai.</strong>
        </p>
        <h2>
          According to official statistics, the number of Russian citizens living in Dubai increased by
          <u>170% between February and June 2022.</u>
        </h2>
        <div className="dw-hotel-migration-columns">
          <div>
            <p>A number of companies have opened <strong>offices in Dubai</strong> and financed their employees&apos;
              relocation along with their families including:</p>
            <ul><li>Visa</li><li>Alphabet Inc&apos;s Google</li><li>Talnet, matching Eastern European tech workers with startups worldwide</li></ul>
          </div>
          <p>
            Hotel apartments offer a flexible, convenient, and comfortable living arrangement during relocation.
            Furnished spaces, on-site amenities, and tailored services ease the transition and create a sense of
            community in an unfamiliar environment.
          </p>
        </div>
      </div>
    </section>
  );
}

function HotelMigrationVisual({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-hotel-captioned-media" id={section.id}>
      <figure data-portfolio-reveal>
        <span className="dw-hotel-captioned-image"><ProjectImage project={project} assetKey={section.asset} /></span>
        <figcaption>Sobha&apos;s sales center planned development model. One of the largest hotel apartments in UAE.</figcaption>
      </figure>
    </section>
  );
}

function HotelWalking({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section
      className="dw-case-section dw-hotel-walking"
      id={section.id}
      style={{ "--hotel-walking-image": `url(${assetUrl(project, "walking-users-shoes")})` } as CSSProperties}
    >
      <div data-portfolio-reveal>
        <p>Customer experience / observed in context</p>
        <p className="dw-securion-laws-eyebrow">Logo principles</p>
        <h2>Simple Laws</h2>
        <Html html={section.body} className="dw-hotel-walking-copy" />
      </div>
    </section>
  );
}

const hotelColors = [
  { name: "Olive", hex: "#767760", rgb: "118 119 96" },
  { name: "Slate", hex: "#585D6E", rgb: "88 93 110" },
  { name: "Sand", hex: "#C6BA9B", rgb: "198 186 155" },
  { name: "Linen", hex: "#EAEADE", rgb: "234 234 222" },
  { name: "Gold", hex: "#E6BC73", rgb: "230 188 115" }
];

function HotelBrand({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-hotel-brand" id={section.id} data-hotel-brand>
      <div className="dw-hotel-brand-stage" style={{ "--hotel-brand-texture": `url(${assetUrl(project, "walking-users-shoes")})` } as CSSProperties}>
        <header data-portfolio-reveal>
          <p>Identity / hospitality</p>
          <h2>{section.title}</h2>
          <Html html={section.body} className="dw-hotel-brand-intro" />
        </header>
        <div className="dw-hotel-brand-construction" data-portfolio-reveal>
          <HotelMark label={false} />
          <span className="dw-hotel-brand-axis axis-one">Luxury villa windows</span>
          <span className="dw-hotel-brand-axis axis-two">Letter H</span>
          <span className="dw-hotel-brand-axis axis-three">Letter A</span>
          <blockquote>“This one is really good. What do you think?”<small>Rafayel Papikyan / client feedback</small></blockquote>
        </div>
        <div className="dw-hotel-preference" data-portfolio-reveal>
          <h3>Client&apos;s preference</h3>
          <div>
            <span><HotelMark label={false} /></span>
            <span className="is-selected"><HotelMark label={false} /></span>
            <span><HotelMark label={false} /></span>
          </div>
        </div>
      </div>

      <div className="dw-hotel-brand-applications">
        <figure className="dw-hotel-brand-table" data-portfolio-reveal><ProjectImage project={project} assetKey="brand-detail-01" /></figure>
        <p data-portfolio-reveal>Once the concept was chosen, I built a clean, minimal identity for the practical details guests touch: business cards, labels, door hangers, menus and room amenities.</p>
        <figure className="dw-hotel-brand-suite" data-portfolio-parallax><ProjectImage project={project} assetKey="brand-applications" /></figure>
        <p data-portfolio-reveal>The olive, linen and warm sand palette gives the service a quieter, more residential character than a conventional booking platform.</p>
        <figure className="dw-hotel-brand-linen" data-portfolio-reveal><ProjectImage project={project} assetKey="brand-detail-02" /></figure>
        <figure className="dw-hotel-brand-collage" data-portfolio-reveal><ProjectImage project={project} assetKey="brand-collage" /></figure>
      </div>
    </section>
  );
}

function HotelWebDesign({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-hotel-web" id={section.id} data-hotel-web>
      <div className="dw-hotel-web-inner">
        <header data-portfolio-reveal><p>Product expression</p><h2>{section.title}</h2></header>
        <figure className="dw-hotel-web-hero" data-portfolio-parallax>
          <ProjectImage project={project} assetKey="hero" />
        </figure>
        <figure className="dw-hotel-web-browser" data-portfolio-reveal>
          <ProjectImage project={project} assetKey="web-overview" />
        </figure>

        <div className="dw-hotel-system" data-portfolio-reveal>
          <div className="dw-hotel-system-colors">
            <h3>Color</h3>
            {hotelColors.map((color) => (
              <article key={color.hex} style={{ "--hotel-swatch": color.hex } as CSSProperties}>
                <strong>{color.name}</strong><span>{color.hex}</span><small>RGB {color.rgb}</small>
              </article>
            ))}
          </div>
          <div className="dw-hotel-system-type">
            <h3>Logo &amp; typography</h3>
            <HotelMark />
            <div><span>Hotel</span><strong>Poppins Light</strong><b>Ag</b></div>
            <div><span>Apartments</span><strong>Poppins Semibold</strong><b>Ag</b></div>
            <hr />
            <p className="type-h1">A clever way to live in hotels</p>
            <p className="type-h2">Extended stays, made simple.</p>
            <p className="type-body">A flexible booking experience for serviced apartments and villas.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HotelFeedback({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-hotel-feedback" id={section.id} data-hotel-feedback>
      <div className="dw-hotel-feedback-inner" data-portfolio-reveal>
        <p>Client perspective</p>
        <h2>{section.title || "Feedback"}</h2>
        <blockquote>“{section.quote}”</blockquote>
        <div className="dw-hotel-feedback-person">
          <span><ProjectImage project={project} assetKey={section.avatar} /></span>
          <div><strong>{section.person?.name}</strong><small>{section.person?.role}</small></div>
          <b aria-hidden="true">in</b>
        </div>
      </div>
    </section>
  );
}

function SecurionConstructionMark() {
  return (
    <div className="dw-securion-construction-mark" role="img" aria-label="Securion logo construction">
      <span className="dw-securion-mark-dashed" aria-hidden="true" />
      <span className="dw-securion-mark-ring" aria-hidden="true" />
      <img src="/portfolio-assets/securion/logo-mark.svg" alt="" />
    </div>
  );
}

function SecurionBrandIdentity({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-securion-brand" id={section.id} data-securion-brand>
      <div className="dw-securion-brand-copy">
        <h2>{section.title}</h2>
        <p>
          Securion&apos;s brand essence revolves around <mark>trust</mark>, <mark>security</mark>, and
          <mark> innovation</mark>. It represents the unwavering <mark>commitment</mark> to safeguarding
          users&apos; <mark>digital assets</mark> while delivering an innovative and <mark>user-centric</mark>
          <mark> crypto</mark> experience.
        </p>
      </div>

      <div className="dw-securion-construction" data-portfolio-reveal>
        <ProjectImage project={project} assetKey="logo-construction" />
        <SecurionConstructionMark />
        <div className="dw-securion-construction-notes">
          <article>
            <Shield aria-hidden="true" strokeWidth={1.7} />
            <strong>shield</strong>
            <p>For Security, Protection, Safety, Defense, Trust, Strength, Resilience, Guardianship, Safeguarding, Fortification</p>
          </article>
          <article>
            <span className="dw-securion-letter" aria-hidden="true">S</span>
            <strong>letter “S”</strong>
            <p>The First Letter of the brand name.<br /><span className="dw-securion-note-bright">Securion = Turn the Security on</span></p>
          </article>
          <article>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="10" r="2.4" fill="currentColor" stroke="none" />
              <path d="M10.9 11.8 10 16h4l-0.9-4.2" fill="currentColor" stroke="none" />
            </svg>
            <strong>keyhole</strong>
            <p>For Access, Secrecy, Mystery, Security, Opportunity, Lock, Entrance, Privacy, Hidden, Revealing</p>
          </article>
        </div>
      </div>
    </section>
  );
}

function SecurionLogoLaws({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-securion-laws" id={section.id} data-securion-laws>
      <div className="dw-securion-laws-inner">
        <h2>{section.title}</h2>

        <ol className="dw-securion-laws-list dw-securion-laws-list-top" start={1}>
          <li>
            <strong>Simplicity:</strong> Logo is characterized by its simplicity, ensuring it is easily{" "}
            <b>recognizable and memorable</b>. Its straightforward design maintains clarity, even{" "}
            <b>when scaled to different sizes</b>.
          </li>
          <li>
            <strong>Memorability:</strong> It is inherently memorable, leaving a lasting impression on viewers.
          </li>
        </ol>

        <div className="dw-securion-logo-landscape" aria-label="Securion among familiar digital product logos">
          <img src="/portfolio-assets/securion/logo-laws-reference.png" alt="Logo comparison landscape" />
        </div>

        <ol className="dw-securion-laws-list dw-securion-laws-list-bottom" start={3}>
          <li>
            <strong>Relevance:</strong> Logo is deeply relevant to the brand&apos;s identity. It reflects Securion&apos;s{" "}
            <b>unwavering commitment to security, innovation, and user-friendliness</b>. The Logo was made in 2018,
            but it still looks up to date comparing with other logos.
          </li>
          <li>
            <strong>Distinctiveness:</strong> It stands out with unique features, shapes, or elements that
            differentiate it from competitors or other logos in its category.
          </li>
        </ol>
      </div>
    </section>
  );
}

function SecurionScaleStrip({ section }: { section: PortfolioSection }) {
  const sizes = [140, 100, 60, 30];
  return (
    <section className="dw-case-section dw-securion-scale" id={section.id}>
      <div className="dw-securion-scale-inner">
        <p className="dw-securion-scale-law-text">
          <span>5.</span> Also, the logo is indeed <strong>highly scalable,</strong> maintaining its clarity
          and recognizability across a <strong>wide range of sizes,</strong> from the smallest icons to
          larger banners.
        </p>
        <div className="dw-securion-scale-marks" aria-label="Securion logo shown at 140, 100, 60 and 30 pixel sizes">
          {sizes.map((size) => (
            <figure key={size}>
              <img src="/portfolio-assets/securion/logo-mark.svg" alt="" style={{ width: size, height: size }} />
              <figcaption>{size}px</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const securionBrandColors = [
  { token: "‘.sc-primary’", hex: "#4245F6", rgb: "66, 69, 246", hsb: "239, 73, 96" },
  { token: "‘.sc-secondary’", hex: "#002FBF", rgb: "0, 47, 191", hsb: "225, 100, 75" },
  { token: "‘.sc-success’", hex: "#70C973", rgb: "112, 201, 115", hsb: "122, 44, 79" },
  { token: "‘.sc-danger’", hex: "#DA471A", rgb: "218, 71, 26", hsb: "14, 88, 85" },
  { token: "‘.sc-warning’", hex: "#DABA69", rgb: "218, 186, 105", hsb: "43, 52, 85" }
];

const securionTextColors = [
  { token: "‘.sc-text-lighter’", hex: "#F4F6F6" },
  { token: "‘.sc-text-light’", hex: "#D3D3D3" },
  { token: "‘.sc-text-disabled’", hex: "#A3A3A3" },
  { token: "‘.sc-text-darker’", hex: "#3E4A59" },
  { token: "‘.sc-text-dark’", hex: "#000000" }
];

const securionBackgroundColors = [
  { token: "‘.sc-bg-lighter’", hex: "#F4F6F6" },
  { token: "‘.sc-bg-light’", hex: "#F0F1F1" },
  { token: "‘.sc-bg-card’", hex: "#E1E2E2" },
  { token: "‘.sc-bg-darker’", hex: "#9EA0A0" },
  { token: "‘.sc-bg-dark’", hex: "#3E4A59" }
];

function SecurionColorTheory({ section }: { section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-securion-colors" id={section.id} data-securion-colors>
      <div className="dw-securion-colors-inner">
        <header>
          <p>Identity system / coded tokens</p>
          <h2>{section.title}</h2>
        </header>

        <div className="dw-securion-palette-group dw-securion-palette-brand">
          <h3>Brand colors</h3>
          <div>
            {securionBrandColors.map((color) => (
              <article
                key={color.token}
                style={{ "--swatch": color.hex } as CSSProperties}
                className={color.hex === "#70C973" || color.hex === "#DABA69" ? "is-dark-copy" : ""}
              >
                <strong>{color.token}</strong>
                <span>Hex: {color.hex}</span>
                <span>RGB: {color.rgb}</span>
                <span>HSB: {color.hsb}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="dw-securion-palette-group dw-securion-palette-compact">
          <h3>Texts</h3>
          <div>
            {securionTextColors.map((color) => (
              <article
                key={color.token}
                style={{ "--swatch": color.hex } as CSSProperties}
                className={color.hex === "#3E4A59" || color.hex === "#000000" ? "is-light-copy" : ""}
              >
                <strong>{color.token}</strong>
                <span>Hex: {color.hex}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="dw-securion-palette-group dw-securion-palette-compact">
          <h3>Backgrounds</h3>
          <div>
            {securionBackgroundColors.map((color) => (
              <article
                key={color.token}
                style={{ "--swatch": color.hex } as CSSProperties}
                className={color.hex === "#3E4A59" ? "is-light-copy" : ""}
              >
                <strong>{color.token}</strong>
                <span>Hex: {color.hex}</span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const materialCollaborators = [
  { name: "Ani Atanesyan", href: "https://am.linkedin.com/in/ani-atanesyan-ux", avatar: "ani" },
  { name: "Vladimir Popov", href: "https://rs.linkedin.com/in/vladimir-popov-40635388", avatar: "vladimir" },
  { name: "Gohar Aleksanyan", href: "https://www.linkedin.com/search/results/people/?keywords=Gohar%20Aleksanyan", avatar: "gohar" }
];

function MaterialExchangeIntro({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const metadata = section.metadata?.filter((item) => !item.label.startsWith("Tools") && !item.label.startsWith("Co-Designers"));
  const about = project.sections.find((item) => item.id === "about");
  return (
    <section className="dw-mex-opening" id={section.id} data-mex-intro>
      <div className="dw-mex-intro">
        <div className="dw-mex-intro-panel">
        <header data-portfolio-reveal>
          <p>Selected case study / Digital materials</p>
          <h1>{section.title}</h1>
          <h2>{section.subtitle}</h2>
        </header>
        <dl className="dw-mex-meta" data-portfolio-reveal>
          {metadata?.map((item) => (
            <div key={item.label}><dt>{item.label.replace(/:$/, "")}</dt><dd dangerouslySetInnerHTML={{ __html: item.value }} /></div>
          ))}
          <div className="dw-mex-meta-tools">
            <dt>Tools</dt>
            <dd><img src="/portfolio-assets/material-exchange/tools.png" alt="Figma, Confluence, and Overflow" /></dd>
          </div>
          <div className="dw-mex-meta-collaborators">
            <dt>Co-Designers</dt>
            <dd>
              {materialCollaborators.map((person) => (
                <a href={person.href} target="_blank" rel="noreferrer" key={person.name}>
                  <i className={`dw-mex-avatar avatar-${person.avatar}`} aria-hidden="true" />
                  {person.name}
                </a>
              ))}
            </dd>
          </div>
        </dl>
        <div className="dw-mex-hero-product" data-portfolio-parallax>
          <ProjectImage project={project} assetKey={section.media} eager />
        </div>
        </div>
      </div>
      <div className="dw-mex-about" id="about" data-portfolio-reveal>
        <h2>{about?.title}</h2>
        <Html html={about?.body} />
      </div>
      <figure className="dw-mex-initial-wireframes" id="initial-wireframes" data-portfolio-reveal>
        <ProjectImage project={project} assetKey="initial-wireframes" />
        <figcaption>Initial wireframes of single material page.</figcaption>
      </figure>
    </section>
  );
}

function MaterialExchangeDiscovery({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-mex-discovery" id={section.id} data-mex-discovery>
      <div className="dw-mex-reading" data-portfolio-reveal>
        <h2>{section.title}</h2>
        <h3>{section.eyebrow}</h3>
        <p>
          Imagine Nike&apos;s material manager journeying to Vietnam, seeking sustainable materials to be used as a
          small piece for Air Jordans. Collaborating with local suppliers, they assess quality, recycling, and
          sustainability, incurring costs of <strong>$15,000 for travel and $10,000 for testing</strong>. This risk
          underscores Nike&apos;s commitment to responsible sourcing, with only 15% of findings proving useful.
        </p>
        <p>
          Companies like Nike spend millions on such research, but just a fraction proves valuable. So,
          <strong> material digitalization is needed for cost savings</strong>. The potential to revolutionize
          sourcing and sustainability drives ongoing innovation.
        </p>
      </div>
      <figure className="dw-mex-discovery-media" data-portfolio-parallax>
        <ProjectImage project={project} assetKey="warehouse" />
        <figcaption>A tour of the Goodwill Outlet warehouse and retail store in St. Paul, Minnesota.</figcaption>
      </figure>
    </section>
  );
}

function MaterialExchangeProblemTwo({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-mex-problem-two" id={section.id}>
      <div className="dw-mex-problem-two-copy" data-portfolio-reveal>
        <span>{section.eyebrow}</span>
        <p>Fashion is responsible for <strong>10% of human-caused greenhouse gas emissions</strong> and <strong>20% of global wastewater</strong>,</p>
        <p>and uses more energy than the aviation and shipping sectors combined.</p>
        <p>Global fashion also consumes <strong>93 billion metric tons of clean water each year</strong>, about half of what Americans drink annually.</p>
        <ul>
          <li><strong>Since the 2000s, fashion production has doubled and it will likely triple by 2050</strong>, according to the American Chemical Society.</li>
          <li><strong>92 million tonnes</strong> of unwanted fabrics are disposed of each year.</li>
          <li><strong>14.5 million tons</strong> of textiles were landfilled and incinerated in 2018.</li>
        </ul>
        <p>Leftover fabrics have already been produced, so there is no expenditure of water, energy, or virgin raw materials to create something new. With Material Exchange, <strong>they become globally available for brands to use in upcoming collections.</strong></p>
      </div>
      <figure data-portfolio-parallax>
        <ProjectImage project={project} assetKey="deadstock" />
        <figcaption>Deadstock Depot makes surplus fabrics available to purchase instead of discard.</figcaption>
      </figure>
    </section>
  );
}

function MaterialExchangeResearch({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-mex-research" id={section.id}>
      <header className="dw-mex-reading" data-portfolio-reveal>
        <h2>{section.title}</h2>
        <Html html={section.body} />
      </header>
      <figure className="dw-mex-research-stats" data-portfolio-reveal>
        <div className="dw-mex-research-chart-frame"><ProjectImage project={project} assetKey="user-research" /></div>
        <figcaption>Quantitative user research analytic report.</figcaption>
      </figure>
      <div className="dw-mex-research-columns">
        <article data-portfolio-reveal>
          <span>01</span>
          <h3>Iterative research</h3>
          <p>We made it a practice to conduct user interviews and testing sessions at least twice a month. This involved both new users and people we stayed connected with over time. Custom recruitment proved more useful than panel platforms, whose participants often introduced strong bias.</p>
        </article>
        <article data-portfolio-reveal>
          <span>02</span>
          <h3>Personas that evolved</h3>
          <p>Company strategy, interviews, quantitative surveys, and competitive analysis shaped our first hypothetical personas. They remained working hypotheses and evolved as new user archetypes appeared.</p>
        </article>
      </div>
      <div className="dw-mex-platform-users" data-portfolio-reveal>
        <div><h2>Platform users</h2><p>Combining insights from various sources—company strategy, user research, quantitative surveys, and competitive analyses—we crafted our initial hypothetical personas. This marked the beginning of our ongoing process to discover new user archetypes throughout the journey.</p></div>
        <figure>
          <img
            className="dw-mex-platform-role-legend"
            src="/portfolio-assets/material-exchange/platform-user-roles.png"
            alt="Platform roles: hosts, suppliers, customers, pavilion sponsors, certifying authorities, verification and service providers, Material Exchange staff, and anonymous users"
          />
          <ProjectImage project={project} assetKey="platform-users" />
        </figure>
      </div>
    </section>
  );
}

function MaterialExchangeNavigation({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-mex-navigation" id={section.id}>
      <div className="dw-mex-navigation-copy" data-portfolio-reveal>
        <p>Information architecture</p><h2>{section.title}</h2>
        <p>A shared navigation model had to support very different professional roles without fragmenting the product.</p>
      </div>
      <figure data-portfolio-parallax><ProjectImage project={project} assetKey="navigation-anatomy" /></figure>
    </section>
  );
}

function MaterialExchangeCursor({ className, name }: { className: string; name: string }) {
  return (
    <span className={`dw-mex-cursor ${className}`}>
      <svg className="dw-mex-cursor-pointer" viewBox="0 0 18 22" aria-hidden="true">
        <path className="dw-mex-cursor-pointer-fill" d="M14.04 9.67 1.03 1.52 3.86 17.24 7.25 11.42 14.04 9.67Z" />
        <path className="dw-mex-cursor-pointer-outline" d="M1.42.89 14.43 9.04 15.9 9.96 14.22 10.39 7.74 12.06 4.5 17.62 3.48 19.36 3.13 17.37.3 1.65 0 0 1.42.89Z" />
      </svg>
      <span className="dw-mex-cursor-name">{name}</span>
    </span>
  );
}

function MaterialExchangeVisualLanguage({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-mex-visual-language" id={section.id} data-mex-visual-language>
      <div className="dw-mex-visual-heading" data-portfolio-reveal>
        <MaterialExchangeCursor className="cursor-davit" name="Davit" />
        <MaterialExchangeCursor className="cursor-ani" name="Ani" />
        <MaterialExchangeCursor className="cursor-gohar" name="Gohar" />
        <MaterialExchangeCursor className="cursor-vlad" name="Vlad" />
        <h2>{section.title}</h2>
        <Html html={section.body} />
      </div>
      <div className="dw-mex-component-stage" data-portfolio-reveal>
        <ProjectImage project={project} assetKey="visual-language" />
      </div>
    </section>
  );
}

function MaterialExchangeIconography({ section }: { project: PortfolioProject; section: PortfolioSection }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const notifyFrame = (command: "play" | "stop") => {
      frame.contentWindow?.postMessage(`iconography:${command}`, window.location.origin);
    };

    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      if (isVisible === isVisibleRef.current) return;
      isVisibleRef.current = isVisible;
      notifyFrame(isVisible ? "play" : "stop");
    }, { threshold: [0, 0.2, 0.5] });

    const handleLoad = () => {
      if (isVisibleRef.current) notifyFrame("play");
    };

    frame.addEventListener("load", handleLoad);
    observer.observe(frame);
    return () => {
      observer.disconnect();
      frame.removeEventListener("load", handleLoad);
      notifyFrame("stop");
    };
  }, []);

  return (
    <section className="dw-mex-iconography" id={section.id} data-mex-iconography>
      <div className="dw-mex-reading" data-portfolio-reveal>
        <p>Specific component style selection</p>
        <h2>{section.title}</h2>
        <Html html={section.body} />
      </div>
      <div className="dw-mex-icon-stage" data-portfolio-reveal>
        <iframe
          ref={frameRef}
          src="/portfolio-assets/material-exchange/iconography-animated.html"
          title="Animated Material Exchange iconography system"
          loading="lazy"
        />
      </div>
    </section>
  );
}

function MaterialExchangeDesignSystem({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const notifyFrame = (command: "play" | "stop") => {
      frame.contentWindow?.postMessage(`matex:${command}`, window.location.origin);
    };

    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      if (isVisible === isVisibleRef.current) return;
      isVisibleRef.current = isVisible;
      notifyFrame(isVisible ? "play" : "stop");
    }, { threshold: [0, 0.2, 0.5] });

    const handleLoad = () => {
      if (isVisibleRef.current) notifyFrame("play");
    };

    frame.addEventListener("load", handleLoad);
    observer.observe(frame);
    return () => {
      observer.disconnect();
      frame.removeEventListener("load", handleLoad);
      notifyFrame("stop");
    };
  }, []);

  return (
    <section className="dw-mex-system" id={section.id} data-mex-system>
      <header data-portfolio-reveal>
        <Html html={section.body} />
      </header>
      <figure className="dw-mex-system-map dw-mex-system-map-animated" data-portfolio-reveal>
        <iframe
          ref={frameRef}
          src="/portfolio-assets/material-exchange/matex-architecture-animated.html"
          title="Animated MAT-EX design system architecture"
          loading="lazy"
        />
      </figure>
      <figure className="dw-mex-system-showcase" data-portfolio-reveal><ProjectImage project={project} assetKey="design-system-showcase" /></figure>
    </section>
  );
}

function MaterialExchangeIdeation({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const matrix = project.sections.find((item) => item.id === "ideation-matrix");
  const statements = project.sections.find((item) => item.id === "hmw-statements");
  const columns = project.sections.find((item) => item.id === "hmw-columns");
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const notifyFrame = (command: "play" | "stop") => {
      frame.contentWindow?.postMessage(`value-satisfaction:${command}`, window.location.origin);
    };

    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
      if (isVisible === isVisibleRef.current) return;
      isVisibleRef.current = isVisible;
      notifyFrame(isVisible ? "play" : "stop");
    }, { threshold: [0, 0.2, 0.5] });

    const handleLoad = () => {
      if (isVisibleRef.current) notifyFrame("play");
    };

    frame.addEventListener("load", handleLoad);
    observer.observe(frame);
    return () => {
      observer.disconnect();
      frame.removeEventListener("load", handleLoad);
      notifyFrame("stop");
    };
  }, []);

  return (
    <section className="dw-mex-ideation" id={section.id}>
      <header className="dw-mex-reading" data-portfolio-reveal><h2>{section.title}</h2><Html html={section.body} /></header>
      <figure className="dw-mex-value-satisfaction" data-portfolio-reveal>
        <iframe
          ref={frameRef}
          src="/portfolio-assets/material-exchange/value-satisfaction-animated.html"
          title="Interactive user value and satisfaction matrix discussion"
          loading="lazy"
        />
        <figcaption>{matrix?.caption}</figcaption>
      </figure>
      <div className="dw-mex-hmw" id="hmw-statements" data-portfolio-reveal>
        <h2>{statements?.title}</h2>
        <div>{Array.isArray(columns?.columns) ? columns.columns.map((column, index) => <Html html={column.body} key={index} />) : null}</div>
      </div>
    </section>
  );
}

function MaterialExchangePersonalized({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const dashboard = project.sections.find((item) => item.id === "personalized-dashboard");
  const search = project.sections.find((item) => item.id === "smart-search");
  const collage = project.sections.find((item) => item.id === "product-collage");
  const dashboardColumns = Array.isArray(dashboard?.columns) ? dashboard.columns : [];
  const searchColumns = Array.isArray(search?.columns) ? search.columns : [];
  return (
    <section className="dw-mex-personalized" id={section.id}>
      <h2 data-portfolio-reveal>{section.title}</h2>
      <div className="dw-mex-personalized-row dashboard" data-portfolio-reveal>
        <figure><ProjectImage project={project} assetKey={dashboardColumns[0]?.asset} /></figure>
        <article><h3>{dashboardColumns[1]?.title}</h3><Html html={dashboardColumns[1]?.body} /></article>
      </div>
      <div className="dw-mex-personalized-row search" data-portfolio-reveal>
        <article><h3>{searchColumns[0]?.title}</h3><Html html={searchColumns[0]?.body} /></article>
        <figure><ProjectImage project={project} assetKey={searchColumns[1]?.asset} /></figure>
      </div>
      <figure className="dw-mex-product-collage" data-portfolio-reveal><ProjectImage project={project} assetKey={collage?.asset} /></figure>
    </section>
  );
}

function MaterialExchangeTesting({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const get = (id: string) => project.sections.find((item) => item.id === id);
  const one = get("hypothesis-one");
  const oneSolution = get("dropzone-solution");
  const oneResult = get("dropzone-result");
  const two = get("hypothesis-two");
  const twoSolution = get("save-search-solution");
  return (
    <section className="dw-mex-testing" id={section.id}>
      <h2 data-portfolio-reveal>{section.title}</h2>
      <div className="dw-mex-test-copy hypothesis" data-portfolio-reveal>
        <header className="dw-mex-hypothesis-heading">
          <p className="eyebrow">{one?.eyebrow}</p>
          <h3>{one?.title}</h3>
        </header>
        <Html html={one?.body} className="dw-mex-hypothesis-body" />
      </div>
      <div className="dw-mex-test-copy solution" data-portfolio-reveal>
        <h4>{oneSolution?.eyebrow}</h4>
        <Html html={oneSolution?.body} />
      </div>
      <figure data-portfolio-reveal><ProjectImage project={project} assetKey="dropzone" /></figure>
      <div className="dw-mex-test-copy result" data-portfolio-reveal><Html html={oneResult?.body} className="dw-mex-hypothesis-body" /></div>
      <div className="dw-mex-test-two">
        <div className="dw-mex-test-copy hypothesis" data-portfolio-reveal>
          <header className="dw-mex-hypothesis-heading">
            <p className="eyebrow">{two?.eyebrow}</p>
            <Html html={two?.body} className="dw-mex-hypothesis-title" />
          </header>
        </div>
        <div className="dw-mex-test-copy solution" data-portfolio-reveal>
          <h4>{twoSolution?.eyebrow}</h4>
          <Html html={twoSolution?.body} />
        </div>
        <figure className="dw-mex-save-search-composition" data-portfolio-reveal data-mex-save-search>
          <img
            className="dw-mex-save-search-tablet"
            src="/portfolio-assets/material-exchange/save-search-tablet.png"
            alt="Material Exchange search results displayed on a tablet"
          />
          <img
            className="dw-mex-save-search-panel"
            src="/portfolio-assets/material-exchange/save-search-panel.png"
            alt="Saved Search criteria panel"
          />
          <img
            className="dw-mex-save-search-actions"
            src="/portfolio-assets/material-exchange/save-search-actions.png"
            alt="Save Smart Search and Delete actions"
          />
        </figure>
      </div>
    </section>
  );
}

function AboutCardSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className={sectionClass(section, "dw-case-about-card-section")} style={sectionStyle(project, section)} id={section.id}>
      <div className="dw-about-card" data-portfolio-reveal>
        <h2>{section.title}</h2>
        <div className="dw-about-card-grid">
          <div className="dw-about-card-overview">
            {section.eyebrow ? <p className="dw-about-card-eyebrow">{section.eyebrow}</p> : null}
            <Html html={section.body} className="dw-about-card-body" />
          </div>
          <dl className="dw-about-card-details">
            {section.metadata?.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function ProseSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const headingStyle: CSSProperties | undefined = section.headingGradient
    ? { backgroundImage: section.headingGradient }
    : undefined;
  const projectDetails = section.id === "project"
    ? project.sections.find((item) => item.type === "intro")?.metadata
    : undefined;
  return (
    <section className={sectionClass(section)} style={sectionStyle(project, section)} id={section.id}>
      <div className="dw-case-prose" data-portfolio-reveal>
        {section.eyebrow ? <p className="dw-case-eyebrow">{section.eyebrow}</p> : null}
        {section.title ? (
          <h2 className={section.headingGradient ? "has-gradient" : ""} style={headingStyle}>
            <SectionHeading project={project} section={section} />
          </h2>
        ) : null}
        <Html html={section.body} className="dw-case-richtext" />
        {projectDetails ? (
          <dl className="dw-case-project-details">
            {projectDetails.map((item) => (
              <div key={item.label}>
                <dt>{item.label.replace(/:$/, "")}</dt>
                <dd dangerouslySetInnerHTML={{ __html: item.value }} />
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

function CloudChiprLogoConstruction() {
  return (
    <div className="dw-cloudchipr-construction" data-cloudchipr-construction>
      <img
        src="/portfolio-assets/cloudchipr/logo-construction-reference.svg"
        alt="CloudChipr logo construction, glyph, wordmark, and strapline"
      />
    </div>
  );
}

function CloudChiprConceptSelection({
  project,
  section
}: {
  project: PortfolioProject;
  section: PortfolioSection;
}) {
  return (
    <section
      className="dw-case-section dw-cloudchipr-concepts"
      id={section.id}
      data-cloudchipr-concepts
    >
      <div className="dw-cloudchipr-concepts-inner">
        <header className="dw-cloudchipr-concepts-copy">
          <h2>{section.title}</h2>
          <Html html={section.body} className="dw-cloudchipr-concepts-intro" />
        </header>

        <div className="dw-cloudchipr-concepts-stage">
          <figure className="dw-cloudchipr-concept dw-cloudchipr-concept-favorite">
            <ProjectImage project={project} assetKey="concept-favorite" />
            <figcaption>My favorite.</figcaption>
            <img className="dw-cloudchipr-concept-arrow" src="/portfolio-assets/cloudchipr/concept-arrow.svg" alt="" aria-hidden="true" />
          </figure>

          <figure className="dw-cloudchipr-concept dw-cloudchipr-concept-selected">
            <ProjectImage project={project} assetKey="concept-selected" />
            <figcaption>Selected by client</figcaption>
            <img className="dw-cloudchipr-concept-arrow" src="/portfolio-assets/cloudchipr/concept-arrow.svg" alt="" aria-hidden="true" />
          </figure>
        </div>

        <figure className="dw-cloudchipr-rejected">
          <figcaption>Rejected variants:</figcaption>
          <ProjectImage project={project} assetKey="concept-rejected" />
        </figure>
      </div>
    </section>
  );
}

function CloudChiprBrandItems({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className="dw-case-section dw-cloudchipr-brand-items" id={section.id} data-cloudchipr-brand-items>
      <div className="dw-cloudchipr-brand-items-stage">
        <img className="dw-cloudchipr-brand-bottle" src="/portfolio-assets/cloudchipr/brand-bottle.png" alt="CloudChipr branded bottle" />
        <figure className="dw-cloudchipr-brand-layer dw-cloudchipr-brand-layer-badge">
          <ProjectImage project={project} assetKey="brand-badge" />
        </figure>
        <figure className="dw-cloudchipr-brand-layer dw-cloudchipr-brand-layer-details">
          <ProjectImage project={project} assetKey="brand-card-details" />
        </figure>
      </div>
    </section>
  );
}

function CloudChiprHowItStarted({ section }: { section: PortfolioSection }) {
  const steps = ["Field Study", "Competitor analysis", "User Research"];

  return (
    <section
      className="dw-case-section dw-cloudchipr-started"
      id={section.id}
      data-cloudchipr-started
    >
      <div className="dw-cloudchipr-started-inner">
        <h2>{section.title}</h2>
        <Html html={section.body} className="dw-cloudchipr-started-copy" />

        <div className="dw-cloudchipr-process" aria-label="Research process">
          <span className="dw-cloudchipr-process-track" aria-hidden="true">
            <span className="dw-cloudchipr-process-fill" />
          </span>
          <ol>
            {steps.map((step, index) => (
              <li key={step}>
                <span className="dw-cloudchipr-process-node" aria-hidden="true" />
                <span className="dw-cloudchipr-process-number">{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function CloudChiprFieldStudy({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const gallery = project.sections.find((item) => item.id === "field-study-gallery");
  const learning = project.sections.find((item) => item.id === "aws-learning");
  const course = project.sections.find((item) => item.id === "aws-course");
  const interviews = project.sections.find((item) => item.id === "stakeholder-interviews");
  const quote = project.sections.find((item) => item.id === "sre-quote");

  const steps = [
    { number: "1", body: section.body },
    { number: "2", body: learning?.body },
    { number: "3", body: interviews?.body }
  ];

  return (
    <section className="dw-case-section dw-cloudchipr-field-study" id={section.id} data-cloudchipr-field-study>
      <div className="dw-cloudchipr-field-study-inner">
        <header className="dw-cloudchipr-field-study-heading">
          <h2>{section.title}</h2>
          <p>I took 3 major steps to conduct quality field study:</p>
        </header>

        <article className="dw-cloudchipr-field-step dw-cloudchipr-field-step-reports">
          <div className="dw-cloudchipr-field-step-copy">
            <span className="dw-cloudchipr-field-step-number" aria-hidden="true">{steps[0].number}</span>
            <Html html={steps[0].body} />
          </div>
          <div className="dw-cloudchipr-report-stage">
            {gallery?.items?.map((item, index) => typeof item === "string" ? null : (
              <figure className={`dw-cloudchipr-report dw-cloudchipr-report-${index + 1}`} key={item.asset || index}>
                <span className="dw-cloudchipr-field-asset">
                  <ProjectImage project={project} assetKey={item.asset} />
                </span>
              </figure>
            ))}
          </div>
          {gallery?.caption ? (
            <p className="dw-cloudchipr-field-caption">
              <span>Get more information on this report: </span>
              <a href={gallery.captionUrl} target="_blank" rel="noreferrer">Request Sample Pages.</a>
            </p>
          ) : null}
        </article>

        <article className="dw-cloudchipr-field-step dw-cloudchipr-field-step-course">
          <div className="dw-cloudchipr-field-step-copy">
            <span className="dw-cloudchipr-field-step-number" aria-hidden="true">{steps[1].number}</span>
            <Html html={steps[1].body} />
          </div>
          <figure className="dw-cloudchipr-field-media">
            <span className="dw-cloudchipr-field-media-crop dw-cloudchipr-field-media-crop-course">
              <ProjectImage project={project} assetKey={course?.asset} />
            </span>
            {course?.caption ? (
              <figcaption>
                <a href={course.captionUrl} target="_blank" rel="noreferrer">{course.caption}</a>
              </figcaption>
            ) : null}
          </figure>
        </article>

        <article className="dw-cloudchipr-field-step dw-cloudchipr-field-step-interviews">
          <div className="dw-cloudchipr-field-step-copy">
            <span className="dw-cloudchipr-field-step-number" aria-hidden="true">{steps[2].number}</span>
            <Html html={steps[2].body} />
          </div>
          <figure className="dw-cloudchipr-field-media">
            <span className="dw-cloudchipr-field-media-crop dw-cloudchipr-field-media-crop-quote">
              <ProjectImage project={project} assetKey={quote?.asset} />
            </span>
            {quote?.caption ? <figcaption>{quote.caption}</figcaption> : null}
          </figure>
        </article>
      </div>
    </section>
  );
}

function CloudChiprProblem({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const discovered = project.sections.find((item) => item.id === "problem-discovered");
  const findings = [
    {
      emoji: "😟",
      text: "Companies waste a large percentage of their cloud cost to pay for resources that are never used."
    },
    {
      emoji: "😓",
      text: "Developers forget to clean up after tests."
    },
    {
      emoji: "😢",
      text: "Automation tools fail in the middle of execution and leave cloud resources running."
    },
    {
      emoji: "😮",
      text: "Finance and business teams lack the context to know whether growing cloud costs are necessary or waste."
    }
  ];

  return (
    <section className="dw-case-section dw-cloudchipr-problem" id={section.id} data-cloudchipr-problem>
      <div className="dw-cloudchipr-problem-inner">
        <header className="dw-cloudchipr-problem-heading">
          <h2>{section.title}</h2>
          <p>{discovered?.title}</p>
        </header>

        <p className="dw-cloudchipr-problem-lead">
          We have seen thousands of <span role="img" aria-label="money flying away">💸</span> per hour in cloud waste paid for over years, simply because:
        </p>

        <ul className="dw-cloudchipr-problem-list">
          {findings.map((finding) => (
            <li key={finding.text}>
              <span className="dw-cloudchipr-problem-emoji" aria-hidden="true">{finding.emoji}</span>
              <span>{finding.text}</span>
            </li>
          ))}
        </ul>

        <p className="dw-cloudchipr-problem-conclusion">
          Based on personal research and interviews with the company’s founders and key stakeholders, there is a clear need for a strong cost-optimization platform that can address thousands of dollars in cloud waste every hour.
        </p>
      </div>
    </section>
  );
}

function CloudChiprCompetitorAnalysis({ section }: { section: PortfolioSection }) {
  const directCompetitors = [
    { className: "cloudhealth", label: "CloudHealth", detail: "by VMware" },
    { className: "parkmycloud", label: "ParkMyCloud" },
    { className: "densify", label: "Densify" },
    { className: "cloudzero", label: "CLOUDZERO" },
    { className: "cloudcheckr", label: "CloudCheckr", detail: "Now part of Spot by NetApp" }
  ];
  const indirectCompetitors = [
    { className: "deloitte", label: "Deloitte." },
    { className: "rightscale", label: "RIGHTSCALE" },
    { className: "scalr", label: "SCALR", detail: "CLOUD MANAGEMENT" },
    { className: "cloudbolt", label: "CloudBolt", detail: "software" },
    { className: "aws", label: "aws" },
    { className: "google-cloud", label: "Google Cloud" },
    { className: "azure", label: "Azure" }
  ];
  const competitorLimits = [
    "No self-service setup",
    "No predictable price",
    "Legacy, consulting-based approach",
    "Focused mainly on one cloud provider",
    "Deep engineering knowledge required to maintain and operate",
    "Limited functionality"
  ];
  const cloudChiprAdvantages = [
    "Easy to set up",
    "Flat price",
    "Set up and forget",
    "Hybrid cloud",
    "No engineering knowledge required",
    "Open-source engine"
  ];

  const renderLogo = (competitor: { className: string; label: string; detail?: string }) => (
    <li className={`dw-cloudchipr-wordmark dw-cloudchipr-wordmark-${competitor.className}`} key={competitor.label}>
      <span className="dw-cloudchipr-wordmark-mark" aria-hidden="true" />
      <span>
        <strong>{competitor.label}</strong>
        {competitor.detail ? <small>{competitor.detail}</small> : null}
      </span>
    </li>
  );

  return (
    <section className="dw-case-section dw-cloudchipr-competitors" id={section.id} data-cloudchipr-competitors>
      <div className="dw-cloudchipr-competitor-art" aria-hidden="true">
        <span className="dw-cloudchipr-competitor-ribbon" />
      </div>

      <div className="dw-cloudchipr-competitor-inner">
        <h2 className="dw-cloudchipr-competitor-title">{section.title}</h2>

        <div className="dw-cloudchipr-competitor-block dw-cloudchipr-competitor-direct">
          <p>
            When looking at other companies in the field, I did two kinds of analysis: <strong>direct and indirect competitors.</strong>
          </p>
          <p>
            For <strong>direct competitors</strong>, I looked at companies with products or services similar to ours: what they offer, how much they charge, and who they target. This showed where CloudChipr was stronger and where it still needed work.
          </p>
          <ul className="dw-cloudchipr-logo-cloud dw-cloudchipr-logo-cloud-direct" aria-label="Direct competitors">
            {directCompetitors.map(renderLogo)}
          </ul>
        </div>

        <div className="dw-cloudchipr-competitor-block dw-cloudchipr-competitor-indirect">
          <p>
            <strong>Indirect competitors</strong> were different. They might not do exactly what we do, but they can still pull customers away. I researched them to understand their potential impact on the market.
          </p>
          <ul className="dw-cloudchipr-logo-cloud dw-cloudchipr-logo-cloud-indirect" aria-label="Indirect competitors and cloud platforms">
            {indirectCompetitors.map(renderLogo)}
          </ul>
        </div>

        <div className="dw-cloudchipr-competitor-insights">
          <p>
            I read reports and studied <strong>what customers say online.</strong> That revealed what people value and what frustrates them about existing products.
          </p>
          <p>
            I also reviewed <strong>the technology they use</strong> and the distinct features they offer.
          </p>
          <p>
            Together, this helped define <strong>where CloudChipr could stand apart</strong> instead of becoming another generic cloud-cost tool.
          </p>
        </div>

        <div className="dw-cloudchipr-competitor-comparison" aria-label="Competitor and CloudChipr comparison">
          <div className="dw-cloudchipr-comparison-column dw-cloudchipr-comparison-competitors">
            <h3>Competitors</h3>
            <ul>
              {competitorLimits.map((item) => <li key={item}><span aria-hidden="true">×</span>{item}</li>)}
            </ul>
          </div>
          <div className="dw-cloudchipr-comparison-column dw-cloudchipr-comparison-cloudchipr">
            <h3><img src="/portfolio-assets/cloudchipr/cloudchipr-wordmark.svg" alt="CloudChipr" /></h3>
            <ul>
              {cloudChiprAdvantages.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CloudChiprDesignSystemDecision({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const metrics = [
    { label: "Time saved per project", value: "200 hours", note: "No improvement assumed" },
    { label: "MVP duration before a design system", value: "800 hours" },
    { label: "Cost savings from time saved", value: "200 hours × $40/hour = $8,000" },
    { label: "MVP duration after a design system", value: "600 hours", note: "No improvement assumed" },
    { label: "Cost of a design system for one project", value: "$20,000" },
    { label: "Average designer/developer rate", value: "$50/hour" }
  ];

  return (
    <section className="dw-case-section dw-cloudchipr-design-decision" id={section.id} data-cloudchipr-design-decision>
      <div className="dw-cloudchipr-design-decision-inner">
        <div className="dw-cloudchipr-design-decision-main">
          <header className="dw-cloudchipr-design-decision-heading">
            <h2>To Design or Not to <span>Design system?</span></h2>
            <ProjectImage project={project} assetKey="design-system-skull" />
          </header>

          <p className="dw-cloudchipr-design-decision-copy">
            The company asked me to determine whether <strong>to license an existing design system or create a new one.</strong> Beyond the usual pros and cons, I used a more concrete approach: calculating the <strong>Return on Investment (ROI)</strong> for building our own system. That gave us a <strong>clear, strategic way</strong> to choose the right direction.
          </p>

          <div className="dw-cloudchipr-roi-calculation">
            <h3>ROI Calculation</h3>
            <dl>
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}{metric.note ? <small>{metric.note}</small> : null}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="dw-cloudchipr-roi-result">
          <div className="dw-cloudchipr-roi-equation">
            <p>Total ROI for one project</p>
            <h3>ROI = Cost savings − Cost of design-system implementation</h3>
            <strong>$8,000 − $20,000 = <span>−$12,000</span></strong>
          </div>

          <div className="dw-cloudchipr-roi-comment">
            <p>Holy hosting!<br />That’s a lot of wasted money.</p>
            <ProjectImage project={project} assetKey="roi-comment-portrait" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CloudChiprDesignSystemVisuals({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const benefits = [
    "Stylish",
    "Not expensive",
    "Intuitive customization",
    "Dedicated to accessibility",
    "Has all necessary components"
  ];

  return (
    <section className="dw-case-section dw-cloudchipr-design-system-visuals" id={section.id} data-cloudchipr-design-system-visuals>
      <div className="dw-cloudchipr-design-system-stage">
        <figure className="dw-cloudchipr-design-system-logo">
          <ProjectImage project={project} assetKey="design-system-logo" />
        </figure>

        <ul className="dw-cloudchipr-design-system-benefits">
          {benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
        </ul>

        <figure className="dw-cloudchipr-design-system-screen">
          <ProjectImage project={project} assetKey="design-system-screen" />
        </figure>

        <figure className="dw-cloudchipr-design-system-price">
          <ProjectImage project={project} assetKey="design-system-mobile" />
        </figure>
      </div>
    </section>
  );
}

function CloudChiprOverallAchievements({ section }: { section: PortfolioSection }) {
  const achievements = [
    <>Overall <strong>$500K saved during testing for companies such as SuperAnnotate, ActiveLoop, Flux etc.</strong> <span>(95k ARR in less than 1 month of operations.)</span></>,
    <>Successfully <strong>reduced cloud spending by 30%</strong> for a client during beta testing <span>(the goal was 8–15%).</span></>,
    <>Started as a <strong>solo designer and finished as a design lead.</strong></>,
    <><strong>Grew a team of 4 talented designers.</strong></>,
    <>Understood and designed the entire product’s <strong>MVP in just 6 months.</strong></>,
    <>Nailed all design operations inside the company.</>,
    <>Company became profitable in just 8 months.</>,
    <><strong><u>CloudChipr</u> has raised a total of <u>$1.3M</u> in funding over <u>4</u> rounds.</strong></>
  ];

  return (
    <section className="dw-case-section dw-cloudchipr-overall-achievements" id={section.id}>
      <div className="dw-cloudchipr-overall-achievements-inner" data-portfolio-reveal>
        <h2>Overall <span>Achievements</span></h2>
        <p>During 18 months working at CloudChipr:</p>
        <ul>{achievements.map((achievement, index) => <li key={index}>{achievement}</li>)}</ul>
      </div>
    </section>
  );
}

function CloudChiprFeedback({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const person = section.person;
  return (
    <section className="dw-case-section dw-cloudchipr-feedback" id={section.id}>
      <div className="dw-cloudchipr-feedback-inner" data-portfolio-reveal>
        <h2>{section.title || "Feedback"}</h2>
        <blockquote>{section.quote}</blockquote>
        {person ? (
          <div className="dw-cloudchipr-feedback-person">
            <span className="dw-cloudchipr-feedback-avatar"><ProjectImage project={project} assetKey={section.avatar} /></span>
            <span className="dw-cloudchipr-feedback-person-copy">
              <strong>{person.name}</strong>
              <small>{person.role}</small>
            </span>
            {person.url ? (
              <a href={person.url} target="_blank" rel="noreferrer" aria-label={`${person.name} on LinkedIn`}>
                <Linkedin aria-hidden="true" strokeWidth={0} fill="currentColor" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MediaSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  if (project.project.slug === "material-exchange-photo-lab" && section.id === "problem-flow") {
    const steps = [
      { label: "low quality content", emoji: "\u{1F614}", emojiPos: "top-left" },
      { label: "low Interest from suppliers", emoji: "\u{1F623}", emojiPos: "bottom-right" },
      { label: "low amount of sales", emoji: "\u{1F625}", emojiPos: "top-right" },
      { label: "drop users", emoji: "\u{1F62D}", emojiPos: "bottom-right" }
    ];
    return <section className={sectionClass(section, "dw-photo-lab-problem-flow")} style={sectionStyle(project, section)} id={section.id}>
      {section.title ? <h2 className="dw-photo-lab-flow-title" data-portfolio-reveal>{section.title}</h2> : null}
      <div className="dw-photo-lab-flow" aria-label="Problem progression">{steps.map((step, index) => <React.Fragment key={step.label}><div className={`dw-photo-lab-flow-step step-${index}`}><span>{step.label}</span><span className={`dw-photo-lab-flow-emoji emoji-${step.emojiPos}`} aria-hidden="true">{step.emoji}</span></div>{index < steps.length - 1 ? <span className="dw-photo-lab-flow-arrow" aria-hidden="true">→</span> : null}</React.Fragment>)}</div>
    </section>;
  }
  if (project.project.slug === "cloudchipr" && section.id === "brand-construction") {
    return (
      <section className={sectionClass(section, "dw-case-brand-construction-section")} style={sectionStyle(project, section)} id={section.id}>
        <CloudChiprLogoConstruction />
      </section>
    );
  }

  return (
    <section className={sectionClass(section)} style={sectionStyle(project, section)} id={section.id}>
      <figure className="dw-case-media" data-portfolio-reveal data-portfolio-parallax>
        <ProjectImage project={project} assetKey={section.asset} />
        {section.caption ? <figcaption>{section.caption}</figcaption> : null}
      </figure>
    </section>
  );
}

function GallerySection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const columns = typeof section.columns === "number" ? section.columns : section.items?.length || 2;
  return (
    <section className={sectionClass(section)} style={sectionStyle(project, section)} id={section.id}>
      <div className="dw-case-gallery" style={{ "--case-columns": Math.min(columns, 4) } as CSSProperties} data-portfolio-reveal>
        {section.items?.map((item, index) => {
          if (typeof item === "string") return <span key={item}>{item}</span>;
          return (
            <figure key={`${item.asset}-${index}`}>
              <ProjectImage project={project} assetKey={item.asset} />
              {item.caption ? <figcaption>{item.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

function SplitSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const columns = Array.isArray(section.columns) ? section.columns : [];
  return (
    <section className={sectionClass(section)} style={sectionStyle(project, section)} id={section.id}>
      <div className="dw-case-split" data-portfolio-reveal>
        {columns.map((column, index) => (
          <article key={`${section.id}-${index}`}>
            {column.asset ? <ProjectImage project={project} assetKey={column.asset} /> : null}
            {column.title ? <h2>{column.title}</h2> : null}
            <Html html={column.body} className="dw-case-richtext" />
          </article>
        ))}
      </div>
    </section>
  );
}

function FeatureGridSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className={sectionClass(section)} style={sectionStyle(project, section)} id={section.id}>
      <div className="dw-case-feature-grid" data-portfolio-reveal>
        {section.items?.map((item, index) => typeof item === "string" ? null : (
          <article key={`${item.icon}-${index}`}>
            <ProjectImage project={project} assetKey={item.icon} />
            <Html html={item.text} />
          </article>
        ))}
      </div>
    </section>
  );
}

function ChipsSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className={sectionClass(section)} style={sectionStyle(project, section)} id={section.id}>
      <div className="dw-case-chips" data-portfolio-reveal>
        {section.items?.map((item) => typeof item === "string" ? <span key={item}>{item}</span> : null)}
      </div>
    </section>
  );
}

function MetricsSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  return (
    <section className={sectionClass(section, "dw-case-metrics-section")} style={sectionStyle(project, section)} id={section.id}>
      <div className="dw-case-metrics" data-portfolio-reveal>
        {section.title ? <h2>{section.title}</h2> : null}
        <div>
          {section.items?.map((item, index) => typeof item === "string" ? null : (
            <article key={`${item.value}-${index}`}>
              <ProjectImage project={project} assetKey={item.icon} />
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const person = section.person;
  return (
    <section className={sectionClass(section, "dw-case-testimonial-section")} style={sectionStyle(project, section)} id={section.id}>
      <h2 className="dw-case-testimonial-heading" data-portfolio-reveal>{section.title || "Feedback"}</h2>
      <div className="dw-case-testimonial" data-portfolio-reveal>
        {project.project.slug === "material-exchange" && section.id === "feedback" ? (
          <span className="dw-case-testimonial-annotation" aria-hidden="true">
            <svg width="349" height="211" viewBox="0 0 349 211" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50.6616 27.9688C50.7241 27.6771 50.7762 27.3021 50.8179 26.8438C50.8595 26.3854 50.9116 25.7812 50.9741 25.0312C51.0575 24.2812 51.1408 23.3542 51.2241 22.25C51.3283 21.1458 51.4637 19.8021 51.6304 18.2188C51.797 16.6354 51.9845 14.7812 52.1929 12.6562C52.422 10.5104 52.7137 8.02083 53.0679 5.1875C53.0887 4.97917 53.1825 4.85417 53.3491 4.8125C53.5366 4.77083 53.7033 4.75 53.8491 4.75C54.0783 4.75 54.2658 4.83333 54.4116 5C54.5575 5.16667 54.6825 5.35417 54.7866 5.5625C54.9116 5.77083 55.0262 5.98958 55.1304 6.21875C55.2345 6.44792 55.3491 6.63542 55.4741 6.78125C55.6825 7.26042 55.8908 7.8125 56.0991 8.4375C56.3283 9.0625 56.5679 9.72917 56.8179 10.4375C57.0679 11.1458 57.3179 11.8646 57.5679 12.5938C57.8179 13.3021 58.0679 14 58.3179 14.6875C58.5679 15.3542 58.797 15.9792 59.0054 16.5625C59.2345 17.125 59.4429 17.5938 59.6304 17.9688C59.8595 17.9479 60.1825 17.8646 60.5991 17.7188C61.0158 17.5521 61.4637 17.3958 61.9429 17.25C62.422 17.1042 62.8908 16.9896 63.3491 16.9062C63.8075 16.8229 64.1929 16.8229 64.5054 16.9062C64.8179 16.9688 65.0158 17.1458 65.0991 17.4375C65.2033 17.7292 65.1304 18.1875 64.8804 18.8125C64.7345 18.8125 64.5991 18.7917 64.4741 18.75C64.3491 18.6875 64.2241 18.6354 64.0991 18.5938C63.9741 18.5312 63.8387 18.4792 63.6929 18.4375C63.5679 18.375 63.422 18.3438 63.2554 18.3438C63.1512 18.3438 62.9116 18.4062 62.5366 18.5312C62.1825 18.6354 61.797 18.7604 61.3804 18.9062C60.9637 19.0312 60.5991 19.1667 60.2866 19.3125C59.9741 19.4375 59.8179 19.5312 59.8179 19.5938L61.9741 28.0625L61.1616 29.25C60.8075 28.6458 60.5054 27.9583 60.2554 27.1875C60.0262 26.3958 59.8075 25.6146 59.5991 24.8438C59.3908 24.0521 59.172 23.3229 58.9429 22.6562C58.7345 21.9688 58.4637 21.3958 58.1304 20.9375C57.6929 21.1458 57.172 21.3229 56.5679 21.4688C55.9637 21.6146 55.3804 21.8021 54.8179 22.0312C54.2554 22.2396 53.7658 22.5312 53.3491 22.9062C52.9533 23.2604 52.7137 23.75 52.6304 24.375C52.5887 24.625 52.547 24.9583 52.5054 25.375C52.4845 25.7917 52.4533 26.1875 52.4116 26.5625C52.3491 27.0208 52.297 27.4896 52.2554 27.9688H50.6616ZM54.2554 9.5625L54.1929 10.0938C54.172 10.4479 54.1408 10.8646 54.0991 11.3438C54.0575 11.8021 54.0054 12.2812 53.9429 12.7812C53.9012 13.2604 53.87 13.6667 53.8491 14C53.745 15.1667 53.6304 16.3229 53.5054 17.4688C53.4012 18.5938 53.3491 19.75 53.3491 20.9375C53.745 20.9375 54.1616 20.8854 54.5991 20.7812C55.0575 20.6771 55.495 20.5417 55.9116 20.375C56.3283 20.1875 56.7033 19.9688 57.0366 19.7188C57.3908 19.4479 57.6616 19.1458 57.8491 18.8125C57.6825 18.0833 57.495 17.3333 57.2866 16.5625C57.0991 15.7708 56.8908 14.9792 56.6616 14.1875C56.4325 13.375 56.1825 12.5833 55.9116 11.8125C55.6408 11.0417 55.3491 10.2917 55.0366 9.5625C55.0158 9.54167 54.9429 9.5 54.8179 9.4375C54.6929 9.35417 54.5054 9.39583 54.2554 9.5625ZM66.5904 28.3125C66.5904 28.3333 66.8091 28.2083 67.2466 27.9375C67.705 27.6667 68.2362 27.3125 68.8404 26.875C69.4654 26.4167 70.1008 25.9271 70.7466 25.4062C71.3925 24.8646 71.9237 24.3542 72.3404 23.875C72.757 23.3958 72.9758 22.9896 72.9966 22.6562C73.0383 22.3021 72.757 22.0729 72.1529 21.9688C71.4029 21.8646 70.7675 21.875 70.2466 22C69.7466 22.125 69.2883 22.2708 68.8716 22.4375C68.455 22.6042 68.0591 22.7604 67.6841 22.9062C67.33 23.0521 66.9341 23.1042 66.4966 23.0625C65.58 23.0625 64.9445 22.7812 64.5904 22.2188C64.257 21.6354 64.0904 20.8542 64.0904 19.875C64.0904 18.8958 64.3091 17.9688 64.7466 17.0938C65.1841 16.1979 65.7466 15.4271 66.4341 14.7812C67.1216 14.1354 67.9133 13.625 68.8091 13.25C69.705 12.8542 70.6216 12.6562 71.5591 12.6562C71.9341 12.6562 72.257 12.6875 72.5279 12.75C72.7987 12.8125 72.9341 13.0521 72.9341 13.4688C72.9341 13.7604 72.8091 14.0417 72.5591 14.3125C72.3091 14.5625 72.0279 14.6875 71.7154 14.6875C71.6945 14.6875 71.6425 14.6771 71.5591 14.6562C71.4758 14.6146 71.3925 14.5625 71.3091 14.5C71.2258 14.4375 71.1425 14.3958 71.0591 14.375C70.9758 14.3333 70.9237 14.3125 70.9029 14.3125C70.2362 14.125 69.5904 14.2188 68.9654 14.5938C68.3404 14.9688 67.7779 15.4792 67.2779 16.125C66.7987 16.75 66.4133 17.4375 66.1216 18.1875C65.83 18.9167 65.6841 19.5729 65.6841 20.1562C65.6841 20.3854 65.7258 20.5729 65.8091 20.7188C65.9133 20.8438 66.0383 20.9375 66.1841 21C66.3508 21.0625 66.5279 21.1042 66.7154 21.125C66.9237 21.125 67.132 21.125 67.3404 21.125C67.757 21.125 68.1737 21.0625 68.5904 20.9375C69.0279 20.8125 69.4445 20.6667 69.8404 20.5C70.257 20.3333 70.6737 20.1875 71.0904 20.0625C71.5279 19.9375 71.9758 19.875 72.4341 19.875C72.6425 19.875 72.8716 19.9375 73.1216 20.0625C73.3716 20.1667 73.6008 20.3333 73.8091 20.5625C74.0175 20.7708 74.1945 21.0208 74.3404 21.3125C74.4862 21.5833 74.5695 21.8854 74.5904 22.2188C74.7154 22.5104 74.6737 22.8958 74.4654 23.375C74.2779 23.8542 73.9862 24.3646 73.5904 24.9062C73.1945 25.4479 72.7154 26 72.1529 26.5625C71.5904 27.1042 71.0279 27.6042 70.4654 28.0625C69.9029 28.5 69.3508 28.8542 68.8091 29.125C68.2675 29.4167 67.8091 29.5521 67.4341 29.5312C67.0175 29.5312 66.7675 29.4062 66.6841 29.1562C66.6216 28.9062 66.5904 28.625 66.5904 28.3125ZM77.7066 4.78125C78.1441 4.36458 78.4879 4.19792 78.7379 4.28125C79.0087 4.36458 79.2066 4.64583 79.3316 5.125C79.4566 5.60417 79.5295 6.22917 79.5504 7C79.5712 7.77083 79.5608 8.64583 79.5191 9.625C79.4983 10.5833 79.4462 11.6042 79.3629 12.6875C79.2795 13.75 79.2066 14.8021 79.1441 15.8438C79.0816 16.8646 79.04 17.8438 79.0191 18.7812C78.9983 19.7188 79.0295 20.5312 79.1129 21.2188H79.2066C79.2483 21.2188 79.2795 21.2083 79.3004 21.1875C80.3837 20.1042 81.3525 18.9583 82.2066 17.75C83.0608 16.5417 83.8316 15.4062 84.5191 14.3438C85.2066 13.2604 85.8108 12.3229 86.3316 11.5312C86.8733 10.7396 87.3733 10.1979 87.8316 9.90625C88.1441 9.90625 88.4045 9.95833 88.6129 10.0625C88.842 10.1667 88.9566 10.4062 88.9566 10.7812C88.9566 10.8229 88.9462 10.8958 88.9254 11C88.9254 11.0833 88.9254 11.1458 88.9254 11.1875C88.4045 12.25 87.8316 13.3229 87.2066 14.4062C86.5816 15.4688 85.9045 16.5 85.1754 17.5C84.4462 18.5 83.6545 19.4479 82.8004 20.3438C81.967 21.2396 81.0608 22.0521 80.0816 22.7812C80.0816 22.8021 80.0712 22.8438 80.0504 22.9062C80.0504 22.9479 80.0504 22.9792 80.0504 23C80.0504 23.2083 80.217 23.4375 80.5504 23.6875C80.9045 23.9375 81.342 24.1771 81.8629 24.4062C82.4045 24.6354 82.9983 24.8646 83.6441 25.0938C84.3108 25.3229 84.9566 25.5208 85.5816 25.6875C86.2275 25.8542 86.8212 25.9896 87.3629 26.0938C87.9254 26.1979 88.3629 26.25 88.6754 26.25C88.6754 26.3333 88.6754 26.4896 88.6754 26.7188C88.6962 26.9479 88.6858 27.1875 88.6441 27.4375C88.6025 27.6875 88.5295 27.9167 88.4254 28.125C88.3212 28.3125 88.1545 28.4062 87.9254 28.4062H87.8004C87.7587 28.4062 87.7275 28.3958 87.7066 28.375L78.7691 24.7812C78.7483 26.0104 78.665 27.0104 78.5191 27.7812C78.3733 28.5312 78.1962 29.0833 77.9879 29.4375C77.8004 29.8125 77.592 29.9896 77.3629 29.9688C77.1545 29.9479 76.967 29.7812 76.8004 29.4688L77.7066 4.78125ZM111.064 28.1562C111.064 27.7396 111.325 27.2083 111.845 26.5625C112.366 25.8958 113.012 25.1458 113.783 24.3125C114.554 23.4792 115.397 22.5729 116.314 21.5938C117.231 20.6146 118.075 19.6042 118.845 18.5625C119.616 17.5 120.262 16.4271 120.783 15.3438C121.304 14.2396 121.564 13.1562 121.564 12.0938C121.564 11.5312 121.408 11.0521 121.095 10.6562C120.783 10.2396 120.377 9.88542 119.877 9.59375C119.397 9.30208 118.845 9.07292 118.22 8.90625C117.616 8.73958 117.002 8.61458 116.377 8.53125C115.752 8.42708 115.158 8.36458 114.595 8.34375C114.033 8.30208 113.554 8.28125 113.158 8.28125C113.054 8.28125 112.918 8.29167 112.752 8.3125C112.585 8.3125 112.408 8.32292 112.22 8.34375C112.054 8.34375 111.897 8.35417 111.752 8.375C111.606 8.39583 111.522 8.40625 111.502 8.40625L111.095 8.78125C111.095 8.82292 111.085 9 111.064 9.3125C111.064 9.625 111.054 9.97917 111.033 10.375C111.033 10.7708 111.033 11.1771 111.033 11.5938V12.5625C111.033 14.6667 111.106 16.7604 111.252 18.8438C111.418 20.9062 111.502 22.9896 111.502 25.0938C111.502 25.2188 111.502 25.3542 111.502 25.5C111.522 25.6458 111.522 25.7917 111.502 25.9375C111.481 26.0625 111.418 26.1771 111.314 26.2812C111.231 26.3646 111.095 26.4062 110.908 26.4062C110.783 26.4062 110.658 26.375 110.533 26.3125C110.408 26.25 110.335 26.1458 110.314 26L109.095 9.5625C109.033 9.60417 108.918 9.66667 108.752 9.75C108.606 9.8125 108.45 9.88542 108.283 9.96875C108.116 10.0521 107.95 10.1458 107.783 10.25C107.637 10.3333 107.543 10.375 107.502 10.375C107.481 10.375 107.439 10.3854 107.377 10.4062C107.335 10.4062 107.304 10.4062 107.283 10.4062C107.179 10.4062 107.054 10.3854 106.908 10.3438C106.783 10.2812 106.72 10.1562 106.72 9.96875C106.72 9.65625 106.783 9.40625 106.908 9.21875C107.054 9.01042 107.231 8.82292 107.439 8.65625C107.668 8.48958 107.908 8.32292 108.158 8.15625C108.408 7.98958 108.637 7.78125 108.845 7.53125C109.075 7.26042 109.252 6.92708 109.377 6.53125C109.522 6.13542 109.595 5.63542 109.595 5.03125C110.012 5.03125 110.272 5.10417 110.377 5.25C110.481 5.39583 110.543 5.57292 110.564 5.78125C110.585 5.96875 110.606 6.16667 110.627 6.375C110.668 6.5625 110.825 6.69792 111.095 6.78125C111.679 6.76042 112.377 6.76042 113.189 6.78125C114.022 6.80208 114.887 6.875 115.783 7C116.7 7.10417 117.595 7.27083 118.47 7.5C119.366 7.72917 120.158 8.05208 120.845 8.46875C121.554 8.88542 122.106 9.41667 122.502 10.0625C122.918 10.6875 123.106 11.4583 123.064 12.375C122.793 13.9792 122.272 15.5208 121.502 17C120.752 18.4792 119.856 19.9062 118.814 21.2812C117.793 22.6354 116.679 23.9375 115.47 25.1875C114.283 26.4375 113.095 27.6354 111.908 28.7812C111.887 28.7812 111.856 28.7812 111.814 28.7812C111.772 28.8021 111.741 28.8125 111.72 28.8125C111.533 28.8125 111.377 28.75 111.252 28.625C111.127 28.5 111.064 28.3438 111.064 28.1562ZM126.462 22.0312C126.357 22.0521 126.201 22.0833 125.993 22.125C125.785 22.1667 125.566 22.1771 125.337 22.1562C125.107 22.1354 124.91 22.0729 124.743 21.9688C124.555 21.8646 124.462 21.6875 124.462 21.4375C124.462 21.2917 124.493 21.1875 124.555 21.125C124.618 21.0625 124.722 20.9688 124.868 20.8438C125.326 20.4688 125.712 19.9896 126.024 19.4062C126.357 18.8021 126.66 18.1667 126.93 17.5C127.201 16.8125 127.482 16.1354 127.774 15.4688C128.087 14.7812 128.441 14.1667 128.837 13.625C129.232 13.0833 129.722 12.6458 130.305 12.3125C130.889 11.9792 131.607 11.8229 132.462 11.8438C132.816 11.8438 133.212 11.9271 133.649 12.0938C134.087 12.2604 134.493 12.4896 134.868 12.7812C135.243 13.0521 135.555 13.3854 135.805 13.7812C136.055 14.1771 136.18 14.6146 136.18 15.0938C136.285 15.2604 136.18 15.5 135.868 15.8125C135.576 16.125 135.17 16.4688 134.649 16.8438C134.128 17.1979 133.535 17.5729 132.868 17.9688C132.222 18.3438 131.597 18.6979 130.993 19.0312C130.389 19.3646 129.857 19.6562 129.399 19.9062C128.941 20.1562 128.639 20.3438 128.493 20.4688C128.389 20.6771 128.305 20.9167 128.243 21.1875C128.18 21.4583 128.128 21.7188 128.087 21.9688C128.066 22.1979 128.045 22.4167 128.024 22.625C128.024 22.8125 128.024 22.9583 128.024 23.0625C128.024 23.4583 128.003 23.8958 127.962 24.375C127.941 24.8542 127.962 25.3125 128.024 25.75C128.107 26.1667 128.285 26.5208 128.555 26.8125C128.826 27.0833 129.285 27.2188 129.93 27.2188C130.618 27.2188 131.264 27.0521 131.868 26.7188C132.472 26.3646 133.035 25.9375 133.555 25.4375C134.076 24.9375 134.545 24.3958 134.962 23.8125C135.399 23.2292 135.785 22.6875 136.118 22.1875C136.472 21.6667 136.785 21.2396 137.055 20.9062C137.326 20.5729 137.555 20.4062 137.743 20.4062C137.951 20.4062 138.17 20.4479 138.399 20.5312C138.649 20.5938 138.774 20.7604 138.774 21.0312C138.774 21.4062 138.618 21.8542 138.305 22.375C138.014 22.8958 137.618 23.4479 137.118 24.0312C136.639 24.6146 136.076 25.1979 135.43 25.7812C134.805 26.3438 134.17 26.8542 133.524 27.3125C132.878 27.75 132.243 28.1146 131.618 28.4062C130.993 28.6771 130.441 28.8125 129.962 28.8125C129.024 28.8125 128.316 28.5833 127.837 28.125C127.357 27.6667 127.014 27.0938 126.805 26.4062C126.618 25.7188 126.514 24.9896 126.493 24.2188C126.493 23.4271 126.482 22.6979 126.462 22.0312ZM132.212 13.5938C131.857 13.5938 131.482 13.7708 131.087 14.125C130.691 14.4583 130.316 14.875 129.962 15.375C129.628 15.8542 129.347 16.3542 129.118 16.875C128.91 17.375 128.805 17.7917 128.805 18.125C129.118 18.125 129.566 18.0104 130.149 17.7812C130.753 17.5312 131.347 17.2292 131.93 16.875C132.514 16.5208 133.024 16.1458 133.462 15.75C133.899 15.3542 134.118 14.9792 134.118 14.625C134.118 14.4375 134.045 14.2812 133.899 14.1562C133.753 14.0312 133.576 13.9271 133.368 13.8438C133.18 13.7604 132.982 13.6979 132.774 13.6562C132.566 13.6146 132.378 13.5938 132.212 13.5938ZM134.984 35.4688C134.984 35.0729 135.067 34.8542 135.234 34.8125C135.38 34.7917 135.578 34.875 135.828 35.0625C136.078 35.25 136.37 35.5 136.703 35.8125C137.036 36.125 137.37 36.4479 137.703 36.7812C138.036 37.1146 138.359 37.3958 138.672 37.625C138.963 37.8542 139.224 37.9792 139.453 38C139.849 38 140.192 37.875 140.484 37.625C140.755 37.3958 140.995 37.0833 141.203 36.6875C141.411 36.2917 141.578 35.8438 141.703 35.3438C141.849 34.8646 141.953 34.3854 142.015 33.9062C142.099 33.4479 142.151 33.0104 142.172 32.5938C142.213 32.1979 142.234 31.8646 142.234 31.5938C142.192 30.0104 142.099 28.4375 141.953 26.875C141.828 25.3125 141.713 23.7604 141.609 22.2188C141.505 20.6771 141.422 19.125 141.359 17.5625C141.297 15.9792 141.317 14.3854 141.422 12.7812C141.505 12.5729 141.62 12.4479 141.765 12.4062C141.911 12.3646 142.057 12.3438 142.203 12.3438C142.39 12.3438 142.547 12.3646 142.672 12.4062C142.817 12.4479 142.932 12.5729 143.015 12.7812C142.932 14.5312 142.932 16.2083 143.015 17.8125C143.099 19.3958 143.203 20.9688 143.328 22.5312C143.453 24.0729 143.567 25.625 143.672 27.1875C143.797 28.75 143.859 30.375 143.859 32.0625C143.859 32.3125 143.828 32.6667 143.765 33.125C143.724 33.5833 143.651 34.0833 143.547 34.625C143.442 35.1875 143.297 35.7604 143.109 36.3438C142.942 36.9271 142.734 37.4583 142.484 37.9375C142.255 38.4167 141.984 38.8125 141.672 39.125C141.359 39.4375 141.005 39.5938 140.609 39.5938C140.234 39.5938 139.734 39.4583 139.109 39.1875C138.484 38.9167 137.87 38.5833 137.265 38.1875C136.661 37.8125 136.13 37.375 135.672 36.875C135.213 36.3958 134.984 35.9271 134.984 35.4688ZM141.422 4.1875C141.422 4.08333 141.463 3.96875 141.547 3.84375C141.651 3.71875 141.755 3.60417 141.859 3.5C141.984 3.39583 142.12 3.32292 142.265 3.28125C142.411 3.21875 142.526 3.1875 142.609 3.1875C142.817 3.1875 142.942 3.29167 142.984 3.5C143.026 3.70833 143.047 3.86458 143.047 3.96875C143.047 4.53125 142.765 4.8125 142.203 4.8125C141.995 4.8125 141.807 4.77083 141.64 4.6875C141.495 4.58333 141.422 4.41667 141.422 4.1875ZM154.725 27.9688C154.621 27.4271 154.527 26.7812 154.444 26.0312C154.382 25.2604 154.309 24.4896 154.225 23.7188C154.142 22.9271 154.038 22.1875 153.913 21.5C153.809 20.8125 153.642 20.25 153.413 19.8125C152.35 21.9792 151.413 23.6875 150.6 24.9375C149.788 26.1667 149.069 27.0521 148.444 27.5938C147.84 28.1146 147.33 28.3646 146.913 28.3438C146.496 28.3229 146.152 28.1354 145.882 27.7812C145.611 27.4271 145.413 26.9792 145.288 26.4375C145.184 25.875 145.111 25.3542 145.069 24.875C145.069 24.4167 145.173 23.7708 145.382 22.9375C145.59 22.1042 145.871 21.1979 146.225 20.2188C146.58 19.2188 146.996 18.2083 147.475 17.1875C147.975 16.1667 148.507 15.2396 149.069 14.4062C149.632 13.5729 150.215 12.8854 150.819 12.3438C151.423 11.8021 152.027 11.5312 152.632 11.5312C153.527 11.3854 154.184 11.5833 154.6 12.125C155.038 12.6458 155.121 13.5312 154.85 14.7812C154.85 16.1562 154.902 17.3333 155.007 18.3125C155.132 19.2917 155.257 20.2292 155.382 21.125C155.527 22.0208 155.652 22.9583 155.757 23.9375C155.882 24.9167 155.944 26.0938 155.944 27.4688C155.944 27.7188 155.913 27.9375 155.85 28.125C155.809 28.2917 155.559 28.375 155.1 28.375C155.038 28.375 154.955 28.3229 154.85 28.2188C154.767 28.1146 154.725 28.0312 154.725 27.9688ZM153.038 14C152.809 13.6667 152.496 13.6354 152.1 13.9062C151.705 14.1771 151.288 14.625 150.85 15.25C150.413 15.875 149.965 16.625 149.507 17.5C149.048 18.375 148.621 19.2604 148.225 20.1562C147.83 21.0521 147.486 21.9062 147.194 22.7188C146.902 23.5104 146.705 24.1667 146.6 24.6875C146.6 25.4375 146.715 25.8646 146.944 25.9688C147.173 26.0521 147.455 25.9271 147.788 25.5938C148.121 25.2604 148.496 24.7812 148.913 24.1562C149.35 23.5312 149.767 22.8646 150.163 22.1562C150.58 21.4479 150.965 20.7604 151.319 20.0938C151.694 19.4271 151.986 18.8854 152.194 18.4688C152.382 18.0312 152.527 17.625 152.632 17.25C152.736 16.875 152.819 16.5208 152.882 16.1875C152.965 15.8333 153.007 15.4792 153.007 15.125C153.027 14.7708 153.038 14.3958 153.038 14ZM159.842 28.375C159.612 25.5625 159.404 22.75 159.217 19.9375C159.05 17.1042 158.862 14.1667 158.654 11.125C158.654 10.625 158.925 10.375 159.467 10.375H159.717C159.779 10.375 159.852 10.4583 159.935 10.625C160.019 10.7917 160.102 11.1042 160.185 11.5625C160.29 12 160.394 12.6771 160.498 13.5938C160.623 14.4896 160.769 15.6667 160.935 17.125C161.102 18.5833 161.29 20.4062 161.498 22.5938C161.935 21.1771 162.279 19.8021 162.529 18.4688C162.779 17.1354 163.102 15.9271 163.498 14.8438C163.894 13.7396 164.446 12.7708 165.154 11.9375C165.883 11.1042 166.925 10.4896 168.279 10.0938C169.029 10.2188 169.633 10.6771 170.092 11.4688C170.55 12.2396 170.915 13.1979 171.185 14.3438C171.456 15.4896 171.644 16.7396 171.748 18.0938C171.852 19.4271 171.915 20.7083 171.935 21.9375C171.956 23.1667 171.967 24.2708 171.967 25.25C171.967 26.2083 171.987 26.8958 172.029 27.3125C171.967 27.4792 171.873 27.625 171.748 27.75C171.623 27.875 171.477 27.9688 171.31 28.0312C171.165 28.0729 171.019 28.0833 170.873 28.0625C170.727 28.0208 170.592 27.9062 170.467 27.7188C170.467 27.4896 170.446 27.0208 170.404 26.3125C170.362 25.6042 170.31 24.7812 170.248 23.8438C170.185 22.8854 170.112 21.875 170.029 20.8125C169.967 19.7292 169.904 18.7188 169.842 17.7812C169.8 16.8229 169.758 15.9896 169.717 15.2812C169.675 14.5729 169.644 14.1042 169.623 13.875C169.185 13.1042 168.748 12.6667 168.31 12.5625C167.894 12.4583 167.467 12.5938 167.029 12.9688C166.612 13.3438 166.206 13.9167 165.81 14.6875C165.415 15.4583 165.04 16.3333 164.685 17.3125C164.331 18.2708 163.998 19.2812 163.685 20.3438C163.373 21.4062 163.102 22.4375 162.873 23.4375C162.644 24.4167 162.446 25.3125 162.279 26.125C162.133 26.9167 162.04 27.5312 161.998 27.9688C161.935 28.1146 161.8 28.2604 161.592 28.4062C161.404 28.5312 161.196 28.625 160.967 28.6875C160.758 28.75 160.54 28.7708 160.31 28.75C160.102 28.7083 159.946 28.5833 159.842 28.375ZM192.793 17.25C192.71 17.25 192.585 17.2917 192.418 17.375C192.251 17.4375 192.074 17.5208 191.887 17.625C191.72 17.7083 191.553 17.7917 191.387 17.875C191.22 17.9583 191.074 18 190.949 18C190.741 18 190.553 17.9583 190.387 17.875C190.241 17.7917 190.168 17.625 190.168 17.375C190.168 17.1667 190.262 16.9688 190.449 16.7812C190.657 16.5938 190.897 16.4062 191.168 16.2188C191.439 16.0312 191.71 15.8542 191.98 15.6875C192.251 15.5208 192.449 15.3542 192.574 15.1875C192.532 14.8542 192.501 14.2292 192.48 13.3125C192.46 12.3958 192.46 11.3542 192.48 10.1875C192.522 9 192.595 7.78125 192.699 6.53125C192.824 5.28125 193.001 4.16667 193.23 3.1875C193.48 2.1875 193.803 1.40625 194.199 0.84375C194.595 0.28125 195.105 0.104167 195.73 0.3125C196.168 0.3125 196.564 0.447917 196.918 0.71875C197.272 0.96875 197.574 1.29167 197.824 1.6875C198.074 2.0625 198.262 2.47917 198.387 2.9375C198.532 3.39583 198.605 3.8125 198.605 4.1875C198.605 4.39583 198.553 4.625 198.449 4.875C198.366 5.10417 198.199 5.21875 197.949 5.21875H197.855C197.835 5.21875 197.814 5.20833 197.793 5.1875C197.293 3.91667 196.866 3.11458 196.512 2.78125C196.178 2.42708 195.887 2.41667 195.637 2.75C195.407 3.08333 195.21 3.67708 195.043 4.53125C194.897 5.38542 194.772 6.375 194.668 7.5C194.564 8.60417 194.47 9.78125 194.387 11.0312C194.303 12.2604 194.22 13.4062 194.137 14.4688C194.553 14.3646 194.897 14.2604 195.168 14.1562C195.46 14.0521 195.72 13.9479 195.949 13.8438C196.178 13.7188 196.387 13.6042 196.574 13.5C196.762 13.375 196.97 13.2708 197.199 13.1875C197.637 12.9792 198.116 12.7812 198.637 12.5938C199.178 12.3854 199.699 12.2812 200.199 12.2812C200.199 12.8854 200.085 13.3854 199.855 13.7812C199.647 14.1771 199.366 14.5 199.012 14.75C198.678 15 198.293 15.1875 197.855 15.3125C197.418 15.4167 196.97 15.5104 196.512 15.5938C196.074 15.6771 195.657 15.7604 195.262 15.8438C194.866 15.9271 194.522 16.0312 194.23 16.1562C194.293 17.5104 194.376 18.6979 194.48 19.7188C194.605 20.7396 194.71 21.6458 194.793 22.4375C194.897 23.2292 194.97 23.9583 195.012 24.625C195.074 25.2708 195.074 25.9167 195.012 26.5625C195.012 26.7083 195.012 26.9167 195.012 27.1875C195.032 27.4375 195.022 27.6875 194.98 27.9375C194.96 28.1875 194.887 28.4062 194.762 28.5938C194.637 28.7604 194.439 28.8438 194.168 28.8438C193.918 28.8438 193.73 28.7917 193.605 28.6875C193.48 28.5625 193.397 28.3229 193.355 27.9688C193.23 26.2812 193.126 24.8542 193.043 23.6875C192.98 22.5 192.928 21.5104 192.887 20.7188C192.845 19.9062 192.824 19.2708 192.824 18.8125V17.375C192.824 17.2917 192.814 17.25 192.793 17.25ZM202.315 24.5C202.17 23.5417 202.097 22.6146 202.097 21.7188C202.097 20.8021 202.149 19.875 202.253 18.9375C202.378 18 202.545 17.0312 202.753 16.0312C202.982 15.0104 203.242 13.9167 203.534 12.75C203.534 12.5208 203.597 12.3125 203.722 12.125C203.847 11.9167 204.013 11.75 204.222 11.625C204.43 11.4792 204.649 11.3646 204.878 11.2812C205.107 11.1979 205.326 11.1562 205.534 11.1562C205.992 11.1562 206.409 11.3021 206.784 11.5938C207.159 11.8854 207.492 12.2396 207.784 12.6562C208.097 13.0729 208.357 13.5208 208.565 14C208.795 14.4583 208.982 14.8542 209.128 15.1875C209.295 15.9167 209.409 16.75 209.472 17.6875C209.555 18.6042 209.565 19.5417 209.503 20.5C209.44 21.4583 209.295 22.4062 209.065 23.3438C208.836 24.2604 208.513 25.1042 208.097 25.875C207.68 26.6458 207.138 27.2917 206.472 27.8125C205.826 28.3333 205.055 28.6562 204.159 28.7812C203.68 28.7812 203.315 28.625 203.065 28.3125C202.815 27.9792 202.628 27.5833 202.503 27.125C202.399 26.6458 202.336 26.1667 202.315 25.6875C202.315 25.2083 202.315 24.8125 202.315 24.5ZM203.909 24.4062C203.909 24.6146 203.909 24.8125 203.909 25C203.93 25.1875 203.951 25.375 203.972 25.5625C204.013 25.7292 204.055 25.9167 204.097 26.125C204.159 26.3125 204.232 26.5312 204.315 26.7812H204.503C205.003 26.7812 205.43 26.6146 205.784 26.2812C206.138 25.9479 206.44 25.5208 206.69 25C206.94 24.4583 207.149 23.8646 207.315 23.2188C207.482 22.5521 207.607 21.9062 207.69 21.2812C207.795 20.6354 207.857 20.0417 207.878 19.5C207.92 18.9375 207.94 18.4896 207.94 18.1562V17.5312C207.94 17.2604 207.93 16.9583 207.909 16.625C207.888 16.2708 207.847 15.9167 207.784 15.5625C207.742 15.1875 207.67 14.8542 207.565 14.5625C207.461 14.25 207.326 14 207.159 13.8125C206.992 13.625 206.774 13.5312 206.503 13.5312C206.045 13.3854 205.649 13.4167 205.315 13.625C205.003 13.8333 204.742 14.1875 204.534 14.6875C204.347 15.1667 204.201 15.7604 204.097 16.4688C203.992 17.1771 203.93 17.9583 203.909 18.8125C203.888 19.6667 203.878 20.5729 203.878 21.5312C203.899 22.4896 203.909 23.4479 203.909 24.4062ZM211.838 13.7188V13.4688C211.838 13.2604 211.911 13.1146 212.057 13.0312C212.223 12.9479 212.411 12.9062 212.619 12.9062C212.786 12.9062 212.942 12.9271 213.088 12.9688C213.234 12.9896 213.348 13.1042 213.432 13.3125C213.494 13.625 213.557 14.0625 213.619 14.625C213.682 15.1667 213.755 15.7708 213.838 16.4375C213.921 17.1042 214.005 17.8125 214.088 18.5625C214.192 19.2917 214.286 19.9896 214.369 20.6562C214.473 21.3021 214.577 21.8854 214.682 22.4062C214.786 22.9271 214.9 23.3229 215.025 23.5938C214.963 21.5938 215.025 19.8646 215.213 18.4062C215.4 16.9271 215.755 15.7292 216.275 14.8125C216.817 13.875 217.546 13.2292 218.463 12.875C219.4 12.5 220.567 12.4167 221.963 12.625C222.609 12.625 222.932 12.9688 222.932 13.6562C222.932 13.9271 222.755 14.1146 222.4 14.2188C222.046 14.3021 221.65 14.3646 221.213 14.4062C220.775 14.4271 220.348 14.4583 219.932 14.5C219.515 14.5417 219.213 14.6458 219.025 14.8125C218.275 15.2292 217.744 15.875 217.432 16.75C217.14 17.625 216.932 18.6562 216.807 19.8438C216.682 21.0312 216.588 22.3333 216.525 23.75C216.484 25.1458 216.348 26.5833 216.119 28.0625C216.119 28.2708 216.036 28.4271 215.869 28.5312C215.702 28.6354 215.494 28.6875 215.244 28.6875C215.015 28.6875 214.786 28.6354 214.557 28.5312C214.348 28.4271 214.182 28.2708 214.057 28.0625L211.838 13.7188ZM243.32 17.25C243.237 17.25 243.112 17.2917 242.945 17.375C242.779 17.4375 242.602 17.5208 242.414 17.625C242.247 17.7083 242.081 17.7917 241.914 17.875C241.747 17.9583 241.602 18 241.477 18C241.268 18 241.081 17.9583 240.914 17.875C240.768 17.7917 240.695 17.625 240.695 17.375C240.695 17.1667 240.789 16.9688 240.977 16.7812C241.185 16.5938 241.425 16.4062 241.695 16.2188C241.966 16.0312 242.237 15.8542 242.508 15.6875C242.779 15.5208 242.977 15.3542 243.102 15.1875C243.06 14.8542 243.029 14.2292 243.008 13.3125C242.987 12.3958 242.987 11.3542 243.008 10.1875C243.05 9 243.122 7.78125 243.227 6.53125C243.352 5.28125 243.529 4.16667 243.758 3.1875C244.008 2.1875 244.331 1.40625 244.727 0.84375C245.122 0.28125 245.633 0.104167 246.258 0.3125C246.695 0.3125 247.091 0.447917 247.445 0.71875C247.8 0.96875 248.102 1.29167 248.352 1.6875C248.602 2.0625 248.789 2.47917 248.914 2.9375C249.06 3.39583 249.133 3.8125 249.133 4.1875C249.133 4.39583 249.081 4.625 248.977 4.875C248.893 5.10417 248.727 5.21875 248.477 5.21875H248.383C248.362 5.21875 248.341 5.20833 248.32 5.1875C247.82 3.91667 247.393 3.11458 247.039 2.78125C246.706 2.42708 246.414 2.41667 246.164 2.75C245.935 3.08333 245.737 3.67708 245.57 4.53125C245.425 5.38542 245.3 6.375 245.195 7.5C245.091 8.60417 244.997 9.78125 244.914 11.0312C244.831 12.2604 244.747 13.4062 244.664 14.4688C245.081 14.3646 245.425 14.2604 245.695 14.1562C245.987 14.0521 246.247 13.9479 246.477 13.8438C246.706 13.7188 246.914 13.6042 247.102 13.5C247.289 13.375 247.497 13.2708 247.727 13.1875C248.164 12.9792 248.643 12.7812 249.164 12.5938C249.706 12.3854 250.227 12.2812 250.727 12.2812C250.727 12.8854 250.612 13.3854 250.383 13.7812C250.175 14.1771 249.893 14.5 249.539 14.75C249.206 15 248.82 15.1875 248.383 15.3125C247.945 15.4167 247.497 15.5104 247.039 15.5938C246.602 15.6771 246.185 15.7604 245.789 15.8438C245.393 15.9271 245.05 16.0312 244.758 16.1562C244.82 17.5104 244.904 18.6979 245.008 19.7188C245.133 20.7396 245.237 21.6458 245.32 22.4375C245.425 23.2292 245.497 23.9583 245.539 24.625C245.602 25.2708 245.602 25.9167 245.539 26.5625C245.539 26.7083 245.539 26.9167 245.539 27.1875C245.56 27.4375 245.55 27.6875 245.508 27.9375C245.487 28.1875 245.414 28.4062 245.289 28.5938C245.164 28.7604 244.966 28.8438 244.695 28.8438C244.445 28.8438 244.258 28.7917 244.133 28.6875C244.008 28.5625 243.925 28.3229 243.883 27.9688C243.758 26.2812 243.654 24.8542 243.57 23.6875C243.508 22.5 243.456 21.5104 243.414 20.7188C243.372 19.9062 243.352 19.2708 243.352 18.8125V17.375C243.352 17.2917 243.341 17.25 243.32 17.25ZM253.78 22.0312C253.676 22.0521 253.52 22.0833 253.312 22.125C253.103 22.1667 252.885 22.1771 252.655 22.1562C252.426 22.1354 252.228 22.0729 252.062 21.9688C251.874 21.8646 251.78 21.6875 251.78 21.4375C251.78 21.2917 251.812 21.1875 251.874 21.125C251.937 21.0625 252.041 20.9688 252.187 20.8438C252.645 20.4688 253.03 19.9896 253.343 19.4062C253.676 18.8021 253.978 18.1667 254.249 17.5C254.52 16.8125 254.801 16.1354 255.093 15.4688C255.405 14.7812 255.76 14.1667 256.155 13.625C256.551 13.0833 257.041 12.6458 257.624 12.3125C258.207 11.9792 258.926 11.8229 259.78 11.8438C260.135 11.8438 260.53 11.9271 260.968 12.0938C261.405 12.2604 261.812 12.4896 262.187 12.7812C262.562 13.0521 262.874 13.3854 263.124 13.7812C263.374 14.1771 263.499 14.6146 263.499 15.0938C263.603 15.2604 263.499 15.5 263.187 15.8125C262.895 16.125 262.489 16.4688 261.968 16.8438C261.447 17.1979 260.853 17.5729 260.187 17.9688C259.541 18.3438 258.916 18.6979 258.312 19.0312C257.707 19.3646 257.176 19.6562 256.718 19.9062C256.26 20.1562 255.957 20.3438 255.812 20.4688C255.707 20.6771 255.624 20.9167 255.562 21.1875C255.499 21.4583 255.447 21.7188 255.405 21.9688C255.385 22.1979 255.364 22.4167 255.343 22.625C255.343 22.8125 255.343 22.9583 255.343 23.0625C255.343 23.4583 255.322 23.8958 255.28 24.375C255.26 24.8542 255.28 25.3125 255.343 25.75C255.426 26.1667 255.603 26.5208 255.874 26.8125C256.145 27.0833 256.603 27.2188 257.249 27.2188C257.937 27.2188 258.582 27.0521 259.187 26.7188C259.791 26.3646 260.353 25.9375 260.874 25.4375C261.395 24.9375 261.864 24.3958 262.28 23.8125C262.718 23.2292 263.103 22.6875 263.437 22.1875C263.791 21.6667 264.103 21.2396 264.374 20.9062C264.645 20.5729 264.874 20.4062 265.062 20.4062C265.27 20.4062 265.489 20.4479 265.718 20.5312C265.968 20.5938 266.093 20.7604 266.093 21.0312C266.093 21.4062 265.937 21.8542 265.624 22.375C265.332 22.8958 264.937 23.4479 264.437 24.0312C263.957 24.6146 263.395 25.1979 262.749 25.7812C262.124 26.3438 261.489 26.8542 260.843 27.3125C260.197 27.75 259.562 28.1146 258.937 28.4062C258.312 28.6771 257.76 28.8125 257.28 28.8125C256.343 28.8125 255.635 28.5833 255.155 28.125C254.676 27.6667 254.332 27.0938 254.124 26.4062C253.937 25.7188 253.832 24.9896 253.812 24.2188C253.812 23.4271 253.801 22.6979 253.78 22.0312ZM259.53 13.5938C259.176 13.5938 258.801 13.7708 258.405 14.125C258.01 14.4583 257.635 14.875 257.28 15.375C256.947 15.8542 256.666 16.3542 256.437 16.875C256.228 17.375 256.124 17.7917 256.124 18.125C256.437 18.125 256.885 18.0104 257.468 17.7812C258.072 17.5312 258.666 17.2292 259.249 16.875C259.832 16.5208 260.343 16.1458 260.78 15.75C261.218 15.3542 261.437 14.9792 261.437 14.625C261.437 14.4375 261.364 14.2812 261.218 14.1562C261.072 14.0312 260.895 13.9271 260.687 13.8438C260.499 13.7604 260.301 13.6979 260.093 13.6562C259.885 13.6146 259.697 13.5938 259.53 13.5938ZM269.522 22.0312C269.417 22.0521 269.261 22.0833 269.053 22.125C268.845 22.1667 268.626 22.1771 268.397 22.1562C268.167 22.1354 267.97 22.0729 267.803 21.9688C267.615 21.8646 267.522 21.6875 267.522 21.4375C267.522 21.2917 267.553 21.1875 267.615 21.125C267.678 21.0625 267.782 20.9688 267.928 20.8438C268.386 20.4688 268.772 19.9896 269.084 19.4062C269.417 18.8021 269.72 18.1667 269.99 17.5C270.261 16.8125 270.542 16.1354 270.834 15.4688C271.147 14.7812 271.501 14.1667 271.897 13.625C272.292 13.0833 272.782 12.6458 273.365 12.3125C273.949 11.9792 274.667 11.8229 275.522 11.8438C275.876 11.8438 276.272 11.9271 276.709 12.0938C277.147 12.2604 277.553 12.4896 277.928 12.7812C278.303 13.0521 278.615 13.3854 278.865 13.7812C279.115 14.1771 279.24 14.6146 279.24 15.0938C279.345 15.2604 279.24 15.5 278.928 15.8125C278.636 16.125 278.23 16.4688 277.709 16.8438C277.188 17.1979 276.595 17.5729 275.928 17.9688C275.282 18.3438 274.657 18.6979 274.053 19.0312C273.449 19.3646 272.917 19.6562 272.459 19.9062C272.001 20.1562 271.699 20.3438 271.553 20.4688C271.449 20.6771 271.365 20.9167 271.303 21.1875C271.24 21.4583 271.188 21.7188 271.147 21.9688C271.126 22.1979 271.105 22.4167 271.084 22.625C271.084 22.8125 271.084 22.9583 271.084 23.0625C271.084 23.4583 271.063 23.8958 271.022 24.375C271.001 24.8542 271.022 25.3125 271.084 25.75C271.167 26.1667 271.345 26.5208 271.615 26.8125C271.886 27.0833 272.345 27.2188 272.99 27.2188C273.678 27.2188 274.324 27.0521 274.928 26.7188C275.532 26.3646 276.095 25.9375 276.615 25.4375C277.136 24.9375 277.605 24.3958 278.022 23.8125C278.459 23.2292 278.845 22.6875 279.178 22.1875C279.532 21.6667 279.845 21.2396 280.115 20.9062C280.386 20.5729 280.615 20.4062 280.803 20.4062C281.011 20.4062 281.23 20.4479 281.459 20.5312C281.709 20.5938 281.834 20.7604 281.834 21.0312C281.834 21.4062 281.678 21.8542 281.365 22.375C281.074 22.8958 280.678 23.4479 280.178 24.0312C279.699 24.6146 279.136 25.1979 278.49 25.7812C277.865 26.3438 277.23 26.8542 276.584 27.3125C275.938 27.75 275.303 28.1146 274.678 28.4062C274.053 28.6771 273.501 28.8125 273.022 28.8125C272.084 28.8125 271.376 28.5833 270.897 28.125C270.417 27.6667 270.074 27.0938 269.865 26.4062C269.678 25.7188 269.574 24.9896 269.553 24.2188C269.553 23.4271 269.542 22.6979 269.522 22.0312ZM275.272 13.5938C274.917 13.5938 274.542 13.7708 274.147 14.125C273.751 14.4583 273.376 14.875 273.022 15.375C272.688 15.8542 272.407 16.3542 272.178 16.875C271.97 17.375 271.865 17.7917 271.865 18.125C272.178 18.125 272.626 18.0104 273.209 17.7812C273.813 17.5312 274.407 17.2292 274.99 16.875C275.574 16.5208 276.084 16.1458 276.522 15.75C276.959 15.3542 277.178 14.9792 277.178 14.625C277.178 14.4375 277.105 14.2812 276.959 14.1562C276.813 14.0312 276.636 13.9271 276.428 13.8438C276.24 13.7604 276.042 13.6979 275.834 13.6562C275.626 13.6146 275.438 13.5938 275.272 13.5938ZM291.2 23.0625C290.992 23.5417 290.721 24.0938 290.388 24.7188C290.075 25.3438 289.7 25.9375 289.263 26.5C288.846 27.0625 288.357 27.5417 287.794 27.9375C287.232 28.3333 286.607 28.5312 285.919 28.5312C285.607 28.5312 285.357 28.5 285.169 28.4375C285.002 28.3542 284.846 28.2396 284.7 28.0938C284.575 27.9479 284.45 27.7708 284.325 27.5625C284.221 27.3542 284.086 27.125 283.919 26.875C283.857 25.8542 283.815 24.7604 283.794 23.5938C283.794 22.4062 283.857 21.2292 283.982 20.0625C284.107 18.875 284.315 17.7604 284.607 16.7188C284.919 15.6771 285.346 14.7917 285.888 14.0625C286.45 13.3333 287.148 12.8125 287.982 12.5C288.815 12.1875 289.825 12.1667 291.013 12.4375C291.075 11.8542 291.086 11.0729 291.044 10.0938C291.002 9.11458 290.94 8.08333 290.857 7C290.773 5.91667 290.69 4.875 290.607 3.875C290.523 2.85417 290.471 2.02083 290.45 1.375C290.45 1.1875 290.534 1.05208 290.7 0.96875C290.888 0.864583 291.086 0.802083 291.294 0.78125C291.502 0.760417 291.7 0.760417 291.888 0.78125C292.096 0.802083 292.232 0.833333 292.294 0.875C292.252 3.4375 292.242 5.95833 292.263 8.4375C292.284 10.8958 292.305 13.3542 292.325 15.8125C292.367 18.25 292.409 20.6771 292.45 23.0938C292.492 25.5104 292.513 27.9271 292.513 30.3438C292.513 30.5729 292.492 30.8125 292.45 31.0625C292.43 31.3333 292.252 31.4688 291.919 31.4688C291.794 31.4688 291.669 31.4271 291.544 31.3438C291.419 31.2812 291.336 31.1771 291.294 31.0312L291.2 23.0625ZM289.857 14C289.211 13.9583 288.607 14.2188 288.044 14.7812C287.502 15.3229 287.023 16.0312 286.607 16.9062C286.211 17.7812 285.888 18.75 285.638 19.8125C285.388 20.8542 285.232 21.8646 285.169 22.8438C285.127 23.8021 285.19 24.6562 285.357 25.4062C285.544 26.1562 285.867 26.6667 286.325 26.9375C286.784 26.9375 287.211 26.7604 287.607 26.4062C288.002 26.0312 288.367 25.5625 288.7 25C289.034 24.4375 289.325 23.8125 289.575 23.125C289.825 22.4167 290.034 21.7396 290.2 21.0938C290.388 20.4479 290.523 19.8646 290.607 19.3438C290.711 18.8021 290.763 18.3958 290.763 18.125C290.763 17.9167 290.773 17.5833 290.794 17.125C290.815 16.6667 290.805 16.2083 290.763 15.75C290.721 15.2917 290.627 14.8854 290.482 14.5312C290.357 14.1771 290.148 14 289.857 14ZM295.942 28.5625C295.837 26.9167 295.796 25.1667 295.817 23.3125C295.858 21.4583 295.91 19.4583 295.973 17.3125C296.035 15.1667 296.087 12.8438 296.129 10.3438C296.192 7.82292 296.202 5.07292 296.16 2.09375C296.39 2.09375 296.629 2.08333 296.879 2.0625C297.129 2.02083 297.348 2.01042 297.535 2.03125C297.744 2.05208 297.91 2.11458 298.035 2.21875C298.181 2.32292 298.254 2.51042 298.254 2.78125C298.254 3.55208 298.223 4.44792 298.16 5.46875C298.119 6.46875 298.056 7.57292 297.973 8.78125C297.89 9.96875 297.817 11.25 297.754 12.625C297.712 14 297.692 15.4479 297.692 16.9688C298.421 16.0104 299.098 15.2292 299.723 14.625C300.348 14.0208 300.942 13.5417 301.504 13.1875C302.067 12.8125 302.619 12.5833 303.16 12.5C303.702 12.3958 304.233 12.3646 304.754 12.4062C305.358 12.4062 305.848 12.5729 306.223 12.9062C306.619 13.2396 306.921 13.6562 307.129 14.1562C307.337 14.6562 307.483 15.2188 307.567 15.8438C307.65 16.4479 307.692 17.0417 307.692 17.625C307.692 18.0417 307.66 18.4896 307.598 18.9688C307.556 19.4271 307.442 19.9375 307.254 20.5C307.067 21.0625 306.775 21.6458 306.379 22.25C306.004 22.8333 305.473 23.4583 304.785 24.125C304.098 24.7917 303.223 25.4792 302.16 26.1875C301.119 26.8958 299.848 27.625 298.348 28.375C297.848 28.5208 297.442 28.6146 297.129 28.6562C296.837 28.6771 296.598 28.6875 296.41 28.6875C296.244 28.6667 296.119 28.6458 296.035 28.625C295.973 28.6042 295.942 28.5833 295.942 28.5625ZM297.285 26.6875C297.39 26.625 297.671 26.4896 298.129 26.2812C298.587 26.0521 299.129 25.7604 299.754 25.4062C300.379 25.0521 301.056 24.625 301.785 24.125C302.515 23.625 303.181 23.0417 303.785 22.375C304.41 21.7083 304.942 20.9583 305.379 20.125C305.817 19.2917 306.077 18.375 306.16 17.375C306.16 17.0833 306.119 16.7708 306.035 16.4375C305.952 16.1042 305.817 15.7917 305.629 15.5C305.462 15.2083 305.244 14.9688 304.973 14.7812C304.702 14.5729 304.379 14.4688 304.004 14.4688C303.233 14.4688 302.504 14.6771 301.817 15.0938C301.15 15.5104 300.535 16.0312 299.973 16.6562C299.41 17.2812 298.91 17.9583 298.473 18.6875C298.035 19.3958 297.681 20.0521 297.41 20.6562L297.285 26.6875ZM319.433 27.9688C319.329 27.4271 319.235 26.7812 319.152 26.0312C319.089 25.2604 319.016 24.4896 318.933 23.7188C318.85 22.9271 318.745 22.1875 318.62 21.5C318.516 20.8125 318.35 20.25 318.12 19.8125C317.058 21.9792 316.12 23.6875 315.308 24.9375C314.495 26.1667 313.777 27.0521 313.152 27.5938C312.547 28.1146 312.037 28.3646 311.62 28.3438C311.204 28.3229 310.86 28.1354 310.589 27.7812C310.318 27.4271 310.12 26.9792 309.995 26.4375C309.891 25.875 309.818 25.3542 309.777 24.875C309.777 24.4167 309.881 23.7708 310.089 22.9375C310.297 22.1042 310.579 21.1979 310.933 20.2188C311.287 19.2188 311.704 18.2083 312.183 17.1875C312.683 16.1667 313.214 15.2396 313.777 14.4062C314.339 13.5729 314.922 12.8854 315.527 12.3438C316.131 11.8021 316.735 11.5312 317.339 11.5312C318.235 11.3854 318.891 11.5833 319.308 12.125C319.745 12.6458 319.829 13.5312 319.558 14.7812C319.558 16.1562 319.61 17.3333 319.714 18.3125C319.839 19.2917 319.964 20.2292 320.089 21.125C320.235 22.0208 320.36 22.9583 320.464 23.9375C320.589 24.9167 320.652 26.0938 320.652 27.4688C320.652 27.7188 320.62 27.9375 320.558 28.125C320.516 28.2917 320.266 28.375 319.808 28.375C319.745 28.375 319.662 28.3229 319.558 28.2188C319.475 28.1146 319.433 28.0312 319.433 27.9688ZM317.745 14C317.516 13.6667 317.204 13.6354 316.808 13.9062C316.412 14.1771 315.995 14.625 315.558 15.25C315.12 15.875 314.672 16.625 314.214 17.5C313.756 18.375 313.329 19.2604 312.933 20.1562C312.537 21.0521 312.193 21.9062 311.902 22.7188C311.61 23.5104 311.412 24.1667 311.308 24.6875C311.308 25.4375 311.422 25.8646 311.652 25.9688C311.881 26.0521 312.162 25.9271 312.495 25.5938C312.829 25.2604 313.204 24.7812 313.62 24.1562C314.058 23.5312 314.475 22.8646 314.87 22.1562C315.287 21.4479 315.672 20.7604 316.027 20.0938C316.402 19.4271 316.693 18.8854 316.902 18.4688C317.089 18.0312 317.235 17.625 317.339 17.25C317.443 16.875 317.527 16.5208 317.589 16.1875C317.672 15.8333 317.714 15.4792 317.714 15.125C317.735 14.7708 317.745 14.3958 317.745 14ZM323.237 21.5938C323.299 20.8438 323.362 20.0312 323.424 19.1562C323.487 18.2604 323.58 17.375 323.705 16.5C323.851 15.625 324.028 14.7917 324.237 14C324.466 13.2083 324.757 12.5104 325.112 11.9062C325.487 11.2812 325.945 10.7917 326.487 10.4375C327.028 10.0625 327.685 9.88542 328.455 9.90625C328.976 9.90625 329.372 10.125 329.643 10.5625C329.935 11 330.132 11.5312 330.237 12.1562C330.362 12.7812 330.424 13.4271 330.424 14.0938C330.445 14.7396 330.455 15.2708 330.455 15.6875C330.039 15.6875 329.695 15.5104 329.424 15.1562C329.153 14.7812 328.945 14.3542 328.799 13.875C328.653 13.3958 328.549 12.9271 328.487 12.4688L328.393 11.5625C328.372 11.5625 328.33 11.5625 328.268 11.5625C328.226 11.5417 328.195 11.5312 328.174 11.5312C327.82 11.5312 327.487 11.7292 327.174 12.125C326.882 12.5208 326.601 13.0312 326.33 13.6562C326.08 14.2604 325.862 14.9479 325.674 15.7188C325.487 16.4688 325.33 17.2083 325.205 17.9375C325.08 18.6667 324.976 19.3438 324.893 19.9688C324.83 20.5729 324.799 21.0417 324.799 21.375C324.757 21.9167 324.757 22.5104 324.799 23.1562C324.841 23.8021 324.966 24.4062 325.174 24.9688C325.382 25.5312 325.674 26.0208 326.049 26.4375C326.424 26.8333 326.924 27.1042 327.549 27.25C328.32 27.25 328.945 27.1458 329.424 26.9375C329.903 26.7292 330.289 26.4479 330.58 26.0938C330.893 25.7396 331.132 25.3438 331.299 24.9062C331.466 24.4688 331.622 24.0208 331.768 23.5625C331.935 23.0833 332.101 22.6146 332.268 22.1562C332.435 21.6979 332.674 21.2708 332.987 20.875C333.237 20.8125 333.414 20.8229 333.518 20.9062C333.643 20.9688 333.726 21.0625 333.768 21.1875C333.81 21.3125 333.83 21.4583 333.83 21.625V21.9688C333.83 22.8438 333.685 23.6875 333.393 24.5C333.101 25.3125 332.674 26.0417 332.112 26.6875C331.549 27.3125 330.872 27.8229 330.08 28.2188C329.31 28.5938 328.424 28.7812 327.424 28.7812C326.591 28.7812 325.893 28.5208 325.33 28C324.789 27.4583 324.362 26.8125 324.049 26.0625C323.757 25.3125 323.549 24.5312 323.424 23.7188C323.299 22.8854 323.237 22.1771 323.237 21.5938ZM337.603 4.78125C338.04 4.36458 338.384 4.19792 338.634 4.28125C338.905 4.36458 339.103 4.64583 339.228 5.125C339.353 5.60417 339.426 6.22917 339.447 7C339.467 7.77083 339.457 8.64583 339.415 9.625C339.395 10.5833 339.342 11.6042 339.259 12.6875C339.176 13.75 339.103 14.8021 339.04 15.8438C338.978 16.8646 338.936 17.8438 338.915 18.7812C338.895 19.7188 338.926 20.5312 339.009 21.2188H339.103C339.145 21.2188 339.176 21.2083 339.197 21.1875C340.28 20.1042 341.249 18.9583 342.103 17.75C342.957 16.5417 343.728 15.4062 344.415 14.3438C345.103 13.2604 345.707 12.3229 346.228 11.5312C346.77 10.7396 347.27 10.1979 347.728 9.90625C348.04 9.90625 348.301 9.95833 348.509 10.0625C348.738 10.1667 348.853 10.4062 348.853 10.7812C348.853 10.8229 348.842 10.8958 348.822 11C348.822 11.0833 348.822 11.1458 348.822 11.1875C348.301 12.25 347.728 13.3229 347.103 14.4062C346.478 15.4688 345.801 16.5 345.072 17.5C344.342 18.5 343.551 19.4479 342.697 20.3438C341.863 21.2396 340.957 22.0521 339.978 22.7812C339.978 22.8021 339.967 22.8438 339.947 22.9062C339.947 22.9479 339.947 22.9792 339.947 23C339.947 23.2083 340.113 23.4375 340.447 23.6875C340.801 23.9375 341.238 24.1771 341.759 24.4062C342.301 24.6354 342.895 24.8646 343.54 25.0938C344.207 25.3229 344.853 25.5208 345.478 25.6875C346.124 25.8542 346.717 25.9896 347.259 26.0938C347.822 26.1979 348.259 26.25 348.572 26.25C348.572 26.3333 348.572 26.4896 348.572 26.7188C348.592 26.9479 348.582 27.1875 348.54 27.4375C348.499 27.6875 348.426 27.9167 348.322 28.125C348.217 28.3125 348.051 28.4062 347.822 28.4062H347.697C347.655 28.4062 347.624 28.3958 347.603 28.375L338.665 24.7812C338.645 26.0104 338.561 27.0104 338.415 27.7812C338.27 28.5312 338.092 29.0833 337.884 29.4375C337.697 29.8125 337.488 29.9896 337.259 29.9688C337.051 29.9479 336.863 29.7812 336.697 29.4688L337.603 4.78125Z" fill="black" />
              <path d="M149.661 62.778C154.427 123.114 55.3778 209.279 0.999932 209.277" stroke="#1C1C1C" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </span>
        ) : null}
        {section.annotationText ? (
          <span className="dw-case-testimonial-annotation dw-case-annotation-generic" aria-hidden="true">
            <span className="dw-case-annotation-text">{section.annotationText}</span>
            <svg className="dw-case-annotation-arrow" viewBox="0 0 156 150" fill="none">
              <path d="M149.661 1.778C154.427 62.114 55.3778 148.279 0.999932 148.277" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        ) : null}
        <blockquote>{section.quote}</blockquote>
        {person ? (
          <div className="dw-case-testimonial-person">
            <span className="dw-case-testimonial-person-link">
              <span className="dw-case-avatar"><ProjectImage project={project} assetKey={section.avatar} /></span>
              <span><strong>{person.name}</strong><small>{person.role}</small></span>
            </span>
            {section.showLinkedin ? (
              person.url ? (
                <a className="dw-case-testimonial-linkedin" href={person.url} target="_blank" rel="noreferrer" aria-label={`${person.name} on LinkedIn`}>
                  <svg viewBox="0 0 95 95" fill="none" aria-hidden="true"><path d="M81.027 7.91657H13.9728C13.2191 7.9061 12.4706 8.04422 11.7703 8.32303C11.0699 8.60184 10.4313 9.01588 9.89096 9.54151C9.35062 10.0671 8.91913 10.6941 8.6211 11.3865C8.32308 12.0789 8.16438 12.8232 8.15405 13.577V81.4228C8.16438 82.1766 8.32308 82.9209 8.6211 83.6133C8.91913 84.3057 9.35062 84.9327 9.89096 85.4583C10.4313 85.9839 11.0699 86.398 11.7703 86.6768C12.4706 86.9556 13.2191 87.0937 13.9728 87.0832H81.027C81.7807 87.0937 82.5292 86.9556 83.2295 86.6768C83.9299 86.398 84.5685 85.9839 85.1088 85.4583C85.6491 84.9327 86.0807 84.3057 86.3787 83.6133C86.6767 82.9209 86.8354 82.1766 86.8457 81.4228V13.577C86.8354 12.8232 86.6767 12.0789 86.3787 11.3865C86.0807 10.6941 85.6491 10.0671 85.1088 9.54151C84.5685 9.01588 83.9299 8.60184 83.2295 8.32303C82.5292 8.04422 81.7807 7.9061 81.027 7.91657V7.91657ZM32.0228 74.1791H20.1478V38.5541H32.0228V74.1791ZM26.0853 33.5666C24.4476 33.5666 22.877 32.916 21.7189 31.758C20.5609 30.5999 19.9103 29.0293 19.9103 27.3916C19.9103 25.7539 20.5609 24.1832 21.7189 23.0252C22.877 21.8671 24.4476 21.2166 26.0853 21.2166C26.9549 21.1179 27.8356 21.2041 28.6696 21.4694C29.5036 21.7348 30.2722 22.1733 30.925 22.7562C31.5778 23.3392 32.1001 24.0534 32.4577 24.8522C32.8153 25.651 33.0002 26.5164 33.0002 27.3916C33.0002 28.2668 32.8153 29.1321 32.4577 29.9309C32.1001 30.7297 31.5778 31.444 30.925 32.0269C30.2722 32.6099 29.5036 33.0484 28.6696 33.3137C27.8356 33.579 26.9549 33.6652 26.0853 33.5666V33.5666ZM74.852 74.1791H62.977V55.0603C62.977 50.2707 61.2749 47.1437 56.9603 47.1437C55.625 47.1534 54.3248 47.5723 53.2349 48.3437C52.1449 49.1152 51.3176 50.2022 50.8645 51.4582C50.5547 52.3886 50.4205 53.3684 50.4686 54.3478V74.1395H38.5936C38.5936 74.1395 38.5936 41.7603 38.5936 38.5145H50.4686V43.5416C51.5474 41.6697 53.1164 40.1276 55.0066 39.0813C56.8969 38.0351 59.0367 37.5243 61.1957 37.6041C69.1124 37.6041 74.852 42.7103 74.852 53.6749V74.1791Z" fill="#5849E0" /></svg>
                </a>
              ) : (
                <span className="dw-case-testimonial-linkedin" aria-hidden="true">
                  <svg viewBox="0 0 95 95" fill="none" aria-hidden="true"><path d="M81.027 7.91657H13.9728C13.2191 7.9061 12.4706 8.04422 11.7703 8.32303C11.0699 8.60184 10.4313 9.01588 9.89096 9.54151C9.35062 10.0671 8.91913 10.6941 8.6211 11.3865C8.32308 12.0789 8.16438 12.8232 8.15405 13.577V81.4228C8.16438 82.1766 8.32308 82.9209 8.6211 83.6133C8.91913 84.3057 9.35062 84.9327 9.89096 85.4583C10.4313 85.9839 11.0699 86.398 11.7703 86.6768C12.4706 86.9556 13.2191 87.0937 13.9728 87.0832H81.027C81.7807 87.0937 82.5292 86.9556 83.2295 86.6768C83.9299 86.398 84.5685 85.9839 85.1088 85.4583C85.6491 84.9327 86.0807 84.3057 86.3787 83.6133C86.6767 82.9209 86.8354 82.1766 86.8457 81.4228V13.577C86.8354 12.8232 86.6767 12.0789 86.3787 11.3865C86.0807 10.6941 85.6491 10.0671 85.1088 9.54151C84.5685 9.01588 83.9299 8.60184 83.2295 8.32303C82.5292 8.04422 81.7807 7.9061 81.027 7.91657V7.91657ZM32.0228 74.1791H20.1478V38.5541H32.0228V74.1791ZM26.0853 33.5666C24.4476 33.5666 22.877 32.916 21.7189 31.758C20.5609 30.5999 19.9103 29.0293 19.9103 27.3916C19.9103 25.7539 20.5609 24.1832 21.7189 23.0252C22.877 21.8671 24.4476 21.2166 26.0853 21.2166C26.9549 21.1179 27.8356 21.2041 28.6696 21.4694C29.5036 21.7348 30.2722 22.1733 30.925 22.7562C31.5778 23.3392 32.1001 24.0534 32.4577 24.8522C32.8153 25.651 33.0002 26.5164 33.0002 27.3916C33.0002 28.2668 32.8153 29.1321 32.4577 29.9309C32.1001 30.7297 31.5778 31.444 30.925 32.0269C30.2722 32.6099 29.5036 33.0484 28.6696 33.3137C27.8356 33.579 26.9549 33.6652 26.0853 33.5666V33.5666ZM74.852 74.1791H62.977V55.0603C62.977 50.2707 61.2749 47.1437 56.9603 47.1437C55.625 47.1534 54.3248 47.5723 53.2349 48.3437C52.1449 49.1152 51.3176 50.2022 50.8645 51.4582C50.5547 52.3886 50.4205 53.3684 50.4686 54.3478V74.1395H38.5936C38.5936 74.1395 38.5936 41.7603 38.5936 38.5145H50.4686V43.5416C51.5474 41.6697 53.1164 40.1276 55.0066 39.0813C56.8969 38.0351 59.0367 37.5243 61.1957 37.6041C69.1124 37.6041 74.852 42.7103 74.852 53.6749V74.1791Z" fill="#5849E0" /></svg>
                </span>
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function NavigationSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const items = section.items?.filter((item): item is Exclude<typeof item, string> => typeof item !== "string") || [];
  return (
    <section className="dw-case-navigation" style={sectionStyle(project, section)} id={section.id}>
      <div data-portfolio-reveal>
        <a className="dw-case-back" href={portfolioHref()} target={isStorybook() ? "_parent" : undefined}>Back to work</a>
        <h2>{section.title || "More selected work"}</h2>
        <div className="dw-case-next-list">
          {items.map((item, index) => {
            const slug = projectSlugFromLegacyUrl(item.url);
            return (
              <a href={projectHref(slug)} target={isStorybook() ? "_parent" : undefined} key={`${item.label}-${index}`}>
                <span>{item.label}</span><span>↗</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  if (project.project.slug === "material-exchange" && section.id === "intro") {
    return <MaterialExchangeIntro project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "discovery-problem-one") {
    return <MaterialExchangeDiscovery project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "discovery-problem-two") {
    return <MaterialExchangeProblemTwo project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "user-research") {
    return <MaterialExchangeResearch project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "navigation-anatomy-heading") {
    return <MaterialExchangeNavigation project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "visual-language-heading") {
    return <MaterialExchangeVisualLanguage project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "iconography-heading") {
    return <MaterialExchangeIconography project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "design-system-intro") {
    return <MaterialExchangeDesignSystem project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "ideation") {
    return <MaterialExchangeIdeation project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "personalized-approach") {
    return <MaterialExchangePersonalized project={project} section={section} />;
  }
  if (project.project.slug === "material-exchange" && section.id === "testing-heading") {
    return <MaterialExchangeTesting project={project} section={section} />;
  }
  if (
    project.project.slug === "material-exchange" &&
    [
      "about", "warehouse", "deadstock", "user-research-findings", "iterative-research", "personas",
      "platform-users-heading", "platform-users", "navigation-anatomy", "visual-language",
      "iconography", "design-system-map", "design-system-showcase", "initial-wireframes",
      "ideation-matrix", "hmw-statements", "hmw-columns", "personalized-dashboard", "smart-search",
      "product-collage", "hypothesis-one", "dropzone-solution", "dropzone", "dropzone-result",
      "hypothesis-two", "save-search-solution", "save-search"
    ].includes(section.id)
  ) {
    return null;
  }
  if (project.project.slug === "hotel-apartments" && section.id === "intro") {
    return <HotelIntro project={project} section={section} />;
  }
  if (project.project.slug === "hotel-apartments" && section.id === "project") {
    return <HotelProject project={project} section={section} />;
  }
  if (project.project.slug === "hotel-apartments" && section.id === "migration") {
    return <HotelMigration section={section} />;
  }
  if (project.project.slug === "hotel-apartments" && section.id === "migration-visual") {
    return <HotelMigrationVisual project={project} section={section} />;
  }
  if (project.project.slug === "hotel-apartments" && section.id === "walking-copy") {
    return <HotelWalking project={project} section={section} />;
  }
  if (project.project.slug === "hotel-apartments" && section.id === "brand") {
    return <HotelBrand project={project} section={section} />;
  }
  if (
    project.project.slug === "hotel-apartments" &&
    ["walking-visual", "brand-foundation", "client-preference", "brand-details", "brand-applications", "brand-collage"].includes(section.id)
  ) {
    return null;
  }
  if (project.project.slug === "hotel-apartments" && section.id === "web-design-heading") {
    return <HotelWebDesign project={project} section={section} />;
  }
  if (project.project.slug === "hotel-apartments" && ["web-overview", "web-screens"].includes(section.id)) {
    return null;
  }
  if (project.project.slug === "hotel-apartments" && section.id === "feedback") {
    return <HotelFeedback project={project} section={section} />;
  }
  if (project.project.slug === "cloudchipr" && section.id === "field-study") {
    return <CloudChiprFieldStudy project={project} section={section} />;
  }
  if (
    project.project.slug === "cloudchipr" &&
    ["field-study-gallery", "aws-learning", "aws-course", "stakeholder-interviews", "sre-quote"].includes(section.id)
  ) {
    return null;
  }
  if (project.project.slug === "cloudchipr" && section.id === "how-it-started") {
    return <CloudChiprHowItStarted section={section} />;
  }
  if (project.project.slug === "cloudchipr" && section.id === "concept-selection") {
    return <CloudChiprConceptSelection project={project} section={section} />;
  }
  if (
    project.project.slug === "cloudchipr" &&
    (section.id === "concept-options" || section.id === "concept-rejected-variants")
  ) {
    return null;
  }
  if (project.project.slug === "cloudchipr" && section.id === "identity-mockup") {
    return <CloudChiprBrandItems project={project} section={section} />;
  }
  if (project.project.slug === "cloudchipr" && section.id === "problem") {
    return <CloudChiprProblem project={project} section={section} />;
  }
  if (project.project.slug === "cloudchipr" && section.id === "problem-discovered") {
    return null;
  }
  if (project.project.slug === "cloudchipr" && section.id === "competitor-analysis") {
    return <CloudChiprCompetitorAnalysis section={section} />;
  }
  if (
    project.project.slug === "cloudchipr" &&
    ["competitor-roi-visual", "competitor-map-visual"].includes(section.id)
  ) {
    return null;
  }
  if (project.project.slug === "cloudchipr" && section.id === "design-system-decision") {
    return <CloudChiprDesignSystemDecision project={project} section={section} />;
  }
  if (project.project.slug === "cloudchipr" && section.id === "design-system-visuals") {
    return <CloudChiprDesignSystemVisuals project={project} section={section} />;
  }
  if (project.project.slug === "cloudchipr" && section.id === "overall-achievements") {
    return <CloudChiprOverallAchievements section={section} />;
  }
  if (project.project.slug === "cloudchipr" && section.id === "feedback") {
    return <CloudChiprFeedback project={project} section={section} />;
  }
  if (project.project.slug === "securion" && section.id === "brand-identity") {
    return <SecurionBrandIdentity project={project} section={section} />;
  }
  if (project.project.slug === "securion" && section.id === "logo-construction") {
    return null;
  }
  if (project.project.slug === "securion" && section.id === "simple-laws") {
    return <SecurionLogoLaws project={project} section={section} />;
  }
  if (project.project.slug === "securion" && section.id === "logo-strip") {
    return <SecurionScaleStrip section={section} />;
  }
  if (project.project.slug === "securion" && section.id === "identity-mockup") {
    return (
      <section className={sectionClass(section, "dw-securion-mockups")} style={sectionStyle(project, section)} id={section.id}>
        <div className="dw-securion-brand-pair" data-portfolio-reveal aria-label="Securion brand application examples">
          <img src="/portfolio-assets/securion/brand-lanyard.png" alt="Securion lanyard and access badge" />
          <img src="/portfolio-assets/securion/brand-hoodie.png" alt="Securion hoodie application" />
        </div>
        <figure className="dw-case-media" data-portfolio-reveal data-portfolio-parallax>
          <ProjectImage project={project} assetKey={section.asset} />
        </figure>
      </section>
    );
  }
  if (project.project.slug === "securion" && section.id === "color-theory") {
    return <SecurionColorTheory section={section} />;
  }
  if (project.project.slug === "securion" && section.id === "color-system") {
    return null;
  }

  if (section.type === "about-card") return <AboutCardSection project={project} section={section} />;
  if (section.type === "intro") return <IntroSection project={project} section={section} />;
  if (section.type === "prose") return <ProseSection project={project} section={section} />;
  if (section.type === "media") return <MediaSection project={project} section={section} />;
  if (section.type === "gallery") return <GallerySection project={project} section={section} />;
  if (section.type === "split") return <SplitSection project={project} section={section} />;
  if (section.type === "feature-grid") return <FeatureGridSection project={project} section={section} />;
  if (section.type === "chips") return <ChipsSection project={project} section={section} />;
  if (section.type === "metrics") return <MetricsSection project={project} section={section} />;
  if (section.type === "testimonial") return <TestimonialSection project={project} section={section} />;
  if (section.type === "navigation") return <NavigationSection project={project} section={section} />;
  return null;
}

function usePortfolioMotion(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      if (container.classList.contains("dw-case-study")) {
        const textSelector = [
          ".dw-case-intro-heading > *",
          ".dw-case-meta dt",
          ".dw-case-meta dd",
          ".dw-case-prose > .dw-case-eyebrow",
          ".dw-case-prose > h2",
          ".dw-case-prose > .dw-case-richtext",
          ".dw-case-project-details > div",
          ".dw-case-split h2",
          ".dw-case-split .dw-case-richtext",
          ".dw-case-feature-grid article",
          ".dw-case-chips span",
          ".dw-case-metrics h2",
          ".dw-case-metrics article",
          ".dw-case-testimonial > *",
          ".dw-cloudchipr-problem-heading > *",
          ".dw-cloudchipr-problem-lead",
          ".dw-cloudchipr-problem-list > li",
          ".dw-cloudchipr-problem-conclusion",
          ".dw-case-back",
          ".dw-case-navigation h2",
          ".dw-case-next-list a"
        ].join(",");
        const mediaSelector = [
          ".dw-case-intro-media",
          ".dw-case-media",
          ".dw-case-gallery figure",
          ".dw-case-split article > img"
        ].join(",");

        gsap.utils.toArray<HTMLElement>(".dw-case-intro, .dw-case-section, .dw-case-navigation").forEach((section) => {
          const textTargets = Array.from(section.querySelectorAll<HTMLElement>(textSelector));
          const mediaTargets = Array.from(section.querySelectorAll<HTMLElement>(mediaSelector));

          if (textTargets.length) {
            gsap.fromTo(textTargets, {
              autoAlpha: 0,
              y: 32,
              filter: "blur(10px)"
            }, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.9,
              delay: 0.08,
              stagger: 0.045,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 88%",
                toggleActions: "play none none reverse"
              }
            });

            gsap.fromTo(textTargets, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)"
            }, {
              autoAlpha: 0.08,
              y: -18,
              filter: "blur(9px)",
              stagger: 0.018,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: "bottom 24%",
                end: "bottom top",
                scrub: 0.65,
                invalidateOnRefresh: true
              }
            });
          }

          if (mediaTargets.length) {
            gsap.fromTo(mediaTargets, {
              autoAlpha: 0.25,
              y: 24,
              scale: 1.012,
              filter: "blur(3px)"
            }, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1.05,
              delay: 0.16,
              stagger: 0.04,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 90%",
                toggleActions: "play none none reverse"
              }
            });

            gsap.fromTo(mediaTargets, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)"
            }, {
              autoAlpha: 0.34,
              y: -10,
              filter: "blur(2px)",
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: section,
                start: "bottom 18%",
                end: "bottom top",
                scrub: 0.7,
                invalidateOnRefresh: true
              }
            });
          }
        });

        const construction = container.querySelector<HTMLElement>("[data-cloudchipr-construction]");
        if (construction) {
          const guides = construction.querySelectorAll<HTMLElement>(".dw-construction-guide, .dw-construction-centerline");
          const blueprint = construction.querySelectorAll<SVGGeometryElement>(".dw-construction-glyph-blueprint circle, .dw-construction-glyph-blueprint path");
          const rings = construction.querySelectorAll<HTMLElement>(".dw-construction-ring");
          const letters = construction.querySelectorAll<HTMLElement>(".dw-construction-wordmark > span");
          const strapline = construction.querySelector<HTMLElement>(".dw-construction-strapline");
          const labels = construction.querySelectorAll<HTMLElement>(".dw-construction-label");
          const circles = construction.querySelectorAll<HTMLElement>(".dw-construction-callout-circle");
          const lines = construction.querySelectorAll<HTMLElement>(".dw-construction-callout-line");
          const calloutCopy = construction.querySelectorAll<HTMLElement>(".dw-construction-callout-copy");

          gsap.set(construction, { autoAlpha: 0.35, scale: 0.985 });
          gsap.set(guides, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          blueprint.forEach((item) => {
            const length = item.getTotalLength();
            gsap.set(item, { strokeDasharray: length, strokeDashoffset: length, autoAlpha: 0 });
          });
          gsap.set(rings, { autoAlpha: 0, scale: 0.72, transformOrigin: "center" });
          gsap.set(letters, { autoAlpha: 0, y: 34, filter: "blur(8px)" });
          gsap.set(strapline, { autoAlpha: 0, y: 22, filter: "blur(6px)" });
          gsap.set(labels, { autoAlpha: 0, y: 14 });
          gsap.set(circles, { autoAlpha: 0, scale: 0, transformOrigin: "center" });
          gsap.set(lines, { autoAlpha: 0, scaleX: 0, transformOrigin: "left center" });
          gsap.set(calloutCopy, { autoAlpha: 0, y: 10 });

          gsap.timeline({
            scrollTrigger: {
              trigger: construction,
              start: "top 84%",
              end: "bottom 34%",
              scrub: 0.85,
              invalidateOnRefresh: true
            }
          })
            .to(construction, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 0)
            .to(guides, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", stagger: 0.08, duration: 0.85, ease: "power2.out" }, 0.08)
            .to(blueprint, { autoAlpha: 0.62, strokeDashoffset: 0, stagger: 0.07, duration: 0.65, ease: "power1.inOut" }, 0.3)
            .to(labels, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.5, ease: "power2.out" }, 0.5)
            .to(circles, { autoAlpha: 1, scale: 1, stagger: 0.12, duration: 0.62, ease: "back.out(1.35)" }, 0.64)
            .to(lines, { autoAlpha: 1, scaleX: 1, stagger: 0.12, duration: 0.58, ease: "power2.out" }, 0.72)
            .to(calloutCopy, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 0.45, ease: "power2.out" }, 0.88)
            .to(rings, { autoAlpha: 1, scale: 1, stagger: 0.1, duration: 0.72, ease: "back.out(1.2)" }, 1.02)
            .to(letters, { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.04, duration: 0.68, ease: "power3.out" }, 1.14)
            .to(strapline, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.62, ease: "power3.out" }, 1.48)
            .to(blueprint, { autoAlpha: 0.24, duration: 0.4, ease: "power1.out" }, 1.5);
        }

        const concepts = container.querySelector<HTMLElement>("[data-cloudchipr-concepts]");
        if (concepts) {
          const title = concepts.querySelector<HTMLElement>(".dw-cloudchipr-concepts-copy h2");
          const intro = concepts.querySelector<HTMLElement>(".dw-cloudchipr-concepts-intro");
          const favorite = concepts.querySelector<HTMLElement>(".dw-cloudchipr-concept-favorite");
          const selected = concepts.querySelector<HTMLElement>(".dw-cloudchipr-concept-selected");
          const favoriteNote = concepts.querySelector<HTMLElement>(".dw-cloudchipr-concept-favorite figcaption");
          const selectedNote = concepts.querySelector<HTMLElement>(".dw-cloudchipr-concept-selected figcaption");
          const arrows = concepts.querySelectorAll<SVGElement>(".dw-cloudchipr-concept-arrow");
          const rejected = concepts.querySelector<HTMLElement>(".dw-cloudchipr-rejected");

          gsap.set([title, intro], { autoAlpha: 0, y: 28, filter: "blur(8px)" });
          gsap.set(favorite, { autoAlpha: 0, x: -64, y: 28, scale: 0.88, filter: "blur(5px)" });
          gsap.set(selected, { autoAlpha: 0, x: 64, y: 28, scale: 0.88, filter: "blur(5px)" });
          gsap.set([favoriteNote, selectedNote], { autoAlpha: 0, y: 16 });
          gsap.set(arrows, { autoAlpha: 0, scale: 0.5 });
          gsap.set(rejected, { autoAlpha: 0, y: 26, filter: "blur(4px)" });

          gsap.timeline({
            scrollTrigger: {
              trigger: concepts,
              start: "top 82%",
              end: "top 18%",
              scrub: 0.9,
              invalidateOnRefresh: true
            }
          })
            .to(title, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, 0)
            .to(intro, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, 0.18)
            .to(favorite, { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: 0.85, ease: "power3.out" }, 0.48)
            .to([favoriteNote, arrows[0]], { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, 0.88)
            .to(selected, { autoAlpha: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)", duration: 0.85, ease: "power3.out" }, 0.98)
            .to([selectedNote, arrows[1]], { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out" }, 1.34)
            .to(rejected, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.72, ease: "power3.out" }, 1.52);
        }

        const brandItems = container.querySelector<HTMLElement>("[data-cloudchipr-brand-items]");
        if (brandItems) {
          const stage = brandItems.querySelector<HTMLElement>(".dw-cloudchipr-brand-items-stage");
          const badge = brandItems.querySelector<HTMLElement>(".dw-cloudchipr-brand-layer-badge");
          const details = brandItems.querySelector<HTMLElement>(".dw-cloudchipr-brand-layer-details");

          gsap.set(stage, { autoAlpha: 0.35, scale: 0.985, filter: "blur(4px)" });
          gsap.set(badge, { autoAlpha: 0, xPercent: -34, yPercent: 18, rotation: -8, scale: 0.82 });
          gsap.set(details, { autoAlpha: 0, xPercent: 30, yPercent: -22, rotation: 8, scale: 0.84 });

          gsap.timeline({
            scrollTrigger: {
              trigger: brandItems,
              start: "top 90%",
              end: "center 52%",
              scrub: 0.85,
              invalidateOnRefresh: true
            }
          })
            .to(stage, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "power2.out" }, 0)
            .to(badge, { autoAlpha: 1, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, duration: 1, ease: "power3.out" }, 0.05)
            .to(details, { autoAlpha: 1, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, duration: 1, ease: "power3.out" }, 0.24);

          gsap.to(badge?.querySelector("img"), {
            yPercent: -5,
            ease: "none",
            scrollTrigger: { trigger: brandItems, start: "top bottom", end: "bottom top", scrub: 0.8 }
          });
          gsap.to(details?.querySelector("img"), {
            yPercent: 4,
            ease: "none",
            scrollTrigger: { trigger: brandItems, start: "top bottom", end: "bottom top", scrub: 0.8 }
          });
        }

        const howItStarted = container.querySelector<HTMLElement>("[data-cloudchipr-started]");
        if (howItStarted) {
          const title = howItStarted.querySelector<HTMLElement>("h2");
          const paragraphs = howItStarted.querySelectorAll<HTMLElement>(".dw-cloudchipr-started-copy p");
          const processFill = howItStarted.querySelector<HTMLElement>(".dw-cloudchipr-process-fill");
          const steps = howItStarted.querySelectorAll<HTMLElement>(".dw-cloudchipr-process li");
          const nodes = howItStarted.querySelectorAll<HTMLElement>(".dw-cloudchipr-process-node");

          gsap.set(title, { autoAlpha: 0, y: 26, filter: "blur(8px)" });
          gsap.set(paragraphs, { autoAlpha: 0, y: 24, filter: "blur(7px)" });
          gsap.set(processFill, { scaleY: 0, transformOrigin: "top center" });
          gsap.set(steps, { autoAlpha: 0.2, x: 18 });
          gsap.set(nodes, { scale: 0.45, transformOrigin: "center" });

          const startedTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: howItStarted,
              start: "top 84%",
              end: "bottom 42%",
              scrub: 0.9,
              invalidateOnRefresh: true
            }
          });

          startedTimeline
            .to(title, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.55, ease: "power3.out" }, 0)
            .to(paragraphs, { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.18, duration: 0.72, ease: "power3.out" }, 0.18)
            .to(processFill, { scaleY: 1, duration: 1.45, ease: "none" }, 0.72);

          steps.forEach((step, index) => {
            startedTimeline
              .to(step, { autoAlpha: 1, x: 0, duration: 0.48, ease: "power2.out" }, 0.78 + index * 0.36)
              .to(nodes[index], { scale: 1, duration: 0.4, ease: "back.out(1.6)" }, 0.82 + index * 0.36);
          });
        }

        const fieldStudy = container.querySelector<HTMLElement>("[data-cloudchipr-field-study]");
        if (fieldStudy) {
          const heading = fieldStudy.querySelectorAll<HTMLElement>(".dw-cloudchipr-field-study-heading > *");
          const steps = fieldStudy.querySelectorAll<HTMLElement>(".dw-cloudchipr-field-step");

          gsap.fromTo(heading, {
            autoAlpha: 0,
            y: 28,
            filter: "blur(8px)"
          }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.14,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: fieldStudy,
              start: "top 84%",
              toggleActions: "play none none reverse"
            }
          });

          steps.forEach((fieldStep) => {
            const number = fieldStep.querySelector<HTMLElement>(".dw-cloudchipr-field-step-number");
            const copy = fieldStep.querySelector<HTMLElement>(".dw-cloudchipr-field-step-copy > div");
            const media = fieldStep.querySelector<HTMLElement>(".dw-cloudchipr-field-media");
            const reports = fieldStep.querySelectorAll<HTMLElement>(".dw-cloudchipr-report");
            const caption = fieldStep.querySelector<HTMLElement>(".dw-cloudchipr-field-caption");

            const stepTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: fieldStep,
                start: "top 82%",
                end: "top 34%",
                scrub: 0.8,
                invalidateOnRefresh: true
              }
            });

            stepTimeline
              .fromTo(number, { autoAlpha: 0, scale: 0.72, y: 26 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.65, ease: "power3.out" }, 0)
              .fromTo(copy, { autoAlpha: 0, y: 24, filter: "blur(7px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.75, ease: "power3.out" }, 0.12);

            if (reports.length) {
              stepTimeline.fromTo(reports, {
                autoAlpha: 0,
                y: (index) => index === 1 ? 64 : 34,
                x: (index) => index === 0 ? -60 : index === 2 ? 60 : 0,
                scale: 0.94,
                filter: "blur(5px)"
              }, {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                stagger: 0.12,
                duration: 0.9,
                ease: "power3.out"
              }, 0.42);
            }

            if (media) {
              stepTimeline.fromTo(media, {
                autoAlpha: 0,
                y: 48,
                scale: 0.975,
                filter: "blur(5px)"
              }, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                duration: 0.9,
                ease: "power3.out"
              }, 0.42);
            }

            if (caption) {
              stepTimeline.fromTo(caption, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.92);
            }
          });
        }

        const competitors = container.querySelector<HTMLElement>("[data-cloudchipr-competitors]");
        if (competitors) {
          const title = competitors.querySelector<HTMLElement>(".dw-cloudchipr-competitor-title");
          const copy = competitors.querySelectorAll<HTMLElement>(".dw-cloudchipr-competitor-block > p, .dw-cloudchipr-competitor-insights > p");
          const logos = competitors.querySelectorAll<HTMLElement>(".dw-cloudchipr-wordmark");
          const comparison = competitors.querySelector<HTMLElement>(".dw-cloudchipr-competitor-comparison");

          gsap.fromTo(title, { autoAlpha: 0, y: 28, filter: "blur(8px)" }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: competitors, start: "top 82%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(copy, { autoAlpha: 0, y: 34, filter: "blur(7px)" }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: competitors, start: "top 76%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(logos, { autoAlpha: 0, y: 24, scale: 0.9, filter: "blur(5px)" }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            stagger: 0.055,
            duration: 0.65,
            ease: "back.out(1.25)",
            scrollTrigger: { trigger: competitors, start: "top 66%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(comparison, { autoAlpha: 0, y: 70, scale: 0.97, filter: "blur(6px)" }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: comparison, start: "top 90%", toggleActions: "play none none reverse" }
          });

        }

        const designDecision = container.querySelector<HTMLElement>("[data-cloudchipr-design-decision]");
        if (designDecision) {
          const heading = designDecision.querySelectorAll<HTMLElement>(".dw-cloudchipr-design-decision-heading > *");
          const copy = designDecision.querySelector<HTMLElement>(".dw-cloudchipr-design-decision-copy");
          const roiTitle = designDecision.querySelector<HTMLElement>(".dw-cloudchipr-roi-calculation h3");
          const metrics = designDecision.querySelectorAll<HTMLElement>(".dw-cloudchipr-roi-calculation dl > div");
          const result = designDecision.querySelector<HTMLElement>(".dw-cloudchipr-roi-result");
          const equation = designDecision.querySelectorAll<HTMLElement>(".dw-cloudchipr-roi-equation > *");
          const comment = designDecision.querySelector<HTMLElement>(".dw-cloudchipr-roi-comment");

          gsap.fromTo(heading, { autoAlpha: 0, y: 30, filter: "blur(8px)" }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.12,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: designDecision, start: "top 84%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo([copy, roiTitle], { autoAlpha: 0, y: 26, filter: "blur(7px)" }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.14,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: designDecision, start: "top 74%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(metrics, { autoAlpha: 0, y: 24 }, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.08,
            duration: 0.62,
            ease: "power2.out",
            scrollTrigger: { trigger: metrics[0], start: "top 88%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(result, { autoAlpha: 0.4, y: 58, scale: 0.985 }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: result, start: "top 92%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(equation, { autoAlpha: 0, x: -32, filter: "blur(6px)" }, {
            autoAlpha: 1,
            x: 0,
            filter: "blur(0px)",
            stagger: 0.12,
            duration: 0.72,
            ease: "power3.out",
            scrollTrigger: { trigger: result, start: "top 78%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(comment, { autoAlpha: 0, x: 44, y: 26, scale: 0.9 }, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "back.out(1.25)",
            scrollTrigger: { trigger: result, start: "top 72%", toggleActions: "play none none reverse" }
          });
        }

        const designSystemVisuals = container.querySelector<HTMLElement>("[data-cloudchipr-design-system-visuals]");
        if (designSystemVisuals) {
          const logo = designSystemVisuals.querySelector<HTMLElement>(".dw-cloudchipr-design-system-logo");
          const benefits = designSystemVisuals.querySelectorAll<HTMLElement>(".dw-cloudchipr-design-system-benefits li");
          const screen = designSystemVisuals.querySelector<HTMLElement>(".dw-cloudchipr-design-system-screen");
          const price = designSystemVisuals.querySelector<HTMLElement>(".dw-cloudchipr-design-system-price");

          gsap.fromTo(logo, { autoAlpha: 0, x: -38, y: 20, scale: 0.92 }, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: designSystemVisuals, start: "top 78%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(benefits, { autoAlpha: 0, x: -28 }, {
            autoAlpha: 1,
            x: 0,
            stagger: 0.09,
            duration: 0.58,
            ease: "power2.out",
            scrollTrigger: { trigger: designSystemVisuals, start: "top 68%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(screen, { autoAlpha: 0, x: 80, scale: 0.97 }, {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: designSystemVisuals, start: "top 78%", toggleActions: "play none none reverse" }
          });

          gsap.fromTo(price, { autoAlpha: 0, y: 64, scale: 0.9 }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "back.out(1.2)",
            scrollTrigger: { trigger: designSystemVisuals, start: "top 62%", toggleActions: "play none none reverse" }
          });
        }

        const securionBrand = container.querySelector<HTMLElement>("[data-securion-brand]");
        if (securionBrand) {
          const copy = securionBrand.querySelectorAll<HTMLElement>(".dw-securion-brand-copy > *");
          const highlights = securionBrand.querySelectorAll<HTMLElement>("mark");
          const construction = securionBrand.querySelector<HTMLElement>(".dw-securion-construction");
          const logo = securionBrand.querySelector<HTMLElement>(".dw-securion-construction-logo");
          const notes = securionBrand.querySelectorAll<HTMLElement>(".dw-securion-construction-notes article");

          gsap.fromTo(copy, { autoAlpha: 0, y: 32, filter: "blur(8px)" }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.12,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: securionBrand, start: "top 82%", toggleActions: "play none none reverse" }
          });
          gsap.fromTo(highlights, { backgroundSize: "0% 100%" }, {
            backgroundSize: "100% 100%",
            stagger: 0.08,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: { trigger: securionBrand, start: "top 68%", toggleActions: "play none none reverse" }
          });
          gsap.fromTo(construction, { autoAlpha: 0.35, y: 54, scale: 0.98, filter: "blur(5px)" }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: construction, start: "top 88%", toggleActions: "play none none reverse" }
          });
          gsap.fromTo(logo, { autoAlpha: 0, scale: 0.56, rotation: -8 }, {
            autoAlpha: 1,
            scale: 1,
            rotation: 0,
            duration: 0.9,
            ease: "back.out(1.2)",
            scrollTrigger: { trigger: construction, start: "top 70%", toggleActions: "play none none reverse" }
          });
          gsap.fromTo(notes, { autoAlpha: 0, y: 26 }, {
            autoAlpha: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: construction, start: "center 76%", toggleActions: "play none none reverse" }
          });
        }

        const securionLaws = container.querySelector<HTMLElement>("[data-securion-laws]");
        if (securionLaws) {
          const items = securionLaws.querySelectorAll<HTMLElement>(".dw-securion-laws-list li");
          const landscape = securionLaws.querySelector<HTMLElement>(".dw-securion-logo-landscape");
          const scaleLaw = securionLaws.querySelector<HTMLElement>(".dw-securion-scale-law");

          gsap.fromTo(items, { autoAlpha: 0, y: 28, filter: "blur(7px)" }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            stagger: 0.14,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: securionLaws, start: "top 80%", toggleActions: "play none none reverse" }
          });
          gsap.fromTo(landscape, { autoAlpha: 0, scale: 0.94, y: 42 }, {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: landscape, start: "top 88%", toggleActions: "play none none reverse" }
          });
          gsap.fromTo(scaleLaw, { autoAlpha: 0, y: 36, filter: "blur(6px)" }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: scaleLaw, start: "top 86%", toggleActions: "play none none reverse" }
          });
        }

        const securionColors = container.querySelector<HTMLElement>("[data-securion-colors]");
        if (securionColors) {
          const swatches = securionColors.querySelectorAll<HTMLElement>(".dw-securion-palette-group article");
          gsap.fromTo(swatches, { autoAlpha: 0, y: 30, scale: 0.94 }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            stagger: 0.055,
            duration: 0.62,
            ease: "back.out(1.15)",
            scrollTrigger: { trigger: securionColors, start: "top 70%", toggleActions: "play none none reverse" }
          });
        }

        const securionFeedback = container.querySelector<HTMLElement>(".dw-case-section-feedback");
        if (securionFeedback) {
          const quote = securionFeedback.querySelector<HTMLElement>("blockquote");
          const person = securionFeedback.querySelector<HTMLElement>(".dw-case-testimonial-person");
          gsap.fromTo(quote, { autoAlpha: 0, y: 36, filter: "blur(8px)" }, {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: securionFeedback, start: "top 78%", toggleActions: "play none none reverse" }
          });
          gsap.fromTo(person, { autoAlpha: 0, x: 32, scale: 0.94 }, {
            autoAlpha: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: securionFeedback, start: "top 66%", toggleActions: "play none none reverse" }
          });
        }
      } else {
        gsap.utils.toArray<HTMLElement>("[data-portfolio-reveal]").forEach((element) => {
          gsap.fromTo(element, { autoAlpha: 0, y: 56 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true }
          });
        });
      }

      const materialIntro = container.querySelector<HTMLElement>("[data-mex-intro]");
      if (materialIntro) {
        const floatingElements = materialIntro.querySelectorAll<HTMLElement>("[data-mex-float]");
        if (floatingElements.length) {
          gsap.fromTo(floatingElements, {
            autoAlpha: 0,
            y: 34,
            scale: 0.86,
            rotate: (index) => index % 2 ? 3 : -3
          }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            rotate: 0,
            stagger: 0.16,
            duration: 1,
            ease: "power3.out"
          });
        }
      }

      gsap.utils.toArray<HTMLElement>("[data-mex-note]").forEach((note, index) => {
        gsap.fromTo(note, {
          autoAlpha: 0,
          x: index % 2 ? 70 : -70,
          y: 30,
          rotate: index % 2 ? 4 : -4
        }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          rotate: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: note, start: "top 88%", toggleActions: "play none none reverse" }
        });
      });

      const materialIconPaths = container.querySelectorAll<SVGGeometryElement>("[data-mex-icon-path]");
      if (materialIconPaths.length) {
        gsap.fromTo(materialIconPaths, {
          strokeDasharray: 1,
          strokeDashoffset: 1
        }, {
          strokeDashoffset: 0,
          stagger: 0.09,
          duration: 1.25,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: "[data-mex-iconography]",
            start: "top 64%",
            toggleActions: "play none none reverse"
          }
        });
      }

      const materialBranches = container.querySelectorAll<HTMLElement>("[data-mex-branch]");
      if (materialBranches.length) {
        gsap.fromTo(materialBranches, { autoAlpha: 0, x: (index) => index < 3 ? -34 : 34 }, {
          autoAlpha: 1, x: 0, stagger: 0.12, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: "[data-mex-system]", start: "top 75%", toggleActions: "play none none reverse" }
        });
      }

      const materialPaths = container.querySelectorAll<SVGPathElement>("[data-mex-system-path]");
      if (materialPaths.length) {
        gsap.fromTo(materialPaths, { strokeDasharray: 1, strokeDashoffset: 1 }, {
          strokeDashoffset: 0, stagger: 0.08, duration: 1.15, ease: "power2.inOut",
          scrollTrigger: { trigger: "[data-mex-system]", start: "top 72%", toggleActions: "play none none reverse" }
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-portfolio-parallax]").forEach((element) => {
        gsap.fromTo(element, { yPercent: 2.5 }, {
          yPercent: -2.5,
          ease: "none",
          scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.65 }
        });
      });
    }, container);
    return () => context.revert();
  }, [containerRef]);
}

export function PortfolioIndexContent() {
  const containerRef = useRef<HTMLElement | null>(null);
  usePortfolioMotion(containerRef);

  return (
    <section className="dw-portfolio-index" ref={containerRef}>
      <header className="dw-portfolio-index-hero" data-portfolio-reveal>
        <p>Selected work / 2018–2026</p>
        <h1>Products I helped shape.</h1>
        <div>
          <p>I work with founders and product teams when the direction is still unclear or the product needs a stronger design system.</p>
          <span>Five detailed case studies</span>
        </div>
      </header>
      <div className="dw-portfolio-project-grid">
        {projects.map((project, index) => {
          const intro = project.sections[0];
          const accent = projectAccents[project.project.slug];
          const categories = intro.metadata?.find((item) => item.label.startsWith("Categories"))?.value;
          const duration = intro.metadata?.find((item) => item.label.startsWith("Duration"))?.value;
          return (
            <a
              className={`dw-portfolio-project-card card-${index + 1}`}
              href={projectHref(project.project.slug)}
              target={isStorybook() ? "_parent" : undefined}
              style={{ "--project-accent": accent?.accent, "--project-surface": accent?.surface } as CSSProperties}
              data-portfolio-reveal
              key={project.project.slug}
            >
              <div className="dw-portfolio-card-media">
                <ProjectImage project={project} assetKey={intro.media} />
              </div>
              <div className="dw-portfolio-card-copy">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h2>{project.project.title}</h2><p>{intro.subtitle}</p></div>
                <div className="dw-portfolio-card-meta"><span>{categories}</span><span>{duration}</span></div>
              </div>
            </a>
          );
        })}
      </div>
      <footer className="dw-portfolio-index-footer" data-portfolio-reveal>
        <p>Need product direction, a design system, or a designer who can lead the work?</p>
        <a href={isStorybook() ? "/?path=/story/mvp-pages--lets-talk" : "/am/lets-talk"} target={isStorybook() ? "_parent" : undefined}>Let’s talk</a>
      </footer>
    </section>
  );
}

export function CaseStudyContent({ slug }: { slug: string }) {
  const containerRef = useRef<HTMLElement | null>(null);
  const project = useMemo(() => projects.find((item) => item.project.slug === slug), [slug]);
  usePortfolioMotion(containerRef);

  if (!project) {
    return <section className="dw-case-not-found"><h1>Project not found.</h1><a href={portfolioHref()}>Back to selected work</a></section>;
  }

  return (
    <article className={`dw-case-study dw-case-${slug}`} ref={containerRef}>
      {project.sections.map((section) => <ProjectSection project={project} section={section} key={section.id} />)}
    </article>
  );
}

export function getPortfolioProjects() {
  return projects;
}
