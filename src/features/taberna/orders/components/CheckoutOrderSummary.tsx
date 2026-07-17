import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { CardElement } from '@stripe/react-stripe-js'
import type { TabernaCart } from '@features/taberna/cart/api/cart'

type CheckoutOrderSummaryProps = {
  cart: TabernaCart
  isChargeMode: boolean
  isSubmitting: boolean
  canPay: boolean
  onPay: () => void
}

export function CheckoutOrderSummary({
  cart,
  isChargeMode,
  isSubmitting,
  canPay,
  onPay,
}: CheckoutOrderSummaryProps) {
  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardHeader title="Order Summary" />
      <Box sx={{ overflowX: 'auto', px: 3 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.cart_items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.product.name}
                  {item.variations.length > 0 ? (
                    <Box sx={{ mt: 0.5, color: 'text.secondary' }}>
                      {item.variations.map((variation) => (
                        <Typography key={variation.id} variant="body2">
                          {variation.variation_category}: {variation.variation_value}
                        </Typography>
                      ))}
                    </Box>
                  ) : null}
                </TableCell>
                <TableCell>${item.product.price}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>${item.sub_total ?? item.quantity * item.product.price}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} sx={{ fontWeight: 600, borderBottom: 0 }}>
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 600, borderBottom: 0 }}>{cart.quantity}</TableCell>
              <TableCell sx={{ fontWeight: 600, borderBottom: 0 }}>${cart.grand_total}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <CardContent sx={{ px: 3, pt: 2 }}>
        <Box
          sx={{
            p: 1.5,
            border: 1,
            borderColor: 'error.main',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2">
            <strong>Please Note:</strong> This is a demo website. Do not try to make real payments.
          </Typography>
        </Box>
      </CardContent>

      {isChargeMode ? (
        <Box
          sx={{
            mx: 3,
            mb: 1,
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <CardElement options={{ hidePostalCode: true }} />
        </Box>
      ) : null}

      {canPay ? (
        <CardActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
          <Button variant="contained" disabled={isSubmitting} onClick={onPay}>
            Pay with Stripe
          </Button>
        </CardActions>
      ) : null}
    </Card>
  )
}
