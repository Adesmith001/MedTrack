import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import { auth } from '../../lib/firebase'
import { useAppDispatch } from '../../hooks/redux'
import { usersService } from '../../services/users-service'
import { logoutUser } from '../../services/auth-service'
import { authSyncCompleted, authSyncFailed, authSyncStarted } from './auth-slice'

export function AuthBootstrap() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!auth) {
      dispatch(authSyncCompleted({ user: null, profile: null }))
      return undefined
    }

    dispatch(authSyncStarted())

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(authSyncCompleted({ user: null, profile: null }))
        return
      }

      try {
        const profile = await usersService.getByUid(firebaseUser.uid)

        if (!profile) {
          await logoutUser()
          dispatch(authSyncFailed('Your user profile could not be found. Please contact an administrator.'))
          return
        }

        dispatch(
          authSyncCompleted({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            },
            profile,
          }),
        )
      } catch (error) {
        dispatch(
          authSyncFailed(
            error instanceof Error ? error.message : 'Unable to verify your authentication state.',
          ),
        )
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  return null
}
