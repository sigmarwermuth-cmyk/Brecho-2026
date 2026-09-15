import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  created_at: string;
  status: 'disponivel' | 'reservado' | 'vendido' | string;
}

export default function ProductManagement() {
  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyProducts() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMyProducts(data || []);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMyProducts();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setMyProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err: any) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  const handleRemove = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este anúncio?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setMyProducts(prev => prev.filter(p => p.id !== id));
      alert('Produto removido com sucesso!');
    } catch (err: any) {
      alert('Erro ao remover produto: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-[#26221C]">
        <p className="text-xl font-medium animate-pulse">Carregando seus produtos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6 pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#26221C]">Meus Anúncios</h1>
            <p className="text-gray-600">Gerencie as peças que você colocou à venda</p>
          </div>
          <button
            onClick={() => navigate('/add-product')}
            className="bg-[#26221C] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3d3830] transition-colors"
          >
            + Novo Produto
          </button>
        </header>

        {myProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D2CBBF] shadow-sm">
            <p className="text-xl text-gray-500 mb-4">Você ainda não possui anúncios ativos.</p>
            <button
              onClick={() => navigate('/add-product')}
              className="text-[#26221C] font-bold underline hover:text-gray-800"
            >
              Comece a vender agora!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myProducts.map(product => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-2xl border border-[#D2CBBF] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-16 h-16 object-cover rounded-xl"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#26221C]">{product.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        product.status === 'vendido' 
                          ? 'bg-gray-100 text-gray-600'
                          : product.status === 'reservado'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {product.status === 'vendido' ? 'Vendido' : product.status === 'reservado' ? 'Reservado' : 'Disponível'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <select
                    value={product.status || 'disponivel'}
                    onChange={(e) => handleStatusChange(product.id, e.target.value)}
                    className="text-xs font-semibold bg-[#EDE8DD]/60 border border-[#D2CBBF] rounded-lg px-2.5 py-1.5 text-[#26221C] focus:outline-none focus:ring-1 focus:ring-[#26221C]"
                    title="Mudar status da peça"
                  >
                    <option value="disponivel">🟢 Disponível</option>
                    <option value="reservado">🟡 Reservado</option>
                    <option value="vendido">⚪ Vendido</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/edit-product/${product.id}`)}
                      className="bg-gray-100 text-[#26221C] p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Editar Produto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Remover Produto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM14 16a2 2 0 11-4 0 2 2 0 014 0zm-5-11V4a1 1 0 112 0v1h-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
