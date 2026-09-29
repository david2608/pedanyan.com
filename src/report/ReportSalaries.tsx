import { useMemo, useState } from "react";
import data from "./armenia2026.json";
import { ChartCard, ConfPill, HeroStat, MethodDrawer, download, toCsv } from "./reportKit";
import { Dumbbell, LogLine, MiniLine } from "./reportCharts";

const S = data.salaries;
const RATE = data.meta.usdAmd;

/** Gross → net is a bracket, not a multiplier, so the two published rates are
 *  applied to the band they belong to and nothing in between is invented. */
function net(amd: number) {
  if (amd <= 500000) return amd * S.netRates.upTo500k;
  if (amd >= 1000000) return amd * S.netRates.above1M;
  return amd * ((S.netRates.upTo500k + S.netRates.above1M) / 2);
}

export function ReportSalaries() {
  const [currency, setCurrency] = useState<"AMD" | "USD">("AMD");
  const [basis, setBasis] = useState<"Gross" | "Net">("Gross");
  const [role, setRole] = useState("Product / UX-UI");
  const [grade, setGrade] = useState("Senior");
  const [entered, setEntered] = useState("");

  /* One conversion, used by every chart in the chapter: thousand-AMD in,
     whatever the two toggles ask for out. */
  const convert = useMemo(() => (thousandAmd: number) => {
    const amd = thousandAmd * 1000;
    const applied = basis === "Net" ? net(amd) : amd;
    return currency === "USD" ? applied / RATE : applied;
  }, [basis, currency]);

  const money = useMemo(() => (thousandAmd: number) => {
    const value = convert(thousandAmd);
    if (currency === "USD") return `$${Math.round(value).toLocaleString("en-US")}`;
    return value >= 1000000
      ? `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`
      : `${Math.round(value / 1000)}k`;
  }, [convert, currency]);

  const gradeRows = S.byGrade.data.map((row) => ({
    label: row.role === "Product / UX-UI" ? row.grade : "",
    series: row.role,
    low: row.low,
    mid: row.mid,
    high: row.high,
    color: row.role === "Product / UX-UI" ? "var(--rp-accent)" : "var(--rp-agency)"
  }));

  const band = S.byGrade.data.find((row) => row.grade === grade && row.role === role);
  const typed = Number(entered.replace(/[^\d.]/g, ""));
  const standing = (() => {
    if (!band || !typed) return null;
    const asThousandAmd = currency === "USD" ? (typed * RATE) / 1000 : typed / 1000;
    const span = band.high - band.low;
    const place = (asThousandAmd - band.low) / span;
    if (place < 1 / 3) return "the lower third";
    if (place < 2 / 3) return "the middle third";
    return "the upper third";
  })();

  return (
    <div className="rp-shell rp-chapter">
      <div className="rp-chapter-hero">
        <HeroStat
          value={S.hero.value}
          label={`${S.hero.label} (${S.hero.usd})`}
          conf={S.hero.conf}
          sub={S.hero.small}
        />
      </div>

      <div className="rp-chapter-toggles">
        <span className="rp-toggle">
          {(["AMD", "USD"] as const).map((option) => (
            <button key={option} type="button" className={currency === option ? "is-on" : undefined} onClick={() => setCurrency(option)}>{option}</button>
          ))}
        </span>
        <span className="rp-toggle">
          {(["Gross", "Net"] as const).map((option) => (
            <button key={option} type="button" className={basis === option ? "is-on" : undefined} onClick={() => setBasis(option)}>{option}</button>
          ))}
        </span>
        <span className="rp-card-unit">
          {currency === "USD" ? `USD at ${RATE} AMD. ` : ""}{basis === "Net" ? S.netNote : "Gross, before tax."}
        </span>
      </div>

      <ChartCard
        id="salaries-by-grade"
        finding={S.byGrade.finding}
        unit={`${currency === "AMD" ? "Monthly, AMD" : `Monthly, USD at ${RATE}`} · ${basis.toLowerCase()} · 2026`}
        conf={S.byGrade.conf}
        source={S.byGrade.source}
        method="Every figure here is ours, compiled from three public salary sites. No Armenian survey publishes designer pay by grade, so there is no n to quote: treat the bands as the shape of the market, not as a benchmark."
        rows={S.byGrade.data}
        csvName="salaries-by-grade"
      >
        <Dumbbell data={gradeRows} min={0} max={2500} format={money} estimate />
        <ul className="rp-legend" style={{ marginTop: 16 }}>
          <li><i style={{ background: "var(--rp-accent)" }} />Product / UX-UI</li>
          <li><i style={{ background: "var(--rp-agency)" }} />Graphic</li>
        </ul>
      </ChartCard>

      <section className="rp-checker">
        <h3>Where do you stand?</h3>
        <div className="rp-checker-row">
          <label>
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option>Product / UX-UI</option>
              <option>Graphic</option>
            </select>
          </label>
          <label>
            <span>Grade</span>
            <select value={grade} onChange={(event) => setGrade(event.target.value)}>
              {["Junior", "Mid", "Senior", "Lead / Head"].map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label>
            <span>Your monthly {basis.toLowerCase()} in {currency}</span>
            <input inputMode="numeric" value={entered} onChange={(event) => setEntered(event.target.value)} placeholder={currency === "AMD" ? "e.g. 900000" : "e.g. 2400"} />
          </label>
        </div>
        {band ? (
          <div className="rp-checker-out">
            <div className="rp-db-track" style={{ height: 26 }}>
              <span className="rp-db-range" data-estimate="true" style={{ left: 0, width: "100%", background: "var(--rp-accent)" }} />
              {typed ? (
                <span
                  className="rp-checker-marker"
                  style={{
                    left: `${Math.max(0, Math.min(100, (((currency === "USD" ? (typed * RATE) / 1000 : typed / 1000) - band.low) / (band.high - band.low)) * 100))}%`
                  }}
                />
              ) : null}
            </div>
            <p>
              {standing
                ? <>You are in <b>{standing}</b> of our estimated band for a {grade.toLowerCase()} {role.toLowerCase()} designer, {money(band.low)}–{money(band.high)}.</>
                : <>A {grade.toLowerCase()} {role.toLowerCase()} designer sits between {money(band.low)} and {money(band.high)}, typically {money(band.mid)}.</>}
            </p>
            <p className="rp-card-unit">
              Our estimate, not a benchmark — it is compiled from public salary sites, not from a survey of Armenian designers.
              Nothing you type is stored or sent anywhere. <ConfPill conf="ESTIMATE" />
            </p>
          </div>
        ) : null}
      </section>

      <ChartCard
        id="salaries-other-roles"
        finding={S.otherRoles.finding}
        unit="Monthly gross, AMD, 2026"
        conf={S.otherRoles.conf}
        source="Glassdoor Yerevan and Armtal Salary Guide 2026"
        method="These are as published: a low, a high and, where the source gives one, a median. Where a source publishes no median the dot is absent rather than guessed."
        rows={S.otherRoles.data}
        csvName="salaries-other-roles"
        foot={<span style={{ display: "block", marginTop: 6 }}>{S.otherRoles.freelance}</span>}
      >
        <Dumbbell
          data={S.otherRoles.data.map((row) => ({
            label: row.role,
            series: row.source,
            low: row.low,
            mid: row.mid,
            high: row.high,
            color: "var(--rp-ink)"
          }))}
          min={0}
          max={1000000}
          format={(value) => `${Math.round(value / 1000)}k`}
        />
      </ChartCard>

      <ChartCard
        id="salaries-extremes"
        finding={S.extremes.finding}
        unit={S.extremes.unit}
        conf={S.extremes.conf}
        source="Paylab, Glassdoor 2026, salaries.am"
        method="A log scale, because the top of this line is forty-six times the bottom. Two pins share 2.0M AMD and are stacked rather than drawn on top of each other. The 3.5M reading is from 2021 and is marked historic."
        rows={S.extremes.pins}
        csvName="salaries-extremes"
      >
        <LogLine
          min={S.extremes.min}
          max={S.extremes.max}
          pins={S.extremes.pins}
          format={(value) => (value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${Math.round(value / 1000)}k`)}
        />
      </ChartCard>

      <ChartCard
        id="salaries-tiers"
        finding={S.tiers.finding}
        unit="Monthly gross, AMD"
        conf={S.tiers.conf}
        source="Glassdoor Yerevan"
        method="Two employer types with published bands, and a third — foreign remote — for which we have a multiple rather than a band, so it is stated in words under the chart instead of drawn."
        rows={S.tiers.data}
        csvName="salaries-tiers"
        foot={<span style={{ display: "block", marginTop: 6 }}>{S.tiers.note}</span>}
      >
        <Dumbbell
          data={S.tiers.data.map((row) => ({ label: row.tier, low: row.low, high: row.high, mid: null, color: "var(--rp-accent)" }))}
          min={0}
          max={1000000}
          format={(value) => `${Math.round(value / 1000)}k`}
          estimate
        />
      </ChartCard>

      <ChartCard
        id="salaries-fx"
        finding={S.fx.finding}
        unit={S.fx.unit}
        conf={S.fx.conf}
        source="ArmBanks, exchange-rates.org; Armstat via ixbt.am / ARKA"
        method="Two measures of different scale, so two charts rather than two axes on one. The rate is a line over five readings; the salaries are two before-and-after pairs."
        rows={[...S.fx.rates.map((row) => ({ measure: "USD/AMD", ...row })),
               ...S.fx.salaries.map((row) => ({ measure: row.what, from: `${row.a.when} ${row.a.value}`, to: `${row.b.when} ${row.b.value}`, change: row.change }))]}
        csvName="salaries-fx"
      >
        <div className="rp-fx">
          <div>
            <p className="rp-card-unit" style={{ marginBottom: 10 }}>USD/AMD — one dollar buys fewer drams</p>
            <MiniLine points={S.fx.rates} format={(value) => value.toFixed(1)} />
          </div>
          <div>
            <p className="rp-card-unit" style={{ marginBottom: 10 }}>Average monthly salary, AMD</p>
            <ul className="rp-prepost">
              {S.fx.salaries.map((row) => (
                <li key={row.what}>
                  <span className="rp-prepost-name">{row.what}</span>
                  <span><b>{Math.round(row.a.value / 1000)}k</b><i>{row.a.when}</i></span>
                  <em aria-hidden="true">→</em>
                  <span><b>{Math.round(row.b.value / 1000)}k</b><i>{row.b.when}</i></span>
                  <span className="rp-delta" data-tone={row.change === "flat" ? "negative" : "positive"}>{row.change}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="rp-fx-callout">{S.fx.callout}</p>
      </ChartCard>

      <section className="rp-strip">
        <h3>Tax, roughly</h3>
        <ul>
          {S.tax.map((line) => <li key={line}><a href="#method">{line}</a></li>)}
        </ul>
        <p className="rp-card-unit" style={{ marginTop: 12 }}>{S.taxNote}</p>
      </section>

      <div className="rp-chapter-foot">
        <MethodDrawer title="How we counted this chapter">
          <ul>
            <li>No Armenian survey publishes designer pay by grade, and zero of the 30 open vacancies we read showed a salary. Every band in this chapter is ours.</li>
            <li>Sources: Glassdoor Yerevan, Paylab.am, Armtal Salary Guide 2026. Where a source gives a median we show it as the dot; where it does not, there is no dot.</li>
            <li>USD uses {RATE} AMD, the 2026 average. Net applies 0.745 up to 500k and 0.72 above 1M, the two published rates; between them we show the average of the two and say so here rather than inventing a bracket.</li>
          </ul>
        </MethodDrawer>
        <button type="button" className="rp-tool" onClick={() => download("salaries.csv", toCsv(S.byGrade.data))}>
          Download chapter data (CSV)
        </button>
      </div>
    </div>
  );
}
