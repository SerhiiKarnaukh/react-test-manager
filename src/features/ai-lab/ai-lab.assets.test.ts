import { describe, expect, it } from 'vitest'
import { AI_LAB_HERO_IMAGES } from '@features/ai-lab/ai-lab.assets'

describe('AI_LAB_HERO_IMAGES', () => {
  it('maps hero banners to public root paths', () => {
    expect(AI_LAB_HERO_IMAGES).toEqual({
      chat: '/ai_lab.jpg',
      image: '/img_gen.png',
      voice: '/v_gen_3.png',
      realtime: '/realtime_chat.png',
    })
  })
})
