import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { SmsApi } from "../../api/endpoints";
import { fmt, studentPrice } from "../../utils/format";
import Icon from "../../components/Icon";

export default function AdminSms() {
  const { t } = useTranslation();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const [tab, setTab] = useState("debt");
  const [customPhone, setPhone] = useState("");
  const [customMsg, setMsg] = useState("");
  const [tmpl, setTmpl] = useState(0);

  const debtors = db.students.filter((s) => s.status === "active" && studentPrice(s, db.courses.find((c) => c.id === s.courseId)) > s.paid);

  const debtTemplates = [
    "Hurmatli {name}! To'lovingiz o'z vaqtida amalga oshirilmadi. Iltimos, {debt} so'm qarzingizni imkon qadar tezroq to'lang. EduCRM Pro",
    "Salom {name}! {debt} so'm to'lov qolmoqda. Murojaat: +998 90 000 00 00",
    "{name}, kurs to'lovingiz hali amalga oshirilmagan. Qarz: {debt} so'm. Iltimos to'lang!",
  ];

  const sendDebt = async () => {
    const recipients = debtors.map((s) => {
      const course = db.courses.find((c) => c.id === s.courseId);
      const debt = studentPrice(s, course) - s.paid;
      const msg = debtTemplates[tmpl].replace("{name}", s.name).replace("{debt}", fmt(debt));
      return { phone: s.phone, msg };
    });
    if (!recipients.length) return;
    await SmsApi.send(recipients, "debt");
    await refresh();
    showToast(`📱 ${t("sms.sentDebt", { count: recipients.length })}`, "success");
  };

  const sendCustom = async () => {
    if (!customPhone || !customMsg) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    await SmsApi.send([{ phone: customPhone, msg: customMsg }], "custom");
    await refresh();
    showToast(`📱 ${t("sms.sentOne")}`, "success");
    setPhone(""); setMsg("");
  };

  const sendAll = async () => {
    const active = db.students.filter((s) => s.status === "active");
    const recipients = active.map((s) => ({ phone: s.phone, msg: `Hurmatli ${s.name}! Darslar davom etmoqda. EduCRM Pro` }));
    if (!recipients.length) return;
    await SmsApi.send(recipients, "all");
    await refresh();
    showToast(`📱 ${t("sms.sentAll", { count: recipients.length })}`, "success");
  };

  const activeCount = db.students.filter((s) => s.status === "active").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["debt", "custom", "all", "log"].map((v) => (
          <button key={v} className={`tab-btn${tab === v ? " on" : ""}`} onClick={() => setTab(v)}>{t(`sms.tabs.${v}`)}</button>
        ))}
      </div>

      {tab === "debt" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}><Icon n="warn" s={16} /> {t("sms.debtorsCount", { count: debtors.length })}</div>
            {debtors.map((s) => {
              const course = db.courses.find((c) => c.id === s.courseId);
              const debt = studentPrice(s, course) - s.paid;
              return (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                    <div style={{ color: "var(--t3)", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}>{s.phone}</div>
                  </div>
                  <span style={{ color: "#ff3d5a", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(debt)} {t("common.sum")}</span>
                </div>
              );
            })}
          </div>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14 }}>{t("sms.template")}</div>
            {debtTemplates.map((tp, i) => (
              <div key={i} onClick={() => setTmpl(i)} style={{ padding: 12, borderRadius: 12, marginBottom: 10, cursor: "pointer", border: `1px solid ${tmpl === i ? "var(--blue)" : "var(--border2)"}`, background: tmpl === i ? "rgba(79,143,255,.08)" : "var(--bg3)", fontSize: 12, lineHeight: 1.5, color: "var(--t2)" }}>{tp}</div>
            ))}
            <button className="btn btn-a" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={sendDebt}>
              <Icon n="sms" s={15} /> {t("sms.sendCount", { count: debtors.length })}
            </button>
          </div>
        </div>
      )}

      {tab === "custom" && (
        <div className="card" style={{ padding: 24, maxWidth: 560 }}>
          <div style={{ fontWeight: 700, marginBottom: 18, fontSize: 15 }}>{t("sms.customSend")}</div>
          <div style={{ marginBottom: 14 }}><label className="lbl">{t("sms.phoneNumber")}</label><input className="inp" value={customPhone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 000 00 00" /></div>
          <div style={{ marginBottom: 14 }}><label className="lbl">{t("sms.message")}</label><textarea className="inp" rows={4} value={customMsg} onChange={(e) => setMsg(e.target.value)} /></div>
          <div className="sms-preview">{customMsg || t("sms.messagePreview")}</div>
          <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 8, marginBottom: 14 }}>{t("sms.charCount", { count: customMsg.length })}</div>
          <button className="btn btn-p" onClick={sendCustom}><Icon n="sms" s={15} /> {t("common.send")}</button>
        </div>
      )}

      {tab === "all" && (
        <div className="card" style={{ padding: 24, maxWidth: 480 }}>
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>{t("sms.sendToAll")}</div>
          <div style={{ color: "var(--t2)", fontSize: 13, marginBottom: 16 }}>{t("sms.activeCount")}: <strong style={{ color: "var(--t1)" }}>{activeCount}</strong></div>
          <div className="sms-preview">Hurmatli [Ism]! Darslar davom etmoqda. EduCRM Pro</div>
          <button className="btn btn-p" style={{ marginTop: 16 }} onClick={sendAll}>
            <Icon n="sms" s={15} /> {t("sms.sendAllBtn", { count: activeCount })}
          </button>
        </div>
      )}

      {tab === "log" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{[t("sms.time"), t("common.phone"), t("sms.message"), t("common.type")].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {db.smsLog.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: "40px 0", color: "var(--t3)" }}>{t("sms.noHistory")}</td></tr>}
              {db.smsLog.map((s) => (
                <tr key={s.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="td" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "var(--t3)" }}>{s.time}</td>
                  <td className="td" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{s.phone}</td>
                  <td className="td" style={{ fontSize: 12, color: "var(--t2)", maxWidth: 300 }}>{s.msg.slice(0, 80)}{s.msg.length > 80 ? "..." : ""}</td>
                  <td className="td"><span className={`badge ${s.type === "debt" ? "b-amber" : s.type === "custom" ? "b-purple" : "b-blue"}`}>{s.type === "debt" ? t("sms.typeDebt") : s.type === "custom" ? t("sms.typeCustom") : t("sms.typeAll")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
