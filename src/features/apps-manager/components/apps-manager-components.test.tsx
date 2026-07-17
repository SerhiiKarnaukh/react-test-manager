import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { expect } from 'vitest'
import { AppCard } from '@features/apps-manager/components/AppCard'
import { AppsManagerFooter } from '@features/apps-manager/components/AppsManagerFooter'
import { SearchDialog } from '@features/apps-manager/components/SearchDialog'
import {
  createAppsManagerWrapper,
  sampleApp,
} from '@features/apps-manager/test/apps-manager-test-utils'

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname + location.search}</div>
}

describe('AppCard', () => {
  it('renders title, image and both action links', () => {
    render(<AppCard application={sampleApp} />, {
      wrapper: createAppsManagerWrapper(),
    })

    expect(screen.getByRole('heading', { name: sampleApp.title })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: sampleApp.title })).toHaveAttribute(
      'src',
      sampleApp.photo,
    )
    expect(screen.getByRole('link', { name: /description/i })).toHaveAttribute(
      'href',
      sampleApp.url,
    )
    expect(screen.getByRole('link', { name: /view app/i })).toHaveAttribute(
      'href',
      sampleApp.view_url,
    )
  })
})

describe('AppsManagerFooter', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('renders links and the current year', () => {
    vi.stubEnv('VITE_REMOTE_HOST', 'http://apps.example/')

    render(<AppsManagerFooter />, { wrapper: createAppsManagerWrapper() })

    expect(screen.getByRole('link', { name: 'All Apps' })).toHaveAttribute(
      'href',
      'http://apps.example/',
    )
    expect(screen.getByRole('link', { name: 'React Apps' })).toHaveAttribute('href', '/')
    expect(screen.getByText('React Apps Manager').closest('p')).toHaveTextContent(
      String(new Date().getFullYear()),
    )
  })

  it('falls back to "/" when VITE_REMOTE_HOST is not set', () => {
    vi.stubEnv('VITE_REMOTE_HOST', '')

    render(<AppsManagerFooter />, { wrapper: createAppsManagerWrapper() })

    expect(screen.getByRole('link', { name: 'All Apps' })).toHaveAttribute('href', '/')
  })
})

describe('SearchDialog', () => {
  function renderDialog(onClose = vi.fn()) {
    render(
      <>
        <SearchDialog open onClose={onClose} />
        <Routes>
          <Route path="*" element={<LocationDisplay />} />
        </Routes>
      </>,
      { wrapper: createAppsManagerWrapper() },
    )
    return onClose
  }

  it('navigates, closes and resets the query on search', async () => {
    const user = userEvent.setup()
    const onClose = renderDialog()

    await user.type(screen.getByRole('textbox'), 'taberna')
    await user.click(screen.getByRole('button', { name: 'Search' }))

    expect(onClose).toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/apps_manager/search?query=taberna',
    )
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('disables search for empty input and supports Enter key', async () => {
    const user = userEvent.setup()
    const onClose = renderDialog()

    expect(screen.getByRole('button', { name: 'Search' })).toBeDisabled()

    await user.type(screen.getByRole('textbox'), 'apps{Enter}')
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/apps_manager/search?query=apps',
    )
  })

  it('ignores whitespace-only searches', async () => {
    const user = userEvent.setup()
    const onClose = renderDialog()

    await user.type(screen.getByRole('textbox'), '   {Enter}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on cancel', async () => {
    const user = userEvent.setup()
    const onClose = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })
})
