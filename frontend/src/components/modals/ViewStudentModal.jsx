import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useModal } from "../../context/ModalContext";
import { useData } from "../../context/DataContext";
import { StudentsApi } from "../../api/endpoints";
import { fmt, studentPrice } from "../../utils/format";
import Icon from "../Icon";

export default function ViewStudentModal() {
  const { t } = useTranslation();
  const { modal, setModal } = useModal();
  const { db } = useData();
  const s = modal.data;
  const course = db.courses.find((c) => c.id === s.courseId);
  const group = db.groups.find((g) => g.id === s.groupId);
  const [pays, setPays] = useState(db.payments.filter((p) => p.studentId === s.id));

  useEffect(() => {
    StudentsApi.get(s.id).then((full) => { if (full.payments) setPays(full.payments.map((p) => ({ ...p, studentId: p.student_id }))); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.id]);

  const total = Object.keys(s.attendance || {}).length;
  const came = Object.values(s.attendance || {}).filter((x) => x === "P" || x === "L").length;
  const price = studentPrice(s, course);

  const rows = [
    [t("modals.viewStudent.course"), `${course?.icon || ""} ${course?.name || ""}`],
    [t("modals.viewStudent.group"), group?.name || "—"],
    [t("modals.viewStudent.days"), t(`common.days.${s.days}`) || s.days],
    [t("modals.viewStudent.joined"), s.joinDate || "—"],
    [t("modals.viewStudent.payStart"), s.payStart || "—"],
    [t("modals.viewStudent.monthlyFee"), `${fmt(price)} ${t("common.sum")}`],
    [t("modals.viewStudent.paid"), `${fmt(s.paid)} ${t("common.sum")}`],
    [t("modals.viewStudent.debt"), `${fmt(Math.max(0, price - s.paid))} ${t("common.sum")}`],
    [t("modals.viewStudent.totalLessons"), total],
    [t("modals.viewStudent.attended"), `${came} (${total ? Math.round((came / total) * 100) : 0}%)`],
  ];

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>{t("modals.viewStudent.title")}</div>
          <button className="btn btn-g btn-ic btn-sm" onClick={() => setModal(null)}><Icon n="x" s={15} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: 16, borderRadius: 14, background: "var(--bg3)", border: "1px solid var(--border2)" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg,${course?.color || "#4f8fff"},${course?.color || "#7c6aff"}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{s.name[0]}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</div>
            <div style={{ color: "var(--t3)", fontSize: 12, marginTop: 2 }}>{s.phone}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <span className={`badge ${s.status === "active" ? "b-green" : s.status === "waiting" ? "b-amber" : "b-gray"}`}>{t(`common.${s.status}`)}</span>
              <span className={`badge ${s.type === "individual" ? "b-purple" : "b-blue"}`}>{s.type === "individual" ? t("common.individual") : t("common.groupType")}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ padding: "8px 10px", borderRadius: 10, background: "var(--bg3)" }}>
              <div style={{ fontSize: 10, color: "var(--t3)", marginBottom: 2 }}>{r[0]}</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{r[1]}</div>
            </div>
          ))}
        </div>
        {pays.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{t("modals.viewStudent.paymentHistory")}</div>
            {pays.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 12 }}>
                <span style={{ color: "var(--t3)", fontFamily: "'JetBrains Mono',monospace" }}>{p.date}</span>
                <span style={{ color: "var(--t2)" }}>{p.note}</span>
                <span style={{ color: "#00d68f", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(p.amount)} {t("common.sum")}</span>
              </div>
            ))}
          </div>
        )}
        {s.leaveReason && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(255,61,90,.05)", border: "1px solid rgba(255,61,90,.15)" }}>
            <div style={{ fontSize: 11, color: "#ff3d5a", fontWeight: 700, marginBottom: 4 }}>{t("modals.viewStudent.leaveReason")}</div>
            <div style={{ fontSize: 12, color: "var(--t2)" }}>{s.leaveReason}</div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{s.leaveDate} · {t("modals.viewStudent.refund")}: {fmt(s.refund || 0)} {t("common.sum")}</div>
          </div>
        )}
      </div>
    </div>
  );
}
