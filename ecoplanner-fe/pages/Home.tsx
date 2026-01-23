import React from 'react';
import { PlayCircle, ArrowRight, Star, Leaf, PenTool, Sprout, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

import HomeProductSection from '../components/HomeProductSection';

const Home: React.FC = () => {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-4 pb-20 space-y-24">
      {/* Hero Section */}
      <section className="bg-paper rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-stone-100 flex flex-col-reverse lg:flex-row gap-12 lg:h-[600px] overflow-hidden relative">
        <div className="flex-1 flex flex-col justify-center items-start z-10 lg:pl-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Bộ sưu tập mới 2024
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-charcoal leading-[1.1] mb-6">
            Lên Kế Hoạch Cho <br className="hidden lg:block" />
            <span className="text-primary italic">Cuộc Sống Cân Bằng</span>
          </h1>
          <p className="font-body text-lg text-charcoal/70 leading-relaxed mb-8 max-w-lg">
            Khám phá bộ sưu tập planner thủ công và kỹ thuật số giúp bạn tìm thấy sự an yên trong từng trang viết.
          </p>
          <div className="flex gap-4">
            <Link to="/shop" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl shadow-primary/20 flex items-center gap-2">
              Khám Phá Ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="flex-1 relative group h-64 lg:h-auto">
          <div className="absolute inset-0 bg-primary/5 rounded-[2rem] transform rotate-2 group-hover:rotate-1 transition-transform duration-700"></div>
          <div className="absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden shadow-inner">
            <img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Planner" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-paper/40"></div>
          </div>
          {/* Floating Card */}
          <div className="absolute bottom-12 right-12 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-lg max-w-[200px] hidden lg:block animate-bounce duration-[3000ms]">
            <div className="flex items-center gap-2 mb-2 text-green-700 bg-green-50 p-1 px-2 rounded-full w-fit">
              <Sprout className="w-3 h-3" /> <span className="text-[10px] font-bold uppercase">Mục tiêu hôm nay</span>
            </div>
            <p className="text-xs text-charcoal/60 line-through">Viết nhật ký biết ơn</p>
            <p className="text-xs font-bold text-charcoal">Đọc sách 30 phút</p>
          </div>
        </div>
      </section>

      {/* Featured Products with Categories */}
      <HomeProductSection />

      {/* Bento Grid */}
      <section>
        <div className="flex items-end justify-between mb-8 px-2">
          <h2 className="text-3xl font-display font-bold text-charcoal">Danh mục nổi bật</h2>
          <Link to="/shop" className="text-primary font-bold hover:underline flex items-center gap-1">Xem tất cả <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[380px]">
          {/* Card 1 */}
          <div className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 md:col-span-1 bg-white cursor-pointer">
            <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Planner" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>
            <div className="absolute bottom-0 w-full p-8">
              <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block border border-white/20">Best Seller</span>
              <h3 className="text-2xl font-bold font-display text-white mb-2">Sổ Planner</h3>
              <p className="text-white/80 text-sm line-clamp-2">Lên kế hoạch chi tiết cho từng ngày với thiết kế tối giản.</p>
            </div>
          </div>
          {/* Card 2 */}
          <div className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-[#E8E6E1] cursor-pointer">
            <div className="absolute inset-0 p-8 flex items-center justify-center">
              <img src="/sticker-category.png" className="w-[80%] h-auto object-contain transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" alt="Stickers" />
            </div>
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/20 to-transparent">
              <h3 className="text-xl font-bold font-display text-charcoal mb-1">Sticker Trang Trí</h3>
              <p className="text-charcoal/70 text-sm">Thêm màu sắc cho trang viết.</p>
            </div>
          </div>
          {/* Card 3 */}
          <div className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 bg-[#D8D3C9] cursor-pointer">
            <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Pens" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
            </div>
            <div className="absolute top-6 right-6">
              <span className="bg-white text-charcoal px-3 py-1 rounded-full text-xs font-bold">New</span>
            </div>
            <div className="absolute bottom-0 left-0 p-6">
              <h3 className="text-xl font-bold font-display text-white drop-shadow-md">Bút & Phụ Kiện</h3>
              <p className="text-white/90 text-sm drop-shadow-md">Dụng cụ viết êm ái, bền bỉ.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-stone-100/50">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="w-full md:w-1/3">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal mb-4">Tại sao chọn <br /><span className="text-primary">MEDE?</span></h2>
            <p className="text-charcoal/70 mb-6 leading-relaxed">Chúng tôi tin rằng việc lập kế hoạch không chỉ là quản lý thời gian, mà là cách bạn chăm sóc tâm trí mình.</p>
            <Link to="/about" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">Về chúng tôi</Link>
          </div>
          <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { icon: Leaf, title: "Chất liệu thân thiện", desc: "100% giấy tái chế cao cấp, mực in hữu cơ." },
              { icon: PenTool, title: "Thiết kế tối giản", desc: "Layout thoáng đãng, tập trung vào trải nghiệm viết." },
              { icon: Sprout, title: "Tư duy Mindfulness", desc: "Tích hợp theo dõi cảm xúc và lòng biết ơn." },
              { icon: Truck, title: "Giao hàng xanh", desc: "Đóng gói không nilon, hộp carton tái chế." },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-paper border border-stone-100 hover:bg-cream/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-charcoal mb-2">{feature.title}</h3>
                <p className="text-sm text-charcoal/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary rounded-[2.5rem] p-8 lg:p-16 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Nhận cảm hứng mỗi tuần</h2>
          <p className="text-white/80 mb-8 text-lg">Đăng ký để nhận mẹo lên kế hoạch, template miễn phí và ưu đãi dành riêng cho thành viên.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email của bạn..." className="flex-1 px-6 py-4 rounded-full border-none focus:ring-2 focus:ring-secondary/50 outline-none text-charcoal bg-white" required />
            <button className="bg-charcoal text-white font-bold px-8 py-4 rounded-full hover:bg-gray-900 transition-colors shadow-lg">Đăng ký</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;