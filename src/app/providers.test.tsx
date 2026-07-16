import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { expect } from 'vitest'
import { Providers } from '@app/providers'
import { StubPage } from '@shared/ui/StubPage'

describe('App shell smoke', () => {
  it('renders a stub page inside Providers', () => {
    const router = createMemoryRouter(
      [{ path: '/', element: <StubPage title="Applications Manager" /> }],
      { initialEntries: ['/'] },
    )

    render(
      <Providers>
        <RouterProvider router={router} />
      </Providers>,
    )

    expect(
      screen.getByRole('heading', { name: 'Applications Manager' }),
    ).toBeInTheDocument()
  })
})
