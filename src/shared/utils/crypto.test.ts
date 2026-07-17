import { expect } from 'vitest'
import { decryptData, encryptData } from '@shared/utils/crypto'

describe('crypto utils', () => {
  it('round-trips a string through AES encryption', () => {
    const encrypted = encryptData('secret-value')
    expect(encrypted).not.toBe('secret-value')
    expect(decryptData<string>(encrypted)).toBe('secret-value')
  })

  it('round-trips structured data', () => {
    const payload = { id: 7, name: 'Jane', active: true }
    const encrypted = encryptData(payload)
    expect(decryptData<typeof payload>(encrypted)).toEqual(payload)
  })
})
