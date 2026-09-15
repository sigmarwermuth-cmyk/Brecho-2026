import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

interface ConversationItem {
  id: string;
  product: {
    id: number;
    title: string;
    image_url: string;
    price: number;
    status?: string;
  };
  otherUser: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  role: 'Vendedor(a)' | 'Comprador(a)';
}

export default function ChatList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Busca conversas onde o usuário é comprador ou vendedor
        const { data: convs, error: convErr } = await supabase
          .from('conversations')
          .select('*, products(*)')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (convErr) throw convErr;

        if (!convs || convs.length === 0) {
          setConversations([]);
          return;
        }

        // Identifica os IDs dos interlocutores
        const otherUserIds = Array.from(
          new Set(
            convs.map((c) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id)).filter(Boolean)
          )
        );

        // Busca os perfis correspondentes
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', otherUserIds);

        const profileMap = new Map<string, { name: string; avatar_url: string | null }>();
        profiles?.forEach((p) => {
          profileMap.set(p.id, {
            name: p.full_name || 'Usuário Brechó',
            avatar_url: p.avatar_url,
          });
        });

        const formatted: ConversationItem[] = convs.map((c) => {
          const isBuyer = c.buyer_id === user.id;
          const otherId = isBuyer ? c.seller_id : c.buyer_id;
          const otherProfile = profileMap.get(otherId) || {
            name: isBuyer ? 'Vendedor(a)' : 'Comprador(a)',
            avatar_url: null,
          };

          return {
            id: c.id,
            product: {
              id: c.products?.id,
              title: c.products?.title || 'Peça não encontrada',
              image_url: c.products?.image_url || '',
              price: Number(c.products?.price) || 0,
              status: c.products?.status || 'disponivel',
            },
            otherUser: {
              id: otherId,
              name: otherProfile.name,
              avatar_url: otherProfile.avatar_url,
            },
            role: isBuyer ? 'Vendedor(a)' : 'Comprador(a)',
          };
        });

        setConversations(formatted);
      } catch (err) {
        console.error('Erro ao carregar chats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-[#26221C]">
        <p className="text-xl font-medium animate-pulse">Carregando suas conversas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6 pb-24 md:pb-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#26221C]">Minhas Conversas</h1>
          <p className="text-gray-600">Negocie suas peças favoritas aqui</p>
        </header>

        {conversations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D2CBBF] shadow-sm p-8">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-xl font-bold text-[#26221C] mb-2">Nenhuma conversa no momento</p>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Quando você demonstrar interesse em uma peça ou alguém se interessar por uma peça sua, a conversa aparecerá aqui.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#26221C] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#3d3830] transition-colors"
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map(({ id, product, otherUser, role }) => (
              <Link
                key={id}
                to={`/chat/${id}`}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#D2CBBF] shadow-sm hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar do Interlocutor */}
                  {otherUser.avatar_url ? (
                    <img
                      src={otherUser.avatar_url}
                      alt={otherUser.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#D2CBBF] shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#26221C] text-white flex items-center justify-center font-bold text-base shrink-0">
                      {otherUser.name ? otherUser.name[0].toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-[#26221C] truncate group-hover:text-gray-800">
                        {otherUser.name}
                      </h3>
                      <span className="text-[10px] font-semibold bg-[#EDE8DD] text-[#26221C] px-2 py-0.5 rounded-full shrink-0">
                        {role}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {product.title} • <span className="font-semibold text-[#26221C]">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                    </p>
                    {product.status && product.status !== 'disponivel' && (
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded mt-1 ${
                        product.status === 'vendido' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {product.status === 'vendido' ? 'Peça Vendida' : 'Peça Reservada'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded-lg border border-[#D2CBBF]"
                    />
                  )}
                  <span className="text-[#26221C] font-bold group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
