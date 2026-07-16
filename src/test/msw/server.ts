import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const handlers = [
  http.post('*/api/v1/token/', () =>
    HttpResponse.json({ access: 'access', refresh: 'refresh' }),
  ),
  http.post('*/api/v1/token/refresh/', () =>
    HttpResponse.json({ access: 'access', refresh: 'refresh' }),
  ),
]

export const server = setupServer(...handlers)
