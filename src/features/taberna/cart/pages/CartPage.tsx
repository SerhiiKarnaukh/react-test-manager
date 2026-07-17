import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { CartItem } from '@features/taberna/cart/components/CartItem'
import { useCartStore } from '@features/taberna/cart/store/cart.store'

export function CartPage() {
  const cart = useCartStore((s) => s.cart)
  const isLoading = useCartStore((s) => s.isLoading)
  const hasItems = cart.cart_items.length > 0

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: 3, pb: 6 }}>
      <Card sx={{ maxWidth: 800, mx: 'auto', boxShadow: 3 }}>
        {isLoading && !hasItems ? (
          <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </CardContent>
        ) : hasItems ? (
          <>
            <CardHeader title="Cart Summary" />
            <Box sx={{ overflowX: 'auto', px: 3 }}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Image</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.cart_items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ px: 3 }}>
              <Divider />
            </Box>

            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                <Typography>Total Price:</Typography>
                <Typography>$ {cart.total}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                <Typography>Tax:</Typography>
                <Typography>$ {cart.tax}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>Total:</Typography>
                <Typography sx={{ fontWeight: 600 }}>$ {cart.grand_total}</Typography>
              </Box>
            </CardContent>

            <CardActions sx={{ justifyContent: 'flex-end', px: 3, pb: 3 }}>
              <Button
                component={RouterLink}
                to="/taberna/cart/checkout"
                variant="contained"
              >
                Proceed to checkout
              </Button>
            </CardActions>
          </>
        ) : (
          <CardHeader title="You don't have any products in your cart..." />
        )}
      </Card>
    </Box>
  )
}
