import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAlertStore } from '@core/alert/alert.store'
import { searchApps } from '@features/apps-manager/api/reactApps'
import { getErrorMessage } from '@shared/utils/error'

export function useAppSearch(query: string) {
  const enqueue = useAlertStore((s) => s.enqueue)
  const trimmed = query.trim()

  const result = useQuery({
    queryKey: ['apps', 'search', trimmed],
    queryFn: () => searchApps(trimmed),
    enabled: trimmed.length > 0,
  })

  useEffect(() => {
    if (result.isError) {
      enqueue('error', getErrorMessage(result.error, 'Search failed'))
    }
  }, [result.isError, result.error, enqueue])

  return result
}
