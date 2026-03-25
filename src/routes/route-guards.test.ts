import {
  getProtectedRouteDecision,
  getPublicOnlyRouteDecision,
} from './route-guards'
import type { UserProfile } from '../types/models'

const parentProfile: UserProfile = {
  id: 'user_1',
  uid: 'user_1',
  fullName: 'Parent User',
  email: 'parent@example.com',
  role: 'parent',
  createdAt: null,
  updatedAt: null,
}

describe('route-guards', () => {
  it('keeps protected routes in loading until auth initializes', () => {
    expect(
      getProtectedRouteDecision({
        isInitialized: false,
        isAuthenticated: false,
        pathname: '/children',
        profile: null,
      }),
    ).toEqual({ type: 'loading' })
  })

  it('redirects unauthenticated users to login with the requested path', () => {
    expect(
      getProtectedRouteDecision({
        isInitialized: true,
        isAuthenticated: false,
        pathname: '/children',
        profile: null,
      }),
    ).toEqual({
      type: 'redirect',
      to: '/login',
      state: { from: '/children' },
    })
  })

  it('redirects authenticated users away from routes outside their role', () => {
    expect(
      getProtectedRouteDecision({
        isInitialized: true,
        isAuthenticated: true,
        pathname: '/dashboard/admin',
        profile: parentProfile,
        allowedRoles: ['admin'],
      }),
    ).toEqual({
      type: 'redirect',
      to: '/dashboard/parent',
    })
  })

  it('allows valid protected and public-only access', () => {
    expect(
      getProtectedRouteDecision({
        isInitialized: true,
        isAuthenticated: true,
        pathname: '/children',
        profile: parentProfile,
        allowedRoles: ['parent'],
      }),
    ).toEqual({ type: 'allow' })

    expect(
      getPublicOnlyRouteDecision({
        isInitialized: true,
        isAuthenticated: false,
        role: null,
      }),
    ).toEqual({ type: 'allow' })
  })

  it('redirects authenticated users away from public-only routes', () => {
    expect(
      getPublicOnlyRouteDecision({
        isInitialized: true,
        isAuthenticated: true,
        role: 'parent',
      }),
    ).toEqual({
      type: 'redirect',
      to: '/dashboard/parent',
    })
  })
})
