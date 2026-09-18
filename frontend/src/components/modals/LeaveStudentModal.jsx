import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../context/ModalContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { StudentsApi } from "../../api/endpoints";
import { fmt, calcLessonFee, studentPrice } from "../../utils/format";
import Icon from "../Icon";

export default function LeaveStudentModal() {
  const { t } = useTranslation();
  const { modal, setModal } = useModal();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const s = modal.data;
  const course = db.courses.find((c) => c.id === s.courseId);
  const [reason, setReason] = useState("");
  const [attendedLessons, setAttended] = useState(0);
  const [busy, setBusy] = useState(false);

  const price = studentPrice(s, course);
  const usedFee = calcLessonFee(price, attendedLessons);
  const refund = Math.max(0, s.paid - usedFee);

  const confirm = async () => {
    if (!reason) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    setBusy(true);
    try {
      const res = await StudentsApi.leave(s.id, reason, attendedLessons);
      await refresh();
      showToast(`✅ ${t("modals.leave.success", { name: s.name, amount: fmt(res.refund) })}`, "warning");
      setModal(null);
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("common.somethingWrong")}`, "warning");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#ff3d5a", display: "flex", alignItems: "center", gap: 8 }}><Icon n="leave" s={18} /> {t("modals.leave.title")}</div>
          <button className="btn btn-g btn-ic btn-sm" onClick={() => setModal(null)}><Icon n="x" s={15} /></button>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 12, marginBottom: 18, background: "var(--bg3)", border: "1px solid var(--border2)" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
          <div style={{ color: "var(--t3)", fontSize: 12 }}>{course?.icon} {course?.name} · {t("modals.leave.paid")}: {fmt(s.paid)} {t("common.sum")}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="lbl">{t("modals.leave.reason")}</label>
          <textarea className="inp" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("modals.leave.reasonPlaceholder")} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="lbl">{t("modals.leave.lessonsAttended")}</label>
          <input className="inp" type="number" value={attendedLessons} onChange={(e) => setAttended(parseInt(e.target.value, 10) || 0)} min={0} max={12} />
          <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 4 }}>
            {t("modals.leave.monthlyIs", { price: fmt(price), lesson: fmt(Math.round(price / 12)) })}
          </div>
        </div>

        <div style={{ padding: "14px", borderRadius: 12, marginBottom: 20, background: "var(--bg1)", border: "1px solid var(--border2)" }}>
          {[
            [t("modals.leave.paid"), s.paid, "#00d68f"],
            [t("modals.leave.used"), usedFee, "#ffaa00"],
            [t("modals.leave.refund"), refund, refund > 0 ? "#4f8fff" : "var(--t3)"],
          ].map(([l, v, c], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 12, color: "var(--t2)" }}>{l}</span>
              <span style={{ fontWeight: 700, color: c, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(v)} {t("common.sum")}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-d" disabled={busy} style={{ flex: 1, justifyContent: "center" }} onClick={confirm}>
            <Icon n="check" s={15} /> {t("modals.leave.confirm")}
          </button>
          <button className="btn btn-g" onClick={() => setModal(null)}>{t("common.cancel")}</button>
        </div>
      </div>
    </div>
  );
}
