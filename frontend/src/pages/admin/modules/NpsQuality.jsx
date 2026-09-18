import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";

export default function NpsQuality() {
  const { t } = useTranslation();
  const { db } = useData();

  const scores = db.users.filter((u) => u.role === "teacher").map((tc) => {
    const myGroups = db.groups.filter((g) => g.teacherId === tc.id);
    const myStudents = db.students.filter((s) => myGroups.some((g) => g.id === s.groupId) && s.status === "active");
    const attRate = myStudents.reduce((sum, s) => {
      const total = Object.keys(s.attendance || {}).length;
      const came = Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length;
      return sum + (total ? came / total : 0.8);
    }, 0) / (myStudents.length || 1);
    return { tc, score: Math.round(attRate * 10) };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">⭐ {t("modules.nps.title")}</div>
      <div className="card" style={{ overflow: "hidden" }}>
        {scores.map(({ tc, score }) => (
          <div key={tc.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 700, flex: 1 }}>{tc.name}</div>
            <div className="prog" style={{ width: 200 }}><div className="prog-f" style={{ width: `${score * 10}%`, background: score >= 8 ? "#00d68f" : score >= 5 ? "#ffaa00" : "#ff3d5a" }} /></div>
            <span style={{ fontWeight: 800, color: score >= 8 ? "#00d68f" : score >= 5 ? "#ffaa00" : "#ff3d5a" }}>{score}/10</span>
          </div>
        ))}
      </div>
    </div>
  );
}
