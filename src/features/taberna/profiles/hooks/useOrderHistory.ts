import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAlertStore } from '@core/alert/alert.store'
import { fetchUserOrders } from '@features/taberna/profiles/api/profiles'
import { getErrorMessage } from '@shared/utils/error'

export function useOrderHistory() {
  const enqueue = useAlertStore((s) => s.enqueue)
  const query = useQuery({
    queryKey: ['taberna', 'orders'],
    queryFn: fetchUserOrders,
  })

  useEffect(() => {
    if (query.isError) {
      enqueue('error', getErrorMessage(query.error, 'Failed to load orders'))
    }
  }, [query.isError, query.error, enqueue])

  return query
}
