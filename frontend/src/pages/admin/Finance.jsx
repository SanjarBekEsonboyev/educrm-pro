import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import { useModal } from "../../context/ModalContext";
import { ExpensesApi } from "../../api/endpoints";
import { fmt, fmtM, today, studentPrice } from "../../utils/format";
import Icon from "../../components/Icon";

export default function AdminFinance() {
  const { t } = useTranslation();
  const { db, refresh } = useData();
  const { showToast } = useToast();
  const { setModal } = useModal();
  const [tab, setTab] = useState("overview");
  const [expForm, setExpForm] = useState({ title: "", amount: "", cat: "rent", date: today() });

  const totalIncome = db.payments.reduce((s, p) => s + p.amount, 0);
  const totalExpense = db.expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalIncome - totalExpense;

  const addExpense = async () => {
    if (!expForm.title || !expForm.amount) { showToast(`⚠️ ${t("common.required")}`, "warning"); return; }
    await ExpensesApi.create({ ...expForm, amount: parseInt(expForm.amount, 10) });
    await refresh();
    showToast(`✅ ${t("finance.expenseAdded")}`, "success");
    setExpForm({ title: "", amount: "", cat: "rent", date: today() });
  };

  const catLabel = (v) => t(`finance.categories.${v}`, v);
  const catColors = { rent: "#4f8fff", utility: "#00c4d8", marketing: "#b06fff", salary: "#ffaa00", other: "var(--t3)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { l: t("finance.totalIncome"), v: totalIncome, c: "#00d68f", i: "💰" },
          { l: t("finance.totalExpense"), v: totalExpense, c: "#ff3d5a", i: "💸" },
          { l: t("finance.netProfit"), v: profit, c: profit >= 0 ? "#4f8fff" : "#ff3d5a", i: "📊" },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 80% 20%,${k.c}18,transparent 70%)`, pointerEvents: "none" }} />
            <div style={{ fontSize: 24, marginBottom: 10 }}>{k.i}</div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-.03em", color: k.c }}>{fmtM(k.v)}</div>
            <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>{k.l} · {t("common.sum")}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        {["overview", "payments", "expenses", "salary"].map((v) => (
          <button key={v} className={`tab-btn${tab === v ? " on" : ""}`} onClick={() => setTab(v)}>{t(`finance.tabs.${v}`)}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{t("finance.studentPayStatus")}</div>
            {db.students.filter((s) => s.status === "active").map((s) => {
              const course = db.courses.find((c) => c.id === s.courseId);
              const price = studentPrice(s, course);
              const pct = price ? Math.min(100, Math.round((s.paid / price) * 100)) : 0;
              const color = pct >= 100 ? "#00d68f" : pct > 0 ? "#ffaa00" : "#ff3d5a";
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${course?.color || "#4f8fff"}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: course?.color || "#7aaaff", flexShrink: 0 }}>{s.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
                      <span style={{ fontSize: 11, color, fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>{pct}%</span>
                    </div>
                    <div className="prog"><div className="prog-f" style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color}88,${color})` }} /></div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#00d68f", fontFamily: "'JetBrains Mono',monospace" }}>{fmt(s.paid)}</div>
                    {s.paid < price && <div style={{ fontSize: 10, color: "#ff3d5a", fontFamily: "'JetBrains Mono',monospace" }}>-{fmt(price - s.paid)}</div>}
                  </div>
                  <button className="btn btn-s btn-xs" onClick={() => setModal({ type: "payStudent", data: s })}>+{t("students.pay")}</button>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 13 }}>{t("finance.addExpense")}</div>
              <div style={{ marginBottom: 10 }}><label className="lbl">{t("finance.expenseTitle")}</label><input className="inp" value={expForm.title} onChange={(e) => setExpForm((p) => ({ ...p, title: e.target.value }))} /></div>
              <div style={{ marginBottom: 10 }}><label className="lbl">{t("common.amount")}</label><input className="inp" type="number" value={expForm.amount} onChange={(e) => setExpForm((p) => ({ ...p, amount: e.target.value }))} /></div>
              <div style={{ marginBottom: 10 }}><label className="lbl">{t("finance.category")}</label>
                <select className="inp" value={expForm.cat} onChange={(e) => setExpForm((p) => ({ ...p, cat: e.target.value }))}>
                  {["rent", "utility", "marketing", "salary", "other"].map((v) => <option key={v} value={v}>{catLabel(v)}</option>)}
                </select>
              </div>
              <button className="btn btn-p" style={{ width: "100%", justifyContent: "center" }} onClick={addExpense}>{t("common.add")}</button>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 13 }}>{t("finance.byCategory")}</div>
              {["rent", "utility", "marketing", "salary", "other"].map((v) => {
                const sum = db.expenses.filter((e) => e.cat === v).reduce((s, e) => s + e.amount, 0);
                if (!sum) return null;
                return (
                  <div key={v} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 12, color: "var(--t2)" }}>{catLabel(v)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: catColors[v] || "var(--t2)", fontFamily: "'JetBrains Mono',monospace" }}>{fmt(sum)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "payments" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{[t("common.date"), t("common.name"), t("common.amount"), t("common.note"), t("finance.receipt")].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {[...db.payments].reverse().map((p) => {
                const st = db.students.find((s) => s.id === p.studentId);
                return (
                  <tr key={p.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="td" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--t3)" }}>{p.date}</td>
                    <td className="td" style={{ fontWeight: 600, fontSize: 13 }}>{st?.name || "—"}</td>
                    <td className="td" style={{ color: "#00d68f", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>{fmt(p.amount)} {t("common.sum")}</td>
                    <td className="td" style={{ color: "var(--t2)", fontSize: 12 }}>{p.note}</td>
                    <td className="td"><button className="btn btn-g btn-xs" onClick={() => setModal({ type: "receipt", data: p, student: st })}><Icon n="receipt" s={12} /> {t("finance.receipt")}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "expenses" && (
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{[t("common.date"), t("finance.expenseTitle"), t("finance.category"), t("common.amount")].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {[...db.expenses].reverse().map((e) => (
                <tr key={e.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="td" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--t3)" }}>{e.date}</td>
                  <td className="td" style={{ fontWeight: 600, fontSize: 13 }}>{e.title}</td>
                  <td className="td"><span className="badge b-blue">{catLabel(e.cat)}</span></td>
                  <td className="td" style={{ color: "#ff3d5a", fontWeight: 700, fontFamily: "'JetBrains Mono',monospace" }}>-{fmt(e.amount)} {t("common.sum")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "salary" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {db.users.filter((u) => u.role === "teacher").map((tc) => {
            const myGroups = db.groups.filter((g) => g.teacherId === tc.id);
            const myStudents = db.students.filter((s) => myGroups.some((g) => g.id === s.groupId) && s.status === "active");
            const myPayments = db.payments.filter((p) => myStudents.some((s) => s.id === p.studentId));
            const totalPaid = myPayments.reduce((s, p) => s + p.amount, 0);
            const sal = tc.salary || { type: "fixed", value: 2000000 };
            const earned = sal.type === "fixed" ? sal.value : Math.round((totalPaid * sal.value) / 100);
            const myFines = db.fines.filter((f) => f.teacherId === tc.id);
            const totalFine = myFines.reduce((s, f) => s + f.amount, 0);
            const bonuses = tc.bonuses || 0;
            const net = earned + bonuses - totalFine;
            return (
              <div key={tc.id} className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: "linear-gradient(135deg,#b06fff,#7c6aff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{tc.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{tc.name}</div>
                  <div style={{ color: "var(--t3)", fontSize: 11, marginTop: 1 }}>
                    {sal.type === "fixed" ? `${t("teachers.fields.salaryFixed")}: ${fmt(sal.value)} ${t("common.sum")}` : `${sal.value}% · ${fmt(earned)} ${t("common.sum")}`}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  {[[t("finance.main"), earned, "#4f8fff"], [t("finance.bonus"), bonuses, "#00d68f"], [t("finance.fine"), totalFine, "#ff3d5a"], [t("finance.net"), net, net >= 0 ? "#00d68f" : "#ff3d5a"]].map((r, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: r[2], fontFamily: "'JetBrains Mono',monospace" }}>{fmt(r[1])}</div>
                      <div style={{ fontSize: 10, color: "var(--t3)" }}>{r[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
