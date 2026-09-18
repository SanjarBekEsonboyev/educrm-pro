import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { useModal } from "../../context/ModalContext";
import { AdmissionsApi } from "../../api/endpoints";
import Icon from "../../components/Icon";

export default function AdminAdmissions() {
  const { t } = useTranslation();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const { setModal } = useModal();
  const [form, setForm] = useState({ name: "", phone: "", courseId: "", type: "group", days: "MWF", note: "" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.phone || !form.courseId) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    setBusy(true);
    try {
      const res = await AdmissionsApi.create(form);
      await refresh();
      showToast(`✅ ${t("admissions.addedSuccess", { name: form.name })}`, "success");
      if (res.groupReadyToOpen) {
        const g = db.groups.find((x) => x.id === res.groupId);
        showToast(`🎉 ${t("admissions.groupReady", { name: g?.name || "" })}`, "info");
      }
      setForm({ name: "", phone: "", courseId: "", type: "group", days: "MWF", note: "" });
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("common.somethingWrong")}`, "warning");
    } finally {
      setBusy(false);
    }
  };

  const approve = async (id) => {
    await AdmissionsApi.approve(id);
    await refresh();
    showToast(`✅ ${t("admissions.approved")}`, "success");
  };

  const reject = async (id) => {
    await AdmissionsApi.reject(id);
    await refresh();
    showToast(t("admissions.rejected"), "warning");
  };

  const pending = db.admissions.filter((a) => a.status === "pending");
  const waitingGroups = db.groups.filter((g) => g.status === "waiting");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pending.length > 0 && (
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon n="bell" s={16} /> {t("admissions.newRequests", { count: pending.length })}
            </div>
            {pending.map((a) => {
              const course = db.courses.find((c) => c.id === a.courseId);
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: `${course?.color}18`, border: `1px solid ${course?.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{course?.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                    <div style={{ color: "var(--t3)", fontSize: 11 }}>{a.phone} · {course?.name} · {a.type === "individual" ? t("common.individual") : t("common.groupType")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-s btn-xs" onClick={() => approve(a.id)}><Icon n="check" s={12} /></button>
                    <button className="btn btn-d btn-xs" onClick={() => reject(a.id)}><Icon n="x" s={12} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>{t("admissions.waitingGroups")}</div>
          {waitingGroups.map((g) => {
            const course = db.courses.find((c) => c.id === g.courseId);
            const stList = db.students.filter((s) => s.groupId === g.id && s.status === "waiting");
            const minSize = course?.minGroup || g.minGroup || 5;
            return (
              <div key={g.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{g.name}</div>
                    <div style={{ color: "var(--t3)", fontSize: 11 }}>{stList.length}/{minSize} {t("admissions.openMin")}</div>
                  </div>
                  {stList.length >= minSize && (
                    <button className="btn btn-p btn-xs" onClick={() => setModal({ type: "confirmGroup", data: g })}>
                      {t("admissions.openBtn")}
                    </button>
                  )}
                </div>
                <div className="prog"><div className="prog-f" style={{ width: `${Math.min(100, (stList.length / minSize) * 100)}%`, background: `linear-gradient(90deg,${course?.color}88,${course?.color})` }} /></div>
              </div>
            );
          })}
          {waitingGroups.length === 0 && (
            <div style={{ color: "var(--t3)", textAlign: "center", padding: "20px 0" }}>{t("admissions.noWaitingGroups")}</div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 24, height: "fit-content", position: "sticky", top: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}><Icon n="admit" s={18} /> {t("admissions.newAdmission")}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label className="lbl">{t("admissions.fullName")}</label><input className="inp" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="lbl">{t("common.phone")}</label><input className="inp" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("admissions.phonePlaceholder")} /></div>
          <div>
            <label className="lbl">{t("common.course")}</label>
            <select className="inp" value={form.courseId} onChange={(e) => set("courseId", e.target.value)}>
              <option value="">{t("common.select")}</option>
              {db.courses.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name} — {c.price?.toLocaleString()} {t("common.sum")}/oy</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">{t("admissions.studyType")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["group", "individual"].map((v) => (
                <button key={v} className={`tab-btn${form.type === v ? " on" : ""}`} style={{ flex: 1 }} onClick={() => set("type", v)}>{t(v === "group" ? "common.groupType" : "common.individual")}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl">{t("admissions.lessonDays")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["MWF", "TTS", "daily"].map((v) => (
                <button key={v} className={`tab-btn${form.days === v ? " on" : ""}`} style={{ flex: 1, fontSize: 11 }} onClick={() => set("days", v)}>{t(`common.days.${v}`)}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl">{t("common.note")}</label>
            <textarea className="inp" value={form.note} onChange={(e) => set("note", e.target.value)} rows={2} placeholder={t("admissions.noteOptional")} />
          </div>
          <button className="btn btn-p" disabled={busy} style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 14 }} onClick={submit}>
            <Icon n="plus" s={16} /> {t("admissions.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
