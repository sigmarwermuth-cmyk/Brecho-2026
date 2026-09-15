import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    size: '',
    condition: 'Seminovo',
    category: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const uploadImage = async (user: any, file: File) => {
    // Cria um nome único para o arquivo usando o ID do usuário e o timestamp
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obtém a URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let finalImageUrl = '';

      if (imageFile) {
        setUploadingImage(true);
        finalImageUrl = await uploadImage(user, imageFile);
        setUploadingImage(false);
      } else {
        throw new Error('Por favor, selecione uma imagem para o produto');
      }

      const { error } = await supabase.from('products').insert([
        {
          ...formData,
          price: parseFloat(formData.price),
          image_url: finalImageUrl,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      alert('Produto cadastrado com sucesso!');
      navigate('/');
    } catch (err: any) {
      alert('Erro ao cadastrar produto: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE8DD] p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-[#D2CBBF]">
        <h1 className="text-3xl font-bold text-[#26221C] mb-6 text-center">Anunciar Nova Peça</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Título do Produto *</label>
              <input
                required
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26221C] outline-none"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Jaqueta Jeans Vintage"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Categoria *</label>
              <input
                required
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26221C] outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="Ex: Casacos"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Descrição *</label>
            <textarea
              required
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26221C] outline-none h-24"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva detalhes, marcas, possíveis avarias..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Preço (R$) *</label>
              <input
                required
                type="number"
                step="0.01"
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26221C] outline-none"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Tamanho</label>
              <input
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26221C] outline-none"
                value={formData.size}
                onChange={e => setFormData({...formData, size: e.target.value})}
                placeholder="Ex: M, 42, G (Opcional)"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Estado *</label>
              <select
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26221C] outline-none bg-white"
                value={formData.condition}
                onChange={e => setFormData({...formData, condition: e.target.value})}
              >
                <option value="Novo">Novo</option>
                <option value="Seminovo">Seminovo</option>
                <option value="Usado">Usado</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Foto do Produto *</label>
            <div className="flex items-center gap-4">
              <input
                required
                type="file"
                accept="image/*"
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#26221C] outline-none file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#D2CBBF] file:text-[#26221C] hover:file:bg-gray-300"
                onChange={handleFileChange}
              />
              {imageFile && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-300 bg-gray-50">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 bg-[#26221C] text-white py-3 rounded-xl font-bold hover:bg-[#3d3830] transition-colors disabled:bg-gray-400"
            >
              {uploadingImage ? 'Enviando Foto...' : loading ? 'Cadastrando...' : 'Publicar Anúncio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
