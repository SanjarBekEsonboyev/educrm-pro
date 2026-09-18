import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { CoursesApi } from "../../api/endpoints";
import { fmt } from "../../utils/format";
import Icon from "../../components/Icon";

const ICONS = ["📚", "🇬🇧", "🇷🇺", "📐", "💻", "🎓", "🔬", "🎨", "🎵", "⚽", "🏛", "🌍"];
const COLORS = ["#4f8fff", "#00d68f", "#ffaa00", "#ff3d5a", "#b06fff", "#ff5fa0", "#00c4d8", "#7c6aff"];
const EMPTY_FORM = { name: "", icon: "📚", color: "#4f8fff", price: 350000, duration: "3 oy", desc: "", minGroup: 5, maxGroup: 12 };

export default function AdminCourses() {
  const { t } = useTranslation();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.name) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    try {
      if (editId) {
        await CoursesApi.update(editId, form);
        showToast(`✅ ${t("courses.updated")}`, "success");
      } else {
        await CoursesApi.create(form);
        showToast(`✅ ${t("courses.created")}`, "success");
      }
      await refresh();
      setShowForm(false); setEditId(null); setForm(EMPTY_FORM);
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("common.somethingWrong")}`, "warning");
    }
  };

  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setShowForm(true); };

  const deleteCourse = async (id) => {
    try {
      await CoursesApi.remove(id);
      await refresh();
      showToast(t("courses.deleted"), "warning");
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("courses.hasGroups")}`, "warning");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-p" onClick={() => { setShowForm((s) => !s); setEditId(null); setForm(EMPTY_FORM); }}>
          <Icon n="plus" s={16} /> {t("courses.newCourse")}
        </button>
      </div>

      {showForm && (
        <div className="card au" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>{editId ? t("courses.edit") : t("courses.new")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><label className="lbl">{t("courses.name")}</label><input className="inp" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="English A1" /></div>
            <div>
              <label className="lbl">{t("courses.icon")}</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {ICONS.map((ic) => (
                  <button key={ic} type="button" onClick={() => set("icon", ic)} style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${form.icon === ic ? "var(--blue)" : "var(--border2)"}`, background: form.icon === ic ? "rgba(79,143,255,.15)" : "var(--bg1)", fontSize: 16, cursor: "pointer" }}>{ic}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="lbl">{t("courses.color")}</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {COLORS.map((cl) => (
                  <button key={cl} type="button" onClick={() => set("color", cl)} style={{ width: 28, height: 28, borderRadius: 7, background: cl, border: `3px solid ${form.color === cl ? "#fff" : "transparent"}`, cursor: "pointer" }} />
                ))}
              </div>
            </div>
            <div><label className="lbl">{t("courses.price")}</label><input className="inp" type="number" value={form.price} onChange={(e) => set("price", parseInt(e.target.value, 10) || 0)} /></div>
            <div><label className="lbl">{t("courses.duration")}</label><input className="inp" value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="3 oy" /></div>
            <div><label className="lbl">{t("courses.minGroup")}</label><input className="inp" type="number" value={form.minGroup} onChange={(e) => set("minGroup", parseInt(e.target.value, 10) || 5)} /></div>
            <div><label className="lbl">{t("courses.maxGroup")}</label><input className="inp" type="number" value={form.maxGroup} onChange={(e) => set("maxGroup", parseInt(e.target.value, 10) || 12)} /></div>
            <div style={{ gridColumn: "1/-1" }}><label className="lbl">{t("courses.desc")}</label><textarea className="inp" rows={2} value={form.desc} onChange={(e) => set("desc", e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 13, background: "var(--bg3)", border: `1px solid ${form.color}33`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${form.color}18`, border: `1px solid ${form.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{form.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: form.color }}>{form.name || t("courses.name")}</div>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>{fmt(form.price)} {t("common.sum")}/oy · {form.duration} · {form.minGroup}–{form.maxGroup}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-p" onClick={save}><Icon n="check" s={15} /> {t("common.save")}</button>
            <button className="btn btn-g" onClick={() => { setShowForm(false); setEditId(null); }}>{t("common.cancel")}</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {db.courses.map((c, i) => {
          const groups = db.groups.filter((g) => g.courseId === c.id);
          const students = db.students.filter((s) => s.courseId === c.id && s.status === "active");
          const revenue = db.payments.filter((p) => students.some((s) => s.id === p.studentId)).reduce((s, p) => s + p.amount, 0);
          return (
            <div key={c.id} className="card au" style={{ padding: 22, animationDelay: `${i * 0.06}s`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, background: `radial-gradient(circle at 80% 20%,${c.color}18,transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: `${c.color}18`, border: `1px solid ${c.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: c.color }}>{c.name}</div>
                    <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 1 }}>{c.duration} · {c.minGroup}–{c.maxGroup}</div>
                  </div>
                </div>
              </div>
              <div style={{ color: "var(--t2)", fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>{c.desc}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[{ l: t("courses.price"), v: fmt(c.price), c: "#ffaa00" }, { l: t("common.group"), v: groups.length, c: "#4f8fff" }, { l: t("common.name"), v: students.length, c: "#00d68f" }].map((r, j) => (
                  <div key={j} style={{ background: "var(--bg3)", borderRadius: 10, padding: 8, textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: r.c }}>{r.v}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>{r.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 12 }}>{t("courses.revenue")}: <span style={{ color: "#00d68f", fontWeight: 700 }}>{fmt(revenue)} {t("common.sum")}</span></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-g btn-xs" style={{ flex: 1, justifyContent: "center" }} onClick={() => openEdit(c)}><Icon n="edit" s={13} /> {t("common.edit")}</button>
                <button className="btn btn-d btn-xs btn-ic" onClick={() => deleteCourse(c.id)}><Icon n="trash" s={13} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
