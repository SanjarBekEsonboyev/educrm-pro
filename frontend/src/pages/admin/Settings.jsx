import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";

export default function AdminSettings() {
  const { t } = useTranslation();
  const { db } = useData();
  const { showToast } = useToast();
  const [centerName, setCenterName] = useState("EduCenter Pro");
  const [phone, setPhone] = useState("+998 90 000 00 00");
  const [address, setAddress] = useState("Toshkent sh., Yunusobod tumani");

  const systemRows = [
    [t("settings.minGroupOpen"), "5"],
    [t("settings.monthlyLessons"), "12"],
    [t("settings.smsNotifications"), t("settings.enabled")],
    [t("settings.autoSms"), t("settings.enabled")],
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>🏫 {t("settings.centerInfo")}</div>
        {[
          [t("settings.centerName"), centerName, setCenterName],
          [t("settings.phone"), phone, setPhone],
          [t("settings.address"), address, setAddress],
        ].map(([l, v, fn], i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <label className="lbl">{l}</label>
            <input className="inp" value={v} onChange={(e) => fn(e.target.value)} />
          </div>
        ))}
        <button className="btn btn-p" onClick={() => showToast(`✅ ${t("settings.saved")}`, "success")}>{t("common.save")}</button>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>👤 {t("settings.users")}</div>
        {db.users.map((u) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#4f8fff,#7c6aff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{u.name[0]}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{u.name}</div>
                <div style={{ color: "var(--t3)", fontSize: 10, fontFamily: "'JetBrains Mono',monospace" }}>{u.login}</div>
              </div>
            </div>
            <span className={`badge ${u.role === "admin" ? "b-red" : u.role === "director" ? "b-purple" : "b-blue"}`}>{u.role}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>⚙️ {t("settings.systemSettings")}</div>
        {systemRows.map(([l, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--t2)" }}>{l}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#00d68f" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
