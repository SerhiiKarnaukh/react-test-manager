import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import {
  fetchNotifications,
  markNotificationRead,
} from '@features/social/notifications/api/notifications'

const baseUrl = '/api/social-notifications'

const notification = {
  id: 1,
  body: 'Jane liked your post',
  type_of_notification: 'post_like',
  post_id: 10,
}

const server = setupServer(
  http.get(`*${baseUrl}/`, () => HttpResponse.json([notification])),
  http.post(`*${baseUrl}/read/1/`, () => HttpResponse.json({})),
)

describe('social notifications api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('fetchNotifications returns unread list', async () => {
    await expect(fetchNotifications()).resolves.toEqual([notification])
  })

  it('markNotificationRead posts to read endpoint', async () => {
    await expect(markNotificationRead(1)).resolves.toEqual({})
  })
})
