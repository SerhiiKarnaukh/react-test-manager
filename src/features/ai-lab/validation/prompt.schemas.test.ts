import { describe, expect, it } from 'vitest'
import { promptSchema } from '@features/ai-lab/validation/prompt.schemas'

describe('promptSchema', () => {
  it('accepts a valid prompt', () => {
    expect(promptSchema.safeParse({ prompt: 'Hello AI' }).success).toBe(true)
  })

  it('rejects empty prompt', () => {
    const result = promptSchema.safeParse({ prompt: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects prompt longer than 500 characters', () => {
    const result = promptSchema.safeParse({ prompt: 'a'.repeat(501) })
    expect(result.success).toBe(false)
  })
})
