import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import RemoveIcon from '@mui/icons-material/Remove'
import type { TabernaCartLineItem } from '@features/taberna/cart/api/cart'
import { useCartStore } from '@features/taberna/cart/store/cart.store'

type CartItemProps = {
  item: TabernaCartLineItem
}

function lineTotal(item: TabernaCartLineItem): number {
  return item.quantity * item.product.price
}

function variationValue(item: TabernaCartLineItem, category: string): string | undefined {
  return item.variations.find(
    (variation) => variation.variation_category.toLowerCase() === category,
  )?.variation_value
}

export function CartItem({ item }: CartItemProps) {
  const addToCart = useCartStore((s) => s.addToCart)
  const decrementLine = useCartStore((s) => s.decrementLine)
  const removeLine = useCartStore((s) => s.removeLine)
  const isLoading = useCartStore((s) => s.isLoading)

  const handleDecrement = () => {
    void decrementLine(item.product.id, item.id)
  }

  const handleIncrement = () => {
    const color = variationValue(item, 'color')
    const size = variationValue(item, 'size')
    if (!color || !size) return
    void addToCart(item.product.id, color, size)
  }

  const handleRemove = () => {
    void removeLine(item.product.id, item.id)
  }

  return (
    <TableRow>
      <TableCell sx={{ width: 96 }}>
        <Box
          component="img"
          src={item.product.image}
          alt={item.product.name}
          sx={{
            width: 80,
            height: 56,
            objectFit: 'cover',
            borderRadius: 1,
            display: 'block',
          }}
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
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <IconButton
          aria-label="Decrease quantity"
          size="small"
          onClick={handleDecrement}
          disabled={isLoading}
        >
          <RemoveIcon fontSize="small" />
        </IconButton>
        <Typography component="span" sx={{ display: 'inline-block', minWidth: 24, textAlign: 'center' }}>
          {item.quantity}
        </Typography>
        <IconButton
          aria-label="Increase quantity"
          size="small"
          onClick={handleIncrement}
          disabled={isLoading}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </TableCell>
      <TableCell>${lineTotal(item).toFixed(2)}</TableCell>
      <TableCell>
        <IconButton
          aria-label="Remove item"
          onClick={handleRemove}
          disabled={isLoading}
        >
          <DeleteOutlineIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}
