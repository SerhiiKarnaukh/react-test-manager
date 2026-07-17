import { renderHook } from '@testing-library/react'
import { expect, vi } from 'vitest'
import { usePageBottomScroll } from '@features/social/posts/hooks/usePageBottomScroll'
import {
  editPasswordSchema,
  editProfileSchema,
} from '@features/social/profiles/validation/profile.schemas'

describe('usePageBottomScroll', () => {
  it('calls handler when page bottom is reached and enabled', () => {
    const onReachBottom = vi.fn()
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true })
    Object.defineProperty(document.body, 'offsetHeight', {
      value: 1800,
      configurable: true,
    })

    renderHook(() => usePageBottomScroll(onReachBottom, true))
    window.dispatchEvent(new Event('scroll'))
    expect(onReachBottom).toHaveBeenCalled()
  })

  it('does not subscribe when disabled', () => {
    const onReachBottom = vi.fn()
    renderHook(() => usePageBottomScroll(onReachBottom, false))
    window.dispatchEvent(new Event('scroll'))
    expect(onReachBottom).not.toHaveBeenCalled()
  })
})

describe('profile validation schemas', () => {
  it('accepts valid edit profile values', () => {
    expect(
      editProfileSchema.safeParse({
        username: 'john',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      }).success,
    ).toBe(true)
  })

  it('rejects short username', () => {
    expect(
      editProfileSchema.safeParse({
        username: 'ab',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      }).success,
    ).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    expect(
      editPasswordSchema.safeParse({
        password: 'oldpass12',
        password1: 'newpass12',
        password2: 'different',
      }).success,
    ).toBe(false)
  })

  it('accepts matching passwords', () => {
    expect(
      editPasswordSchema.safeParse({
        password: 'oldpass12',
        password1: 'newpass12',
        password2: 'newpass12',
      }).success,
    ).toBe(true)
  })
})
