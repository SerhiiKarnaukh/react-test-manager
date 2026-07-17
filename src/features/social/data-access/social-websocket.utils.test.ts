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
  })

  it('buildSocialWebSocketUrl uses ws and remote host domain', () => {
    vi.stubEnv('VITE_REMOTE_HOST', 'http://127.0.0.1:8000')
    expect(buildSocialWebSocketUrl('/ws/notification/7/')).toBe(
      'ws://127.0.0.1:8000/ws/notification/7/',
    )
  })
})
