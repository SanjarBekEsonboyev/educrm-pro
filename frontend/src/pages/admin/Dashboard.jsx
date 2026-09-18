import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { fmt, fmtM, studentPrice } from "../../utils/format";
import Icon from "../../components/Icon";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { db } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();

  const totalIncome = db.payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = db.expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpense;
  const activeStudents = db.students.filter((s) => s.status === "active");
  const waitingStudents = db.students.filter((s) => s.status === "waiting");
  const activeGroups = db.groups.filter((g) => g.status === "active");
  const waitingGroups = db.groups.filter((g) => g.status === "waiting");
  const debtors = activeStudents.filter((s) => {
    const course = db.courses.find((c) => c.id === s.courseId);
    return studentPrice(s, course) > s.paid;
  });

  const kpis = [
    { l: t("dashboard.totalStudents"), v: activeStudents.length, c: "#4f8fff", i: "🎓", sub: t("dashboard.waiting", { count: waitingStudents.length }) },
    { l: t("dashboard.activeGroups"), v: activeGroups.length, c: "#00d68f", i: "📚", sub: t("dashboard.notOpened", { count: waitingGroups.length }) },
    { l: t("dashboard.teachers"), v: db.users.filter((u) => u.role === "teacher").length, c: "#b06fff", i: "🧑‍🏫" },
    { l: t("dashboard.courses"), v: db.courses.length, c: "#ffaa00", i: "📖" },
    { l: t("dashboard.monthlyIncome"), v: fmtM(totalIncome), c: "#00d68f", i: "💰", sub: t("common.sum") },
    { l: t("dashboard.monthlyExpense"), v: fmtM(totalExpense), c: "#ff3d5a", i: "💸", sub: t("common.sum") },
    { l: t("dashboard.netProfit"), v: fmtM(profit), c: profit >= 0 ? "#7aaaff" : "#ff3d5a", i: "📈", sub: t("common.sum") },
    { l: t("dashboard.debtors"), v: debtors.length, c: "#ffaa00", i: "⚠️" },
  ];

  const recentAdmissions = db.admissions.filter((a) => a.status === "pending");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14 }}>
        {kpis.map((k, i) => (
          <div key={i} className="stat-c au" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at 80% 20%,${k.c}18,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 22, marginBottom: 10 }}>{k.i}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: k.c, letterSpacing: "-.03em" }}>{k.v}</div>
            {k.sub && <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 2 }}>{k.sub}</div>}
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{t("dashboard.groupsStatus")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {db.groups.map((g) => {
              const course = db.courses.find((c) => c.id === g.courseId);
              const teacher = db.users.find((u) => u.id === g.teacherId);
              const st = db.students.filter((s) => s.groupId === g.id && s.status === "active").length;
              const pct = Math.round((st / (g.maxSize || 12)) * 100);
              return (
                <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${course?.color}18`, border: `1px solid ${course?.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{course?.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{g.name}</span>
                      <span style={{ fontSize: 11, color: "var(--t2)", flexShrink: 0, marginLeft: 6 }}>{st}/{g.maxSize}</span>
                    </div>
                    <div className="prog"><div className="prog-f" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${course?.color}88,${course?.color})` }} /></div>
                    <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{teacher?.name}</div>
                  </div>
                  <span className={`badge ${g.status === "active" ? "b-green" : "b-amber"}`} style={{ flexShrink: 0 }}>
                    {g.status === "active" ? t("common.active") : t("common.waiting")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {recentAdmissions.length > 0 && user.role === "admin" && (
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 6, color: "#4f8fff" }}>
                <Icon n="admit" s={16} /> {t("dashboard.newAdmissions", { count: recentAdmissions.length })}
              </div>
              {recentAdmissions.map((a) => {
                const course = db.courses.find((c) => c.id === a.courseId);
                return (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{a.name}</div>
                      <div style={{ color: "var(--t3)", fontSize: 11 }}>{course?.icon} {course?.name}</div>
                    </div>
                    <span className="badge b-amber">{t("dashboard.new")}</span>
                  </div>
                );
              })}
            </div>
          )}

          {debtors.length > 0 && (
            <div className="card" style={{ padding: 18, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 6, color: "#ff3d5a" }}><Icon n="warn" s={16} /> {t("dashboard.debtors")}</div>
                {user.role === "admin" && (
                  <button className="btn btn-a btn-xs" onClick={() => showToast(`📱 ${t("dashboard.sendAllDebtSms")}`, "warning")}>
                    <Icon n="sms" s={12} /> {t("dashboard.sendSms")}
                  </button>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto" }}>
                {debtors.map((s) => {
                  const course = db.courses.find((c) => c.id === s.courseId);
                  const debt = studentPrice(s, course) - s.paid;
                  return (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 10, background: "rgba(255,61,90,.04)", border: "1px solid rgba(255,61,90,.1)" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{s.name}</div>
                        <div style={{ color: "var(--t3)", fontSize: 11 }}>{s.phone}</div>
                      </div>
                      <div style={{ color: "#ff3d5a", fontWeight: 800, fontSize: 13 }}>{fmt(debt)} {t("common.sum")}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
