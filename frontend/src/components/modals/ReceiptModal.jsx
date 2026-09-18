import { useTranslation } from "react-i18next";
import { useModal } from "../../context/ModalContext";
import { useData } from "../../context/DataContext";
import { fmt, nowTime, localeMap } from "../../utils/format";
import Icon from "../Icon";

export default function ReceiptModal() {
  const { t, i18n } = useTranslation();
  const { modal, setModal } = useModal();
  const { db } = useData();
  const pay = modal.data;
  const st = modal.student || db.students.find((s) => s.id === pay.studentId);
  const course = db.courses.find((c) => c.id === st?.courseId);
  const group = db.groups.find((g) => g.id === st?.groupId);

  if (!st || !pay) return null;

  const rows = [
    [t("modals.receipt.number"), pay.id.slice(0, 8).toUpperCase()],
    [t("modals.receipt.date"), pay.date],
    [t("modals.receipt.time"), nowTime(localeMap[i18n.resolvedLanguage])],
    [t("modals.receipt.student"), st.name],
    [t("modals.receipt.phone"), st.phone],
    [t("modals.receipt.course"), `${course?.icon || ""} ${course?.name || ""}`],
    [t("modals.receipt.group"), group?.name || t("common.individual")],
    [t("modals.receipt.type"), st.type === "individual" ? t("common.individual") : t("common.groupType")],
    [t("modals.receipt.monthlyFee"), `${fmt(course?.price)} ${t("common.sum")}`],
    [t("modals.receipt.paid"), `${fmt(pay.amount)} ${t("common.sum")}`],
    [t("modals.receipt.note"), pay.note],
  ];

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🧾 {t("modals.receipt.title")}</div>
          <button className="btn btn-g btn-sm" onClick={() => setModal(null)}><Icon n="x" s={14} /></button>
        </div>
        <div className="receipt">
          <div style={{ textAlign: "center", borderBottom: "1px dashed var(--border2)", paddingBottom: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>EduCRM Pro</div>
            <div style={{ fontSize: 11, color: "var(--t3)" }}>{t("modals.receipt.title")}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map(([l, v], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <span style={{ color: "var(--t3)" }}>{l}:</span>
                <span style={{ fontWeight: 600, color: "var(--t1)", textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--border2)", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#00d68f" }}>{fmt(pay.amount)} {t("common.sum")}</div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>✓ {t("modals.receipt.confirmed")}</div>
          </div>
        </div>
        <button className="btn btn-p" style={{ width: "100%", justifyContent: "center", marginTop: 16 }} onClick={() => setModal(null)}>
          <Icon n="check" s={15} /> {t("modals.receipt.close")}
        </button>
      </div>
    </div>
  );
}
