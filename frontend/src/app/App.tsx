import { AuthProvider } from '@/features/auth/auth-context'
import { FimsProvider } from '@/features/data/fims-store'
import { AppRouter } from '@/app/router'

export function App() {
  return (
    <AuthProvider>
      <FimsProvider>
        <AppRouter />
      </FimsProvider>
    </AuthProvider>
  )
}
