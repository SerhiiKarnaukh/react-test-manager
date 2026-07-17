import CryptoJS from 'crypto-js'

const encryptionKey = import.meta.env.VITE_ENCRIPTION_KEY ?? ''

export function encryptData(data: unknown): string {
  return CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString()
}

export function decryptData<T>(encryptedData: string): T {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey)
  return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T
}
