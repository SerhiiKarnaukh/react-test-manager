import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { useReportOrderStatus } from '@features/taberna/orders/hooks/useCheckout'
import { AuthPageShell } from '@shared/ui/AuthPageShell'

export function FailedPage() {
  const [searchParams] = useSearchParams()
  const { mutate } = useReportOrderStatus()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      mutate({ status: 'failed', stripeSessionId: sessionId })
    }
  }, [searchParams, mutate])

  return (
    <AuthPageShell>
      <Card
        sx={{
          boxShadow: 3,
          bgcolor: 'error.light',
          color: 'error.contrastText',
        }}
      >
        <CardHeader title="Payment failed" />
        <CardContent>
          <Typography>Payment failed or was cancelled. Please try again later!</Typography>
        </CardContent>
      </Card>
    </AuthPageShell>
  )
}
