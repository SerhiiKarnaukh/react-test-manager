import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { expect, vi } from 'vitest'
import { SocialLoginPage } from '@features/social/profiles/pages/SocialLoginPage'
import { meKey } from '@features/social/profiles/hooks/useProfile'

vi.mock('@shared/components/LoginPage', () => ({
  LoginPage: ({
    onLoginSuccess,
  }: {
    onLoginSuccess?: () => Promise<void> | void
  }) => (
    <button type="button" onClick={() => void onLoginSuccess?.()}>
      Finish login
    </button>
  ),
}))

describe('SocialLoginPage', () => {
  it('invalidates me query after login success', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <SocialLoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Finish login' }))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: meKey })
  })
})
