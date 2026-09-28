import { readFile, writeFile } from "node:fs/promises";

async function loadLocalEnv() {
  const envPath = new URL("../.env.local", import.meta.url);

  try {
    const envFile = await readFile(envPath, "utf8");
    for (const line of envFile.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.replace(/^["']|["']$/g, "");
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

await loadLocalEnv();

const NOTION_VERSION = "2025-09-03";
const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATA_SOURCE_ID || process.env.NOTION_DATABASE_ID;
const outputPath = new URL("../src/davit-wireframe/notionContent.generated.json", import.meta.url);

if (!token || !databaseId) {
  console.error("Missing NOTION_TOKEN and NOTION_DATABASE_ID or NOTION_DATA_SOURCE_ID.");
  console.error("Add them to .env.local, then run: npm run sync:notion");
  process.exit(1);
}

const defaultContent = {
  navigation: {
    logo: "PDNYN",
    primary: [
      { label: "Pedanyan", href: "/am/designer" },
      { label: "Public", href: "/am/public-work" }
    ],
    school: { label: "School", href: "/am/school" },
    talk: { label: "Let's talk", href: "/am/lets-talk" },
    socials: [
      { label: "IN", href: "https://www.linkedin.com/in/davit-pedanyan/" },
      { label: "IG", href: "https://www.instagram.com/" },
      { label: "FB", href: "https://www.facebook.com/" }
    ]
  },
  home: {
    hero: {
      headline: ["I build", "products,", "designers, and", "creative culture."],
      snippets: [
        "Design generalist",
        "Educator",
        "Community\nbuilder in Armenia",
        "Product design",
        "Public work"
      ]
    },
    pathCards: [
      {
        title: "Need design help?",
        text:
          "I help founders and product teams define the design problem, find the right designer, and decide what to do next.",
        cta: "See how I can help",
        href: "/am/designer"
      },
      {
        title: "Want to learn design?",
        text: "I teach beginners to research, critique, design interfaces, and explain their decisions.",
        cta: "Explore the school",
        href: "/am/school"
      },
      {
        title: "Want to know my story?",
        text:
          "See the talks, workshops, critique sessions, and community events I run in Armenia.",
        cta: "See my public work",
        href: "/am/public-work"
      }
    ],
    talkRoutes: [
      "Need design help?",
      "Want to learn design?",
      "Want to invite me or collaborate?",
      "Want to know my story?"
    ],
    talkCta: "Let's talk"
  },
  sharedContactRoutes: [
    "Need design help?",
    "Want to learn design?",
    "Want to invite me?",
    "Want to collaborate?"
  ],
  letsTalk: {
    headline: ["LET'S TALK", "ABOUT", "WHAT YOU NEED"],
    routes: [
      {
        label: "For companies",
        text:
          "Tell me what you are building and where design is stuck. I can define the role, find a designer, or set product direction.",
        cta: "Talk about the product",
        href: "/am/lets-talk",
        className: "dw-talk-route-companies"
      },
      {
        label: "For students",
        text: "Tell me what you want to learn and what experience you already have.",
        cta: "Ask about the school",
        href: "/am/lets-talk",
        className: "dw-talk-route-students"
      },
      {
        label: "For public work",
        text: "Invite me to speak, run a workshop, review work, or join a podcast.",
        cta: "Invite Davit",
        href: "/am/lets-talk",
        className: "dw-talk-route-public"
      },
      {
        label: "Direct contact",
        text: "Email / Instagram / LinkedIn",
        cta: "",
        href: "",
        className: "dw-talk-route-direct"
      }
    ]
  },
  designer: {
    stats: [
      { value: "20+ years", caption: "designing digital products, brands, interfaces, and design systems" },
      { value: "17 startups", caption: "building product direction, design systems, and shipped interfaces" },
      { value: "100+", caption: "consulting projects in product strategy, UX, branding, hiring, and design operations" },
      { value: "85", caption: "designers placed with product teams" },
      { value: "$27M", caption: "raised by founders whose products and pitches I helped shape" }
    ],
    next: {
      kicker: "I turn unclear product problems into decisions a team can design and ship.",
      headline: ["What I can", "do for", "you"],
      text: "I can review your product, define the design role you need, or help your team choose a direction."
    },
    experiences: [
      { company: "Lynon", role: "Head of Design", years: "Current", type: "Design leadership", logoDomain: "lynon.com", description: "I lead product design across the product and its communication." },
      { company: "Armenian Code Academy", role: "Design Practice Lead", years: "4+ years", type: "Design education", logoDomain: "aca.am", description: "I built and led UX courses, workshops, UX Storm, and mentorship programs." },
      { company: "artmart", role: "Founder", years: "Current", type: "Creative education", logoDomain: "artmart.am", description: "I founded artmart, a contemporary art school in Armenia." },
      { company: "T-Bank / Tinkoff", role: "Product Designer", years: "Verify dates", type: "Product design", logoDomain: "tbank.ru", description: "I designed products with a large fintech team." },
      { company: "Material Exchange", role: "Product / Design Lead", years: "Feb 2020 - Feb 2022", type: "Product design leadership", logoDomain: "material-exchange.com", description: "I designed the product and its design system for an international materials platform." },
      { company: "Webb Fontaine", role: "Design Lead", years: "Verify dates", type: "Enterprise product design", logoDomain: "webbfontaine.com", description: "I led design systems and interface work for complex enterprise products." },
      { company: "CloudChipr", role: "Product Design Lead", years: "Verify dates", type: "Startup product design", logoDomain: "cloudchipr.com", description: "I designed the product from its first MVP through early growth." },
      { company: "Liga Insurance", role: "Product Designer", years: "Verify dates", type: "Insurance product design", logoDomain: "liga.am", description: "I designed mobile and web insurance products." },
      { company: "Uphold", role: "Senior UI/UX Designer", years: "Verify dates", type: "Fintech / crypto product", logoDomain: "uphold.com", description: "I designed mobile wallet and crypto-fintech products." },
      { company: "The Bank of London", role: "Product Designer", years: "Verify dates", type: "Fintech product design", logoDomain: "thebankoflondon.com", description: "I designed interfaces for digital banking products." }
    ]
  },
  school: {
    hero: {
      eyebrow: "Pedanyan School",
      headline: ["Learn design", "through practice", "and critique."],
      lead: "I teach beginners in Armenia to research problems, critique work, use modern tools, and build one product case they can defend."
    },
    stats: [
      { value: "4 months", label: "beginner program" },
      { value: "up to 12", label: "students per group" },
      { value: "offline first", label: "classes in our school space" },
      { value: "1 case", label: "finished portfolio case" },
      { value: "AI workflow", label: "AI inside the design process" },
      { value: "guest mentors", label: "sessions with invited designers" }
    ],
    actions: [
      { label: "Ask about the school", href: "/am/lets-talk" },
      { label: "Book open lesson", href: "/am/lets-talk" }
    ],
    note: "Classes happen in person, with online support between sessions. Each group stays small so everyone gets direct critique.",
    standards: [
      { title: "Thinking before screens", copy: "Students research the problem, ask useful questions, and explain each design choice." },
      { title: "Critique as a habit", copy: "We review work in the room, challenge weak choices, and revise until the reasoning holds." },
      { title: "Tools with taste", copy: "Figma and AI support the work. Judgment, structure, and visual clarity decide the result." }
    ],
    practice: {
      items: ["Product thinking", "Interface structure", "Figma workflow", "AI-assisted process", "Critique sessions", "Portfolio case"],
      copy: "Students repeat the work, get direct critique, and finish with a case that explains the thinking behind each screen."
    },
    final: {
      headline: ["want to", "learn design?"],
      text: "Tell me what you have tried, what you want to learn, and how much time you can give the program.",
      cta: "Ask about the school",
      href: "/am/lets-talk"
    }
  },
  public: {
    intro: {
      headline: ["public work,", "formats,", "and media."],
      text: "I host talks, workshops, UX Storm, Drunk Talks, and critique nights for designers in Armenia. I also speak, teach, and join public conversations about design."
    },
    categories: [
      { title: "UX Storm", description: "Recaps, speaker notes, mentor debates, and useful ideas from each UX Storm.", count: "event series" },
      { title: "Public speaking", description: "Talks, panels, and interviews about design, education, AI, and culture.", count: "talks / panels" },
      { title: "Workshops", description: "Sessions for students and product teams on product thinking, portfolios, critique, and design process.", count: "facilitation" },
      { title: "Design critiques", description: "Designers bring case studies, portfolios, unfinished work, and mistakes for an honest review.", count: "critique culture" }
    ],
    drunkTalks: {
      headline: ["drinks,", "designers,", "open talk."],
      text: "I invite local and visiting designers for a drink and an unscripted conversation with the room.",
      gallery: [
        { title: "Foreign designer night", note: "guest / drink / open conversation", size: "wide", tone: "blue" },
        { title: "Design after hours", note: "experimental format", size: "narrow", tone: "warm" },
        { title: "Community table", note: "everyone is welcome", size: "double", tone: "violet" },
        { title: "Unfiltered Q&A", note: "questions that do not fit formal events", size: "single", tone: "stage" }
      ]
    },
    formats: [
      { title: "UX Storm", description: "Speakers share a case, then mentors lead short discussions with the room." },
      { title: "Drunk Talks", description: "Local and visiting designers have a drink and answer questions from anyone who joins." },
      { title: "Design critiques", description: "Designers bring case studies, portfolios, unfinished work, and mistakes for group review." },
      { title: "Invited public work", description: "I speak on panels, run workshops, review work, and mentor designers at other events." }
    ],
    mediaProjects: [
      { title: "UX Storm", category: "UX design event / speakers / speed discussions", size: "wide", tone: "deep" },
      { title: "Drunk Talks", category: "Experimental drinks-and-design conversations", size: "narrow", tone: "blue" },
      { title: "Design critique nights", category: "Case studies, portfolios, and honest failures", size: "wide", tone: "cyan" },
      { title: "Speaker appearances", category: "Talks, panels, public discussions", size: "single", tone: "violet" },
      { title: "Workshop facilitation", category: "Hands-on sessions for teams and students", size: "double", tone: "acid" },
      { title: "artmart public program", category: "Community, culture, and education formats", size: "double", tone: "warm" },
      { title: "Portfolio open reviews", category: "Designers discuss work in progress", size: "single", tone: "stage" },
      { title: "Foreign designer sessions", category: "Guests, exchange, informal learning", size: "narrow", tone: "mono" },
      { title: "Public education experiments", category: "New formats for design learning in Armenia", size: "triple", tone: "green" }
    ]
  }
};

function richTextToPlainText(richText = []) {
  return richText.map((part) => part.plain_text ?? "").join("").trim();
}

function propertyText(properties, name) {
  const property = properties[name];
  if (!property) return "";
  if (property.type === "title") return richTextToPlainText(property.title);
  if (property.type === "rich_text") return richTextToPlainText(property.rich_text);
  if (property.type === "url") return property.url ?? "";
  if (property.type === "select") return property.select?.name ?? "";
  if (property.type === "number") return String(property.number ?? "");
  if (property.type === "checkbox") return property.checkbox ? "true" : "";
  return "";
}

function propertyNumber(properties, name) {
  const property = properties[name];
  return property?.type === "number" && typeof property.number === "number" ? property.number : 0;
}

function isPublished(properties) {
  const property = properties.Published;
  return property?.type !== "checkbox" || property.checkbox;
}

async function notionRequest(path, body) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Notion API error ${response.status}: ${message}`);
  }

  return response.json();
}

async function queryDataSource(startCursor, withSort = true) {
  const body = {
    page_size: 100,
    start_cursor: startCursor
  };

  if (withSort) {
    body.sorts = [{ property: "Order", direction: "ascending" }];
  }

  return notionRequest(`/data_sources/${databaseId}/query`, body);
}

async function fetchRows() {
  const rows = [];
  let startCursor;

  do {
    let result;
    try {
      result = await queryDataSource(startCursor, true);
    } catch (error) {
      if (String(error?.message ?? error).includes("Order")) {
        result = await queryDataSource(startCursor, false);
      } else {
        throw error;
      }
    }

    rows.push(...result.results);
    startCursor = result.has_more ? result.next_cursor : undefined;
  } while (startCursor);

  return rows
    .filter((row) => isPublished(row.properties))
    .sort((a, b) => propertyNumber(a.properties, "Order") - propertyNumber(b.properties, "Order"));
}

function textOrTitle(properties) {
  return propertyText(properties, "Text") || propertyText(properties, "Title") || propertyText(properties, "Name");
}

function rowToNavItem(properties) {
  return {
    label: propertyText(properties, "Label") || propertyText(properties, "Title") || propertyText(properties, "Name"),
    href: propertyText(properties, "Href")
  };
}

function rowToPathCard(properties) {
  return {
    title: propertyText(properties, "Title") || propertyText(properties, "Name"),
    text: propertyText(properties, "Text"),
    cta: propertyText(properties, "CTA"),
    href: propertyText(properties, "Href")
  };
}

function rowToTalkRoute(properties) {
  return {
    label: propertyText(properties, "Label") || propertyText(properties, "Title") || propertyText(properties, "Name"),
    text: propertyText(properties, "Text"),
    cta: propertyText(properties, "CTA"),
    href: propertyText(properties, "Href"),
    className: propertyText(properties, "ClassName") || "dw-talk-route-direct"
  };
}

function rowToDesignerStat(properties) {
  return {
    value: propertyText(properties, "Value") || propertyText(properties, "Name"),
    caption: propertyText(properties, "Text")
  };
}

function rowToExperience(properties) {
  return {
    company: propertyText(properties, "Company") || propertyText(properties, "Name"),
    role: propertyText(properties, "Role"),
    years: propertyText(properties, "Years"),
    type: propertyText(properties, "Type") || propertyText(properties, "Label"),
    logoDomain: propertyText(properties, "LogoDomain") || "example.com",
    description: propertyText(properties, "Text")
  };
}

function rowToSchoolStat(properties) {
  return {
    value: propertyText(properties, "Value") || propertyText(properties, "Name"),
    label: propertyText(properties, "Label") || propertyText(properties, "Text")
  };
}

function rowToSchoolStandard(properties) {
  return {
    title: propertyText(properties, "Title") || propertyText(properties, "Name"),
    copy: propertyText(properties, "Text")
  };
}

function rowToPublicCategory(properties) {
  return {
    title: propertyText(properties, "Title") || propertyText(properties, "Name"),
    description: propertyText(properties, "Text"),
    count: propertyText(properties, "Count") || propertyText(properties, "Label")
  };
}

function rowToMediaProject(properties) {
  return {
    title: propertyText(properties, "Title") || propertyText(properties, "Name"),
    category: propertyText(properties, "Category") || propertyText(properties, "Text"),
    size: propertyText(properties, "Size") || "single",
    tone: propertyText(properties, "Tone") || "deep"
  };
}

function rowToDrunkTalkGalleryItem(properties) {
  return {
    title: propertyText(properties, "Title") || propertyText(properties, "Name"),
    note: propertyText(properties, "Note") || propertyText(properties, "Text"),
    size: propertyText(properties, "Size") || "single",
    tone: propertyText(properties, "Tone") || "blue"
  };
}

function buildContent(rows) {
  const content = structuredClone(defaultContent);
  const buckets = new Map();

  for (const row of rows) {
    const area = propertyText(row.properties, "Area");
    if (!area) continue;
    if (!buckets.has(area)) buckets.set(area, []);
    buckets.get(area).push(row.properties);
  }

  const logo = buckets.get("logo")?.map(textOrTitle).find(Boolean);
  if (logo) content.navigation.logo = logo;

  const navPrimary = buckets.get("nav_primary")?.map(rowToNavItem).filter((item) => item.label && item.href);
  if (navPrimary?.length) content.navigation.primary = navPrimary;

  const navSchool = buckets.get("nav_school")?.map(rowToNavItem).find((item) => item.label && item.href);
  if (navSchool) content.navigation.school = navSchool;

  const navTalk = buckets.get("nav_talk")?.map(rowToNavItem).find((item) => item.label && item.href);
  if (navTalk) content.navigation.talk = navTalk;

  const socials = buckets.get("social")?.map(rowToNavItem).filter((item) => item.label && item.href);
  if (socials?.length) content.navigation.socials = socials;

  const heroHeadline = buckets.get("home_hero_headline")?.map(textOrTitle).filter(Boolean);
  if (heroHeadline?.length) content.home.hero.headline = heroHeadline;

  const heroSnippets = buckets.get("home_hero_snippet")?.map(textOrTitle).filter(Boolean);
  if (heroSnippets?.length) content.home.hero.snippets = heroSnippets;

  const pathCards = buckets.get("home_path_card")?.map(rowToPathCard).filter((card) => card.title && card.href);
  if (pathCards?.length) content.home.pathCards = pathCards;

  const homeTalkRoutes = buckets.get("home_talk_route")?.map(textOrTitle).filter(Boolean);
  if (homeTalkRoutes?.length) content.home.talkRoutes = homeTalkRoutes;

  const homeTalkCta = buckets.get("home_talk_cta")?.map(textOrTitle).find(Boolean);
  if (homeTalkCta) content.home.talkCta = homeTalkCta;

  const sharedRoutes = buckets.get("shared_contact_route")?.map(textOrTitle).filter(Boolean);
  if (sharedRoutes?.length) content.sharedContactRoutes = sharedRoutes;

  const letsTalkHeadline = buckets.get("lets_talk_headline")?.map(textOrTitle).filter(Boolean);
  if (letsTalkHeadline?.length) content.letsTalk.headline = letsTalkHeadline;

  const letsTalkRoutes = buckets.get("lets_talk_route")?.map(rowToTalkRoute).filter((route) => route.label && route.text);
  if (letsTalkRoutes?.length) content.letsTalk.routes = letsTalkRoutes;

  const designerStats = buckets.get("designer_stat")?.map(rowToDesignerStat).filter((stat) => stat.value && stat.caption);
  if (designerStats?.length) content.designer.stats = designerStats;

  const designerNextKicker = buckets.get("designer_next_kicker")?.map(textOrTitle).find(Boolean);
  if (designerNextKicker) content.designer.next.kicker = designerNextKicker;

  const designerNextHeadline = buckets.get("designer_next_headline")?.map(textOrTitle).filter(Boolean);
  if (designerNextHeadline?.length) content.designer.next.headline = designerNextHeadline;

  const designerNextText = buckets.get("designer_next_text")?.map(textOrTitle).find(Boolean);
  if (designerNextText) content.designer.next.text = designerNextText;

  const experiences = buckets.get("designer_experience")?.map(rowToExperience).filter((experience) => experience.company);
  if (experiences?.length) content.designer.experiences = experiences;

  const schoolEyebrow = buckets.get("school_hero_eyebrow")?.map(textOrTitle).find(Boolean);
  if (schoolEyebrow) content.school.hero.eyebrow = schoolEyebrow;

  const schoolHeadline = buckets.get("school_hero_headline")?.map(textOrTitle).filter(Boolean);
  if (schoolHeadline?.length) content.school.hero.headline = schoolHeadline;

  const schoolLead = buckets.get("school_hero_lead")?.map(textOrTitle).find(Boolean);
  if (schoolLead) content.school.hero.lead = schoolLead;

  const schoolStats = buckets.get("school_stat")?.map(rowToSchoolStat).filter((stat) => stat.value && stat.label);
  if (schoolStats?.length) content.school.stats = schoolStats;

  const schoolActions = buckets.get("school_action")?.map(rowToNavItem).filter((item) => item.label && item.href);
  if (schoolActions?.length) content.school.actions = schoolActions;

  const schoolNote = buckets.get("school_note")?.map(textOrTitle).find(Boolean);
  if (schoolNote) content.school.note = schoolNote;

  const schoolStandards = buckets.get("school_standard")?.map(rowToSchoolStandard).filter((item) => item.title && item.copy);
  if (schoolStandards?.length) content.school.standards = schoolStandards;

  const schoolPracticeItems = buckets.get("school_practice_item")?.map(textOrTitle).filter(Boolean);
  if (schoolPracticeItems?.length) content.school.practice.items = schoolPracticeItems;

  const schoolPracticeCopy = buckets.get("school_practice_copy")?.map(textOrTitle).find(Boolean);
  if (schoolPracticeCopy) content.school.practice.copy = schoolPracticeCopy;

  const schoolFinalHeadline = buckets.get("school_final_headline")?.map(textOrTitle).filter(Boolean);
  if (schoolFinalHeadline?.length) content.school.final.headline = schoolFinalHeadline;

  const schoolFinalText = buckets.get("school_final_text")?.map(textOrTitle).find(Boolean);
  if (schoolFinalText) content.school.final.text = schoolFinalText;

  const schoolFinalCta = buckets.get("school_final_cta")?.map(rowToNavItem).find((item) => item.label && item.href);
  if (schoolFinalCta) {
    content.school.final.cta = schoolFinalCta.label;
    content.school.final.href = schoolFinalCta.href;
  }

  const publicIntroHeadline = buckets.get("public_intro_headline")?.map(textOrTitle).filter(Boolean);
  if (publicIntroHeadline?.length) content.public.intro.headline = publicIntroHeadline;

  const publicIntroText = buckets.get("public_intro_text")?.map(textOrTitle).find(Boolean);
  if (publicIntroText) content.public.intro.text = publicIntroText;

  const publicCategories = buckets.get("public_category")?.map(rowToPublicCategory).filter((item) => item.title && item.description);
  if (publicCategories?.length) content.public.categories = publicCategories;

  const drunkTalksHeadline = buckets.get("public_drunk_headline")?.map(textOrTitle).filter(Boolean);
  if (drunkTalksHeadline?.length) content.public.drunkTalks.headline = drunkTalksHeadline;

  const drunkTalksText = buckets.get("public_drunk_text")?.map(textOrTitle).find(Boolean);
  if (drunkTalksText) content.public.drunkTalks.text = drunkTalksText;

  const drunkTalksGallery = buckets.get("public_drunk_gallery")?.map(rowToDrunkTalkGalleryItem).filter((item) => item.title);
  if (drunkTalksGallery?.length) content.public.drunkTalks.gallery = drunkTalksGallery;

  const publicFormats = buckets.get("public_format")?.map(rowToSchoolStandard).filter((item) => item.title && item.copy);
  if (publicFormats?.length) {
    content.public.formats = publicFormats.map((item) => ({
      title: item.title,
      description: item.copy
    }));
  }

  const mediaProjects = buckets.get("public_media_project")?.map(rowToMediaProject).filter((item) => item.title);
  if (mediaProjects?.length) content.public.mediaProjects = mediaProjects;

  return content;
}

try {
  const rows = await fetchRows();
  const content = buildContent(rows);
  await writeFile(outputPath, `${JSON.stringify(content, null, 2)}\n`);
  console.log(`Synced ${rows.length} Notion rows into ${outputPath.pathname}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
