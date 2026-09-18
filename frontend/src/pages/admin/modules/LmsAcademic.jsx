import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";

export default function LmsAcademic() {
  const { t } = useTranslation();
  const { db } = useData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🎓 {t("modules.lms.title")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {db.courses.map((c) => {
          const groups = db.groups.filter((g) => g.courseId === c.id);
          return (
            <div key={c.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.icon}</div>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 10 }}>{c.duration} · {c.desc}</div>
              {groups.map((g) => (
                <div key={g.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                  <span>{g.name}</span>
                  <span className="badge b-blue">{g.status}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
