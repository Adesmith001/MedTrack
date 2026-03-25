import type { UserRole } from '../types/app'
import { roleGroups } from '../lib/auth/roles'

export interface NavigationItem {
  label: string
  to: string
  roles?: UserRole[]
}

export const publicNavigation: NavigationItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
  { label: 'Forgot Password', to: '/forgot-password' },
]

export const workspaceNavigation: NavigationItem[] = [
  { label: 'Parent Dashboard', to: '/dashboard/parent', roles: roleGroups.parent },
  { label: 'Staff Dashboard', to: '/dashboard/staff', roles: roleGroups.staff },
  { label: 'Admin Dashboard', to: '/dashboard/admin', roles: roleGroups.admin },
  { label: 'Children', to: '/children', roles: roleGroups.all },
  {
    label: 'Immunization Schedule',
    to: '/immunization-schedule',
    roles: roleGroups.all,
  },
  { label: 'Reminders', to: '/reminders', roles: roleGroups.staffAdmin },
  { label: 'Admin', to: '/admin', roles: roleGroups.admin },
]
