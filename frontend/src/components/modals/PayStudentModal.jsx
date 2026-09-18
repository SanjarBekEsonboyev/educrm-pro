import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../context/ModalContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { StudentsApi } from "../../api/endpoints";
import { fmt, studentPrice } from "../../utils/format";
import Icon from "../Icon";

export default function PayStudentModal() {
  const { t } = useTranslation();
  const { modal, setModal } = useModal();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const s = modal.data;
  const course = db.courses.find((c) => c.id === s.courseId);
  const price = studentPrice(s, course);
  const debt = Math.max(0, price - s.paid);
  const [amt, setAmt] = useState(String(debt || price));
  const [note, setNote] = useState(t("modals.pay.title"));
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const a = parseInt(amt, 10);
    if (!a || a <= 0) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    setBusy(true);
    try {
      const { payment, student } = await StudentsApi.pay(s.id, a, note);
      await refresh();
      showToast(`✅ ${t("modals.pay.success", { amount: fmt(a) })}`, "success");
      setModal({ type: "receipt", data: payment, student });
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("common.somethingWrong")}`, "warning");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>💳 {t("modals.pay.title")}</div>
            <div style={{ color: "var(--t2)", fontSize: 12 }}>{s.name} · {course?.name} · {s.type === "individual" ? t("common.individual") : t("common.groupType")}</div>
          </div>
          <button className="btn btn-g btn-ic btn-sm" onClick={() => setModal(null)}><Icon n="x" s={15} /></button>
        </div>
        <div style={{ padding: "12px 14px", borderRadius: 12, marginBottom: 18, background: "rgba(255,61,90,.05)", border: "1px solid rgba(255,61,90,.15)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--t2)", fontSize: 12 }}>{t("modals.pay.monthlyFee")}</span>
            <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(price)} {t("common.sum")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "var(--t2)", fontSize: 12 }}>{t("modals.pay.paidSoFar")}</span>
            <span style={{ color: "#00d68f", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(s.paid)} {t("common.sum")}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: "var(--t2)", fontSize: 12 }}>{t("modals.pay.debt")}</span>
            <span style={{ color: "#ff3d5a", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(debt)} {t("common.sum")}</span>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}><label className="lbl">{t("modals.pay.amount")}</label><input className="inp" type="number" value={amt} onChange={(e) => setAmt(e.target.value)} autoFocus /></div>
        <div style={{ marginBottom: 20 }}><label className="lbl">{t("modals.pay.note")}</label><input className="inp" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-s" disabled={busy} style={{ flex: 1, justifyContent: "center" }} onClick={submit}><Icon n="check" s={15} /> {t("modals.pay.submit")}</button>
          <button className="btn btn-g" onClick={() => setModal(null)}>{t("common.cancel")}</button>
        </div>
      </div>
    </div>
  );
}
