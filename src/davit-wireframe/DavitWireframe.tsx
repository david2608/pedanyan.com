import { createContext, lazy, Suspense, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { Observer } from "gsap/Observer";
import { applyHead } from "../seo/head";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink, Menu, MessageCircle, Play, X } from "lucide-react";
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
import figmaHeroProductsObject from "../assets/figma-hero/hover-products.png";
import figmaHeroDesignersObject from "../assets/figma-hero/hover-designers.png";
import figmaHeroCultureObject from "../assets/figma-hero/hover-culture.png";
import { CosmicDustBackground } from "./CosmicDustBackground";
import { RapierGlassCubes } from "./HomeRapierGlassBackground";
import { PortfolioMusicToggle } from "./PortfolioMusicToggle";
import { MediaCarousel } from "./MediaCarousel";
import { CHAT_AVATAR, ContactChat, openContactChat } from "./ContactChat";
import { PullToContinue } from "./PullToContinue";
import { initAnalytics, trackPageView } from "../analytics/ga";
import { useReadDepth } from "../analytics/readDepth";
import { OctagonField } from "./OctagonField";
import {
  ExperienceDetailModal,
  experienceBody,
  experienceSummary,
  type ExperienceModalPayload
} from "./ExperienceDetail";
import { POKE_EVENT, useCharacterMotion } from "./characterMotion";
import { GONE_EVENT, HeroCharacterVideo, isHeroGone } from "./characterVideo";
import { useTextMotion } from "./textMotion";
import { siteData } from "./siteData";
import { websiteContent } from "./websiteContent";

// Case studies are intentionally separate from the home bundle: their media
// and content only matter after someone chooses to view the work.
const LazyPortfolioIndexContent = lazy(() =>
  import("./PortfolioPages").then((module) => ({ default: module.PortfolioIndexContent }))
);
const LazyCaseStudyContent = lazy(() =>
  import("./PortfolioPages").then((module) => ({ default: module.CaseStudyContent }))
);

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

const publicArchiveEntries = [
  {
    slug: "ux-storm-1-4",
    year: "2025",
    publishedAt: "2025-12-12",
    type: "UX Storm 1.4 / product design",
    title: "UX Storm 1.4 — the new era of product designers.",
    description: "Three talks and three speed-discussion tables explored how product designers move from interface execution toward strategy, judgement, and intentional collaboration with AI.",
    image: "/public-work/ux-storm-1-4/banner-main.jpg",
    imageAlt: "UX Storm 1.4 poster - The New Era of Product Designers, six speakers, Dec 12 2025",
    inlineImages: [
      "/public-work/ux-storm-1-4/banner-roubina.jpg",
      "/public-work/ux-storm-1-4/banner-stepan.jpg",
      "/public-work/ux-storm-1-4/banner-mentors.jpg"
    ],
    inlineCaptions: [
      "Roubina Tutunjian — From UX/UI to Product Designer: Building Strategic Muscles in the Age of AI",
      "Stepan Sargsyan — AI as a Design Partner: When to Use It, When Not To",
      "The three speed-discussion tables, as announced"
    ],
    galleryNote: "Captured by our audience",
    gallery: [
      "/public-work/ux-storm-1-4/audience-02.jpg",
      "/public-work/ux-storm-1-4/audience-video-03.mp4",
      "/public-work/ux-storm-1-4/audience-01.jpg",
      "/public-work/ux-storm-1-4/planning-call.png",
      "/public-work/ux-storm-1-4/audience-03.jpg",
      "/public-work/ux-storm-1-4/audience-video-01.mp4",
      "/public-work/ux-storm-1-4/audience-04.jpg",
      "/public-work/ux-storm-1-4/audience-video-02.mp4",
      "/public-work/ux-storm-1-4/audience-selfie.jpg",
      "/public-work/ux-storm-1-4/banner-matthew.jpg",
      "/public-work/ux-storm-1-4/banner-saak.jpg",
      "/public-work/ux-storm-1-4/banner-arpine.jpg",
      "/public-work/ux-storm-1-4/banner-davit-table.jpg",
      "/public-work/ux-storm-1-4/banner-nareg.jpg"
    ],
    galleryCaptions: [
      "The room settling in",
      "From the crowd, on a phone",
      "Mid-talk, full house",
      "The planning call behind the edition",
      "Between the sessions",
      "Speed-discussion energy",
      "Listening close",
      "Another moment from the audience",
      "The audience selfie",
      "Poster, Matthew Yousefian",
      "Poster, Saak Bertrand on the deck",
      "Table 2 — Arpine Lputyan on PM–design collaboration",
      "Table 3 — my own, on the art in the design",
      "Table 4 — Nareg Abedi Masihi on AI text mistakes"
    ],
    url: "https://luma.com/iicrwjxl"
  },
  {
    slug: "design-in-2030",
    year: "2025",
    publishedAt: "2025-10-11",
    type: "UX Storm 1.3 / DigiTec",
    title: "Design in 2030 — a workshop for 100+ thinkers and practitioners.",
    description: "At DigiTec 2025, UX Storm brought designers, thinkers, and practitioners together to test what design becomes when strategy, ethics, systems, and AI are part of the work.",
    image: "/public-work/ux-storm-1-3/hero.jpg",
    imageAlt: "Davit Pedanyan introducing the Design in 2030 workshop at DigiTec 2025",
    inlineImages: [
      "/public-work/ux-storm-1-3/workshop-output.jpg",
      "/public-work/ux-storm-1-3/model.jpg"
    ],
    gallery: [
      "/public-work/ux-storm-1-3/table-discussion.jpg",
      "/public-work/ux-storm-1-3/workforce-topic.jpg",
      "/public-work/ux-storm-1-3/facilitation.jpg",
      "/public-work/ux-storm-1-3/participant-voice.jpg",
      "/public-work/ux-storm-1-3/team-output.jpg",
      "/public-work/ux-storm-1-3/closing.jpg"
    ],
    url: "https://digitec.am/en-US/past-events/2025"
  },
  {
    slug: "ux-storm-1-2",
    year: "2024",
    type: "UX Storm / moderator",
    title: "UX Storm 1.2 — shaping the future in UX design.",
    description: "A donation-based Yerevan meetup with talks on UX research and UX writing, followed by speed discussions. Davit moderated the session on the future of UX design.",
    image: "/public-work/ux-storm-1-2/banner-cover.jpg",
    imageAlt: "UX Storm 1.2 cover - retro space collage with the five speakers",
    inlineImages: [
      "/public-work/ux-storm-1-2/banner-alexandra.jpg",
      "/public-work/ux-storm-1-2/banner-davit.jpg",
      "/public-work/ux-storm-1-2/banner-nareg.jpg"
    ],
    gallery: [
      "/public-work/ux-storm-1-2/research-talk.jpg",
      "/public-work/ux-storm-1-2/audience.jpg",
      "/public-work/ux-storm-1-2/speed-discussion.jpg",
      "/public-work/ux-storm-1-2/banner-hrachik.jpg",
      "/public-work/ux-storm-1-2/banner-shiraz.jpg"
    ],
    galleryCaptions: [
      "Nareg mid-talk, on gamification",
      "The room, listening",
      "Speed discussions in motion",
      "Talk banner, Hrachik Ajamian",
      "Talk banner, Shiraz Tumasyan"
    ],
    url: "https://www.linkedin.com/posts/davit-pedanyan_uxstorm-activity-7229777603987976192-mQoa"
  },
  {
    slug: "ux-storm-1-0",
    year: "2023",
    type: "UX Storm / founder format",
    title: "UX Storm 1.0 — 200 applications, 120 seats, one shared room.",
    description: "The first UX Storm drew over 200 applications for 120 places. Two keynotes and six speed-discussion topics, in partnership with Ameriabank.",
    image: "/public-work/ux-storm-1-0/banner-main.jpg",
    imageAlt: "UX Storm 1.0 product design meetup — Ishkhan Adamyan and Davit Pedanyan, Kamar Business Center, March 2",
    inlineImages: [
      "/public-work/ux-storm-1-0/JONY0122.jpg",
      "/public-work/ux-storm-1-0/JONY0350.jpg"
    ],
    gallery: [
      "/public-work/ux-storm-1-0/JONY0227.jpg",
      "/public-work/ux-storm-1-0/JONY0210.jpg",
      "/public-work/ux-storm-1-0/JONY0281.jpg",
      "/public-work/ux-storm-1-0/JONY0102.jpg",
      "/public-work/ux-storm-1-0/JONY0107.jpg",
      "/public-work/ux-storm-1-0/JONY0360.jpg",
      "/public-work/ux-storm-1-0/JONY0112.jpg",
      "/public-work/ux-storm-1-0/JONY0161.jpg",
      "/public-work/ux-storm-1-0/JONY0167.jpg",
      "/public-work/ux-storm-1-0/JONY0271.jpg",
      "/public-work/ux-storm-1-0/JONY0336.jpg",
      "/public-work/ux-storm-1-0/JONY0384.jpg",
      "/public-work/ux-storm-1-0/JONY0386.jpg"
    ],
    url: "https://www.linkedin.com/posts/davit-pedanyan_uxstorm-activity-7038788879109234689-s0mH"
  },
  {
    slug: "ux-design-battle-jury",
    year: "2025",
    type: "Panel / jury",
    title: "UXBattle — joining the jury for ideas under pressure.",
    description: "Invited to the jury for UXBattle, a live design challenge supported by Converse Bank and produced by Skill, where portfolios and product thinking were tested in public.",
    image: "/public-work/ux-design-battle-jury-1.jpg",
    secondaryImage: "/public-work/ux-design-battle-jury-2.jpg",
    imageAlt: "Davit Pedanyan speaking as a UX Design Battle jury member",
    inlineImages: ["", "/public-work/ux-design-battle-jury-2.jpg"],
    gallery: [
      "/public-work/ux-battle/speaker.jpg",
      "/public-work/ux-battle/audience.jpg",
      "/public-work/ux-battle/working-room.jpg",
      "/public-work/ux-battle/winner.jpg"
    ],
    url: "https://www.linkedin.com/posts/davit-pedanyan_uxbattle-activity-7338090109671514112-AVRV"
  },
  {
    slug: "ux-storm-1-1",
    year: "2024",
    type: "UX Storm 1.1 / speaker",
    title: "UX Storm 1.1 — making room for an honest design conversation.",
    description: "The second UX Storm continued the format with a direct, intimate session for Armenia’s growing product-design community.",
    image: "/public-work/ux-storm-1-1/speaker.jpg",
    imageAlt: "Davit Pedanyan speaking at UX Storm 1.1",
    inlineImages: [
      "/public-work/ux-storm-1-1/speaker.jpg",
      "/public-work/ux-storm-1-1/table.jpg"
    ],
    gallery: [
      "/public-work/ux-storm-1-1/room.jpg",
      "/public-work/ux-storm-1-1/discussion.jpg",
      "/public-work/ux-storm-1-1/audience.jpg",
      "/public-work/ux-storm-1-1/panel.jpg"
    ],
    url: "https://darpass.com/event/uxstorm-1-1-product-design-meetup/"
  },
  {
    slug: "tech-week-vanadzor",
    year: "2025",
    type: "Tech Week / Vanadzor",
    title: "Speaking at Tech Week Vanadzor — design as a regional conversation.",
    description: "Taking product-design thinking beyond Yerevan and into one of Armenia’s largest technology gatherings.",
    image: "/public-work/tech-week-2025.jpg",
    imageAlt: "Davit Pedanyan speaking at Tech Week Vanadzor 2025",
    inlineImages: ["", "/public-work/tech-week/hall.jpg"],
    gallery: [
      "/public-work/tech-week/talk-closeup.jpg",
      "/public-work/tech-week/audience.jpg"
    ],
    url: "https://techweek.am/"
  },
  {
    slug: "2x-masnageter",
    year: "2025",
    publishedAt: "2025-11-10",
    type: "Podcast / product design",
    title: "2X ՄԱՍՆԱԳԵՏՆԵՐ #1 — taste, design, and AI in product work.",
    description: "A conversation about being a designer, developing aesthetic judgement, and using AI without losing the human responsibility behind product decisions.",
    image: "/public-work/2x-masnageter-thumbnail.jpg",
    imageAlt: "2X ՄԱՍՆԱԳԵՏՆԵՐ podcast with Davit Pedanyan",
    videoId: "HBzUonXgdow",
    url: "https://www.youtube.com/watch?v=HBzUonXgdow"
  },
  {
    slug: "how2b-ui-ux-designer",
    year: "2024",
    publishedAt: "2024-12-24",
    type: "Podcast / career",
    title: "How to be a UI/UX designer — a How2B speed interview.",
    description: "A practical conversation for people entering UI/UX: how to start, build useful habits, and focus on the thinking behind a durable design career.",
    image: "https://i.ytimg.com/vi/5GkLC2HoWb4/maxresdefault.jpg",
    imageAlt: "How2B speed interview with Davit Pedanyan about becoming a UI UX designer",
    videoId: "5GkLC2HoWb4",
    url: "https://www.youtube.com/watch?v=5GkLC2HoWb4"
  },
  {
    slug: "why-art-matters-medium",
    year: "2026",
    publishedAt: "2026-02-03",
    type: "Essay / Medium",
    title: "Why Art Matters — a letter to the exhausted soul.",
    description: "A personal essay on art as attention, recovery, and a way to stay human in the pressure of everyday life.",
    image: "/public-work/medium-why-art-matters.jpg",
    imageAlt: "Art class image from Davit Pedanyan's Medium essay Why Art Matters",
    externalUrl: "https://medium.com/@pedanyandavid/why-art-matters-a-letter-to-the-exhausted-soul-0091d03f5d3d"
  },
  {
    slug: "undesign-armenia-medium",
    year: "2026",
    publishedAt: "2026-08-02",
    type: "Essay / Medium",
    title: "\u0531\u0576\u0564\u056b\u0566\u0561\u0575\u0576 Armenia \u2014 when public systems forget people.",
    description: "An essay on systems designed without the people who live with their consequences \u2014 and what that costs us in time, health, and the ability to participate.",
    image: "/public-work/medium-undesign.jpg",
    imageAlt: "Mother Armenia statue covering her eyes \u2014 \u0531\u0576Design \u0540\u0561\u0575\u0561\u057d\u057f\u0561\u0576, a call for design-led transformation",
    externalUrl: "https://medium.com/@pedanyandavid/%D5%A1%D5%B6%D5%A4%D5%AB%D5%A6%D5%A1%D5%B5%D5%B6-armenia-when-public-systems-forget-people-fddad0589691"
  },
  {
    slug: "patterns-rhythm-medium",
    year: "2024",
    publishedAt: "2024-12-07",
    type: "Essay / Medium",
    title: "Patterns, Rhythm, and Flow — lessons from music in UX design.",
    description: "How a background in music shaped the way I think about rhythm, contrast, and the flow of a product experience.",
    image: "/public-work/medium-patterns-rhythm.jpg",
    imageAlt: "Artwork from Davit Pedanyan's Medium essay about music and UX design",
    externalUrl: "https://medium.com/@pedanyandavid/patterns-rhythm-and-flow-lessons-from-music-in-ux-design-4085bd68137f"
  }
];

