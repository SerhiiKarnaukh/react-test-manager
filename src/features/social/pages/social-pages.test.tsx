import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect, vi } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { ChatPage } from '@features/social/chat/pages/ChatPage'
import { NotificationsPage } from '@features/social/notifications/pages/NotificationsPage'
import { EditPasswordPage } from '@features/social/profiles/pages/EditPasswordPage'
import { EditProfilePage } from '@features/social/profiles/pages/EditProfilePage'
import { FriendsPage } from '@features/social/profiles/pages/FriendsPage'
import { ProfilePage } from '@features/social/profiles/pages/ProfilePage'
import { SocialLoginPage } from '@features/social/profiles/pages/SocialLoginPage'
import {
  createSocialRouteWrapper,
  createTestClient,
  samplePost,
} from '@features/social/test/social-test-utils'
import { useProfileStore } from '@features/social/profiles/store/profile.store'

const me = {
  id: 1,
  username: 'john',
  first_name: 'John',
  last_name: 'Doe',
  email: 'j@e.com',
  slug: 'john',
  full_name: 'John Doe',
  avatar_url: null,
}

const peer = {
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
    peer,
  ],
}

const server = setupServer(
  http.get('*/api/social-profiles/me/', () => HttpResponse.json(me)),
  http.get('*/api/social-chat/', () => HttpResponse.json([conversation])),
  http.get('*/api/social-chat/5/', () =>
    HttpResponse.json({
      id: 5,
      messages: [
        {
          id: 1,
          body: 'Hello!!',
          created_at_formatted: '1m',
          created_by: peer,
        },
      ],
    }),
  ),
  http.post('*/api/social-chat/5/send/', () => HttpResponse.json({})),
  http.get('*/api/social-notifications/', () =>
    HttpResponse.json([
      {
        id: 1,
        body: 'Jane liked your post',
        type_of_notification: 'post_like',
        post_id: 10,
      },
    ]),
  ),
  http.post('*/api/social-notifications/read/1/', () => HttpResponse.json({})),
  http.get('*/api/social-posts/profile/john/', () =>
    HttpResponse.json({
      results: {
        posts: [],
        profile: {
          id: 1,
          slug: 'john',
          first_name: 'John',
          last_name: 'Doe',
          full_name: 'John Doe',
          avatar_url: null,
          friends_count: 1,
          posts_count: 0,
        },
        can_send_friendship_request: false,
      },
      next: null,
    }),
  ),
  http.get('*/api/social-posts/profile/jane/', () =>
    HttpResponse.json({
      results: {
        posts: [],
        profile: {
          id: 2,
          slug: 'jane',
          first_name: 'Jane',
          last_name: 'Roe',
          full_name: 'Jane Roe',
          avatar_url: null,
          friends_count: 3,
          posts_count: 1,
        },
        can_send_friendship_request: true,
      },
      next: null,
    }),
  ),
  http.get('*/api/social-profiles/friends/john/', () =>
    HttpResponse.json({
      requests: [
        {
          id: 20,
          created_by: {
            id: 2,
            slug: 'jane',
            first_name: 'Jane',
            last_name: 'Roe',
            avatar_url: null,
            friends_count: 3,
            posts_count: 1,
          },
        },
      ],
      friends: [
        {
          id: 2,
          slug: 'jane',
          first_name: 'Jane',
          last_name: 'Roe',
          avatar_url: null,
          friends_count: 3,
          posts_count: 1,
        },
      ],
      user: {
        id: 1,
        slug: 'john',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: null,
        friends_count: 1,
        posts_count: 0,
      },
    }),
  ),
  http.post('*/api/social-profiles/friends/jane/accepted/', () => HttpResponse.json({})),
  http.get('*/api/social-profiles/friends/suggested/', () => HttpResponse.json([])),
  http.get('*/api/social-posts/trends/', () => HttpResponse.json([])),
  http.post('*/api/social-profiles/editprofile/', () =>
    HttpResponse.json({
      message: 'Information updated successfully',
      new_slug: 'john',
      new_avatar: null,
    }),
  ),
  http.post('*/api/social-profiles/editpassword/', () =>
    HttpResponse.json({ message: 'success' }),
  ),
  http.post('*/api/social-profiles/friends/jane/request/', () =>
    HttpResponse.json({ message: 'sent' }),
  ),
  http.get('*/api/social-chat/jane/get-or-create/', () => HttpResponse.json({ id: 5 })),
)

