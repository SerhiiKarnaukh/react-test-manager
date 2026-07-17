import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { useReportOrderStatus } from '@features/taberna/orders/hooks/useCheckout'
import { AuthPageShell } from '@shared/ui/AuthPageShell'

export function SuccessPage() {
  const [searchParams] = useSearchParams()
  const { mutate } = useReportOrderStatus()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      mutate({ status: 'success', stripeSessionId: sessionId })
    }
  }, [searchParams, mutate])

  return (
    <AuthPageShell>
      <Card sx={{ boxShadow: 3 }}>
        <CardHeader title="Thank You!" />
        <CardContent>
          <Typography>Your order will be processed within 48 hours</Typography>
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
