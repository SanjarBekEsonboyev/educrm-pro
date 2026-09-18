import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import Icon from "../../../components/Icon";

export default function GlobalSearch() {
  const { t } = useTranslation();
  const { db } = useData();
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const students = query ? db.students.filter((s) => s.name.toLowerCase().includes(query) || s.phone.includes(query)) : [];
  const teachers = query ? db.users.filter((u) => u.role === "teacher" && u.name.toLowerCase().includes(query)) : [];
  const groups = query ? db.groups.filter((g) => g.name.toLowerCase().includes(query)) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🔍 {t("modules.globalSearch.title")}</div>
      <div style={{ position: "relative", maxWidth: 480 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t3)" }}><Icon n="search" s={15} /></span>
        <input className="inp" style={{ paddingLeft: 38 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("modules.globalSearch.placeholder")} />
      </div>
      {query && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>{t("common.name")} ({students.length})</div>
            {students.map((s) => <div key={s.id} style={{ padding: "6px 0", fontSize: 12, borderBottom: "1px solid var(--border)" }}>{s.name}</div>)}
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>{t("common.teacher")} ({teachers.length})</div>
            {teachers.map((s) => <div key={s.id} style={{ padding: "6px 0", fontSize: 12, borderBottom: "1px solid var(--border)" }}>{s.name}</div>)}
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>{t("common.group")} ({groups.length})</div>
            {groups.map((g) => <div key={g.id} style={{ padding: "6px 0", fontSize: 12, borderBottom: "1px solid var(--border)" }}>{g.name}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
