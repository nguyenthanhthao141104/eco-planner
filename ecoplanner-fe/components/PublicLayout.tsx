import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, Leaf, Send, Sparkles, X, LogIn, Instagram, Facebook, Phone, Home, Package, BookOpen, Info, Settings, ClipboardList, LogOut, HelpCircle, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { api, SystemSettings, DEFAULT_SETTINGS } from '../services/api';

// Parse markdown to HTML (bold, line breaks, bullets)
const parseMarkdown = (text: string) => {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\n/g, '<br/>'); // Line breaks
};

// FAQ Questions data
const faqQuestions = [
  {
    question: 'Shop có những loại sổ planner nào?',
    answer: `Shop hiện có **3 loại sổ**:

• **B6 – Daily Planner** (theo ngày): 120 trang, gọn nhẹ mang theo.

• **B5 – Weekly Planner** (theo tuần): 80 trang, nhìn tổng quan cả tuần.

• **A5 – Yearly Planner** (theo năm): 120 trang, lập kế hoạch năm-tháng-tuần-ngày.`
  },
  {
    question: 'Bên trong sổ có nội dung gì?',
    answer: `**Nội dung bên trong:**

📘 **B6 (Daily):** Top 3 mục tiêu, Lịch trình, Việc cần làm (checklist), Ghi chú, Việc cho ngày mai.

📗 **B5 (Weekly):** Lịch tuần Thứ 2-CN, Ưu tiên, Việc cần làm, Ghi chú, Theo dõi thói quen.

📙 **A5 (Yearly):** Lịch 2026, Tầm nhìn, Kế hoạch năm/tháng/tuần/ngày, Tổng kết.`
  },
  {
    question: 'Thời gian giao hàng bao lâu?',
    answer: `**Thời gian giao hàng:**

• Xử lý đơn: **0 – 24 giờ**

• Giao nội thành: **1 – 2 ngày**

• Giao tỉnh: **2 – 5 ngày**`
  },
  {
    question: 'Phí ship như thế nào?',
    answer: `🎉 **FREESHIP** cho tất cả đơn hàng ạ!`
  },
  {
    question: 'Shop có chính sách đổi/trả không?',
    answer: `**Chính sách đổi/trả:**

• Đổi mới **1-1** khi lỗi nhà sản xuất (rách, bung gáy, thiếu trang, in lỗi nặng).

• Thời hạn: **7 ngày** từ khi nhận hàng.

• Cần gửi ảnh/video tình trạng để xử lý nhanh.

⚠️ Không áp dụng nếu sản phẩm đã sử dụng/viết hoặc hư hỏng do bảo quản sai.`
  },
  {
    question: 'Bìa tái chế có bền không?',
    answer: `✅ **Rất bền** ạ!

Bìa sử dụng giấy tái chế **250gsm** nên:
• Đủ cứng và chắc
• Hạn chế cong/gãy
• Phù hợp sử dụng hàng ngày
`
  }
];

