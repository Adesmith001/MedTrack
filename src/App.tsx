import { AppSetupNotice } from './components/app/app-setup-notice'
import { AuthBootstrap } from './features/auth/auth-bootstrap'
import { AppRouter } from './routes/app-router'

function App() {
  return (
    <>
      <AuthBootstrap />
      <AppSetupNotice />
      <AppRouter />
    </>
  )
}

export default App
