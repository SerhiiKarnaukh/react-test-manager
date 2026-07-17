import { Link as RouterLink } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import type { TabernaProduct } from '@features/taberna/product/api/products'

type ProductCardProps = {
  product: TabernaProduct
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 3,
      }}
    >
      <Box sx={{ overflow: 'hidden', flexShrink: 0, aspectRatio: '3 / 2' }}>
        <CardMedia
          component="img"
          image={product.image}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </Box>

      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pb: 2,
        }}
      >
        <Typography
          component="h3"
          variant="h6"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.description}
        </Typography>
        <Typography
          color="primary.dark"
          sx={{
            mt: 'auto',
            fontWeight: 700,
            fontStyle: 'italic',
          }}
        >
          ${product.price}
        </Typography>
      </CardContent>

      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pt: 1.5 }}>
        <Button
          component={RouterLink}
          to={product.get_absolute_url}
          variant="contained"
          startIcon={<VisibilityOutlinedIcon />}
        >
          Details
        </Button>
      </Box>
    </Card>
  )
}
