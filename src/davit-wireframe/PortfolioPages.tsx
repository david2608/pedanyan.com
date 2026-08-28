import React, { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KeyRound, Linkedin, Shield } from "lucide-react";
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
    <svg
      className="dw-securion-construction-mark"
      viewBox="0 0 240 260"
      role="img"
      aria-label="Securion logo construction"
    >
      <g className="dw-securion-construction-guides" aria-hidden="true">
        <circle cx="120" cy="119" r="68" />
        <ellipse cx="120" cy="119" rx="42" ry="84" />
        <path d="M24 119H216M120 20V228M45 48L195 198M195 48L45 198" />
      </g>
      <path
        className="dw-securion-construction-shield"
        d="M120 25c24 18 47 28 75 34v68c0 52-29 86-75 111-46-25-75-59-75-111V59c28-6 51-16 75-34Z"
      />
      <path
        className="dw-securion-construction-bolt"
        d="M164 67 92 123h50l-66 67 75-57h-49l62-66Z"
      />
      <circle className="dw-securion-construction-keyhole" cx="120" cy="111" r="8" />
      <path className="dw-securion-construction-keyhole" d="M120 119v23" />
    </svg>
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
            <p>Security, protection, safety, defence, trust, strength and safeguarding.</p>
          </article>
          <article>
            <span className="dw-securion-letter" aria-hidden="true">S</span>
            <strong>letter “S”</strong>
            <p>The first letter of the brand name: Securion, as in “turn the security on”.</p>
          </article>
          <article>
            <KeyRound aria-hidden="true" strokeWidth={1.7} />
            <strong>keyhole</strong>
            <p>Access, secrecy, opportunity, lock, entrance, privacy and revealing.</p>
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
            <strong>Simplicity:</strong> The logo is simple, <b>recognizable and memorable</b>. It stays
            clear when <b>scaled to different sizes</b>.
          </li>
          <li>
            <strong>Memorability:</strong> Its compact silhouette leaves a clear and lasting impression.
          </li>
        </ol>

        <div className="dw-securion-logo-landscape" aria-label="Securion among familiar digital product logos">
          <img src="/portfolio-assets/securion/logo-laws-reference.png" alt="Logo comparison landscape" />
        </div>

        <ol className="dw-securion-laws-list dw-securion-laws-list-bottom" start={3}>
          <li>
            <strong>Relevance:</strong> The mark reflects Securion&apos;s <b>commitment to security,
            innovation, and user-friendliness</b>. Designed in 2018, it still feels current.
          </li>
          <li>
            <strong>Distinctiveness:</strong> Its shape separates the brand from competitors and other
            crypto products in the category.
          </li>
        </ol>

        <div className="dw-securion-scale-law">
          <p><span>5.</span> The logo is <strong>highly scalable</strong>, maintaining clarity and recognition
          from the smallest app icon to large-format use.</p>
          <img src="/portfolio-assets/securion/logo-scale-reference.png" alt="Securion logo shown at 140, 100, 60 and 30 pixel sizes" />
        </div>
        <div className="dw-securion-brand-pair" aria-label="Securion brand application examples">
          <img src="/portfolio-assets/securion/brand-lanyard.png" alt="Securion lanyard and access badge" />
          <img src="/portfolio-assets/securion/brand-hoodie.png" alt="Securion hoodie application" />
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

function SecurionFeedback({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const person = section.person;
  return (
    <section className="dw-case-section dw-securion-feedback" id={section.id} data-securion-feedback>
      <div className="dw-securion-feedback-inner">
        <div className="dw-securion-feedback-heading">
          <span>Client perspective</span>
          <h2>{section.title || "Feedback"}</h2>
        </div>
        <blockquote>“{section.quote}”</blockquote>
        {person ? (
          <div className="dw-securion-feedback-person">
            <span className="dw-securion-feedback-avatar"><ProjectImage project={project} assetKey={section.avatar} /></span>
            <span><strong>{person.name}</strong><small>{person.role}</small></span>
            {person.url ? <a className="dw-securion-feedback-linkedin" href={person.url} target="_blank" rel="noreferrer" aria-label={`${person.name} on LinkedIn`}>in</a> : null}
          </div>
        ) : null}
        <span className="dw-securion-feedback-mark" aria-hidden="true">”</span>
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
    const steps = ["low quality content", "low interest from suppliers", "low amount of sales", "drop users"];
    return <section className={sectionClass(section, "dw-photo-lab-problem-flow")} style={sectionStyle(project, section)} id={section.id}>
      <div className="dw-photo-lab-flow" aria-label="Problem progression">{steps.map((step, index) => <React.Fragment key={step}><div className={`dw-photo-lab-flow-step step-${index}`}><span>{step}</span></div>{index < steps.length - 1 ? <span className="dw-photo-lab-flow-arrow" aria-hidden="true">→</span> : null}</React.Fragment>)}</div>
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
      <div className="dw-case-testimonial" data-portfolio-reveal>
        <p className="dw-case-eyebrow">{section.title || "Feedback"}</p>
        <blockquote>{section.quote}</blockquote>
        {person ? (
          <a href={person.url || "#"} target={person.url ? "_blank" : undefined} rel="noreferrer">
            <span className="dw-case-avatar"><ProjectImage project={project} assetKey={section.avatar} /></span>
            <span><strong>{person.name}</strong><small>{person.role}</small></span>
          </a>
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
    return null;
  }
  if (project.project.slug === "securion" && section.id === "color-theory") {
    return <SecurionColorTheory section={section} />;
  }
  if (project.project.slug === "securion" && section.id === "color-system") {
    return null;
  }
  if (project.project.slug === "securion" && section.id === "grid-system") {
    return null;
  }
  if (project.project.slug === "securion" && section.id === "feedback") {
    return <SecurionFeedback project={project} section={section} />;
  }
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

        const securionFeedback = container.querySelector<HTMLElement>("[data-securion-feedback]");
        if (securionFeedback) {
          const quote = securionFeedback.querySelector<HTMLElement>("blockquote");
          const person = securionFeedback.querySelector<HTMLElement>(".dw-securion-feedback-person");
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
