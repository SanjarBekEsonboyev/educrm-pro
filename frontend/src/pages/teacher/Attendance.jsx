import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { StudentsApi } from "../../api/endpoints";
import { today } from "../../utils/format";

export default function TeacherAttendance() {
  const { t } = useTranslation();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const myGroups = db.groups;
  const [selGroup, setSelGroup] = useState(myGroups[0]?.id || "");
  const [dateKey, setDateKey] = useState(today());
  const [recs, setRecs] = useState({});

  const group = myGroups.find((g) => g.id === selGroup);
  const students = group ? db.students.filter((s) => s.groupId === selGroup && s.status === "active") : [];

  const saveAtt = async () => {
    const records = {};
    students.forEach((s) => { records[s.id] = recs[s.id] || "P"; });
    await StudentsApi.markAttendanceBulk(dateKey, records);
    await refresh();
    showToast(`✅ ${dateKey} ${t("attendance.saved")}`, "success");
  };

  const marks = [["P", t("attendance.present"), "#00d68f", "rgba(0,214,143,.12)"], ["L", t("attendance.late"), "#ffaa00", "rgba(255,170,0,.12)"], ["A", t("attendance.absent"), "#ff3d5a", "rgba(255,61,90,.12)"]];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {myGroups.map((g) => (
            <button key={g.id} className={`tab-btn${selGroup === g.id ? " on" : ""}`} onClick={() => setSelGroup(g.id)}>
              {db.courses.find((c) => c.id === g.courseId)?.icon} {g.name.split("—")[0].trim()}
            </button>
          ))}
        </div>
        <input type="date" className="inp" value={dateKey} onChange={(e) => setDateKey(e.target.value)} style={{ width: 160 }} />
      </div>

      {group && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{group.name}</div>
              <div style={{ color: "var(--t3)", fontSize: 12 }}>{dateKey} · {students.length}</div>
            </div>
            <button className="btn btn-p btn-sm" onClick={saveAtt}>{t("attendance.save")}</button>
          </div>
          {students.map((s) => {
            const v = recs[s.id] || s.attendance?.[dateKey] || null;
            const total = Object.keys(s.attendance || {}).length;
            const came = Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length;
            return (
              <div key={s.id} className="tr" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#4f8fff22,#7c6aff22)", border: "1px solid #4f8fff22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#7aaaff", flexShrink: 0 }}>{s.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                    <div style={{ color: "var(--t3)", fontSize: 11 }}>{t("teacherPortal.attendanceRate", { came, total })}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {marks.map(([val, lbl, col, bg]) => (
                    <button key={val} onClick={() => setRecs((p) => ({ ...p, [s.id]: val }))} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${v === val ? col : "var(--border2)"}`, background: v === val ? bg : "transparent", color: v === val ? col : "var(--t3)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{lbl}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
