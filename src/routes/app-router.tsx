import { Navigate, Route, Routes } from 'react-router-dom'
import { PublicShell } from '../components/layout/public-shell'
import { WorkspaceShell } from '../components/layout/workspace-shell'
import { ForgotPasswordPage } from '../pages/auth/forgot-password-page'
import { LoginPage } from '../pages/auth/login-page'
import { RegisterPage } from '../pages/auth/register-page'
import { AdminPage } from '../pages/admin-page'
import { ChildrenPage } from '../pages/children-page'
import { AdminDashboardPage } from '../pages/dashboards/admin-dashboard-page'
import { ParentDashboardPage } from '../pages/dashboards/parent-dashboard-page'
import { StaffDashboardPage } from '../pages/dashboards/staff-dashboard-page'
import { NotFoundPage } from '../pages/not-found-page'
import { HomePage } from '../pages/public/home-page'
import { RemindersPage } from '../pages/reminders-page'
import { SchedulePage } from '../pages/schedule-page'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<WorkspaceShell />}>
        <Route path="/dashboard/parent" element={<ParentDashboardPage />} />
        <Route path="/dashboard/staff" element={<StaffDashboardPage />} />
        <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
        <Route path="/children" element={<ChildrenPage />} />
        <Route path="/immunization-schedule" element={<SchedulePage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route path="/dashboard" element={<Navigate replace to="/dashboard/parent" />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
