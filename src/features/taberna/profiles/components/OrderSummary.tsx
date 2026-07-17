import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Link from '@mui/material/Link'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import type {
  TabernaOrderProductLine,
  TabernaUserOrder,
} from '@features/taberna/profiles/api/profiles'

type OrderSummaryProps = {
  order: TabernaUserOrder
}

function lineTotal(item: TabernaOrderProductLine): number {
  return item.quantity * item.product_price
}

export function OrderSummary({ order }: OrderSummaryProps) {
  return (
    <Card sx={{ maxWidth: 1000, mx: 'auto', mb: 3, boxShadow: 3 }}>
      <CardHeader
        title={`Order #${order.order_number}`}
        subheader={
          <Box component="span" sx={{ display: 'block' }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
              Order Date: {order.created_at}
            </Typography>
            {order.payment?.status ? (
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                Status: {order.payment.status}
              </Typography>
            ) : null}
            {order.payment?.payment_method ? (
              <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                Payment Method: {order.payment.payment_method}
              </Typography>
            ) : null}
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
              Order Tax: ${order.tax}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block' }}>
              Total Amount: ${order.order_total}
            </Typography>
          </Box>
        }
      />

      <Box sx={{ overflowX: 'auto', px: 3, pb: 3 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.order_products.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Box
                    component="img"
                    src={item.product.image}
                    alt={item.product.name}
                    sx={{ maxHeight: 75, width: 'auto', borderRadius: 1, display: 'block' }}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    component={RouterLink}
                    to={item.product.get_absolute_url}
                    underline="hover"
                    color="inherit"
                    sx={{ fontWeight: 500 }}
                  >
                    {item.product.name}
                  </Link>
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
                <TableCell>${lineTotal(item).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  )
}
