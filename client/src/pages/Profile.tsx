import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: '',
    bio: '',
    website: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!user) return;
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile({
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || '',
            bio: data.bio || '',
            website: data.website || '',
          });
        }
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleUploadAvatar = async (userId: string, file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage.from('avatars').upload(filePath, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!user) throw new Error('Usuário não autenticado');

      let finalAvatarUrl = profile.avatar_url;

      if (imageFile) {
        finalAvatarUrl = await handleUploadAvatar(user.id, imageFile);
      }

      const { data, error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.full_name,
        bio: profile.bio,
        website: profile.website,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          website: data.website || '',
        });
      }

      alert('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err: any) {
      alert('Erro ao salvar perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE8DD] text-[#26221C]">
        <p className="text-xl font-medium animate-pulse">Carregando seu perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-[#D2CBBF]">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 bg-[#26221C] rounded-full flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg overflow-hidden border-4 border-white">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.full_name?.charAt(0).toUpperCase() || '?'
              )}
            </div>

            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-[#26221C] text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 1a1 1 0 00-2 0v6a1 1 0 002 0V6zm6 0a1 1 0 00-2 0v6a1 1 0 002 0V6z" clipRule="evenodd" />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>

          <h1 className="text-3xl font-bold text-[#26221C]">
            {isEditing ? (
              <input
                className="text-center border-b-2 border-[#26221C] outline-none bg-transparent"
                value={profile.full_name}
                onChange={e => setProfile({...profile, full_name: e.target.value})}
              />
            ) : (
              profile.full_name || 'Usuário sem nome'
            )}
          </h1>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Bio</label>
                <textarea
                  className="p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#26221C]"
                  rows={3}
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Website / Redes Sociais</label>
                <input
                  className="p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#26221C]"
                  value={profile.website}
                  onChange={e => setProfile({...profile, website: e.target.value})}
                  placeholder="https://instagram.com/seuusuario"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#26221C] text-white py-3 rounded-xl font-bold hover:bg-[#3d3830] transition-colors disabled:bg-gray-400"
              >
                {saving ? 'Salvando...' : 'Salvar Perfil'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-6 bg-[#EDE8DD] rounded-2xl border border-[#D2CBBF]">
              <h3 className="text-lg font-bold text-[#26221C] mb-2">Sobre mim</h3>
              <p className="text-gray-600 italic">
                {profile.bio || 'Este usuário ainda não escreveu uma bio.'}
              </p>
            </div>

            <div className="flex justify-between items-center p-4 bg-white border border-[#D2CBBF] rounded-2xl">
              <span className="text-sm text-gray-500 font-medium">Link Externo:</span>
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-[#26221C] font-bold hover:underline"
              >
                {profile.website || 'Nenhum link informado'}
              </a>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-white text-[#26221C] border-2 border-[#26221C] py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Editar Perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
