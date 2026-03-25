export const requiredFirebaseEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

export type FirebaseEnvKey = (typeof requiredFirebaseEnvKeys)[number]

export interface FirebaseWebConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

type EnvSource = Partial<Record<FirebaseEnvKey | 'MODE', string | undefined>>

export interface FirebaseConfigResolution {
  config: FirebaseWebConfig
  missingKeys: FirebaseEnvKey[]
  isReady: boolean
  message: string
}

function coerceEnvValue(value: string | undefined): string {
  return value?.trim() ?? ''
}

export function resolveFirebaseWebConfig(env: EnvSource): FirebaseConfigResolution {
  const config: FirebaseWebConfig = {
    apiKey: coerceEnvValue(env.VITE_FIREBASE_API_KEY),
    authDomain: coerceEnvValue(env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: coerceEnvValue(env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: coerceEnvValue(env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: coerceEnvValue(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: coerceEnvValue(env.VITE_FIREBASE_APP_ID),
  }

  const missingKeys = requiredFirebaseEnvKeys.filter((key) => !coerceEnvValue(env[key]))

  return {
    config,
    missingKeys,
    isReady: missingKeys.length === 0,
    message:
      missingKeys.length === 0
        ? 'Firebase web configuration is available.'
        : `Firebase web configuration is incomplete. Add ${missingKeys.join(', ')} to your .env file.`,
  }
}
