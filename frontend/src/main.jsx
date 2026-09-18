import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <>
      <div className="orb" style={{ width: 700, height: 700, top: "-20%", left: "-15%", background: "radial-gradient(circle,rgba(79,143,255,.1),transparent 70%)", animation: "orbPulse 20s ease-in-out infinite" }} />
      <div className="orb" style={{ width: 500, height: 500, top: "50%", right: "-10%", background: "radial-gradient(circle,rgba(124,106,255,.08),transparent 70%)", animation: "orbPulse 25s ease-in-out infinite", animationDelay: "8s" }} />
      <div className="orb" style={{ width: 400, height: 400, bottom: "-10%", left: "35%", background: "radial-gradient(circle,rgba(0,214,143,.06),transparent 70%)", animation: "orbPulse 30s ease-in-out infinite", animationDelay: "15s" }} />
      <App />
    </>
  </React.StrictMode>
);
