import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Skull, Undo2 } from "lucide-react";
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
  return <>{section.title}</>;
}

function IntroSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
  const style = sectionStyle(project, section);
  const isCloudChipr = project.project.slug === "cloudchipr";
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
              {isCloudChipr && item.label.startsWith("Tools") ? (
                <dd className="dw-case-tool-icons" aria-label="Figma, Notion, and Slack">
                  <img src="/portfolio-assets/cloudchipr/tools/figma.svg" alt="Figma" />
                  <img src="/portfolio-assets/cloudchipr/tools/notion.svg" alt="Notion" />
                  <img src="/portfolio-assets/cloudchipr/tools/slack.svg" alt="Slack" />
                </dd>
              ) : isCloudChipr && item.label.startsWith("Co-Designers") ? (
                <dd className="dw-case-collaborators">
                  {item.value.split(",").map((name) => <span key={name.trim()}>{name.trim()}</span>)}
                </dd>
              ) : (
                <dd dangerouslySetInnerHTML={{ __html: item.value }} />
              )}
            </div>
          ))}
        </dl>
        <div className="dw-case-intro-media" data-portfolio-parallax>
          <ProjectImage project={project} assetKey={section.media} eager />
        </div>
        {isCloudChipr ? <span className="dw-case-project-rail" aria-hidden="true">Projects</span> : null}
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
      <div className="dw-construction-guides" aria-hidden="true">
        <span className="dw-construction-guide dw-construction-guide-logo" />
        <span className="dw-construction-guide dw-construction-guide-strapline" />
        <span className="dw-construction-centerline" />
      </div>

      <div className="dw-construction-logo" aria-label="CloudChipr. Workflow Automation for Cloud Operations">
        <span className="dw-construction-glyph" aria-hidden="true">
          <span className="dw-construction-ring dw-construction-ring-left" />
          <span className="dw-construction-ring dw-construction-ring-center" />
          <span className="dw-construction-ring dw-construction-ring-right" />
        </span>
        <span className="dw-construction-wordmark" aria-hidden="true">
          {"cloudchipr".split("").map((letter, index) => <span key={`${letter}-${index}`}>{letter}</span>)}
        </span>
        <span className="dw-construction-strapline">Workflow Automation for Cloud Operations</span>
      </div>

      <span className="dw-construction-label dw-construction-label-glyph">Glyph.</span>
      <span className="dw-construction-label dw-construction-label-lookup">Lookup.</span>
      <span className="dw-construction-label dw-construction-label-wordmark">Wordmark.</span>
      <span className="dw-construction-label dw-construction-label-strapline">Strapline.</span>

      <span className="dw-construction-callout dw-construction-callout-cloud" aria-hidden="true">
        <span className="dw-construction-callout-circle" />
        <span className="dw-construction-callout-line" />
        <span className="dw-construction-callout-copy">Cloud + Chart</span>
      </span>
      <span className="dw-construction-callout dw-construction-callout-type" aria-hidden="true">
        <span className="dw-construction-callout-circle" />
        <span className="dw-construction-callout-line" />
        <span className="dw-construction-callout-copy">Product Sans</span>
      </span>
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
            <Undo2 className="dw-cloudchipr-concept-arrow" aria-hidden="true" strokeWidth={1.5} />
          </figure>

          <figure className="dw-cloudchipr-concept dw-cloudchipr-concept-selected">
            <ProjectImage project={project} assetKey="concept-selected" />
            <figcaption>Selected by client</figcaption>
            <Undo2 className="dw-cloudchipr-concept-arrow" aria-hidden="true" strokeWidth={1.5} />
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
        <figure className="dw-cloudchipr-brand-layer dw-cloudchipr-brand-layer-badge">
          <ProjectImage project={project} assetKey="brand-badge" />
        </figure>
        <figure className="dw-cloudchipr-brand-layer dw-cloudchipr-brand-layer-details">
          <ProjectImage project={project} assetKey="brand-card-details" />
        </figure>
        <figure className="dw-cloudchipr-brand-layer dw-cloudchipr-brand-layer-logo">
          <ProjectImage project={project} assetKey="brand-card-logo" />
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
        <span className="dw-cloudchipr-competitor-void" />
        <span className="dw-cloudchipr-competitor-orb dw-cloudchipr-competitor-orb-one" />
        <span className="dw-cloudchipr-competitor-orb dw-cloudchipr-competitor-orb-two" />
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
            <h3><span className="dw-cloudchipr-comparison-mark" aria-hidden="true" />cloudchipr</h3>
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
            <Skull aria-hidden="true" strokeWidth={1.15} />
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
            <ProjectImage project={project} assetKey="viktor-avatar" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MediaSection({ project, section }: { project: PortfolioProject; section: PortfolioSection }) {
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
          const rings = construction.querySelectorAll<HTMLElement>(".dw-construction-ring");
          const letters = construction.querySelectorAll<HTMLElement>(".dw-construction-wordmark > span");
          const strapline = construction.querySelector<HTMLElement>(".dw-construction-strapline");
          const labels = construction.querySelectorAll<HTMLElement>(".dw-construction-label");
          const circles = construction.querySelectorAll<HTMLElement>(".dw-construction-callout-circle");
          const lines = construction.querySelectorAll<HTMLElement>(".dw-construction-callout-line");
          const calloutCopy = construction.querySelectorAll<HTMLElement>(".dw-construction-callout-copy");

          gsap.set(construction, { autoAlpha: 0.35, scale: 0.985 });
          gsap.set(guides, { autoAlpha: 0, scaleX: 0.18, transformOrigin: "left center" });
          gsap.set(rings, { autoAlpha: 0, x: -36, scale: 0.2, rotation: -55, transformOrigin: "center" });
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
            .to(guides, { autoAlpha: 1, scaleX: 1, stagger: 0.08, duration: 0.9, ease: "power2.out" }, 0.08)
            .to(rings, { autoAlpha: 1, x: 0, scale: 1, rotation: 0, stagger: 0.12, duration: 0.9, ease: "back.out(1.35)" }, 0.32)
            .to(letters, { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.045, duration: 0.75, ease: "power3.out" }, 0.56)
            .to(strapline, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }, 0.94)
            .to(labels, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.55, ease: "power2.out" }, 1.08)
            .to(circles, { autoAlpha: 1, scale: 1, stagger: 0.14, duration: 0.7, ease: "back.out(1.5)" }, 1.18)
            .to(lines, { autoAlpha: 1, scaleX: 1, stagger: 0.14, duration: 0.65, ease: "power2.out" }, 1.28)
            .to(calloutCopy, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.5, ease: "power2.out" }, 1.44);
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
          const logo = brandItems.querySelector<HTMLElement>(".dw-cloudchipr-brand-layer-logo");

          gsap.set(stage, { autoAlpha: 0.35, scale: 0.985, filter: "blur(4px)" });
          gsap.set(badge, { autoAlpha: 0, xPercent: -34, yPercent: 18, rotation: -8, scale: 0.82 });
          gsap.set(details, { autoAlpha: 0, xPercent: 30, yPercent: -22, rotation: 8, scale: 0.84 });
          gsap.set(logo, { autoAlpha: 0, xPercent: 34, yPercent: 24, rotation: -7, scale: 0.82 });

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
            .to(details, { autoAlpha: 1, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, duration: 1, ease: "power3.out" }, 0.24)
            .to(logo, { autoAlpha: 1, xPercent: 0, yPercent: 0, rotation: 0, scale: 1, duration: 1, ease: "power3.out" }, 0.42);

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
          gsap.to(logo?.querySelector("img"), {
            yPercent: -3,
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
          const orbs = competitors.querySelectorAll<HTMLElement>(".dw-cloudchipr-competitor-orb");

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

          gsap.to(orbs, {
            yPercent: (index) => index === 0 ? -8 : 8,
            rotation: (index) => index === 0 ? 5 : -5,
            ease: "none",
            scrollTrigger: { trigger: competitors, start: "top bottom", end: "bottom top", scrub: 0.85 }
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
