import type { UserProfile, Child } from '../../types/models'

export function canManageChildren(profile: UserProfile | null): boolean {
  return profile?.role === 'staff' || profile?.role === 'admin'
}

export function canViewChild(profile: UserProfile | null, child: Child): boolean {
  if (!profile) {
    return false
  }

  if (canManageChildren(profile)) {
    return true
  }

  return profile.role === 'parent' && child.parentEmail.toLowerCase() === profile.email.toLowerCase()
}

export function getVisibleChildren(profile: UserProfile | null, children: Child[]): Child[] {
  if (!profile) {
    return []
  }

  if (canManageChildren(profile)) {
    return children
  }

  return children.filter((child) => canViewChild(profile, child))
}
