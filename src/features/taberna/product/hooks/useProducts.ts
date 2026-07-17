import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAlertStore } from '@core/alert/alert.store'
import {
  fetchCategoryProducts,
  fetchLatestProducts,
  fetchProductCategories,
  fetchProductDetail,
  searchProducts,
} from '@features/taberna/product/api/products'
import { getErrorMessage } from '@shared/utils/error'

function useQueryErrorAlert(isError: boolean, error: Error | null, fallback: string) {
  const enqueue = useAlertStore((s) => s.enqueue)

  useEffect(() => {
    if (isError) {
      enqueue('error', getErrorMessage(error, fallback))
    }
  }, [isError, error, enqueue, fallback])
}

export function useLatestProducts() {
  const query = useQuery({
    queryKey: ['taberna', 'products', 'latest'],
    queryFn: fetchLatestProducts,
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load products')

  return query
}

export function useProductCategories() {
  const query = useQuery({
    queryKey: ['taberna', 'categories'],
    queryFn: fetchProductCategories,
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load categories')

  return query
}

export function useCategoryProducts(categorySlug: string | undefined) {
  const query = useQuery({
    queryKey: ['taberna', 'products', 'category', categorySlug],
    queryFn: () => fetchCategoryProducts(categorySlug ?? ''),
    enabled: Boolean(categorySlug),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load category')

  return query
}

export function useProductDetail(categorySlug: string | undefined, productSlug: string | undefined) {
  const query = useQuery({
    queryKey: ['taberna', 'products', 'detail', categorySlug, productSlug],
    queryFn: () => fetchProductDetail(categorySlug ?? '', productSlug ?? ''),
    enabled: Boolean(categorySlug && productSlug),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to load product')

  return query
}

export function useProductSearch(queryText: string) {
  const trimmedQuery = queryText.trim()
  const query = useQuery({
    queryKey: ['taberna', 'products', 'search', trimmedQuery],
    queryFn: () => searchProducts(trimmedQuery),
    enabled: Boolean(trimmedQuery),
  })

  useQueryErrorAlert(query.isError, query.error, 'Failed to search products')

  return query
}
