import { getOrCreateChat } from '@features/social/chat/api/chat'

/** Opens (or creates) a chat for a profile slug; no-ops when slug is missing. */
export async function openChatForProfileSlug(
  slug: string | undefined,
  navigate: (path: string) => void,
) {
  if (!slug) return

  try {
    await getOrCreateChat(slug)
  } catch {
    // Chat page remains the fallback when conversation creation fails.
  }
  navigate('/social/chat')
}
