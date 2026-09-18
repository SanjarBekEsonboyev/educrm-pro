import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { fmtM } from "../../../utils/format";

export default function BigDataDashboard() {
  const { t } = useTranslation();
  const { db } = useData();
  const totalIncome = db.payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = db.expenses.reduce((s, e) => s + e.amount, 0);

  const stats = [
    { l: t("reports.totalStudents"), v: db.students.length },
    { l: t("reports.groups"), v: db.groups.length },
    { l: t("reports.teachers"), v: db.users.filter((u) => u.role === "teacher").length },
    { l: t("dashboard.courses"), v: db.courses.length },
    { l: t("finance.totalIncome"), v: fmtM(totalIncome) },
    { l: t("finance.totalExpense"), v: fmtM(totalExpense) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">📊 {t("modules.bigdata.title")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-c">
            <div style={{ fontSize: 22, fontWeight: 900, color: "#4f8fff" }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 6 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
