import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { useModal } from "../../context/ModalContext";
import { GroupsApi } from "../../api/endpoints";
import Icon from "../../components/Icon";

export default function AdminGroups() {
  const { t } = useTranslation();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const { setModal } = useModal();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", courseId: "", teacherId: "", days: "MWF", maxSize: 12, minGroup: 5 });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const addGroup = async () => {
    if (!form.name || !form.courseId || !form.teacherId) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    try {
      await GroupsApi.create(form);
      await refresh();
      showToast(`✅ ${t("groups.created")}`, "success");
      setShowAdd(false);
      setForm({ name: "", courseId: "", teacherId: "", days: "MWF", maxSize: 12, minGroup: 5 });
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("common.somethingWrong")}`, "warning");
    }
  };

  const deleteGroup = async (gId) => {
    try {
      await GroupsApi.remove(gId);
      await refresh();
      showToast(t("groups.deleted"), "warning");
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("groups.hasStudents")}`, "warning");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-p" onClick={() => setShowAdd((s) => !s)}>
          <Icon n="plus" s={16} /> {t("groups.newGroup")}
        </button>
      </div>

      {showAdd && (
        <div className="card au" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{t("groups.addGroup")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1/-1" }}><label className="lbl">{t("groups.groupName")}</label><input className="inp" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("groups.groupNamePlaceholder")} /></div>
            <div>
              <label className="lbl">{t("common.course")}</label>
              <select className="inp" value={form.courseId} onChange={(e) => { set("courseId", e.target.value); const c = db.courses.find((x) => x.id === e.target.value); if (c) { set("minGroup", c.minGroup); set("maxSize", c.maxGroup); } }}>
                <option value="">{t("common.select")}</option>
                {db.courses.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">{t("common.teacher")}</label>
              <select className="inp" value={form.teacherId} onChange={(e) => set("teacherId", e.target.value)}>
                <option value="">{t("common.select")}</option>
                {db.users.filter((u) => u.role === "teacher").map((tc) => <option key={tc.id} value={tc.id}>{tc.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">{t("admissions.lessonDays")}</label>
              <select className="inp" value={form.days} onChange={(e) => set("days", e.target.value)}>
                <option value="MWF">{t("common.days.MWF")}</option>
                <option value="TTS">{t("common.days.TTS")}</option>
              </select>
            </div>
            <div><label className="lbl">{t("groups.minSize")}</label><input className="inp" type="number" value={form.minGroup} onChange={(e) => set("minGroup", parseInt(e.target.value, 10) || 5)} /></div>
            <div><label className="lbl">{t("groups.maxSize")}</label><input className="inp" type="number" value={form.maxSize} onChange={(e) => set("maxSize", parseInt(e.target.value, 10) || 12)} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn btn-p" onClick={addGroup}><Icon n="check" s={16} /> {t("common.save")}</button>
            <button className="btn btn-g" onClick={() => setShowAdd(false)}>{t("common.cancel")}</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
        {db.groups.map((g, i) => {
          const course = db.courses.find((c) => c.id === g.courseId);
          const teacher = db.users.find((u) => u.id === g.teacherId);
          const stList = db.students.filter((s) => s.groupId === g.id && s.status !== "left");
          const active = stList.filter((s) => s.status === "active");
          const waiting = stList.filter((s) => s.status === "waiting");
          const pct = Math.round((active.length / g.maxSize) * 100);

          return (
            <div key={g.id} className="card au" style={{ padding: 22, animationDelay: `${i * 0.06}s`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 100, height: 100, background: `radial-gradient(circle at 80% 20%,${course?.color}14,transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: `${course?.color}18`, border: `1px solid ${course?.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{course?.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
                    <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 2 }}>{teacher?.name}</div>
                  </div>
                </div>
                <span className={`badge ${g.status === "active" ? "b-green" : g.status === "waiting" ? "b-amber" : "b-gray"}`}>
                  {g.status === "active" ? t("groups.statusActive") : g.status === "waiting" ? t("groups.statusWaiting") : t("groups.statusClosed")}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { l: t("common.active"), v: active.length, c: "#00d68f" },
                  { l: t("common.waiting"), v: waiting.length, c: "#ffaa00" },
                  { l: "Max", v: g.maxSize, c: "#4f8fff" },
                ].map((r, j) => (
                  <div key={j} style={{ background: "var(--bg3)", borderRadius: 10, padding: 8, textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: r.c }}>{r.v}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>{r.l}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>{t("groups.fullness")}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--t2)" }}>{pct}%</span>
                </div>
                <div className="prog"><div className="prog-f" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${course?.color}88,${course?.color})` }} /></div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {g.status === "waiting" && waiting.length >= (g.minGroup || 5) && (
                  <button className="btn btn-s btn-xs" onClick={() => setModal({ type: "confirmGroup", data: g })}>
                    <Icon n="check" s={12} /> {t("groups.confirmBtn")}
                  </button>
                )}
                <button className="btn btn-g btn-xs" onClick={() => deleteGroup(g.id)}>
                  <Icon n="trash" s={12} />
                </button>
                <span style={{ fontSize: 11, color: "var(--t3)", marginLeft: "auto", alignSelf: "center" }}>
                  {t(`common.days.${g.days}`)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
