import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { useModal } from "../../context/ModalContext";
import { UsersApi } from "../../api/endpoints";
import { fmt } from "../../utils/format";
import Icon from "../../components/Icon";

export default function AdminTeachers() {
  const { t } = useTranslation();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const { setModal } = useModal();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", login: "", password: "", subjectId: "", salType: "fixed", salVal: 2000000 });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const teachers = db.users.filter((u) => u.role === "teacher");

  const resetForm = () => setForm({ name: "", phone: "", login: "", password: "", subjectId: "", salType: "fixed", salVal: 2000000 });

  const save = async () => {
    if (!form.name || !form.login || (!editId && !form.password)) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    const payload = { name: form.name, phone: form.phone, login: form.login, password: form.password || undefined, subjectId: form.subjectId, salary: { type: form.salType, value: form.salVal } };
    try {
      if (editId) {
        await UsersApi.update(editId, payload);
        showToast(`✅ ${t("teachers.updated")}`, "success");
      } else {
        await UsersApi.create(payload);
        showToast(`✅ ${t("teachers.createdNew")}`, "success");
      }
      await refresh();
      setShowAdd(false); setEditId(null); resetForm();
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("common.somethingWrong")}`, "warning");
    }
  };

  const openEdit = (tc) => {
    setForm({ name: tc.name, phone: tc.phone, login: tc.login, password: "", subjectId: tc.subjectId || "", salType: tc.salary?.type || "fixed", salVal: tc.salary?.value || 2000000 });
    setEditId(tc.id); setShowAdd(true);
  };

  const removeTeacher = async (id) => {
    try {
      await UsersApi.remove(id);
      await refresh();
      showToast(t("teachers.removed"), "warning");
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("teachers.hasGroups")}`, "warning");
    }
  };

  const addBonus = async (id) => {
    await UsersApi.addBonus(id, 200000);
    await refresh();
    showToast(t("teachers.bonusAdded"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-p" onClick={() => { setShowAdd((s) => !s); setEditId(null); resetForm(); }}>
          <Icon n="plus" s={16} /> {t("teachers.add")}
        </button>
      </div>

      {showAdd && (
        <div className="card au" style={{ padding: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18 }}>{editId ? t("teachers.edit") : t("teachers.new")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label className="lbl">{t("teachers.fields.name")}</label><input className="inp" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><label className="lbl">{t("teachers.fields.phone")}</label><input className="inp" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><label className="lbl">{t("teachers.fields.login")}</label><input className="inp" value={form.login} onChange={(e) => set("login", e.target.value)} /></div>
            <div><label className="lbl">{t("teachers.fields.password")}</label><input className="inp" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder={editId ? "••••••" : ""} /></div>
            <div>
              <label className="lbl">{t("teachers.fields.subject")}</label>
              <select className="inp" value={form.subjectId} onChange={(e) => set("subjectId", e.target.value)}>
                <option value="">{t("common.select")}</option>
                {db.courses.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">{t("teachers.fields.salaryType")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["fixed", "percent"].map((v) => (
                  <button key={v} className={`tab-btn${form.salType === v ? " on" : ""}`} style={{ flex: 1, fontSize: 11 }} onClick={() => set("salType", v)}>{t(v === "fixed" ? "teachers.fields.salaryFixed" : "teachers.fields.salaryPercent")}</button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label className="lbl">{form.salType === "fixed" ? t("teachers.fields.monthlySalary") : t("teachers.fields.percentOfPay")}</label>
              <input className="inp" type="number" value={form.salVal} onChange={(e) => set("salVal", parseFloat(e.target.value) || 0)} />
              {form.salType === "percent" && <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 4 }}>{t("teachers.percentHint", { pct: form.salVal })}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn btn-p" onClick={save}><Icon n="check" s={15} /> {t("common.save")}</button>
            <button className="btn btn-g" onClick={() => { setShowAdd(false); setEditId(null); }}>{t("common.cancel")}</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
        {teachers.map((tc, i) => {
          const course = db.courses.find((c) => c.id === tc.subjectId);
          const myGroups = db.groups.filter((g) => g.teacherId === tc.id);
          const myStudents = db.students.filter((s) => myGroups.some((g) => g.id === s.groupId) && s.status === "active");
          const myPayments = db.payments.filter((p) => myStudents.some((s) => s.id === p.studentId));
          const totalPaid = myPayments.reduce((s, p) => s + p.amount, 0);
          const sal = tc.salary || { type: "fixed", value: 2000000 };
          const earned = sal.type === "fixed" ? sal.value : Math.round((totalPaid * sal.value) / 100);
          const myFines = db.fines.filter((f) => f.teacherId === tc.id);
          const totalFine = myFines.reduce((s, f) => s + f.amount, 0);
          const net = earned + (tc.bonuses || 0) - totalFine;

          return (
            <div key={tc.id} className="card au" style={{ padding: 22, animationDelay: `${i * 0.07}s`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: "radial-gradient(circle at 80% 10%,rgba(176,111,255,.12),transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#b06fff,#7c6aff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: "0 4px 14px rgba(176,111,255,.3)" }}>{tc.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{tc.name}</div>
                    <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 1 }}>{tc.phone}</div>
                  </div>
                </div>
                <span className="badge b-purple">{course?.icon} {course?.name || "—"}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { l: t("teachers.groups"), v: myGroups.length, c: "#4f8fff" },
                  { l: t("teachers.students"), v: myStudents.length, c: "#00d68f" },
                  { l: sal.type === "fixed" ? t("teachers.fields.salaryFixed") : t("teachers.fields.salaryPercent"), v: sal.type === "fixed" ? fmt(sal.value) : `${sal.value}%`, c: "#ffaa00" },
                  { l: t("finance.fine"), v: fmt(totalFine), c: "#ff3d5a" },
                ].map((r, j) => (
                  <div key={j} style={{ background: "var(--bg3)", borderRadius: 10, padding: "8px 10px" }}>
                    <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 2 }}>{r.l}</div>
                    <div style={{ fontWeight: 700, color: r.c, fontSize: 13 }}>{r.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(0,214,143,.05)", border: "1px solid rgba(0,214,143,.12)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ color: "var(--t2)", fontSize: 12 }}>{t("teachers.netSalary")}</span>
                <span style={{ color: "#00d68f", fontWeight: 800, fontSize: 16, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(net)} {t("common.sum")}</span>
              </div>

              <div style={{ display: "flex", gap: 7 }}>
                <button className="btn btn-s btn-xs" style={{ flex: 1, justifyContent: "center" }} onClick={() => addBonus(tc.id)}>{t("teachers.addBonus")}</button>
                <button className="btn btn-d btn-xs" style={{ flex: 1, justifyContent: "center" }} onClick={() => setModal({ type: "addFine", data: { teacherId: tc.id, teacherName: tc.name } })}>{t("teachers.addFine")}</button>
                <button className="btn btn-g btn-xs btn-ic" onClick={() => openEdit(tc)}><Icon n="edit" s={14} /></button>
                <button className="btn btn-g btn-xs btn-ic" onClick={() => removeTeacher(tc.id)}><Icon n="trash" s={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
