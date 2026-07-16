import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_REMOTE_HOST || '',
  headers: {
    'Content-Type': 'application/json',
  },
})
