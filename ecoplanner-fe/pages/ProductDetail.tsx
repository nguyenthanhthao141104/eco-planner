import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, CheckCircle, Minus, Plus, ShoppingCart, Truck, ShieldCheck, Loader2, ArrowLeft, Check } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { api } from '../services/api';
const ProductDetail: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const { product, isLoading, error } = useProduct(id || '');
   const { addItem } = useCart();
   const [quantity, setQuantity] = useState(1);
   const [addedToCart, setAddedToCart] = useState(false);

   const formatPrice = (price: number) => {
      return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
   };

   if (isLoading) {
      return (
         <div className="max-w-[1280px] mx-auto px-6 py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-stone-500">Đang tải sản phẩm...</span>
         </div>
      );
   }

   if (error || !product) {
      return (
         <div className="max-w-[1280px] mx-auto px-6 py-20 text-center">
            <p className="text-red-500 mb-4">{error || 'Không tìm thấy sản phẩm'}</p>
            <Link to="/shop" className="inline-flex items-center gap-2 text-primary hover:underline">
               <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
            </Link>
         </div>
      );
   }

   return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
         <Link to="/shop" className="inline-flex items-center gap-2 text-charcoal/60 hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
         </Link>

         <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-sm border border-stone-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
               {/* Left: Images */}
               <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-stone-100 group relative">
                     <img
                        src={product.image ? (product.image.startsWith('http') ? product.image : `${api.baseUrl}${product.image}`) : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200'}
                        className="w-full h-full object-cover"
                        alt={product.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1200'; }}
                     />
                  </div>
                  {/* Thumbnail images removed as per user request */}
               </div>

               {/* Right: Info */}
               <div className="lg:col-span-5 relative">
                  <div className="sticky top-24 flex flex-col gap-8">
                     <div>
                        <div className="flex items-center gap-2 mb-3">
                           {product.tags && product.tags[0] && (
                              <span className="bg-secondary/10 text-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{product.tags[0]}</span>
                           )}
                           <div className="flex text-yellow-400">
                              {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                           </div>
                           <span className="text-charcoal/50 text-xs font-medium">(128 reviews)</span>
                        </div>
                        <h1 className="font-display font-bold text-3xl md:text-4xl text-charcoal leading-tight mb-2">{product.name}</h1>
                        <div className="flex items-center gap-3">
                           {product.oldPrice && (
                              <span className="text-xl text-stone-400 line-through">{formatPrice(product.oldPrice)}</span>
                           )}
                           <span className="font-sans text-2xl font-medium text-primary">{formatPrice(product.price)}</span>
                        </div>
                     </div>

                     <div className="prose prose-sm text-charcoal/80">
                        <p className="leading-loose font-sans text-base">
                           {product.descriptionAi || product.description || 'Sản phẩm thân thiện môi trường, chất lượng cao.'}
                        </p>
                        <ul className="mt-4 flex flex-col gap-2">
                           <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary" /> Chất liệu thân thiện môi trường</li>
                           <li className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-secondary" /> Bền bỉ và tiện dụng</li>
                        </ul>
                     </div>

                     <div className="flex flex-col gap-6 border-t border-charcoal/10 pt-6">
                        <div>
                           <label className="font-display font-bold text-charcoal mb-3 block">Số lượng</label>
                           <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center bg-white rounded-full border border-stone-200 h-12">
                                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-charcoal/60 hover:text-primary transition-colors"><Minus className="w-4 h-4" /></button>
                                 <input type="text" value={quantity} readOnly className="w-10 text-center font-bold text-charcoal bg-transparent border-none p-0 focus:ring-0" />
                                 <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center text-charcoal/60 hover:text-primary transition-colors"><Plus className="w-4 h-4" /></button>
                              </div>
                              <button
                                 onClick={() => {
                                    addItem(product, quantity);
                                    setAddedToCart(true);
                                    setTimeout(() => setAddedToCart(false), 2000);
                                 }}
                                 disabled={addedToCart}
                                 className={`flex-1 h-12 rounded-full font-bold font-display text-base tracking-wide shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 ${addedToCart ? 'bg-green-600 text-white shadow-green-200' : 'bg-primary hover:bg-[#5a5e4d] text-white shadow-primary/20'}`}
                              >
                                 {addedToCart ? <><Check className="w-5 h-5" /> Đã thêm!</> : <><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ hàng</>}
                              </button>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-charcoal/60 uppercase tracking-wide">
                           <Truck className="w-5 h-5" /> Free Ship &gt; 500k
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-charcoal/60 uppercase tracking-wide">
                           <ShieldCheck className="w-5 h-5" /> Bảo hành 1 tháng
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ProductDetail;