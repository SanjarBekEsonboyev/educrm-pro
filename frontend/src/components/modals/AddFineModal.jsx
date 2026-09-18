import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../context/ModalContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { FinesApi } from "../../api/endpoints";
import { fmt } from "../../utils/format";
import Icon from "../Icon";

export default function AddFineModal() {
  const { t } = useTranslation();
  const { modal, setModal } = useModal();
  const { refresh } = useData();
  const { showToast } = useToast();
  const { teacherId, teacherName } = modal.data;
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const reasonKeys = ["late", "missed", "poorQuality", "complaint", "noDocs", "discipline", "other"];

  const submit = async () => {
    if (!amount || !reason) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    setBusy(true);
    try {
      await FinesApi.create({ teacherId, amount: parseInt(amount, 10), reason });
      await refresh();
      showToast(`⚠️ ${t("modals.fine.success", { name: teacherName, amount: fmt(amount) })}`, "warning");
      setModal(null);
    } catch (e) {
      showToast(`⚠️ ${e.response?.data?.error || t("common.somethingWrong")}`, "warning");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}><Icon n="fine" s={18} /> {t("modals.fine.title")}</div>
          <button className="btn btn-g btn-ic btn-sm" onClick={() => setModal(null)}><Icon n="x" s={15} /></button>
        </div>
        <div style={{ color: "var(--t2)", marginBottom: 20, padding: "10px 14px", borderRadius: 10, background: "var(--bg3)" }}>{teacherName}</div>
        <div style={{ marginBottom: 14 }}>
          <label className="lbl">{t("modals.fine.reason")}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {reasonKeys.map((rk) => {
              const label = t(`modals.fine.reasons.${rk}`);
              return (
                <button key={rk} onClick={() => setReason(label)} type="button" style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${reason === label ? "var(--blue)" : "var(--border2)"}`, background: reason === label ? "rgba(79,143,255,.12)" : "var(--bg3)", color: reason === label ? "#7aaaff" : "var(--t2)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{label}</button>
              );
            })}
          </div>
          <input className="inp" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("modals.fine.customReason")} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label className="lbl">{t("modals.fine.amount")}</label>
          <input className="inp" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100000" />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-d" disabled={busy} style={{ flex: 1, justifyContent: "center" }} onClick={submit}><Icon n="fine" s={15} /> {t("modals.fine.submit")}</button>
          <button className="btn btn-g" onClick={() => setModal(null)}>{t("common.cancel")}</button>
        </div>
      </div>
    </div>
  );
}
