import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, MessageSquare, Users, Settings, Leaf, Box, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen w-full bg-[#1a2e24] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-[#2C4C3B] border-r border-white/5 shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-wide">MEDE</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink to="/admin" end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[#9CAF88] text-[#1a2e24] font-bold shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[#9CAF88] text-[#1a2e24] font-bold shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <Box className="w-5 h-5" />
            <span>Sản phẩm</span>
          </NavLink>
          <NavLink to="/admin/blog" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[#9CAF88] text-[#1a2e24] font-bold shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <Leaf className="w-5 h-5" />
            <span>Góc Yên Tĩnh</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[#9CAF88] text-[#1a2e24] font-bold shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <ShoppingBag className="w-5 h-5" />
            <span>Đơn hàng</span>
          </NavLink>
          <NavLink to="/admin/customers" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[#9CAF88] text-[#1a2e24] font-bold shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <Users className="w-5 h-5" />
            <span>Khách hàng</span>
          </NavLink>
          <NavLink to="/admin/chat" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all justify-between ${isActive ? 'bg-[#9CAF88] text-[#1a2e24] font-bold shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <span>Lịch sử Chat</span>
            </div>
          </NavLink>

          <div className="pt-8 pb-2 px-4 text-xs font-bold text-white/30 uppercase tracking-widest">Settings</div>
          <NavLink to="/admin/settings" className={({ isActive }) => `px-4 py-3 flex items-center gap-3 rounded-2xl cursor-pointer transition-all ${isActive ? 'bg-[#9CAF88] text-[#1a2e24] font-bold shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <Settings className="w-5 h-5" />
            <span>Cài đặt</span>
          </NavLink>
          <Link to="/" className="px-4 py-3 text-white/70 hover:bg-white/5 hover:text-red-300 flex items-center gap-3 rounded-2xl cursor-pointer mt-auto">
            <LogOut className="w-5 h-5" />
            <span>Thoát</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-[#233d30] rounded-2xl">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold">{user?.name || 'Admin'}</span>
              <span className="text-[10px] opacity-60">{user?.email || 'admin@gmail.com'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#F9F9F5] text-[#2C4C3B] overflow-y-auto relative">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;