# Notion CMS Setup

Use a Notion database as the editable content source. The website does not call Notion in the browser. Instead, this command pulls Notion content into `src/davit-wireframe/notionContent.generated.json`:

Create `.env.local` in the project root:

```bash
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=database_id
# Optional if Notion says your database has multiple data sources:
NOTION_DATA_SOURCE_ID=data_source_id
```

`.env.local` is ignored by git.

Then run:

```bash
npm run sync:notion
```

Then rebuild Storybook:

```bash
npm run build-storybook
python3 -m http.server 6009 --directory storybook-static
```

## Database Properties

Create these properties in Notion:

- `Title` — title
- `Area` — select
- `Order` — number
- `Label` — text
- `Text` — text
- `CTA` — text
- `Href` — url or text
- `ClassName` — text
- `Published` — checkbox
- `Value` — text
- `Company` — text
- `Role` — text
- `Years` — text
- `Type` — text
- `LogoDomain` — text
- `Size` — text
- `Tone` — text
- `Count` — text
- `Note` — text
- `Category` — text
- `Page` — select
- `Section` — select
- `ItemType` — select

Rows with `Published` unchecked are ignored. If the `Published` property does not exist, all rows are treated as published.

Use `Page`, `Section`, and `ItemType` only for editorial organization. The website sync reads from
`Area`, `Order`, and the content fields.

To refresh organization after adding many new rows:

```bash
npm run organize:notion
```

Recommended Notion views:

- `All by page` — group by `Page`, then sort by `Order`.
- `Home` — filter `Page` is `Home`, sort by `Order`.
- `Pedanyan` — filter `Page` is `Pedanyan`, sort by `Order`.
- `School` — filter `Page` is `School`, sort by `Order`.
- `Public` — filter `Page` is `Public`, sort by `Order`.
- `Let's talk` — filter `Page` is `Let's talk`, sort by `Order`.

## Supported Area Values

- `logo`
- `nav_primary`
- `nav_school`
- `nav_talk`
- `social`
- `home_hero_headline`
- `home_hero_snippet`
- `home_path_card`
- `home_talk_route`
- `home_talk_cta`
- `shared_contact_route`
- `lets_talk_headline`
- `lets_talk_route`
- `designer_stat`
- `designer_next_kicker`
- `designer_next_headline`
- `designer_next_text`
- `designer_experience`
- `school_hero_eyebrow`
- `school_hero_headline`
- `school_hero_lead`
- `school_stat`
- `school_action`
- `school_note`
- `school_standard`
- `school_practice_item`
- `school_practice_copy`
- `school_final_headline`
- `school_final_text`
- `school_final_cta`
- `public_intro_headline`
- `public_intro_text`
- `public_category`
- `public_drunk_headline`
- `public_drunk_text`
- `public_drunk_gallery`
- `public_format`
- `public_media_project`

## Examples

Navigation row:

| Title | Area | Order | Href |
| --- | --- | ---: | --- |
| Pedanyan | nav_primary | 10 | /am/designer |

Home path card row:

| Title | Area | Text | CTA | Href | Order |
| --- | --- | --- | --- | --- | ---: |
| Need design help? | home_path_card | I can help you find the right designer... | See what I can do for you | /am/designer | 10 |

Let’s Talk route row:

| Title | Area | Label | Text | CTA | Href | ClassName | Order |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| Companies | lets_talk_route | For companies | Need design talent... | Hire or find design talent | /am/lets-talk | dw-talk-route-companies | 10 |
