import { api } from '@core/http/axios'
import type {
  TabernaCartProduct,
  TabernaCartVariation,
} from '@features/taberna/cart/api/cart'

const PROFILES_BASE = '/taberna-profiles/api/v1'

export type TabernaOrderPayment = {
  status: string
  payment_method: string
}

export type TabernaOrderProductLine = {
  id: number
  quantity: number
  product_price: number
  product: TabernaCartProduct
  variations: TabernaCartVariation[]
}

export type TabernaUserOrder = {
  id: number
  order_number: string
  created_at: string
  tax: number | string
  order_total: number | string
  payment?: TabernaOrderPayment
  order_products: TabernaOrderProductLine[]
}

export async function fetchUserOrders(): Promise<TabernaUserOrder[]> {
  const { data } = await api.get<TabernaUserOrder[]>(`${PROFILES_BASE}/orders/`)
  return data
}
