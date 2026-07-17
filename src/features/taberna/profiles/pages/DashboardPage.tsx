import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import { OrderSummary } from '@features/taberna/profiles/components/OrderSummary'
import { useOrderHistory } from '@features/taberna/profiles/hooks/useOrderHistory'

export function DashboardPage() {
  const { data: orders = [], isPending } = useOrderHistory()
  const hasOrders = orders.length > 0

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 3, pb: 6 }}>
      {isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : hasOrders ? (
        orders.map((order) => <OrderSummary key={order.id} order={order} />)
      ) : (
        <Card sx={{ maxWidth: 700, mx: 'auto', boxShadow: 3 }}>
          <CardHeader title="You don't have any orders..." />
        </Card>
      )}
    </Box>
  )
}
