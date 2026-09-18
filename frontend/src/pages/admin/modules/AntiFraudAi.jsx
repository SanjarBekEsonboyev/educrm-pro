import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";

export default function AntiFraudAi() {
  const { t } = useTranslation();
  const { db } = useData();

  // Flags: payments larger than a course's monthly price, or attendance marked without any payment.
  const flags = [];
  db.payments.forEach((p) => {
    const s = db.students.find((x) => x.id === p.studentId);
    const course = s ? db.courses.find((c) => c.id === s.courseId) : null;
    if (course && p.amount > course.price * 1.5) {
      flags.push({ id: p.id, text: `${s?.name}: ${t("common.amount")} ${p.amount.toLocaleString()} (${t("courses.price")} ${course.price.toLocaleString()})` });
    }
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🛡️ {t("modules.antiFraud.title")}</div>
      <div className="card" style={{ padding: 20 }}>
        {flags.length === 0 && <div style={{ color: "var(--t3)", fontSize: 13 }}>✅ {t("common.noData")}</div>}
        {flags.map((f) => (
          <div key={f.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "#ffaa00" }}>⚠️ {f.text}</div>
        ))}
      </div>
    </div>
  );
}
