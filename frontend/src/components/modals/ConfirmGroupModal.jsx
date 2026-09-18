import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../context/ModalContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { GroupsApi } from "../../api/endpoints";
import { today } from "../../utils/format";
import Icon from "../Icon";

export default function ConfirmGroupModal() {
  const { t } = useTranslation();
  const { modal, setModal } = useModal();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const g = modal.data;
  const course = db.courses.find((c) => c.id === g.courseId);
  const teacher = db.users.find((u) => u.id === g.teacherId);
  const students = db.students.filter((s) => s.groupId === g.id && s.status === "waiting");
  const [startDate, setStartDate] = useState(today());
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await GroupsApi.confirm(g.id, startDate);
      await refresh();
      showToast(`🎉 ${t("modals.confirmGroup.success", { name: g.name, count: res.activatedStudents })}`, "success");
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
          <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}><Icon n="check" s={18} /> {t("modals.confirmGroup.title")}</div>
          <button className="btn btn-g btn-ic btn-sm" onClick={() => setModal(null)}><Icon n="x" s={15} /></button>
        </div>
        <div style={{ padding: "14px", borderRadius: 14, marginBottom: 18, background: `${course?.color}0a`, border: `1px solid ${course?.color}25` }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{course?.icon} {g.name}</div>
          <div style={{ color: "var(--t3)", fontSize: 12 }}>{teacher?.name} · {students.length}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="lbl">{t("modals.confirmGroup.startDate")}</label>
          <input type="date" className="inp" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 4 }}>{t("modals.confirmGroup.startHint")}</div>
        </div>
        <div style={{ marginBottom: 18, padding: "12px", borderRadius: 12, background: "rgba(0,214,143,.05)", border: "1px solid rgba(0,214,143,.15)" }}>
          <div style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.6 }}>
            ✓ {t("modals.confirmGroup.info1", { count: students.length })}<br />
            ✓ {t("modals.confirmGroup.info2", { date: startDate })}<br />
            ✓ {t("modals.confirmGroup.info3")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-s" disabled={busy} style={{ flex: 1, justifyContent: "center" }} onClick={confirm}><Icon n="check" s={15} /> {t("modals.confirmGroup.confirm")}</button>
          <button className="btn btn-g" onClick={() => setModal(null)}>{t("common.cancel")}</button>
        </div>
      </div>
    </div>
  );
}
