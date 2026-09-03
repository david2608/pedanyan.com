import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MessageCircle } from "lucide-react";
import {
  Shader,
  Dither,
  FilmGrain,
  FlutedGlass,
  GridDistortion,
  Plasma,
  Sharpness,
  Swirl,
  WaveDistortion
} from "shaders/react";
import davitMainImage from "../assets/davit-main.jpg";
import figmaHeroPerson from "../assets/figma-hero/davit-cutout.png";
import figmaHeroProductsObject from "../assets/figma-hero/hover-products.png";
import figmaHeroDesignersObject from "../assets/figma-hero/hover-designers.png";
import figmaHeroCultureObject from "../assets/figma-hero/hover-culture.png";
import { CosmicDustBackground } from "./CosmicDustBackground";
import { RapierGlassCubes } from "./HomeRapierGlassBackground";
import { CaseStudyContent, PortfolioIndexContent } from "./PortfolioPages";
import { PortfolioMusicToggle } from "./PortfolioMusicToggle";
import { siteData } from "./siteData";
import { websiteContent } from "./websiteContent";

gsap.registerPlugin(CustomEase, Observer, ScrollTrigger);

CustomEase.create(
  "numberFastSlowFast",
  "M0,0 C0.05,0.2 0.18,0.3 0.4,0.3125 C0.5,0.318 0.62,0.37 0.72,0.43 C0.86,0.55 0.96,0.82 1,1"
);
CustomEase.create(
  "numberTravelPath",
  "M0,0 C0.08,0.16 0.2,0.25 0.4,0.269 C0.52,0.28 0.67,0.34 0.78,0.48 C0.9,0.65 0.97,0.88 1,1"
);

const BASE_DUST_SPEED = 0.08;
const BASE_HERO_DUST_SPEED = 0.01;
const DAVIT_LINKEDIN_URL = "https://am.linkedin.com/in/davit-pedanyan";

// Homepage hero → animated numbers timing controls (seconds).
// Edit these values to tune the complete numbers experience by hand.
const HOME_NUMBERS_MOTION = {
  heroReveal: 1.08,
  heroHideAt: 1.07,
  heroTransitionEnd: 1.12,
  numbersStart: 1.18,
  scaleIn: 2,
  focusHold: 1,
  scaleOut: 2,
  focusZoom: 1.18,
  focusDepth: 150,
  focusDrift: 18,
  countStartDelay: 0.08,
  countTo22: 2.6,
  count22To27: 1.8,
  experienceMove: 0.72,
  scrollMaxAdditionalSpeed: 2.6,
  scrollSensitivity: 110,
  scrollReleaseReset: 0.35,
  mouseParallax: 28,
  mouseParallaxDuration: 0.65
} as const;

type PageKey = "home" | "designer" | "designTalent" | "school" | "publicWork" | "letsTalk";

type HeroCanvasItem =
  | {
      type: "image";
      className: string;
      src: string;
      alt: string;
      depth: number;
      dot?: boolean;
    }
  | {
      type: "video";
      className: string;
      src: string;
      poster?: string;
      label?: string;
      depth: number;
    }
  | {
      type: "text";
      className: string;
      text: ReactNode;
      depth: number;
    }
  | {
      type: "headline";
      className: string;
      text: ReactNode;
      depth: number;
    }
  | {
      type: "graphic";
      className: string;
      depth: number;
    }
  | {
      type: "dot";
      className: string;
      depth: number;
    };

type HomeScatterSectionProps = {
  id: string;
  eyebrow: string;
  title: ReactNode;
  labelA: string;
  labelB: string;
  items: readonly string[];
  tone?: "light" | "cream" | "dark";
  imageSide?: "left" | "right";
};

function renderMultilineText(lines: readonly string[]) {
  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}

function renderSnippetText(snippet: string) {
  return renderMultilineText(snippet.split("\n"));
}

const heroCanvasItems: HeroCanvasItem[] = [
  {
    type: "image",
    className: "dw-hero-photo-card",
    src: davitMainImage,
    alt: "Davit Pedanyan in a photo studio",
    depth: 0.38,
    dot: true
  },
  {
    type: "text",
    className: "dw-note-left",
    depth: 0.86,
    text: websiteContent.home.hero.snippets[0] ?? "Design generalist"
  },
  {
    type: "text",
    className: "dw-note-mid",
    depth: 0.74,
    text: websiteContent.home.hero.snippets[1] ?? "Educator"
  },
  {
    type: "text",
    className: "dw-note-top",
    depth: 0.62,
    text: renderSnippetText(websiteContent.home.hero.snippets[2] ?? "Community\nbuilder in Armenia")
  },
  {
    type: "text",
    className: "dw-note-product",
    depth: 0.92,
    text: websiteContent.home.hero.snippets[3] ?? "Product design"
  },
  {
    type: "text",
    className: "dw-note-public",
    depth: 0.66,
    text: websiteContent.home.hero.snippets[4] ?? "Public work"
  },
  {
    type: "graphic",
    className: "dw-hero-black-card",
    depth: 1.08
  },
  {
    type: "image",
    className: "dw-hero-texture-card",
    src: davitMainImage,
    alt: "",
    depth: 0.62
  },
  {
    type: "dot",
    className: "dw-hero-small-dot",
    depth: 1.3
  },
  {
    type: "headline",
    className: "dw-hero-title",
    depth: 0.38,
    text: renderMultilineText(websiteContent.home.hero.headline)
  }
];

const fallbackDesignerStats = [
  {
    value: "20+ years",
    caption: "designing digital products, brands, interfaces, and design systems"
  },
  {
    value: "17 startups",
    caption: "building product direction, design systems, and shipped interfaces"
  },
  {
    value: "100+",
    caption: "consulting projects in product strategy, UX, branding, hiring, and design operations"
  },
  {
    value: "85",
    caption: "designers placed with product teams"
  },
  {
    value: "$27M",
    caption: "raised by founders whose products and pitches I helped shape"
  }
];

const fallbackMediaProjects = [
  {
    title: "UX Storm",
    category: "UX design event / speakers / speed discussions",
    size: "wide",
    tone: "deep"
  },
  {
    title: "Drunk Talks",
    category: "Experimental drinks-and-design conversations",
    size: "narrow",
    tone: "blue"
  },
  {
    title: "Design critique nights",
    category: "Case studies, portfolios, and honest failures",
    size: "wide",
    tone: "cyan"
  },
  {
    title: "Speaker appearances",
    category: "Talks, panels, public discussions",
    size: "single",
    tone: "violet"
  },
  {
    title: "Workshop facilitation",
    category: "Hands-on sessions for teams and students",
    size: "double",
    tone: "acid"
  },
  {
    title: "artmart public program",
    category: "Community, culture, and education formats",
    size: "double",
    tone: "warm"
  },
  {
    title: "Portfolio open reviews",
    category: "Designers discuss work in progress",
    size: "single",
    tone: "stage"
  },
  {
    title: "Foreign designer sessions",
    category: "Guests, exchange, informal learning",
    size: "narrow",
    tone: "mono"
  },
  {
    title: "Public education experiments",
    category: "New formats for design learning in Armenia",
    size: "triple",
    tone: "green"
  }
];

const fallbackPublicFormats = [
  {
    title: "UX Storm",
    description:
      "Speakers share a case, then mentors lead short discussions with the room."
  },
  {
    title: "Drunk Talks",
    description:
      "Local and visiting designers have a drink and answer questions from anyone who joins."
  },
  {
    title: "Design critiques",
    description:
      "Designers bring case studies, portfolios, unfinished work, and mistakes for group review."
  },
  {
    title: "Invited public work",
    description:
      "I speak on panels, run workshops, review work, and mentor designers at other events."
  }
];

const fallbackExperiences = [
  {
    company: "Freedx",
    role: "Design Lead",
    years: "Current",
    type: "Design leadership",
    logoDomain: "freedx.com",
    description:
      "I lead product design for a crypto and fintech product."
  },
  {
    company: "Armenian Code Academy",
    role: "Design Practice Lead",
    years: "4+ years",
    type: "Design education",
    logoDomain: "aca.am",
    description:
      "I built and led UX courses, workshops, UX Storm, and mentorship programs."
  },
  {
    company: "artmart",
    role: "Founder",
    years: "Current",
    type: "Creative education",
    logoDomain: "artmart.am",
    description: "I founded artmart, a contemporary art school in Armenia."
  },
  {
    company: "T-Bank / Tinkoff",
    role: "Product Designer",
    years: "Verify dates",
    type: "Product design",
    logoDomain: "tbank.ru",
    description: "I designed products with a large fintech team."
  },
  {
    company: "Material Exchange",
    role: "Product / Design Lead",
    years: "Feb 2020 — Feb 2022",
    type: "Product design leadership",
    logoDomain: "material-exchange.com",
    description:
      "I designed the product and its design system for an international materials platform."
  },
  {
    company: "Webb Fontaine",
    role: "Design Lead",
    years: "Verify dates",
    type: "Enterprise product design",
    logoDomain: "webbfontaine.com",
    description:
      "I led design systems and interface work for complex enterprise products."
  },
  {
    company: "CloudChipr",
    role: "Product Design Lead",
    years: "Verify dates",
    type: "Startup product design",
    logoDomain: "cloudchipr.com",
    description: "I designed the product from its first MVP through early growth."
  },
  {
    company: "Liga Insurance",
    role: "Product Designer",
    years: "Verify dates",
    type: "Insurance product design",
    logoDomain: "liga.am",
    description: "I designed mobile and web insurance products."
  },
  {
    company: "Uphold",
    role: "Senior UI/UX Designer",
    years: "Verify dates",
    type: "Fintech / crypto product",
    logoDomain: "uphold.com",
    description: "I designed mobile wallet and crypto-fintech products."
  },
  {
    company: "The Bank of London",
    role: "Product Designer",
    years: "Verify dates",
    type: "Fintech product design",
    logoDomain: "thebankoflondon.com",
    description: "I designed interfaces for digital banking products."
  }
];

const fallbackPublicBlogCategories = [
  {
    title: "UX Storm",
    description:
      "Recaps, speaker notes, mentor debates, and useful ideas from each UX Storm.",
    count: "event series"
  },
  {
    title: "Public speaking",
    description:
      "Talks, panels, and interviews about design, education, AI, and culture.",
    count: "talks / panels"
  },
  {
    title: "Workshops",
    description:
      "Sessions for students and product teams on product thinking, portfolios, critique, and design process.",
    count: "facilitation"
  },
  {
    title: "Design critiques",
    description:
      "Designers bring case studies, portfolios, unfinished work, and mistakes for an honest review.",
    count: "critique culture"
  }
];

const fallbackDrunkTalksGallery = [
  {
    title: "Foreign designer night",
    note: "guest / drink / open conversation",
    size: "wide",
    tone: "blue"
  },
  {
    title: "Design after hours",
    note: "experimental format",
    size: "narrow",
    tone: "warm"
  },
  {
    title: "Community table",
    note: "everyone is welcome",
    size: "double",
    tone: "violet"
  },
  {
    title: "Unfiltered Q&A",
    note: "questions that do not fit formal events",
    size: "single",
    tone: "stage"
  }
];

const designerStats = websiteContent.designer?.stats?.length
  ? websiteContent.designer.stats
  : fallbackDesignerStats;
const mediaProjects = websiteContent.public?.mediaProjects?.length
  ? websiteContent.public.mediaProjects
  : fallbackMediaProjects;
const publicFormats = websiteContent.public?.formats?.length
  ? websiteContent.public.formats
  : fallbackPublicFormats;
const rawExperiences = websiteContent.designer?.experiences?.length
  ? websiteContent.designer.experiences
  : fallbackExperiences;
const experiences = rawExperiences.map((experience, index) => {
  if (index !== 0) return experience;
  return {
    ...experience,
    company: "Freedx",
    role: experience.company === "Lynon" ? "Design Lead" : experience.role,
    years: "Current",
    type: "Design leadership / fintech",
    logoDomain: "freedx.com",
    description:
      "I lead product design for a crypto and fintech product."
  };
});
const publicBlogCategories = websiteContent.public?.categories?.length
  ? websiteContent.public.categories
  : fallbackPublicBlogCategories;
const drunkTalksGallery = websiteContent.public?.drunkTalks?.gallery?.length
  ? websiteContent.public.drunkTalks.gallery
  : fallbackDrunkTalksGallery;

const storyExperienceSteps = [
  {
    marker: "01",
    title: "I started with products.",
    copy:
      "The story begins inside product work: interfaces, brands, systems, teams, and the messy decisions that turn ideas into something people can use.",
    meta: "product design / direction"
  },
  {
    marker: "02",
    title: "Then I started building designers.",
    copy:
      "Teaching became part of the work because design in Armenia needed stronger habits, sharper thinking, and a more serious path for beginners.",
    meta: "education / Pedanyan School"
  },
  {
    marker: "03",
    title: "Then the work became public.",
    copy:
      "Talks, critique nights, UX Storm, Drunk Talks, workshops, and media became ways to bring designers and creative people into the same room.",
    meta: "community / public formats"
  }
];

