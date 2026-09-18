import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useModal } from "../../context/ModalContext";
import { fmt, studentPrice } from "../../utils/format";
import Icon from "../../components/Icon";

export default function AdminStudents() {
  const { t } = useTranslation();
  const { db } = useData();
  const { setModal } = useModal();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = db.students.filter((s) => {
    const match = s.name.toLowerCase().includes(q.toLowerCase()) || s.phone.includes(q);
    if (!match) return false;
    if (filter === "active") return s.status === "active";
    if (filter === "waiting") return s.status === "waiting";
    if (filter === "debt") return s.status === "active" && s.paid < studentPrice(s, db.courses.find((c) => c.id === s.courseId));
    if (filter === "ind") return s.type === "individual";
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const payStatus = (s) => {
    const price = studentPrice(s, db.courses.find((c) => c.id === s.courseId));
    if (s.paid >= price) return { l: t("students.payStatus.paid"), cls: "b-green" };
    if (s.paid > 0) return { l: t("students.payStatus.partial"), cls: "b-amber" };
    return { l: t("students.payStatus.debt"), cls: "b-red" };
  };

  const filters = [["all", t("common.all")], ["active", t("common.active")], ["waiting", t("common.waiting")], ["debt", t("students.filterDebt")], ["ind", t("students.filterIndividual")]];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }}><Icon n="search" s={15} /></span>
          <input className="inp" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("students.searchPlaceholder")} style={{ paddingLeft: 38 }} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {filters.map(([v, l]) => (
            <button key={v} className={`tab-btn${filter === v ? " on" : ""}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
        <button className="btn btn-p btn-sm" onClick={() => setModal({ type: "addStudent", data: {} })}>
          <Icon n="plus" s={15} /> {t("students.addStudent")}
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
            {Object.values(t("students.table", { returnObjects: true })).map((h, i) => <th key={i} className="th">{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map((s) => {
              const course = db.courses.find((c) => c.id === s.courseId);
              const group = db.groups.find((g) => g.id === s.groupId);
              const ps = payStatus(s);
              const price = studentPrice(s, course);
              const pct = price ? Math.round((s.paid / price) * 100) : 0;
              return (
                <tr key={s.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="td">
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: `${course?.color || "#4f8fff"}18`, border: `1px solid ${course?.color || "#4f8fff"}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: course?.color || "#7aaaff", flexShrink: 0 }}>{s.name[0]}</div>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                    </div>
                  </td>
                  <td className="td" style={{ color: "var(--t2)", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{s.phone}</td>
                  <td className="td"><span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>{course?.icon} {course?.name}</span></td>
                  <td className="td" style={{ fontSize: 12 }}>{group?.name || <span style={{ color: "var(--t3)" }}>—</span>}</td>
                  <td className="td"><span className={`badge ${s.type === "individual" ? "b-purple" : "b-blue"}`}>{s.type === "individual" ? t("common.individual") : t("common.groupType")}</span></td>
                  <td className="td" style={{ minWidth: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div className="prog" style={{ width: 55 }}><div className="prog-f" style={{ width: `${Math.min(100, pct)}%`, background: pct >= 100 ? "#00d68f" : pct > 0 ? "#ffaa00" : "#ff3d5a" }} /></div>
                      <span style={{ fontSize: 10, color: "var(--t3)", whiteSpace: "nowrap" }}>{fmt(s.paid)} / {fmt(price)}</span>
                    </div>
                  </td>
                  <td className="td">
                    <span className={`badge ${s.status === "active" ? "b-green" : s.status === "waiting" ? "b-amber" : "b-gray"}`}>
                      {s.status === "active" ? t("common.active") : s.status === "waiting" ? t("common.waiting") : t("common.left")}
                    </span>
                  </td>
                  <td className="td">
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-s btn-xs" onClick={() => setModal({ type: "payStudent", data: s })}>{t("students.pay")}</button>
                      <button className="btn btn-g btn-xs" onClick={() => setModal({ type: "viewStudent", data: s })}><Icon n="eye" s={12} /></button>
                      {s.status === "active" && <button className="btn btn-d btn-xs" onClick={() => setModal({ type: "leaveStudent", data: s })}><Icon n="leave" s={12} /></button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: "var(--t3)" }}>{t("students.notFound")}</div>}
      </div>
    </div>
  );
}
