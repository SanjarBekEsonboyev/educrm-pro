import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useModal } from "../context/ModalContext";
import Icon from "../components/Icon";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { todayFull, studentPrice, localeMap } from "../utils/format";

import PayStudentModal from "../components/modals/PayStudentModal";
import ReceiptModal from "../components/modals/ReceiptModal";
import LeaveStudentModal from "../components/modals/LeaveStudentModal";
import AddFineModal from "../components/modals/AddFineModal";
import ConfirmGroupModal from "../components/modals/ConfirmGroupModal";
import AddStudentModal from "../components/modals/AddStudentModal";
import ViewStudentModal from "../components/modals/ViewStudentModal";

const NAV = [
  { k: "dashboard", to: "/admin", end: true, n: "dash", roles: ["admin", "director"] },
  { k: "admissions", to: "/admin/admissions", n: "admit", roles: ["admin"] },
  { k: "groups", to: "/admin/groups", n: "groups", roles: ["admin", "director"] },
  { k: "students", to: "/admin/students", n: "users", roles: ["admin", "director"] },
  { k: "teachers", to: "/admin/teachers", n: "teacher", roles: ["admin", "director"] },
  { k: "courses", to: "/admin/courses", n: "course", roles: ["admin"] },
  { k: "attendance", to: "/admin/attendance", n: "attend", roles: ["admin", "director"] },
  { k: "schedule", to: "/admin/schedule", n: "schedule", roles: ["admin", "director"] },
  { k: "finance", to: "/admin/finance", n: "finance", roles: ["admin", "director"] },
  { k: "sms", to: "/admin/sms", n: "sms", roles: ["admin"] },
  { k: "reports", to: "/admin/reports", n: "report", roles: ["admin", "director"] },
  { k: "settings", to: "/admin/settings", n: "setting", roles: ["admin"] },
];

const NAV2 = [
  { k: "pipeline", to: "/admin/pipeline", n: "bolt", roles: ["admin"] },
  { k: "aiAnalytics", to: "/admin/ai-analytics", n: "report", roles: ["admin", "director"] },
  { k: "lms", to: "/admin/lms", n: "course", roles: ["admin", "director"] },
  { k: "inventory", to: "/admin/inventory", n: "money", roles: ["admin"] },
  { k: "auditLog", to: "/admin/audit-log", n: "warn", roles: ["admin", "director"] },
  { k: "parentPanel", to: "/admin/parent-panel", n: "users", roles: ["admin", "director"] },
  { k: "globalSearch", to: "/admin/global-search", n: "search", roles: ["admin", "director"] },
  { k: "taskManager", to: "/admin/tasks", n: "attend", roles: ["admin", "director"] },
  { k: "accounting", to: "/admin/accounting", n: "finance", roles: ["admin", "director"] },
  { k: "roomMgmt", to: "/admin/rooms", n: "schedule", roles: ["admin", "director"] },
  { k: "studentCab", to: "/admin/student-cabinet", n: "users", roles: ["admin", "director"] },
  { k: "aiChatbot", to: "/admin/ai-chatbot", n: "sms", roles: ["admin", "director"] },
  { k: "nps", to: "/admin/nps", n: "star", roles: ["admin", "director"] },
];

const NAV3 = [
  { k: "antiFraud", to: "/admin/anti-fraud", n: "warn", roles: ["admin", "director"] },
  { k: "smartMap", to: "/admin/smart-mapping", n: "groups", roles: ["admin", "director"] },
  { k: "psychLtv", to: "/admin/psych-ltv", n: "report", roles: ["admin", "director"] },
  { k: "marketing", to: "/admin/marketing", n: "sms", roles: ["admin"] },
  { k: "pricing", to: "/admin/pricing", n: "money", roles: ["admin"] },
  { k: "hr360", to: "/admin/hr360", n: "teacher", roles: ["admin", "director"] },
  { k: "bigdata", to: "/admin/bigdata", n: "bolt", roles: ["admin", "director"] },
];

const ALL_NAV = [...NAV, ...NAV2, ...NAV3];

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { db } = useData();
  const { modal, setModal } = useModal();
  const location = useLocation();

  const visible = (list) => list.filter((n) => n.roles.includes(user.role));
  const debtors = db.students.filter((s) => {
    if (s.status !== "active") return false;
    const course = db.courses.find((c) => c.id === s.courseId);
    return studentPrice(s, course) > s.paid;
  });

  const currentTitle = ALL_NAV.find((n) => location.pathname === n.to || (n.end && location.pathname === "/admin"))?.k;

  return (
    <div style={{ display: "flex", height: "100vh", position: "relative", zIndex: 1 }}>
      <aside style={{ width: 228, flexShrink: 0, borderRight: "1px solid var(--border)", background: "rgba(9,14,24,.95)", backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#4f8fff,#7c6aff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: "0 4px 14px rgba(79,143,255,.35)" }}>E</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: "-.02em", background: "linear-gradient(135deg,#7aaaff,#b06fff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("app.name")}</div>
              <div style={{ fontSize: 9, color: "var(--t3)", letterSpacing: ".06em", textTransform: "uppercase" }}>{t("app.edition")}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
          {[
            { label: t("nav.sectionMain"), items: visible(NAV) },
            { label: t("nav.sectionSales"), items: visible(NAV2) },
            { label: t("nav.sectionAdvanced"), items: visible(NAV3) },
          ].map(({ label, items }) => {
            if (!items.length) return null;
            return (
              <div key={label}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", color: "var(--t4)", textTransform: "uppercase", padding: "10px 14px 4px" }}>{label}</div>
                {items.map(({ k, to, end, n }) => (
                  <NavLink key={k} to={to} end={end} className={({ isActive }) => `nav-btn${isActive ? " on" : ""}`}>
                    <Icon n={n} s={17} /><span style={{ fontSize: 12 }}>{t(`nav.${k}`)}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "8px 10px", borderRadius: 10, background: "var(--bg3)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#4f8fff,#7c6aff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{user.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "var(--t3)", textTransform: "capitalize" }}>{user.role}</div>
            </div>
          </div>
          <button className="btn btn-g btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>
            <Icon n="logout" s={14} /> {t("common.logout")}
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ padding: "13px 24px", borderBottom: "1px solid var(--border)", background: "rgba(9,14,24,.9)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.02em" }}>
            {currentTitle ? t(`nav.${currentTitle}`) : t("nav.dashboard")}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LanguageSwitcher />
            {debtors.length > 0 && user.role === "admin" && (
              <NavLink to="/admin/sms" className="btn btn-a btn-sm">
                <Icon n="warn" s={14} /> {t("header.debtors", { count: debtors.length })}
              </NavLink>
            )}
            <div style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(0,214,143,.08)", color: "#00d68f", fontSize: 11, fontWeight: 700, border: "1px solid rgba(0,214,143,.15)" }}>
              🟢 {todayFull(localeMap[i18n.resolvedLanguage] || "uz-UZ")}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <Outlet />
        </main>
      </div>

      {modal?.type === "receipt" && <ReceiptModal />}
      {modal?.type === "leaveStudent" && <LeaveStudentModal />}
      {modal?.type === "payStudent" && <PayStudentModal />}
      {modal?.type === "addFine" && <AddFineModal />}
      {modal?.type === "confirmGroup" && <ConfirmGroupModal />}
      {modal?.type === "addStudent" && <AddStudentModal />}
      {modal?.type === "viewStudent" && <ViewStudentModal />}
    </div>
  );
}
