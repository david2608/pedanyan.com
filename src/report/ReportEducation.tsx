import { useMemo, useState } from "react";
import data from "./armenia2026.json";
import { ChartCard, ConfPill, HeroStat, MethodDrawer, download, toCsv } from "./reportKit";
import { BarRows, UnitChart } from "./reportCharts";

const E = data.education;
const TEACH_COLOR = { ux: "var(--rp-igaming)", graphic: "var(--rp-product)", both: "var(--rp-bank)" };

type SortKey = "provider" | "type" | "teaches" | "price";

export function ReportEducation() {
  const [costMode, setCostMode] = useState<"Monthly" | "Total">("Monthly");
  const [sort, setSort] = useState<SortKey>("provider");
  const [teaches, setTeaches] = useState<"All" | "UX" | "Graphic" | "Motion">("All");

  const providers = useMemo(() => {
    const rows = E.providers.filter((row) => {
      if (teaches === "All") return true;
      const what = row.teaches.toLowerCase();
      if (teaches === "UX") return what.includes("ux") || what.includes("ui") || what.includes("product");
      if (teaches === "Graphic") return what.includes("graphic") || what.includes("communication") || what.includes("design,");
      return what.includes("motion") || what.includes("3d") || what.includes("animation");
    });
    return [...rows].sort((a, b) => String(a[sort] ?? "").localeCompare(String(b[sort] ?? "")));
  }, [sort, teaches]);

  const monthly = E.costs.data.filter((row) => row.monthlyLow != null);
  const totals = E.costs.data.filter((row) => row.totalLow != null || row.amdYear != null);

  return (
    <div className="rp-shell rp-chapter">
      <div className="rp-chapter-hero is-pair">
        {E.hero.map((stat) => (
          <HeroStat key={stat.value} value={stat.value} label="" conf={stat.conf} />
        ))}
      </div>

      <ChartCard
        id="education-providers"
        finding={E.providersChart.finding}
        unit={E.providersChart.unit}
        conf={E.providersChart.conf}
        source="Provider websites; Arminfo"
        method="One mark per provider, coloured by what it teaches. Counted from provider websites in September 2026; a seventh university is listed as unconfirmed and is not drawn."
        rows={E.providersChart.data}
        csvName="education-providers"
        foot={
          <span style={{ display: "block", marginTop: 6 }}>
            ~{E.providersChart.totals.ux} teach UX/UI · ~{E.providersChart.totals.graphic} teach graphic · {E.providersChart.totals.motion} teach motion.
          </span>
        }
      >
        <UnitChart groups={E.providersChart.data} colors={TEACH_COLOR} />
      </ChartCard>

      <ChartCard
        id="education-costs"
        finding={E.costs.finding}
        unit={costMode === "Monthly" ? "AMD per month" : "AMD, whole programme or one year"}
        conf={E.costs.conf}
        source="Provider websites, September 2026"
        method="Private courses are priced by the month and run 2–5 months; universities are priced by the year. The toggle keeps the comparison honest by never mixing the two on one axis."
        rows={E.costs.data}
        csvName="education-costs"
        foot={
          <span className="rp-toggle" style={{ marginLeft: 12 }}>
            {(["Monthly", "Total"] as const).map((option) => (
              <button key={option} type="button" className={costMode === option ? "is-on" : undefined} onClick={() => setCostMode(option)}>{option}</button>
            ))}
          </span>
        }
      >
        {costMode === "Monthly" ? (
          <BarRows
            data={monthly.map((row) => ({
              label: row.what,
              value: row.monthlyHigh as number,
              note: `from ${((row.monthlyLow as number) / 1000).toFixed(0)}k`
            }))}
            max={130000}
            color="var(--rp-accent)"
            format={(value) => `${Math.round(value / 1000)}k`}
          />
        ) : (
          <BarRows
            data={[
              { label: "Private course (2–5 months)", value: 500000, note: "from 110k · ~$280–1,300" },
              { label: "RAU × HSE, one year", value: 1800000 },
              { label: "University BA, one year", value: 800 * 368, note: "$250–800/yr" },
              { label: "TUMO", value: 0, note: "free, ages 12–18" }
            ]}
            max={1800000}
            color="var(--rp-accent)"
            format={(value) => (value === 0 ? "free" : `${Math.round(value / 1000)}k`)}
          />
        )}
      </ChartCard>

      <section className="rp-table-card">
        <div className="rp-section-head">
          <h3>Main providers</h3>
          <div className="rp-chips" style={{ marginBottom: 0 }}>
            {(["All", "UX", "Graphic", "Motion"] as const).map((chip) => (
              <button key={chip} type="button" className={`rp-chip${teaches === chip ? " is-on" : ""}`} onClick={() => setTeaches(chip)}>{chip}</button>
            ))}
          </div>
        </div>

        <p className="rp-disclosure">{E.disclosure} <ConfPill conf="MEASURED" /></p>

        <div className="rp-table-scroll">
          <table className="rp-table">
            <thead>
              <tr>
                {(["provider", "type", "teaches", "price"] as SortKey[]).map((key) => (
                  <th key={key} scope="col">
                    <button type="button" onClick={() => setSort(key)} className={sort === key ? "is-on" : undefined}>
                      {key[0].toUpperCase() + key.slice(1)}
                    </button>
                  </th>
                ))}
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((row) => (
                <tr key={row.provider} data-disclosure={"disclosure" in row ? "true" : undefined}>
                  <th scope="row">
                    {row.provider}
                    {"disclosure" in row ? <em> — Davit teaches here</em> : null}
                  </th>
                  <td>{row.type}</td>
                  <td>{row.teaches}</td>
                  <td>{row.price}</td>
                  <td>{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ChartCard
        id="education-supply-demand"
        finding={E.supplyDemand.finding}
        unit={E.supplyDemand.unit}
        conf={E.supplyDemand.conf}
        source="Provider websites; ACA; LinkedIn 28 Sep 2026"
        method="The two arrows are counts from different places — providers from their own websites, jobs from ACA and LinkedIn. The framing that they move against each other is ours."
      >
        <div className="rp-diverge">
          <div className="rp-diverge-side is-up">
            <span className="rp-diverge-arrow" aria-hidden="true">↑</span>
            <p>{E.supplyDemand.up}</p>
          </div>
          <div className="rp-diverge-side is-down">
            <span className="rp-diverge-arrow" aria-hidden="true">↓</span>
            <p>{E.supplyDemand.down}</p>
          </div>
        </div>
      </ChartCard>

      <section className="rp-strip">
        <h3>What it means for a design school</h3>
        <ul>
          {E.forSchools.map((line) => <li key={line}><a href="#shifts">{line}</a></li>)}
        </ul>
      </section>

      <section className="rp-strip" id="gaps">
        <h3>Gaps & next year</h3>
        <ul>
          {E.gaps.map((gap) => (
            <li key={gap.title}><a href="#method"><b>□</b>{gap.title}{gap.note ? ` — ${gap.note}` : ""}</a></li>
          ))}
        </ul>
      </section>

      <div className="rp-chapter-foot">
        <MethodDrawer title="How we counted this chapter">
          <ul>
            <li>Providers were counted from their own websites in September 2026. A seventh university is unconfirmed and is excluded from the 33.</li>
            <li>Prices are as published. Where a provider does not publish one, the cell is a dash rather than an estimate.</li>
            <li>{E.disclosure} Pedanyan Design is not among the 33 and does not appear in the table.</li>
          </ul>
        </MethodDrawer>
        <button type="button" className="rp-tool" onClick={() => download("education.csv", toCsv(E.providers))}>
          Download chapter data (CSV)
        </button>
      </div>
    </div>
  );
}
