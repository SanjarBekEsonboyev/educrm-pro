import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";

export default function TeacherSchedule() {
  const { t } = useTranslation();
  const { db } = useData();
  const myGroups = db.groups;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">{t("nav.mySchedule")}</div>
      {["MWF", "TTS"].map((d) => {
        const gs = myGroups.filter((g) => g.days === d);
        if (!gs.length) return null;
        return (
          <div key={d}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--t2)", marginBottom: 10 }}>{t(`common.days.${d}`)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {gs.map((g) => {
                const course = db.courses.find((c) => c.id === g.courseId);
                const st = db.students.filter((s) => s.groupId === g.id && s.status === "active");
                return (
                  <div key={g.id} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${course?.color}22`, border: `1px solid ${course?.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {course?.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                      <div style={{ color: "var(--t3)", fontSize: 12, marginTop: 2 }}>{course?.name}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "#4f8fff" }}>{st.length}</div>
                      <div style={{ fontSize: 11, color: "var(--t3)" }}>{t("teacherPortal.student")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
