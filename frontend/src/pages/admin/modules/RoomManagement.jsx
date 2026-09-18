import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";

const ROOMS = [
  { id: "r1", name: "101-xona", capacity: 15 },
  { id: "r2", name: "102-xona", capacity: 12 },
  { id: "r3", name: "IT-lab", capacity: 10 },
  { id: "r4", name: "Katta zal", capacity: 25 },
];

export default function RoomManagement() {
  const { t } = useTranslation();
  const { db } = useData();
  const activeGroups = db.groups.filter((g) => g.status === "active");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🚪 {t("modules.roomMgmt.title")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
        {ROOMS.map((r, i) => {
          const g = activeGroups[i % activeGroups.length];
          const course = g ? db.courses.find((c) => c.id === g.courseId) : null;
          return (
            <div key={r.id} className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 10 }}>{t("groups.maxSize")}: {r.capacity}</div>
              {g ? (
                <div style={{ padding: "8px 10px", borderRadius: 10, background: `${course?.color}18`, fontSize: 12 }}>
                  {course?.icon} {g.name}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--t3)" }}>{t("common.noData")}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
