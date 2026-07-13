import { NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { LoginScreen } from "./features/auth/LoginScreen";
import { DashboardScreen } from "./features/dashboard/DashboardScreen";
import { StudentsScreen } from "./features/students/StudentsScreen";
import { StudentDetailScreen } from "./features/students/StudentDetailScreen";
import { StudentForm } from "./features/students/StudentForm";
import { ScheduleScreen } from "./features/lessons/ScheduleScreen";
import { LessonForm } from "./features/lessons/LessonForm";
import { PaymentsScreen } from "./features/payments/PaymentsScreen";
import { PaymentForm } from "./features/payments/PaymentForm";
import { StatementScreen } from "./features/statement/StatementScreen";
import { SettingsScreen } from "./features/settings/SettingsScreen";

const TABS = [
  { to: "/", label: "Today", icon: "◐", end: true },
  { to: "/students", label: "Students", icon: "❑", end: false },
  { to: "/schedule", label: "Schedule", icon: "▤", end: false },
  { to: "/payments", label: "Payments", icon: "❉", end: false },
  { to: "/settings", label: "Settings", icon: "⚙", end: false },
];

function TabBar() {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          <span className="tabbar__ic">{t.icon}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function App() {
  const { user, loading, requiresLogin } = useAuth();

  if (loading) {
    return <div className="login-wrap muted">Loading…</div>;
  }

  if (requiresLogin && !user) {
    return <LoginScreen />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardScreen />} />
        <Route path="/students" element={<StudentsScreen />} />
        <Route path="/students/new" element={<StudentForm />} />
        <Route path="/students/:id" element={<StudentDetailScreen />} />
        <Route path="/students/:id/edit" element={<StudentForm />} />
        <Route path="/students/:id/statement" element={<StatementScreen />} />
        <Route path="/schedule" element={<ScheduleScreen />} />
        <Route path="/lessons/new" element={<LessonForm />} />
        <Route path="/lessons/:id" element={<LessonForm />} />
        <Route path="/payments" element={<PaymentsScreen />} />
        <Route path="/payments/new" element={<PaymentForm />} />
        <Route path="/payments/:id" element={<PaymentForm />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<DashboardScreen />} />
      </Routes>
      <TabBar />
    </>
  );
}
