import { useTranslation } from "react-i18next";
import { useData } from "../../../context/DataContext";

export default function SmartMapping() {
  const { t } = useTranslation();
  const { db } = useData();

  const byArea = {};
  db.students.forEach((s) => {
    const prefix = (s.phone || "").slice(0, 7);
    byArea[prefix] = (byArea[prefix] || 0) + 1;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">🗺️ {t("modules.smartMap.title")}</div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 14 }}>Phone-prefix based student density (demo heuristic)</div>
        {Object.entries(byArea).sort((a, b) => b[1] - a[1]).map(([prefix, count]) => (
          <div key={prefix} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{prefix}xxxxx</span>
            <span style={{ fontWeight: 700, color: "#4f8fff" }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
