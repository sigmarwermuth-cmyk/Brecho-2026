import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { apiFetch } from '../lib/api';

interface UserProfile {
  id: string;
  full_name: string;
  is_admin: boolean;
  updated_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !currentStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u));
      alert(currentStatus ? 'Usuário removido dos administradores.' : 'Usuário promovido a administrador!');
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`TEM CERTEZA? Você está prestes a deletar permanentemente o usuário ${userName}. Esta ação não pode ser desfeita.`)) return;

    try {
      await apiFetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('Usuário removido com sucesso!');
    } catch (err: any) {
      alert('Erro ao deletar usuário: ' + err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Carregando lista de usuários...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-[#26221C] mb-8">Gerenciar Usuários</h1>

      <div className="bg-white rounded-3xl border border-[#D2CBBF] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-[#26221C]">
              <th className="p-4 font-bold">Nome</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-[#26221C]">{user.full_name || 'Sem nome'}</div>
                  <div className="text-xs text-gray-400 font-mono">{user.id.substring(0, 8)}...</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.is_admin ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {user.is_admin ? 'Administrador' : 'Usuário'}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button
                    onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      user.is_admin
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-[#26221C] text-white hover:bg-[#3d3830]'
                    }`}
                  >
                    {user.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.full_name || 'usuário')}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Deletar Conta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            Nenhum perfil encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
