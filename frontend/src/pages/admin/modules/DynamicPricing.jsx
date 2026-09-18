import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";
import { useToast } from "../../../context/ToastContext";
import { fmt } from "../../../utils/format";

export default function DynamicPricing() {
  const { t } = useTranslation();
  const { db } = useData();
  const { showToast } = useToast();
  const [coins, setCoins] = useState({});

  const earlyBird = db.groups.filter((g) => g.status === "waiting").slice(0, 3).map((g, i) => ({
    g, discount: i === 0 ? 10 : 0, priceUp: i !== 0,
  }));

  const redeem = (sid, amount) => {
    if ((coins[sid] || 0) < amount) { showToast(`⚠️ ${t("modules.pricing.notEnough")}`, "warning"); return; }
    setCoins((p) => ({ ...p, [sid]: (p[sid] || 0) - amount }));
    showToast(`✅ ${amount} ${t("modules.pricing.spent")}`, "success");
  };

  const earnCoin = (sid) => {
    setCoins((p) => ({ ...p, [sid]: (p[sid] || 0) + 10 }));
    showToast(`✅ 10 ${t("modules.pricing.earned")}`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="section-title">💸 {t("modules.pricing.title")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🐦 {t("modules.pricing.earlyBird")}</div>
          {earlyBird.map(({ g, discount, priceUp }) => {
            const course = db.courses.find((c) => c.id === g.courseId);
            return (
              <div key={g.id} style={{ padding: 14, borderRadius: 14, marginBottom: 12, background: "var(--bg3)", border: "1px solid var(--border2)" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{g.name}</div>
                {discount > 0 && course && (
                  <div style={{ fontSize: 12, color: "var(--t2)" }}>
                    <s>{fmt(course.price)}</s> → <strong style={{ color: "#00d68f" }}>{fmt(Math.round(course.price * (1 - discount / 100)))} {t("common.sum")}</strong>
                  </div>
                )}
                {priceUp && <div style={{ fontSize: 12, color: "#ff3d5a", fontWeight: 600 }}>⚠️ +15%</div>}
              </div>
            );
          })}
          {earlyBird.length === 0 && <div style={{ color: "var(--t3)", fontSize: 12 }}>{t("common.noData")}</div>}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🪙 {t("modules.pricing.loyalty")}</div>
          {db.students.filter((s) => s.status === "active").slice(0, 8).map((s) => {
            const c = coins[s.id] || 0;
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "#ffaa00", fontWeight: 700 }}>{c} coin</div>
                </div>
                <button className="btn btn-a btn-xs" disabled={c < 50} onClick={() => redeem(s.id, 50)}>-50🪙</button>
                <button className="btn btn-g btn-xs" onClick={() => earnCoin(s.id)}>+10🪙</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
