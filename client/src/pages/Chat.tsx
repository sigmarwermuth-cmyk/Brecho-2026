import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ProductInfo {
  id: number;
  title: string;
  image_url: string;
  price: number;
  status?: string;
}

interface OtherUserInfo {
  name: string;
  avatar_url: string | null;
  role: string;
}

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUserInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function setupChat() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // 1. Busca dados da conversa, produto e participantes
      const { data: conv } = await supabase
        .from('conversations')
        .select('*, products(*)')
        .eq('id', conversationId)
        .single();

      if (conv) {
        if (conv.products) {
          setProduct({
            id: conv.products.id,
            title: conv.products.title,
            image_url: conv.products.image_url,
            price: Number(conv.products.price) || 0,
            status: conv.products.status || 'disponivel',
          });
        }

        const isBuyer = conv.buyer_id === user?.id;
        const otherId = isBuyer ? conv.seller_id : conv.buyer_id;
        const role = isBuyer ? 'Vendedor(a)' : 'Interessado(a)';

        if (otherId) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', otherId)
            .single();

          setOtherUser({
            name: prof?.full_name || (isBuyer ? 'Vendedor(a)' : 'Comprador(a)'),
            avatar_url: prof?.avatar_url || null,
            role,
          });
        }
      }

      // 2. Busca mensagens iniciais
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgs) setMessages(msgs);

      // 3. Inscrição em Tempo Real (REALTIME)
      const channel = supabase
        .channel(`chat:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    setupChat();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const { error } = await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        sender_id: userId,
        content: newMessage,
      },
    ]);

    if (error) {
      alert('Erro ao enviar mensagem: ' + error.message);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE8DD] flex flex-col">
      {/* Header com Navegação e Contexto da Peça */}
      <header className="bg-white border-b border-[#D2CBBF] sticky top-0 z-20 shadow-xs">
        <div className="p-3.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chats')}
              className="p-1.5 -ml-1 text-[#26221C] hover:bg-gray-100 rounded-lg transition-colors font-bold text-lg"
              title="Voltar para conversas"
            >
              ←
            </button>

            {otherUser?.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover border border-[#D2CBBF]"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#26221C] text-white flex items-center justify-center font-bold text-sm">
                {otherUser?.name ? otherUser.name[0].toUpperCase() : '💬'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#26221C] truncate max-w-[180px] sm:max-w-xs">
                  {otherUser?.name || 'Conversa'}
                </h1>
                {otherUser?.role && (
                  <span className="text-[10px] font-semibold bg-[#EDE8DD] text-[#26221C] px-2 py-0.5 rounded-full">
                    {otherUser.role}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Em tempo real
              </p>
            </div>
          </div>
        </div>

        {/* Mini-Card da Peça Negociada */}
        {product && (
          <div className="px-4 py-2 bg-[#EDE8DD]/50 flex items-center justify-between gap-3 text-xs border-t border-[#D2CBBF]/40">
            <div className="flex items-center gap-2.5 min-w-0">
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-8 h-8 rounded object-cover border border-[#D2CBBF] shrink-0"
                />
              )}
              <span className="font-semibold text-[#26221C] truncate">{product.title}</span>
              <span className="text-gray-600 font-medium shrink-0">
                • R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.status && product.status !== 'disponivel' && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  product.status === 'vendido' ? 'bg-gray-200 text-gray-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {product.status === 'vendido' ? 'Vendida' : 'Reservada'}
                </span>
              )}
            </div>

            <Link
              to={`/product/${product.id}`}
              className="text-[#26221C] font-bold underline hover:opacity-75 shrink-0"
            >
              Ver Peça ↗
            </Link>
          </div>
        )}
      </header>

      {/* Lista de Mensagens */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-2">🤝</p>
            <p className="font-bold text-[#26221C] mb-1">Inicie a negociação!</p>
            <p className="text-xs max-w-xs mx-auto text-gray-600">
              Tire dúvidas sobre medidas, estado da peça ou combine a entrega.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.sender_id === userId
                    ? 'bg-[#26221C] text-white rounded-tr-none'
                    : 'bg-white text-[#26221C] border border-[#D2CBBF] rounded-tl-none shadow-xs'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[10px] block text-right mt-1 ${
                  msg.sender_id === userId ? 'text-gray-300' : 'text-gray-400'
                }`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Formulário de Envio de Mensagem */}
      <footer className="p-3 bg-white border-t border-[#D2CBBF]">
        <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-3 bg-[#EDE8DD]/30 border border-[#D2CBBF] rounded-xl outline-none focus:ring-2 focus:ring-[#26221C] text-sm text-[#26221C]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#26221C] text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-[#3d3830] transition-colors disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
}
