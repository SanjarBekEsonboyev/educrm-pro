import { useState } from "react";
import { useTranslation } from "react-i18next";
import { uid } from "../../../utils/format";
import Icon from "../../../components/Icon";

export default function InventorySklad() {
  const { t } = useTranslation();
  const [items, setItems] = useState([
    { id: "i1", name: "Proyektor", qty: 4, cat: "Texnika" },
    { id: "i2", name: "Doska markeri", qty: 32, cat: "Kantselyariya" },
    { id: "i3", name: "Kompyuter", qty: 10, cat: "Texnika" },
    { id: "i4", name: "Darslik (English A1)", qty: 60, cat: "Kitob" },
  ]);
  const [form, setForm] = useState({ name: "", qty: 1, cat: "Texnika" });

  const add = () => {
    if (!form.name) return;
    setItems((p) => [...p, { ...form, id: uid("i"), qty: Number(form.qty) || 1 }]);
    setForm({ name: "", qty: 1, cat: "Texnika" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">📦 {t("modules.inventory.title")}</div>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input className="inp" placeholder={t("common.name")} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <input className="inp" type="number" style={{ width: 100 }} value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} />
          <button className="btn btn-p" onClick={add}><Icon n="plus" s={14} /> {t("common.add")}</button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}><th className="th">{t("common.name")}</th><th className="th">Kategoriya</th><th className="th">Soni</th></tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="tr" style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="td">{it.name}</td>
                <td className="td"><span className="badge b-blue">{it.cat}</span></td>
                <td className="td" style={{ fontWeight: 700 }}>{it.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
