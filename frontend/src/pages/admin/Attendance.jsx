import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { StudentsApi } from "../../api/endpoints";
import { today } from "../../utils/format";

export default function AdminAttendance() {
  const { t } = useTranslation();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const [selGroup, setSelGroup] = useState(db.groups.find((g) => g.status === "active")?.id || "");
  const [dateKey, setDateKey] = useState(today());
  const [recs, setRecs] = useState({});

  const group = db.groups.find((g) => g.id === selGroup);
  const teacher = group ? db.users.find((u) => u.id === group.teacherId) : null;
  const students = group ? db.students.filter((s) => s.groupId === selGroup && s.status === "active") : [];

  const save = async () => {
    const records = {};
    students.forEach((s) => { records[s.id] = recs[s.id] || "P"; });
    await StudentsApi.markAttendanceBulk(dateKey, records);
    await refresh();
    showToast(`✅ ${t("attendance.saved")}`, "success");
  };

  const marks = [["P", t("attendance.present"), "#00d68f", "rgba(0,214,143,.12)"], ["L", t("attendance.late"), "#ffaa00", "rgba(255,170,0,.12)"], ["A", t("attendance.absent"), "#ff3d5a", "rgba(255,61,90,.12)"]];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <select className="inp" value={selGroup} onChange={(e) => setSelGroup(e.target.value)} style={{ width: "auto", minWidth: 250 }}>
          {db.groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input type="date" className="inp" value={dateKey} onChange={(e) => setDateKey(e.target.value)} style={{ width: 160 }} />
        <button className="btn btn-p btn-sm" onClick={save}>{t("attendance.save")}</button>
      </div>

      {group && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{group.name}</div>
                <div style={{ color: "var(--t3)", fontSize: 12 }}>{teacher?.name} · {students.length}</div>
              </div>
              <span className="badge b-blue" style={{ fontFamily: "'JetBrains Mono',monospace" }}>{dateKey}</span>
            </div>
            {students.map((s) => {
              const v = recs[s.id] || s.attendance?.[dateKey] || null;
              const total = Object.keys(s.attendance || {}).length;
              const came = Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length;
              return (
                <div key={s.id} className="tr" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#4f8fff22,#7c6aff22)", border: "1px solid #4f8fff20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#7aaaff", flexShrink: 0 }}>{s.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                      <div style={{ color: "var(--t3)", fontSize: 11 }}>{t("teacherPortal.attendanceRate", { came, total })} ({total ? Math.round((came / total) * 100) : 0}%)</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {marks.map(([val, lbl, col, bg]) => (
                      <button key={val} onClick={() => setRecs((p) => ({ ...p, [s.id]: val }))} style={{ padding: "5px 11px", borderRadius: 8, border: `1px solid ${v === val ? col : "var(--border2)"}`, background: v === val ? bg : "transparent", color: v === val ? col : "var(--t3)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{lbl}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>{t("attendance.todayResult")}</div>
              {marks.map(([v, l, c]) => {
                const n = Object.values(recs).filter((x) => x === v).length;
                return (
                  <div key={v} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, background: `${c}08`, border: `1px solid ${c}20`, marginBottom: 7 }}>
                    <span style={{ fontSize: 12, color: "var(--t2)" }}>{l}</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: c }}>{n}</span>
                  </div>
                );
              })}
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>{t("attendance.groupStats")}</div>
              {students.slice(0, 5).map((s) => {
                const total = Object.keys(s.attendance || {}).length;
                const came = Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length;
                const rate = total ? Math.round((came / total) * 100) : 0;
                return (
                  <div key={s.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{s.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: rate >= 75 ? "#00d68f" : rate >= 50 ? "#ffaa00" : "#ff3d5a" }}>{rate}%</span>
                    </div>
                    <div className="prog"><div className="prog-f" style={{ width: `${rate}%`, background: rate >= 75 ? "#00d68f" : rate >= 50 ? "#ffaa00" : "#ff3d5a" }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
