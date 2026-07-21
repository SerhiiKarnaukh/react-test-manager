import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@features/ai-lab/api/image', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@features/ai-lab/api/image')>()
  const { vi: vitest } = await import('vitest')
  return {
    ...actual,
    downloadImage: vitest.fn(async () =>
      new Blob(['image-bytes'], { type: 'application/octet-stream' }),
    ),
  }
})

import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@core/auth/auth.store'
import { useAlertStore } from '@core/alert/alert.store'
import { AiLabFooter } from '@features/ai-lab/components/AiLabFooter'
import { AiLabNavbar } from '@features/ai-lab/components/AiLabNavbar'
import { AiLabPageLayout } from '@features/ai-lab/components/AiLabPageLayout'
import { PromptForm } from '@features/ai-lab/components/PromptForm'
import { RealtimeChat } from '@features/ai-lab/components/RealtimeChat'
import { TypingIndicator } from '@features/ai-lab/components/TypingIndicator'
import { MainAiLabLayout } from '@features/ai-lab/layouts/MainAiLabLayout'
import { AiHomePage } from '@features/ai-lab/pages/AiHomePage'
import { ImageGeneratorPage } from '@features/ai-lab/pages/ImageGeneratorPage'
import { RealtimeChatPage } from '@features/ai-lab/pages/RealtimeChatPage'
import { VoiceGeneratorPage } from '@features/ai-lab/pages/VoiceGeneratorPage'
import {
  createAiLabRouteWrapper,
  createAiLabWrapper,
  createDarkAiLabWrapper,
  createTestClient,
} from '@features/ai-lab/test/ai-lab-test-utils'
import { useAiLabStore } from '@features/ai-lab/store/ai-lab.store'

vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(() => false),
}))

import useMediaQuery from '@mui/material/useMediaQuery'

const mockedUseMediaQuery = vi.mocked(useMediaQuery)

let lastSocket: {
  onmessage: ((event: MessageEvent<string>) => void) | null
  send: ReturnType<typeof vi.fn>
  close: ReturnType<typeof vi.fn>
} | null = null

const server = setupServer(
  http.post('*/ai-lab/', () => HttpResponse.json({ message: 'That is hilarious!' })),
  http.post('*/ai-lab/image-generator/', () =>
    HttpResponse.json({ message: 'https://img.test/generated.png' }),
  ),
  http.post('*/ai-lab/voice-generator/', () =>
    HttpResponse.json({ message: 'https://audio.test/voice.mp3' }),
  ),
  http.post('*/ai-lab/upload-vision-images/', () =>
    HttpResponse.json({ uploaded_images: ['https://cdn.test/uploaded.png'] }),
  ),
  http.delete('*/ai-lab/delete-vision-image/', () => HttpResponse.json({ ok: true })),
  http.post('*/ai-lab/realtime-token/', () =>
    HttpResponse.json({ client_secret: { value: 'ephemeral-key' } }),
  ),
)

function mockWebSocket() {
  lastSocket = null
  class MockWebSocket {
    static readonly OPEN = 1
    onmessage: ((event: MessageEvent<string>) => void) | null = null
    send = vi.fn()
    close = vi.fn()
    readyState = MockWebSocket.OPEN
    constructor() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias -- keep reference to mock socket instance
      lastSocket = this
    }
  }
  vi.stubGlobal('WebSocket', MockWebSocket)
}

async function submitPrompt(text: string) {
  const input = screen.getByLabelText('Prompt')
  await userEvent.clear(input)
  await userEvent.type(input, text)
  await userEvent.click(screen.getByRole('button', { name: /Ask Me|Generate/ }))
}

