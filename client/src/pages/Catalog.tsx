import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ProductCard } from '../components/ProductCard';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  size: string;
  condition: string;
  image_url: string;
  category: string;
  status?: string;
  created_at?: string;
}

const CATEGORIES = ['Todas', 'Casacos', 'Vestidos', 'Calçados', 'Camisas', 'Calças', 'Acessórios'];
const CONDITIONS = ['Todas', 'Novo', 'Seminovo', 'Usado'];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1,
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

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedCondition, setSelectedCondition] = useState('Todas');
  const [sortBy, setSortBy] = useState<'recentes' | 'preco_asc' | 'preco_desc'>('recentes');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('brecho_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          // Tenta buscar da API backend ou fallback
          const apiRes = await fetch('/api/products').then(r => r.json()).catch(() => null);
          if (Array.isArray(apiRes) && apiRes.length > 0) {
            setProducts(apiRes);
          } else {
            setProducts(SAMPLE_PRODUCTS);
          }
        } else {
          setProducts(data);
        }
      } catch {
        setProducts(SAMPLE_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      try {
        localStorage.setItem('brecho_favorites', JSON.stringify(Array.from(next)));
      } catch (e) {
        console.error('Erro ao salvar favoritos:', e);
      }
      return next;
    });
  };

  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      // Ignora produtos marcados como vendidos
      if (product.status === 'vendido') return false;

      // Filtro de Favoritos
      if (onlyFavorites && !favorites.has(product.id)) {
        return false;
      }

      // Filtro por categoria
      if (selectedCategory !== 'Todas') {
        const prodCat = (product.category || '').trim().toLowerCase();
        if (prodCat !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Filtro por condição
      if (selectedCondition !== 'Todas') {
        if (product.condition?.toLowerCase() !== selectedCondition.toLowerCase()) {
          return false;
        }
      }

      // Filtro por busca textual
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesTitle = product.title?.toLowerCase().includes(query);
        const matchesDesc = product.description?.toLowerCase().includes(query);
        const matchesCategory = product.category?.toLowerCase().includes(query);
        const matchesSize = product.size?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesSize) {
          return false;
        }
      }

      return true;
    });

    // Ordenação
    if (sortBy === 'preco_asc') {
      return list.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortBy === 'preco_desc') {
      return list.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return list;
  }, [products, selectedCategory, selectedCondition, search, onlyFavorites, favorites, sortBy]);

  const hasActiveFilters = Boolean(
    search || selectedCategory !== 'Todas' || selectedCondition !== 'Todas' || onlyFavorites || sortBy !== 'recentes'
  );

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('Todas');
    setSelectedCondition('Todas');
    setOnlyFavorites(false);
    setSortBy('recentes');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-red-600 p-6">
        <div className="text-center bg-white p-8 rounded-3xl border border-red-200 max-w-md">
          <p className="text-3xl mb-2">⚠️</p>
          <p className="font-bold mb-2">Erro ao carregar produtos</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#26221C] text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6 pb-24 md:pb-6">
      <main className="max-w-6xl mx-auto space-y-6">
        {/* Barra de Busca e Filtros */}
        <div className="bg-white p-5 rounded-3xl border border-[#D2CBBF] shadow-sm space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por peça, marca, tamanho ou estilo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#EDE8DD]/40 border border-[#D2CBBF] rounded-2xl py-3 pl-11 pr-10 text-[#26221C] placeholder-[#5C5647] outline-none focus:ring-2 focus:ring-[#26221C] text-sm"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              🔍
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#26221C] font-bold text-sm"
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          {/* Chips de Categorias */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#26221C] text-white'
                      : 'bg-white text-[#26221C] border border-[#D2CBBF] hover:bg-[#EDE8DD]/60'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Linha Secundária: Condição, Favoritos e Ordenação */}
          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Chips de Condição */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-gray-500 font-medium mr-1">Estado:</span>
              {CONDITIONS.map((cond) => {
                const isSelected = selectedCondition === cond;
                return (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#26221C] text-white font-bold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              {/* Botão de Favoritos */}
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all border ${
                  onlyFavorites
                    ? 'bg-red-500 text-white border-red-500 shadow-xs'
                    : 'bg-white text-[#26221C] border-[#D2CBBF] hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <span>{onlyFavorites ? '❤️' : '🤍'}</span>
                <span>Salvos ({favorites.size})</span>
              </button>

              {/* Seletor de Ordenação */}
              <div className="flex items-center gap-1.5">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#EDE8DD]/50 border border-[#D2CBBF] rounded-xl px-3 py-1.5 font-medium text-[#26221C] focus:outline-none focus:ring-1 focus:ring-[#26221C]"
                >
                  <option value="recentes">Mais Recentes</option>
                  <option value="preco_asc">Menor Preço</option>
                  <option value="preco_desc">Maior Preço</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Cabeçalho da Lista / Contagem */}
        <div className="flex justify-between items-center px-1">
          <p className="text-sm font-medium text-[#5C5647]">
            {loading ? 'Buscando peças...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'peça encontrada' : 'peças encontradas'}`}
            {selectedCategory !== 'Todas' && ` em ${selectedCategory}`}
            {selectedCondition !== 'Todas' && ` • ${selectedCondition}`}
            {onlyFavorites && ' (Apenas Favoritos)'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#26221C] font-bold underline hover:opacity-75"
            >
              Limpar todos os filtros
            </button>
          )}
        </div>

        {/* Skeleton Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden border border-[#D2CBBF] shadow-sm flex flex-col h-full animate-pulse"
              >
                <div className="h-64 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D2CBBF] shadow-sm p-8">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-xl font-bold text-[#26221C] mb-2">Nenhuma peça encontrada</p>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              {onlyFavorites
                ? 'Você ainda não salvou nenhuma peça como favorita. Clique no coração de qualquer produto para salvá-lo aqui.'
                : 'Não encontramos nenhum produto correspondente aos filtros selecionados. Tente buscar com outros termos ou redefinir os filtros.'}
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-[#26221C] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3d3830] transition-colors"
            >
              Ver todas as peças
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
