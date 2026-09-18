import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { fmt } from "../../../utils/format";

export default function PsychologyLtv() {
  const { t } = useTranslation();
  const { db } = useData();

  const ltv = db.students.map((s) => {
    const paid = db.payments.filter((p) => p.studentId === s.id).reduce((a, p) => a + p.amount, 0);
    return { s, paid };
  }).sort((a, b) => b.paid - a.paid).slice(0, 10);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🧠 {t("modules.psychLtv.title")}</div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}><th className="th">{t("common.name")}</th><th className="th">LTV</th></tr></thead>
          <tbody>
            {ltv.map(({ s, paid }) => (
              <tr key={s.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="td" style={{ fontWeight: 600 }}>{s.name}</td>
                <td className="td" style={{ color: "#00d68f", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(paid)} {t("common.sum")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