// Hover label per public piece — each names what that specific article holds.
const articleCursorLabels: Record<string, string> = {
  "ux-storm-1-4": "Where designers argued about AI",
  "design-in-2030": "The room that forecast 2030",
  "ux-storm-1-2": "Five tracks, one August Friday",
  "ux-storm-1-1": "An invitation-only design night",
  "ux-storm-1-0": "How UX Storm began",
  "ux-design-battle-jury": "Judging design under pressure",
  "tech-week-vanadzor": "Naming Armenia's design problem",
  "2x-masnageter": "Is product design worth it?",
  "how2b-ui-ux-designer": "Where to start in UX",
  "undesign-armenia-medium": "The Անդիզայն essay",
  "why-art-matters-medium": "Why art still matters",
  "patterns-rhythm-medium": "What music taught me about UX"
};

function articleCursorLabel(slug: string, isPodcast = false) {
  return articleCursorLabels[slug] ?? (isPodcast ? "watch the episode" : "read the article");
}

const publicArticleCopy: Record<string, { eyebrow: string; standfirst: string; sections: Array<{ title: string; paragraphs: string[] }> }> = {
  "ux-storm-1-0": {
    eyebrow: "UX Storm 1.0 / Kamar Business Center, 2 March",
    standfirst: "The first UX Storm took over 200 applications for 120 seats. Two talks framed one problem from opposite ends: what a company expects from a designer, and what a company has to build before it can use one well.",
    sections: [
      { title: "The chart that quieted the room", paragraphs: ["Ishkhan Adamyan — NNG certified, one of the few people in the country holding that credential — put a stacked bar chart on the screen and the room went still. It compared what a small company expects from an Intern or Junior, from a Middle, and from the level above, broken into specific proficiencies rather than job titles: design software, wireframes and prototypes built around customer needs, user research and testing, interaction design and information architecture, experience with design systems, the ability to communicate a design idea, teamwork, management. And near the bottom, sitting there without apology, basic marketing and SMM knowledge.", "That last line is the honest one. In a small Armenian company a designer is rarely only a designer, and here it was on a screen in front of a full room instead of being discovered in month three of a job. Nobody argued with it.", "This was the reason to build the event. There were plenty of designers in Armenia and very few places where they could compare notes on what the work actually demands."] },
      { title: "The talk I gave: mentorship and knowledge sharing", paragraphs: ["I spoke second, then Design Practice Lead at Armenian Code Academy, and opened with the least flattering fact I had. For the previous four years I had worked in companies with low or approximate UX maturity. I put it on a slide and labelled it a not-very-interesting fact about me. It was also the only reason I had anything useful to say on the subject.", "The talk ran on Chapman and Plewes' framework, which sorts organisations into five stages of UX maturity — beginning, awareness, adopting, realizing, exceptional. I put the global distribution on one slide and the Armenian one on the next, because the distance between them was the whole argument.", "Underneath it sat five mechanisms, and I would still argue for all five. A maturity assessment, so an organisation finds out where it actually stands rather than where it thinks it stands. A capability framework naming the specific skills required to move up a stage. A metrics dashboard tying design work to engagement, conversion and customer outcomes, because design that cannot be measured is the first thing cut. Training and coaching, on the argument that a UX culture spreads through workshops and individual attention rather than announcements. And a community of practice — the recurring forum where practitioners share methods instead of each quietly reinventing them.", "The second half was mentorship, which I treat as a design problem rather than a favour. A mentorship programme has participants, a timeline, goals, assignments and an assessment; decide those five and it works, skip them and it becomes two people having coffee. I also drew a line most of us blur: teaching is structured and one-to-many, tutoring is personal and one-to-few, and knowledge sharing is the broader thing that holds both plus every informal exchange in between.", "Then the numbers that made the case. Armenia had somewhere between 1,200 and 1,500 UX designers, of whom roughly 200 were mid-level or above. In the two years before that evening, 320 people had learned UX at ACA alone — a fifth of the country's designers, out of one school. That is the argument for knowledge sharing in a single ratio: the pipeline is being filled faster than the senior end of it is being grown.", "I ended on what sharing had given me rather than what it owed anyone: better problem-solving, sharper communication, a wider network, work I was happier doing, and the elimination of my fear of public speaking — which I marked, honestly, as in progress."] },
      { title: "Why the format mattered more than the talks", paragraphs: ["Over 200 people applied. 120 were shortlisted. That ratio is the finding: the appetite was already there, and what was missing was the room.", "So the second half was not more talking at people. Six speed-discussion topics ran alongside the main programme, which meant a good share of the 120 spent the evening answering the question rather than watching two speakers answer it. Ameriabank partnered on the event and Armenian Code Academy brought it together.", "Between sessions someone played a keyboard at the edge of the stage. Students sat in the same rows as people running design teams. It was a professional evening, not a formal one — and it set the shape every UX Storm since has kept."] }
    ]
  },
  "ux-storm-1-1": {
    eyebrow: "UX Storm 1.1 / Adobe Armenia, 2024",
    standfirst: "The first edition filled a hall. The second one capped the list, sent invitations, and put everyone close enough to interrupt each other.",
    sections: [
      { title: "Smaller on purpose", paragraphs: ["UX Storm 1.1 ran on 21 March at Adobe Armenia, Halabyan 22/5, from half past six until ten at night. Armenian Code Academy organised it. Adobe hosted and sponsored. Attendance was limited and invitation-based, with confirmations sent out three days ahead.", "That was a decision, not a shortage of chairs. A hundred people in a hall produces energy. Forty on tiered benches produces argument. Attendees sat on cushioned wooden steps in front of a painted mountain range with the Yerevan skyline going dark through the glass behind the speaker, and nobody was more than a few metres from whoever held the microphone.", "The list was drawn around a specific mix: product designers, UX/UI designers, product managers, product owners. Not a designers-only room. A product-people room, which changes what the arguments are about, because half the room has to answer for a roadmap rather than a screen."] },
      { title: "A new paradigm and an old skill", paragraphs: ["I presented UX Patterns in Generative AI: which interaction conventions are forming around systems that answer in language rather than in screens, and which of them are worth adopting rather than copying because a large product shipped them first.", "Lusine Dashtoyan, Senior Product Designer at Adobe, spoke about using analogies for better storytelling. On paper the two talks sit far apart. In the room they turned out to be one problem seen twice. Generative interfaces are unfamiliar to almost everyone who opens them, and the only reliable way to make an unfamiliar system legible is to reach for a structure the person already carries in their head. One talk described the new thing. The other described the oldest tool we have for explaining a new thing to somebody else.", "The programme was kept to two talks on purpose. The rest of the evening belonged to the room."] },
      { title: "Three zones, twenty minutes each", paragraphs: ["After the talks the event split into three themed discussion zones, each with a moderator from the industry, each running twenty minutes before the group moved on. Armine Tevosyan took UX sign-off, the unglamorous question of who actually approves a design and on what evidence. Hayk P., a product manager at ServiceTitan, ran the zone on how product designers and product managers work together, which is where most of the friction in a small product team actually lives. I ran the third: which parts of design work AI is likely to take, and which parts it is not.", "Twenty minutes is short deliberately. There is no warm-up phase and no drift. People state a position early because there is no time to arrive at one politely, and the moderator’s job is to keep the disagreement specific.", "One zone ran in a side meeting room with acoustic panels, framed photographs of the Ararat plain and a basalt canyon, and a single long light-wood table. Around eighteen people were around it, seated and standing, with more on the bench along the wall. The display on the wall in that photograph reads 8:14 PM. That is the measure of whether the format worked. Not the talks. The fact that at quarter past eight, with food waiting, eighteen people were still at the table."] }
    ]
  },
  "ux-storm-1-2": {
    eyebrow: "UX Storm 1.2 / AI9, August 2024",
    standfirst: "Five tracks, five speakers, one Friday in August. Two of the five sessions were not addressed to designers at all, and that was the argument of the edition.",
    sections: [
      { title: "Five tags as a table of contents", paragraphs: ["UX Storm 1.2 ran on 16 August 2024 at AI9. The poster was a retro space collage, painted planets and a rocket trailing flame, and across the middle of it sat five tags that were the actual programme: UX.RESEARCH, UX.4.STARTUPS, UX.WRITING, UX.FUTURE, UX.4.DEVS.", "Each tag had a person behind it. Alexandra Keidiia on The Power of Research. Hrachik Ajamian on What Startups Expect from a UX Designer. Nareg Abedi Masihi on The Craft of UX Writing. Shiraz Tumasyan on UX Meets Development. I took UX.FUTURE with Shaping the Future in UX Design, and moderated the speakers across the day.", "Four organisations put their names on it: Armenian Creative Network, Armenian Code Academy, AI9 and imast. The room was AI9’s: exposed concrete ceiling, white spiral ducting, a slow ceiling fan, deep terracotta drapes, and rows of black folding chairs facing a projector screen."] },
      { title: "The two tracks aimed at other people", paragraphs: ["Look at the five tracks again and the shape of the edition shows. Research, writing and the future are conversations designers have among themselves. Startups and development are not.", "What Startups Expect from a UX Designer is a talk about the distance between what a designer believes they were hired for and what a five-person company needs from them on Monday morning. UX Meets Development is the same distance measured from the other side, at the point where a design file becomes somebody else’s implementation problem and most of the quality in a product is quietly won or lost. Putting those two on the same bill as research and writing was the position of the edition. A designer who is excellent at the craft and illegible to the founder and the engineer is not yet useful to either.", "Nareg Abedi Masihi had the writing track, and at one point the screen behind him read LET’S TALK ABOUT GAMIFIACTION, typo included, next to a pixel-art sprite. Nobody in the room mentioned it, which felt like the correct response."] },
      { title: "Paying to be there", paragraphs: ["Entry was donation-based, with the money going to vetted charities. That detail does more work than it looks like it does. Free events collect registrations. A donation collects a decision. People who put money down turn up, and people who turn up on purpose ask better questions.", "It also settled what the series is for. Not lead generation for anyone’s course or agency. A room the community pays into, on the understanding that the money leaves and goes somewhere useful.", "My own session, on where UX design goes next, is a topic that turns to vapour the moment you let it float. Kept close to practice it becomes three answerable questions instead: what is changing in the work this year, which skills are gaining value, and what a designer starting today should learn first."] }
    ]
  },
  "ux-storm-1-4": {
    eyebrow: "UX Storm 1.4 / artmart, December 2025",
    standfirst: "Three talks, three tables and live music on the twelfth floor, built around the question the discipline keeps circling: if the tools can produce the screens, what exactly is a product designer for?",
    sections: [
      { title: "Three talks that do not agree", paragraphs: ["Matthew Yousefian, senior product designer and mentor, opened with Product Design is Not What You Think, an argument that the job most people believe they applied for is not the job. Roubina Tutunjian, a senior design leader, followed with From UX/UI to Product Designer: Building Strategic Muscles in the Age of AI: how a designer moves past executing interfaces into the decisions that set a product’s direction, and why AI raises the cost of never making that move. Stepan Sargsyan, group product design lead and mentor, took the other side of the same coin with AI as a Design Partner: When to Use It, When Not To.", "Stepan’s framing was the one the room needed. Not whether AI is good for design, a question with no usable answer, but where the boundary sits. Prompting is a design skill. So is restraint, so is shared context, and so is noticing when a fast, polished, confident output has quietly detached from anything real. AI will accelerate execution. It will not sign its name to the consequences.", "The edition ran on 12 December 2025 at seven in the evening, at artmart on Hakobyan 3, twelfth floor. Entry was free but registration was moderated and closed with a waitlist. The room was built for mid-level and senior designers and product people, which is why the three talks could disagree in public without anyone having to explain the basics first."] },
      { title: "Three tables the talks could not settle", paragraphs: ["After the talks the room broke into three numbered speed-discussion tables, each led by a practitioner. Nareg Abedi Masihi took Simple AI Text Mistakes: What Designers Are Messing Up. That is the narrow, unglamorous version of the AI question. Not whether the technology is transformative, but the specific ways generated copy is going into shipped products badly right now.", "Arpine Lputyan took PM–Design Collaboration in Modern Product Teams, the relationship that decides more about a product’s quality than any tool choice, and the one most teams run on habit rather than design.", "I took the third table, The Art in the Design, deliberately out of step with the rest of the evening. In a programme otherwise arguing about strategy, AI and collaboration, one table spent its time on the part of the work that has no business justification and is obvious the moment it is missing. The tables exist because a talk can only propose a position. It takes a small group with different constraints and different scar tissue to find out whether the position survives contact."] },
      { title: "What it takes to put the room together", paragraphs: ["There is a photograph in the gallery that is not from the night. It is a seven-person video call: Rima Igityan, Diana Almastyan, Nareg Abedi Masihi, Stepan Sargsyan, Matthew Yousefian, Roubina Tutunjian and me, with Matthew’s hand raised, waiting his turn.", "Two of those names are on no banner. Rima Igityan and Diana Almastyan built the edition and stayed off the poster. That call is a more honest picture of what an event is than any stage photograph: weeks of scheduling, arguments about topics and ideas that got cut, so that a room of people can walk in and find it already working. artmart hosted and was general sponsor alongside Armenian Code Academy, which ran the programming. Saak Bertrand played music through the night, which is the detail that keeps a senior-practitioner evening from turning into a conference panel.", "Every photograph in this gallery was taken by someone in the audience on their phone. Nobody was hired to document it. That is either a production oversight or the most accurate thing about the evening."] }
    ]
  },
  "design-in-2030": {
    eyebrow: "UX Storm 1.3 / DigiTec 2025",
    standfirst: "Inside a festival built for forty thousand people, UX Storm set out round tables and asked working designers to write down, by hand, what their profession looks like in 2030.",
    sections: [
      { title: "Round tables inside a tech festival", paragraphs: ["DigiTec 2025 was UATE’s twentieth edition: three days from 10 to 12 October, 15,000 square metres at the Meridian Expo & Event Centre, more than 300 participating companies, and over 40,000 visitors expected under the line “where the sun never sets.” The published spine of the festival was AI on day one, investment on day two, scaling on day three. UX Storm 1.3 took a slot inside it — 11 October, 16:00, the DigiHub hall — under its own lockup: UX Storm by Armenian Code Academy.", "The room did the opposite of what an expo floor usually does. Black drapes, round white tables with transparent ghost chairs, eight to ten people at each, flip-chart easels, markers, and blocks of coloured sticky notes. Rows let people watch. Tables make them produce something and put a name on it. I worked the floor with a handheld mic instead of standing behind a podium, because a workshop where the facilitator stays on stage is a lecture with better furniture.", "The poster had promised 100-plus designers, thinkers and practitioners, and that mixture was the point — product people, engineers, students and marketers who all end up living with design decisions someone else made. One projected topic card read simply: Workflows and Collaboration. Everything else in the room, the tables produced themselves, on paper."] },
      { title: "What the tables actually wrote", paragraphs: ["The most useful artefact of the afternoon was a sheet with three hand-drawn columns: Dropout, Actual, New Tools. What falls away by 2030, what survives, what replaces it. A participant held it up and presented it to the room.", "Under Dropout the table had written the Adobe suite, Protopie, and wireframing tools. Under Actual: Figma with AI integrated, Notion.ai, AutoCAD. Under New Tools: “intelligence integrated tools” and — the interesting one — “individual designed tools.” Read that last phrase again. A table of working designers, given the length of one exercise, bet that the industry-standard suites go first, that today’s tools survive only in the versions that absorb AI, and that the end state is practitioners assembling their own instruments rather than renting somebody else’s. That is a sharper claim than anything on a trends slide, and nobody led them to it.", "Another table went sideways from tools to identity. Their poster was headed FEM — Fearless Experience Makers, with a hand-drawn face mark and folded paper triangles labelled Light, Night, Sun, Moon, Direction, Compass, Star. A third produced a “hello” wordmark with a stick figure waving out of the final letter. Pink paper people, cut and folded, stood upright on the tables. Scissors and sticky notes, and what came back was positioning, symbol and tone — precisely the layer that does not automate."] },
      { title: "Why a working room, and why here", paragraphs: ["The materials were a constraint with a purpose. Give a designer a laptop and the conversation drifts to execution within five minutes, because execution is where the tools flatter us. Give the same person a marker and a folded sticky note and the only things left to be good at are the idea and how well it survives being explained to eight strangers.", "The prompts worked the same way. Asking what design will be in 2030 invites a trend report. Asking which of your tools is gone, which survives and what replaces it forces a position you can be wrong about. Nobody left with a consensus forecast — the tables did not agree with each other and did not need to. They left with their own handwriting on a sheet of paper, which is the only kind of prediction people act on.", "The reason to run this at DigiTec rather than at a design meetup is that the design conversation is not very useful when only designers hear it. A festival that gives three days to building, funding and scaling benefits from one room asking what should be built and who carries the cost when the answer is wrong. A talk would have made that point as an assertion. A workshop made it structurally: design’s contribution is not a presentation at the end, it is a way of working that other disciplines can sit inside for an afternoon."] }
    ]
  },
  "ux-design-battle-jury": {
    eyebrow: "UI/UX Design Battle / jury member",
    standfirst: "Converse Bank put a live product screen and 500,000 AMD behind a design competition, Skill built an event around it, and I judged it. From that seat you stop reading portfolios and start reading reasoning.",
    sections: [
      { title: "A real brief, a clock, and a room watching", paragraphs: ["The brief was not invented for the occasion. Contestants were asked to improve the repetitive-payment templates page in the Converse Bank mobile app — a screen that already exists, that people use to pay the same bills every month, and that the bank has to live with afterwards. Converse Bank was the general partner and put up the prize: 500,000 AMD, handed over on an oversized cheque with the tax note in the small print. Skill produced the event; ARDY, UATE, WODS and Visa sat on the partner strip. My badge said JURY MEMBER.", "The work happened in a bright glass-walled room — long white benches, a laptop and a mouse per person, a notepad, a branded bag. Individual work, heads down. Then the same people moved into an auditorium with wood acoustic panels and grey armchairs, put on matching white t-shirts with two cartoon boxers on the chest, and watched each other present.", "The event framing was deliberately light around the edges; the backdrop advertised speakers, snacks, a DJ and gifts. That is not a contradiction. Work of this kind goes better when the day around it is not solemn. The brief carried the weight on its own."] },
      { title: "What I was judging", paragraphs: ["Not the best-looking screen. A competition rewards speed, and speed makes surfaces easy and thinking hard, so polish is the cheapest signal in the room. Repetitive payments make that trap especially visible: it is a page you can restyle in an afternoon and leave every real problem exactly where you found it.", "The first thing I looked for was whether someone had understood the task before solving it. A payment template is a shortcut a person builds for their own future self. So the questions that decide the design are how a template gets created without a separate setup ritual, how you tell two near-identical ones apart at a glance, what happens when the amount changes, and what it costs the user to get it wrong. Anyone who reached the visual layer without touching those had redecorated.", "The second was defensibility. In a timed battle you cannot iterate your way out of a bad premise, so the useful question after a presentation is always what got left out and why. A designer who can name their own trade-offs made choices; a designer who presents every decision as equally deliberate usually made none. The third was what happens under pushback. Some people defend the artefact and some defend the reasoning, and that difference tells you more about who will be useful on a product team in a year than any case study does."] },
      { title: "What the format is good for, and what it is not", paragraphs: ["A single sitting is not enough for research, and nobody should present the results as finished product decisions. What a battle produces is a well-argued sketch. That is worth saying plainly, including to the people who win.", "What it does give is rare in this market: a real brief from a real bank, a fixed deadline, and a public defence in front of practitioners under no obligation to be encouraging. Most designers at that stage of a career have never once had to explain their work to a stranger who might disagree with it. That experience is worth more than the prize money.", "It also makes the process visible to everyone in the seats. When emerging designers watch each other’s ideas taken apart and put back together with respect, the standard for what counts as a good argument rises for the whole room. That is a cheap way to raise the level of a local practice, and more companies with real products should be funding it."] }
    ]
  },
  "tech-week-vanadzor": {
    eyebrow: "Tech Week Vanadzor / July 2025",
    standfirst: "Three days of Armenian tech ran in Vanadzor rather than Yerevan, on purpose. I used my slot on the Charles Aznavour Palace stage to argue that Armenia has an անդիզայն problem, and that it is structural rather than cosmetic.",
    sections: [
      { title: "The word on the first slide", paragraphs: ["The opening slide read: The global reasons behind “Անդիզայն” country. Անդիզայն — undesigned. Not ugly, not unfinished. Undesigned: built without anyone asking who it was for.", "The second slide put the definition on screen in one sentence. When products, systems, physical spaces and policies are built without human-centred thought, they become անդիզայն. That phrasing was deliberate, because it moves the conversation off screens. A bus stop with no shade is անդիզայն. A form that asks for the same information three times is անդիզայն. A regulation written so that only its author can follow it is անդիզայն. The same failure in different clothes, and none of it fixed by hiring a better illustrator.", "The third slide was the counter-position: beyond aesthetics, design is about function, user experience and systems thinking — interconnectedness and the big picture rather than the surface. In a hall of engineers, founders and students, that is the useful message. Most of them will never open Figma. All of them will decide, at some point, whether the thing they are building accounts for the person on the other end of it."] },
      { title: "A theatre in Vanadzor, not a hall in Yerevan", paragraphs: ["Tech Week is built on a refusal. TCF, Zealous and UATE keep it out of the capital and move it to a regional centre, because an ecosystem that exists in one city is not an ecosystem. In 2025 that city was Vanadzor: 4 to 6 July, roughly 2,800 participants, more than 60 speakers, over 50 partner companies and 300-plus workshop registrations. Alongside the talks ran DevHacks at the Vanadzor Technology Center — 68 teams selected from 95 applications, 48 hours, a $15,000 prize fund — the Wings competition with the Business Angel Network of Armenia, and an education expo with Teach For Armenia and Armath. Goris takes the event in 2026.", "The main stage was the Charles Aznavour Palace of Culture: a Soviet-era theatre with a crystal chandelier and plaster cornices, raked seating lit blue for the occasion, TWV 2025 spelled out in light-up letters along the stage lip. The banner behind me read Վանաձորը՝ տեխնոլոգիական մայրաքաղաք — Vanadzor, the technology capital. It is a large claim for a city of that size, and the distance between the claim and the present is more or less what I came to talk about.", "The audience was young and it was not a design crowd — students, people a few years into a first job, teams from local companies. That decided how the talk was built. A Yerevan design room arrives with the vocabulary and mostly agrees with you already. A regional room does not, which means every claim has to survive plain language in front of people with no professional reason to be generous about it. If the idea holds there, it holds."] },
      { title: "What happened to the word afterwards", paragraphs: ["Naming a problem in front of several hundred people changes its status. It stops being a private complaint and becomes something people can point at, in their own city, about things they walk past every day.", "Անդիզայն kept working after the stage lights went down. The talk came first; the essay came later — the same idea written up for a wider readership, as an argument about how Armenian public systems forget the people inside them. Ideas that survive a live room are the ones worth writing down.", "That is also the case for speaking outside the capital, and it is not charity. Opportunity that exists in only one place is not opportunity, it is a queue. The people who will build the next generation of Armenian products are not all going to move to Yerevan first, and the design conversation should not wait for them to."] }
    ]
  },
  "2x-masnageter": {
    eyebrow: "2X ՄԱՍՆԱԳԵՏՆԵՐ / podcast",
    standfirst: "The show sits designers down and asks the question its audience actually has: is becoming a product designer worth it? I gave the answer I would give a friend, not the one a school would print.",
    sections: [
      { title: "The question", paragraphs: ["The series invites people with a public record in their field and puts the plain question to them. Mine was the plainest version of it: is it worth becoming a product designer. Not how to do the job well — whether to do it at all.", "That question deserves better than the two answers usually on offer. One is the course advertisement: high demand, remote work, good salary, six months. The other is the fatalism that arrived with the current generation of tools: it is finished, the models will do it. Both are selling something, and neither describes the job.", "A long-form conversation is the right place to say so. On a stage you have twenty minutes and you compress. Across a table you can be asked a follow-up you did not prepare for, and that is usually where the honest material is."] },
      { title: "The honest answer", paragraphs: ["Yes, if what draws you is the part of the work nobody photographs. The visible half of product design — the screens — is a small fraction of it. The rest is working out what should exist, arguing for it with people who hold other priorities, cutting the version you liked, and explaining the same decision a third time to someone who was not in the room.", "The market has also moved the entry bar. Producing a competent screen is no longer scarce, so it is no longer a career on its own. What is scarce is judgement: knowing which of fifteen fixable things actually matters, being able to say why, and carrying the consequences once it ships. A generated option arrives knowing nothing about who it is for or what happens when the person using it is tired and in a hurry. Somebody still has to look at four plausible directions and rule three of them out.", "So the answer is conditional rather than encouraging. Worth it if you are curious about people and can tolerate having your work taken apart in public on a regular basis. Not worth it if the appeal is that it looks like the comfortable way into tech, because that door has been closing for a while."] },
      { title: "What I would tell someone deciding", paragraphs: ["Test the interest before you pay for it. Watch somebody use something — a form, an app, a ticket machine — and notice what you want to do about it. If your first instinct is to find out why they got stuck, the raw material is there. If it is to redraw the buttons, that is a different job, and a perfectly good one.", "Then measure your progress in problems rather than in tools. Tool fluency has a short shelf life and it is the easiest thing on the list to acquire. The habit of finding the real problem and defending a choice is what carries a career across the next three shifts in the industry.", "And be patient about the timeline in a way the advertising is not. People do get hired inside a year. The ones who last are the ones who spent that year building things that got criticised, not the ones who spent it finishing lessons."] }
    ]
  },
  "how2b-ui-ux-designer": {
    eyebrow: "How2B × Armenian Code Academy / December 2024",
    standfirst: "Thirteen questions, from what UI/UX actually is to how you tell whether you are suited to it, recorded for people deciding whether to spend a year and a course fee finding out.",
    sections: [
      { title: "The audience was not designers", paragraphs: ["How2B is an Armenian business and technology outlet — news, finance podcasts, salary and tax calculators, career explainers. Its readers are making decisions about work and money, not looking for craft tips. Armenian Code Academy, where I lead the design practice, made this episode with them in December 2024 for one specific person: someone who has heard that UI/UX is a good career, does not know what the job involves, and is trying to decide whether to commit to it.", "How2B published the full question list, and it is a fair one. What UI/UX is. What problems a designer solves. Examples of bad design and good design. Why projects matter. The stereotypes. The purpose of design. Which skills are required. How long it takes to learn. How to choose a course. Three recommendations for people starting out. And, last, how to work out whether you are actually suited to this.", "A school asking its own instructor how to choose a course is an obvious conflict of interest, so the answer has to be one that does not serve the school. Judge a course by whether it makes you build things that get criticised by people who are not grading you. A curriculum list and a roster of tools tell you very little."] },
      { title: "The answers that hold up outside the video", paragraphs: ["Problem before tool. The route into this work is not learning software; it is learning to see a problem — who is trying to do something, what is making it hard, and what would make the outcome clearer, faster, safer or less humiliating. Tools matter because they let you communicate an answer. Tools also turn over every few years, and the habit of finding the real problem does not.", "Which is why “projects matter” is the least interesting-sounding item on that list and the most important one. You do not learn design by completing lessons. You learn it by picking a problem small enough to observe directly, making something, and finding out where it fails.", "And a portfolio is evidence, not a gallery. A row of polished screens tells a reviewer you can operate Figma. What a product team wants to see is how you think when the brief is incomplete: the context, the constraints, the decisions, and the thing you deliberately left out and why. Three honest projects with the reasoning attached beat ten decorative ones."] },
      { title: "How to tell whether it is for you", paragraphs: ["The last question in the set is the one people rarely ask out loud, and it deserves a straight answer rather than encouragement.", "This work suits people who are curious about other people. Not people who like beautiful interfaces — people genuinely interested in why someone got confused, gave up, or did the thing the wrong way round. The second requirement is tolerance for critique. Design is the discipline where your work gets taken apart in front of others on a regular basis, and where “I like it” is never a sufficient defence. People who need their work admired burn out; people who want it tested get better quickly.", "The third is patience for the unglamorous half: the research, the edge cases, the fourth revision, the meeting where you explain the same decision again. That is most of the job. Anyone deciding whether to start should know it before they pay for a course, not after."] }
    ]
  },
};

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
const experiences = rawExperiences;

