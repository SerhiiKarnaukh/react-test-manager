import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect, vi } from 'vitest'
import { useAuthStore } from '@core/auth/auth.store'
import { CommentItem } from '@features/social/posts/components/CommentItem'
import { CreatePostForm } from '@features/social/posts/components/CreatePostForm'
import { EmptyState } from '@features/social/posts/components/EmptyState'
import { PostListSkeleton } from '@features/social/posts/components/PostListSkeleton'
import { SocialPageLayout } from '@features/social/posts/components/SocialPageLayout'
import { SocialPostCard } from '@features/social/posts/components/SocialPostCard'
import { Trends } from '@features/social/posts/components/Trends'
import * as postsHooks from '@features/social/posts/hooks/usePosts'
import { PeopleYouMayKnow } from '@features/social/profiles/components/PeopleYouMayKnow'
import { ProfilePageLayout } from '@features/social/profiles/components/ProfilePageLayout'
import {
  createSocialWrapper,
  createTestClient,
  samplePost,
} from '@features/social/test/social-test-utils'
import { useProfileStore } from '@features/social/profiles/store/profile.store'

const server = setupServer(
  http.get('*/api/social-posts/trends/', () =>
    HttpResponse.json([{ id: '1', hashtag: 'react', occurences: 4 }]),
  ),
  http.get('*/api/social-profiles/friends/suggested/', () =>
    HttpResponse.json([{ id: 3, slug: 'sam', full_name: 'Sam Smith', avatar_url: null }]),
  ),
  http.get('*/api/social-profiles/me/', () =>
    HttpResponse.json({
      id: 99,
      username: 'me',
      first_name: 'Me',
      last_name: 'User',
      email: 'me@e.com',
      slug: 'me',
      full_name: 'Me User',
      avatar_url: null,
    }),
  ),
  http.post('*/api/social-posts/create/', async ({ request }) => {
    const form = await request.formData()
    return HttpResponse.json({
      ...samplePost,
      id: 77,
      body: String(form.get('body') ?? ''),
    })
  }),
  http.post('*/api/social-posts/10/like/', () => HttpResponse.json({ message: 'like created' })),
  http.post('*/api/social-posts/10/report/', () => HttpResponse.json({})),
  http.delete('*/api/social-posts/10/delete/', () => HttpResponse.json({})),
)

