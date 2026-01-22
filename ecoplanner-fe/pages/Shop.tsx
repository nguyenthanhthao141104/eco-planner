import React, { useState } from 'react';
import { Plus, Search, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';

const Shop: React.FC = () => {
  const { products, isLoading, error, filters, setFilters } = useProducts();
  const { addItem } = useCart();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchInput });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (error) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10 text-center">
        <p className="text-red-500">Lỗi: {error}</p>
        <p className="text-stone-500 mt-2">Vui lòng kiểm tra kết nối backend.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <span className="font-display text-accent text-sm font-bold uppercase tracking-widest mb-1 block">New Arrivals</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal">Bộ sưu tập mới nhất</h2>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="px-4 py-2 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-stone-500">Đang tải sản phẩm...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-stone-500">Không tìm thấy sản phẩm nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer">
              {product.tags && product.tags[0] && (
                <div className="absolute top-6 left-6 z-10">
                  <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">{product.tags[0]}</span>
                </div>
              )}
              <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-stone-100 relative">
                <img
                  src={product.image?.startsWith('http') ? product.image : `${api.baseUrl}${product.image}`}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'; }}
                />
              </div>
              <div className="pt-4 flex justify-between items-end mt-auto">
                <div>
                  <h3 className="font-display font-bold text-lg text-charcoal mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  <p className="font-sans text-charcoal/70">
                    {product.oldPrice && <span className="line-through text-xs text-stone-400 mr-2">{formatPrice(product.oldPrice)}</span>}
                    {formatPrice(product.price)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addItem(product);
                  }}
                  className="bg-secondary/20 text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all transform active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;