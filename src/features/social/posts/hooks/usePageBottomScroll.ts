import { useEffect } from 'react'

function isPageBottomReached(threshold = 10): boolean {
  return window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold
}

/** Window-scroll infinite load — mirrors Angular Social feed/search/trend behavior. */
export function usePageBottomScroll(
  onReachBottom: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return

    const handleScroll = () => {
      if (isPageBottomReached()) {
        onReachBottom()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled, onReachBottom])
}
