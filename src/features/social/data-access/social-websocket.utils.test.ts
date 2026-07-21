import { expect, vi } from 'vitest'
import {
  buildSocialWebSocketUrl,
  closeSocialWebSocket,
  extractDomain,
} from '@features/social/data-access/social-websocket.utils'

describe('social websocket utils', () => {
  it('extractDomain pulls host:port from absolute URL', () => {
    expect(extractDomain('http://127.0.0.1:8000')).toBe('127.0.0.1:8000')
    expect(extractDomain('https://example.com/api')).toBe('example.com')
  })

  it('extractDomain uses first segment for host-only values', () => {
    expect(extractDomain('127.0.0.1:8000')).toBe('127.0.0.1:8000')
    expect(extractDomain('')).toBe('')
    expect(extractDomain('http://')).toBe('')
    expect(extractDomain('/')).toBe('/')
  })

  it('buildSocialWebSocketUrl uses ws and remote host domain', () => {
    vi.stubEnv('VITE_REMOTE_HOST', 'http://127.0.0.1:8000')
    expect(buildSocialWebSocketUrl('/ws/notification/7/')).toBe(
      'ws://127.0.0.1:8000/ws/notification/7/',
    )
  })

  it('closeSocialWebSocket closes active sockets and clears matching ref', () => {
    const close = vi.fn()
    const socket = { readyState: 1, close } as unknown as WebSocket
    const socketRef = { current: socket as WebSocket | null }
    closeSocialWebSocket(socket, socketRef)
    expect(close).toHaveBeenCalled()
    expect(socketRef.current).toBeNull()
  })

  it('closeSocialWebSocket skips close for CLOSING and CLOSED sockets', () => {
    const close = vi.fn()
    const closing = { readyState: 2, close } as unknown as WebSocket
    const closed = { readyState: 3, close: vi.fn() } as unknown as WebSocket
    closeSocialWebSocket(closing, { current: closing })
    closeSocialWebSocket(closed, { current: closed })
    expect(close).not.toHaveBeenCalled()
  })

  it('closeSocialWebSocket keeps ref when it points to another socket', () => {
    const close = vi.fn()
    const socket = { readyState: 1, close } as unknown as WebSocket
    const other = { readyState: 1, close: vi.fn() } as unknown as WebSocket
    const socketRef = { current: other }
    closeSocialWebSocket(socket, socketRef)
    expect(close).toHaveBeenCalled()
    expect(socketRef.current).toBe(other)
  })

  it('buildSocialWebSocketUrl falls back to window origin and wss on https', () => {
    vi.stubEnv('VITE_REMOTE_HOST', '')
    const originalProtocol = window.location.protocol
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, protocol: 'https:', origin: 'https://app.test' },
    })
    expect(buildSocialWebSocketUrl('/ws/x/')).toBe('wss://app.test/ws/x/')
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, protocol: originalProtocol },
    })
  })
})
