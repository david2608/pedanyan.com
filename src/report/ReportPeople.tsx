import { useState } from "react";
import data from "./armenia2026.json";
import { CalloutQuote, ChartCard, HeroStat, MethodDrawer, download, toCsv } from "./reportKit";
import { Butterfly, Dumbbell, Ladder, Slope, Waffle } from "./reportCharts";

const P = data.people;
const THOUSANDS = (value: number) => value.toLocaleString("en-US");

/** In-tech is a count; everything outside it is a range. Drawing them as one
 *  stacked bar with a hatched, open-ended second segment says both things at
 *  once: this much is known, and then it keeps going, we don't know how far. */
function StackedRange() {
  const [known, range] = P.scope.data;
  const total = range.high + known.high;
  return (
    <div>
      <div className="rp-stackrange">
        <span className="rp-sr-known" style={{ width: `${(known.high / total) * 100}%` }} title={`${THOUSANDS(known.high)} in tech companies`} />
        <span className="rp-sr-low" style={{ width: `${(range.low / total) * 100}%` }} title={`At least ${THOUSANDS(range.low)} outside tech`} />
        <span className="rp-sr-high" style={{ width: `${((range.high - range.low) / total) * 100}%` }} title={`Up to ${THOUSANDS(range.high)} outside tech`} />
      </div>
      <ul className="rp-legend">
        <li><i style={{ background: "var(--rp-ink)" }} />{known.scope}<b>{THOUSANDS(known.high)}</b></li>
        <li><i className="rp-legend-hatch" />{range.scope}<b>{THOUSANDS(range.low)}–{THOUSANDS(range.high)}</b></li>
        <li><b>Total 7,500–9,500</b></li>
      </ul>
    </div>
  );
}

