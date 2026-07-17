import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import { AppsManagerNavbar } from '@features/apps-manager/components/AppsManagerNavbar'
import {
  createAppsManagerWrapper,
  sampleTopbarLinks,
  stubMatchMedia,
} from '@features/apps-manager/test/apps-manager-test-utils'

const server = setupServer(
  http.get('*/api/v1/topbar-links/', () => HttpResponse.json(sampleTopbarLinks)),
)

const originalMatchMedia = window.matchMedia

describe('AppsManagerNavbar', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    localStorage.clear()
    vi.stubEnv('VITE_REMOTE_HOST', 'http://apps.example/')
  })
  afterEach(() => {
    server.resetHandlers()
    vi.unstubAllEnvs()
    window.matchMedia = originalMatchMedia
  })
  afterAll(() => server.close())

  function renderNavbar() {
    return render(<AppsManagerNavbar />, { wrapper: createAppsManagerWrapper() })
  }

  describe('desktop', () => {
    beforeEach(() => stubMatchMedia(() => false))

    it('shows brand and topbar links', async () => {
      renderNavbar()

      expect(screen.getByText('React Apps Manager')).toBeInTheDocument()
      expect(screen.getByText('Portfolio launcher')).toBeInTheDocument()

      expect(await screen.findByRole('link', { name: 'CV' })).toHaveAttribute(
        'href',
        sampleTopbarLinks.find((l) => l.key === 'cv')!.url,
      )
      expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    })

    it('navigates through the apps menu items', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Apps Manager' }))
      expect(screen.getByRole('menuitem', { name: 'All Apps' })).toHaveAttribute(
        'href',
        'http://apps.example/',
      )
      await user.click(screen.getByRole('menuitem', { name: 'All Apps' }))

      await user.click(await screen.findByRole('button', { name: 'Apps Manager' }))
      const reactApps = await screen.findByRole('menuitem', { name: 'React Apps' })
      expect(reactApps).toHaveAttribute('href', '/')
      await user.click(reactApps)
    })

    it('closes the apps menu on escape', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Apps Manager' }))
      expect(screen.getByRole('menuitem', { name: 'All Apps' })).toBeInTheDocument()

      await user.keyboard('{Escape}')
      await waitFor(() =>
        expect(
          screen.queryByRole('menuitem', { name: 'All Apps' }),
        ).not.toBeInTheDocument(),
      )
    })

    it('toggles the color scheme', async () => {
      const user = userEvent.setup()
      renderNavbar()

      const toggle = screen.getByRole('button', { name: /switch to dark mode/i })
      await user.click(toggle)
      expect(
        screen.getByRole('button', { name: /switch to light mode/i }),
      ).toBeInTheDocument()
    })

    it('falls back to the root host when VITE_REMOTE_HOST is unset', async () => {
      vi.stubEnv('VITE_REMOTE_HOST', '')
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Apps Manager' }))
      expect(screen.getByRole('menuitem', { name: 'All Apps' })).toHaveAttribute(
        'href',
        '/',
      )
    })

    it('opens and closes the search dialog', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Search' }))
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByRole('heading', { name: 'Search' })).toBeInTheDocument()

      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      )
    })
  })

  describe('mobile', () => {
    beforeEach(() => stubMatchMedia((query) => /max-width/.test(query)))

    it('navigates to All Apps from the nested menu', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Apps Manager' }))
      expect(await screen.findByRole('menuitem', { name: 'All Apps' })).toHaveAttribute(
        'href',
        'http://apps.example/',
      )
      await user.click(screen.getByRole('menuitem', { name: 'All Apps' }))

      expect(
        await screen.findByRole('button', { name: 'Open menu' }),
      ).toBeInTheDocument()
    })

    it('navigates to React Apps from the nested menu', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Apps Manager' }))
      await user.click(await screen.findByRole('menuitem', { name: 'React Apps' }))

      expect(
        await screen.findByRole('button', { name: 'Open menu' }),
      ).toBeInTheDocument()
    })

    it('closes the nested apps menu on escape', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Apps Manager' }))
      expect(await screen.findByRole('menuitem', { name: 'All Apps' })).toBeInTheDocument()

      await user.keyboard('{Escape}')
      await waitFor(() =>
        expect(
          screen.queryByRole('menuitem', { name: 'All Apps' }),
        ).not.toBeInTheDocument(),
      )
    })

    it('opens a topbar link and closes the menu', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      const github = await screen.findByRole('menuitem', { name: 'GitHub' })
      expect(github).toHaveAttribute('href', 'https://github.com/example')
      await user.click(github)

      expect(
        await screen.findByRole('button', { name: 'Open menu' }),
      ).toBeInTheDocument()
    })

    it('closes the menu on escape', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      expect(await screen.findByRole('menuitem', { name: 'Search' })).toBeInTheDocument()

      await user.keyboard('{Escape}')
      await waitFor(() =>
        expect(
          screen.queryByRole('menuitem', { name: 'Search' }),
        ).not.toBeInTheDocument(),
      )
    })

    it('toggles the color scheme from the mobile menu', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      await user.click(await screen.findByRole('menuitem', { name: /dark mode/i }))

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      expect(
        await screen.findByRole('menuitem', { name: /light mode/i }),
      ).toBeInTheDocument()
    })

    it('opens the search dialog from the mobile menu', async () => {
      const user = userEvent.setup()
      renderNavbar()

      await user.click(screen.getByRole('button', { name: 'Open menu' }))
      await user.click(await screen.findByRole('menuitem', { name: 'Search' }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
