import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { ToastProvider } from "./context/ToastContext";
import { ModalProvider } from "./context/ModalContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import TeacherLayout from "./layouts/TeacherLayout";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminAdmissions from "./pages/admin/Admissions";
import AdminGroups from "./pages/admin/Groups";
import AdminStudents from "./pages/admin/Students";
import AdminTeachers from "./pages/admin/Teachers";
import AdminCourses from "./pages/admin/Courses";
import AdminAttendance from "./pages/admin/Attendance";
import AdminSchedule from "./pages/admin/Schedule";
import AdminFinance from "./pages/admin/Finance";
import AdminSms from "./pages/admin/Sms";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";

import SalesPipeline from "./pages/admin/modules/SalesPipeline";
import AiAnalytics from "./pages/admin/modules/AiAnalytics";
import LmsAcademic from "./pages/admin/modules/LmsAcademic";
import InventorySklad from "./pages/admin/modules/InventorySklad";
import AuditLog from "./pages/admin/modules/AuditLog";
import ParentPanel from "./pages/admin/modules/ParentPanel";
import GlobalSearch from "./pages/admin/modules/GlobalSearch";
import TaskManager from "./pages/admin/modules/TaskManager";
import Accounting from "./pages/admin/modules/Accounting";
import RoomManagement from "./pages/admin/modules/RoomManagement";
import StudentCabinet from "./pages/admin/modules/StudentCabinet";
import AiChatbot from "./pages/admin/modules/AiChatbot";
import NpsQuality from "./pages/admin/modules/NpsQuality";
import AntiFraudAi from "./pages/admin/modules/AntiFraudAi";
import SmartMapping from "./pages/admin/modules/SmartMapping";
import PsychologyLtv from "./pages/admin/modules/PsychologyLtv";
import MarketingAuto from "./pages/admin/modules/MarketingAuto";
import DynamicPricing from "./pages/admin/modules/DynamicPricing";
import Hr360 from "./pages/admin/modules/Hr360";
import BigDataDashboard from "./pages/admin/modules/BigDataDashboard";

import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherSchedule from "./pages/teacher/Schedule";
import TeacherStudents from "./pages/teacher/Students";

function RootRedirect() {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "teacher" ? "/teacher" : "/admin"} replace />;
}

function AppShell() {
  return (
    <DataProvider>
      <ModalProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute roles={["admin", "director"]}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="groups" element={<AdminGroups />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="sms" element={<AdminSms />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />

            <Route path="pipeline" element={<SalesPipeline />} />
            <Route path="ai-analytics" element={<AiAnalytics />} />
            <Route path="lms" element={<LmsAcademic />} />
            <Route path="inventory" element={<InventorySklad />} />
            <Route path="audit-log" element={<AuditLog />} />
            <Route path="parent-panel" element={<ParentPanel />} />
            <Route path="global-search" element={<GlobalSearch />} />
            <Route path="tasks" element={<TaskManager />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="student-cabinet" element={<StudentCabinet />} />
            <Route path="ai-chatbot" element={<AiChatbot />} />
            <Route path="nps" element={<NpsQuality />} />
            <Route path="anti-fraud" element={<AntiFraudAi />} />
            <Route path="smart-mapping" element={<SmartMapping />} />
            <Route path="psych-ltv" element={<PsychologyLtv />} />
            <Route path="marketing" element={<MarketingAuto />} />
            <Route path="pricing" element={<DynamicPricing />} />
            <Route path="hr360" element={<Hr360 />} />
            <Route path="bigdata" element={<BigDataDashboard />} />
          </Route>

          <Route path="/teacher" element={<ProtectedRoute roles={["teacher"]}><TeacherLayout /></ProtectedRoute>}>
            <Route index element={<TeacherDashboard />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="schedule" element={<TeacherSchedule />} />
            <Route path="students" element={<TeacherStudents />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ModalProvider>
    </DataProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
