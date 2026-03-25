import type { UserRole } from '../../types/app'

export const roleGroups = {
  parent: ['parent'] as UserRole[],
  staff: ['staff'] as UserRole[],
  admin: ['admin'] as UserRole[],
  staffAdmin: ['staff', 'admin'] as UserRole[],
  all: ['parent', 'staff', 'admin'] as UserRole[],
} as const

export const roleHomeRoutes: Record<UserRole, string> = {
  parent: '/dashboard/parent',
  staff: '/dashboard/staff',
  admin: '/dashboard/admin',
}

export function getDefaultRouteForRole(role: UserRole | null | undefined): string {
  if (!role) {
    return '/login'
  }

  return roleHomeRoutes[role]
}
