import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { useToast } from "../../../context/ToastContext";
import { uid, today } from "../../../utils/format";
import Icon from "../../../components/Icon";

const STAGE_KEYS = ["new", "contacted", "trial", "attended", "converted"];
const STAGE_LABELS = { uz: ["Yangi", "Bog'lanildi", "Sinov darsiga", "Keldi", "O'quvchi"], en: ["New", "Contacted", "Trial lesson", "Attended", "Student"], ru: ["Новый", "Связались", "Пробный урок", "Пришёл", "Ученик"] };
const SOURCES = ["Instagram", "Telegram", "Facebook", "Referral", "Other"];
const STAGE_COLORS = ["#7e9abf", "#4f8fff", "#ffaa00", "#b06fff", "#00d68f"];

export default function SalesPipeline() {
  const { t, i18n } = useTranslation();
  const { db } = useData();
  const { showToast } = useToast();
  const stages = STAGE_LABELS[i18n.resolvedLanguage] || STAGE_LABELS.uz;

  const [leads, setLeads] = useState([
    { id: "l1", name: "Hamid Nazarov", phone: "+998 90 123 45 67", course: "English A1", stage: 0, source: "Instagram", date: "2024-05-20" },
    { id: "l2", name: "Lola Ergasheva", phone: "+998 91 234 56 78", course: "Math", stage: 1, source: "Telegram", date: "2024-05-21" },
    { id: "l3", name: "Sanjar Mirzaev", phone: "+998 93 345 67 89", course: "IT Basics", stage: 2, source: "Facebook", date: "2024-05-22" },
    { id: "l4", name: "Feruza Tosheva", phone: "+998 94 456 78 90", course: "Russian", stage: 3, source: "Referral", date: "2024-05-23" },
    { id: "l5", name: "Behzod Karimov", phone: "+998 95 567 89 01", course: "English B1", stage: 4, source: "Instagram", date: "2024-05-24" },
  ]);
  const [form, setForm] = useState({ name: "", phone: "", course: "", source: "Instagram" });
  const [showAdd, setShowAdd] = useState(false);
  const [refSel, setRefSel] = useState("");

  const move = (id, dir) => setLeads((p) => p.map((l) => (l.id === id ? { ...l, stage: Math.max(0, Math.min(4, l.stage + dir)) } : l)));

  const addLead = () => {
    if (!form.name || !form.phone) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    setLeads((p) => [...p, { ...form, id: uid("l"), stage: 0, date: today() }]);
    setForm({ name: "", phone: "", course: "", source: "Instagram" });
    setShowAdd(false);
    showToast(`✅ ${t("modules.pipeline.leadAdded")}`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🚀 {t("modules.pipeline.title")}</div>
          <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>{t("modules.pipeline.totalLeads", { count: leads.length, converted: leads.filter((l) => l.stage === 4).length })}</div>
        </div>
        <button className="btn btn-p" onClick={() => setShowAdd((s) => !s)}><Icon n="plus" s={15} /> {t("modules.pipeline.newLead")}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
        {SOURCES.map((s) => {
          const cnt = leads.filter((l) => l.source === s).length;
          return (
            <div key={s} className="stat-c" style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{s === "Instagram" ? "📸" : s === "Telegram" ? "✈️" : s === "Facebook" ? "👥" : s === "Referral" ? "🤝" : "📢"}</div>
              <div style={{ fontWeight: 800, color: "#4f8fff", fontSize: 16 }}>{cnt}</div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{s}</div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="card au" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label className="lbl">{t("common.name")}</label><input className="inp" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div><label className="lbl">{t("common.phone")}</label><input className="inp" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div><label className="lbl">{t("modules.pipeline.source")}</label><select className="inp" value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-p" onClick={addLead}>{t("common.add")}</button>
            <button className="btn btn-g" onClick={() => setShowAdd(false)}>{t("common.cancel")}</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, overflowX: "auto" }}>
        {stages.map((stage, si) => {
          const stageLeads = leads.filter((l) => l.stage === si);
          return (
            <div key={stage}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "6px 2px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: STAGE_COLORS[si] }}>{stage}</div>
                <span className="badge" style={{ background: `${STAGE_COLORS[si]}22`, color: STAGE_COLORS[si] }}>{stageLeads.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 200 }}>
                {stageLeads.map((l) => (
                  <div key={l.id} className="card au" style={{ padding: 14, border: `1px solid ${STAGE_COLORS[si]}33` }}>
                    <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{l.name}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>{l.phone}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
                      <span className="badge b-blue" style={{ fontSize: 9 }}>{l.source}</span>
                      <span style={{ fontSize: 9, color: "var(--t3)" }}>{l.date}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {si > 0 && <button className="btn btn-g btn-xs" style={{ flex: 1, justifyContent: "center" }} onClick={() => move(l.id, -1)}>←</button>}
                      {si < 4 && <button className="btn btn-p btn-xs" style={{ flex: 1, justifyContent: "center" }} onClick={() => move(l.id, 1)}>→</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🤝 {t("modules.pipeline.referral")}</div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="lbl">{t("modules.pipeline.referrer")}</label>
            <select className="inp" value={refSel} onChange={(e) => setRefSel(e.target.value)}>
              <option value="">{t("common.select")}</option>
              {db.students.filter((s) => s.status === "active").map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button className="btn btn-s" onClick={() => refSel ? showToast(`🎁 ${t("modules.pipeline.bonusGiven")}`, "success") : showToast(`⚠️ ${t("modules.pipeline.selectStudent")}`, "warning")}>
            {t("modules.pipeline.giveBonus")}
          </button>
        </div>
        <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: "rgba(0,214,143,.06)", border: "1px solid rgba(0,214,143,.15)", fontSize: 12, color: "var(--t2)" }}>
          💡 {t("modules.pipeline.ruleText")}
        </div>
      </div>
    </div>
  );
}
