import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Icon";
import LanguageSwitcher from "../components/LanguageSwitcher";

const NAV = [
  { k: "myDash", to: "/teacher", end: true, n: "dash" },
  { k: "myAttend", to: "/teacher/attendance", n: "attend" },
  { k: "mySchedule", to: "/teacher/schedule", n: "schedule" },
  { k: "myStudents", to: "/teacher/students", n: "users" },
];

export default function TeacherLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative", zIndex: 1 }}>
      <aside style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", background: "rgba(9,14,24,.95)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 14px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#4f8fff,#7c6aff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
              {user.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--t1)" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>{t("common.teacher")}</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ k, to, end, n }) => (
            <NavLink key={k} to={to} end={end} className={({ isActive }) => `nav-btn${isActive ? " on" : ""}`}>
              <Icon n={n} s={17} /><span style={{ fontSize: 13 }}>{t(`nav.${k}`)}</span>
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10 }}>
          <LanguageSwitcher />
          <button className="btn btn-g btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>
            <Icon n="logout" s={15} /> {t("common.logout")}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        <Outlet />
      </main>
    </div>
  );
}
