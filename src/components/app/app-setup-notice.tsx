import { Notice } from '../ui/notice'
import { hasFirebaseConfig, missingFirebaseKeys } from '../../lib/firebase'

export function AppSetupNotice() {
  if (hasFirebaseConfig) {
    return null
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <Notice tone="warning" title="Firebase setup is incomplete">
        <p>
          Authentication and Firestore features are running in setup-safe mode. Add the missing
          Vite variables to <code>.env</code> to enable the live backend.
        </p>
        <p className="mt-2">
          Missing keys: <code>{missingFirebaseKeys.join(', ')}</code>
        </p>
      </Notice>
    </div>
  )
}
