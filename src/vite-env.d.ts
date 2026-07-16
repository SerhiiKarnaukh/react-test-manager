/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REMOTE_HOST: string
  readonly VITE_ENCRIPTION_KEY: string
  readonly VITE_STRIPE_PUBLIC_KEY: string
  readonly VITE_STRIPE_ACTION_TYPE: 'session' | 'charge'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
