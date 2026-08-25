import generatedContent from "./notionContent.generated.json";

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = NavItem;

export type HomePathCard = {
  title: string;
  text: string;
  cta: string;
  href: string;
};

export type LetsTalkRoute = {
  label: string;
  text: string;
  cta: string;
  href: string;
  className: string;
};

export type DesignerStat = {
  value: string;
  caption: string;
};

export type ExperienceItem = {
  company: string;
  role: string;
  years: string;
  type: string;
  logoDomain: string;
  description: string;
};

export type SchoolStat = {
  value: string;
  label: string;
};

export type SchoolStandard = {
  title: string;
  copy: string;
};

export type PublicCategory = {
  title: string;
  description: string;
  count: string;
};

export type PublicFormat = {
  title: string;
  description: string;
};

export type MediaProject = {
  title: string;
  category: string;
  size: string;
  tone: string;
};

export type DrunkTalkGalleryItem = {
  title: string;
  note: string;
  size: string;
  tone: string;
};

export type WebsiteContent = {
  navigation: {
    logo: string;
    primary: NavItem[];
    school: NavItem;
    talk: NavItem;
    socials: SocialLink[];
  };
  home: {
    hero: {
      headline: string[];
      snippets: string[];
    };
    pathCards: HomePathCard[];
    talkRoutes: string[];
    talkCta: string;
  };
  sharedContactRoutes: string[];
  letsTalk: {
    headline: string[];
    routes: LetsTalkRoute[];
  };
  designer: {
    stats: DesignerStat[];
    next: {
      kicker: string;
      headline: string[];
      text: string;
    };
    experiences: ExperienceItem[];
  };
  school: {
    hero: {
      eyebrow: string;
      headline: string[];
      lead: string;
    };
    stats: SchoolStat[];
    actions: NavItem[];
    note: string;
    standards: SchoolStandard[];
    practice: {
      items: string[];
      copy: string;
    };
    final: {
      headline: string[];
      text: string;
      cta: string;
      href: string;
    };
  };
  public: {
    intro: {
      headline: string[];
      text: string;
    };
    categories: PublicCategory[];
    drunkTalks: {
      headline: string[];
      text: string;
      gallery: DrunkTalkGalleryItem[];
    };
    formats: PublicFormat[];
    mediaProjects: MediaProject[];
  };
};

export const websiteContent = generatedContent as WebsiteContent;