const experienceThemes: Record<string, string> = {
  Freedx: "freedx",
  Lynon: "lynon",
  "T-Bank / Tinkoff": "tbank",
  Delux: "delux",
  CloudChipr: "cloudchipr",
  "Webb Fontaine": "webb-fontaine",
  "Material Exchange": "material-exchange",
  "The Bank of London": "bank-of-london",
  Uphold: "uphold",
  "Liga Insurance": "liga"
};

function experienceTheme(company: string) {
  return experienceThemes[company] ?? "default";
}
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
      "Twenty years inside product work: interfaces, brands, design systems, teams, and the messy decisions that turn ideas into something people use.",
    meta: "product design / direction"
  },
  {
    marker: "02",
    title: "Then I started building designers.",
    copy:
      "I built a school because design in Armenia needed stronger habits, sharper critique, and a serious path for beginners to become professionals.",
    meta: "education / Pedanyan School"
  },
  {
    marker: "03",
    title: "Then the work became public.",
    copy:
      "UX Storm, Drunk Talks, critique nights, workshops, and media — rooms where designers argue, learn, and raise the bar together.",
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

type HeroPose = "idk" | "good" | "scroll";

// Living-portrait clips: transparent VP9 WebM (alpha), served locally.
// The hero portrait listens for this event and swaps Davit's pose.
function emitHeroPose(pose: HeroPose | null) {
  window.dispatchEvent(new CustomEvent<HeroPose | null>("dw-hero-pose", { detail: pose }));
}

function NavAnchor({
  children,
  className,
  href,
  isActive = false,
  poseOnHover,
  cursorLabel
}: {
  children: ReactNode;
  className?: string;
  href: string;
  isActive?: boolean;
  poseOnHover?: HeroPose;
  cursorLabel?: string;
}) {
  const link = useResolvedNavLink(href);
  const classes = [className, isActive ? "is-active" : ""].filter(Boolean).join(" ");
  const poseHandlers = poseOnHover
    ? {
        onMouseEnter: () => emitHeroPose(poseOnHover),
        onMouseLeave: () => emitHeroPose(null),
        onFocus: () => emitHeroPose(poseOnHover),
        onBlur: () => emitHeroPose(null)
      }
    : {};

  return (
    <a className={classes || undefined} href={link.href} target={link.target} aria-current={isActive ? "page" : undefined} data-cursor-label={cursorLabel} {...poseHandlers}>
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
  // Resolve synchronously on first render: a pinned scene must never mount
  // for one frame on a phone, because ScrollTrigger's pin wraps it in a
  // spacer and React then cannot remove it (removeChild NotFoundError).
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false
  );

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

/* The figure has to be in the markup, not only in the GSAP tween that writes it
   on scroll: the prerenderer snapshots long before any of that runs, so a
   hardcoded "$0M" here is what every crawler - and every reader with JS off -
   sees. updateSlot() overwrites this the moment the counter starts. */
function SlotMachineNumber({ value }: { value: string }) {
  return (
    <div className="dw-designer-slot-number" aria-label={value}>{value}</div>
  );
}

function MobileDesignerStat({ value, caption }: { value: string; caption: string }) {
  const statRef = useRef<HTMLElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const hasPlayedRef = useRef(false);
  const numberMatch = value.match(/\d+/);
  const target = Number(numberMatch?.[0] ?? 0);
  /* Starts at the real figure, not at zero. The count-up resets it to 0 the
     instant it begins, so the animation is unchanged - but the static HTML the
     prerenderer captures now carries the true number instead of "0 startups". */
  const [number, setNumber] = useState(target);
  const renderedValue = numberMatch
    ? `${value.slice(0, numberMatch.index)}${number}${value.slice((numberMatch.index ?? 0) + numberMatch[0].length)}`
    : value;

  useEffect(() => {
    const element = statRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsFocused(true);
        observer.disconnect();
      },
      { threshold: 0.64 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isFocused || hasPlayedRef.current || target === 0) return;
    hasPlayedRef.current = true;
    setNumber(0);
    const startedAt = performance.now();
    const duration = 760;
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setNumber(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [isFocused, target]);

  return (
    <article className={`dw-mobile-designer-stat${isFocused ? " is-focused" : ""}`} ref={statRef}>
      <h3 aria-label={value}>{renderedValue}</h3>
      <p>{caption}</p>
    </article>
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
      label.classList.toggle(
        "is-flipped",
        event.clientX + label.offsetWidth + 44 > window.innerWidth
      );
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

    const cursorLabelFor = (target: Element): string => {
      const tagged = target.closest<HTMLElement>("[data-cursor-label]");
      if (tagged?.dataset.cursorLabel) return tagged.dataset.cursorLabel;
      const music = target.closest(".dw-music-button");
      if (music) return music.getAttribute("aria-pressed") === "true" ? "turn sound off" : "turn sound on";
      const theme = target.closest(".dw-theme-toggle");
      if (theme) return (theme.textContent || "").includes("night") ? "switch to night mode" : "switch to day mode";
      if (target.closest(".dw-portfolio-project-card, .dw-case-prevnext-card, .dw-case-more-card")) return "open case study";
      if (target.closest(".dw-public-podcast-play, .dw-public-journal-entry.is-podcast")) return "watch the episode";
      if (target.closest(".dw-public-journal-entry")) return "read the article";
      if (target.closest("video")) return "play video";
      const anchor = target.closest("a");
      if (anchor) {
        const href = anchor.getAttribute("href") || "";
        if (href.startsWith("https://t.me")) return "message me on telegram";
        if (href.startsWith("mailto:")) return "write me an email";
        if (anchor.getAttribute("target") === "_blank") return "opens in a new tab";
        const text = (anchor.textContent || "").replace(/\s+/g, " ").trim();
        if (text && text.length <= 16) return `go to ${text}`;
        return "open";
      }
      return "";
    };

    const onMouseOver = (event: MouseEvent) => {
      if (!cursor || !label) return;
      const target = event.target instanceof Element ? event.target : null;
      const text = target ? cursorLabelFor(target) : "";
      label.textContent = text;
      label.classList.toggle("is-visible", Boolean(text));
      cursor.style.width = text ? "54px" : "22px";
      cursor.style.height = text ? "54px" : "22px";
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseover", onMouseOver, true);
    onScroll();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseover", onMouseOver, true);
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

// Hover labels for the main nav, keyed by destination rather than by label text
// so a Notion re-sync of the nav wording cannot silently detach them.
const navCursorLabels: Record<string, string> = {
  "/am/designer": "Explore portfolio",
  "/am/public-work": "About my role in community",
  "/am/school": "Will be ready soon"
};

export function SiteHeader({ activePage }: { activePage?: PageKey }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Clear a legacy theme value left behind by a hot reload after the switcher
    // was removed. The site now has one intentional, light presentation.
    delete document.documentElement.dataset.dwTheme;
  }, []);

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
    <header className={`dw-header ${isScrolled ? "is-scrolled" : ""}${isMenuOpen ? " has-menu-open" : ""}`}>
      <NavAnchor className="dw-logo" href="/am" poseOnHover="scroll" cursorLabel="To the Home">
        <span className="dw-logo-word">PDNYN</span>
      </NavAnchor>
      <button
        className="dw-mobile-menu-toggle"
        type="button"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <X aria-hidden="true" strokeWidth={1.8} /> : <Menu aria-hidden="true" strokeWidth={1.8} />}
      </button>
      <nav className={`dw-nav${isMenuOpen ? " is-open" : ""}`} aria-label="Main navigation" onClick={() => setIsMenuOpen(false)}>
        {websiteContent.navigation.primary.map((item) => (
          <NavAnchor
            href={item.href}
            isActive={
              (activePage === "designer" && item.href === "/am/designer") ||
              (activePage === "designTalent" && item.href === "/am/designer") ||
              (activePage === "publicWork" && item.href === "/am/public-work")
            }
            poseOnHover={item.href === "/am/public-work" ? "idk" : undefined}
            cursorLabel={navCursorLabels[item.href]}
            key={item.href}
          >
            {item.label}
          </NavAnchor>
        ))}
      </nav>
      <div className="dw-right">
        <button
          className="dw-pill"
          type="button"
          onClick={() => openContactChat(undefined, "header")}
          data-cursor-label="start a conversation"
          onMouseEnter={() => emitHeroPose("good")}
          onMouseLeave={() => emitHeroPose(null)}
          onFocus={() => emitHeroPose("good")}
          onBlur={() => emitHeroPose(null)}
        >
          <MessageCircle className="dw-talk-icon" aria-hidden="true" strokeWidth={1.8} />
          <span>{websiteContent.navigation.talk.label}</span>
        </button>
      </div>
    </header>
  );
}

function FixedSocialLinks() {
  return (
    <div className="dw-fixed-socials" aria-label="Social links">
      {websiteContent.navigation.socials.filter((social) => social.label === "IN").map((social) => (
        <a href={social.href} key={social.label} rel="noreferrer" target="_blank">
          {social.label}
        </a>
      ))}
      <button
        className="dw-fixed-portrait"
        type="button"
        aria-label="Start a conversation with Davit"
        onClick={() => openContactChat(undefined, "portrait")}
        onMouseEnter={() => emitHeroPose("good")}
        onMouseLeave={() => emitHeroPose(null)}
        onFocus={() => emitHeroPose("good")}
        onBlur={() => emitHeroPose(null)}
      >
        <img src={CHAT_AVATAR} alt="Davit Pedanyan" />
      </button>
    </div>
  );
}

const DAVIT_TELEGRAM_URL = "https://t.me/pedanyan";


/**
 * The site reads as one continuous document: reaching the end of a page and
 * continuing to scroll opens the next one. Home -> Work -> Public -> Home.
 * Case studies and articles keep their own next-item pull.
 */
const SITE_FLOW: Array<{ keys: PageKey[]; href: string; title: string; cursorLabel: string }> = [
  { keys: ["home", "school", "letsTalk"], href: "/am", title: "Home", cursorLabel: "back to the start" },
  { keys: ["designer", "designTalent"], href: "/am/designer", title: "Work", cursorLabel: "see the work" },
  { keys: ["publicWork"], href: "/am/public-work", title: "Public", cursorLabel: "talks, writing, community" }
];

export function nextSitePage(activePage?: PageKey) {
  const index = SITE_FLOW.findIndex((page) => activePage !== undefined && page.keys.includes(activePage));
  return SITE_FLOW[(index + 1) % SITE_FLOW.length];
}

function SiteNextPage({ activePage }: { activePage?: PageKey }) {
  const next = nextSitePage(activePage);
  return (
    <section className="dw-site-next" id="next-page" aria-label="Next page">
      <PullToContinue href={next.href} kicker="Next page" title={next.title} cursorLabel={next.cursorLabel} />
    </section>
  );
}


/* The chrome that must OUTLIVE a page change — the <main> itself, the header,
   the social rail, the music player and the contact chat — is rendered once by
   AppRouter and never unmounts. A page no longer owns any of it; PageShell just
   reports which shell settings its page wants, and renders its own content.

   This is what keeps the music playing: the toggle's <iframe> stays in the same
   position in the tree across every route, so React never tears it down. */
type ShellState = { className: string; showFooter: boolean; activePage?: PageKey };
const DEFAULT_SHELL: ShellState = { className: "", showFooter: true, activePage: undefined };
const ShellContext = createContext<(next: ShellState) => void>(() => {});

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
  const setShell = useContext(ShellContext);
  /* layout effect, not effect: the class lands before the browser paints, so a
     route change never shows one frame of the previous page's shell class */
  useLayoutEffect(() => {
    setShell({ className, showFooter, activePage });
  }, [setShell, className, showFooter, activePage]);

  return (
    <>
      {children}
      {showFooter ? <SiteNextPage activePage={activePage} /> : null}
    </>
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

/**
 * The greeting intro is a first-impression piece. It is charming once and
 * tiring on the fourth visit, so a returning visitor gets the same sequence
 * played roughly three times faster rather than a different (or absent) one.
 *
 * The visit is remembered in localStorage. After INTRO_MEMORY_DAYS the full
 * version returns, on the assumption that someone coming back months later
 * has forgotten it — delete that check if you would rather it never replay.
 */
const INTRO_SEEN_KEY = "dw-intro-seen-at";
const INTRO_MEMORY_DAYS = 30;

function hasSeenIntroRecently() {
  try {
    const seenAt = Number(window.localStorage.getItem(INTRO_SEEN_KEY));
    if (!seenAt) return false;
    return Date.now() - seenAt < INTRO_MEMORY_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    // Private mode, or site data blocked: treat every visit as the first.
    return false;
  }
}

function rememberIntroSeen() {
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, String(Date.now()));
  } catch {
    /* nothing to do — the intro just plays in full next time */
  }
}

/**
 * Decided once per page load, not once per mount. Reading and writing inside
 * the effect made a first visit report itself as a return visit: React runs
 * effects twice in development, so the first run stored the timestamp and the
 * second run read it straight back. A remount must not change the answer
 * mid-visit either.
 */
let introIsBriefForThisLoad: boolean | null = null;

function resolveIntroPacing() {
  if (introIsBriefForThisLoad === null) {
    introIsBriefForThisLoad = hasSeenIntroRecently();
    rememberIntroSeen();
  }
  return introIsBriefForThisLoad;
}

/** Armenian stays last in both lists: the final greeting gets its own animation. */
const INTRO_GREETINGS = ["Hello", "Bonjour", "Ciao", "Olá", "Hallå", "Guten Tag", "Привет", "Բարև"];
const INTRO_GREETINGS_BRIEF = ["Hello", "Բարև"];

function HomeIntroSection() {
  // Keep the first visit on phones quick, so the greeting never reads as a blank page.
  const [brief] = useState(
    () => resolveIntroPacing() || window.matchMedia("(max-width: 900px)").matches
  );
  const greetings = brief ? INTRO_GREETINGS_BRIEF : INTRO_GREETINGS;

  // Layout effect, not effect: the pacing class has to land before the
  // greetings paint, or the first one animates at full length and then snaps.
  useLayoutEffect(() => {
    document.documentElement.classList.remove("dw-home-loader-done");
    document.documentElement.classList.remove("dw-home-loader-revealing");
    const previousOverflow = document.documentElement.style.overflow;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (brief) document.documentElement.classList.add("dw-home-intro-brief");
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
        // Remembered on the root so a hero that mounts late (or remounts)
        // can still see the intro is over instead of waiting for nothing.
        document.documentElement.classList.add("dw-home-intro-done");
        window.dispatchEvent(new CustomEvent("dw-home-intro-complete"));
        ScrollTrigger.refresh();
      }, reducedMotion ? 80 : 180);
    };
    // Keep these in step with the CSS pacing below.
    const revealStartAt = reducedMotion ? 520 : brief ? 1160 : 4800;
    const revealAt = reducedMotion ? 900 : brief ? 1500 : 5920;
    const revealStartTimer = window.setTimeout(startReveal, revealStartAt);
    const revealTimer = window.setTimeout(revealPage, revealAt);

    return () => {
      window.clearTimeout(revealStartTimer);
      window.clearTimeout(revealTimer);
      window.clearTimeout(refreshTimer);
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.classList.remove("dw-home-loader-revealing");
      document.documentElement.classList.remove("dw-home-loader-done");
      document.documentElement.classList.remove("dw-home-intro-brief");
    };
  }, [brief]);

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

