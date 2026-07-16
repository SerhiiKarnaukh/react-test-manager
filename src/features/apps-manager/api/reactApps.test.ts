import { http, HttpResponse } from 'msw'
import { expect } from 'vitest'
import { setupServer } from 'msw/node'
import { APPS_BASE, fetchApps, searchApps } from './reactApps'

const sampleApps = [
  {
    id: 1,
    title: 'Taberna',
    photo: 'https://example.com/taberna.jpg',
    url: 'https://example.com/desc',
    view_url: '/taberna',
  },
]

const server = setupServer(
  http.get(`*${APPS_BASE}/`, () => HttpResponse.json(sampleApps)),
  http.post(`*${APPS_BASE}/search/`, async ({ request }) => {
    const body = (await request.json()) as { query?: string }
    if (body.query === 'taberna') return HttpResponse.json(sampleApps)
    return HttpResponse.json([])
  }),
)

describe('reactApps api', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('fetchApps GETs the apps list endpoint', async () => {
    const data = await fetchApps()
    expect(data).toEqual(sampleApps)
  })

  it('searchApps POSTs query to the search endpoint', async () => {
    const data = await searchApps('taberna')
    expect(data).toEqual(sampleApps)
  })
})
