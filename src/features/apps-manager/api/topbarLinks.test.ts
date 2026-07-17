import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { expect } from 'vitest'
import { fetchTopbarLinks } from './topbarLinks'

const server = setupServer(
  http.get('*/api/v1/topbar-links/', () =>
    HttpResponse.json([
      {
        key: 'github',
        url: 'https://github.com/example',
        title: 'raw-github',
        icon_class: 'fa-github',
        ordering: 3,
      },
      {
        key: 'cv',
        url: 'https://example.com/cv.pdf',
        title: 'raw-cv',
        icon_class: 'fa-file',
        ordering: 1,
      },
      {
        key: 'custom',
        url: 'https://example.com/custom',
        title: 'Fallback Title',
        icon_class: 'fa-star',
        ordering: 2,
      },
    ]),
  ),
)

describe('topbarLinks api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('maps known keys to labels, keeps title for unknown, and sorts by ordering', async () => {
    const links = await fetchTopbarLinks()

    expect(links.map((l) => l.key)).toEqual(['cv', 'custom', 'github'])
    expect(links.map((l) => l.title)).toEqual(['CV', 'Fallback Title', 'GitHub'])
  })
})