/**
 * Case-study reel that sits in the indent left of "products".
 *
 * A compact window into the work itself. These are source visuals from each
 * case study, rather than the card thumbnails used on the work index.
 */
const HERO_REEL_FRAMES = [
  "/portfolio-assets/cloudchipr/product-overview.png",
  "/portfolio-assets/material-exchange/hero-product.png",
  "/portfolio-assets/tempo/route-optimization.png",
  "/portfolio-assets/icredo/my-loans.png",
  "/portfolio-assets/liga/step-photos.webp",
  "/portfolio-assets/securion/hero-wallet.png",
  "/portfolio-assets/nesba/open-banking.png",
  "/portfolio-assets/hotel-apartments/web-overview.png",
  "/portfolio-assets/material-exchange-photo-lab/hero-cover.png"
];

const HERO_REEL_INTERVAL = 370; // three cuts a second; the tile keeps growing 0 -> 100% underneath them

function HeroCaseReel({ active, startDelay }: { active: boolean; startDelay: number }) {
  const [frame, setFrame] = useState(0);
  const [shown, setShown] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Keep the first paint light; warm the remaining case-study visuals only
  // after the reel has arrived on screen.
  useEffect(() => {
    if (!shown) return;
    HERO_REEL_FRAMES.slice(1).forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, [shown]);

  useEffect(() => {
    if (!active) return;
    const appear = window.setTimeout(() => setShown(true), startDelay);
    return () => window.clearTimeout(appear);
  }, [active, startDelay]);

  useEffect(() => {
    if (!shown || reducedMotion) return;
    const tick = window.setInterval(
      () => setFrame((current) => (current + 1) % HERO_REEL_FRAMES.length),
      HERO_REEL_INTERVAL
    );
    return () => window.clearInterval(tick);
  }, [shown, reducedMotion]);

  return (
    <span className={`dw-hero-reel${shown ? " is-shown" : ""}`} aria-hidden="true">
      <img src={HERO_REEL_FRAMES[frame]} alt="" width={480} height={360} decoding="async" />
    </span>
  );
}

export function HeroSection() {
  const [heroFocus, setHeroFocus] = useState<"products" | "designers" | "culture" | null>(null);
  const [isTyping, setIsTyping] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dw-home-intro-done")
  );
  const productsLink = useResolvedNavLink("/am/designer");
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

  // Main character: one keyed frame sequence per state, driven by
  // characterMotion.ts (entrance on first view, breathing idle, hover
  // reactions, scroll invitation, gravity scrub from the home timeline).
  const heroSectionRef = useRef<HTMLElement | null>(null);
  // The character is the MP4 clips with the studio background baked in and
  // feathered edges; `?hero=frames` on the home URL brings back the keyed
  // frame sequences for comparison.
  const [heroMode] = useState<"frames" | "video">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("hero") === "frames" ? "frames" : "video"
  );
  const [heroGone, setHeroGone] = useState(() => isHeroGone());
  const heroBubbleLayerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onGone = () => setHeroGone(true);
    window.addEventListener(GONE_EVENT, onGone);
    return () => window.removeEventListener(GONE_EVENT, onGone);
  }, []);
  const character = useCharacterMotion({ sectionRef: heroSectionRef, start: isTyping, enabled: heroMode === "frames" });
  const { onHoverIntent: characterHover } = character;

  useEffect(() => {
    if (heroMode !== "frames") return;
    // Nav hovers keep speaking the old dialect (idk / good / scroll).
    const onPose = (event: Event) => {
      const pose = (event as CustomEvent<HeroPose | null>).detail ?? null;
      characterHover(pose === "idk" ? "considering" : pose === "good" ? "approval" : pose === "scroll" ? "scroll" : null);
    };
    window.addEventListener("dw-hero-pose", onPose);
    return () => window.removeEventListener("dw-hero-pose", onPose);
  }, [characterHover, heroMode]);

  useEffect(() => {
    if (heroMode !== "frames") return;
    // The hero words have their own reactions: designers makes him consider,
    // creative culture gets the nod.
    characterHover(heroFocus === "designers" ? "considering" : heroFocus === "culture" ? "approval" : null);
  }, [heroFocus, characterHover, heroMode]);

  return (
    <section
      className={`dw-section dw-home-hero dw-figma-hero${isTyping ? " is-copy-typing" : ""}${heroFocus ? ` has-focus is-${heroFocus}` : ""}`}
      id="top"
      ref={heroSectionRef}
      onMouseMove={(event) => {
        handleHeroMove(event);
        character.onPointerMove(event);
      }}
      onMouseLeave={(event) => {
        resetHeroMove(event);
        character.onPointerLeave();
      }}
    >
      <div className="dw-home-hero-screen">
        <figure
          className={`dw-home-hero-portrait-card is-mode-${heroMode} is-state-${character.state}${character.entered ? " has-entered" : ""}${heroGone ? " is-gone" : ""}`}
          data-speed="-0.18"
          data-float-depth="0.2"
          data-cursor-label={heroGone ? undefined : "poke"}
          style={character.parallaxStyle}
          role={heroGone ? undefined : "button"}
          tabIndex={heroGone ? -1 : 0}
          aria-label={heroGone ? "An empty studio stool. Davit has left." : "Poke Davit"}
          onClick={() => window.dispatchEvent(new CustomEvent(POKE_EVENT))}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              window.dispatchEvent(new CustomEvent(POKE_EVENT));
            }
          }}
        >
          {heroMode === "video" ? (
            <HeroCharacterVideo start={isTyping} focus={heroFocus} bubbleLayer={heroBubbleLayerRef} />
          ) : (
            <img
              className="dw-hero-character"
              src={character.src}
              alt={character.state === "entrance" && !character.entered ? "" : "Davit Pedanyan seated on a studio stool"}
              decoding="sync"
              draggable={false}
            />
          )}
        </figure>
        <div className="dw-hero-bubble-layer" ref={heroBubbleLayerRef} aria-hidden="true" />

        <div className="dw-home-hero-statement" data-speed="0.12" data-float-depth="-0.08">
          <h1 aria-label="I build products, designers, and culture.">
            <span className="dw-figma-hero-line dw-figma-copy dw-figma-copy-build">
              <AnimatedHeroCopy text="I build" start={0} step={42} />
            </span>
            <span className="dw-figma-hero-line dw-figma-hero-line-products">
              <HeroCaseReel active={isTyping} startDelay={3500} />
              <a
                className="dw-figma-hero-word dw-figma-copy dw-figma-copy-products"
                href={productsLink.href}
                target={productsLink.target}
                data-cursor-label="View case studies"
                {...focusHeroWord("products")}
              >
                <AnimatedHeroCopy text="products" start={370} step={70} />
              </a>
              <span className="dw-figma-copy dw-figma-copy-products">
                <AnimatedHeroCopy text="," start={980} step={42} />
              </span>
            </span>
            <span className="dw-figma-hero-line">
              <span className="dw-figma-hero-word dw-figma-copy dw-figma-copy-designers">
                <AnimatedHeroCopy text="designers," start={1140} step={70} />
              </span>
            </span>
            <span className="dw-figma-hero-line">
              <span className="dw-figma-copy dw-figma-copy-and">
                <AnimatedHeroCopy text="and " start={1900} step={42} />
              </span>
              <a
                className="dw-figma-hero-word dw-figma-copy dw-figma-copy-culture"
                href={cultureLink.href}
                target={cultureLink.target}
                data-cursor-label="View public work"
                {...focusHeroWord("culture")}
              >
                <AnimatedHeroCopy text="culture" start={2230} step={65} />
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

  useLayoutEffect(() => {
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
        <h2 className="dw-mobile-section-title">Design facts</h2>
        <div className="dw-designer-static-head">
          <span>{websiteContent.navigation.logo}</span>
          <span>DESIGNER</span>
        </div>
        {designerStats.map((stat) => (
          <MobileDesignerStat key={stat.value} value={stat.value} caption={stat.caption} />
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
                    <SlotMachineNumber value={stat.value} />
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
          {websiteContent.home.pathCards.filter((card) => card.href !== "/am/school").map((card) => (
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
        I design products, build designers, and host the rooms where Armenia&apos;s
        design community argues, learns, and grows.
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
        {websiteContent.home.talkRoutes.filter((route) => route !== "Want to learn design?").map((route) => (
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
      <div className="dw-mobile-cube-orbit" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}


const localCompanyLogos: Record<string, string> = {
  "Liga Insurance": "/logos/liga-icon.svg",
  Delux: "/logos/delux-holiday-homes.png"
};

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
  const logoUrl = localCompanyLogos[company] ?? getCompanyLogoUrl(domain, sourceIndex);
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
  const [detail, setDetail] = useState<ExperienceModalPayload | null>(null);

  return (
    <>
      <header className="dw-experience-heading">
        <h2>Work experience</h2>
      </header>
      <ol className="dw-experience-list">
      {experiences.map((experience, index) => {
        const isActive = index === activeIndex;
        return (
          <li className={isActive ? "is-active" : ""} key={experience.company}>
            <button
              className="dw-experience-item-button"
              type="button"
              onClick={() => onSelect?.(index)}
              aria-current={isActive ? "step" : undefined}
              data-cursor-label={isActive ? "" : "See this role"}
            >
              <span className="dw-experience-company">{experience.company}</span>
            </button>
            <div className="dw-experience-active-detail" aria-hidden={!isActive}>
              <ExperienceLogo company={experience.company} domain={experience.logoDomain} />
              <span className="dw-experience-meta">
                <span>{experience.role}</span>
                <span>{experience.type}</span>
              </span>
              <span className="dw-experience-description">
                {experienceSummary(experience.company, experience.description)}
                {" "}
                <button
                  className="dw-experience-more"
                  type="button"
                  tabIndex={isActive ? 0 : -1}
                  data-cursor-label="Read the full story"
                  onClick={() =>
                    setDetail({
                      company: experience.company,
                      role: experience.role,
                      type: experience.type,
                      body: experienceBody(experience.company, experience.description)
                    })
                  }
                >
                  Read more
                </button>
              </span>
            </div>
          </li>
        );
      })}
      </ol>
      <ExperienceDetailModal entry={detail} onClose={() => setDetail(null)} />
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
  const [staticDetail, setStaticDetail] = useState<ExperienceModalPayload | null>(null);
  const [staticActiveIndex, setStaticActiveIndex] = useState(0);

  useLayoutEffect(() => {
    if (useStaticMode || !sectionRef.current || !sceneRef.current) return;

    const section = sectionRef.current;
    const scene = sceneRef.current;
    const ctx = gsap.context(() => {
      const list = scene.querySelector<HTMLElement>(".dw-experience-list");
      const items = gsap.utils.toArray<HTMLElement>(".dw-experience-list li");

      if (!list || items.length === 0) return;

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

  useEffect(() => {
    if (!useStaticMode) return;

    const list = sectionRef.current?.querySelector<HTMLElement>(".dw-experience-static-list");
    const articles = Array.from(list?.querySelectorAll<HTMLElement>("article") ?? []);
    if (!articles.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = articles.indexOf(visible.target as HTMLElement);
        if (index >= 0) setStaticActiveIndex(index);
      },
      { root: list, rootMargin: "-18% 0px -28% 0px", threshold: [0.2, 0.5, 0.8] }
    );

    articles.forEach((article) => observer.observe(article));
    return () => observer.disconnect();
  }, [useStaticMode]);

  if (useStaticMode) {
    return (
      <section
        ref={sectionRef}
        className="dw-experience-static"
        aria-label="Work experience"
        data-experience-theme={experienceTheme(experiences[staticActiveIndex]?.company ?? "")}
      >
        <h2 className="dw-experience-static-title" data-anim="mask">Work experience</h2>
        <div className="dw-experience-static-list">
          {experiences.map((experience, index) => (
            <article key={experience.company}>
              <div className="dw-experience-static-headline">
                <ExperienceLogo company={experience.company} domain={experience.logoDomain} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{experience.company}</h3>
              <p>{experience.role}</p>
              <p>
                {experienceSummary(experience.company, experience.description)} {" "}
                <button
                  className="dw-experience-more dw-experience-static-more"
                  type="button"
                  data-cursor-label="Read the full story"
                  onClick={() =>
                    setStaticDetail({
                      company: experience.company,
                      role: experience.role,
                      type: experience.type,
                      body: experienceBody(experience.company, experience.description)
                    })
                  }
                >
                  Read more
                </button>
              </p>
            </article>
          ))}
        </div>
        <ExperienceDetailModal entry={staticDetail} onClose={() => setStaticDetail(null)} />
      </section>
    );
  }

  return (
    <section
      className="dw-experience-scroll"
      aria-label="Work experience"
      ref={sectionRef}
      data-experience-theme={experienceTheme(experiences[activeIndex]?.company ?? "")}
    >
      <div className="dw-experience-scene" ref={sceneRef}>
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
  // The scroll hint at the foot of the scene names the next chapter and,
  // on click, jumps straight to it. Wired from inside the scene effect.
  const scrollHintRef = useRef<HTMLButtonElement | null>(null);
  const scrollHintActionRef = useRef<() => void>(() => undefined);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const compactMotion = useMediaQuery("(max-width: 760px)");
  const useStaticMode = reducedMotion || compactMotion;

  useLayoutEffect(() => {
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
      const clientsPanel = scene.querySelector<HTMLElement>(".dw-home-unified-clients");
      const clientsLabel = scene.querySelector<HTMLElement>(".dw-clients-label");
      const clientItems = gsap.utils.toArray<HTMLElement>(".dw-clients-item");
      const experienceList = scene.querySelector<HTMLElement>(".dw-experience-list");
      const experienceItems = gsap.utils.toArray<HTMLElement>(".dw-experience-list li");
      const experienceHeading = scene.querySelector<HTMLElement>(".dw-experience-heading");

      if (
        !hero ||
        !heroScreen ||
        !statsPanel ||
        !experiencePanel ||
        !whitePanel ||
        !experienceList ||
        statStages.length === 0 ||
        experienceItems.length === 0
      ) return;

      const timeline = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      const investmentCounter = { value: 0 };
      const factFocusTimes: number[] = [];
      const experienceFocusTimes: number[] = [];
      const playback = {
        time: 0,
        chapter: "hero" as "hero" | "facts" | "clients" | "experience",
        activeFact: -1,
        clientStep: 0,
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
      let heroScrollNudgeDone = false;
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
      if (experienceHeading) gsap.set(experienceHeading, { autoAlpha: 0, y: 26 });
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

      // Clients live in the white wash between the numbers finale and the
      // timeline. They arrive out of the same depth the last number left
      // through, hold, then lift away as the timeline takes over. No loop:
      // the beat only advances while Davit's visitor is scrolling.
      const hasClients = Boolean(clientsPanel) && clientItems.length > 0;
      const clientsStart = statsEnd + 0.15;
      const clientsIntroTime = clientsStart + 0.55;
      const clientsFocusTime = hasClients ? clientsStart + 1.8 : 0;
      const clientsExitAt = clientsStart + 2.55;
      const experienceStart = statsEnd + (hasClients ? 3.25 : 0.4);

      if (clientsPanel && hasClients) {
        const clientGridColumns = 4;
        const clientGridRows = Math.ceil(clientItems.length / clientGridColumns);
        const viewportX = window.innerWidth * 0.72;
        const viewportY = window.innerHeight * 0.76;

        gsap.set(clientsPanel, { autoAlpha: 0 });
        if (clientsLabel) gsap.set(clientsLabel, { autoAlpha: 0, y: 16 });

        timeline.to(clientsPanel, { autoAlpha: 1, duration: 0.22 }, clientsStart);

        if (clientsLabel) {
          timeline.to(
            clientsLabel,
            { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" },
            clientsStart + 0.04
          );
        }

        clientItems.forEach((item, itemIndex) => {
          const column = itemIndex % clientGridColumns;
          const row = Math.floor(itemIndex / clientGridColumns);
          const fromLeft = column < clientGridColumns / 2;
          const isMiddleRow = clientGridRows % 2 === 1 && row === Math.floor(clientGridRows / 2);
          const fromTop = isMiddleRow ? column % 2 === 0 : row < clientGridRows / 2;
          const delay = 0.1 + ((itemIndex * 5) % clientItems.length) * 0.055;
          const rotate = (fromLeft ? -1 : 1) * (fromTop ? 1 : -1) * 8;

          gsap.set(item, {
            autoAlpha: 0,
            x: fromLeft ? -viewportX : viewportX,
            y: fromTop ? -viewportY : viewportY,
            scale: 0.72,
            rotate
          });

          timeline.to(
            item,
            { autoAlpha: 1, x: 0, y: 0, scale: 1, rotate: 0, duration: 0.85, ease: "power3.out" },
            clientsStart + delay
          );
        });

        timeline.to(
          clientItems,
          { autoAlpha: 0, y: -30, scale: 1.08, duration: 0.4, ease: "power2.in", stagger: 0.018 },
          clientsExitAt
        );

        if (clientsLabel) {
          timeline.to(clientsLabel, { autoAlpha: 0, y: -12, duration: 0.3 }, clientsExitAt + 0.04);
        }

        timeline.to(clientsPanel, { autoAlpha: 0, duration: 0.28 }, clientsExitAt + 0.26);
      }

      timeline
        .to(experiencePanel, { autoAlpha: 1, duration: 0.3 }, experienceStart)
        .to(whitePanel, { autoAlpha: 0, duration: 0.5 }, experienceStart + 0.55);

      if (experienceHeading) {
        timeline.to(
          experienceHeading,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" },
          experienceStart + 0.15
        );
        timeline.to(
          experienceHeading,
          { autoAlpha: 0, y: "-28vh", duration: 0.46, ease: "power2.inOut" },
          // The title belongs to the first role. It clears the viewport as
          // the second role takes focus, leaving the role sequence unobscured.
          experienceStart + 0.66
        );
      }

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

      // What comes next, per chapter - shown in the scroll hint.
      let hintLabel = "";
      const syncHint = () => {
        const hint = scrollHintRef.current;
        if (!hint) return;
        const label =
          playback.chapter === "hero" ? "facts"
          : playback.chapter === "facts" ? (hasClients ? "clients" : "experience")
          : playback.chapter === "clients" ? "experience"
          : `next: ${nextSitePage("home").title.toLowerCase()}`;
        if (label === hintLabel) return;
        hintLabel = label;
        const text = hint.querySelector<HTMLElement>(".dw-scroll-hint-text");
        if (text) text.textContent = label;
        hint.setAttribute("aria-label", `Continue to ${label}`);
      };

      const renderPlayback = () => {
        syncHint();
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
          // The final investment figure gets a moment to land, then the
          // story carries into the founders scene without requiring another
          // scroll. Wheel and touch gestures still use the same route.
          playback.autoAt = isFinal ? now + 2.4 : now;
          playback.awaitingExitGesture = false;
          if (!isFinal) {
            moveToFact(index + 1, 1);
          }
        }, "none");
      };

      const moveToClients = (direction: 1 | -1, step = 0) => {
        if (!hasClients) {
          moveToExperience(0, direction, true);
          return;
        }

        playback.chapter = "clients";
        playback.clientStep = step;
        playback.awaitingExitGesture = false;
        const targetTime = step === 0 ? clientsIntroTime : clientsFocusTime;
        const timelineDistance = Math.abs(targetTime - playback.time);
        moveTo(
          targetTime,
          Math.max(0.35, Math.min(0.85, timelineDistance)),
          direction,
          () => {
            const now = gsap.ticker.time;
            playback.cooldownUntil = Math.max(playback.cooldownUntil, now + 0.55);
            playback.minimumUntil = now;
            playback.holdUntil = now + 0.5;
            // A client chapter is one entrance: let every logo reach its
            // grid position before pausing. The next scroll then advances to
            // experience, rather than being spent finishing the grid.
            if (step === 0 && direction > 0) {
              playback.autoAt = now;
              moveToClients(1, 1);
              return;
            }
            playback.autoAt = Number.POSITIVE_INFINITY;
            playback.awaitingExitGesture = false;
          },
          "power2.inOut"
        );
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

      // Click on the scroll hint: straight to the next chapter, no nudge, no
      // cooldown. Past the last one it lets the page go and glides to the
      // conversation section.
      scrollHintActionRef.current = () => {
        finalHandoffCall?.kill();
        finalHandoffCall = null;
        motionTween?.kill();
        motionTween = null;
        playback.speedMultiplier = 1;
        playback.cooldownUntil = 0;
        heroScrollNudgeDone = true;
        if (playback.chapter === "hero") {
          moveTo(heroTransitionEnd, 0.7, 1, () => {
            enterFacts();
            moveToFact(0, 1);
          });
          return;
        }
        if (playback.chapter === "facts") {
          moveToClients(1, 0);
          return;
        }
        if (playback.chapter === "clients") {
          moveToExperience(0, 1, true);
          return;
        }
        releaseToPage(1);
        const end = document.getElementById("next-page") ?? document.getElementById("contact");
        if (end) {
          window.requestAnimationFrame(() => end.scrollIntoView({ behavior: "smooth", block: "end" }));
        }
      };
      syncHint();

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
          if (playback.chapter === "clients") {
            if (direction < 0) {
              if (playback.clientStep === 0) {
                playback.chapter = "facts";
                moveToFact(factFocusTimes.length - 1, -1);
              } else {
                moveToClients(-1, 0);
              }
            } else if (playback.clientStep === 0) {
              moveToClients(1, 1);
            } else {
              moveToExperience(0, 1, true);
            }
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
          if (!heroScrollNudgeDone) {
            // First down-scroll: Davit points down once. The next scroll moves on.
            heroScrollNudgeDone = true;
            emitHeroPose("scroll");
            gsap.delayedCall(1.7, () => emitHeroPose(null));
            playback.cooldownUntil = now + 0.9;
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
            moveToClients(1);
            return;
          }
          moveToFact(playback.activeFact + 1, 1);
          return;
        }

        if (playback.chapter === "clients") {
          if (direction < 0) {
            if (playback.clientStep === 0) {
              playback.chapter = "facts";
              moveToFact(factFocusTimes.length - 1, -1);
            } else {
              moveToClients(-1, 0);
            }
          } else if (playback.clientStep === 0) {
            moveToClients(1, 1);
          } else {
            moveToExperience(0, 1, true);
          }
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

        // Let the final $27M moment resolve into the next chapter even when
        // the reader pauses. This preserves the scroll choreography while
        // avoiding a dead-end at the end of the number sequence.
        if (
          playback.chapter === "facts" &&
          playback.activeFact === factFocusTimes.length - 1 &&
          !motionTween &&
          now >= playback.autoAt
        ) {
          playback.autoAt = Number.POSITIVE_INFINITY;
          moveToClients(1);
        }
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
        <HomePartnerLogosSection />
        <DesignerScrollStory />
        <ExperienceScrollSection />
      </div>
    );
  }

  return (
    <section className="dw-home-unified-scroll" ref={sectionRef} aria-label="Davit Pedanyan overview">
      <div className="dw-home-unified-scene" ref={sceneRef}>
        <button
          type="button"
          className="dw-scroll-hint"
          ref={scrollHintRef}
          aria-label="Continue to facts"
          data-cursor-label="next"
          onClick={() => scrollHintActionRef.current()}
        >
          <span className="dw-scroll-hint-line" aria-hidden="true" />
          <span className="dw-scroll-hint-text">facts</span>
        </button>
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
          <OctagonField />
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
                    <div ref={investmentRef}><SlotMachineNumber value={stat.value} /></div>
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

        <div className="dw-home-unified-phase dw-home-unified-clients" aria-label="Selected clients">
          <div className="dw-clients-inner">
            <p className="dw-clients-label">Selected clients</p>
            <ul className="dw-clients-grid">
              {partnerBrands.map((brand) => (
                <li className="dw-clients-item" key={brand.name}>
                  {brand.wordmark ? (
                    <img className="dw-clients-wordmark" src={brand.wordmark} alt={brand.name} loading="lazy" />
                  ) : brand.noMark ? null : (
                    <ExperienceLogo company={brand.name} domain={brand.domain} />
                  )}
                  <span className="dw-clients-name">{brand.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="dw-home-unified-phase dw-home-unified-experience"
          aria-label="Work experience"
          data-experience-theme={experienceTheme(experiences[activeIndex]?.company ?? "")}
        >
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

function LegacyPublicMediaGridPageSection() {
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

export function PublicMediaGridPageSection() {
  const [activePodcast, setActivePodcast] = useState<(typeof publicArchiveEntries)[number] | null>(null);
  const [activeArchiveYear, setActiveArchiveYear] = useState<string>("2026");
  const archiveEntries = [...publicArchiveEntries].sort((a, b) => {
    const dateFor = (entry: (typeof publicArchiveEntries)[number]) => entry.publishedAt ?? `${entry.year}-01-01`;
    return dateFor(b).localeCompare(dateFor(a));
  });
  const archiveYears = [...new Set(archiveEntries.map((entry) => entry.year))];

  useEffect(() => {
    let frame = 0;
    const updateActiveYear = () => {
      frame = 0;
      const center = window.innerHeight / 2;
      const entries = [...document.querySelectorAll<HTMLElement>("[data-public-archive-year]")];
      const nearest = entries.reduce<HTMLElement | undefined>((closest, candidate) => {
        if (!closest) return candidate;
        const candidateDistance = Math.abs(candidate.getBoundingClientRect().top - center);
        const closestDistance = Math.abs(closest.getBoundingClientRect().top - center);
        return candidateDistance < closestDistance ? candidate : closest;
      }, undefined);
      const year = nearest?.dataset.publicArchiveYear;
      if (year) setActiveArchiveYear(year);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveYear);
    };
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="dw-media-page" id="public-work">
      <section className="dw-public-media-section dw-public-journal" aria-label="Public work archive">
        <nav className="dw-public-year-timeline" aria-label="Public archive years">
          {archiveYears.map((year) => (
            <a key={year} href={`#public-year-${year}`} className={activeArchiveYear === year ? "is-active" : undefined}>{year}</a>
          ))}
        </nav>
        <header className="dw-public-journal-hero">
          <span>Public work / selected stories</span>
          <h1>Talks, events,<br />and conversations<br />in public.</h1>
          <p>I organise formats, moderate discussions, teach, write, and join the conversations that help Armenia’s design community get sharper and more connected.</p>
        </header>

        <section className="dw-public-journal-grid" aria-label="Public work archive">
          {archiveEntries.map((entry, index) => {
            const videoId = "videoId" in entry ? entry.videoId : undefined;
            const externalUrl = "externalUrl" in entry ? entry.externalUrl : undefined;
            const isFirstInYear = archiveEntries.findIndex((item) => item.year === entry.year) === index;
            const yearAnchorProps = {
              id: isFirstInYear ? `public-year-${entry.year}` : undefined,
              "data-public-archive-year": entry.year,
            };
            const linkLabel = videoId ? "Watch and read ↗" : externalUrl ? "Read on Medium" : "Read article ↗";
            const cardContent = <>
              <div className={`dw-public-journal-entry-media${entry.secondaryImage ? " has-secondary" : ""}`}>
                <img src={entry.image} alt={entry.imageAlt} />
                {entry.secondaryImage ? <img src={entry.secondaryImage} alt="" aria-hidden="true" /> : null}
                {videoId ? <span className="dw-public-podcast-play" aria-hidden="true"><Play fill="currentColor" size={19} /></span> : null}
              </div>
              <div><span>{entry.year}</span><span>{entry.type}</span></div>
              <h2>{entry.title}</h2>
              <p>{entry.description}</p>
              <span className={`dw-public-journal-link${externalUrl ? " is-external" : ""}`}>
                {linkLabel}
                {externalUrl ? <ExternalLink size={13} strokeWidth={1.7} aria-hidden="true" /> : null}
              </span>
            </>;

            const cursorLabel = articleCursorLabel(entry.slug, Boolean(videoId));

            return videoId ? (
              <button {...yearAnchorProps} className={`dw-public-journal-entry is-podcast entry-${index + 1}`} key={entry.title} type="button" data-cursor-label={cursorLabel} onClick={() => setActivePodcast(entry)}>
                {cardContent}
              </button>
            ) : externalUrl ? (
              <a {...yearAnchorProps} className={`dw-public-journal-entry entry-${index + 1}`} key={entry.title} href={externalUrl} target="_blank" rel="noreferrer" data-cursor-label={cursorLabel}>
                {cardContent}
              </a>
            ) : (
              <a {...yearAnchorProps} className={`dw-public-journal-entry entry-${index + 1}`} key={entry.title} href={`/am/public-work/${entry.slug}`} data-cursor-label={cursorLabel}>
                {cardContent}
              </a>
            );
          })}
        </section>
      </section>

      {activePodcast && "videoId" in activePodcast ? (
        <div className="dw-public-podcast-modal" role="dialog" aria-modal="true" aria-label={`Play ${activePodcast.title}`} onClick={() => setActivePodcast(null)}>
          <div className="dw-public-podcast-modal-frame" onClick={(event) => event.stopPropagation()}>
            <button className="dw-public-podcast-close" type="button" onClick={() => setActivePodcast(null)} aria-label="Close video"><X size={21} /></button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activePodcast.videoId}?autoplay=1`}
              title={activePodcast.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PublicArticlePage({ slug }: { slug: string }) {
  const entry = publicArchiveEntries.find((item) => item.slug === slug);
  const article = publicArticleCopy[slug];
  const videoId = entry && "videoId" in entry ? entry.videoId : undefined;
  const gallery = (entry && "gallery" in entry ? entry.gallery : []) ?? [];
  const galleryCaptions = (entry && "galleryCaptions" in entry ? entry.galleryCaptions : []) ?? [];
  const inlineImages = (entry && "inlineImages" in entry ? entry.inlineImages : []) ?? [];
  const inlineCaptions = (entry && "inlineCaptions" in entry ? entry.inlineCaptions : []) ?? [];
  const articleEntries = publicArchiveEntries
    .filter((item) => Boolean(publicArticleCopy[item.slug]) && !("externalUrl" in item))
    .sort((a, b) => {
      const dateFor = (item: (typeof publicArchiveEntries)[number]) => item.publishedAt ?? `${item.year}-01-01`;
      return dateFor(a).localeCompare(dateFor(b));
    });
  const articleIndex = entry ? articleEntries.findIndex((item) => item.slug === entry.slug) : -1;
  const nextArticle = articleIndex >= 0 && articleIndex < articleEntries.length - 1 ? articleEntries[articleIndex + 1] : undefined;

  const pilotImageSizes: Record<string, [number, number]> = {
    "/public-work/ux-storm-1-2/banner-cover.jpg": [2200, 1238],
    "/public-work/ux-storm-1-2/banner-alexandra.jpg": [2200, 1238],
    "/public-work/ux-storm-1-2/banner-davit.jpg": [2200, 1238],
    "/public-work/ux-storm-1-2/banner-nareg.jpg": [2200, 1238],
    "/public-work/ux-storm-1-2/banner-hrachik.jpg": [2200, 1238],
    "/public-work/ux-storm-1-2/banner-shiraz.jpg": [2200, 1238],
    "/public-work/ux-storm-1-2/research-talk.jpg": [1650, 2200],
    "/public-work/ux-storm-1-2/audience.jpg": [2200, 1237],
    "/public-work/ux-storm-1-2/speed-discussion.jpg": [1650, 2200]
  };
  const articleRef = useRef<HTMLElement | null>(null);
  useTextMotion(articleRef);

  if (!entry || !article) return <PublicWorkPage />;

  return (
    <PageShell activePage="publicWork" showFooter={false}>
      <article className="dw-public-article dw-motion-pilot" ref={articleRef}>
        <a className="dw-public-article-back" href="/am/public-work">← Public archive</a>
        <header className="dw-public-article-hero">
          <div>
            <span>{article.eyebrow}</span>
            <h1>{entry.title}</h1>
            <p>{article.standfirst}</p>
          </div>
          <div className="dw-public-article-hero-media">
            {videoId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                title={entry.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : <img src={entry.image} alt={entry.imageAlt} width={pilotImageSizes[entry.image]?.[0]} height={pilotImageSizes[entry.image]?.[1]} />}
            {entry.type.includes("UX Storm") ? (
              <span className="dw-uxstorm-badge" aria-hidden="true">
                <img className="dw-uxstorm-badge-ring" src="/public-work/ux-storm-badge-ring.svg" alt="" />
                <img className="dw-uxstorm-badge-mark" src="/public-work/ux-storm-badge-mark.svg" alt="" />
              </span>
            ) : null}
          </div>
        </header>

        <div className="dw-public-article-body">
          <aside>
            <span>{entry.year}</span>
            <span>{entry.type}</span>
          </aside>
          <div>
            {article.sections.map((section, sectionIndex) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {inlineImages[sectionIndex] ? (
                  <figure className={`dw-public-article-inline-image image-${sectionIndex + 1}`}>
                    <img
                      src={inlineImages[sectionIndex]}
                      alt={`${entry.type}: ${section.title}`}
                      loading="lazy"
                      width={pilotImageSizes[inlineImages[sectionIndex]]?.[0]}
                      height={pilotImageSizes[inlineImages[sectionIndex]]?.[1]}
                    />
                    {inlineCaptions[sectionIndex] ? <figcaption>{inlineCaptions[sectionIndex]}</figcaption> : null}
                  </figure>
                ) : null}
              </section>
            ))}
          </div>
        </div>

        {gallery.length ? (
          <section className="dw-public-article-gallery" aria-label={`${entry.type} event gallery`}>
            <span>
              Selected moments / {entry.type}
              {"galleryNote" in entry && entry.galleryNote ? <em className="dw-public-gallery-note">{entry.galleryNote}</em> : null}
            </span>
            <MediaCarousel
              ariaLabel={`${entry.type} event gallery`}
              items={gallery.map((src, i) => ({
                src,
                caption: galleryCaptions[i],
                alt: `${entry.type} event moment ${i + 1}`,
                width: pilotImageSizes[src]?.[0],
                height: pilotImageSizes[src]?.[1]
              }))}
            />
          </section>
        ) : entry.secondaryImage ? (
          <section className="dw-public-article-gallery-placeholder" aria-label="Event gallery placeholder">
            <span>Selected moment</span>
            <img src={entry.secondaryImage} alt="Additional event moment" />
          </section>
        ) : null}

        <footer className="dw-public-article-footer">
          <a href={entry.url} target="_blank" rel="noreferrer">View related source ↗</a>
          <PullToContinue
            href={nextArticle ? `/am/public-work/${nextArticle.slug}` : "/am/public-work"}
            kicker={nextArticle ? "Next article" : "Back to the archive"}
            title={nextArticle ? nextArticle.title : "More public work"}
            cursorLabel={nextArticle ? articleCursorLabel(nextArticle.slug) : "Back to the archive"}
          />
        </footer>
      </article>
    </PageShell>
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
          Tell me whether you need design help, want to invite me, or want to work together.
        </p>
      </div>
      <div className="dw-cta-list">
        {websiteContent.sharedContactRoutes.filter((route) => route !== "Want to learn design?").map((route) => (
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

        {websiteContent.letsTalk.routes.filter((route) => route.className !== "dw-talk-route-students").map((route) => (
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

/**
 * `noMark` means the domain has no usable icon — Google serves its generic
 * globe rather than a 404, so these would otherwise all render as the same
 * blurry planet. Those entries fall through to type instead.
 */
const partnerBrands: Array<{ name: string; domain: string; wordmark?: string; noMark?: boolean }> = [
  { name: "NPUA", domain: "polytechnic.am" },
  { name: "Mellat Bank", domain: "mellatbank.am" },
  { name: "Public Council of Armenia", domain: "publiccouncil.am", noMark: true },
  { name: "SoftLand", domain: "softland.am", noMark: true },
  { name: "Wirestock", domain: "wirestock.io" },
  { name: "Yerevan Mall", domain: "yerevanmall.am" },
  { name: "Kinodaran", domain: "kinodaran.am" },
  { name: "TCF", domain: "tcf.am", wordmark: "/logos/partners/tcf.png" },
  { name: "W8RK", domain: "w8rk.com" },
  { name: "8Imiges", domain: "", noMark: true },
  { name: "Insafe", domain: "insafe.am" },
  { name: "Sarkissian.pro", domain: "sarkissian.pro" }
];

export function HomePartnerLogosSection() {
  return (
    <section className="dw-partner-marquee" aria-label="Partner companies and organizations" data-anim="fade">
      <h2 className="dw-mobile-section-title">Partners</h2>
      <div className="dw-partner-marquee-track">
        {partnerBrands.map((item, index) => (
          <span
            className="dw-partner-marquee-item"
            key={item.name}
            data-anim="rise"
            style={{ "--i": index } as CSSProperties}
          >
            {item.wordmark ? (
              <img className="dw-partner-marquee-wordmark" src={item.wordmark} alt={item.name} loading="lazy" />
            ) : (
              <>
                {item.noMark ? null : <ExperienceLogo company={item.name} domain={item.domain} />}
                <span>{item.name}</span>
              </>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <PageShell className="dw-home-shell" activePage="home">
      <HomeIntroSection />
      <HomeUnifiedScrollExperience />
    </PageShell>
  );
}

export function DesignerPage() {
  return (
    <PageShell activePage="designer">
      <Suspense fallback={<div className="dw-route-loading" aria-live="polite">Loading work</div>}>
        <LazyPortfolioIndexContent />
      </Suspense>
    </PageShell>
  );
}

export function PortfolioPage() {
  return <DesignerPage />;
}

export function ProjectPage({ slug }: { slug: string }) {
  return (
    <PageShell activePage="designer" showFooter={false}>
      <Suspense fallback={<div className="dw-route-loading" aria-live="polite">Loading case study</div>}>
        <LazyCaseStudyContent key={slug} slug={slug} />
      </Suspense>
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
  return (
    <PageShell activePage="publicWork">
      <PublicMediaGridPageSection />
    </PageShell>
  );
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

const normalisePath = (value: string) => value.replace(/\/+$/, "") || "/";

/* Same-origin links are handled in the page instead of by the browser, so a
   page change never reloads the document. Everything else — new tabs, modified
   clicks, downloads, external hosts, mailto/tel, bare hashes — is left alone
   and behaves exactly as it did before. */
function useRoutePath() {
  const [path, setPath] = useState(() => normalisePath(window.location.pathname));

  useEffect(() => {
    const sync = () => setPath(normalisePath(window.location.pathname));
    window.addEventListener("popstate", sync);

    const onClick = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.hasAttribute("download")) return;
      const target = anchor.getAttribute("target");
      if (target && target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      event.preventDefault();

      /* an in-page anchor on the current route just scrolls */
      if (normalisePath(url.pathname) === normalisePath(window.location.pathname) && url.hash) {
        document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
        return;
      }

      window.history.pushState({}, "", url.pathname + url.search + url.hash);
      setPath(normalisePath(url.pathname));
    };

    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", sync);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return path;
}

function resolveRoute(path: string): ReactNode {
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
  if (path === "/am/school") return <HomePage />;
  const publicArticleMatch = path.match(/^\/am\/public-work\/([^/]+)$/);
  if (publicArticleMatch) return <PublicArticlePage slug={publicArticleMatch[1]} />;
  if (path === "/am/public-work") return <PublicWorkPage />;
  return <HomePage />;
}

export function AppRouter() {
  const path = useRoutePath();
  const [shell, setShell] = useState<ShellState>(DEFAULT_SHELL);

  /* Lets Talk is an outbound redirect, not a page, so it stays a real navigation. */
  const isOutbound = path === "/am/lets-talk";
  useEffect(() => {
    if (isOutbound) window.location.replace(DAVIT_LINKEDIN_URL);
  }, [isOutbound]);

  /* Title, description, canonical, Open Graph and the JSON-LD graph, on every
     navigation. The prerender step bakes the same output into each route's
     static HTML, so this only has to keep the tags correct once the SPA takes
     over — but it runs through the identical code path, which is what stops
     the two versions from drifting apart. */
  useEffect(() => {
    if (isOutbound) return;
    applyHead(path);
    /* After applyHead, so the page_title GA records is the one this route
       actually sets rather than the previous route's leftover. The router is
       client-side, so without this only the first load would ever be counted. */
    initAnalytics();
    trackPageView(path);
  }, [path, isOutbound]);

  /* Whether a case study was read to the end, not merely opened. */
  useReadDepth(isOutbound ? "" : path);

  useLayoutEffect(() => {
    if (isOutbound) return;
    /* a new page starts at the top unless the link asked for an anchor */
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [path, isOutbound]);

  useEffect(() => {
    if (isOutbound) return;
    /* The outgoing page's gsap contexts revert on unmount, but a ScrollTrigger
       whose element went with it would otherwise linger and hold stale
       measurements against the new page. */
    const frame = window.requestAnimationFrame(() => {
      ScrollTrigger.getAll().forEach((trigger) => {
        const element = trigger.trigger as Element | null | undefined;
        if (element && !document.contains(element)) trigger.kill();
      });
      ScrollTrigger.refresh();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [path, isOutbound]);

  if (isOutbound) return null;

  return (
    <ShellContext.Provider value={setShell}>
      <main className={`dw-page ${shell.className}`}>
        {/* everything from here to {page} is mounted once for the whole visit */}
        <WireframeChrome />
        <SiteHeader activePage={shell.activePage} />
        <FixedSocialLinks />
        <div className="dw-fixed-music-control">
          <PortfolioMusicToggle />
        </div>
        {resolveRoute(path)}
        <ContactChat />
      </main>
    </ShellContext.Provider>
  );
}
