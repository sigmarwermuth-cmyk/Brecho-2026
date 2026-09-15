import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      setIsAdmin(data?.is_admin || false);
    }
    checkAdmin();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white border-b border-[#D2CBBF] px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-[#26221C] hover:opacity-80 transition-opacity">
          👕 Brechó App
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#26221C]">
            <Link to="/" className="hover:text-gray-500 transition-colors">Catálogo</Link>
            <Link to="/my-products" className="hover:text-gray-500 transition-colors">Meus Anúncios</Link>
            <Link to="/chats" className="hover:text-gray-500 transition-colors">Conversas</Link>
            <Link to="/profile" className="hover:text-gray-500 transition-colors">Meu Perfil</Link>
            {isAdmin && (
              <Link to="/admin" className="bg-red-100 text-red-600 px-2 py-1 rounded-md hover:bg-red-200 transition-colors">
                Admin
              </Link>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors border border-red-100"
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#D2CBBF] px-4 py-3 flex justify-between items-center z-50 pb-safe">
        <Link to="/" className="flex flex-col items-center gap-1 text-[#26221C] text-[10px] font-medium">
          <span className="text-xl">🛍️</span>
          Catálogo
        </Link>
        <Link to="/my-products" className="flex flex-col items-center gap-1 text-[#26221C] text-[10px] font-medium">
          <span className="text-xl">👕</span>
          Meus Anúncios
        </Link>
        <Link to="/chats" className="flex flex-col items-center gap-1 text-[#26221C] text-[10px] font-medium">
          <span className="text-xl">💬</span>
          Conversas
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 text-[#26221C] text-[10px] font-medium">
          <span className="text-xl">👤</span>
          Perfil
        </Link>
      </div>
    </>
  );
};