const PublicLayout: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showFaq, setShowFaq] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [faqMessages, setFaqMessages] = useState<{ content: string; sender: 'USER' | 'AI' }[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { messages: aiMessages, sendMessage, isLoading: chatLoading, error: chatError } = useChat();
  const location = useLocation();

  // Combine FAQ messages and AI messages
  const allMessages = [...faqMessages, ...aiMessages];

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  const handleFaqClick = async (faq: typeof faqQuestions[0]) => {
    // Add question and answer to local FAQ messages instantly
    setFaqMessages(prev => [
      ...prev,
      { content: faq.question, sender: 'USER' },
      { content: faq.answer, sender: 'AI' }
    ]);
    setShowFaq(false);

    // Always log FAQ to database for analytics (works for all users)
    try {
      await api.logFaq(faq.question, faq.answer);
    } catch (error) {
      console.error('Failed to log FAQ:', error);
    }

    // Also save to conversation history if authenticated
    if (isAuthenticated) {
      try {
        await api.sendFaqMessage(faq.question, faq.answer);
      } catch (error) {
        console.error('Failed to save FAQ to history:', error);
      }
    }
  };

  const navItems = [
    { to: '/', label: 'Trang chủ', icon: Home },
    { to: '/shop', label: 'Sản phẩm', icon: Package },
    { to: '/blog', label: 'Blog', icon: BookOpen },
    { to: '/about', label: 'Về chúng tôi', icon: Info },
  ];

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-charcoal/70 hover:bg-stone-100'}`;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-charcoal font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-paper/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Leaf className="w-7 h-7 md:w-8 md:h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-display font-bold text-xl md:text-2xl tracking-tight text-charcoal">MEDE</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-charcoal/70 hover:text-primary'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <button className="hidden sm:flex p-2 hover:bg-primary/10 rounded-full transition-colors text-charcoal">
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

            {/* Desktop User */}
            {isAuthenticated ? (
              <Link to="/profile" className="hidden md:flex items-center gap-2 p-2 hover:bg-primary/10 rounded-full transition-colors">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-charcoal max-w-[100px] truncate hidden lg:block">
                  {user?.name}
                </span>
              </Link>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-colors">
                <LogIn className="w-4 h-4" /> Đăng nhập
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 hover:bg-primary/10 rounded-full transition-colors text-charcoal"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-lg text-charcoal">Menu</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 hover:bg-stone-100 rounded-full text-charcoal/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {isAuthenticated ? (
          <div className="p-4 bg-stone-50 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-charcoal truncate">{user?.name}</p>
                <p className="text-xs text-charcoal/60 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-stone-100">
            <Link
              to="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-5 h-5" /> Đăng nhập
            </Link>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={mobileNavLinkClass}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isAuthenticated && (
            <>
              <div className="pt-4 pb-2 px-4 text-xs font-bold text-charcoal/40 uppercase tracking-widest">Tài khoản</div>
              <NavLink to="/profile" className={mobileNavLinkClass}>
                <User className="w-5 h-5" />
                <span>Hồ sơ</span>
              </NavLink>
              <NavLink to="/orders" className={mobileNavLinkClass}>
                <ClipboardList className="w-5 h-5" />
                <span>Đơn hàng</span>
              </NavLink>
              <NavLink to="/settings" className={mobileNavLinkClass}>
                <Settings className="w-5 h-5" />
                <span>Cài đặt</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Drawer Footer */}
        {isAuthenticated && (
          <div className="p-4 border-t border-stone-100">
            <button
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        )}

        {/* Social Links */}
        <div className="p-4 border-t border-stone-100 bg-stone-50">
          <div className="flex items-center justify-center gap-4">
            {settings.branding.instagram && (
              <a href={settings.branding.instagram.startsWith('http') ? settings.branding.instagram : `https://${settings.branding.instagram}`} target="_blank" rel="noreferrer" className="p-2 text-charcoal/60 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {settings.branding.facebook && (
              <a href={settings.branding.facebook.startsWith('http') ? settings.branding.facebook : `https://${settings.branding.facebook}`} target="_blank" rel="noreferrer" className="p-2 text-charcoal/60 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {settings.branding.hotline && (
              <a href={`tel:${settings.branding.hotline}`} className="p-2 text-charcoal/60 hover:text-primary transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-stone-200 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-primary" />
            <span className="font-bold font-display text-charcoal">MEDE</span>
          </div>
          <p className="text-sm text-charcoal/60 text-center">© 2026 MEDE. Designed for balance.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            {settings.branding.instagram && (
              <a
                href={settings.branding.instagram.startsWith('http') ? settings.branding.instagram : `https://${settings.branding.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="text-charcoal/60 hover:text-primary transition-colors flex items-center gap-1 text-sm"
              >
                <Instagram className="w-4 h-4" /> Instagram
              </a>
            )}
            {settings.branding.facebook && (
              <a
                href={settings.branding.facebook.startsWith('http') ? settings.branding.facebook : `https://${settings.branding.facebook}`}
                target="_blank"
                rel="noreferrer"
                className="text-charcoal/60 hover:text-primary transition-colors flex items-center gap-1 text-sm"
              >
                <Facebook className="w-4 h-4" /> Facebook
              </a>
            )}
            {settings.branding.hotline && (
              <a href={`tel:${settings.branding.hotline}`} className="text-charcoal/60 hover:text-primary transition-colors flex items-center gap-1 text-sm">
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
            className="flex items-center gap-2 bg-white px-4 md:px-5 py-2.5 md:py-3 rounded-full shadow-lg hover:scale-105 transition-transform border border-primary/10 group"
          >
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full absolute -top-1 -right-1 border-2 border-white"></div>
              <Sparkles className="w-5 h-5 text-primary group-hover:animate-pulse" />
            </div>
            <span className="font-bold text-sm text-charcoal hidden sm:inline">MEDE-Assistant</span>
          </button>
        )}

        {isChatOpen && (
          <div className="w-[calc(100vw-48px)] sm:w-[350px] max-w-[350px] bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
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

            <div className="h-64 sm:h-80 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
              {allMessages.length === 0 ? (
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm text-sm shadow-sm border border-stone-100 text-charcoal/80">
                    {settings.ai.greeting}
                  </div>
                </div>
              ) : (
                allMessages.map((msg, index) => (
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

            {/* FAQ Suggestions Panel */}
            {showFaq && (
              <div className="border-t border-stone-100 bg-white p-3 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-charcoal font-bold text-sm">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    Câu hỏi thường gặp
                  </div>
                  <button onClick={() => setShowFaq(false)} className="p-1 hover:bg-stone-100 rounded-full">
                    <X className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
                <div className="space-y-1">
                  {faqQuestions.map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => handleFaqClick(faq)}
                      className="w-full flex items-center justify-between p-3 text-left text-sm text-charcoal/80 hover:bg-stone-50 rounded-xl transition-colors group"
                    >
                      <span className="pr-2">{faq.question}</span>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-primary flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-100 bg-white">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFaq(!showFaq)}
                  className={`p-3 rounded-xl transition-colors flex-shrink-0 ${showFaq ? 'bg-primary text-white' : 'bg-stone-50 text-primary hover:bg-primary/10'}`}
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                <div className="relative flex-1">
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
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicLayout;