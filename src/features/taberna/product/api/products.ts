import { api } from '@core/http/axios'

const TABERNA_STORE_BASE = '/taberna-store/api/v1'

export type TabernaProduct = {
  id: number
  name: string
  description: string
  price: number | string
  image: string
  get_absolute_url: string
}

export type TabernaCategoryNavItem = {
  name: string
  get_absolute_url: string
}

export type TabernaCategoryWithProducts = {
  name: string
  products: TabernaProduct[]
}

export type TabernaGalleryImage = {
  image: string
}

export type TabernaProductDetail = TabernaProduct & {
  productgallery?: TabernaGalleryImage[]
}

export type TabernaVariationOption = {
  item: unknown
  variation_value: string
}

export type TabernaProductVariations = {
  colors: TabernaVariationOption[]
  sizes: TabernaVariationOption[]
}

export type TabernaProductDetailResponse = {
  product: TabernaProductDetail
  variations: TabernaProductVariations
}

export const EMPTY_TABERNA_PRODUCT_DETAIL: TabernaProductDetailResponse = {
  product: {
    id: 0,
    name: '',
    description: '',
    price: 0,
    image: '',
    get_absolute_url: '',
    productgallery: [],
  },
  variations: {
    colors: [],
    sizes: [],
  },
}

export async function fetchLatestProducts(): Promise<TabernaProduct[]> {
  const { data } = await api.get<TabernaProduct[]>(`${TABERNA_STORE_BASE}/latest-products/`)
  return data
}

export async function fetchCategoryProducts(
  categorySlug: string,
): Promise<TabernaCategoryWithProducts> {
  const { data } = await api.get<TabernaCategoryWithProducts>(
    `${TABERNA_STORE_BASE}/products/${categorySlug}/`,
  )
  return data
}

export async function fetchProductDetail(
  categorySlug: string,
  productSlug: string,
): Promise<TabernaProductDetailResponse> {
  const { data } = await api.get<TabernaProductDetailResponse>(
    `${TABERNA_STORE_BASE}/products/${categorySlug}/${productSlug}`,
  )
  return data
}

export async function fetchProductCategories(): Promise<TabernaCategoryNavItem[]> {
  const { data } = await api.get<TabernaCategoryNavItem[]>(
    `${TABERNA_STORE_BASE}/product-categories/`,
  )
  return data
}

export async function searchProducts(query: string): Promise<TabernaProduct[]> {
  const { data } = await api.post<TabernaProduct[]>(`${TABERNA_STORE_BASE}/products/search/`, {
    query,
  })
  return data
}
