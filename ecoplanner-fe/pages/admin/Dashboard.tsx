import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, TrendingUp, ShoppingBag, MessageSquare, Loader2, Package } from 'lucide-react';
import { api, Product } from '../../services/api';

interface DashboardStats {
   totalProducts: number;
   totalOrders: number;
   totalRevenue: number;
   pendingChats: number;
}

interface Conversation {
   id: string;
   user: { name: string; email: string };
   status: string;
   updatedAt: string;
   messages: { content: string }[];
}

const AdminDashboard: React.FC = () => {
   const navigate = useNavigate();
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [products, setProducts] = useState<Product[]>([]);
   const [conversations, setConversations] = useState<Conversation[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      loadDashboardData();
   }, []);

   const loadDashboardData = async () => {
      try {
         setIsLoading(true);

         // Load products
         const productsData = await api.getProducts();
         setProducts(productsData);

         // Load dashboard stats
         try {
            const statsData = await api.getDashboard() as any;
            setStats({
               totalProducts: productsData.length,
               totalOrders: statsData.totalOrders || 0,
               totalRevenue: statsData.todayRevenue || 0,
               pendingChats: statsData.pendingConversations || 0,
            });
         } catch {
            // Fallback if dashboard API fails
            setStats({
               totalProducts: productsData.length,
               totalOrders: 0,
               totalRevenue: 0,
               pendingChats: 0,
            });
         }

         // Load conversations
         try {
            const convData = await api.getConversations(true);
            setConversations(convData.slice(0, 5));
         } catch {
            setConversations([]);
         }
      } catch (error) {
         console.error('Failed to load dashboard:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const formatCurrency = (amount: number) => {
      if (amount >= 1000000) {
         return (amount / 1000000).toFixed(1) + 'M ₫';
      }
      return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
   };

   const formatTimeAgo = (date: string) => {
      const diff = Date.now() - new Date(date).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 60) return `${minutes}p trước`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h trước`;
      return `${Math.floor(hours / 24)} ngày trước`;
   };

   if (isLoading) {
      return (
         <div className="p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
         </div>
      );
   }

   return (
      <div className="p-8 lg:p-12 relative max-w-7xl mx-auto flex flex-col gap-10">
         <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2C4C3B 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

         {/* Header */}
         <header className="flex flex-wrap items-end justify-between gap-6 relative z-10">
            <div className="max-w-2xl">
               <h1 className="text-4xl lg:text-5xl font-bold text-[#2C4C3B] mb-3 font-display">Dashboard Admin</h1>
               <p className="text-lg text-[#5D7365]">
                  Tổng cộng <span className="font-bold text-[#2C4C3B]">{stats?.totalProducts || 0} sản phẩm</span> đang được quản lý.
                  {stats?.pendingChats ? (
                     <span> Có <span className="font-bold text-[#CB8B78] underline decoration-[#CB8B78]/30 underline-offset-4">{stats.pendingChats} tin nhắn</span> cần xử lý.</span>
                  ) : null}
               </p>
            </div>
            <div className="flex items-center gap-3">
               <button className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2C4C3B] shadow-sm hover:shadow-lg transition-all"><Bell className="w-5 h-5" /></button>
               <button className="flex items-center gap-2 rounded-full bg-[#2C4C3B] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#1a2e24] transition-all"><Plus className="w-4 h-4" /> Thêm sản phẩm</button>
            </div>
         </header>

         {/* Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 relative z-10">
            {/* Products Count */}
            <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm h-64 border border-white/50">
               <div className="flex items-start justify-between">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#F0F4F1] text-[#2C4C3B]"><Package className="w-5 h-5" /></div>
                  <div className="flex items-center gap-2 rounded-full bg-[#E8F5E9] pl-1.5 pr-3 py-1">
                     <div className="h-2.5 w-2.5 rounded-full bg-[#4CAF50] animate-pulse"></div>
                     <span className="text-xs font-bold text-[#2E7D32] uppercase">Active</span>
                  </div>
               </div>
               <div>
                  <span className="block text-5xl font-bold text-[#2C4C3B] mb-1 font-display">{stats?.totalProducts || 0}</span>
                  <span className="text-sm font-medium text-[#667f71]">Sản phẩm trong kho</span>
               </div>
               <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#667f71]">Đang bán:</span>
                  <span className="text-xs font-bold text-[#2C4C3B] bg-[#2C4C3B]/5 px-2 py-0.5 rounded">{products.filter(p => p.stock > 0).length} sản phẩm</span>
               </div>
            </div>

            {/* Product List */}
            <div className="lg:col-span-5 flex flex-col rounded-2xl bg-white p-6 shadow-sm h-64 border border-white/50 overflow-hidden">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#2C4C3B] font-display">Sản phẩm</h3>
                  <select className="bg-transparent text-xs font-bold text-[#667f71] outline-none"><option>Tất cả</option></select>
               </div>
               <div className="flex flex-col gap-3 overflow-y-auto flex-1">
                  {products.slice(0, 4).map((product, i) => (
                     <div key={product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F9F9F5]">
                        <img src={product.image?.startsWith('http') ? product.image : `${api.baseUrl}${product.image}` || 'https://placehold.co/40'} className="w-10 h-10 rounded-lg object-cover" alt={product.name} />
                        <div className="flex-1 min-w-0">
                           <p className="text-sm font-bold text-[#1a2e24] truncate">{product.name}</p>
                           <p className="text-xs text-[#667f71]">{formatCurrency(product.price)}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.stock > 50 ? 'bg-green-100 text-green-700' : product.stock > 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                           {product.stock} còn
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Revenue */}
            <div className="lg:col-span-4 flex flex-col rounded-2xl bg-[#2C4C3B] text-white p-6 shadow-sm h-64 relative overflow-hidden group">
               <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/5 group-hover:scale-110 transition-transform duration-700"></div>
               <h3 className="text-lg font-bold font-display opacity-90 relative z-10">Tổng quan</h3>
               <div className="mt-auto relative z-10">
                  <p className="text-4xl font-bold font-display mb-1">{formatCurrency(stats?.totalRevenue || 0)}</p>
                  <div className="flex items-center gap-2 text-sm opacity-80"><span>Doanh thu tổng</span></div>
               </div>
               <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 relative z-10">
                  <div><p className="text-xs opacity-60 uppercase tracking-wider mb-1">Đơn hàng</p><p className="text-xl font-bold">{stats?.totalOrders || 0}</p></div>
                  <div><p className="text-xs opacity-60 uppercase tracking-wider mb-1">Sản phẩm</p><p className="text-xl font-bold">{stats?.totalProducts || 0}</p></div>
               </div>
            </div>

            {/* Inventory - Real Products */}
            <div className="lg:col-span-6 flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-white/50">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#2C4C3B] font-display flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-[#9CAF88]" /> Tình trạng kho</h3>
                  <button className="text-xs font-bold text-[#CB8B78]">Xem tất cả</button>
               </div>
               <div className="flex flex-col gap-5">
                  {products.slice(0, 3).map((product) => {
                     const stockPercent = Math.min((product.stock / 500) * 100, 100);
                     const stockColor = product.stock > 100 ? 'bg-[#9CAF88]' : product.stock > 30 ? 'bg-[#D4AF37]' : 'bg-[#CB8B78]';
                     return (
                        <div key={product.id} className="flex flex-col gap-2">
                           <div className="flex justify-between items-end">
                              <span className="text-sm font-bold text-[#1a2e24]">{product.name}</span>
                              <span className="text-xs font-medium text-[#667f71]">{product.stock} còn</span>
                           </div>
                           <div className="h-2.5 w-full rounded-full bg-[#F0F4F1]">
                              <div className={`h-full rounded-full ${stockColor}`} style={{ width: `${stockPercent}%` }}></div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Messages - Real Conversations */}
            <div className="lg:col-span-6 flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-white/50">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#2C4C3B] font-display flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#9CAF88]" /> Tin nhắn mới</h3>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#CB8B78] text-[10px] font-bold text-white">{stats?.pendingChats || 0}</div>
               </div>
               <div className="flex flex-col gap-4">
                  {conversations.length === 0 ? (
                     <p className="text-sm text-[#667f71] text-center py-4">Chưa có tin nhắn nào</p>
                  ) : conversations.map((conv) => (
                     <div key={conv.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#F9F9F5] cursor-pointer" onClick={() => navigate('/admin/chat')}>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#E8F5E9] text-[#2C4C3B] font-bold">
                           {conv.user.name?.charAt(0) || conv.user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-bold text-[#1a2e24]">{conv.user.name || conv.user.email}</span>
                              <span className="text-xs text-[#667f71]">{formatTimeAgo(conv.updatedAt)}</span>
                           </div>
                           <p className="text-sm text-[#5D7365] line-clamp-1">
                              {conv.messages && conv.messages[0] ? conv.messages[0].content : 'Cuộc hội thoại mới'}
                           </p>
                        </div>
                        {conv.status !== 'RESOLVED' && <div className="h-2 w-2 rounded-full bg-[#CB8B78] mt-2"></div>}
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
};

export default AdminDashboard;