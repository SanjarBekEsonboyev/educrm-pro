import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { fmt, studentPrice } from "../../../utils/format";

export default function ParentPanel() {
  const { t } = useTranslation();
  const { db } = useData();
  const students = db.students.filter((s) => s.status === "active");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">👨‍👩‍👧 {t("modules.parentPanel.title")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {students.map((s) => {
          const course = db.courses.find((c) => c.id === s.courseId);
          const total = Object.keys(s.attendance || {}).length;
          const came = Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length;
          const rate = total ? Math.round((came / total) * 100) : 0;
          const price = studentPrice(s, course);
          return (
            <div key={s.id} className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 10 }}>{course?.icon} {course?.name}</div>
              <div className="prog" style={{ marginBottom: 4 }}><div className="prog-f" style={{ width: `${rate}%`, background: rate >= 75 ? "#00d68f" : "#ffaa00" }} /></div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 8 }}>{t("attendance.attended")}: {rate}%</div>
              <div style={{ fontSize: 12 }}>{t("modals.viewStudent.debt")}: <strong style={{ color: s.paid < price ? "#ff3d5a" : "#00d68f" }}>{fmt(Math.max(0, price - s.paid))} {t("common.sum")}</strong></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
