import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, MessageSquare, Users, Settings, Leaf, Box, LogOut, User, Tags, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-[#9CAF88] text-[#1a2e24] font-bold shadow-lg' : 'text-white/70 hover:bg-white/5 hover:text-white'}`;

  const SidebarContent = () => (
    <>
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
        <NavLink to="/admin" end className={navLinkClass}>
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/products" className={navLinkClass}>
          <Box className="w-5 h-5" />
          <span>Sản phẩm</span>
        </NavLink>
        <NavLink to="/admin/categories" className={navLinkClass}>
          <Tags className="w-5 h-5" />
          <span>Danh mục</span>
        </NavLink>
        <NavLink to="/admin/blog" className={navLinkClass}>
          <Leaf className="w-5 h-5" />
          <span>Góc Yên Tĩnh</span>
        </NavLink>
        <NavLink to="/admin/orders" className={navLinkClass}>
          <ShoppingBag className="w-5 h-5" />
          <span>Đơn hàng</span>
        </NavLink>
        <NavLink to="/admin/customers" className={navLinkClass}>
          <Users className="w-5 h-5" />
          <span>Khách hàng</span>
        </NavLink>
        <NavLink to="/admin/chat" className={navLinkClass}>
          <MessageSquare className="w-5 h-5" />
          <span>Lịch sử Chat</span>
        </NavLink>

        <div className="pt-8 pb-2 px-4 text-xs font-bold text-white/30 uppercase tracking-widest">Settings</div>
        <NavLink to="/admin/settings" className={navLinkClass}>
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
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate">{user?.name || 'Admin'}</span>
            <span className="text-[10px] opacity-60 truncate">{user?.email || 'admin@gmail.com'}</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-[#1a2e24] text-white overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-[#2C4C3B] border-r border-white/5 shadow-2xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[#2C4C3B] border-b border-white/10 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base tracking-wide">MEDE</h1>
              <p className="text-[8px] uppercase tracking-widest opacity-60 font-bold">Admin</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-[#2C4C3B] z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Close button */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#F9F9F5] text-[#2C4C3B] overflow-y-auto relative pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;