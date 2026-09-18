import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { fmt, fmtM, studentPrice } from "../../utils/format";

export default function AdminReports() {
  const { t } = useTranslation();
  const { db } = useData();

  const totalIncome = db.payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = db.expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpense;
  const activeStudents = db.students.filter((s) => s.status === "active");
  const attTotal = activeStudents.reduce((s, st) => s + Object.keys(st.attendance || {}).length, 0);
  const attPresent = activeStudents.reduce((s, st) => s + Object.values(st.attendance || {}).filter((x) => x === "P" || x === "L").length, 0);
  const attRate = attTotal ? Math.round((attPresent / attTotal) * 100) : 0;

  const courseStats = db.courses.map((c) => {
    const st = db.students.filter((s) => s.courseId === c.id && s.status === "active");
    const rev = db.payments.filter((p) => st.some((s) => s.id === p.studentId)).reduce((s, p) => s + p.amount, 0);
    return { ...c, students: st.length, revenue: rev };
  }).sort((a, b) => b.revenue - a.revenue);

  const kpis = [
    { l: t("reports.totalStudents"), v: db.students.length, c: "#4f8fff", i: "🎓" },
    { l: t("reports.active"), v: activeStudents.length, c: "#00d68f", i: "✅" },
    { l: t("reports.waiting"), v: db.students.filter((s) => s.status === "waiting").length, c: "#ffaa00", i: "⏳" },
    { l: t("reports.left"), v: db.students.filter((s) => s.status === "left").length, c: "var(--t3)", i: "👋" },
    { l: t("reports.groups"), v: db.groups.length, c: "#b06fff", i: "📚" },
    { l: t("reports.activeGroup"), v: db.groups.filter((g) => g.status === "active").length, c: "#00d68f", i: "🟢" },
    { l: t("reports.teachers"), v: db.users.filter((u) => u.role === "teacher").length, c: "#00c4d8", i: "🧑‍🏫" },
    { l: t("reports.attendanceRate"), v: attRate + "%", c: "#ffaa00", i: "📊" },
    { l: t("reports.monthlyIncome"), v: fmtM(totalIncome), c: "#00d68f", i: "💰" },
    { l: t("reports.monthlyExpense"), v: fmtM(totalExpense), c: "#ff3d5a", i: "💸" },
    { l: t("reports.netProfit"), v: fmtM(profit), c: profit >= 0 ? "#4f8fff" : "#ff3d5a", i: "📈" },
    { l: t("reports.debtors"), v: db.students.filter((s) => s.status === "active" && studentPrice(s, db.courses.find((c) => c.id === s.courseId)) > s.paid).length, c: "#ff3d5a", i: "⚠️" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 13 }}>
        {kpis.map((k, i) => (
          <div key={i} className="stat-c au" style={{ animationDelay: `${i * 0.04}s` }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 80% 20%,${k.c}14,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 20, marginBottom: 8 }}>{k.i}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: k.c, letterSpacing: "-.02em" }}>{k.v}</div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 3 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>📚 {t("reports.coursePerf")}</div>
          {courseStats.map((c) => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{c.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{c.name}</div>
                <div className="prog"><div className="prog-f" style={{ width: `${Math.min(100, (c.students / 20) * 100)}%`, background: `linear-gradient(90deg,${c.color}88,${c.color})` }} /></div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, color: "#00d68f", fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(c.revenue)}</div>
                <div style={{ fontSize: 10, color: "var(--t3)" }}>{c.students}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>🏆 {t("reports.teacherPerf")}</div>
          {db.users.filter((u) => u.role === "teacher").map((tc) => {
            const myGroups = db.groups.filter((g) => g.teacherId === tc.id);
            const myStudents = db.students.filter((s) => myGroups.some((g) => g.id === s.groupId) && s.status === "active");
            const myPayments = db.payments.filter((p) => myStudents.some((s) => s.id === p.studentId));
            const totalPaid = myPayments.reduce((s, p) => s + p.amount, 0);
            const sal = tc.salary || { type: "fixed", value: 2000000 };
            const earned = sal.type === "fixed" ? sal.value : Math.round((totalPaid * sal.value) / 100);
            return (
              <div key={tc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#b06fff,#7c6aff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{tc.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{tc.name}</div>
                  <div style={{ color: "var(--t3)", fontSize: 11 }}>{myStudents.length} · {myGroups.length}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#ffaa00", fontWeight: 700, fontSize: 13, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(earned)}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)" }}>{t("common.sum")}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
