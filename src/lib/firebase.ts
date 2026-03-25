import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { resolveFirebaseWebConfig } from './config'

const firebaseResolution = resolveFirebaseWebConfig(import.meta.env)
const firebaseConfig = firebaseResolution.config

export const missingFirebaseKeys = firebaseResolution.missingKeys
export const hasFirebaseConfig = firebaseResolution.isReady
export const firebaseSetupMessage = firebaseResolution.message

const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null

export { firebaseApp }
export const auth = firebaseApp ? getAuth(firebaseApp) : null
export const firestore = firebaseApp ? getFirestore(firebaseApp) : null
export const functions = firebaseApp ? getFunctions(firebaseApp, 'us-central1') : null
