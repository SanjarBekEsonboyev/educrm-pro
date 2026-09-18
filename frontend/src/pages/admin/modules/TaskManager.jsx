import { useState } from "react";
import { useTranslation } from "react-i18next";
import { uid } from "../../../utils/format";
import Icon from "../../../components/Icon";

export default function TaskManager() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([
    { id: "tk1", text: "Yangi guruh uchun xona band qilish", done: false },
    { id: "tk2", text: "Iyun oyi uchun reklama byudjetini tasdiqlash", done: false },
    { id: "tk3", text: "Dilnoza bilan uchrashuv", done: true },
  ]);
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    setTasks((p) => [{ id: uid("tk"), text, done: false }, ...p]);
    setText("");
  };
  const toggle = (id) => setTasks((p) => p.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id) => setTasks((p) => p.filter((x) => x.id !== id));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="section-title">✅ {t("modules.taskManager.title")}</div>
      <div className="card" style={{ padding: 20, maxWidth: 640 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <input className="inp" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("modules.taskManager.placeholder")} onKeyDown={(e) => e.key === "Enter" && add()} />
          <button className="btn btn-p" onClick={add}><Icon n="plus" s={14} /> {t("modules.taskManager.addTask")}</button>
        </div>
        {tasks.map((tk) => (
          <div key={tk.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
            <input type="checkbox" checked={tk.done} onChange={() => toggle(tk.id)} />
            <span style={{ flex: 1, fontSize: 13, textDecoration: tk.done ? "line-through" : "none", color: tk.done ? "var(--t3)" : "var(--t1)" }}>{tk.text}</span>
            <button className="btn btn-g btn-xs btn-ic" onClick={() => remove(tk.id)}><Icon n="trash" s={12} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
