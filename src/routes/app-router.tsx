import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/app-shell'
import { ChildrenPage } from '../pages/children-page'
import { DashboardPage } from '../pages/dashboard-page'
import { NotFoundPage } from '../pages/not-found-page'
import { RemindersPage } from '../pages/reminders-page'
import { ReportsPage } from '../pages/reports-page'
import { SchedulePage } from '../pages/schedule-page'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate replace to="/dashboard" />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/children" element={<ChildrenPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
