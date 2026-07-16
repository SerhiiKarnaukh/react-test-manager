import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { RequireAuth } from '@router/require-auth'

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({
      access: null,
      refresh: null,
      activeApp: null,
    })
  })

  it('redirects unauthenticated Taberna users to login with redirect param', () => {
    const router = createMemoryRouter(
      [
        {
          path: '/taberna/dashboard',
          element: (
            <RequireAuth app="taberna">
              <div>Secret</div>
            </RequireAuth>
          ),
        },
        { path: '/taberna/login', element: <div>Login page</div> },
      ],
      { initialEntries: ['/taberna/dashboard'] },
    )

    render(<RouterProvider router={router} />)

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/taberna/login')
    expect(router.state.location.search).toContain('message=auth')
    expect(router.state.location.search).toContain(
      encodeURIComponent('/taberna/dashboard'),
    )
  })

  it('renders children when authenticated', () => {
    useAuthStore.setState({ access: 'token', refresh: 'r', activeApp: 'social' })

    const router = createMemoryRouter(
      [
        {
          path: '/social/chat',
          element: (
            <RequireAuth app="social">
              <div>Chat</div>
            </RequireAuth>
          ),
        },
      ],
      { initialEntries: ['/social/chat'] },
    )

    render(<RouterProvider router={router} />)
    expect(screen.getByText('Chat')).toBeInTheDocument()
  })
})
