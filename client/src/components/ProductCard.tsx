import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    size: string;
    condition: string;
    image_url: string;
    category: string;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isFavorite = false, onToggleFavorite }) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 cursor-pointer border border-[#D2CBBF] flex flex-col h-full relative group">
      <Link to={`/product/${product.id}`} className="block group">
        <div className="h-64 overflow-hidden bg-gray-50 relative">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain transition-transform group-hover:scale-110"
          />

          {/* Botão de Favoritar */}
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isFavorite
                  ? 'bg-white/95 text-red-500 scale-110'
                  : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Favoritar peça'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                {isFavorite ? (
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                ) : (
                  <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
                )}
              </svg>
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-[#26221C] truncate">{product.title}</h3>
            {product.size && (
              <span className="bg-[#D2CBBF] text-[#26221C] text-xs font-semibold px-2 py-1 rounded">
                {product.size}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 h-10">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-[#26221C]">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <span className="text-xs text-gray-500 italic">
              {product.condition}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-0 mt-auto">
        <Link
          to={`/product/${product.id}`}
          className="block w-full text-center bg-[#26221C] text-white py-2 rounded-lg font-medium hover:bg-[#3d3830] transition-colors"
        >
          Ver Detalhes
        </Link>
      </div>
    </div>
  );
};
