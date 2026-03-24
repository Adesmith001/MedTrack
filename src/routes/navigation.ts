export interface NavigationItem {
  label: string
  to: string
}

export const publicNavigation: NavigationItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
]

export const workspaceNavigation: NavigationItem[] = [
  { label: 'Parent Dashboard', to: '/dashboard/parent' },
  { label: 'Staff Dashboard', to: '/dashboard/staff' },
  { label: 'Admin Dashboard', to: '/dashboard/admin' },
  { label: 'Children', to: '/children' },
  { label: 'Immunization Schedule', to: '/immunization-schedule' },
  { label: 'Reminders', to: '/reminders' },
  { label: 'Admin', to: '/admin' },
]
