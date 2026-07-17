import { expect, vi } from 'vitest'
import {
  buildSocialWebSocketUrl,
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
  })

  it('buildSocialWebSocketUrl uses ws and remote host domain', () => {
    vi.stubEnv('VITE_REMOTE_HOST', 'http://127.0.0.1:8000')
    expect(buildSocialWebSocketUrl('/ws/notification/7/')).toBe(
      'ws://127.0.0.1:8000/ws/notification/7/',
    )
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
