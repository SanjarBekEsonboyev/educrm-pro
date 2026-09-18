import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../context/ModalContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { StudentsApi } from "../../api/endpoints";
import Icon from "../Icon";

export default function AddStudentModal() {
  const { t } = useTranslation();
  const { setModal } = useModal();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", phone: "", courseId: "", groupId: "", type: "group", days: "MWF" });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const availableGroups = db.groups.filter((g) => g.courseId === form.courseId && (g.status === "active" || g.status === "waiting"));

  const submit = async () => {
    if (!form.name || !form.phone || !form.courseId) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    setBusy(true);
    try {
      await StudentsApi.create({ ...form, groupId: form.groupId || null });
      await refresh();
      showToast(`✅ ${t("modals.addStudent.success", { name: form.name })}`, "success");
      setModal(null);
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("common.somethingWrong")}`, "warning");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{t("modals.addStudent.title")}</div>
          <button className="btn btn-g btn-ic btn-sm" onClick={() => setModal(null)}><Icon n="x" s={15} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div><label className="lbl">{t("common.name")}</label><input className="inp" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className="lbl">{t("common.phone")}</label><input className="inp" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div>
            <label className="lbl">{t("common.course")}</label>
            <select className="inp" value={form.courseId} onChange={(e) => { set("courseId", e.target.value); set("groupId", ""); }}>
              <option value="">{t("common.select")}</option>
              {db.courses.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          {form.courseId && (
            <div>
              <label className="lbl">{t("common.group")}</label>
              <select className="inp" value={form.groupId} onChange={(e) => set("groupId", e.target.value)}>
                <option value="">{t("common.select")}</option>
                {availableGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="lbl">{t("common.type")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["group", "individual"].map((v) => (
                <button key={v} className={`tab-btn${form.type === v ? " on" : ""}`} style={{ flex: 1 }} onClick={() => set("type", v)}>{t(v === "group" ? "common.groupType" : "common.individual")}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl">{t("admissions.lessonDays")}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["MWF", "TTS"].map((v) => (
                <button key={v} className={`tab-btn${form.days === v ? " on" : ""}`} style={{ flex: 1 }} onClick={() => set("days", v)}>{t(`common.days.${v}`)}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn-p" disabled={busy} style={{ flex: 1, justifyContent: "center" }} onClick={submit}><Icon n="plus" s={15} /> {t("modals.addStudent.submit")}</button>
          <button className="btn btn-g" onClick={() => setModal(null)}>{t("common.cancel")}</button>
        </div>
      </div>
    </div>
  );
}
