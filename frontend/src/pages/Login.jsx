import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import Icon from "../components/Icon";

export default function Login() {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [loginVal, setLoginVal] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) navigate(user.role === "teacher" ? "/teacher" : "/admin", { replace: true });

  const submit = async () => {
    if (!loginVal || !pass) return;
    setBusy(true);
    setErr("");
    try {
      const u = await login(loginVal.trim(), pass);
      navigate(u.role === "teacher" ? "/teacher" : "/admin", { replace: true });
    } catch (e) {
      setErr(e.response?.data?.error || t("login.error"));
      setTimeout(() => setErr(""), 2500);
    } finally {
      setBusy(false);
    }
  };

  const testAccounts = [
    { r: t("login.admin"), l: "admin", p: "admin123" },
    { r: t("login.director"), l: "director", p: "dir123" },
    { r: t("login.teacherDilnoza"), l: "dilnoza", p: "tea123" },
  ];

  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg0)", position: "relative" }}>
      <div className="orb" style={{ width: 600, height: 600, top: "-10%", left: "-10%", background: "radial-gradient(circle,rgba(79,143,255,.12),transparent 70%)", animation: "orbPulse 18s ease-in-out infinite" }} />
      <div className="orb" style={{ width: 400, height: 400, bottom: "-5%", right: "-5%", background: "radial-gradient(circle,rgba(176,111,255,.1),transparent 70%)", animation: "orbPulse 22s ease-in-out infinite", animationDelay: "9s" }} />

      <div style={{ position: "absolute", top: 20, right: 24, zIndex: 2 }}>
        <LanguageSwitcher />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 420, padding: "0 20px" }}>
        <div className="modal ap" style={{ padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, margin: "0 auto 16px", background: "linear-gradient(135deg,#4f8fff,#7c6aff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#fff", boxShadow: "0 8px 30px rgba(79,143,255,.4)" }}>E</div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.03em", background: "linear-gradient(135deg,#7aaaff,#b06fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t("login.title")}
            </div>
            <div style={{ color: "var(--t3)", fontSize: 12, marginTop: 4 }}>{t("login.subtitle")}</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="lbl">{t("login.login")}</label>
            <input className="inp" value={loginVal} onChange={(e) => setLoginVal(e.target.value)}
              placeholder={t("login.loginPlaceholder")} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label className="lbl">{t("login.password")}</label>
            <div style={{ position: "relative" }}>
              <input className="inp" type={show ? "text" : "password"} value={pass}
                onChange={(e) => setPass(e.target.value)} placeholder={t("login.passwordPlaceholder")}
                onKeyDown={(e) => e.key === "Enter" && submit()} style={{ paddingRight: 44 }} />
              <button onClick={() => setShow((s) => !s)} type="button" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--t3)", cursor: "pointer", display: "flex" }}>
                <Icon n="eye" s={16} />
              </button>
            </div>
          </div>
          {err && <div style={{ color: "#ff3d5a", fontSize: 12, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>{err}</div>}

          <button className="btn btn-p" disabled={busy} style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 14, marginTop: 16 }} onClick={submit}>
            <Icon n="lock" s={16} /> {t("login.signIn")}
          </button>

          <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: "var(--bg1)", border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--t3)", fontSize: 11, fontWeight: 700, marginBottom: 8, letterSpacing: ".06em" }}>{t("login.testAccounts")}</div>
            {testAccounts.map((u, i) => (
              <div key={i} onClick={() => { setLoginVal(u.l); setPass(u.p); }} className="tr" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderRadius: 8, cursor: "pointer", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>{u.r}</span>
                <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'JetBrains Mono',monospace" }}>{u.l} / {u.p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