describe('ai lab ui', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    mockWebSocket()
    mockedUseMediaQuery.mockReturnValue(false)
    useAuthStore.setState({ access: null, refresh: null, activeApp: null })
    useAlertStore.getState().clear()
    useAiLabStore.setState({
      message: null,
      imageUrl: null,
      voiceMessage: null,
      promptImages: [],
      uploadingImages: false,
      realtimeMessages: [],
      realtimeLoading: false,
    })
    vi.stubEnv('VITE_REMOTE_HOST', 'https://apps.example.com')
  })
  afterEach(() => {
    server.resetHandlers()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })
  afterAll(() => server.close())

  it('renders TypingIndicator', () => {
    render(<TypingIndicator />)
    expect(screen.getByRole('status', { name: 'Loading response' })).toBeInTheDocument()
  })

  it('renders AiLabFooter links', () => {
    const client = createTestClient()
    render(<AiLabFooter />, { wrapper: createAiLabWrapper(client) })
    expect(screen.getByRole('link', { name: 'All Apps' })).toHaveAttribute(
      'href',
      'https://apps.example.com',
    )
    expect(screen.getByRole('link', { name: 'React Apps' })).toHaveAttribute('href', '/')
  })

  it('renders AiLabPageLayout with scroll interactions', async () => {
    const scrollIntoView = vi.fn()
    HTMLElement.prototype.scrollIntoView = scrollIntoView

    const client = createTestClient()
    render(
      <AiLabPageLayout title="Funny Chat" heroImage="/ai_lab.jpg">
        <div>Content block</div>
      </AiLabPageLayout>,
      { wrapper: createAiLabWrapper(client) },
    )

    expect(screen.getByRole('heading', { name: 'Funny Chat' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Scroll to content' }))
    expect(scrollIntoView).toHaveBeenCalled()

    fireEvent.scroll(window, { target: { scrollY: 120 } })
    expect(screen.queryByRole('button', { name: 'Scroll to content' })).not.toBeInTheDocument()
  })

  it('renders desktop navbar menus and theme toggle', async () => {
    const client = createTestClient()
    render(<AiLabNavbar />, { wrapper: createAiLabWrapper(client, ['/ai-lab']) })

    await userEvent.click(screen.getByRole('button', { name: 'AI Services' }))
    expect(screen.getByRole('menuitem', { name: /Funny Chat/i })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')

    await userEvent.click(screen.getByRole('button', { name: 'Apps Manager' }))
    expect(screen.getByRole('menuitem', { name: /All Apps/i })).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')

    await userEvent.click(screen.getByRole('button', { name: /Dark mode|Light mode/i }))
  })

  it('renders mobile navbar menu', async () => {
    mockedUseMediaQuery.mockReturnValue(true)
    const client = createTestClient()
    render(<AiLabNavbar />, { wrapper: createAiLabWrapper(client, ['/ai-lab/image-generator']) })

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByText('AI Services')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('menuitem', { name: /Voice Generator/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /Dark mode|Light mode/i }))
  })

  it('opens hidden file input from Add Images button', async () => {
    const client = createTestClient()
    render(<PromptForm />, { wrapper: createAiLabWrapper(client, ['/ai-lab']) })

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(fileInput, 'click')
    await userEvent.click(screen.getByRole('button', { name: 'Add Images' }))
    expect(clickSpy).toHaveBeenCalled()
  })

  it('renders RealtimeChat empty, messages, and loading states', () => {
    const client = createTestClient()
    const { rerender } = render(<RealtimeChat />, { wrapper: createAiLabWrapper(client) })
    expect(screen.getByText('Start a conversation')).toBeInTheDocument()

    act(() => {
      useAiLabStore.setState({
        realtimeMessages: [
          { sender: 'me', message: 'hello' },
          { sender: 'chat', message: 'hi there' },
        ],
      })
    })
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(screen.getByText('hi there')).toBeInTheDocument()

    act(() => {
      rerender(<RealtimeChat isLoading />)
    })
    expect(screen.getByRole('status', { name: 'Loading response' })).toBeInTheDocument()
  })

  it('submits funny chat prompt', async () => {
    const client = createTestClient()
    render(<AiHomePage />, { wrapper: createAiLabRouteWrapper(client, '/ai-lab', <AiHomePage />) })

    await submitPrompt('Tell me a joke')
    await waitFor(() => {
      expect(screen.getByText('That is hilarious!')).toBeInTheDocument()
    })
  })

  it('shows stored chat message on home page', () => {
    useAiLabStore.setState({ message: 'Stored reply' })
    const client = createTestClient()
    render(<AiHomePage />, { wrapper: createAiLabRouteWrapper(client, '/ai-lab', <AiHomePage />) })
    expect(screen.getByText('Stored reply')).toBeInTheDocument()
  })

  it('generates and downloads image', async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const client = createTestClient()
    render(<ImageGeneratorPage />, {
      wrapper: createAiLabRouteWrapper(client, '/ai-lab/image-generator', <ImageGeneratorPage />, '/ai-lab/image-generator'),
    })

    await submitPrompt('draw a cat')
    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'Generated image' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Download Image' }))
    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  it('generates voice on voice page', async () => {
    const client = createTestClient()
    render(<VoiceGeneratorPage />, {
      wrapper: createAiLabRouteWrapper(
        client,
        '/ai-lab/voice-generator',
        <VoiceGeneratorPage />,
        '/ai-lab/voice-generator',
      ),
    })

    await submitPrompt('say hello')
    await waitFor(() => {
      expect(document.querySelector('audio')).toHaveAttribute('src', 'https://audio.test/voice.mp3')
    })
  })

  it('shows stored voice message', () => {
    useAiLabStore.setState({ voiceMessage: 'https://audio.test/stored.mp3' })
    const client = createTestClient()
    render(<VoiceGeneratorPage />, {
      wrapper: createAiLabRouteWrapper(
        client,
        '/ai-lab/voice-generator',
        <VoiceGeneratorPage />,
        '/ai-lab/voice-generator',
      ),
    })
    expect(document.querySelector('audio')).toHaveAttribute('src', 'https://audio.test/stored.mp3')
  })

  it('sends realtime message through prompt form', async () => {
    const client = createTestClient()
    render(<RealtimeChatPage />, {
      wrapper: createAiLabRouteWrapper(
        client,
        '/ai-lab/realtime-chat',
        <RealtimeChatPage />,
        '/ai-lab/realtime-chat',
      ),
    })

    const submitPromise = submitPrompt('hello realtime')
    await waitFor(() => {
      expect(lastSocket).not.toBeNull()
    })
    lastSocket?.onmessage?.({ data: JSON.stringify({ type: 'session.created' }) } as MessageEvent<string>)
    await submitPromise

    await waitFor(() => {
      expect(screen.getByText('hello realtime')).toBeInTheDocument()
    })
    expect(lastSocket?.send).toHaveBeenCalled()
  })

  it('handles prompt form image upload and removal on chat route', async () => {
    const client = createTestClient()
    render(<PromptForm />, { wrapper: createAiLabWrapper(client, ['/ai-lab']) })

    const input = screen.getByLabelText('Prompt')
    const file = new File(['x'], 'pic.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByAltText('Uploaded prompt image')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    await waitFor(() => {
      expect(screen.queryByAltText('Uploaded prompt image')).not.toBeInTheDocument()
    })

    await userEvent.type(input, 'Question{Enter}')
    await waitFor(() => {
      expect(useAiLabStore.getState().message).toBe('That is hilarious!')
    })
  })

  it('rejects oversized image upload with alert', async () => {
    const client = createTestClient()
    render(<PromptForm />, { wrapper: createAiLabWrapper(client, ['/ai-lab']) })

    const bigFile = new File(['x'], 'big.png', { type: 'image/png' })
    Object.defineProperty(bigFile, 'size', { value: 21 * 1024 * 1024 })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(fileInput, bigFile)

    await waitFor(() => {
      expect(useAlertStore.getState().queue[0]?.message).toContain('20MB')
    })
  })

  it('shows Generate label on image route', () => {
    const client = createTestClient()
    render(<PromptForm />, {
      wrapper: createAiLabWrapper(client, ['/ai-lab/image-generator']),
    })
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add Images' })).not.toBeInTheDocument()
  })

  it('renders footer without remote host link', () => {
    vi.stubEnv('VITE_REMOTE_HOST', '')
    const client = createTestClient()
    render(<AiLabFooter />, { wrapper: createAiLabWrapper(client) })
    expect(screen.queryByRole('link', { name: 'All Apps' })).not.toBeInTheDocument()
  })

  it('shows stored image result on image page', () => {
    useAiLabStore.setState({ imageUrl: 'https://img.test/stored.png' })
    const client = createTestClient()
    render(<ImageGeneratorPage />, {
      wrapper: createAiLabRouteWrapper(
        client,
        '/ai-lab/image-generator',
        <ImageGeneratorPage />,
        '/ai-lab/image-generator',
      ),
    })
    expect(screen.getByRole('img', { name: 'Generated image' })).toHaveAttribute(
      'src',
      'https://img.test/stored.png',
    )
  })

  it('shows realtime loading indicator on realtime page', () => {
    useAiLabStore.setState({ realtimeLoading: true })
    const client = createTestClient()
    render(<RealtimeChatPage />, {
      wrapper: createAiLabRouteWrapper(
        client,
        '/ai-lab/realtime-chat',
        <RealtimeChatPage />,
        '/ai-lab/realtime-chat',
      ),
    })
    expect(screen.getByRole('status', { name: 'Loading response' })).toBeInTheDocument()
  })

  it('filters invalid file types on upload', async () => {
    const client = createTestClient()
    render(<PromptForm />, { wrapper: createAiLabWrapper(client, ['/ai-lab']) })

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const textFile = new File(['x'], 'notes.txt', { type: 'text/plain' })
    fireEvent.change(fileInput, { target: { files: [textFile] } })

    expect(useAiLabStore.getState().promptImages).toEqual([])
  })

  it('shows uploading spinner while images upload', () => {
    useAiLabStore.setState({ uploadingImages: true })
    const client = createTestClient()
    render(<PromptForm />, { wrapper: createAiLabWrapper(client, ['/ai-lab']) })
    expect(document.querySelector('.MuiCircularProgress-root')).toBeInTheDocument()
  })

  it('renders desktop navbar without remote host', async () => {
    vi.stubEnv('VITE_REMOTE_HOST', '')
    const client = createTestClient()
    render(<AiLabNavbar />, { wrapper: createAiLabWrapper(client, ['/ai-lab']) })

    await userEvent.click(screen.getByRole('button', { name: 'Apps Manager' }))
    expect(screen.queryByRole('menuitem', { name: /All Apps/i })).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
  })

  it('renders mobile navbar without remote host', async () => {
    vi.stubEnv('VITE_REMOTE_HOST', '')
    mockedUseMediaQuery.mockReturnValue(true)
    const client = createTestClient()
    render(<AiLabNavbar />, { wrapper: createAiLabWrapper(client, ['/ai-lab']) })

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.queryByRole('menuitem', { name: /All Apps/i })).not.toBeInTheDocument()
  })

  it('renders core pages in dark mode', async () => {
    useAiLabStore.setState({ message: 'dark reply' })
    const client = createTestClient()
    render(<AiHomePage />, {
      wrapper: createDarkAiLabWrapper(client, ['/ai-lab']),
    })
    await waitFor(() => {
      expect(screen.getByText('dark reply')).toBeInTheDocument()
    })

    useAiLabStore.setState({ realtimeMessages: [{ sender: 'chat', message: 'hi' }] })
    render(<RealtimeChat />, { wrapper: createDarkAiLabWrapper(client) })
    await waitFor(() => {
      expect(screen.getByText('hi')).toBeInTheDocument()
    })
  })

  it('renders voice page in dark mode', async () => {
    useAiLabStore.setState({ voiceMessage: 'https://audio.test/dark.mp3' })
    const client = createTestClient()
    render(<VoiceGeneratorPage />, {
      wrapper: createDarkAiLabWrapper(client, ['/ai-lab/voice-generator']),
    })
    await waitFor(() => {
      expect(document.querySelector('audio')).toHaveAttribute('src', 'https://audio.test/dark.mp3')
    })
  })

  it('renders footer and page layout in dark mode', async () => {
    const client = createTestClient()
    render(<AiLabFooter />, { wrapper: createDarkAiLabWrapper(client) })
    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'React Apps' })).toBeInTheDocument()
    })

    render(
      <AiLabPageLayout title="Dark Hero" heroImage="/ai_lab.jpg">
        <div>Dark content</div>
      </AiLabPageLayout>,
      { wrapper: createDarkAiLabWrapper(client) },
    )
    await waitFor(() => {
      expect(screen.getByText('Dark content')).toBeInTheDocument()
    })
  })

  it('mounts main layout, sets active app, and connects realtime socket', async () => {
    const client = createTestClient()
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/ai-lab']}>
          <Routes>
            <Route element={<MainAiLabLayout />}>
              <Route path="/ai-lab" element={<div>Child page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(useAuthStore.getState().activeApp).toBe('ai-lab')
    expect(screen.getByText('Child page')).toBeInTheDocument()

    await waitFor(() => {
      expect(lastSocket).not.toBeNull()
    })
    lastSocket?.onmessage?.({ data: JSON.stringify({ type: 'session.created' }) } as MessageEvent<string>)
  })
})
