import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { useToast } from "../../../context/ToastContext";
import { fmt } from "../../../utils/format";

const CONTRACTS = [
  { teacherId: "t1", start: "2024-01-01", end: "2025-12-31", signed: true },
  { teacherId: "t2", start: "2024-03-01", end: "2025-08-31", signed: true },
  { teacherId: "t3", start: "2024-02-01", end: "2025-07-31", signed: false },
];

export default function Hr360() {
  const { t } = useTranslation();
  const { db } = useData();
  const { showToast } = useToast();
  const [tab, setTab] = useState("contracts");

  const daysDiff = (dateStr) => Math.round((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

  const salarySlips = db.users.filter((u) => u.role === "teacher").map((tc) => {
    const myGroups = db.groups.filter((g) => g.teacherId === tc.id);
    const myStudents = db.students.filter((s) => myGroups.some((g) => g.id === s.groupId) && s.status === "active");
    const totalPaid = db.payments.filter((p) => myStudents.some((s) => s.id === p.studentId)).reduce((s, p) => s + p.amount, 0);
    const sal = tc.salary || { type: "fixed", value: 2000000 };
    const gross = sal.type === "fixed" ? sal.value : Math.round((totalPaid * sal.value) / 100);
    const kpi = gross > 2000000 ? Math.round(gross * 0.1) : 0;
    const fine = db.fines.filter((f) => f.teacherId === tc.id).reduce((s, f) => s + f.amount, 0);
    const inpsFee = Math.round(gross * 0.08);
    const net = gross + kpi - fine - inpsFee;
    return { tc, gross, kpi, fine, inpsFee, net };
  });

  const kpi360 = db.users.filter((u) => u.role === "teacher").map((tc) => {
    const myGroups = db.groups.filter((g) => g.teacherId === tc.id);
    const myStudents = db.students.filter((s) => myGroups.some((g) => g.id === s.groupId) && s.status === "active");
    const attRate = myStudents.reduce((s, st) => {
      const tot = Object.keys(st.attendance || {}).length;
      const came = Object.values(st.attendance || {}).filter((x) => x === "P" || x === "L").length;
      return s + (tot ? came / tot : 0);
    }, 0) / (myStudents.length || 1);
    const score = Math.min(100, Math.round(attRate * 40 + (myStudents.length / 10) * 30 + 30));
    return { tc, score, students: myStudents.length, groups: myGroups.length };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🧑‍💼 {t("modules.hr360.title")}</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["contracts", "salary", "kpi"].map((v) => (
          <button key={v} className={`tab-btn${tab === v ? " on" : ""}`} onClick={() => setTab(v)}>{t(`modules.hr360.${v === "contracts" ? "contracts" : v === "salary" ? "salarySlip" : "kpi"}`)}</button>
        ))}
      </div>

      {tab === "contracts" && (
        <div className="card" style={{ overflow: "hidden" }}>
          {CONTRACTS.map((ct, i) => {
            const tc = db.users.find((u) => u.id === ct.teacherId);
            const days = daysDiff(ct.end);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{tc?.name}</div>
                  <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>{ct.start} — {ct.end}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${ct.signed ? "b-green" : "b-amber"}`}>{ct.signed ? t("modules.hr360.signed") : t("modules.hr360.unsigned")}</span>
                  {days < 60 && <div style={{ fontSize: 11, color: "#ff3d5a", fontWeight: 700, marginTop: 4 }}>{t("modules.hr360.daysLeft", { count: days })}</div>}
                </div>
                <button className="btn btn-g btn-xs" onClick={() => showToast(`✅ ${t("modules.hr360.reminderSent", { name: tc?.name })}`, "success")}>{t("modules.hr360.reminder")}</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "salary" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {salarySlips.map(({ tc, gross, kpi, fine, inpsFee, net }) => (
            <div key={tc.id} className="card" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{tc.name}</div>
                <button className="btn btn-g btn-xs" onClick={() => showToast(`🖨️ ${t("modules.hr360.printed")}`, "success")}>{t("modules.hr360.printSlip")}</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
                {[[t("finance.main"), fmt(gross), "var(--t1)"], ["KPI", "+" + fmt(kpi), "#00d68f"], [t("finance.fine"), "-" + fmt(fine), "#ff3d5a"], ["INPS", "-" + fmt(inpsFee), "#ffaa00"], [t("finance.net"), fmt(net), "#4f8fff"]].map((r, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--bg3)" }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 3 }}>{r[0]}</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: r[2], fontFamily: "'JetBrains Mono',monospace" }}>{r[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "kpi" && (
        <div className="card" style={{ overflow: "hidden" }}>
          {kpi360.map(({ tc, score, students, groups }) => (
            <div key={tc.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: 18, borderBottom: "1px solid var(--border)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{tc.name}</div>
                <div className="prog"><div className="prog-f" style={{ width: `${score}%`, background: score >= 80 ? "#00d68f" : score >= 60 ? "#ffaa00" : "#ff3d5a" }} /></div>
                <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 4 }}>{students} · {groups}</div>
              </div>
              <span style={{ fontWeight: 800, color: score >= 80 ? "#00d68f" : score >= 60 ? "#ffaa00" : "#ff3d5a" }}>{score}/100</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
