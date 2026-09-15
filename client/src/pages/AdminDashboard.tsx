import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalConversations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count: pCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
        const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: cCount } = await supabase.from('conversations').select('*', { count: 'exact', head: true });

        setStats({
          totalProducts: pCount || 0,
          totalUsers: uCount || 0,
          totalConversations: cCount || 0
        });
      } catch (err) {
        console.error('Erro ao carregar stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-6 text-center">Carregando painel...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#26221C] mb-8">Painel Administrativo</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl border border-[#D2CBBF] shadow-sm text-center">
          <p className="text-gray-500 font-medium mb-2">Total de Produtos</p>
          <p className="text-4xl font-bold text-[#26221C]">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#D2CBBF] shadow-sm text-center">
          <p className="text-gray-500 font-medium mb-2">Usuários Cadastrados</p>
          <p className="text-4xl font-bold text-[#26221C]">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-[#D2CBBF] shadow-sm text-center">
          <p className="text-gray-500 font-medium mb-2">Conversas Ativas</p>
          <p className="text-4xl font-bold text-[#26221C]">{stats.totalConversations}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#D2CBBF] shadow-sm">
        <h2 className="text-2xl font-bold text-[#26221C] mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/admin/products"
            className="p-4 text-left bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors font-medium text-[#26221C]"
          >
            🔍 Moderar Produtos
          </Link>
          <Link
            to="/admin/users"
            className="p-4 text-left bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors font-medium text-[#26221C]"
          >
            👥 Gerenciar Usuários
          </Link>
        </div>
      </div>
    </div>
  );
}