export function ReportPeople() {
  const [mode, setMode] = useState<"Headcount" | "Share">("Headcount");

  const specialtyRows = P.specialties.data.flatMap((row) => [
    { label: row.specialty, series: "2024", low: row.y2024[0], high: row.y2024[1], mid: (row.y2024[0] + row.y2024[1]) / 2, color: "var(--rp-muted)" },
    { label: "", series: "2025", low: row.y2025[0], high: row.y2025[1], mid: (row.y2025[0] + row.y2025[1]) / 2, color: "var(--rp-accent)" }
  ]);

  return (
    <div className="rp-shell rp-chapter">
      <div className="rp-chapter-hero">
        <HeroStat
          value={P.hero.value}
          label="Designers working in Armenian tech companies, end-2025"
          delta={P.hero.delta}
          conf={P.hero.conf}
          sub={P.hero.sub}
        />
      </div>

      <ChartCard
        id="people-headcount"
        finding={P.headcount.finding}
        unit={P.headcount.unit}
        conf="REPORTED"
        source={P.headcount.source}
        method="The 2025 figure is ACA's. The 2024 figure is not published: it is 5,600 plus the 800 ACA says were lost, which is why it is marked implied."
        rows={P.headcount.data}
        csvName="people-headcount"
      >
        <Slope
          a={{ label: "End-2024", value: P.headcount.data[0].value, note: "implied" }}
          b={{ label: "End-2025", value: P.headcount.data[1].value }}
        />
      </ChartCard>

      <CalloutQuote text={P.headcount.quote.text} by={P.headcount.quote.by} />

      <ChartCard
        id="people-scope"
        finding={P.scope.finding}
        unit={P.scope.unit}
        conf="ESTIMATE"
        method="The in-tech count is ACA's. The number outside tech is ours: agencies, in-house marketing teams and freelancers are not in any published count, so it is given as a range and drawn as one."
        rows={P.scope.data}
        csvName="people-scope"
      >
        <StackedRange />
      </ChartCard>

      <ChartCard
        id="people-specialties"
        finding={P.specialties.finding}
        unit={mode === "Headcount" ? P.specialties.unit : "Share of all designers"}
        conf={P.specialties.conf}
        method={P.specialties.method}
        rows={P.specialties.data}
        csvName="people-specialties"
        foot={
          <span className="rp-toggle" style={{ marginLeft: 12 }}>
            {(["Headcount", "Share"] as const).map((option) => (
              <button key={option} type="button" className={mode === option ? "is-on" : undefined} onClick={() => setMode(option)}>
                {option}
              </button>
            ))}
          </span>
        }
      >
        {mode === "Headcount" ? (
          <Dumbbell data={specialtyRows} format={THOUSANDS} estimate />
        ) : (
          <ul className="rp-shares">
            {P.specialties.data.map((row) => (
              <li key={row.specialty}><span>{row.specialty}</span><b>{row.share}</b></li>
            ))}
          </ul>
        )}
      </ChartCard>

      <ChartCard
        id="people-grades"
        finding={P.grades.finding}
        unit={P.grades.unit}
        conf={P.grades.conf}
        method="Shares are ours, from vacancy samples and the age profile ACA reports for tech as a whole. The whisker is the range; the step is its midpoint."
        rows={P.grades.data}
        csvName="people-grades"
      >
        <Ladder data={P.grades.data as never} estimate />
      </ChartCard>

      <ChartCard
        id="people-experience"
        finding={P.butterfly.finding}
        unit={P.butterfly.unit}
        conf="ESTIMATE"
        source={`Demand: ${P.butterfly.demandSource}`}
        method="The two wings are not the same kind of number. The left is our estimate of how experience is spread across designers; the right is what 26 job ads asked for on one day."
        rows={[...P.butterfly.supply.map((row) => ({ side: "supply", ...row })), ...P.butterfly.demand.map((row) => ({ side: "demand", ...row }))]}
        csvName="people-experience"
      >
        <Butterfly
          left={P.butterfly.supply}
          right={P.butterfly.demand}
          leftLabel="Designers (estimate)"
          rightLabel="What 26 job ads asked for"
          leftEstimate
        />
      </ChartCard>

      <ChartCard
        id="people-gender"
        finding={P.gender.finding}
        unit={P.gender.unit}
        conf={P.gender.conf}
        source="ACA Tech Market Insights 2026 via Sputnik Armenia"
        method="Three separate published figures for three populations, each read as the share of women. They are not from one survey of one group."
        rows={P.gender.data}
        csvName="people-gender"
      >
        <div className="rp-waffle-pair">
          {P.gender.data.map((row) => (
            <div key={row.group}>
              <h4>{row.group} — {row.value}% women</h4>
              <Waffle parts={[
                { label: `${row.group}: women`, value: row.value, color: "var(--rp-accent)" },
                { label: `${row.group}: men`, value: 100 - row.value, color: "color-mix(in srgb, var(--rp-ink) 14%, transparent)" }
              ]} />
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="rp-chapter-foot">
        <MethodDrawer title="How we counted this chapter">
          <ul>
            <li>The headcount is ACA's, reported by Sputnik Armenia on 22 Feb 2026. We did not count designers ourselves.</li>
            <li>Specialty mix, seniority mix and the experience spread are our estimates; each chart says so and its tooltip says what it was built from.</li>
            <li>Vacancy requirements were read from hh.ru on 28 Sep 2026, n=26 of the 30 open designer roles — four did not state experience.</li>
          </ul>
        </MethodDrawer>
        <button
          type="button"
          className="rp-tool"
          onClick={() => download("people.csv", toCsv([
            ...P.headcount.data.map((row) => ({ chart: "headcount", ...row })),
            ...P.scope.data.map((row) => ({ chart: "scope", ...row })),
            ...P.specialties.data.map((row) => ({ chart: "specialties", ...row })),
            ...P.grades.data.map((row) => ({ chart: "grades", ...row })),
            ...P.gender.data.map((row) => ({ chart: "gender", ...row }))
          ]))}
        >
          Download chapter data (CSV)
        </button>
      </div>
    </div>
  );
}
