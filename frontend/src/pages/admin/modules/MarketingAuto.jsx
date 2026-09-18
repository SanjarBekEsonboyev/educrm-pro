import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../context/ToastContext";
import Icon from "../../../components/Icon";

const CAMPAIGNS = [
  { id: "c1", name: "Yozgi chegirma", channel: "Instagram", status: "active" },
  { id: "c2", name: "Do'stingni olib kel", channel: "Telegram", status: "active" },
  { id: "c3", name: "Yangi kurs reklamasi", channel: "Facebook", status: "paused" },
];

export default function MarketingAuto() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState(CAMPAIGNS);

  const toggle = (id) => {
    setCampaigns((p) => p.map((c) => (c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c)));
    showToast("✅ OK", "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">📢 {t("modules.marketing.title")}</div>
      <div className="card" style={{ overflow: "hidden" }}>
        {campaigns.map((c) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>{c.channel}</div>
            </div>
            <span className={`badge ${c.status === "active" ? "b-green" : "b-gray"}`}>{c.status}</span>
            <button className="btn btn-g btn-xs" onClick={() => toggle(c.id)}><Icon n="bolt" s={12} /> {c.status === "active" ? "Pause" : "Resume"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
