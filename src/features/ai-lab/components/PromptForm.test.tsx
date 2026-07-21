import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { PromptForm } from '@features/ai-lab/components/PromptForm'
import { aiLabTheme } from '@features/ai-lab/ai-lab.theme'
import { createTestClient } from '@features/ai-lab/test/ai-lab-test-utils'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

let isReady = false
const connectMock = vi.fn(async () => {
  isReady = false
})
const sendMessageMock = vi.fn()

vi.mock('@features/ai-lab/hooks/useAiLabRealtime', () => ({
  useAiLabRealtime: () => ({
    connect: connectMock,
    disconnect: vi.fn(),
    sendMessage: sendMessageMock,
    isReady: () => isReady,
  }),
}))

function renderPromptForm(path = '/ai-lab/realtime-chat') {
  const client = createTestClient()
  return render(<PromptForm />, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>
        <ThemeProvider theme={aiLabTheme}>
          <CssBaseline />
          <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    ),
  })
}

const server = setupServer(
  http.post('*/ai-lab/image-generator/', () =>
    HttpResponse.json({ message: 'https://img.test/generated.png' }),
  ),
  http.post('*/ai-lab/voice-generator/', () =>
    HttpResponse.json({ message: 'https://audio.test/voice.mp3' }),
  ),
)

describe('PromptForm edge cases', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  afterEach(() => {
    isReady = false
    connectMock.mockClear()
    sendMessageMock.mockClear()
  })

  it('does not send realtime message when socket stays unavailable', async () => {
    renderPromptForm()

    await userEvent.type(screen.getByLabelText('Prompt'), 'hello')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Me' }))

    await waitFor(() => {
      expect(connectMock).toHaveBeenCalled()
    })
    expect(sendMessageMock).not.toHaveBeenCalled()
  })

  it('does not submit on Shift+Enter', async () => {
    renderPromptForm('/ai-lab')

    const input = screen.getByLabelText('Prompt')
    await userEvent.type(input, 'line break')
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}')

    expect(screen.getByLabelText('Prompt')).toHaveValue('line break\n')
  })

  it('ignores empty file selection', async () => {
    renderPromptForm('/ai-lab')

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [] } })

    expect(useAiLabStore.getState().promptImages).toEqual([])
  })

  it('sends realtime message when socket is already ready', async () => {
    isReady = true
    renderPromptForm()

    await userEvent.type(screen.getByLabelText('Prompt'), 'instant')
    await userEvent.click(screen.getByRole('button', { name: 'Ask Me' }))

    expect(connectMock).not.toHaveBeenCalled()
    expect(sendMessageMock).toHaveBeenCalledWith('instant')
  })

  it('submits voice and image prompts on matching routes', async () => {
    const client = createTestClient()
    const { unmount: unmountImage } = render(<PromptForm />, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>
          <ThemeProvider theme={aiLabTheme}>
            <CssBaseline />
            <MemoryRouter initialEntries={['/ai-lab/image-generator']}>{children}</MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      ),
    })
    await userEvent.type(screen.getByLabelText('Prompt'), 'draw')
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
    unmountImage()

    render(<PromptForm />, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>
          <ThemeProvider theme={aiLabTheme}>
            <CssBaseline />
            <MemoryRouter initialEntries={['/ai-lab/voice-generator']}>{children}</MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      ),
    })
    await userEvent.type(screen.getByLabelText('Prompt'), 'speak')
    await userEvent.click(screen.getByRole('button', { name: 'Generate' }))
  })
})
