import { AuthBootstrap } from './features/auth/auth-bootstrap'
import { AppRouter } from './routes/app-router'

function App() {
  return (
    <>
      <AuthBootstrap />
      <AppRouter />
    </>
  )
}

export default App
