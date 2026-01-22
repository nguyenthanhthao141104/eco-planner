import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, Leaf, Send, Sparkles, X, LogIn, Instagram, Facebook, Phone } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { api, SystemSettings } from '../services/api';

// Parse markdown bold (**text**) to HTML
const parseMarkdown = (text: string) => {
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
};

const PublicLayout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const { totalItems } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { messages, sendMessage, isLoading: chatLoading, error: chatError } = useChat();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Fetching system settings...');
        const data = await api.getSettings();
        console.log('System settings received:', data);
        setSettings(data);
        // Update SEO
        if (data.seo && data.seo.metaDescription) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', data.seo.metaDescription);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để chat với MEDE-Assistant');
      return;
    }
    if (chatInput.trim()) {
      sendMessage(chatInput);
      setChatInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-charcoal font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-paper/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Leaf className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-display font-bold text-2xl tracking-tight text-charcoal">MEDE</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'Shop', 'Blog', 'About'].map((item) => (
              <NavLink
                key={item}
                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-charcoal/70 hover:text-primary'}`
                }
              >
                {item === 'Home' ? 'Trang chủ' : item === 'Shop' ? 'Sản phẩm' : item === 'About' ? 'Về chúng tôi' : item}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-primary/10 rounded-full transition-colors text-charcoal">
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-primary/10 rounded-full transition-colors text-charcoal">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <Link to="/profile" className="hidden sm:flex items-center gap-2 p-2 hover:bg-primary/10 rounded-full transition-colors">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-charcoal max-w-[100px] truncate hidden lg:block">
                  {user?.name}
                </span>
              </Link>
            ) : (
              <Link to="/login" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors">
                <LogIn className="w-4 h-4" /> Đăng nhập
              </Link>
            )}

            <button className="md:hidden p-2 hover:bg-primary/10 rounded-full transition-colors text-charcoal">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold font-display text-charcoal">MEDE</span>
          </div>
          <p className="text-sm text-charcoal/60">© 2026 MEDE. Designed for balance.</p>
          <div className="flex gap-4">
            {settings?.branding.instagram && (
              <a
                href={settings.branding.instagram.startsWith('http') ? settings.branding.instagram : `https://${settings.branding.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="text-charcoal/60 hover:text-primary transition-colors flex items-center gap-1"
              >
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
            {settings?.branding.facebook && (
              <a
                href={settings.branding.facebook.startsWith('http') ? settings.branding.facebook : `https://${settings.branding.facebook}`}
                target="_blank"
                rel="noreferrer"
                className="text-charcoal/60 hover:text-primary transition-colors flex items-center gap-1"
              >
                <Facebook className="w-4 h-4" /> Facebook
              </a>
            )}
            {settings?.branding.hotline && (
              <a href={`tel:${settings.branding.hotline}`} className="text-charcoal/60 hover:text-primary transition-colors flex items-center gap-1">
                <Phone className="w-4 h-4" /> {settings.branding.hotline}
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isChatOpen && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-2 bg-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-transform border border-primary/10 group"
          >
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full absolute -top-1 -right-1 border-2 border-white"></div>
              <Sparkles className="w-5 h-5 text-primary group-hover:animate-pulse" />
            </div>
            <span className="font-bold text-sm text-charcoal">MEDE-Assistant</span>
          </button>
        )}

        {isChatOpen && (
          <div className="w-[350px] bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">MEDE-Assistant</h4>
                  <p className="text-[10px] text-primary font-medium">AI Hỗ trợ 24/7</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-stone-100 rounded-full">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
              {messages.length === 0 ? (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-stone-100 text-charcoal/80">
                    {settings?.ai.greeting || "Xin chào! Mình là MEDE-Assistant 🌿. Bạn cần hỗ trợ gì về sản phẩm văn phòng phẩm thân thiện môi trường?"}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`flex gap-3 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
                    {msg.sender !== 'USER' && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-sm shadow-sm border max-w-[80%] ${msg.sender === 'USER'
                        ? 'bg-primary text-white rounded-tr-sm border-primary'
                        : 'bg-white rounded-tl-sm border-stone-100 text-charcoal/80'
                        }`}
                      dangerouslySetInnerHTML={msg.sender !== 'USER' ? { __html: parseMarkdown(msg.content) } : undefined}
                    >
                      {msg.sender === 'USER' ? msg.content : null}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-primary animate-spin" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-stone-100 text-charcoal/60">
                    Đang trả lời...
                  </div>
                </div>
              )}
              {chatError && (
                <div className="bg-red-50 text-red-600 text-sm p-2 rounded-lg border border-red-200">
                  {chatError}
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-100 bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isAuthenticated ? 'Hỏi về sản phẩm...' : 'Đăng nhập để chat...'}
                  disabled={!isAuthenticated}
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-stone-50 border-none text-sm focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button type="submit" className="absolute right-2 top-2 p-1 text-primary hover:bg-primary/10 rounded-lg">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLayout;