import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";

export default function TeacherStudents() {
  const { t } = useTranslation();
  const { db } = useData();
  const myStudents = db.students.filter((s) => s.status === "active");

  return (
    <div>
      <div className="section-title" style={{ marginBottom: 16 }}>{t("teacherPortal.myStudents")} ({myStudents.length})</div>
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
            {[t("common.name"), t("common.phone"), t("common.group"), t("nav.attendance"), t("common.status")].map((h) => <th key={h} className="th">{h}</th>)}
          </tr></thead>
          <tbody>
            {myStudents.map((s) => {
              const g = db.groups.find((x) => x.id === s.groupId);
              const total = Object.keys(s.attendance || {}).length;
              const came = Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length;
              const rate = total ? Math.round((came / total) * 100) : 0;
              return (
                <tr key={s.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="td" style={{ fontWeight: 600 }}>{s.name}</td>
                  <td className="td" style={{ color: "var(--t2)", fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{s.phone}</td>
                  <td className="td"><span className="badge b-blue">{g?.name || "—"}</span></td>
                  <td className="td">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="prog" style={{ width: 60 }}><div className="prog-f" style={{ width: `${rate}%`, background: rate >= 75 ? "#00d68f" : rate >= 50 ? "#ffaa00" : "#ff3d5a" }} /></div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)" }}>{rate}%</span>
                    </div>
                  </td>
                  <td className="td"><span className={`badge ${s.status === "active" ? "b-green" : "b-gray"}`}>{s.status === "active" ? t("common.active") : t("common.left")}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
