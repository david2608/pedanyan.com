import { readFile } from "node:fs/promises";

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
const dataSourceId = process.env.NOTION_DATA_SOURCE_ID || process.env.NOTION_DATABASE_ID;

if (!token || !dataSourceId) {
  console.error("Missing NOTION_TOKEN and NOTION_DATA_SOURCE_ID or NOTION_DATABASE_ID.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
  "Notion-Version": NOTION_VERSION
};

async function notionRequest(path, options = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    headers,
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Notion API error ${response.status}: ${message}`);
  }

  return response.json();
}

function plainText(property) {
  if (!property) return "";
  if (property.type === "title") return property.title.map((item) => item.plain_text ?? "").join("").trim();
  if (property.type === "rich_text") {
    return property.rich_text.map((item) => item.plain_text ?? "").join("").trim();
  }
  if (property.type === "select") return property.select?.name ?? "";
  return "";
}

async function fetchRows() {
  const rows = [];
  let cursor;

  do {
    const result = await notionRequest(`/data_sources/${dataSourceId}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {})
      })
    });

    rows.push(...result.results);
    cursor = result.has_more ? result.next_cursor : undefined;
  } while (cursor);

  return rows;
}

function classify(area) {
  const exact = {
    logo: ["Global", "Brand", "Single value"],
    nav_primary: ["Global", "Navigation", "Link"],
    nav_school: ["Global", "Navigation", "Link"],
    nav_talk: ["Global", "Navigation", "Link"],
    social: ["Global", "Social links", "Link"],
    shared_contact_route: ["Global", "Shared contact CTA", "Route"],
    lets_talk_headline: ["Let's talk", "Hero", "Headline line"],
    lets_talk_route: ["Let's talk", "Routing blocks", "Contact route"],
    home_hero_headline: ["Home", "Hero", "Headline line"],
    home_hero_snippet: ["Home", "Hero", "Scattered text"],
    home_path_card: ["Home", "Routing cards", "Card"],
    home_talk_route: ["Home", "Final routing", "Route"],
    home_talk_cta: ["Home", "Final routing", "CTA"],
    designer_stat: ["Pedanyan", "Intro animation", "Stat"],
    designer_next_kicker: ["Pedanyan", "Intro animation", "Transition copy"],
    designer_next_headline: ["Pedanyan", "Intro animation", "Headline line"],
    designer_next_text: ["Pedanyan", "Intro animation", "Transition copy"],
    designer_experience: ["Pedanyan", "Experience list", "Experience"],
    school_hero_eyebrow: ["School", "Hero", "Eyebrow"],
    school_hero_headline: ["School", "Hero", "Headline line"],
    school_hero_lead: ["School", "Hero", "Lead copy"],
    school_stat: ["School", "Program stats", "Stat"],
    school_action: ["School", "Hero actions", "Link"],
    school_note: ["School", "Program note", "Note"],
    school_standard: ["School", "Standards", "Card"],
    school_practice_item: ["School", "Practice", "List item"],
    school_practice_copy: ["School", "Practice", "Body copy"],
    school_final_headline: ["School", "Final CTA", "Headline line"],
    school_final_text: ["School", "Final CTA", "Body copy"],
    school_final_cta: ["School", "Final CTA", "CTA"],
    public_intro_headline: ["Public", "Intro", "Headline line"],
    public_intro_text: ["Public", "Intro", "Body copy"],
    public_category: ["Public", "Categories", "Card"],
    public_drunk_headline: ["Public", "Drunk Talks", "Headline line"],
    public_drunk_text: ["Public", "Drunk Talks", "Body copy"],
    public_drunk_gallery: ["Public", "Drunk Talks gallery", "Gallery item"],
    public_format: ["Public", "Formats", "Card"],
    public_media_project: ["Public", "Media archive", "Media card"]
  };

  return exact[area] ?? ["Other", "Unsorted", "Content"];
}

await notionRequest(`/data_sources/${dataSourceId}`, {
  method: "PATCH",
  body: JSON.stringify({
    properties: {
      Page: { select: { options: [] } },
      Section: { select: { options: [] } },
      ItemType: { select: { options: [] } }
    }
  })
});

const rows = await fetchRows();
let updated = 0;

for (const row of rows) {
  const area = plainText(row.properties.Area);
  if (!area) continue;
  const [page, section, itemType] = classify(area);

  await notionRequest(`/pages/${row.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        Page: { select: { name: page } },
        Section: { select: { name: section } },
        ItemType: { select: { name: itemType } }
      }
    })
  });
  updated += 1;
}

console.log(`Organized ${updated} Notion CMS rows by Page, Section, and ItemType.`);
