import { useMemo, useState } from "react";
import data from "./armenia2026.json";
import { ChartCard, HeroStat, MethodDrawer, download, toCsv } from "./reportKit";
import { BarRows, Meter, ShareBar, Waffle } from "./reportCharts";

const E = data.employers;
const SECTOR_COLOR: Record<string, string> = {
  iGaming: "var(--rp-igaming)",
  "Product/SaaS": "var(--rp-product)",
  "Bank/Telecom": "var(--rp-bank)",
  "Game studio": "var(--rp-game)",
  Agency: "var(--rp-agency)"
};
const FILTERS = ["All", "iGaming", "Bank/Telecom", "Product/SaaS", "Game studio"] as const;

export function ReportEmployers() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [all, setAll] = useState(false);

  const companies = useMemo(() => {
    const rows = E.companies.data.filter((row) => filter === "All" || row.sector === filter);
    return all || filter !== "All" ? rows : rows.slice(0, 15);
  }, [filter, all]);

  const patterns = data.overview.patterns.filter((pattern) => E.patternRefs.includes(pattern.id));

  return (
    <div className="rp-shell rp-chapter">
      <div className="rp-chapter-hero">
        <HeroStat value={E.hero.value} label={E.hero.label} conf={E.hero.conf} sub={E.hero.source} />
      </div>

      <ChartCard
        id="employers-companies"
        finding={E.companies.finding}
        unit={E.companies.unit}
        conf={E.companies.conf}
        source={E.companies.source}
        method={E.companies.caveat}
        rows={E.companies.data}
        csvName="employers-companies"
        foot={<span style={{ display: "block", marginTop: 6 }}>{E.companies.caveat}</span>}
      >
        <div className="rp-chips" style={{ marginBottom: 20 }}>
          {FILTERS.map((chip) => (
            <button
              key={chip}
              type="button"
              className={`rp-chip${filter === chip ? " is-on" : ""}`}
              onClick={() => { setFilter(chip); setAll(false); }}
            >
              {chip}
            </button>
          ))}
        </div>

        <BarRows
          data={companies.map((row) => ({
            label: row.company,
            value: row.people,
            color: SECTOR_COLOR[row.sector],
            note: row.sector
          }))}
          max={E.companies.data[0].people}
        />

        {filter === "All" && !all ? (
          <button type="button" className="rp-tool" style={{ marginTop: 18 }} onClick={() => setAll(true)}>
            Show all {E.companies.data.length}
          </button>
        ) : null}

        <ul className="rp-legend" style={{ marginTop: 18 }}>
          {Object.keys(SECTOR_COLOR).map((sector) => (
            <li key={sector}><i style={{ background: SECTOR_COLOR[sector] }} />{sector}</li>
          ))}
        </ul>
      </ChartCard>

      <ChartCard
        id="employers-sectors"
        finding={E.sectors.finding}
        unit={E.sectors.unit}
        conf={E.sectors.conf}
        source="LinkedIn company People pages, 28 Sep 2026"
        method="Shares are of the 790 people we could attribute to one of the 32 named employers — not of all designers in Armenia."
        rows={E.sectors.data}
        csvName="employers-sectors"
      >
        <ShareBar
          data={E.sectors.data.map((row) => ({
            label: row.sector,
            value: row.people,
            color: SECTOR_COLOR[row.sector],
            note: `${row.companies} companies · ${row.people} people`
          }))}
        />
      </ChartCard>

      <ChartCard
        id="employers-outside"
        finding={E.outside.finding}
        unit={E.outside.unit}
        conf={E.outside.conf}
        source="LinkedIn company People pages (28 Sep 2026) against the ACA total"
        method={E.outside.note}
        rows={E.outside.data}
        csvName="employers-outside"
      >
        <Waffle
          parts={[
            { label: `${E.outside.data[0].group} — 790 people`, value: E.outside.data[0].value, color: "var(--rp-ink)" },
            { label: `${E.outside.data[1].group} — 4,810 people`, value: E.outside.data[1].value, color: "color-mix(in srgb, var(--rp-accent) 45%, transparent)", estimate: true }
          ]}
        />
      </ChartCard>

      <ChartCard
        id="employers-open-roles"
        finding={E.openRoles.finding}
        unit={E.openRoles.unit}
        conf={E.openRoles.conf}
        source="LinkedIn and hh.ru Armenia, both read 28 Sep 2026; ITA Jobs"
        method="Two boards on one day. LinkedIn's broad match counts any posting mentioning “designer”; the exact-title counts are the ones a designer can actually apply to by title."
        rows={[
          { source: "LinkedIn", measure: "broad match “designer”", value: E.openRoles.linkedin.broad },
          ...E.openRoles.linkedin.exact.map((row) => ({ source: "LinkedIn", measure: row.title, value: row.value })),
          { source: "hh.ru", measure: "designer vacancies", value: E.openRoles.hh.total },
          { source: "hh.ru", measure: "game design", value: E.openRoles.hh.game },
          { source: "hh.ru", measure: "remote", value: E.openRoles.hh.remote },
          { source: "hh.ru", measure: "showing a salary", value: E.openRoles.hh.withSalary }
        ]}
        csvName="employers-open-roles"
        foot={<span style={{ display: "block", marginTop: 6 }}>{E.openRoles.ita} (ITA Jobs).</span>}
      >
        <div className="rp-meters">
          <Meter value={E.openRoles.hh.game} of={E.openRoles.hh.total} label="hh.ru vacancies that are game design" color="var(--rp-game)" />
          <Meter value={E.openRoles.hh.remote} of={E.openRoles.hh.total} label="remote rather than office" color="var(--rp-bank)" />
          <Meter value={E.openRoles.hh.withSalary} of={E.openRoles.hh.total} label="showing a salary" color="var(--rp-loss)" />
        </div>

        <div style={{ marginTop: 30 }}>
          <p className="rp-card-unit" style={{ marginBottom: 12 }}>
            LinkedIn Armenia, exact job titles — against {E.openRoles.linkedin.broad} postings that merely mention “designer”
          </p>
          <BarRows
            data={E.openRoles.linkedin.exact.map((row) => ({ label: row.title, value: row.value }))}
            max={E.openRoles.linkedin.exact[0].value}
            color="var(--rp-accent)"
          />
        </div>
      </ChartCard>

      <section className="rp-strip">
        <h3>Patterns behind this chapter</h3>
        <ul>
          {patterns.map((pattern) => (
            <li key={pattern.id}>
              <a href="#patterns"><b>{String(pattern.id).padStart(2, "0")}</b>{pattern.claim}</a>
            </li>
          ))}
        </ul>
      </section>

      <div className="rp-chapter-foot">
        <MethodDrawer title="How we counted this chapter">
          <ul>
            <li>{E.companies.caveat}</li>
            <li>The 32 companies are the largest design employers we could identify, not a random sample. Shares are of that group, and say so.</li>
            <li>Open roles are a single snapshot: LinkedIn and hh.ru on 28 Sep 2026. Other boards (staff.am, myjob.am, careercenter.am) were not counted.</li>
          </ul>
        </MethodDrawer>
        <button
          type="button"
          className="rp-tool"
          onClick={() => download("employers.csv", toCsv(E.companies.data))}
        >
          Download chapter data (CSV)
        </button>
      </div>
    </div>
  );
}
