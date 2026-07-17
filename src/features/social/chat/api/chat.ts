import { api } from '@core/http/axios'

export type SocialChatUser = {
  id: number
  first_name: string
  last_name: string
  avatar_url: string | null
}

export type SocialConversationListItem = {
  id: number
  modified_at_formatted: string
  users: SocialChatUser[]
}

export type SocialChatMessage = {
  id: number
  body: string
  created_at_formatted: string
  created_by: SocialChatUser
}

export type SocialActiveConversation = {
  id: number
  messages: SocialChatMessage[]
}

export const EMPTY_ACTIVE_CONVERSATION: SocialActiveConversation = {
  id: 0,
  messages: [],
}

const BASE_URL = '/api/social-chat'

export async function fetchConversations(): Promise<SocialConversationListItem[]> {
  const { data } = await api.get<SocialConversationListItem[]>(`${BASE_URL}/`)
  return data
}

export async function fetchConversation(
  conversationId: number,
): Promise<SocialActiveConversation> {
  const { data } = await api.get<SocialActiveConversation>(`${BASE_URL}/${conversationId}/`)
  return data
}

export async function sendChatMessage(conversationId: number, body: string): Promise<unknown> {
  const { data } = await api.post(`${BASE_URL}/${conversationId}/send/`, { body })
  return data
}

export async function getOrCreateChat(userSlug: string): Promise<unknown> {
  const { data } = await api.get(`${BASE_URL}/${userSlug}/get-or-create/`)
  return data
}
