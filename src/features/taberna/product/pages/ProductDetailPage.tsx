import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket'
import { useAlertStore } from '@core/alert/alert.store'
import { useCartStore } from '@features/taberna/cart/store/cart.store'
import {
  EMPTY_TABERNA_PRODUCT_DETAIL,
  type TabernaVariationOption,
} from '@features/taberna/product/api/products'
import { useProductDetail } from '@features/taberna/product/hooks/useProducts'

export function ProductDetailPage() {
  const { category_slug: categorySlug, product_slug: productSlug } = useParams()
  const { data = EMPTY_TABERNA_PRODUCT_DETAIL, isPending } = useProductDetail(
    categorySlug,
    productSlug,
  )
  const enqueue = useAlertStore((s) => s.enqueue)
  const addToCart = useCartStore((s) => s.addToCart)
  const cartLoading = useCartStore((s) => s.isLoading)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [colorError, setColorError] = useState('')
  const [sizeError, setSizeError] = useState('')

  const { product, variations } = data
  const galleryImages = useMemo(() => {
    const gallery = product.productgallery?.map((item) => item.image) ?? []
    return product.image ? [product.image, ...gallery] : gallery
  }, [product.image, product.productgallery])

  const showPreviousImage = () => {
    if (!galleryImages.length) return
    setActiveImageIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length)
  }

  const showNextImage = () => {
    if (!galleryImages.length) return
    setActiveImageIndex((current) => (current + 1) % galleryImages.length)
  }

  const validateVariation = (options: TabernaVariationOption[], value: string, message: string) => {
    if (options.length === 0 || value) return ''
    return message
  }

  const handleAddToCart = async () => {
    const nextColorError = validateVariation(
      variations.colors,
      selectedColor,
      'Please select a color',
    )
    const nextSizeError = validateVariation(variations.sizes, selectedSize, 'Please select a size')
    setColorError(nextColorError)
    setSizeError(nextSizeError)

    if (nextColorError || nextSizeError) return

    try {
      await addToCart(product.id, selectedColor, selectedSize)
      enqueue('success', 'The product was added to the cart')
    } catch {
      // Error toast is handled in the cart store.
    }
  }

  if (isPending) {
    return (
      <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 1280,
        py: { xs: 3, md: 6 },
      }}
    >
      <Card
        sx={{
          width: '100%',
          p: { xs: 2, md: 3 },
          boxShadow: 3,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            {galleryImages.length > 0 ? (
              <Box
                component="img"
                src={galleryImages[activeImageIndex]}
                alt={product.name}
                sx={{
                  width: '100%',
                  aspectRatio: '3 / 2',
                  objectFit: 'cover',
                  borderRadius: 1,
                  display: 'block',
                }}
              />
            ) : null}

            {galleryImages.length > 1 ? (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1,
                  pointerEvents: 'none',
                }}
              >
                <IconButton
                  aria-label="Previous image"
                  onClick={showPreviousImage}
                  sx={{
                    pointerEvents: 'auto',
                    bgcolor: 'rgba(0, 0, 0, 0.48)',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.64)' },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  aria-label="Next image"
                  onClick={showNextImage}
                  sx={{
                    pointerEvents: 'auto',
                    bgcolor: 'rgba(0, 0, 0, 0.48)',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.64)' },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            ) : null}
          </Box>

          <Stack spacing={2.5}>
            <Box>
              <Typography component="h1" variant="h4" sx={{ mb: 1 }}>
                {product.name}
              </Typography>
              <Typography sx={{ color: 'primary.dark', fontWeight: 700, fontStyle: 'italic' }}>
                ${product.price}
              </Typography>
            </Box>

            <Typography color="text.secondary">{product.description}</Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(140px, 1fr))' },
                gap: 2,
              }}
            >
              <FormControl fullWidth error={Boolean(colorError)} disabled={!variations.colors.length}>
                <InputLabel id="taberna-color-label">Select Color</InputLabel>
                <Select
                  labelId="taberna-color-label"
                  label="Select Color"
                  value={selectedColor}
                  onChange={(event) => {
                    setSelectedColor(event.target.value)
                    setColorError('')
                  }}
                >
                  {variations.colors.map((color) => (
                    <MenuItem key={color.variation_value} value={color.variation_value}>
                      {color.variation_value}
                    </MenuItem>
                  ))}
                </Select>
                {colorError ? <FormHelperText>{colorError}</FormHelperText> : null}
              </FormControl>

              <FormControl fullWidth error={Boolean(sizeError)} disabled={!variations.sizes.length}>
                <InputLabel id="taberna-size-label">Select Size</InputLabel>
                <Select
                  labelId="taberna-size-label"
                  label="Select Size"
                  value={selectedSize}
                  onChange={(event) => {
                    setSelectedSize(event.target.value)
                    setSizeError('')
                  }}
                >
                  {variations.sizes.map((size) => (
                    <MenuItem key={size.variation_value} value={size.variation_value}>
                      {size.variation_value}
                    </MenuItem>
                  ))}
                </Select>
                {sizeError ? <FormHelperText>{sizeError}</FormHelperText> : null}
              </FormControl>
            </Box>

            <Box>
              <Button
                variant="contained"
                startIcon={<ShoppingBasketIcon />}
                onClick={() => void handleAddToCart()}
                disabled={cartLoading || !product.id}
              >
                Add to Cart
              </Button>
            </Box>
          </Stack>
        </Box>
      </Card>
    </Container>
  )
}
