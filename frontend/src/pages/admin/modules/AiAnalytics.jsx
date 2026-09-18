import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { fmt, fmtM } from "../../../utils/format";

export default function AiAnalytics() {
  const { t } = useTranslation();
  const { db } = useData();

  const totalIncome = db.payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = db.expenses.reduce((s, e) => s + e.amount, 0);

  const churnRisks = db.students.filter((s) => s.status === "active").map((s) => {
    const total = Object.keys(s.attendance || {}).length;
    const came = Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length;
    const attRate = total > 0 ? came / total : 1;
    const risk = Math.round((1 - attRate) * 70 + (s.paid === 0 ? 30 : 0));
    return { s, risk: Math.min(100, risk) };
  }).sort((a, b) => b.risk - a.risk).slice(0, 8);

  const revenueByMonth = {};
  db.payments.forEach((p) => { revenueByMonth[p.month] = (revenueByMonth[p.month] || 0) + p.amount; });
  const months = Object.keys(revenueByMonth).sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="section-title">🤖 {t("modules.aiAnalytics.title")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>⚠️ Churn risk</div>
          {churnRisks.map(({ s, risk }) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <div className="prog" style={{ marginTop: 4 }}><div className="prog-f" style={{ width: `${risk}%`, background: risk >= 60 ? "#ff3d5a" : risk >= 30 ? "#ffaa00" : "#00d68f" }} /></div>
              </div>
              <span style={{ fontWeight: 800, color: risk >= 60 ? "#ff3d5a" : risk >= 30 ? "#ffaa00" : "#00d68f" }}>{risk}%</span>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📈 Revenue trend</div>
          {months.map((m) => (
            <div key={m} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--t2)" }}>{m}</span>
              <span style={{ fontWeight: 700, color: "#00d68f", fontFamily: "'JetBrains Mono',monospace" }}>{fmt(revenueByMonth[m])}</span>
            </div>
          ))}
          <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "rgba(79,143,255,.06)", border: "1px solid rgba(79,143,255,.15)", fontSize: 12, color: "var(--t2)" }}>
            {t("finance.totalIncome")}: <strong style={{ color: "#00d68f" }}>{fmtM(totalIncome)}</strong> · {t("finance.totalExpense")}: <strong style={{ color: "#ff3d5a" }}>{fmtM(totalExpense)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
