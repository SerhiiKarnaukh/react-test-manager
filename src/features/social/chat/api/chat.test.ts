import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import {
  fetchConversation,
  fetchConversations,
  getOrCreateChat,
  sendChatMessage,
} from '@features/social/chat/api/chat'

const baseUrl = '/api/social-chat'

const chatUser = {
  id: 2,
  first_name: 'Jane',
  last_name: 'Roe',
  avatar_url: null,
}

const conversation = {
  id: 5,
  modified_at_formatted: '1h',
  users: [
    { id: 1, first_name: 'John', last_name: 'Doe', avatar_url: null },
    chatUser,
  ],
}

const active = {
  id: 5,
  messages: [
    {
      id: 10,
      body: 'Hello',
      created_at_formatted: '5m',
      created_by: chatUser,
    },
  ],
}

const server = setupServer(
  http.get(`*${baseUrl}/`, () => HttpResponse.json([conversation])),
  http.get(`*${baseUrl}/5/`, () => HttpResponse.json(active)),
  http.post(`*${baseUrl}/5/send/`, async ({ request }) => {
    const body = (await request.json()) as { body?: string }
    return HttpResponse.json({ ok: true, body: body.body })
  }),
  http.get(`*${baseUrl}/jane/get-or-create/`, () => HttpResponse.json({ id: 5 })),
)

describe('social chat api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('fetchConversations returns conversation list', async () => {
    await expect(fetchConversations()).resolves.toEqual([conversation])
  })

  it('fetchConversation returns active thread with messages', async () => {
    await expect(fetchConversation(5)).resolves.toEqual(active)
  })

  it('sendChatMessage posts body payload', async () => {
    await expect(sendChatMessage(5, 'Hi there')).resolves.toEqual({
      ok: true,
      body: 'Hi there',
    })
  })

  it('getOrCreateChat hits slug endpoint', async () => {
    await expect(getOrCreateChat('jane')).resolves.toEqual({ id: 5 })
  })
})
