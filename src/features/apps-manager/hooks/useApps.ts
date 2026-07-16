import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAlertStore } from '@core/alert/alert.store'
import { fetchApps } from '@features/apps-manager/api/reactApps'
import { getErrorMessage } from '@shared/utils/error'

export function useApps() {
  const enqueue = useAlertStore((s) => s.enqueue)
  const query = useQuery({
    queryKey: ['apps'],
    queryFn: fetchApps,
  })

  useEffect(() => {
    if (query.isError) {
      enqueue('error', getErrorMessage(query.error, 'Failed to load apps'))
    }
  }, [query.isError, query.error, enqueue])

  return query
}
