import db from '../config/database';

export interface Product {
  id?: number;
  user_id: string; // UUID do Supabase Auth
  category_id?: number;
  category?: string;
  title: string;
  description: string;
  price: number;
  size: string;
  condition: 'Novo' | 'Seminovo' | 'Usado' | string;
  image_url: string;
  status?: 'disponivel' | 'reservado' | 'vendido' | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

const MEMORY_PRODUCTS: Product[] = [
  {
    id: 1,
    user_id: 'mock-user-1',
    title: 'Jaqueta Jeans Vintage 90s',
    description: 'Jaqueta jeans oversized original dos anos 90, lavagem clara, em excelente estado de conservação.',
    price: 149.90,
    size: 'G',
    condition: 'Seminovo',
    category: 'Casacos',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 'mock-user-1',
    title: 'Vestido Midi Floral Bohemio',
    description: 'Vestido midi em tecido leve, estampa floral vintage, caimento fluido com amarração na cintura.',
    price: 89.00,
    size: 'M',
    condition: 'Novo',
    category: 'Vestidos',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 'mock-user-2',
    title: 'Bota Coturno Couro Marrom',
    description: 'Coturno de couro legítimo, sola tratorada super confortável, estilo retrô com acabamento artesanal.',
    price: 180.00,
    size: '37',
    condition: 'Usado',
    category: 'Calçados',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    user_id: 'mock-user-2',
    title: 'Camisa de Seda Estampada',
    description: 'Camisa vintage 100% seda pura, botões perolados, caimento impecável e estampa exclusiva.',
    price: 110.00,
    size: 'P',
    condition: 'Seminovo',
    category: 'Camisas',
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    user_id: 'mock-user-3',
    title: 'Calça Jeans Mom High Waist',
    description: 'Calça mom jeans cintura alta, 100% algodão, modelo clássico e extremamente versátil.',
    price: 95.00,
    size: '38',
    condition: 'Seminovo',
    category: 'Calças',
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel',
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    user_id: 'mock-user-3',
    title: 'Bolsa Baguete Vintage Couro',
    description: 'Bolsa estilo baguete vintage, couro marrom caramelo com fivela dourada retrô.',
    price: 75.00,
    size: 'Único',
    condition: 'Novo',
    category: 'Acessórios',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel',
    created_at: new Date().toISOString()
  }
];

export const ProductService = {
  async create(data: Product) {
    try {
      if (db) {
        const [id] = await db('products').insert(data);
        return id;
      }
    } catch {
      console.warn('[AI Studio] Using memory store for product creation');
    }
    const newId = MEMORY_PRODUCTS.length + 1;
    const newProduct = { ...data, id: newId, created_at: new Date().toISOString() };
    MEMORY_PRODUCTS.unshift(newProduct);
    return newId;
  },

  async getAll(filters: any = {}) {
    try {
      if (db) {
        let query = db('products').select('*').orderBy('created_at', 'desc');

        if (filters.category) {
          query = query.where('category_id', filters.category);
        }
        if (filters.condition) {
          query = query.where('condition', filters.condition);
        }
        if (filters.search) {
          query = query.where('title', 'like', `%${filters.search}%`);
        }

        const res = await query;
        if (res && res.length > 0) return res;
      }
    } catch {
      console.warn('[AI Studio] Using memory store for products list');
    }

    let list = [...MEMORY_PRODUCTS];
    if (filters.category && filters.category !== 'Todas') {
      list = list.filter(p => p.category?.toLowerCase() === String(filters.category).toLowerCase());
    }
    if (filters.condition && filters.condition !== 'Todas') {
      list = list.filter(p => p.condition?.toLowerCase() === String(filters.condition).toLowerCase());
    }
    if (filters.search) {
      const s = String(filters.search).toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    return list;
  },

  async getById(id: number) {
    try {
      if (db) {
        const res = await db('products').where({ id }).first();
        if (res) return res;
      }
    } catch {
      console.warn('[AI Studio] Using memory store for product lookup');
    }
    return MEMORY_PRODUCTS.find(p => p.id === Number(id)) || null;
  },

  async update(id: number, data: Partial<Product>) {
    try {
      if (db) {
        return await db('products').where({ id }).update(data);
      }
    } catch {
      console.warn('[AI Studio] Using memory store for product update');
    }
    const idx = MEMORY_PRODUCTS.findIndex(p => p.id === Number(id));
    if (idx !== -1) {
      MEMORY_PRODUCTS[idx] = { ...MEMORY_PRODUCTS[idx], ...data };
      return 1;
    }
    return 0;
  },

  async delete(id: number) {
    try {
      if (db) {
        return await db('products').where({ id }).del();
      }
    } catch {
      console.warn('[AI Studio] Using memory store for product delete');
    }
    const idx = MEMORY_PRODUCTS.findIndex(p => p.id === Number(id));
    if (idx !== -1) {
      MEMORY_PRODUCTS.splice(idx, 1);
      return 1;
    }
    return 0;
  }
};

