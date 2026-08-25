export const siteData = {
  brand: {
    name: "Davit Pedanyan",
    coreStatement: "I build products, designers, and creative culture.",
    shortIdentity: "Designer, educator, and creative culture builder from Armenia.",
    longDescription:
      "I design products, teach beginners, and run public formats for Armenia's creative community."
  },
  nav: [
    { label: "Pedanyan", href: "/am/designer" },
    { label: "Public", href: "/am/public-work" }
  ],
  ecosystem: [
    {
      number: "01",
      title: "Design Talent",
      description:
        "I match companies with product designers and stay involved when the work needs senior direction.",
      tag: "client path"
    },
    {
      number: "02",
      title: "Pedanyan School",
      description:
        "I teach beginners through projects, critique, AI-supported workflows, and one finished portfolio case.",
      tag: "student path"
    },
    {
      number: "03",
      title: "Public Work",
      description:
        "I speak, write, teach, and run artmart events for Armenia's design and creative community.",
      tag: "authority path"
    }
  ],
  services: [
    {
      title: "Mid-senior designers",
      copy:
        "I select experienced designers whose product background fits the work.",
      detail:
        "Best for SaaS, mobile apps, dashboards, fintech, enterprise tools, MVPs, redesigns, design systems, and long-term product teams.",
      acid: true,
      speed: "0.12"
    },
    {
      title: "Junior design lab",
      copy:
        "I select junior designers and supervise their work throughout the engagement.",
      detail:
        "Best for landing pages, UI cleanup, simple product flows, research support, internal tools, MVP support, and design production.",
      acid: false,
      speed: "-0.08"
    },
    {
      title: "Hire Pedanyan",
      copy:
        "Work with me on product strategy, UX audits, workshops, and design leadership decisions.",
      detail:
        "Best for founders, early-stage startups, redesigns, design system strategy, workshops, and leadership advisory.",
      acid: true,
      speed: "0.1"
    }
  ],
  schoolStats: [
    ["4 months", "beginner program"],
    ["up to 12", "students per group"],
    ["offline first", "classes in our school space"],
    ["1 case", "finished portfolio case"],
    ["AI workflow", "AI inside the design process"],
    ["guest mentors", "sessions with invited designers"]
  ],
  proofPoints: [
    "20+ years designing products",
    "9+ years teaching design",
    "Head and director-level design experience",
    "Design programs built for Armenian schools",
    "Design education standards shaped in Armenia",
    "Products designed for international companies",
    "85 designers placed with product teams",
    "Founder of Pedanyan School and artmart"
  ],
  publicWork: [
    ["talk", "AI and the future of design education"],
    ["podcast", "Design, art, and creative life in Armenia"],
    ["article", "Portfolio is proof of thinking"],
    ["interview", "Building design standards in Armenia"]
  ],
  thoughts: [
    {
      title: "AI raises the standard for design education.",
      description: "Why taste, judgment, and critique matter more in the classroom."
    },
    {
      title: "A portfolio should show how you think.",
      description: "What I ask students to explain behind each case."
    },
    {
      title: "The designer should fit the product.",
      description: "How I match product needs with a designer's experience."
    }
  ],
  contactRoutes: [
    "hire designers",
    "work directly with Davit",
    "join Pedanyan School",
    "invite Davit to speak",
    "artmart collaboration"
  ],
  letsTalk: [
    {
      label: "New projects",
      entries: [
        {
          title: "Design talent",
          role: "Outstaffing, teams, product support",
          lines: ["talent@pedanyan.com", "mid-senior designers", "supervised junior lab"]
        },
        {
          title: "Work with Davit",
          role: "Strategy, audit, advisory",
          lines: ["davit@pedanyan.com", "product direction", "design leadership"]
        }
      ]
    },
    {
      label: "General inquiries",
      entries: [
        {
          title: "Info",
          role: "",
          lines: ["hello@pedanyan.com"]
        },
        {
          title: "Speaking & media",
          role: "Talks, interviews, podcasts",
          lines: ["media@pedanyan.com"]
        }
      ]
    },
    {
      label: "School",
      entries: [
        {
          title: "Pedanyan School",
          role: "Admissions and open lessons",
          lines: ["school@pedanyan.com", "beginner program", "portfolio preparation"]
        },
        {
          title: "Mentors",
          role: "Guest lectures and critiques",
          lines: ["mentors@pedanyan.com"]
        }
      ]
    },
    {
      label: "Culture",
      entries: [
        {
          title: "artmart",
          role: "Creative culture and collaborations",
          lines: ["artmart@pedanyan.com", "events", "education projects"]
        },
        {
          title: "Armenia / international",
          role: "Partnerships and representation",
          lines: ["partners@pedanyan.com"]
        }
      ]
    }
  ]
} as const;
