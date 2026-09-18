import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";

export default function AuditLog() {
  const { t } = useTranslation();
  const { db } = useData();

  const events = [
    ...db.payments.map((p) => ({ id: p.id, date: p.date, text: `${t("finance.receipt")}: ${p.amount.toLocaleString()} ${t("common.sum")}`, by: p.by })),
    ...db.fines.map((f) => ({ id: f.id, date: f.date, text: `${t("finance.fine")}: ${f.reason}`, by: f.by })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 40);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🕵️ {t("modules.auditLog.title")}</div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}><th className="th">{t("common.date")}</th><th className="th">{t("common.actions")}</th><th className="th">By</th></tr></thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="td" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--t3)" }}>{e.date}</td>
                <td className="td" style={{ fontSize: 12 }}>{e.text}</td>
                <td className="td" style={{ fontSize: 12, color: "var(--t2)" }}>{e.by || "—"}</td>
              </tr>
            ))}
            {events.length === 0 && <tr><td colSpan={3} style={{ textAlign: "center", padding: 30, color: "var(--t3)" }}>{t("common.noData")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
