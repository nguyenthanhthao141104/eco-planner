import React, { useState, useEffect } from 'react';
import { api, Product } from '../services/api';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, Loader2, Filter } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const HomeProductSection: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
    const { addItem } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const data = await api.getProducts();
                setProducts(data);

                // Extract categories from tags, but only keep the top most frequent ones to avoid cluttering the UI
                const tagCounts: { [key: string]: number } = {};
                data.forEach(p => {
                    p.tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                });

                const sortedTags = Object.keys(tagCounts)
                    .sort((a, b) => tagCounts[b] - tagCounts[a])
                    .slice(0, 10); // Show top 10 tags

                setCategories(['Tất cả', ...sortedTags]);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = selectedCategory === 'Tất cả'
        ? products
        : products.filter(p => p.tags.includes(selectedCategory));

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-1">
                    <h2 className="text-4xl font-display font-black text-charcoal tracking-tight">
                        Cảm hứng <span className="text-primary italic">mỗi ngày</span>
                    </h2>
                    <p className="text-charcoal/60 font-medium">Khám phá các sản phẩm giúp bạn tối ưu hóa công việc và cuộc sống.</p>
                </div>

                {/* Categories Filter */}
                <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 w-full md:w-auto">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border-2 ${selectedCategory === cat
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105'
                                : 'bg-white border-stone-100 text-charcoal/60 hover:border-primary/30 hover:text-primary'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                    <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Đang tải cảm hứng...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-[2rem] py-20 text-center border-2 border-dashed border-stone-100 italic text-stone-400">
                    Chưa có sản phẩm nào trong danh mục này.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.slice(0, 8).map((product, idx) => (
                        <div
                            key={product.id}
                            className="group relative bg-white rounded-3xl p-5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full ring-1 ring-black/5"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            <Link to={`/product/${product.id}`} className="flex-1">
                                <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-50 relative mb-5">
                                    <img
                                        src={product.image?.startsWith('http') ? product.image : `${api.baseUrl}${product.image}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x500?text=Product'; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                <div className="space-y-1 px-1">
                                    <div className="flex gap-2 mb-2">
                                        {product.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-primary/50">{tag}</span>
                                        ))}
                                    </div>
                                    <h3 className="font-display font-bold text-xl text-charcoal group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="font-black text-2xl text-charcoal">
                                            {formatPrice(product.price)}
                                        </p>
                                        {product.oldPrice && (
                                            <span className="line-through text-sm text-stone-300 font-bold">{formatPrice(product.oldPrice)}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>

                            <div className="mt-6 flex gap-2">
                                <button
                                    onClick={() => addItem(product)}
                                    className="flex-1 bg-charcoal text-white h-12 rounded-2xl font-bold hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-charcoal/5"
                                >
                                    <Plus className="w-5 h-5" /> Thêm vào giỏ
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-8 text-center">
                <Link to="/shop" className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white border-2 border-stone-100 text-charcoal font-black hover:border-primary/30 hover:text-primary transition-all group shadow-sm hover:shadow-xl">
                    Xem tất cả sản phẩm <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
            </div>
        </section>
    );
};

export default HomeProductSection;
