import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Product {
  id: number;
  title: string;
  price: number;
  image_url: string;
  user_id: string;
  category: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllProducts();
  }, []);

  const handleRemoveProduct = async (id: number) => {
    if (!confirm('Deseja remover este produto do sistema? Esta ação é irreversível.')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      alert('Produto removido com sucesso!');
    } catch (err: any) {
      alert('Erro ao remover produto: ' + err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Carregando lista de moderação...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#26221C] mb-8">Moderação de Produtos</h1>

      <div className="bg-white rounded-3xl border border-[#D2CBBF] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-[#26221C]">Produto</th>
              <th className="p-4 font-bold text-[#26221C]">Categoria</th>
              <th className="p-4 font-bold text-[#26221C]">Preço</th>
              <th className="p-4 font-bold text-[#26221C]">Vendedor ID</th>
              <th className="p-4 font-bold text-[#26221C] text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                  <span className="font-medium text-[#26221C]">{product.title}</span>
                </td>
                <td className="p-4 text-gray-600">{product.category}</td>
                <td className="p-4 text-gray-600">R$ {product.price.toFixed(2)}</td>
                <td className="p-4 text-xs text-gray-400 font-mono">{product.user_id.substring(0, 8)}...</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleRemoveProduct(product.id)}
                    className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                    title="Remover Produto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM14 16a2 2 0 11-4 0 2 2 0 014 0zm-5-11V4a1 1 0 112 0v1h-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Nenhum produto encontrado para moderação.
          </div>
        )}
      </div>
    </div>
  );
}
