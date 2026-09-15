import { isSupabaseConfigured, supabase } from './supabaseClient'

export type Product = {
  id: number
  title: string
  description: string
  price: number
  size: string
  condition: string
  image_url: string
  category: string
  status: string
}

export type ProductsResult = {
  products: Product[]
  error: string | null
  code: string | null
}

export async function fetchProducts(search = ''): Promise<ProductsResult> {
  if (!isSupabaseConfigured) {
    return {
      products: [],
      error: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em client/.env',
      code: 'NOT_CONFIGURED',
    }
  }

  let query = supabase
    .from('products')
    .select('id, title, description, price, size, condition, image_url, category, status')
    .order('created_at', { ascending: false })

  const term = search.trim()
  if (term) {
    query = query.ilike('title', `%${term}%`)
  }

  const { data, error } = await query

  if (error) {
    return { products: [], error: error.message, code: error.code ?? 'QUERY_ERROR' }
  }

  const products = (data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
  })) as Product[]

  return { products, error: null, code: null }
}
