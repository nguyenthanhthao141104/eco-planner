import React from 'react';
import { Leaf, Target, Eye, CheckCircle, Recycle, Award, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
   const coreValues = [
      {
         icon: CheckCircle,
         title: 'Rõ ràng',
         description: 'Thiết kế tối ưu để dễ dùng, dễ theo dõi, dễ duy trì thói quen.'
      },
      {
         icon: Recycle,
         title: 'Bền vững',
         description: 'Ưu tiên vật liệu và quy trình giảm lãng phí, bắt đầu từ bìa giấy tái chế.'
      },
      {
         icon: Award,
         title: 'Chất lượng',
         description: 'Chú trọng trải nghiệm viết, độ bền, hoàn thiện chỉn chu.'
      },
      {
         icon: Heart,
         title: 'Đồng hành',
         description: 'Luôn ở bên người dùng trong từng giai đoạn của cuộc sống.'
      }
   ];

   return (
      <div className="bg-paper">
         {/* Hero - Simple & Organic */}
         <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
            <div className="inline-flex items-center gap-2 text-primary/80 text-sm font-medium mb-6">
               <Leaf className="w-4 h-4" />
               <span>Câu chuyện thương hiệu</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-charcoal leading-tight mb-6">
               Viết điều bạn muốn.<br />
               <span className="text-primary">Sống điều bạn tin.</span>
            </h1>
            <p className="text-lg md:text-xl text-charcoal/60 max-w-2xl mx-auto leading-relaxed">
               Và tái tạo từng ngày.
            </p>
         </section>

         {/* Image Banner - Natural */}
         <section className="max-w-6xl mx-auto px-6">
            <div className="relative rounded-3xl overflow-hidden aspect-[21/9]">
               <img
                  src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1600&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Nature and notebook"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
         </section>

         {/* The Origin Question */}
         <section className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
            <p className="text-2xl md:text-3xl font-display text-charcoal leading-relaxed">
               "Nếu mỗi ngày mình đều lập kế hoạch để sống tốt hơn, tại sao cuốn sổ đồng hành lại không thể
               <span className="text-primary font-semibold"> tốt hơn cho Trái Đất?</span>"
            </p>
            <p className="text-charcoal/50 mt-6 text-sm">— Câu hỏi khởi nguồn của MEDE</p>
         </section>

         {/* Story - Simple 2 Column */}
         <section className="bg-white">
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <div className="order-2 lg:order-1">
                     <div className="aspect-[4/5] rounded-2xl overflow-hidden">
                        <img
                           src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop"
                           className="w-full h-full object-cover"
                           alt="MEDE Planner"
                        />
                     </div>
                  </div>
                  <div className="order-1 lg:order-2">
                     <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal mb-8">
                        Một cách làm sổ<br />planner khác
                     </h2>
                     <div className="space-y-5 text-charcoal/70 leading-relaxed">
                        <p>
                           Chúng ta đã quá quen với những năm tháng chạy vội. Khi mọi thứ trở nên rối, con người thường tìm về một điều đơn giản để tự cứu mình: <strong className="text-charcoal">viết ra</strong>.
                        </p>
                        <p>
                           Viết để sắp xếp lại tâm trí. Viết để nhắc rằng mình đang sống vì điều gì.
                        </p>
                        <p>
                           Nhưng phía sau sự "rõ ràng" ấy, đôi khi lại là những lựa chọn chưa thật sự "nhẹ" với môi trường.
                        </p>
                        <p>
                           Vậy là MEDE chọn bắt đầu với <strong className="text-primary">bìa giấy tái chế 100%</strong> — không phải vì xu hướng, mà vì nó mang đúng tinh thần của việc lập kế hoạch: <strong className="text-charcoal">tái tạo</strong>.
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* Mission & Vision - Soft Cards */}
         <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
               <div className="bg-[#F5F3EE] rounded-2xl p-8 md:p-10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                     <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-charcoal mb-4">Sứ mệnh</h3>
                  <p className="text-charcoal/70 leading-relaxed">
                     Giúp mọi người lập kế hoạch sống rõ ràng hơn mỗi ngày với những cuốn planner <strong className="text-charcoal">đẹp — bền — thân thiện môi trường</strong>, bắt đầu từ bìa giấy tái chế.
                  </p>
               </div>
               <div className="bg-[#F0F5ED] rounded-2xl p-8 md:p-10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                     <Eye className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-charcoal mb-4">Tầm nhìn</h3>
                  <p className="text-charcoal/70 leading-relaxed">
                     Trở thành thương hiệu planner được yêu thích vì tính hữu ích và lối sống bền vững, nơi mỗi cuốn sổ là một <strong className="text-charcoal">lựa chọn tử tế</strong> với bản thân và Trái Đất.
                  </p>
               </div>
            </div>
         </section>

         {/* Core Values - Minimal */}
         <section className="bg-white">
            <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
               <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal">
                     Giá trị cốt lõi
                  </h2>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
                  {coreValues.map((value, index) => (
                     <div key={index} className="text-center">
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-5">
                           <value.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-display font-bold text-charcoal mb-3">{value.title}</h3>
                        <p className="text-charcoal/60 text-sm leading-relaxed">{value.description}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* Quote - Minimal */}
         <section className="max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
            <Leaf className="w-10 h-10 text-primary/30 mx-auto mb-8" />
            <p className="text-xl md:text-2xl font-display text-charcoal leading-relaxed mb-4">
               "Một kế hoạch tốt không chỉ giúp bạn hoàn thành nhiều việc hơn,<br className="hidden md:block" />
               mà giúp bạn <span className="text-primary">sống đúng hơn</span>."
            </p>
            <p className="text-charcoal/50 text-sm">
               Một cuốn sổ planner tốt không chỉ đẹp trên bàn làm việc, mà còn tử tế với thế giới.
            </p>
         </section>

         {/* CTA - Soft Green */}
         <section className="max-w-4xl mx-auto px-6 pb-20 md:pb-28">
            <div className="bg-primary/5 rounded-3xl p-10 md:p-16 text-center">
               <h2 className="text-2xl md:text-3xl font-display font-bold text-charcoal mb-4">
                  Sẵn sàng lập kế hoạch<br />một cách nhẹ nhàng hơn?
               </h2>
               <p className="text-charcoal/60 mb-8">
                  Cho cả bạn và cho hành tinh này.
               </p>
               <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-colors"
               >
                  Khám phá sản phẩm <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </section>
      </div>
   );
};

export default About;