describe('social chat / notifications / profile pages', () => {
  const OriginalWebSocket = globalThis.WebSocket

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
    class MockWebSocket {
      static OPEN = 1
      static CONNECTING = 0
      readyState = 1
      onmessage: ((event: { data: string }) => void) | null = null
      close = vi.fn()
      constructor(public url: string) {}
    }
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket)
  })
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ access: 'token', refresh: 'r', activeApp: 'social' })
    useProfileStore.setState({ user: me })
  })
  afterEach(() => server.resetHandlers())
  afterAll(() => {
    server.close()
    vi.stubGlobal('WebSocket', OriginalWebSocket)
  })

  it('ChatPage lists conversations and sends messages', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/chat', <ChatPage />)
    render(<Page />)

    expect(await screen.findByText('Jane Roe')).toBeInTheDocument()
    expect(await screen.findByText('Hello!!')).toBeInTheDocument()

    const field = await screen.findByRole('textbox', { name: /What do you want to say/i })
    await user.type(field, 'Ping')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    await waitFor(() => expect(field).toHaveValue(''))
  })

  it('ChatPage shows empty state without conversations', async () => {
    server.use(http.get('*/api/social-chat/', () => HttpResponse.json([])))
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/chat', <ChatPage />)
    render(<Page />)
    expect(await screen.findByText('You have no active conversations!')).toBeInTheDocument()
  })

  it('NotificationsPage marks notification as read', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/notifications',
      <NotificationsPage />,
    )
    render(<Page />)
    expect(await screen.findByText('Jane liked your post')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Read more' }))
    await waitFor(() =>
      expect(screen.queryByText('Jane liked your post')).not.toBeInTheDocument(),
    )
  })

  it('NotificationsPage shows empty copy', async () => {
    server.use(http.get('*/api/social-notifications/', () => HttpResponse.json([])))
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/notifications',
      <NotificationsPage />,
    )
    render(<Page />)
    expect(
      await screen.findByText("You don't have any unread notifications!"),
    ).toBeInTheDocument()
  })

  it('ProfilePage shows own edit button', async () => {
    server.use(
      http.get('*/api/social-posts/profile/john/', ({ request }) => {
        const url = new URL(request.url)
        if (url.searchParams.get('page') === '2') {
          return HttpResponse.json({
            results: {
              posts: [{ ...samplePost, id: 11, body: 'Profile page 2' }],
              profile: {
                id: 1,
                slug: 'john',
                first_name: 'John',
                last_name: 'Doe',
                full_name: 'John Doe',
                avatar_url: null,
                friends_count: 1,
                posts_count: 2,
              },
              can_send_friendship_request: false,
            },
            next: null,
          })
        }
        return HttpResponse.json({
          results: {
            posts: [{ ...samplePost, body: 'Own post' }],
            profile: {
              id: 1,
              slug: 'john',
              first_name: 'John',
              last_name: 'Doe',
              full_name: 'John Doe',
              avatar_url: null,
              friends_count: 1,
              posts_count: 2,
            },
            can_send_friendship_request: false,
          },
          next: `${url.origin}/api/social-posts/profile/john/?page=2`,
        })
      }),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/profile/:slug',
      <ProfilePage />,
      '/social/profile/john',
    )
    render(<Page />)
    expect(await screen.findByText('John Doe')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit Profile' })).toBeInTheDocument()
    expect(await screen.findByText('Own post')).toBeInTheDocument()

    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 200,
    })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 100 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 120 })
    window.dispatchEvent(new Event('scroll'))
    expect(await screen.findByText('Profile page 2')).toBeInTheDocument()
  })

  it('ProfilePage can add friend on other profiles', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/profile/:slug',
      <ProfilePage />,
      '/social/profile/jane',
    )
    render(<Page />)
    expect(await screen.findByText('Jane Roe')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add as Friend' }))
  })

  it('ProfilePage sends message and navigates to chat', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/profile/:slug',
      <ProfilePage />,
      '/social/profile/jane',
    )
    render(<Page />)
    expect(await screen.findByRole('button', { name: 'Send Message' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Send Message' }))
    expect(await screen.findByText('Chat')).toBeInTheDocument()
  })

  it('ProfilePage still navigates to chat when get-or-create fails', async () => {
    server.use(
      http.get('*/api/social-chat/jane/get-or-create/', () =>
        HttpResponse.json({ detail: 'fail' }, { status: 500 }),
      ),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/profile/:slug',
      <ProfilePage />,
      '/social/profile/jane',
    )
    render(<Page />)
    await user.click(await screen.findByRole('button', { name: 'Send Message' }))
    expect(await screen.findByText('Chat')).toBeInTheDocument()
  })

  it('ProfilePage shows rejected friendship copy', async () => {
    server.use(
      http.get('*/api/social-posts/profile/jane/', () =>
        HttpResponse.json({
          results: {
            posts: [],
            profile: {
              id: 2,
              slug: 'jane',
              first_name: 'Jane',
              last_name: 'Roe',
              full_name: 'Jane Roe',
              avatar_url: null,
              friends_count: 3,
              posts_count: 1,
            },
            can_send_friendship_request: 'rejected',
          },
          next: null,
        }),
      ),
    )
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/profile/:slug',
      <ProfilePage />,
      '/social/profile/jane',
    )
    render(<Page />)
    expect(
      await screen.findByText(/The friend request was rejected/i),
    ).toBeInTheDocument()
  })

  it('FriendsPage accepts friendship requests', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/profile/:slug/friends',
      <FriendsPage />,
      '/social/profile/john/friends',
    )
    render(<Page />)
    expect(await screen.findByText('Friendship requests')).toBeInTheDocument()
    expect(screen.getByText('Friends')).toBeInTheDocument()
    expect(screen.getAllByText('Jane Roe').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Accept' }))
  })

  it('FriendsPage rejects friendship requests', async () => {
    server.use(
      http.post('*/api/social-profiles/friends/jane/rejected/', () => HttpResponse.json({})),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(
      client,
      '/social/profile/:slug/friends',
      <FriendsPage />,
      '/social/profile/john/friends',
    )
    render(<Page />)
    expect(await screen.findByRole('button', { name: 'Reject' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reject' }))
  })

  it('EditProfilePage saves changes and can pick avatar', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Edit = createSocialRouteWrapper(client, '/social/profile/edit', <EditProfilePage />)
    const { container } = render(<Edit />)
    expect(await screen.findByLabelText('Username')).toHaveValue('john')

    await user.clear(screen.getByLabelText('First Name'))
    await user.type(screen.getByLabelText('First Name'), 'Johnny')

    const input = container.querySelector('#avatarUpload') as HTMLInputElement
    await user.upload(input, new File(['a'], 'avatar.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
  })

  it('EditPasswordPage submits and toggles visibility', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const Pass = createSocialRouteWrapper(
      client,
      '/social/edit/password',
      <EditPasswordPage />,
    )
    render(<Pass />)

    await user.type(screen.getByLabelText('Your old password'), 'oldpass12')
    await user.type(screen.getByLabelText('Your new password'), 'newpass12')
    await user.type(screen.getByLabelText('Repeat password'), 'newpass12')
    await user.click(screen.getByLabelText('Toggle password visibility'))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
  })

  it('EditProfilePage and EditPasswordPage render forms', async () => {
    const client = createTestClient()
    const Edit = createSocialRouteWrapper(client, '/social/profile/edit', <EditProfilePage />)
    render(<Edit />)
    expect(await screen.findByLabelText('Username')).toHaveValue('john')

    const Pass = createSocialRouteWrapper(
      client,
      '/social/edit/password',
      <EditPasswordPage />,
    )
    render(<Pass />)
    expect(screen.getByLabelText('Your old password')).toBeInTheDocument()
  })

  it('SocialLoginPage renders shared login form', () => {
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/login', <SocialLoginPage />)
    render(<Page />)
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
  })

  it('ChatPage can switch active conversation', async () => {
    let listCalls = 0
    server.use(
      http.get('*/api/social-chat/', () => {
        listCalls += 1
        return HttpResponse.json([
          { ...conversation, modified_at_formatted: `${listCalls}h` },
          {
            id: 6,
            modified_at_formatted: `${listCalls}h`,
            users: [
              { id: 1, first_name: 'John', last_name: 'Doe', avatar_url: null },
              { id: 3, first_name: 'Sam', last_name: 'Lee', avatar_url: null },
            ],
          },
        ])
      }),
      http.get('*/api/social-chat/6/', () =>
        HttpResponse.json({
          id: 6,
          messages: [
            {
              id: 2,
              body: 'Other chat',
              created_at_formatted: '2m',
              created_by: { id: 3, first_name: 'Sam', last_name: 'Lee', avatar_url: null },
            },
          ],
        }),
      ),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    const Page = createSocialRouteWrapper(client, '/social/chat', <ChatPage />)
    const { container } = render(<Page />)
    expect(await screen.findByText('Sam Lee')).toBeInTheDocument()
    await user.click(screen.getByText('Sam Lee'))
    expect(await screen.findByText('Other chat')).toBeInTheDocument()

    await client.invalidateQueries({ queryKey: ['social', 'chat', 'conversations'] })
    await waitFor(() => expect(listCalls).toBeGreaterThan(1))
    expect(screen.getByText('Other chat')).toBeInTheDocument()

    fireEvent.submit(container.querySelector('form')!)
  })
})