describe('social components', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.setState({ access: 'token', refresh: 'r', activeApp: 'social' })
    useProfileStore.setState({
      user: {
        id: 99,
        username: 'me',
        first_name: 'Me',
        last_name: 'User',
        email: 'me@e.com',
        slug: 'me',
        full_name: 'Me User',
        avatar_url: null,
      },
    })
  })
  afterEach(() => {
    server.resetHandlers()
    vi.restoreAllMocks()
  })
  afterAll(() => server.close())

  it('renders EmptyState and PostListSkeleton', () => {
    const client = createTestClient()
    render(<EmptyState title="Nothing" message="Try again" />, {
      wrapper: createSocialWrapper(client),
    })
    expect(screen.getByText('Nothing')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()

    const { container } = render(<PostListSkeleton count={2} />, {
      wrapper: createSocialWrapper(client),
    })
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
  })

  it('renders layouts with slots', () => {
    const client = createTestClient()
    render(
      <SocialPageLayout main={<div>Main</div>} sidebar={<div>Side</div>} />,
      { wrapper: createSocialWrapper(client) },
    )
    expect(screen.getByText('Main')).toBeInTheDocument()
    expect(screen.getByText('Side')).toBeInTheDocument()

    render(
      <ProfilePageLayout
        sidebar={<div>Sidebar</div>}
        main={<div>Body</div>}
        widgets={<div>Widgets</div>}
      />,
      { wrapper: createSocialWrapper(client) },
    )
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
    expect(screen.getByText('Widgets')).toBeInTheDocument()
  })

  it('renders CommentItem', () => {
    const client = createTestClient()
    render(
      <CommentItem
        comment={{
          id: 1,
          body: 'Nice post',
          created_at_formatted: '1m',
          created_by: samplePost.created_by,
        }}
      />,
      { wrapper: createSocialWrapper(client) },
    )
    expect(screen.getByText('Nice post')).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })

  it('renders Trends and PeopleYouMayKnow', async () => {
    const client = createTestClient()
    render(
      <>
        <Trends />
        <PeopleYouMayKnow />
      </>,
      { wrapper: createSocialWrapper(client) },
    )
    expect(await screen.findByText('Trends')).toBeInTheDocument()
    expect(await screen.findByText('#react')).toBeInTheDocument()
    expect(await screen.findByText('People you may know')).toBeInTheDocument()
    expect(screen.getByText('Sam Smith')).toBeInTheDocument()
  })

  it('SocialPostCard shows actions and can report other user posts', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    render(<SocialPostCard post={samplePost} />, { wrapper: createSocialWrapper(client) })

    expect(screen.getByText('Hello feed')).toBeInTheDocument()
    expect(screen.getByText('1 comments')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Post actions'))
    expect(await screen.findByText('Report Post')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await user.click(screen.getByLabelText('Post actions'))
    await user.click(screen.getByText('Report Post'))
  })

  it('SocialPostCard shows delete for own posts', async () => {
    server.use(
      http.get('*/api/social-profiles/me/', () =>
        HttpResponse.json({
          id: 1,
          username: 'jane',
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'j@e.com',
          slug: 'jane-doe',
          full_name: 'Jane Doe',
          avatar_url: null,
        }),
      ),
    )
    const user = userEvent.setup()
    const client = createTestClient()
    useProfileStore.setState({
      user: {
        id: 1,
        username: 'jane',
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'j@e.com',
        slug: 'jane-doe',
        full_name: 'Jane Doe',
        avatar_url: null,
      },
    })

    render(
      <SocialPostCard
        post={{
          ...samplePost,
          is_private: true,
          body: '',
          attachments: [{ id: 1, image_url: 'https://example.com/a.jpg' }],
        }}
      />,
      { wrapper: createSocialWrapper(client) },
    )
    expect(screen.getByText('Private')).toBeInTheDocument()
    expect(screen.getByAltText('Post attachment')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Post actions'))
    expect(await screen.findByText('Delete Post')).toBeInTheDocument()
    await user.click(screen.getByText('Delete Post'))
  })

  it('SocialPostCard likes a post', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    render(<SocialPostCard post={samplePost} />, { wrapper: createSocialWrapper(client) })
    await user.click(screen.getByRole('button', { name: '3' }))
  })

  it('SocialPostCard hides actions for guests', () => {
    localStorage.clear()
    useAuthStore.setState({ access: null, refresh: null, activeApp: 'social' })
    const client = createTestClient()
    render(<SocialPostCard post={samplePost} />, { wrapper: createSocialWrapper(client) })
    expect(screen.queryByLabelText('Post actions')).not.toBeInTheDocument()
  })

  it('SocialPostCard renders text-only posts without attachment spacing', () => {
    const client = createTestClient()
    render(
      <SocialPostCard post={{ ...samplePost, body: 'Text only', attachments: [] }} />,
      { wrapper: createSocialWrapper(client) },
    )
    expect(screen.getByText('Text only')).toBeInTheDocument()
    expect(screen.queryByAltText('Post attachment')).not.toBeInTheDocument()
  })

  it('CreatePostForm submits body', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    render(<CreatePostForm />, { wrapper: createSocialWrapper(client) })

    const field = screen.getByRole('textbox', { name: /What are you thinking about/i })
    await user.type(field, 'Hello world')
    await user.click(screen.getByRole('button', { name: 'Post' }))
    await waitFor(() => expect(field).toHaveValue(''))
  })

  it('CreatePostForm attaches images, toggles private, and submits', async () => {
    const mutate = vi.fn((_formData: FormData, options?: { onSuccess?: () => void }) => {
      options?.onSuccess?.()
    })
    vi.spyOn(postsHooks, 'useCreatePost').mockReturnValue({
      mutate,
      isPending: false,
    } as never)

    const user = userEvent.setup()
    const client = createTestClient()
    const { container } = render(<CreatePostForm />, { wrapper: createSocialWrapper(client) })

    const field = screen.getByRole('textbox', { name: /What are you thinking about/i })
    await user.type(field, 'With image')
    await user.click(screen.getByLabelText('Make it private'))
    expect(screen.getByLabelText("It's a private post")).toBeInTheDocument()

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const good = new File(['img'], 'pic.png', { type: 'image/png' })
    const bad = new File(['gif'], 'x.gif', { type: 'image/gif' })
    await user.upload(input, [good, bad])

    expect(await screen.findByAltText('Selected attachment')).toBeInTheDocument()

    // Rejected mime types are skipped (bypass accept= filter via change event)
    const badFile = new File(['x'], 'x.bmp', { type: 'image/bmp' })
    const fileList = {
      0: badFile,
      length: 1,
      item: (index: number) => (index === 0 ? badFile : null),
      [Symbol.iterator]: function* () {
        yield badFile
      },
    } as unknown as FileList
    fireEvent.change(input, { target: { files: fileList } })

    await user.click(screen.getByRole('button', { name: 'Post' }))
    await waitFor(() => expect(mutate).toHaveBeenCalled())
    const formData = mutate.mock.calls[0]?.[0] as FormData
    expect(formData.get('body')).toBe('With image')
    expect(formData.get('is_private')).toBe('true')
    expect(formData.get('images[0]')).toBeInstanceOf(File)
    await waitFor(() => expect(field).toHaveValue(''))
    expect(screen.queryByAltText('Selected attachment')).not.toBeInTheDocument()
  })

  it('SocialPostCard renders body with attachments spacing', () => {
    const client = createTestClient()
    render(
      <SocialPostCard
        post={{
          ...samplePost,
          body: 'With attachment',
          attachments: [{ id: 1, image_url: 'https://example.com/a.png' }],
        }}
      />,
      { wrapper: createSocialWrapper(client) },
    )
    expect(screen.getByText('With attachment')).toBeInTheDocument()
    expect(screen.getByAltText('Post attachment')).toBeInTheDocument()
  })

  it('CreatePostForm Attach image opens file picker', async () => {
    const user = userEvent.setup()
    const client = createTestClient()
    const { container } = render(<CreatePostForm />, { wrapper: createSocialWrapper(client) })
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')
    await user.click(screen.getByRole('button', { name: 'Attach image' }))
    expect(clickSpy).toHaveBeenCalled()

    fireEvent.change(input, { target: { files: null } })
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled()
    fireEvent.submit(container.querySelector('form')!)
  })
})
