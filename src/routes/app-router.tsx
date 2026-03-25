import { Route, Routes } from 'react-router-dom'
import { PublicShell } from '../components/layout/public-shell'
import { WorkspaceShell } from '../components/layout/workspace-shell'
import { roleGroups } from '../lib/auth/roles'
import { PublicOnlyRoute } from './public-only-route'
import { ProtectedRoute } from './protected-route'
import { ForgotPasswordPage } from '../pages/auth/forgot-password-page'
import { LoginPage } from '../pages/auth/login-page'
import { RegisterPage } from '../pages/auth/register-page'
import { ResetPasswordPage } from '../pages/auth/reset-password-page'
import { AdminPage } from '../pages/admin-page'
import { AddChildPage } from '../pages/children/add-child-page'
import { ChildDetailsPage } from '../pages/children/child-details-page'
import { EditChildPage } from '../pages/children/edit-child-page'
import { ChildrenPage } from '../pages/children-page'
import { AdminDashboardPage } from '../pages/dashboards/admin-dashboard-page'
import { DashboardRedirect } from '../pages/dashboards/dashboard-redirect'
import { ParentDashboardPage } from '../pages/dashboards/parent-dashboard-page'
import { StaffDashboardPage } from '../pages/dashboards/staff-dashboard-page'
import { NotFoundPage } from '../pages/not-found-page'
import { HomePage } from '../pages/public/home-page'
import { ReportsPage } from '../pages/reports-page'
import { RemindersPage } from '../pages/reminders-page'
import { SchedulePage } from '../pages/schedule-page'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route element={<PublicShell />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<WorkspaceShell />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route element={<ProtectedRoute allowedRoles={roleGroups.parent} />}>
            <Route path="/dashboard/parent" element={<ParentDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={roleGroups.staff} />}>
            <Route path="/dashboard/staff" element={<StaffDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={roleGroups.admin} />}>
            <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={roleGroups.all} />}>
            <Route path="/children" element={<ChildrenPage />} />
            <Route path="/children/:childId" element={<ChildDetailsPage />} />
            <Route path="/immunization-schedule" element={<SchedulePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={roleGroups.staffAdmin} />}>
            <Route path="/children/new" element={<AddChildPage />} />
            <Route path="/children/:childId/edit" element={<EditChildPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
