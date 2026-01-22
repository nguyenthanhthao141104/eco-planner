import React from 'react';
import { History, Fingerprint, ArrowRight, Smile } from 'lucide-react';

const About: React.FC = () => {
   return (
      <div className="overflow-hidden">
         {/* Hero */}
         <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 px-4 flex justify-center overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10 text-center max-w-[800px]">
               <div className="inline-flex items-center justify-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-6 mx-auto">
                  <Smile className="w-4 h-4" /> Câu chuyện thương hiệu
               </div>
               <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] text-charcoal mb-6">Về MEDE</h1>
               <p className="text-lg md:text-xl text-charcoal/60 leading-relaxed max-w-2xl mx-auto">Hành trình tìm lại sự cân bằng. Chúng tôi kết nối sự tĩnh lặng của giấy với tiện ích của công nghệ.</p>
            </div>
         </section>

         {/* Story 1 */}
         <section className="py-16 md:py-24 px-6 md:px-20 relative">
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
               <div className="relative order-2 md:order-1">
                  <div className="absolute -top-4 -left-4 w-full h-full border-2 border-primary/20 blob-shape transform -rotate-3"></div>
                  <div className="relative w-full aspect-[4/5] bg-stone-200 blob-shape overflow-hidden shadow-xl">
                     <img src="https://images.unsplash.com/photo-1605256585681-455837661b18?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Notebooks" />
                  </div>
               </div>
               <div className="flex flex-col gap-6 order-1 md:order-2">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2"><History className="w-6 h-6" /></div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal">Khởi nguồn bền vững</h2>
                  <p className="text-charcoal/70 text-lg leading-relaxed">Câu chuyện bắt đầu từ những buổi chiều muộn tại quán cà phê Sài Gòn. MEDE ra đời với cam kết sử dụng <strong>100% giấy tái chế</strong> cao cấp.</p>
               </div>
            </div>
         </section>

         {/* Story 2 */}
         <section className="py-16 md:py-24 px-6 md:px-20 relative bg-primary/5">
            <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
               <div className="flex flex-col gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary mb-2 shadow-sm"><Fingerprint className="w-6 h-6" /></div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal">Sự tỉ mỉ thủ công</h2>
                  <p className="text-charcoal/70 text-lg leading-relaxed">Mỗi cuốn sổ không chỉ là sản phẩm công nghiệp. Chúng được hoàn thiện với sự tham gia của các nghệ nhân đóng sổ lành nghề.</p>
               </div>
               <div className="relative">
                  <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-primary/20 blob-shape transform rotate-3"></div>
                  <div className="relative w-full aspect-square bg-stone-200 blob-shape overflow-hidden shadow-xl">
                     <img src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Craft" />
                  </div>
               </div>
            </div>
         </section>

         {/* CTA */}
         <section className="py-20 px-6">
            <div className="max-w-[960px] mx-auto bg-charcoal text-white rounded-[2.5rem] p-10 md:p-16 text-center shadow-xl relative overflow-hidden">
               <div className="relative z-10 flex flex-col items-center gap-6">
                  <h2 className="text-3xl md:text-5xl font-display font-bold">Sẵn sàng cho một lối sống tỉnh thức?</h2>
                  <div className="flex gap-4">
                     <button className="flex items-center gap-2 h-14 px-8 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-all">Tham gia cộng đồng <ArrowRight className="w-4 h-4" /></button>
                  </div>
               </div>
            </div>
         </section>
      </div>
   );
};

export default About;