import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { fmt, studentPrice } from "../../../utils/format";

export default function StudentCabinet() {
  const { t } = useTranslation();
  const { db } = useData();
  const active = db.students.filter((s) => s.status === "active");
  const [selId, setSelId] = useState(active[0]?.id || "");
  const s = active.find((x) => x.id === selId);
  const course = s ? db.courses.find((c) => c.id === s.courseId) : null;
  const total = s ? Object.keys(s.attendance || {}).length : 0;
  const came = s ? Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🧑‍🎓 {t("modules.studentCab.title")}</div>
      <select className="inp" style={{ maxWidth: 320 }} value={selId} onChange={(e) => setSelId(e.target.value)}>
        {active.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
      </select>
      {s && (
        <div className="card" style={{ padding: 22, maxWidth: 480 }}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>{s.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{t("common.course")}</div>
              <div style={{ fontWeight: 700 }}>{course?.icon} {course?.name}</div>
            </div>
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{t("attendance.attended")}</div>
              <div style={{ fontWeight: 700 }}>{came}/{total}</div>
            </div>
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{t("modals.viewStudent.paid")}</div>
              <div style={{ fontWeight: 700, color: "#00d68f" }}>{fmt(s.paid)} {t("common.sum")}</div>
            </div>
            <div style={{ background: "var(--bg3)", borderRadius: 10, padding: 10 }}>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{t("modals.viewStudent.debt")}</div>
              <div style={{ fontWeight: 700, color: "#ff3d5a" }}>{fmt(Math.max(0, studentPrice(s, course) - s.paid))} {t("common.sum")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
