import { expect, vi } from 'vitest'
import { openChatForProfileSlug } from '@features/social/profiles/pages/ProfilePage'
import * as chatApi from '@features/social/chat/api/chat'

describe('openChatForProfileSlug', () => {
  it('returns early without a slug', async () => {
    const navigate = vi.fn()
    const spy = vi.spyOn(chatApi, 'getOrCreateChat')
    await openChatForProfileSlug(undefined, navigate)
    expect(spy).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('navigates to chat after creating conversation', async () => {
    const navigate = vi.fn()
    vi.spyOn(chatApi, 'getOrCreateChat').mockResolvedValue({ id: 1 } as never)
    await openChatForProfileSlug('jane', navigate)
    expect(navigate).toHaveBeenCalledWith('/social/chat')
  })

  it('navigates to chat when create fails', async () => {
    const navigate = vi.fn()
    vi.spyOn(chatApi, 'getOrCreateChat').mockRejectedValue(new Error('fail'))
    await openChatForProfileSlug('jane', navigate)
    expect(navigate).toHaveBeenCalledWith('/social/chat')
  })
})
