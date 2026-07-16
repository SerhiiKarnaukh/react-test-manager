import { useQuery } from '@tanstack/react-query'
import { fetchTopbarLinks } from '@features/apps-manager/api/topbarLinks'

export function useTopbarLinks() {
  return useQuery({
    queryKey: ['topbar-links'],
    queryFn: fetchTopbarLinks,
    staleTime: 5 * 60_000,
  })
}
