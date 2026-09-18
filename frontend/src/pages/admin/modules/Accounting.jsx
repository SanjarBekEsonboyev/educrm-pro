import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { fmt, fmtM } from "../../../utils/format";

export default function Accounting() {
  const { t } = useTranslation();
  const { db } = useData();
  const totalIncome = db.payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = db.expenses.reduce((s, e) => s + e.amount, 0);
  const salaryTotal = db.users.filter((u) => u.role === "teacher").reduce((sum, tc) => {
    const myGroups = db.groups.filter((g) => g.teacherId === tc.id);
    const myStudents = db.students.filter((s) => myGroups.some((g) => g.id === s.groupId) && s.status === "active");
    const paid = db.payments.filter((p) => myStudents.some((s) => s.id === p.studentId)).reduce((a, p) => a + p.amount, 0);
    const sal = tc.salary || { type: "fixed", value: 0 };
    return sum + (sal.type === "fixed" ? sal.value : Math.round((paid * sal.value) / 100));
  }, 0);
  const tax = Math.round(totalIncome * 0.12);
  const net = totalIncome - totalExpense - salaryTotal - tax;

  const rows = [
    [t("finance.totalIncome"), totalIncome, "#00d68f"],
    [t("finance.totalExpense"), -totalExpense, "#ff3d5a"],
    [t("finance.categories.salary"), -salaryTotal, "#ffaa00"],
    ["Soliq (12%)", -tax, "#b06fff"],
    [t("finance.net"), net, net >= 0 ? "#4f8fff" : "#ff3d5a"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🧮 {t("modules.accounting.title")}</div>
      <div className="card" style={{ padding: 24, maxWidth: 520 }}>
        {rows.map(([l, v, c], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
            <span style={{ fontSize: 13, color: "var(--t2)", fontWeight: i === rows.length - 1 ? 800 : 500 }}>{l}</span>
            <span style={{ fontWeight: 800, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(v)} {t("common.sum")}</span>
          </div>
        ))}
      </div>
      <div style={{ color: "var(--t3)", fontSize: 12 }}>{t("finance.netProfit")}: {fmtM(net)}</div>
    </div>
  );
}
