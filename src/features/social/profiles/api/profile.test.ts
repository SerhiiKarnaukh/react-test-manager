import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import {
  changePassword,
  fetchFriendSuggestions,
  fetchFriendsData,
  fetchMe,
  handleFriendRequest,
  sendFriendRequest,
  updateProfile,
} from '@features/social/profiles/api/profile'

const baseUrl = '/api/social-profiles'

const sampleUser = {
  id: 1,
  username: 'john',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  slug: 'john',
  full_name: 'John Doe',
  avatar_url: null,
}

const friendUser = {
  id: 2,
  slug: 'jane',
  first_name: 'Jane',
  last_name: 'Roe',
  avatar_url: null,
  friends_count: 5,
  posts_count: 3,
}

const server = setupServer(
  http.get(`*${baseUrl}/me/`, () => HttpResponse.json(sampleUser)),
  http.post(`*${baseUrl}/editprofile/`, async ({ request }) => {
    const form = await request.formData()
    return HttpResponse.json({
      message: 'Information updated successfully',
      new_slug: String(form.get('username')),
      new_avatar: null,
    })
  }),
  http.post(`*${baseUrl}/editpassword/`, async ({ request }) => {
    const body = (await request.json()) as Record<string, string>
    return HttpResponse.json({
      message: body.new_password1 === body.new_password2 ? 'success' : 'error',
    })
  }),
  http.post(`*${baseUrl}/friends/jane/request/`, () =>
    HttpResponse.json({ message: 'sent' }),
  ),
  http.get(`*${baseUrl}/friends/john/`, () =>
    HttpResponse.json({
      requests: [{ id: 10, created_by: friendUser }],
      friends: [friendUser],
      user: {
        id: 1,
        slug: 'john',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: null,
        friends_count: 1,
        posts_count: 2,
      },
    }),
  ),
  http.post(`*${baseUrl}/friends/jane/accepted/`, () => HttpResponse.json({})),
  http.get(`*${baseUrl}/friends/suggested/`, () =>
    HttpResponse.json([{ id: 3, slug: 'sam', full_name: 'Sam Smith', avatar_url: null }]),
  ),
)

describe('social profile api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('fetchMe returns current user', async () => {
    await expect(fetchMe()).resolves.toEqual(sampleUser)
  })

  it('updateProfile sends multipart form and returns new slug', async () => {
    const formData = new FormData()
    formData.append('username', 'john-updated')
    formData.append('first_name', 'John')
    formData.append('last_name', 'Doe')
    formData.append('email', 'john@example.com')

    await expect(updateProfile(formData)).resolves.toEqual({
      message: 'Information updated successfully',
      new_slug: 'john-updated',
      new_avatar: null,
    })
  })

  it('changePassword returns success when passwords match', async () => {
    await expect(
      changePassword({
        old_password: 'oldpass12',
        new_password1: 'newpass12',
        new_password2: 'newpass12',
      }),
    ).resolves.toEqual({ message: 'success' })
  })

  it('sendFriendRequest posts to request endpoint', async () => {
    await expect(sendFriendRequest('jane')).resolves.toEqual({ message: 'sent' })
  })

  it('fetchFriendsData returns requests, friends and profile', async () => {
    const data = await fetchFriendsData('john')
    expect(data.friends).toHaveLength(1)
    expect(data.requests[0]?.created_by.slug).toBe('jane')
    expect(data.user.slug).toBe('john')
  })

  it('handleFriendRequest posts to status endpoint', async () => {
    await expect(handleFriendRequest('jane', 'accepted')).resolves.toEqual({})
  })

  it('fetchFriendSuggestions returns suggestion list', async () => {
    await expect(fetchFriendSuggestions()).resolves.toEqual([
      { id: 3, slug: 'sam', full_name: 'Sam Smith', avatar_url: null },
    ])
  })
})
