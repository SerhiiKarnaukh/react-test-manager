import { useQueryClient } from '@tanstack/react-query'
import { LoginPage } from '@shared/components/LoginPage'
import { meKey } from '@features/social/profiles/hooks/useProfile'

export function SocialLoginPage() {
  const queryClient = useQueryClient()

  return (
    <LoginPage
      app="social"
      signupPath="/social/signup"
      defaultRedirect="/social/home"
      onLoginSuccess={async () => {
        await queryClient.invalidateQueries({ queryKey: meKey })
      }}
    />
  )
}