const storybookRoutes: Record<string, string> = {
  "/am": "/?path=/story/mvp-pages--home-am",
  "/am/designer": "/?path=/story/mvp-pages--designer",
  "/am/design-talent": "/?path=/story/mvp-pages--design-talent",
  "/am/story": "/?path=/story/mvp-pages--public-work",
  "/am/public-work": "/?path=/story/mvp-pages--public-work",
  "/am/school": "/?path=/story/mvp-pages--school",
  "/am/lets-talk": "/?path=/story/mvp-pages--lets-talk"
};

function useResolvedNavLink(href: string) {
  const [resolvedHref, setResolvedHref] = useState(href);
  const [target, setTarget] = useState<string | undefined>(undefined);

  useEffect(() => {
    const isStorybook =
      window.location.pathname.includes("iframe.html") ||
      window.location.search.includes("path=/story/");

    if (isStorybook && storybookRoutes[href]) {
      setResolvedHref(storybookRoutes[href]);
      setTarget("_parent");
      return;
    }

    setResolvedHref(href);
    setTarget(undefined);
  }, [href]);

  return { href: resolvedHref, target };
}

function NavAnchor({
  children,
  className,
  href,
  isActive = false
}: {
  children: ReactNode;
  className?: string;
  href: string;
  isActive?: boolean;
}) {
  const link = useResolvedNavLink(href);
  const classes = [className, isActive ? "is-active" : ""].filter(Boolean).join(" ");

  return (
    <a className={classes || undefined} href={link.href} target={link.target} aria-current={isActive ? "page" : undefined}>
      {children}
    </a>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="dw-eyebrow">{children}</div>;
}

function Button({
  children,
  href,
  primary = false
}: {
  children: ReactNode;
  href: string;
  primary?: boolean;
}) {
  return (
    <a className={`dw-btn ${primary ? "primary" : ""}`} href={href}>
      {children}
    </a>
  );
}

function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="dw-marquee" aria-hidden="true">
      <div className="dw-marquee-track">{children}</div>
    </div>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function OdometerNumber({ value = "0000" }: { value?: string }) {
  return (
    <div className="dw-designer-odometer" aria-label={value}>
      {value}
    </div>
  );
}

function DepthTextReveal({ children }: { children: string }) {
  return (
    <span className="dw-depth-reveal">
      {children.split(" ").map((word, wordIndex) => (
        <span className="dw-depth-word" key={`${word}-${wordIndex}`}>
          {word.split("").map((character, characterIndex) => (
            <span className="dw-depth-char" key={`${character}-${characterIndex}`}>
              {character}
            </span>
          ))}
          {wordIndex < children.split(" ").length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

function SlotMachineNumber() {
  return (
    <div className="dw-designer-slot-number" aria-label="$0M">$0M</div>
  );
}

function VisualStack({ label = "studio / school / culture" }: { label?: string }) {
  return (
    <div className="dw-media-stack" data-parallax>
      <div className="dw-acid-shape" />
      <div className="dw-media-block dw-m1" data-speed="0.15">
        <div>
          <small>visual system</small>
          {label}
        </div>
      </div>
      <div className="dw-media-block dw-m2" data-speed="-0.1">
        <div>
          <small>product direction</small>
          client work / talent / teams
        </div>
      </div>
      <div className="dw-media-block dw-m3" data-speed="0.08">
        <div>
          <small>public authority</small>
          teaching / artmart / talks
        </div>
      </div>
    </div>
  );
}

function Card({
  number,
  title,
  description,
  tag
}: {
  number: string;
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <article className="dw-card">
      <div className="dw-card-num">{number}</div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="dw-tag">{tag}</div>
    </article>
  );
}

function HeroCanvasItemView({ item }: { item: HeroCanvasItem }) {
  const floatProps = {
    className: `dw-float ${item.className}`,
    "data-float-depth": item.depth
  };

  if (item.type === "image") {
    return (
      <div {...floatProps}>
        <img src={item.src} alt={item.alt} />
        {item.dot ? <span aria-hidden="true" /> : null}
      </div>
    );
  }

  if (item.type === "video") {
    return (
      <div {...floatProps}>
        <video src={item.src} poster={item.poster} autoPlay muted loop playsInline aria-label={item.label} />
      </div>
    );
  }

  if (item.type === "text") {
    return <div {...floatProps} className={`dw-float dw-hero-note ${item.className}`}>{item.text}</div>;
  }

  if (item.type === "headline") {
    return (
      <div {...floatProps}>
        <h1>{item.text}</h1>
      </div>
    );
  }

  if (item.type === "graphic") {
    return (
      <div {...floatProps} aria-hidden="true">
        <span className="shape circle" />
        <span className="shape square" />
        <span className="shape slash" />
      </div>
    );
  }

  return <span {...floatProps} aria-hidden="true" />;
}

function ImagePlaceholder({ label = "image placeholder" }: { label?: string }) {
  return (
    <div className="dw-image-placeholder" role="img" aria-label={label}>
      <span>{label}</span>
    </div>
  );
}

function WireframeChrome() {
  useEffect(() => {
    const cursor = document.querySelector<HTMLElement>(".dw-cursor");
    const label = document.querySelector<HTMLElement>(".dw-cursor-label");
    const progress = document.querySelector<HTMLElement>(".dw-progress");

    const onMouseMove = (event: MouseEvent) => {
      if (!cursor || !label) return;
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      label.style.left = `${event.clientX}px`;
      label.style.top = `${event.clientY}px`;
    };

    const onScroll = () => {
      if (!progress) return;
      const max = document.body.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;

      document.querySelectorAll<HTMLElement>("[data-speed]").forEach((element) => {
        const rect = element.getBoundingClientRect();
        const speed = Number(element.dataset.speed || 0);
        const shift = (rect.top - window.innerHeight / 2) * speed;
        element.style.transform = `translateY(${shift}px)`;
      });
    };

    const hoverables = document.querySelectorAll("a, button, .dw-card, .dw-work-row, .dw-media-item");
    const enter = () => {
      if (!cursor || !label) return;
      cursor.style.width = "54px";
      cursor.style.height = "54px";
      label.textContent = "open";
    };
    const leave = () => {
      if (!cursor || !label) return;
      cursor.style.width = "22px";
      cursor.style.height = "22px";
      label.textContent = "explore";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    hoverables.forEach((element) => {
      element.addEventListener("mouseenter", enter);
      element.addEventListener("mouseleave", leave);
    });
    onScroll();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      hoverables.forEach((element) => {
        element.removeEventListener("mouseenter", enter);
        element.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return (
    <>
      <div className="dw-progress" />
      <div className="dw-cursor" />
      <div className="dw-cursor-label">explore</div>
    </>
  );
}

export function SiteHeader({ activePage }: { activePage?: PageKey }) {
  const [theme, setTheme] = useState<"day" | "night">("day");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.dwTheme = theme;
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        document.scrollingElement?.scrollTop ||
        0;
      document.documentElement.classList.toggle("dw-scrolled", scrollTop > 12);
      setIsScrolled(scrollTop > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    const scrollWatcher = window.setInterval(onScroll, 120);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      window.clearInterval(scrollWatcher);
    };
  }, []);

  return (
    <header className={`dw-header ${isScrolled ? "is-scrolled" : ""}`}>
      <NavAnchor className="dw-logo" href="/am">
        <span className="dw-logo-word">
          <img src="/brand/pdnyn-handdrawn.png" alt="PDNYN" />
        </span>
      </NavAnchor>
      <nav className="dw-nav" aria-label="Main navigation">
        {websiteContent.navigation.primary.map((item) => (
          <NavAnchor
            href={item.href}
            isActive={
              (activePage === "designer" && item.href === "/am/designer") ||
              (activePage === "designTalent" && item.href === "/am/designer") ||
              (activePage === "publicWork" && item.href === "/am/public-work")
            }
            key={item.href}
          >
            {item.label}
          </NavAnchor>
        ))}
      </nav>
      <NavAnchor
        className="dw-school-link"
        href={websiteContent.navigation.school.href}
        isActive={activePage === "school"}
      >
        {websiteContent.navigation.school.label}
      </NavAnchor>
      <div className="dw-right">
        <button
          className="dw-theme-toggle"
          type="button"
          aria-label="Toggle day and night theme"
          onClick={() => setTheme((current) => (current === "day" ? "night" : "day"))}
        >
          <span>{theme === "day" ? "night mode" : "day mode"}</span>
        </button>
        <a className="dw-pill" href={DAVIT_LINKEDIN_URL} target="_blank" rel="noreferrer">
          <MessageCircle className="dw-talk-icon" aria-hidden="true" strokeWidth={1.8} />
          <span>{websiteContent.navigation.talk.label}</span>
        </a>
      </div>
    </header>
  );
}

function FixedSocialLinks() {
  return (
    <div className="dw-fixed-socials" aria-label="Social links">
      {websiteContent.navigation.socials.map((social) => (
        <a href={social.href} key={social.label} rel="noreferrer" target="_blank">
          {social.label}
        </a>
      ))}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="dw-site-footer">
      <HomeTalkRoutingSection />
    </footer>
  );
}

function PageShell({
  children,
  className = "",
  showFooter = true,
  activePage
}: {
  children: ReactNode;
  className?: string;
  showFooter?: boolean;
  activePage?: PageKey;
}) {
  return (
    <main className={`dw-page ${className}`}>
      <WireframeChrome />
      <SiteHeader activePage={activePage} />
      <FixedSocialLinks />
      <div className="dw-fixed-music-control">
        <PortfolioMusicToggle />
      </div>
      {children}
      {showFooter ? <SiteFooter /> : null}
    </main>
  );
}

function PreviousHomeShaderBackground() {
  return (
    <div className="dw-home-shader-bg" aria-hidden="true">
      <Shader>
        <Dither colorA="#FFF" colorB="#d1c2cf" pattern="bayer8" pixelSize={7} threshold={0.27}>
          <Plasma colorA="#ffffff" contrast={0.7} density={1.1} intensity={1.3} speed={0.3} />
          <WaveDistortion
            angle={285}
            edges="mirror"
            frequency={7.6}
            strength={1}
            visible={true}
            waveType="square"
          />
        </Dither>
      </Shader>
    </div>
  );
}

function BackupHomeShaderBackground() {
  return (
    <div className="dw-home-shader-bg" aria-hidden="true">
      <Shader>
        <Swirl blend={68} colorA="#ded8dc" colorB="#ffffff" colorSpace="oklch" detail={1.2} speed={0.6} />
        <Dither blendMode="overlay" colorB="#cfc8cc" pixelSize={5} threshold={0.2} />
        <GridDistortion edges="mirror" gridSize={128} intensity={4.8} radius={2} />
        <Sharpness sharpness={1} />
        <FilmGrain strength={0} />
      </Shader>
    </div>
  );
}

function HomeShaderBackground() {
  return (
    <div className="dw-home-shader-bg" aria-hidden="true">
      <Shader>
        <Swirl colorA="#00000005" colorB="#f5f5f5" detail={0.5} />
        <FlutedGlass
          aberration={1}
          angle={118}
          frequency={4}
          highlight={2}
          highlightSoftness={0.23}
          lightAngle={-90}
          refraction={4}
          shape="waves"
          softness={1}
          waveAmplitude={0.11}
          waveFrequency={0.5}
        />
      </Shader>
    </div>
  );
}

function HomeIntroSection() {
  const greetings = ["Hello", "Bonjour", "Ciao", "Olá", "Hallå", "Guten Tag", "Բարև"];

  useEffect(() => {
    document.documentElement.classList.remove("dw-home-loader-done");
    document.documentElement.classList.remove("dw-home-loader-revealing");
    const previousOverflow = document.documentElement.style.overflow;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.style.overflow = "hidden";
    let refreshTimer = 0;
    const startReveal = () => {
      document.documentElement.classList.add("dw-home-loader-revealing");
    };
    const revealPage = () => {
      document.documentElement.classList.add("dw-home-loader-done");
      document.documentElement.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
      refreshTimer = window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("dw-home-intro-complete"));
        ScrollTrigger.refresh();
      }, reducedMotion ? 80 : 180);
    };
    const revealStartTimer = window.setTimeout(startReveal, reducedMotion ? 520 : 4280);
    const revealTimer = window.setTimeout(revealPage, reducedMotion ? 900 : 5400);

    return () => {
      window.clearTimeout(revealStartTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(refreshTimer);
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.classList.remove("dw-home-loader-revealing");
      document.documentElement.classList.remove("dw-home-loader-done");
    };
  }, []);

  return (
    <section className="dw-home-intro" aria-label="Loading the Pedanyan website">
      <div className="dw-home-intro-light" aria-hidden="true">
        <div className="dw-home-intro-greetings">
          {greetings.map((greeting, index) => (
            <span
              className={index === greetings.length - 1 ? "is-armenian" : undefined}
              style={{ "--greeting-index": index } as CSSProperties}
              key={greeting}
            >
              {greeting}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedHeroCopy({
  text,
  start,
  step
}: {
  text: string;
  start: number;
  step: number;
}) {
  return (
    <span className="dw-figma-type-segment" aria-hidden="true">
      {Array.from(text).map((character, index) => (
        <span
          className="dw-figma-type-char"
          style={{ "--char-delay": `${start + index * step}ms` } as CSSProperties}
          key={`${character}-${index}`}
        >
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </span>
  );
}

export function HeroSection() {
  const [heroFocus, setHeroFocus] = useState<"products" | "designers" | "culture" | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const productsLink = useResolvedNavLink("/am/designer");
  const designersLink = useResolvedNavLink("/am/school");
  const cultureLink = useResolvedNavLink("/am/public-work");

  useEffect(() => {
    const startTyping = () => setIsTyping(true);
    window.addEventListener("dw-home-intro-complete", startTyping);
    return () => window.removeEventListener("dw-home-intro-complete", startTyping);
  }, []);

  const handleHeroMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--hero-mx", `${x * -42}px`);
    event.currentTarget.style.setProperty("--hero-my", `${y * -42}px`);
    event.currentTarget.querySelectorAll<HTMLElement>("[data-float-depth]").forEach((element) => {
      const depth = Number(element.dataset.floatDepth || 1);
      element.style.setProperty("--float-x", `${x * -42 * depth}px`);
      element.style.setProperty("--float-y", `${y * -42 * depth}px`);
    });
  };

  const resetHeroMove = (event: MouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--hero-mx", "0px");
    event.currentTarget.style.setProperty("--hero-my", "0px");
    event.currentTarget.querySelectorAll<HTMLElement>("[data-float-depth]").forEach((element) => {
      element.style.setProperty("--float-x", "0px");
      element.style.setProperty("--float-y", "0px");
    });
    setHeroFocus(null);
  };

  const focusHeroWord = (word: "products" | "designers" | "culture") => ({
    onMouseEnter: () => setHeroFocus(word),
    onMouseLeave: () => setHeroFocus(null),
    onFocus: () => setHeroFocus(word),
    onBlur: () => setHeroFocus(null)
  });

  return (
    <section
      className={`dw-section dw-home-hero dw-figma-hero${isTyping ? " is-copy-typing" : ""}${heroFocus ? ` has-focus is-${heroFocus}` : ""}`}
      id="top"
      onMouseMove={handleHeroMove}
      onMouseLeave={resetHeroMove}
    >
      <div className="dw-home-hero-screen">
        <figure className="dw-home-hero-portrait-card" data-speed="-0.18" data-float-depth="0.2">
          <img src={figmaHeroPerson} alt="Davit Pedanyan seated on a studio stool" />
        </figure>

        <div className="dw-home-hero-statement" data-speed="0.12" data-float-depth="-0.08">
          <h1 aria-label="I build products, designers, and creative culture.">
            <span className="dw-figma-hero-line dw-figma-copy dw-figma-copy-build">
              <AnimatedHeroCopy text="I build" start={0} step={42} />
            </span>
            <span className="dw-figma-hero-line dw-figma-hero-line-products">
              <a
                className="dw-figma-hero-word dw-figma-copy dw-figma-copy-products"
                href={productsLink.href}
                target={productsLink.target}
                {...focusHeroWord("products")}
              >
                <AnimatedHeroCopy text="products" start={370} step={70} />
              </a>
              <span className="dw-figma-copy dw-figma-copy-products">
                <AnimatedHeroCopy text="," start={980} step={42} />
              </span>
            </span>
            <span className="dw-figma-hero-line">
              <a
                className="dw-figma-hero-word dw-figma-copy dw-figma-copy-designers"
                href={designersLink.href}
                target={designersLink.target}
                {...focusHeroWord("designers")}
              >
                <AnimatedHeroCopy text="designers" start={1140} step={70} />
              </a>
              <span className="dw-figma-copy dw-figma-copy-designers">
                <AnimatedHeroCopy text="," start={1820} step={42} />
              </span>
              <span className="dw-figma-copy dw-figma-copy-and">
                <AnimatedHeroCopy text=" and" start={1900} step={42} />
              </span>
            </span>
            <span className="dw-figma-hero-line">
              <a
                className="dw-figma-hero-word dw-figma-copy dw-figma-copy-culture"
                href={cultureLink.href}
                target={cultureLink.target}
                {...focusHeroWord("culture")}
              >
                <AnimatedHeroCopy text="creative culture" start={2230} step={65} />
              </a>
              <span className="dw-figma-copy dw-figma-copy-culture">
                <AnimatedHeroCopy text="." start={3270} step={42} />
              </span>
            </span>
          </h1>
        </div>

        <div className="dw-figma-hero-hover-layer" aria-hidden="true">
          <div className="dw-figma-hover-object dw-figma-hover-products">
            <div className="dw-figma-hover-crop">
              <img src={figmaHeroProductsObject} alt="" />
            </div>
          </div>
          <div className="dw-figma-hover-object dw-figma-hover-designers">
            <div className="dw-figma-hover-crop">
              <img src={figmaHeroDesignersObject} alt="" />
            </div>
          </div>
          <div className="dw-figma-hover-object dw-figma-hover-culture">
            <div className="dw-figma-hover-crop">
              <img src={figmaHeroCultureObject} alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DesignerScrollStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const investmentRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compactMotion = useMediaQuery("(max-width: 760px)");
  const useStaticMode = reducedMotion || compactMotion;

  useEffect(() => {
    if (useStaticMode || !sectionRef.current || !stickyRef.current) return;

    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const investmentCounter = { value: 0 };
    let cleanupTicker = () => {};
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        paused: true
      });
      const playback = { progress: 0, scrollTarget: 0, direction: 1, velocity: 0 };
      let lastTickTime = gsap.ticker.time;

      const stageFrom = {
        xPercent: -50,
        yPercent: -50,
        z: -1350,
        scale: 0.14,
        autoAlpha: 0,
        filter: "blur(12px)",
        transformOrigin: "50% 50%",
        transformPerspective: 1400
      };
      const stageFocus = {
        z: 0,
        scale: 1,
        autoAlpha: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
        rotationZ: 0,
        duration: 0.28
      };
      const stageExit = {
        yPercent: -50,
        z: 1050,
        scale: 2.15,
        autoAlpha: 0,
        filter: "blur(14px)",
        duration: 0.3
      };
      const revealCaption = (stage: HTMLElement, at: string | number = "<+=0.05") => {
        tl.to(stage.querySelectorAll(".dw-depth-char"), {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          stagger: 0.006,
          duration: 0.12
        }, at);
      };
      const updateSlot = () => {
        if (!investmentRef.current) return;
        const slotElement =
          investmentRef.current.querySelector<HTMLElement>(".dw-designer-slot-number") ??
          investmentRef.current;
        const value = Math.max(0, Math.min(27, Math.round(investmentCounter.value)));
        slotElement.textContent = `$${value}M`;
        slotElement.setAttribute("aria-label", `$${value}M`);
      };

      gsap.set(".dw-designer-stage", stageFrom);
      const stages = gsap.utils.toArray<HTMLElement>(".dw-designer-stage");
      stages.forEach((stage, index) => {
        const isFinal = stage.classList.contains("dw-designer-stat-final");
        const fromLeft = index % 2 === 0;
        gsap.set(stage, {
          x: isFinal ? 0 : fromLeft ? "-26vw" : "26vw",
          y: isFinal ? 0 : fromLeft ? "7vh" : "-6vh",
          rotationZ: isFinal ? 0 : fromLeft ? -2 : 2,
          scale: isFinal ? 0.05 : stageFrom.scale
        });
      });
      gsap.set(".dw-depth-char", { autoAlpha: 0, y: 16, filter: "blur(8px)" });
      gsap.to(".dw-depth-content", {
        scale: 1.035,
        y: -10,
        duration: 5.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      gsap.set(".dw-designer-glow", { scale: 0.55, autoAlpha: 0 });
      gsap.set(".dw-designer-particles-far", { z: -960, scale: 0.62, autoAlpha: 0.26, filter: "blur(0px)" });
      gsap.set(".dw-designer-particles-mid", { z: -640, scale: 0.72, autoAlpha: 0.34, filter: "blur(0px)" });
      gsap.set(".dw-designer-particles-near", { z: -300, scale: 0.84, autoAlpha: 0.3, filter: "blur(0px)" });
      gsap.set(".dw-designer-particles-front", { z: -80, scale: 0.92, autoAlpha: 0.18, filter: "blur(0px)" });
      gsap.set(".dw-designer-outline", { z: -240, scale: 0.62, autoAlpha: 0, filter: "blur(0px)" });
      if (investmentRef.current) updateSlot();
      gsap.to(".dw-designer-particle-layer", {
        z: "+=180",
        scale: "+=0.18",
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      tl.addLabel("open")
        .to(".dw-designer-outline", { z: -120, scale: 0.9, autoAlpha: 0.22, duration: 0.16 })
        .to(".dw-designer-particles-far", { z: -840, scale: 0.72, autoAlpha: 0.28, duration: 0.16 }, "<")
        .to(".dw-designer-particles-mid", { z: -540, scale: 0.82, autoAlpha: 0.36, duration: 0.16 }, "<")
        .to(".dw-designer-particles-near", { z: -220, scale: 0.94, autoAlpha: 0.3, duration: 0.16 }, "<")
        .to(".dw-designer-particles-front", { z: 40, scale: 1.04, autoAlpha: 0.16, duration: 0.16 }, "<")
        .to(".dw-designer-outline", { duration: 0.08 });

      let handoffProgress = 0.88;
      stages.forEach((stage, index) => {
        const isFinal = stage.classList.contains("dw-designer-stat-final");
        const fromLeft = index % 2 === 0;
        const progressRatio = stages.length > 1 ? index / (stages.length - 1) : 1;
        const stageStart = 0.22 + index * 0.42;
        const exitStart = stageStart + (isFinal ? 0.76 : 0.62);

        tl
          .addLabel(`stat-${index + 1}`, stageStart)
          .to(stage, { ...stageFocus, duration: isFinal ? 0.34 : 0.3 }, stageStart);
        revealCaption(stage, stageStart + 0.08);
        tl
          .to(".dw-designer-particles-far", {
            z: -780 + progressRatio * 480,
            scale: 0.78 + progressRatio * 0.48,
            autoAlpha: Math.max(0.1, 0.28 - progressRatio * 0.16),
            duration: 0.36
          }, stageStart)
          .to(".dw-designer-particles-mid", {
            z: -420 + progressRatio * 640,
            scale: 0.9 + progressRatio * 0.92,
            autoAlpha: Math.max(0.12, 0.36 - progressRatio * 0.2),
            filter: progressRatio > 0.72 ? "blur(6px)" : "blur(0px)",
            duration: 0.36
          }, stageStart)
          .to(".dw-designer-particles-near", {
            z: -120 + progressRatio * 900,
            scale: 1.04 + progressRatio * 1.5,
            autoAlpha: Math.max(0.04, 0.3 - progressRatio * 0.24),
            filter: progressRatio > 0.64 ? "blur(14px)" : "blur(0px)",
            duration: 0.36
          }, stageStart);

        if (isFinal) {
          const moneyReadableTime = stageStart + 0.04 + 0.72 * (26 / 27);
          handoffProgress = moneyReadableTime;
          tl
            .to(".dw-designer-particles-front", { z: 1020, scale: 2.9, autoAlpha: 0, filter: "blur(18px)", duration: 0.36 }, stageStart)
            .to(".dw-designer-glow", { autoAlpha: 0, scale: 0.8, duration: 0.3 }, stageStart)
            .to(investmentCounter, {
              value: 27,
              duration: 0.72,
              snap: { value: 1 },
              onUpdate: updateSlot
            }, stageStart + 0.04)
            .to(stage, { ...stageExit, x: 0, y: "-4vh", scale: 2.35, duration: 0.42 }, exitStart);
        } else {
          tl
            .to(".dw-designer-particles-front", {
              z: 120 + progressRatio * 760,
              scale: 1.18 + progressRatio * 1.4,
              autoAlpha: Math.max(0.08, 0.2 - progressRatio * 0.12),
              filter: progressRatio > 0.64 ? "blur(10px)" : "blur(0px)",
              duration: 0.36
            }, stageStart)
            .to(stage, {
              ...stageExit,
              x: fromLeft ? "18vw" : "-18vw",
              y: fromLeft ? "-8vh" : "8vh",
              duration: 0.42
            }, exitStart);
        }
      });

      tl
        .addLabel("transition")
        .to(".dw-designer-transition-glow", { autoAlpha: 0.55, scale: 2.2, duration: 0.22 })
        .to(".dw-designer-dots, .dw-designer-particle-layer", { autoAlpha: 0, duration: 0.16 }, "<")
        .to(".dw-designer-transition-glow", { autoAlpha: 0, scale: 2.8, duration: 0.22 });

      handoffProgress = Math.min(0.96, Math.max(0.72, handoffProgress / tl.duration()));

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${Math.max(520, stages.length * 130)}%`,
        pin: sticky,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          playback.scrollTarget = self.progress;
          playback.direction = self.direction;
          playback.velocity = Math.abs(self.getVelocity());
        },
        onLeave: () => {
          playback.scrollTarget = 1;
          playback.direction = 1;
          playback.velocity = Math.max(playback.velocity, 9000);
        },
        onLeaveBack: () => {
          playback.scrollTarget = 0;
          playback.direction = -1;
          playback.velocity = Math.max(playback.velocity, 9000);
        }
      });

      const tick = () => {
        const now = gsap.ticker.time;
        const delta = Math.min(0.08, now - lastTickTime);
        lastTickTime = now;
        const scrollGap = playback.scrollTarget - playback.progress;
        const idleSpeed = 0.022;
        const velocityCatchup = Math.min(1, Math.max(0.16, playback.velocity / 2600));
        const maxStep = Math.max(delta * idleSpeed, Math.abs(scrollGap) * velocityCatchup);

        if (scrollGap > 0.002) {
          playback.progress += Math.min(scrollGap, maxStep);
        } else if (scrollGap < -0.002 && playback.direction < 0) {
          playback.progress -= Math.min(-scrollGap, maxStep);
        } else if (playback.direction >= 0 && playback.progress < 1) {
          playback.progress += delta * idleSpeed;
        }

        playback.velocity *= 0.88;
        playback.progress = Math.max(0, Math.min(1, playback.progress));
        tl.progress(playback.progress);
      };

      gsap.ticker.add(tick);
      cleanupTicker = () => gsap.ticker.remove(tick);
    }, sticky);

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cleanupTicker();
      window.cancelAnimationFrame(refreshFrame);
      ctx.revert();
    };
  }, [useStaticMode]);

  if (useStaticMode) {
    return (
      <section className="dw-designer-static" id="designer">
        <div className="dw-designer-static-head">
          <span>{websiteContent.navigation.logo}</span>
          <span>DESIGNER</span>
        </div>
        {designerStats.map((stat) => (
          <div key={stat.value}>
            <h1>{stat.value}</h1>
            <p>{stat.caption}</p>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="dw-designer-scroll" id="designer" ref={sectionRef}>
      <div className="dw-designer-scene" ref={stickyRef}>
        <div className="dw-designer-bg" aria-hidden="true">
          <div className="dw-designer-dots" />
          <div className="dw-designer-particle-layer dw-designer-particles-far" />
          <div className="dw-designer-particle-layer dw-designer-particles-mid" />
          <div className="dw-designer-particle-layer dw-designer-particles-near" />
          <div className="dw-designer-particle-layer dw-designer-particles-front" />
          <div className="dw-designer-glow" />
          <div className="dw-designer-transition-glow" />
        </div>

        <div className="dw-designer-outline" aria-hidden="true">
          <span />
        </div>

        {designerStats.map((stat, index) => {
          const isFinal = stat.value.includes("27M");
          const sideClass = index % 2 === 0 ? "dw-designer-stat-left" : "dw-designer-stat-right";
          return (
            <div
              className={`dw-designer-stage dw-designer-stage-${index + 1} dw-designer-stat ${isFinal ? "dw-designer-stat-final" : sideClass}`}
              data-stat-index={index}
              key={`${stat.value}-${stat.caption}`}
            >
              <div className="dw-depth-content">
                {isFinal ? (
                  <div ref={investmentRef}>
                    <SlotMachineNumber />
                  </div>
                ) : (
                  <strong>{stat.value}</strong>
                )}
                <span><DepthTextReveal>{stat.caption}</DepthTextReveal></span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HomeScatterSection({
  id,
  eyebrow,
  title,
  labelA,
  labelB,
  items,
  tone = "light",
  imageSide = "left"
}: HomeScatterSectionProps) {
  return (
    <section className={`dw-section dw-home-scatter ${tone} ${imageSide}`} id={id}>
      <div className="dw-scatter-eyebrow">
        <span aria-hidden="true" />
        {eyebrow}
      </div>
      <h2>{title}</h2>
      <p className="dw-scatter-label dw-scatter-label-a">{labelA}</p>
      <p className="dw-scatter-label dw-scatter-label-b">{labelB}</p>
      <div className="dw-scatter-photo" data-speed="0.06">
        <ImagePlaceholder label="image placeholder" />
        <span aria-hidden="true" />
      </div>
      <div className="dw-scatter-black" data-speed="-0.04" aria-hidden="true">
        <span className="shape circle" />
        <span className="shape square" />
        <span className="shape slash" />
      </div>
      <span className="dw-scatter-dot" aria-hidden="true" />
      <div className="dw-scatter-list">
        {items.map((item, index) => (
          <article key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomeEcosystemSection() {
  return (
    <HomeScatterSection
      id="story"
      eyebrow="one ecosystem"
      title={
        <>
          product work,
          <br />
          education,
          <br />
          culture.
        </>
      }
      labelA="not a classic portfolio"
      labelB="three connected business paths"
      items={siteData.ecosystem.map((item) => `${item.title}: ${item.description}`)}
      imageSide="right"
    />
  );
}

export function HomeWorkWithDavitSection() {
  return (
    <HomeScatterSection
      id="design-talent"
      eyebrow="work with Davit"
      title={
        <>
          design talent
          <br />
          with judgment.
        </>
      }
      labelA="client leads"
      labelB="outstaffing / advisory / product direction"
      items={siteData.services.map((item) => `${item.title}: ${item.copy}`)}
      tone="cream"
    />
  );
}

export function HomeSchoolSection() {
  return (
    <HomeScatterSection
      id="school"
      eyebrow="Pedanyan School"
      title={
        <>
          beginners become
          <br />
          thinking designers.
        </>
      }
      labelA="student leads"
      labelB="program / critique / portfolio case"
      items={siteData.schoolStats.map(([value, label]) => `${value}: ${label}`)}
      imageSide="right"
    />
  );
}

export function HomeProofSection() {
  return (
    <HomeScatterSection
      id="proof"
      eyebrow="proof / authority"
      title={
        <>
          a career with
          <br />
          public weight.
        </>
      }
      labelA="education standards"
      labelB="design leadership in Armenia"
      items={siteData.proofPoints.slice(0, 6)}
      tone="dark"
    />
  );
}

export function HomeCultureSection() {
  return (
    <HomeScatterSection
      id="culture"
      eyebrow="culture / artmart"
      title={
        <>
          creative culture
          <br />
          is part of
          <br />
          the work.
        </>
      }
      labelA="artmart"
      labelB="events / talks / public education"
      items={[
        "Creative culture programs connected to design education.",
        "Public conversations around art, technology, and Armenia.",
        "A bridge between students, makers, companies, and cultural spaces."
      ]}
      imageSide="right"
    />
  );
}

export function HomeMediaPreviewSection() {
  return (
    <section className="dw-section dw-home-media-preview" id="public-work">
      <div className="dw-scatter-eyebrow">
        <span aria-hidden="true" />
        public and media
      </div>
      <h2>
        talks,
        <br />
        writing,
        <br />
        visible work.
      </h2>
      <div className="dw-home-media-grid">
        {mediaProjects.slice(0, 6).map((project) => (
          <article className={`dw-home-media-tile ${project.size}`} key={project.title}>
            <div className={`dw-media-visual ${project.tone}`}>
              <ImagePlaceholder label="image placeholder" />
            </div>
            <h3>{project.title}</h3>
            <p>{project.category}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomeThoughtsPreviewSection() {
  return (
    <section className="dw-section dw-home-thoughts" id="thoughts">
      <div className="dw-scatter-eyebrow">
        <span aria-hidden="true" />
        thoughts
      </div>
      <h2>
        clear positions,
        <br />
        not soft content.
      </h2>
      <div className="dw-thought-lines">
        {siteData.thoughts.map((thought) => (
          <article key={thought.title}>
            <h3>{thought.title}</h3>
            <p>{thought.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HomeFinalCtaSection() {
  return (
    <section className="dw-section dw-home-final-cta" id="contact">
      <h2>
        let's route
        <br />
        the right
        <br />
        conversation.
      </h2>
      <span className="dw-final-dot" aria-hidden="true" />
      <div className="dw-final-routes">
        {siteData.contactRoutes.map((route) => (
          <NavAnchor className="dw-final-route" href="/am/lets-talk" key={route}>
            <span>{route}</span>
            <span>+</span>
          </NavAnchor>
        ))}
      </div>
    </section>
  );
}

const homeProofItems = [
  "20+ years in design",
  "9+ years teaching",
  "17 startups",
  "100+ consultancies",
  "85 designers outstaffed",
  "$27M supported investment stories"
];

export function HomePositioningSection() {
  return (
    <section className="dw-section dw-home-positioning" id="story">
      <div className="dw-scatter-eyebrow">
        <span aria-hidden="true" />
        orientation
      </div>
      <p>
        I design products, teach beginners, and run public formats for Armenia's creative
        community.
      </p>
      <p>
        Choose the part you came for.
      </p>
    </section>
  );
}

export function HomePathCardsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !pathRef.current) return;

    const section = sectionRef.current;
    const path = pathRef.current;
    const content = section.querySelector<HTMLElement>(".dw-home-path-content");
    if (!content) return;

    const hiddenPath = "M 0 100 V 100 Q 50 100 100 100 V 100 z";
    const curvedPath = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
    const fullPath = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

    const reveal = gsap.timeline({ paused: true });
    gsap.set(path, { attr: { d: hiddenPath } });
    gsap.set(content, { autoAlpha: 0, y: 54 });

    reveal
      .to(path, {
        attr: { d: curvedPath },
        duration: 0.58,
        ease: "power2.in"
      })
      .to(path, {
        attr: { d: fullPath },
        duration: 0.72,
        ease: "power2.out"
      })
      .to(content, {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        ease: "power3.out"
      }, "-=0.42");

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      onEnter: () => reveal.play(),
      onLeaveBack: () => reveal.reverse()
    });

    return () => {
      trigger.kill();
      reveal.kill();
    };
  }, [reducedMotion]);

  return (
    <section className="dw-section dw-home-paths" id="routes" ref={sectionRef}>
      <svg
        className="dw-home-path-transition"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMin slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dw-home-path-gradient" x1="0" y1="0" x2="99" y2="99" gradientUnits="userSpaceOnUse">
            <stop offset="0.2" stopColor="rgb(255, 135, 9)" />
            <stop offset="0.7" stopColor="rgb(247, 189, 248)" />
          </linearGradient>
        </defs>
        <path
          ref={pathRef}
          className="dw-home-path-transition-shape"
          fill="url(#dw-home-path-gradient)"
          stroke="url(#dw-home-path-gradient)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          d={reducedMotion
            ? "M 0 100 V 0 Q 50 0 100 0 V 100 z"
            : "M 0 100 V 100 Q 50 100 100 100 V 100 z"}
        />
      </svg>
      <div className="dw-home-path-content">
        <div className="dw-scatter-eyebrow">
          <span aria-hidden="true" />
          choose a path
        </div>
        <h2>
          choose
          <br />
          where to go
          <br />
          next.
        </h2>
        <div className="dw-home-path-grid">
          {websiteContent.home.pathCards.map((card) => (
            <NavAnchor className="dw-home-path-card" href={card.href} key={card.title}>
              <span className="dw-path-dot" aria-hidden="true" />
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className="dw-path-cta">{card.cta}</span>
            </NavAnchor>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeProofStripSection() {
  return (
    <section className="dw-home-proof-strip" aria-label="Davit Pedanyan proof points">
      {homeProofItems.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </section>
  );
}

export function HomeStoryTeaserSection() {
  return (
    <section className="dw-section dw-home-story-teaser">
      <div className="dw-scatter-eyebrow">
        <span aria-hidden="true" />
        story
      </div>
      <p>
        I design products, teach beginners, and bring designers together through talks,
        workshops, and critique sessions in Armenia.
      </p>
      <NavAnchor className="dw-home-text-link" href="/am/public-work">
        Read my story
      </NavAnchor>
    </section>
  );
}

export function HomeTalkRoutingSection() {
  const footerRef = useRef<HTMLElement | null>(null);

  return (
    <section
      ref={footerRef}
      className="dw-section dw-home-final-cta dw-home-talk-routing"
      id="contact"
    >
      <h2 data-glass-capture>
        What should
        <br />
        we talk about?
      </h2>
      <span className="dw-final-dot" aria-hidden="true" />
      <div className="dw-final-routes">
        {websiteContent.home.talkRoutes.map((route) => (
          <NavAnchor className="dw-final-route" href="/am/lets-talk" key={route}>
            <span data-glass-capture>{route}</span>
            <span data-glass-capture>+</span>
          </NavAnchor>
        ))}
        <NavAnchor className="dw-home-talk-cta" href="/am/lets-talk">
          <span data-glass-capture>{websiteContent.home.talkCta}</span>
        </NavAnchor>
      </div>
      <RapierGlassCubes containerRef={footerRef} className="dw-footer-glass-cubes" />
    </section>
  );
}

function AnimatedAccentPath() {
  return (
    <svg className="dw-experience-path" viewBox="0 0 720 1100" preserveAspectRatio="none" aria-hidden="true">
      <path
        className="dw-experience-path-line"
        d="M520 60 C470 250 488 418 438 572 C388 724 408 884 340 1040"
      />
    </svg>
  );
}

function getCompanyLogoUrl(domain: string, sourceIndex: number) {
  const safeDomain = domain.trim();
  if (!safeDomain) return "";

  const sources = [
    `https://logo.clearbit.com/${safeDomain}`,
    `https://www.google.com/s2/favicons?domain=${safeDomain}&sz=128`
  ];

  return sources[sourceIndex] ?? "";
}

function ExperienceLogo({ company, domain }: { company: string; domain: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const logoUrl = getCompanyLogoUrl(domain, sourceIndex);
  const initials = company
    .split(/\s|\/|-/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className={`dw-experience-logo ${logoUrl ? "" : "is-fallback"}`} aria-hidden="true">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt=""
          onError={() => {
            setSourceIndex((current) => current + 1);
          }}
        />
      ) : null}
      {!logoUrl ? <span>{initials || company.slice(0, 2).toUpperCase()}</span> : null}
    </span>
  );
}

function ExperienceList({
  activeIndex,
  onSelect
}: {
  activeIndex: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <>
      <ol className="dw-experience-list">
      {experiences.map((experience, index) => (
        <li className={index === activeIndex ? "is-active" : ""} key={experience.company}>
          <button
            className="dw-experience-item-button"
            type="button"
            onClick={() => onSelect?.(index)}
            aria-current={index === activeIndex ? "step" : undefined}
          >
            <span className="dw-experience-company">{experience.company}</span>
            <span className="dw-experience-active-detail" aria-hidden={index !== activeIndex}>
              <ExperienceLogo company={experience.company} domain={experience.logoDomain} />
              <span className="dw-experience-meta">
                <span>{experience.role}</span>
                <span>{experience.type}</span>
              </span>
              <span className="dw-experience-description">{experience.description}</span>
            </span>
          </button>
        </li>
      ))}
      </ol>
    </>
  );
}

function ExperienceScrollSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compactMotion = useMediaQuery("(max-width: 760px)");
  const useStaticMode = reducedMotion || compactMotion;

  useEffect(() => {
    if (useStaticMode || !sectionRef.current || !sceneRef.current) return;

    const section = sectionRef.current;
    const scene = sceneRef.current;
    const ctx = gsap.context(() => {
      const line = scene.querySelector<SVGPathElement>(".dw-experience-path-line");
      const list = scene.querySelector<HTMLElement>(".dw-experience-list");
      const items = gsap.utils.toArray<HTMLElement>(".dw-experience-list li");

      if (!line || !list || items.length === 0) return;

      const lineLength = line.getTotalLength();
      gsap.set(line, {
        strokeDasharray: lineLength,
        strokeDashoffset: lineLength
      });
      gsap.set(items, { autoAlpha: 0.22, y: 28, scale: 0.96 });
      gsap.set(items[0], { autoAlpha: 1, y: 0, scale: 1 });

      const centerActiveItem = (index: number, immediate = false) => {
        const activeItem = items[index];
        if (!activeItem) return;
        const itemCenter = activeItem.offsetTop + activeItem.offsetHeight / 2;
        const targetY = scene.clientHeight / 2 - itemCenter;

        gsap.to(list, {
          y: targetY,
          duration: immediate ? 0 : 0.75,
          ease: "power3.out",
          overwrite: true
        });
      };

      centerActiveItem(0, true);

      const drawLine = gsap.quickTo(line, "strokeDashoffset", { duration: 0.5, ease: "power2.out" });
      const floatPath = gsap.quickTo(".dw-experience-path", "yPercent", { duration: 0.7, ease: "power2.out" });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: `+=${experiences.length * 72}%`,
        scrub: 1.2,
        pin: scene,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => centerActiveItem(activeIndexRef.current, true),
        onUpdate: (self) => {
          const preciseIndex = self.progress * (experiences.length - 1);
          const nextIndex = Math.min(
            experiences.length - 1,
            Math.max(0, Math.round(preciseIndex))
          );

          drawLine(lineLength * (1 - self.progress));
          floatPath(-8 * self.progress);

          if (nextIndex === activeIndexRef.current) return;
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
          centerActiveItem(nextIndex);

          items.forEach((item, index) => {
            const distance = Math.abs(index - nextIndex);
            gsap.to(item, {
              autoAlpha: index === nextIndex ? 1 : Math.max(0.16, 0.34 - distance * 0.06),
              y: index === nextIndex ? 0 : 26,
              scale: index === nextIndex ? 1 : 0.965,
              duration: 0.5,
              ease: "power3.out",
              overwrite: true
            });
          });
        }
      });
    }, scene);

    return () => ctx.revert();
  }, [useStaticMode]);

  if (useStaticMode) {
    return (
      <section className="dw-experience-static" aria-label="Work experience">
        <div className="dw-scatter-eyebrow">
          <span aria-hidden="true" />
          work experience
        </div>
        <div className="dw-experience-static-list">
          {experiences.map((experience, index) => (
            <article key={experience.company}>
              <div className="dw-experience-static-headline">
                <ExperienceLogo company={experience.company} domain={experience.logoDomain} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{experience.company}</h3>
              <p>{experience.role}</p>
              <p>{experience.description}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="dw-experience-scroll" aria-label="Work experience" ref={sectionRef}>
      <div className="dw-experience-scene" ref={sceneRef}>
        <AnimatedAccentPath />
        <ExperienceList activeIndex={activeIndex} />
      </div>
    </section>
  );
}

function HomeUnifiedScrollExperience() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const heroDustRef = useRef<HTMLDivElement | null>(null);
  const statsDustRef = useRef<HTMLDivElement | null>(null);
  const investmentRef = useRef<HTMLDivElement | null>(null);
  const selectExperienceRef = useRef<(index: number) => void>(() => undefined);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compactMotion = useMediaQuery("(max-width: 760px)");
  const useStaticMode = reducedMotion || compactMotion;

  useEffect(() => {
    if (useStaticMode || !sectionRef.current || !sceneRef.current) return;

    const section = sectionRef.current;
    const scene = sceneRef.current;
    const ctx = gsap.context(() => {
      const hero = scene.querySelector<HTMLElement>(".dw-home-unified-hero");
      const heroScreen = scene.querySelector<HTMLElement>(".dw-home-hero-screen");
      const statsPanel = scene.querySelector<HTMLElement>(".dw-home-unified-stats");
      const statStages = gsap.utils.toArray<HTMLElement>(".dw-home-unified-stat");
      const statContents = gsap.utils.toArray<HTMLElement>(".dw-home-unified-stat .dw-depth-content");
      const experiencePanel = scene.querySelector<HTMLElement>(".dw-home-unified-experience");
      const whitePanel = scene.querySelector<HTMLElement>(".dw-home-unified-white");
      const experienceList = scene.querySelector<HTMLElement>(".dw-experience-list");
      const experienceItems = gsap.utils.toArray<HTMLElement>(".dw-experience-list li");
      const line = scene.querySelector<SVGPathElement>(".dw-experience-path-line");

      if (
        !hero ||
        !heroScreen ||
        !statsPanel ||
        !experiencePanel ||
        !whitePanel ||
        !experienceList ||
        !line ||
        statStages.length === 0 ||
        experienceItems.length === 0
      ) return;

      const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      const investmentCounter = { value: 0 };
      const lineLength = line.getTotalLength();
      const factFocusTimes: number[] = [];
      const experienceFocusTimes: number[] = [];
      const playback = {
        time: 0,
        chapter: "hero" as "hero" | "facts" | "experience",
        activeFact: -1,
        activeExperience: 0,
        motionDirection: 1 as 1 | -1,
        speedMultiplier: 1,
        minimumUntil: 0,
        holdUntil: 0,
        autoAt: Number.POSITIVE_INFINITY,
        lastInputAt: gsap.ticker.time,
        cooldownUntil: 0,
        awaitingExitGesture: false
      };
      let lastTickTime = gsap.ticker.time;
      let motionTween: gsap.core.Tween | null = null;
      let finalHandoffCall: gsap.core.Tween | null = null;
      let speedResetCall: gsap.core.Tween | null = null;
      let correctingBoundary = false;
      let releasedForward = false;
      let exitingUp = false;
      let trigger: ScrollTrigger;
      let inputObserver: Observer;

      const updateSlot = () => {
        if (!investmentRef.current) return;
        const slotElement =
          investmentRef.current.querySelector<HTMLElement>(".dw-designer-slot-number") ??
          investmentRef.current;
        const value = Math.max(0, Math.min(27, Math.round(investmentCounter.value)));
        slotElement.textContent = `$${value}M`;
        slotElement.setAttribute("aria-label", `$${value}M`);
      };

      gsap.set(hero, { autoAlpha: 1 });
      gsap.set(heroScreen, { yPercent: 0, scale: 1, transformOrigin: "50% 50%" });
      gsap.set(statsPanel, {
        autoAlpha: 1,
        clipPath: "inset(100% 0% 0% 0%)",
        yPercent: 8,
        transformOrigin: "50% 100%"
      });
      gsap.set(statStages, {
        xPercent: -50,
        yPercent: -50,
        z: -1200,
        scale: 0.12,
        autoAlpha: 0,
        filter: "blur(10px)",
        transformPerspective: 1400,
        transformOrigin: "50% 50%"
      });
      gsap.set(experiencePanel, { autoAlpha: 0 });
      gsap.set(whitePanel, { autoAlpha: 0 });
      gsap.set(experienceItems, { autoAlpha: 0, y: 54, scale: 0.97 });
      gsap.set(line, { strokeDasharray: lineLength, strokeDashoffset: lineLength });
      updateSlot();

      timeline
        .to(heroScreen, {
          yPercent: -8,
          scale: 0.94,
          duration: HOME_NUMBERS_MOTION.heroReveal,
          ease: "power2.inOut"
        }, 0)
        .to(statsPanel, {
          clipPath: "inset(0% 0% 0% 0%)",
          yPercent: 0,
          duration: HOME_NUMBERS_MOTION.heroReveal,
          ease: "power3.inOut"
        }, 0)
        .to(hero, { autoAlpha: 0, duration: 0.01 }, HOME_NUMBERS_MOTION.heroHideAt);

      const heroTransitionEnd = HOME_NUMBERS_MOTION.heroTransitionEnd;
      const statsStart = HOME_NUMBERS_MOTION.numbersStart;
      const numberScaleInDuration = HOME_NUMBERS_MOTION.scaleIn;
      const numberScaleOutDuration = HOME_NUMBERS_MOTION.scaleOut;
      const numberFocusHold = HOME_NUMBERS_MOTION.focusHold;
      let nextStageStart = statsStart;
      let statsEnd: number = statsStart;
      let finalZoomEnd = 0;
      let investmentStart = Number.POSITIVE_INFINITY;
      statStages.forEach((stage, index) => {
        const isFinal = index === statStages.length - 1;
        const finalExtraHold = isFinal ? 4 : 0;
        const start = nextStageStart;
        const lifecycleDuration =
          numberScaleInDuration + numberFocusHold + finalExtraHold + numberScaleOutDuration;
        const fromLeft = index % 2 === 0;
        const entryX = isFinal ? 0 : fromLeft ? "-42vw" : "42vw";
        const focusY = isFinal ? 0 : fromLeft ? "4vh" : "-3vh";
        const exitX = isFinal ? 0 : fromLeft ? "62vw" : "-62vw";

        timeline
          .set(stage, { x: entryX, y: focusY, z: 0, scale: 0, autoAlpha: 0, filter: "blur(9px)" }, start)
          .to(
            stage,
            {
              x: exitX,
              duration: lifecycleDuration,
              ease: "numberTravelPath"
            },
            start
          )
          .fromTo(
            stage,
            { scale: 0 },
            {
              scale: isFinal ? 2.4 : 3.2,
              duration: isFinal ? 5 : lifecycleDuration,
              ease: "numberFastSlowFast"
            },
            start
          )
          .fromTo(
            stage,
            { autoAlpha: 0, filter: "blur(9px)" },
            {
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: lifecycleDuration * 0.25,
              ease: "none"
            },
            start
          )
;
        if (!isFinal) {
          timeline.to(
            stage,
            {
              autoAlpha: 0,
              filter: "blur(12px)",
              duration: lifecycleDuration * 0.18,
              ease: "none"
            },
            start + lifecycleDuration * 0.65
          );
        }

        if (isFinal) {
          investmentStart = start;
          timeline
            .to(
              investmentCounter,
              {
                value: 22,
                duration: HOME_NUMBERS_MOTION.countTo22,
                ease: "none",
                snap: { value: 1 },
                onUpdate: updateSlot
              },
              start + HOME_NUMBERS_MOTION.countStartDelay
            )
            .to(
              investmentCounter,
              {
                value: 27,
                duration: HOME_NUMBERS_MOTION.count22To27,
                ease: "power1.inOut",
                snap: { value: 1 },
                onUpdate: updateSlot,
                onComplete: () => {
                  investmentCounter.value = 27;
                  updateSlot();
                }
              },
              start + HOME_NUMBERS_MOTION.countStartDelay + HOME_NUMBERS_MOTION.countTo22
            );

          // $27M finale: the white figure zooms straight into the camera and
          // the frame bleeds to white, which becomes the timeline's canvas.
          const zoomAt = start + 5.15;
          finalZoomEnd = zoomAt + 1.1;
          timeline
            .to(stage, { scale: 15, duration: 1.05, ease: "power3.in" }, zoomAt)
            .to(whitePanel, { autoAlpha: 1, duration: 0.45, ease: "power2.in" }, zoomAt + 0.5)
            .to(statsPanel, { autoAlpha: 0, duration: 0.35 }, zoomAt + 0.62)
            .to(stage, { autoAlpha: 0, duration: 0.22, ease: "none" }, zoomAt + 0.88);
        }

        factFocusTimes.push(start + numberScaleInDuration);
        // Reveal the next number in the distance exactly when the current
        // number begins fading, creating a continuous depth handoff.
        nextStageStart = start + lifecycleDuration * 0.65;
        statsEnd = Math.max(
          statsEnd,
          isFinal ? finalZoomEnd : start + lifecycleDuration
        );
      });

      const experienceStart = statsEnd + 0.4;
      timeline
        .to(experiencePanel, { autoAlpha: 1, duration: 0.3 }, experienceStart)
        .to(whitePanel, { autoAlpha: 0, duration: 0.5 }, experienceStart + 0.55)
        .to(line, { strokeDashoffset: 0, duration: experiences.length * 0.66 }, experienceStart);

      // Timeline content cascades in from below, item by item.
      experienceItems.forEach((item, itemIndex) => {
        timeline.to(
          item,
          {
            autoAlpha: itemIndex === 0 ? 1 : Math.max(0.12, 0.28 - itemIndex * 0.045),
            y: itemIndex === 0 ? 0 : 12,
            duration: 0.5,
            ease: "power3.out"
          },
          experienceStart + 0.12 + itemIndex * 0.07
        );
      });

      experienceItems.forEach((activeItem, activeIndex) => {
        const start = experienceStart + activeIndex * 0.66;
        const itemCenter = activeItem.offsetTop + activeItem.offsetHeight / 2;
        const targetY = scene.clientHeight / 2 - itemCenter;
        experienceFocusTimes.push(start + 0.46);

        timeline.to(
          experienceList,
          { y: targetY, duration: 0.46, ease: "power3.inOut" },
          start
        );

        if (activeIndex > 0) {
          experienceItems.forEach((item, itemIndex) => {
            const distance = Math.abs(itemIndex - activeIndex);
            timeline.to(
              item,
              {
                autoAlpha: itemIndex === activeIndex ? 1 : Math.max(0.12, 0.28 - distance * 0.045),
                y: itemIndex === activeIndex ? 0 : 12,
                scale: itemIndex === activeIndex ? 1 : 0.97,
                duration: 0.34,
                ease: "power2.out"
              },
              start
            );
          });
        }
      });

      timeline.to({}, { duration: 0.54 });

      const timelineDuration = timeline.duration();

      const updateActiveExperience = () => {
        const currentTime = timeline.time();
        if (currentTime < experienceStart || experienceFocusTimes.length === 0) return;

        let nextIndex = 0;
        experienceFocusTimes.forEach((start, index) => {
          if (currentTime >= start - 0.12) nextIndex = index;
        });

        if (nextIndex !== activeIndexRef.current) {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
        }
      };

      const renderPlayback = () => {
        timeline.time(playback.time, false);
        if (Number.isFinite(investmentStart) && playback.time >= investmentStart) {
          const elapsed = Math.max(
            0,
            playback.time - investmentStart - HOME_NUMBERS_MOTION.countStartDelay
          );
          investmentCounter.value = elapsed <= HOME_NUMBERS_MOTION.countTo22
            ? 22 * (elapsed / HOME_NUMBERS_MOTION.countTo22)
            : 22 + 5 * Math.min(
                1,
                (elapsed - HOME_NUMBERS_MOTION.countTo22) / HOME_NUMBERS_MOTION.count22To27
              );
          updateSlot();
        }
        updateActiveExperience();
      };

      const releaseToPage = (direction: 1 | -1) => {
        inputObserver.disable();
        motionTween?.kill();
        motionTween = null;
        playback.speedMultiplier = 1;
        playback.time = direction > 0 ? timelineDuration : 0;
        renderPlayback();
        releasedForward = direction > 0;
        if (direction > 0) {
          trigger.scroll(trigger.end + 2);
          return;
        }
        // Exit upward: unpin, then glide the page to the very top so the
        // intro section is actually in view. While the glide runs, the
        // gesture's inertial tail must not re-capture the pinned scene.
        exitingUp = true;
        trigger.scroll(trigger.start - 2);
        const scrollProxy = { y: Math.max(0, trigger.start - 2) };
        gsap.to(scrollProxy, {
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          overwrite: true,
          onUpdate: () => window.scrollTo(0, scrollProxy.y),
          onComplete: () => {
            exitingUp = false;
          }
        });
      };

      const moveTo = (
        targetTime: number,
        duration: number,
        direction: 1 | -1,
        onComplete: () => void,
        ease = "power3.inOut"
      ) => {
        motionTween?.kill();
        playback.motionDirection = direction;
        motionTween = gsap.to(playback, {
          time: targetTime,
          duration,
          ease,
          overwrite: true,
          onUpdate: renderPlayback,
          onComplete: () => {
            motionTween = null;
            playback.speedMultiplier = 1;
            onComplete();
          }
        });
      };

      const enterHero = () => {
        playback.chapter = "hero";
        playback.activeFact = -1;
        playback.awaitingExitGesture = false;
        playback.minimumUntil = Number.POSITIVE_INFINITY;
        playback.holdUntil = Number.POSITIVE_INFINITY;
        playback.autoAt = Number.POSITIVE_INFINITY;
        moveTo(0, 0.9, -1, () => {
          releaseToPage(-1);
        });
      };

      const enterFacts = () => {
        playback.chapter = "facts";
        playback.activeFact = -1;
        playback.awaitingExitGesture = false;
        const now = gsap.ticker.time;
        playback.minimumUntil = now;
        playback.holdUntil = now + 1.2;
        playback.autoAt = now + 1.2;
      };

      const moveToFact = (index: number, direction: 1 | -1) => {
        finalHandoffCall?.kill();
        finalHandoffCall = null;
        if (index < 0) {
          enterHero();
          return;
        }

        const targetTime = factFocusTimes[index];
        if (targetTime === undefined) return;
        const isFinal = index === factFocusTimes.length - 1;
        playback.activeFact = index;
        playback.awaitingExitGesture = false;
        const timelineDistance = Math.abs(targetTime - playback.time);
        // Advance facts at a constant timeline rate. Easing each trip to a
        // focus marker made the controller decelerate to zero and restart for
        // every number, even though the number's own scale curve was smooth.
        moveTo(targetTime, Math.max(0.2, timelineDistance), direction, () => {
          const now = gsap.ticker.time;
          playback.minimumUntil = now;
          playback.holdUntil = now;
          if (direction < 0) {
            // Arrived here by scrolling back: hold on this number. The story
            // resumes only on the next downward gesture - never on its own.
            playback.autoAt = Number.POSITIVE_INFINITY;
            playback.awaitingExitGesture = false;
            return;
          }
          playback.autoAt = isFinal ? Number.POSITIVE_INFINITY : now;
          playback.awaitingExitGesture = isFinal;
          if (isFinal) {
            moveToExperience(0, 1, true);
          } else {
            moveToFact(index + 1, 1);
          }
        }, "none");
      };

      const moveToExperience = (
        index: number,
        direction: 1 | -1,
        fromFacts = false,
        requestedHold = 0
      ) => {
        const targetTime = experienceFocusTimes[index];
        if (targetTime === undefined) return;

        playback.chapter = "experience";
        playback.activeExperience = index;
        playback.awaitingExitGesture = false;
        activeIndexRef.current = index;
        setActiveIndex(index);
        const timelineDistance = Math.abs(targetTime - playback.time);
        moveTo(targetTime, fromFacts ? Math.max(0.2, timelineDistance) : HOME_NUMBERS_MOTION.experienceMove, direction, () => {
          const now = gsap.ticker.time;
          // Ignore the inertial tail of the wheel gesture that initiated this
          // transition; it must not advance a second experience item.
          playback.cooldownUntil = Math.max(playback.cooldownUntil, now + 0.55);
          playback.minimumUntil = now;
          playback.holdUntil = now + Math.max(
            requestedHold,
            index === experienceFocusTimes.length - 1 ? 1.4 : 0.35
          );
          playback.autoAt = index === experienceFocusTimes.length - 1
            ? Number.POSITIVE_INFINITY
            : now + 3.5;
          playback.awaitingExitGesture = index === experienceFocusTimes.length - 1;
        }, "power2.inOut");
      };

      const accelerateCurrentMotion = (deltaY: number) => {
        if (!motionTween) return;
        const maximumAdditionalSpeed = playback.chapter === "experience"
          ? 0.6
          : HOME_NUMBERS_MOTION.scrollMaxAdditionalSpeed;
        const requestedMultiplier = 1 + Math.min(
          maximumAdditionalSpeed,
          Math.abs(deltaY) / HOME_NUMBERS_MOTION.scrollSensitivity
        );
        playback.speedMultiplier = Math.min(
          1 + maximumAdditionalSpeed,
          Math.max(
            playback.speedMultiplier + Math.abs(deltaY) / (HOME_NUMBERS_MOTION.scrollSensitivity * 6),
            requestedMultiplier
          )
        );
        motionTween.timeScale(playback.speedMultiplier);
        speedResetCall?.kill();
        speedResetCall = gsap.delayedCall(HOME_NUMBERS_MOTION.scrollReleaseReset, () => {
          speedResetCall = null;
          playback.speedMultiplier = 1;
          motionTween?.timeScale(1);
        });
      };

      const handleInput = (deltaY: number) => {
        if (Math.abs(deltaY) < 2) return;

        finalHandoffCall?.kill();
        finalHandoffCall = null;

        const now = gsap.ticker.time;
        const direction = deltaY > 0 ? 1 : -1;
        playback.lastInputAt = now;

        if (motionTween) {
          // Same-direction input accelerates the transition already in progress.
          if (direction === playback.motionDirection) {
            accelerateCurrentMotion(deltaY);
            return;
          }
          // Opposite-direction input cancels it and steps back right away, so
          // scrolling up always returns toward the previous number / item / section.
          motionTween.kill();
          motionTween = null;
          playback.speedMultiplier = 1;
          playback.cooldownUntil = now + 0.3;
          if (playback.chapter === "hero") {
            if (direction < 0) releaseToPage(-1);
            return;
          }
          if (playback.chapter === "facts") {
            moveToFact(playback.activeFact + direction, direction);
            return;
          }
          if (direction < 0) {
            if (playback.activeExperience === 0) {
              playback.chapter = "facts";
              moveToFact(factFocusTimes.length - 1, -1);
            } else {
              moveToExperience(playback.activeExperience - 1, -1);
            }
          } else if (playback.activeExperience >= experienceFocusTimes.length - 1) {
            releaseToPage(1);
          } else {
            moveToExperience(playback.activeExperience + 1, 1);
          }
          return;
        }
        if (now < playback.cooldownUntil) return;

        playback.cooldownUntil = now + 0.25;
        playback.speedMultiplier = playback.chapter === "experience"
          ? 1 + Math.min(0.4, Math.abs(deltaY) / 500)
          : 1 + Math.min(1.1, Math.abs(deltaY) / 300);

        if (playback.chapter === "hero") {
          if (direction < 0) {
            releaseToPage(-1);
            return;
          }
          moveTo(heroTransitionEnd, 0.9, 1, () => {
            enterFacts();
            moveToFact(0, 1);
          });
          return;
        }

        if (playback.chapter === "facts") {
          if (direction < 0) {
            moveToFact(playback.activeFact - 1, -1);
            return;
          }
          if (now < playback.minimumUntil) {
            playback.holdUntil = playback.minimumUntil;
            playback.autoAt = playback.minimumUntil;
            return;
          }
          playback.holdUntil = now;
          playback.autoAt = now;
          if (playback.activeFact >= factFocusTimes.length - 1) {
            moveToExperience(0, 1, true);
            return;
          }
          moveToFact(playback.activeFact + 1, 1);
          return;
        }

        if (direction < 0) {
          if (playback.activeExperience === 0) {
            playback.chapter = "facts";
            moveToFact(factFocusTimes.length - 1, -1);
            return;
          }
          moveToExperience(playback.activeExperience - 1, -1);
          return;
        }

        if (playback.activeExperience >= experienceFocusTimes.length - 1) {
          releaseToPage(1);
          return;
        }
        moveToExperience(playback.activeExperience + 1, 1);
      };

      inputObserver = Observer.create({
        target: section,
        type: "wheel,touch",
        preventDefault: true,
        allowClicks: true,
        lockAxis: true,
        tolerance: 4,
        onDown: (self) => handleInput(Math.max(40, Math.abs(self.deltaY))),
        onUp: (self) => handleInput(-Math.max(40, Math.abs(self.deltaY)))
      });
      inputObserver.disable();

      const parallaxX = statContents.map((content) => gsap.quickTo(content, "x", {
        duration: HOME_NUMBERS_MOTION.mouseParallaxDuration,
        ease: "power3.out"
      }));
      const parallaxY = statContents.map((content) => gsap.quickTo(content, "y", {
        duration: HOME_NUMBERS_MOTION.mouseParallaxDuration,
        ease: "power3.out"
      }));
      const resetNumberParallax = () => {
        parallaxX.forEach((move) => move(0));
        parallaxY.forEach((move) => move(0));
      };
      const handleNumberParallax = (event: PointerEvent) => {
        if (playback.chapter !== "facts") {
          resetNumberParallax();
          return;
        }
        const rect = section.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * HOME_NUMBERS_MOTION.mouseParallax;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * HOME_NUMBERS_MOTION.mouseParallax;
        parallaxX.forEach((move) => move(x));
        parallaxY.forEach((move) => move(y));
      };
      section.addEventListener("pointermove", handleNumberParallax, { passive: true });
      section.addEventListener("pointerleave", resetNumberParallax);

      const pauseExperienceAuto = () => {
        if (playback.chapter !== "experience") return;
        playback.autoAt = Number.POSITIVE_INFINITY;
      };
      const resumeExperienceAuto = () => {
        if (playback.chapter !== "experience" || playback.awaitingExitGesture) return;
        const now = gsap.ticker.time;
        playback.lastInputAt = now;
        playback.autoAt = now + 3.5;
      };
      experienceItems.forEach((item) => {
        item.addEventListener("pointerenter", pauseExperienceAuto);
        item.addEventListener("pointerleave", resumeExperienceAuto);
        item.addEventListener("focusin", pauseExperienceAuto);
        item.addEventListener("focusout", resumeExperienceAuto);
      });

      trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=100%",
        pin: scene,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: (self) => {
          if (exitingUp) return;
          releasedForward = false;
          if (self.scroll() <= self.start) self.scroll(self.start + 1);
          inputObserver.enable();
        },
        onEnterBack: () => {
          if (correctingBoundary) {
            inputObserver.enable();
            return;
          }
          if (!releasedForward) {
            inputObserver.enable();
            return;
          }
          releasedForward = false;
          playback.time = timelineDuration;
          playback.chapter = "experience";
          playback.activeExperience = experienceFocusTimes.length - 1;
          playback.motionDirection = -1;
          playback.speedMultiplier = 1;
          playback.minimumUntil = gsap.ticker.time;
          playback.holdUntil = gsap.ticker.time + 0.35;
          playback.autoAt = Number.POSITIVE_INFINITY;
          playback.awaitingExitGesture = true;
          renderPlayback();
          inputObserver.enable();
        },
        onLeave: (self) => {
          if (playback.time < timelineDuration - 0.001) {
            if (playback.chapter === "hero" && playback.time <= 0.001 && !motionTween) {
              handleInput(240);
            }
            correctingBoundary = true;
            self.scroll(self.end - 2);
            inputObserver.enable();
            window.requestAnimationFrame(() => {
              correctingBoundary = false;
            });
          }
        },
        onLeaveBack: () => inputObserver.disable()
      });
      if (trigger.isActive) {
        if (trigger.scroll() <= trigger.start) trigger.scroll(trigger.start + 1);
        inputObserver.enable();
      }

      selectExperienceRef.current = (index: number) => {
        const targetTime = experienceFocusTimes[index];
        if (targetTime === undefined) return;

        const direction = index >= playback.activeExperience ? 1 : -1;
        moveToExperience(index, direction, false, 2);
      };

      const tick = () => {
        const now = gsap.ticker.time;
        const delta = Math.min(0.06, now - lastTickTime);
        lastTickTime = now;
        const timelineTime = playback.time;
        const dustSpeedBoost = Math.min(0.35, (playback.speedMultiplier - 1) * 0.175);
        const heroDustIsActive = timelineTime < 0.24;
        const dustIsActive = timelineTime >= 0.24 && timelineTime < experienceStart - 0.14;
        const factsAreEntering = timelineTime >= 0.08 && timelineTime < experienceStart - 0.14;
        const factsHaveCoveredHeader = timelineTime >= 0.98 && timelineTime < experienceStart - 0.14;

        if (heroDustRef.current) {
          heroDustRef.current.dataset.dustActive = String(heroDustIsActive);
          heroDustRef.current.dataset.dustSpeed = String(
            BASE_HERO_DUST_SPEED * (1 + dustSpeedBoost)
          );
        }
        if (statsDustRef.current) {
          statsDustRef.current.dataset.dustActive = String(dustIsActive);
          statsDustRef.current.dataset.dustSpeed = String(
            BASE_DUST_SPEED * (1 + dustSpeedBoost)
          );
        }
        document.documentElement.classList.toggle("dw-cosmic-stats-entering", factsAreEntering);
        document.documentElement.classList.toggle("dw-cosmic-stats-active", factsHaveCoveredHeader);

        motionTween?.timeScale(playback.speedMultiplier);

        // Chapter changes are gesture-driven. Nothing advances in the
        // background while the user is reading or interacting elsewhere.
      };

      gsap.ticker.add(tick);

      const refreshUnifiedScroll = () => {
        window.requestAnimationFrame(() => trigger.refresh());
      };
      window.addEventListener("dw-home-intro-complete", refreshUnifiedScroll);

      return () => {
        inputObserver.disable();
        motionTween?.kill();
        finalHandoffCall?.kill();
        speedResetCall?.kill();
        section.removeEventListener("pointermove", handleNumberParallax);
        section.removeEventListener("pointerleave", resetNumberParallax);
        selectExperienceRef.current = () => undefined;
        gsap.ticker.remove(tick);
        experienceItems.forEach((item) => {
          item.removeEventListener("pointerenter", pauseExperienceAuto);
          item.removeEventListener("pointerleave", resumeExperienceAuto);
          item.removeEventListener("focusin", pauseExperienceAuto);
          item.removeEventListener("focusout", resumeExperienceAuto);
        });
        window.removeEventListener("dw-home-intro-complete", refreshUnifiedScroll);
        document.documentElement.classList.remove("dw-cosmic-stats-entering");
        document.documentElement.classList.remove("dw-cosmic-stats-active");
      };
    }, scene);

    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      ctx.revert();
    };
  }, [useStaticMode]);

  if (useStaticMode) {
    return (
      <div className="dw-home-unified-static">
        <HeroSection />
        <DesignerScrollStory />
        <ExperienceScrollSection />
      </div>
    );
  }

  return (
    <section className="dw-home-unified-scroll" ref={sectionRef} aria-label="Davit Pedanyan overview">
      <div className="dw-home-unified-scene" ref={sceneRef}>
        <div className="dw-scroll-hint" aria-hidden="true">
          <span className="dw-scroll-hint-line" />
          <span className="dw-scroll-hint-text">scroll</span>
        </div>
        <div
          className="dw-home-unified-phase dw-home-unified-hero"
          ref={heroDustRef}
          data-dust-active="true"
          data-dust-speed={BASE_HERO_DUST_SPEED}
        >
          <CosmicDustBackground speedSourceRef={heroDustRef} variant="hero" />
          <HeroSection />
        </div>

        <div
          className="dw-home-unified-phase dw-home-unified-stats"
          ref={statsDustRef}
          aria-label="Design facts"
        >
          <CosmicDustBackground speedSourceRef={statsDustRef} variant="facts" />
          {designerStats.map((stat, index) => {
            const isFinal = index === designerStats.length - 1;
            const sideClass = index % 2 === 0 ? "dw-designer-stat-left" : "dw-designer-stat-right";
            return (
              <div
                className={`dw-home-unified-stat dw-designer-stage dw-designer-stat ${isFinal ? "dw-designer-stat-final" : sideClass}`}
                key={`${stat.value}-${stat.caption}`}
              >
                <div className="dw-depth-content">
                  {isFinal ? (
                    <div ref={investmentRef}><SlotMachineNumber /></div>
                  ) : (
                    <strong>{stat.value}</strong>
                  )}
                  <span>{stat.caption}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dw-home-unified-phase dw-home-unified-white" aria-hidden="true" />

        <div className="dw-home-unified-phase dw-home-unified-experience" aria-label="Work experience">
          <AnimatedAccentPath />
          <ExperienceList
            activeIndex={activeIndex}
            onSelect={(index) => selectExperienceRef.current(index)}
          />
        </div>
      </div>
    </section>
  );
}

function DesignerFinalSection() {
  return (
    <section className="dw-designer-finale" aria-label="Work with Davit">
      <div className="dw-designer-finale-mark" aria-hidden="true">
        <img src="/brand/pdnyn-handdrawn.png" alt="" />
      </div>
      <div className="dw-designer-finale-copy">
        <span className="dw-scatter-eyebrow">
          <span aria-hidden="true" />
          next move
        </span>
        <h2>
          Bring me in
          <br />
          when the design
          <br />
          needs direction.
        </h2>
        <p>
          I can review your product, define the design role you need, or turn scattered decisions
          into a plan your team can use.
        </p>
        <NavAnchor className="dw-designer-finale-cta" href="/am/lets-talk">
          Let’s talk
        </NavAnchor>
      </div>
    </section>
  );
}

export function EcosystemSection() {
  return (
    <section className="dw-section dw-split" id="story">
      <div className="dw-sticky">
        <Eyebrow>personal brand ecosystem</Eyebrow>
        <h2>{siteData.brand.coreStatement}</h2>
        <p className="dw-lead">
          This MVP is built around three outcomes: client leads, student leads, and public
          authority. Not a gallery. Not a classic portfolio.
        </p>
      </div>
      <div className="dw-grid-cards">
        {siteData.ecosystem.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>
    </section>
  );
}

export function DesignTalentSection() {
  return (
    <section className="dw-section dw-works" id="design-talent">
      <Eyebrow>design talent</Eyebrow>
      <h2>
        the right designer,
        <br />
        not just any designer.
      </h2>
      <p className="dw-lead dw-section-lead">
        For companies that need product design talent, product thinking, or supervised design
        execution without building a full in-house design team first.
      </p>
      {siteData.services.map((row) => (
        <div className="dw-work-row" key={row.title}>
          <div className="dw-work-title">{row.title}</div>
          <div className="dw-work-copy">
            <p>{row.copy}</p>
            <small>{row.detail}</small>
          </div>
          <div className={`dw-thumb ${row.acid ? "acid" : ""}`} data-speed={row.speed} />
        </div>
      ))}
    </section>
  );
}

export function SchoolSection() {
  const schoolStats = websiteContent.school?.stats?.length
    ? websiteContent.school.stats
    : siteData.schoolStats.map(([value, label]) => ({ value, label }));
  const schoolActions = websiteContent.school?.actions?.length
    ? websiteContent.school.actions
    : [
        { label: "Ask about the school", href: "/am/lets-talk" },
        { label: "Book open lesson", href: "/am/lets-talk" }
      ];

  return (
    <section className="dw-section dw-school" id="school">
      <div className="dw-school-hero">
        <div>
          <Eyebrow>{websiteContent.school?.hero?.eyebrow ?? "Pedanyan School"}</Eyebrow>
          <h2>{renderMultilineText(websiteContent.school?.hero?.headline ?? ["Learn design", "through practice", "and critique."])}</h2>
        </div>
        <p className="dw-lead">
          {websiteContent.school?.hero?.lead ??
            "I teach beginners in Armenia to research problems, critique work, use modern tools, and build one product case they can defend."}
        </p>
        <span className="dw-school-dot" aria-hidden="true" />
      </div>

      <div className="dw-school-path">
        {schoolStats.map(({ value, label }, index) => (
          <article className="dw-school-row" key={value}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{value}</strong>
            <p>{label}</p>
          </article>
        ))}
      </div>

      <div className="dw-school-actions">
        {schoolActions.map((action) => (
          <NavAnchor href={action.href} key={action.label}>{action.label}</NavAnchor>
        ))}
      </div>

      <div className="dw-school-note">
        <span aria-hidden="true" />
        <p>
          {websiteContent.school?.note ??
            "Classes happen in person, with online support between sessions. Each group stays small so everyone gets direct critique."}
        </p>
      </div>
    </section>
  );
}

export function SchoolStandardsSection() {
  const standards = websiteContent.school?.standards?.length
    ? websiteContent.school.standards
    : [
        {
          title: "Thinking before screens",
          copy: "Students research the problem, ask useful questions, and explain each design choice."
        },
        {
          title: "Critique as a habit",
          copy: "We review work in the room, challenge weak choices, and revise until the reasoning holds."
        },
        {
          title: "Tools with taste",
          copy: "Figma and AI support the work. Judgment, structure, and visual clarity decide the result."
        }
      ];

  return (
    <section className="dw-school-editorial dw-school-standards" aria-label="School standards">
      <div className="dw-scatter-eyebrow">
        <span aria-hidden="true" />
        standards
      </div>
      <h2>
        small groups.
        <br />
        direct critique.
      </h2>
      <div className="dw-school-standard-list">
        {standards.map((item, index) => (
          <article key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SchoolPracticeSection() {
  const practices = websiteContent.school?.practice?.items?.length
    ? websiteContent.school.practice.items
    : [
        "Product thinking",
        "Interface structure",
        "Figma workflow",
        "AI-assisted process",
        "Critique sessions",
        "Portfolio case"
      ];

  return (
    <section className="dw-school-editorial dw-school-practice" aria-label="What students practice">
      <div className="dw-school-practice-head">
        <div className="dw-scatter-eyebrow">
          <span aria-hidden="true" />
          practice
        </div>
        <h2>
          what we
          <br />
          actually do.
        </h2>
      </div>
      <div className="dw-school-practice-list">
        {practices.map((practice) => (
          <article key={practice}>
            <span aria-hidden="true" />
            <p>{practice}</p>
          </article>
        ))}
      </div>
      <p className="dw-school-practice-copy">
        {websiteContent.school?.practice?.copy ??
          "Students repeat the work, get direct critique, and finish with a case that explains the thinking behind each screen."}
      </p>
    </section>
  );
}

export function SchoolFinalSection() {
  return (
    <section className="dw-school-editorial dw-school-final" id="contact">
      <h2>{renderMultilineText(websiteContent.school?.final?.headline ?? ["want to", "learn design?"])}</h2>
      <div className="dw-school-final-copy">
        <p>
          {websiteContent.school?.final?.text ??
            "Tell me what you have tried, what you want to learn, and how much time you can give the program."}
        </p>
        <NavAnchor href={websiteContent.school?.final?.href ?? "/am/lets-talk"}>
          {websiteContent.school?.final?.cta ?? "Ask about the school"}
        </NavAnchor>
      </div>
      <span className="dw-school-final-dot" aria-hidden="true" />
    </section>
  );
}

export function ProofSection() {
  return (
    <section className="dw-section dw-proof">
      <div className="dw-sticky">
        <Eyebrow>proof / authority</Eyebrow>
        <h2>why the ecosystem has weight.</h2>
        <p className="dw-lead">
          Twenty years of product work, nine years of teaching, and programs built for designers
          in Armenia.
        </p>
      </div>
      <div className="dw-proof-grid">
        {siteData.proofPoints.map((point, index) => (
          <div className="dw-proof-item" key={point}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{point}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PublicWorkSection() {
  return (
    <section className="dw-section" id="public-work">
      <Eyebrow>public work</Eyebrow>
      <h2>
        talks, writing,
        <br />
        artmart, culture.
      </h2>
      <p className="dw-lead">
        I speak, teach, write, and run events for designers and creative people in Armenia.
      </p>
      <div className="dw-media-grid">
        {siteData.publicWork.map(([tag, title]) => (
          <div className="dw-media-item" key={title}>
            <span className="dw-tag">{tag}</span>
            <b>{title}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PublicMediaGridPageSection() {
  return (
    <section className="dw-media-page" id="public-work">
      <section className="dw-public-media-section" aria-label="Public and media">
        <div className="dw-public-intro">
        <h1>{renderMultilineText(websiteContent.public?.intro?.headline ?? ["public work,", "formats,", "and media."])}</h1>
        <p className="dw-public-intro-copy">
          {websiteContent.public?.intro?.text ??
            "I host talks, workshops, UX Storm, Drunk Talks, and critique nights for designers in Armenia. I also speak, teach, and join public conversations about design."}
        </p>
        </div>

        <section className="dw-public-blog">
        <div className="dw-scatter-eyebrow">
          <span aria-hidden="true" />
          blog categories
        </div>
        <div className="dw-public-category-grid">
          {publicBlogCategories.map((category) => (
            <article key={category.title}>
              <span>{category.count}</span>
              <h2>{category.title}</h2>
              <p>{category.description}</p>
            </article>
          ))}
        </div>
        </section>

        <section className="dw-drunk-talks">
        <div className="dw-drunk-copy">
          <div className="dw-scatter-eyebrow">
            <span aria-hidden="true" />
            Drunk Talks
          </div>
          <h2>{renderMultilineText(websiteContent.public?.drunkTalks?.headline ?? ["drinks,", "designers,", "open talk."])}</h2>
          <p>
            {websiteContent.public?.drunkTalks?.text ??
              "I invite local and visiting designers for a drink and an unscripted conversation with the room."}
          </p>
        </div>
        <div className="dw-drunk-gallery">
          {drunkTalksGallery.map((item) => (
            <article className={`dw-drunk-card ${item.size}`} key={item.title}>
              <div className={`dw-media-visual ${item.tone}`}>
                <ImagePlaceholder label="image placeholder" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
        </section>

        <section className="dw-public-formats">
        <div className="dw-scatter-eyebrow">
          <span aria-hidden="true" />
          formats to keep
        </div>
        <div className="dw-public-format-list">
          {publicFormats.map((format) => (
            <article key={format.title}>
              <h2>{format.title}</h2>
              <p>{format.description}</p>
            </article>
          ))}
        </div>
        </section>

        <section className="dw-public-archive">
        <div className="dw-scatter-eyebrow">
          <span aria-hidden="true" />
          archive / media
        </div>
        <h2>
          public work
          <br />
          in images.
        </h2>
        <div className="dw-media-project-grid">
          {mediaProjects.map((project) => (
            <article className={`dw-media-project ${project.size}`} key={project.title}>
              <div className={`dw-media-visual ${project.tone}`}>
                <ImagePlaceholder label="image placeholder" />
              </div>
              <h2>{project.title}</h2>
              <p>{project.category}</p>
            </article>
          ))}
        </div>
      </section>
      </section>
    </section>
  );
}

export function ThoughtsSection() {
  return (
    <section className="dw-section" id="thoughts">
      <Marquee>
        AI will not kill design <span>*</span> weak taste will <span>*</span> weak education will{" "}
        <span>*</span> weak thinking will <span>*</span>
      </Marquee>
      <div className="dw-split dw-inner-split">
        <div>
          <Eyebrow>thought leadership</Eyebrow>
          <h2>bold opinions, clear teaching.</h2>
        </div>
        <div className="dw-grid-cards">
          {siteData.thoughts.map((thought) => (
            <Card
              key={thought.title}
              number="post"
              title={thought.title}
              description={thought.description}
              tag="content pillar"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section className="dw-section dw-footer-cta" id="contact">
      <div>
        <Eyebrow>let's talk</Eyebrow>
        <h2>
          what should
          <br />
          we talk about?
        </h2>
        <p className="dw-lead">
          Tell me whether you need design help, want to invite me, have a school question, or want
          to work together.
        </p>
      </div>
      <div className="dw-cta-list">
        {websiteContent.sharedContactRoutes.map((route) => (
          <NavAnchor className="dw-cta-row" href="/am/lets-talk" key={route}>
            <span>{route}</span>
            <span>+</span>
          </NavAnchor>
        ))}
      </div>
    </section>
  );
}

export function LetsTalkPage() {
  return (
    <PageShell className="dw-talk-shell" activePage="letsTalk">
      <section className="dw-talk-page">
        <div className="dw-talk-bg-placeholder" aria-hidden="true" />
        <h1>
          {renderMultilineText(websiteContent.letsTalk.headline)}
        </h1>

        {websiteContent.letsTalk.routes.map((route) => (
          <div className={`dw-talk-route ${route.className}`} key={route.label}>
            <div className="dw-talk-label">
              <span aria-hidden="true" />
              {route.label}
            </div>
            <p>{route.text}</p>
            {route.cta && route.href ? <NavAnchor href={route.href}>{route.cta}</NavAnchor> : null}
          </div>
        ))}
      </section>
    </PageShell>
  );
}

export function HomePage() {
  return (
    <PageShell className="dw-home-shell" activePage="home">
      <HomeIntroSection />
      <HomeUnifiedScrollExperience />
      <HomePathCardsSection />
    </PageShell>
  );
}

export function DesignerPage() {
  return (
    <PageShell activePage="designer">
      <PortfolioIndexContent />
    </PageShell>
  );
}

export function PortfolioPage() {
  return <DesignerPage />;
}

export function ProjectPage({ slug }: { slug: string }) {
  return (
    <PageShell activePage="designer">
      <CaseStudyContent slug={slug} />
    </PageShell>
  );
}

export function CloudChiprProjectPage() {
  return <ProjectPage slug="cloudchipr" />;
}

export function MaterialExchangeProjectPage() {
  return <ProjectPage slug="material-exchange" />;
}

export function SecurionProjectPage() {
  return <ProjectPage slug="securion" />;
}

export function MaterialExchangePhotoLabProjectPage() {
  return <ProjectPage slug="material-exchange-photo-lab" />;
}

export function HotelApartmentsProjectPage() {
  return <ProjectPage slug="hotel-apartments" />;
}

export function DesignTalentPage() {
  return <DesignerPage />;
}

export function StoryPage() {
  return (
    <PageShell activePage="publicWork">
      <section className="dw-section dw-hero dw-page-hero">
        <div className="dw-hero-left">
          <div>
            <Eyebrow>story</Eyebrow>
            <h1>
              designer,
              <br />
              educator,
              <br />
              culture builder.
            </h1>
            <p className="dw-hero-text">
              Davit's personal brand connects product work, design education, and creative culture
              in Armenia.
            </p>
          </div>
        </div>
        <VisualStack label="career / school / artmart" />
      </section>
      <EcosystemSection />
      <ProofSection />
      <ThoughtsSection />
    </PageShell>
  );
}

export function SchoolPage() {
  return <ComingSoonPage title="School" activePage="school" />;
}

export function PublicWorkPage() {
  return <ComingSoonPage title="Public" activePage="publicWork" />;
}

function ComingSoonPage({ title, activePage }: { title: "Public" | "School"; activePage: PageKey }) {
  return (
    <PageShell activePage={activePage}>
      <section className="dw-coming-soon">
        <Eyebrow>{title}</Eyebrow>
        <h1>coming<br />soon.</h1>
        <p>I'm shaping this part of the site. In the meantime, find me on LinkedIn.</p>
        <a className="dw-coming-soon-link" href={DAVIT_LINKEDIN_URL} target="_blank" rel="noreferrer">
          Connect on LinkedIn
        </a>
      </section>
    </PageShell>
  );
}

export function FullWireframe() {
  return <HomePage />;
}

export function AppRouter() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path === "/am/designer" || path === "/am/portfolio") return <DesignerPage />;
  const projectMatch = path.match(/^\/am\/projects\/([^/]+)$/);
  if (projectMatch) return <ProjectPage slug={projectMatch[1]} />;
  const legacyProjects: Record<string, string> = {
    "/cloudchipr": "cloudchipr",
    "/material-exchange": "material-exchange",
    "/securion": "securion",
    "/material-exchange-photo-lab": "material-exchange-photo-lab",
    "/hotel-apartments": "hotel-apartments"
  };
  if (legacyProjects[path]) return <ProjectPage slug={legacyProjects[path]} />;
  if (path === "/am/design-talent") return <DesignTalentPage />;
  if (path === "/am/story") return <PublicWorkPage />;
  if (path === "/am/school") return <SchoolPage />;
  if (path === "/am/public-work") return <PublicWorkPage />;
  if (path === "/am/lets-talk") {
    window.location.replace(DAVIT_LINKEDIN_URL);
    return null;
  }
  return <HomePage />;
}
