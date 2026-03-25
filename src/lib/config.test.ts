import { resolveFirebaseWebConfig } from './config'

describe('config', () => {
  it('reports missing Firebase env keys clearly', () => {
    const resolution = resolveFirebaseWebConfig({
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_AUTH_DOMAIN: '',
      VITE_FIREBASE_PROJECT_ID: undefined,
      VITE_FIREBASE_STORAGE_BUCKET: 'bucket',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '',
      VITE_FIREBASE_APP_ID: 'app-id',
    })

    expect(resolution.isReady).toBe(false)
    expect(resolution.missingKeys).toEqual([
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
    ])
    expect(resolution.message).toContain('Firebase web configuration is incomplete')
  })

  it('returns a ready config when all required env values are present', () => {
    const resolution = resolveFirebaseWebConfig({
      VITE_FIREBASE_API_KEY: 'api-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'project.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'project-id',
      VITE_FIREBASE_STORAGE_BUCKET: 'project.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '123',
      VITE_FIREBASE_APP_ID: 'app-id',
    })

    expect(resolution.isReady).toBe(true)
    expect(resolution.missingKeys).toEqual([])
    expect(resolution.config.projectId).toBe('project-id')
  })
})
