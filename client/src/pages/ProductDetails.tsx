import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  size: string;
  condition: string;
  image_url: string;
  category: string;
  user_id: string;
  status?: string;
}

interface SellerProfile {
  full_name: string;
  avatar_url: string;
  bio?: string;
}

const SAMPLE_PRODUCTS: Record<string, Product> = {
  '1': {
    id: 1,
    title: 'Jaqueta Jeans Vintage 90s',
    description: 'Jaqueta jeans oversized original dos anos 90, lavagem clara, em excelente estado de conservação.',
    price: 149.90,
    size: 'G',
    condition: 'Seminovo',
    category: 'Casacos',
    user_id: 'mock-seller-1',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel'
  },
  '2': {
    id: 2,
    title: 'Vestido Midi Floral Bohemio',
    description: 'Vestido midi em tecido leve, estampa floral vintage, caimento fluido com amarração na cintura.',
    price: 89.00,
    size: 'M',
    condition: 'Novo',
    category: 'Vestidos',
    user_id: 'mock-seller-1',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel'
  },
  '3': {
    id: 3,
    title: 'Bota Coturno Couro Marrom',
    description: 'Coturno de couro legítimo, sola tratorada super confortável, estilo retrô com acabamento artesanal.',
    price: 180.00,
    size: '37',
    condition: 'Usado',
    category: 'Calçados',
    user_id: 'mock-seller-2',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel'
  },
  '4': {
    id: 4,
    title: 'Camisa de Seda Estampada',
    description: 'Camisa vintage 100% seda pura, botões perolados, caimento impecável e estampa exclusiva.',
    price: 110.00,
    size: 'P',
    condition: 'Seminovo',
    category: 'Camisas',
    user_id: 'mock-seller-2',
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel'
  },
  '5': {
    id: 5,
    title: 'Calça Jeans Mom High Waist',
    description: 'Calça mom jeans cintura alta, 100% algodão, modelo clássico e extremamente versátil.',
    price: 95.00,
    size: '38',
    condition: 'Seminovo',
    category: 'Calças',
    user_id: 'mock-seller-3',
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel'
  },
  '6': {
    id: 6,
    title: 'Bolsa Baguete Vintage Couro',
    description: 'Bolsa estilo baguete vintage, couro marrom caramelo com fivela dourada retrô.',
    price: 75.00,
    size: 'Único',
    condition: 'Novo',
    category: 'Acessórios',
    user_id: 'mock-seller-3',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    status: 'disponivel'
  }
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatting, setChatting] = useState(false);

  useEffect(() => {
    async function fetchProductAndUser() {
      try {
        setLoading(true);
        setError(null);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setCurrentUserId(user?.id || null);
        } catch {
          setCurrentUserId(null);
        }

        let foundProduct: Product | null = null;
        try {
          const { data, error: prodErr } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (!prodErr && data) {
            foundProduct = data;
          }
        } catch {
          foundProduct = null;
        }

        if (!foundProduct) {
          const apiRes = await fetch(`/api/products/${id}`).then(r => r.json()).catch(() => null);
          if (apiRes && apiRes.id) {
            foundProduct = apiRes;
          } else if (id && SAMPLE_PRODUCTS[id]) {
            foundProduct = SAMPLE_PRODUCTS[id];
          }
        }

        if (foundProduct) {
          setProduct(foundProduct);
          setSellerProfile({
            full_name: 'Vendedor Brechó',
            avatar_url: '',
            bio: 'Amante de moda sustentável e peças garimpadas.'
          });
        } else {
          setError('Produto não encontrado.');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar detalhes do produto.');
      } finally {
        setLoading(false);
      }
    }

    fetchProductAndUser();
  }, [id]);

  const isOwner = Boolean(currentUserId && product && currentUserId === product.user_id);

  const handleInterest = async () => {
    if (!product) return;
    if (isOwner) {
      navigate(`/edit-product/${product.id}`);
      return;
    }

    setChatting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado para entrar em contato.');

      // 1. Verifica se já existe uma conversa entre este comprador e este produto
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .single();

      let convId = existingConv?.id;

      // 2. Se não existir, cria uma nova conversa
      if (!convId) {
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert([
            {
              product_id: product.id,
              buyer_id: user.id,
              seller_id: product.user_id,
            },
          ])
          .select()
          .single();

        if (convErr) throw convErr;
        convId = newConv.id;
      }

      // 3. Redireciona para o chat
      navigate(`/chat/${convId}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setChatting(false);
    }
  };

  // Share button handler
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product/${product?.id}`;
    if (navigator.share) {
      await navigator.share({ title: product?.title ?? 'Peça', url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copiado para a área de transferência');
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-[#26221C]">
        <p className="text-xl font-medium animate-pulse">Carregando detalhes da peça...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-red-600">
        <div className="text-center">
          <p className="text-xl mb-4">Produto não encontrado.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#26221C] text-white px-4 py-2 rounded-lg"
          >
            Voltar ao Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-[#26221C] font-medium hover:underline"
        >
          ← Voltar para o catálogo
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-[#D2CBBF]">
          {/* Imagem */}
          <div className="rounded-2xl overflow-hidden h-[500px] bg-gray-50">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Detalhes */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {product.category}
              </span>
              {product.status && product.status !== 'disponivel' && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  product.status === 'vendido'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {product.status === 'vendido' ? 'Peça Vendida' : 'Peça Reservada'}
                </span>
              )}
            </div>

            <h1 className="text-4xl font-bold text-[#26221C] mb-4">{product.title}</h1>

            <div className="flex gap-4 mb-6">
              {product.size && (
                <div className="bg-[#EDE8DD] px-3 py-1 rounded-full text-sm font-medium text-[#26221C]">
                  Tamanho: {product.size}
                </div>
              )}
              <div className="bg-[#EDE8DD] px-3 py-1 rounded-full text-sm font-medium text-[#26221C]">
                Estado: {product.condition}
              </div>
            </div>

            <p className="text-2xl font-bold text-[#26221C] mb-6">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#26221C] mb-2">Descrição</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Perfil do Vendedor */}
            {sellerProfile && (
              <div className="flex items-center gap-3 p-3.5 bg-[#EDE8DD]/50 rounded-2xl border border-[#D2CBBF] mb-6">
                {sellerProfile.avatar_url ? (
                  <img
                    src={sellerProfile.avatar_url}
                    alt={sellerProfile.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-[#D2CBBF]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#26221C] text-white flex items-center justify-center font-bold text-base">
                    {sellerProfile.full_name ? sellerProfile.full_name[0].toUpperCase() : 'V'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">Anunciado por</p>
                  <p className="text-sm font-bold text-[#26221C] truncate">{sellerProfile.full_name || 'Vendedor Brechó'}</p>
                  {sellerProfile.bio && (
                    <p className="text-xs text-gray-600 truncate mt-0.5">{sellerProfile.bio}</p>
                  )}
                </div>
              </div>
            )}

            {/* Ações contextuais */}
            {isOwner ? (
              <div className="mt-auto bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1 text-amber-900 font-bold text-sm">
                  <span>⭐</span> Esta peça é sua!
                </div>
                <p className="text-xs text-amber-800 mb-4">
                  Você pode alterar preço, fotos e informações ou alterar o status da venda.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-product/${product.id}`)}
                    className="flex-1 bg-[#26221C] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#3d3830] transition-colors"
                  >
                    Editar Peça
                  </button>
                  <button
                    onClick={() => navigate('/my-products')}
                    className="px-4 bg-white text-[#26221C] border border-[#D2CBBF] py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Meus Anúncios
                  </button>
                </div>
              </div>
            ) : product.status === 'vendido' ? (
              <div className="mt-auto">
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 py-4 rounded-xl font-bold text-lg cursor-not-allowed"
                >
                  Peça Vendida
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Esta peça já foi vendida e não está mais disponível para negociação.
                </p>
              </div>
            ) : (
              <div className="mt-auto">
                <button
                  onClick={handleInterest}
                  disabled={chatting}
                  className="w-full bg-[#26221C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3d3830] transition-colors shadow-lg disabled:bg-gray-400"
                >
                  {chatting ? 'Conectando...' : product.status === 'reservado' ? 'Conversar sobre Peça (Reservada)' : 'Tenho Interesse'}
                </button>
                <button
                  onClick={handleShare}
                  className="w-full bg-[#26221C] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#3d3830] transition-colors shadow-lg mt-2"
                >
                  Compartilhar Peça
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Ao clicar, você abrirá um chat privado com o vendedor.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
