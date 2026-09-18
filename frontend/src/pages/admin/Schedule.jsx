import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";

export default function AdminSchedule() {
  const { t } = useTranslation();
  const { db } = useData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {["MWF", "TTS"].map((d) => (
          <div key={d} className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 14, color: "var(--t2)" }}>{t(`common.days.${d}`)}</div>
            {db.groups.filter((g) => g.days === d && g.status === "active").map((g) => {
              const course = db.courses.find((c) => c.id === g.courseId);
              const teacher = db.users.find((u) => u.id === g.teacherId);
              const st = db.students.filter((s) => s.groupId === g.id && s.status === "active").length;
              return (
                <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, marginBottom: 10, background: `${course?.color}0a`, border: `1px solid ${course?.color}25` }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: `${course?.color}18`, border: `1px solid ${course?.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{course?.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: course?.color }}>{g.name}</div>
                    <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 2 }}>{teacher?.name} · {st}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 22 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{t("schedule.allGroups")}</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
            {Object.values(t("schedule.table", { returnObjects: true })).map((h, i) => <th key={i} className="th">{h}</th>)}
          </tr></thead>
          <tbody>
            {db.groups.map((g) => {
              const course = db.courses.find((c) => c.id === g.courseId);
              const teacher = db.users.find((u) => u.id === g.teacherId);
              const st = db.students.filter((s) => s.groupId === g.id && s.status === "active").length;
              return (
                <tr key={g.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="td" style={{ fontWeight: 600 }}>{g.name}</td>
                  <td className="td"><span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>{course?.icon} {course?.name}</span></td>
                  <td className="td" style={{ color: "var(--t2)", fontSize: 12 }}>{teacher?.name}</td>
                  <td className="td"><span className="badge b-blue">{t(`common.days.${g.days}`)}</span></td>
                  <td className="td" style={{ fontWeight: 700, color: "#4f8fff" }}>{st}/{g.maxSize}</td>
                  <td className="td"><span className={`badge ${g.status === "active" ? "b-green" : "b-amber"}`}>{g.status === "active" ? t("common.active") : t("common.waiting")}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
