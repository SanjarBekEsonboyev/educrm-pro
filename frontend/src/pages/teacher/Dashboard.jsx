import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { fmt, todayFull, localeMap } from "../../utils/format";
import Icon from "../../components/Icon";

export default function TeacherDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { db } = useData();
  const myGroups = db.groups; // already scoped server-side to this teacher
  const myStudents = db.students.filter((s) => myGroups.some((g) => g.id === s.groupId) && s.status === "active");
  const myPayments = db.payments.filter((p) => myStudents.some((s) => s.id === p.studentId));
  const totalPaid = myPayments.reduce((s, p) => s + p.amount, 0);
  const sal = user.salary || { type: "fixed", value: 0 };
  const earnedSalary = sal.type === "fixed" ? sal.value : Math.round((totalPaid * sal.value) / 100);
  const myFines = db.fines; // scoped server-side
  const totalFine = myFines.reduce((s, f) => s + f.amount, 0);
  const course = db.courses.find((c) => c.id === user.subjectId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div className="section-title">{t("teacherPortal.hello", { name: user.name })}</div>
        <div className="section-sub">{course ? `${course.icon} ${t("teacherPortal.subjectTeacher", { course: course.name })}` : ""} · {todayFull(localeMap[i18n.resolvedLanguage])}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {[
          { l: t("teacherPortal.myGroups"), v: myGroups.length, c: "#4f8fff", i: "📚" },
          { l: t("teacherPortal.myStudents"), v: myStudents.length, c: "#00d68f", i: "🎓" },
          { l: t("teacherPortal.monthlyIncome"), v: fmt(earnedSalary), c: "#ffaa00", i: "💰", sub: t("common.sum") },
          { l: t("teacherPortal.fines"), v: fmt(totalFine), c: "#ff3d5a", i: "⚠️", sub: t("common.sum") },
        ].map((k, i) => (
          <div key={i} className="stat-c au" style={{ animationDelay: `${i * 0.06}s` }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{k.i}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: k.c, letterSpacing: "-.02em" }}>{k.v}</div>
            {k.sub && <div style={{ fontSize: 10, color: "var(--t3)" }}>{k.sub}</div>}
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{k.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {myGroups.map((g) => {
          const c = db.courses.find((x) => x.id === g.courseId);
          const st = db.students.filter((s) => s.groupId === g.id && s.status === "active");
          return (
            <div key={g.id} className="card au" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                  <div style={{ color: "var(--t3)", fontSize: 12, marginTop: 2 }}>{c?.icon} {c?.name}</div>
                </div>
                <span className={`badge ${g.status === "active" ? "b-green" : "b-amber"}`}>
                  {g.status === "active" ? t("common.active") : t("common.waiting")}
                </span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#4f8fff" }}>{st.length}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)" }}>{t("teacherPortal.student")}</div>
                </div>
                <div style={{ flex: 1, background: "var(--bg3)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t2)", fontFamily: "'JetBrains Mono',monospace" }}>{t(`common.days.${g.days}`)}</div>
                  <div style={{ fontSize: 10, color: "var(--t3)" }}>{t("teacherPortal.lessonDays")}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {myFines.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, color: "#ff3d5a", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon n="fine" s={16} /> {t("teacherPortal.fineList")}
          </div>
          {myFines.map((f) => (
            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{f.reason}</div>
                <div style={{ color: "var(--t3)", fontSize: 11 }}>{f.date}</div>
              </div>
              <div style={{ color: "#ff3d5a", fontWeight: 800 }}>{fmt(f.amount)} {t("common.sum")}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
