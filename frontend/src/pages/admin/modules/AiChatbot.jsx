import { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "../../../components/Icon";

export default function AiChatbot() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([{ from: "bot", text: "Salom! Men EduCRM AI yordamchisiman. Sizga qanday yordam bera olaman?" }]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    const reply = { from: "bot", text: "Bu funksiya demo rejimida ishlaydi. Haqiqiy AI javoblari uchun backendga LLM integratsiyasi qo'shilishi kerak." };
    setMessages((p) => [...p, userMsg, reply]);
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
      <div className="section-title">🤖 {t("modules.aiChatbot.title")}</div>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, minHeight: 320 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.from === "bot" ? "flex-start" : "flex-end", maxWidth: "80%", padding: "10px 14px", borderRadius: 14, background: m.from === "bot" ? "var(--bg3)" : "rgba(79,143,255,.15)", fontSize: 13 }}>
            {m.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input className="inp" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("modules.aiChatbot.placeholder")} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button className="btn btn-p" onClick={send}><Icon n="sms" s={14} /> {t("common.send")}</button>
      </div>
    </div>
  );
}
