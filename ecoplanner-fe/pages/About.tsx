import React from 'react';
import { Leaf, Target, Eye, Sparkles, CheckCircle, Heart, Recycle, Award, Users, ArrowRight, Quote, TreePine, Zap, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
   const coreValues = [
      {
         icon: Lightbulb,
         title: 'Rõ ràng',
         description: 'Thiết kế tối ưu để dễ dùng, dễ theo dõi, dễ duy trì thói quen.',
         gradient: 'from-blue-500 to-cyan-400',
         bg: 'bg-blue-50'
      },
      {
         icon: Recycle,
         title: 'Bền vững',
         description: 'Ưu tiên vật liệu và quy trình giảm lãng phí, bắt đầu từ bìa giấy tái chế.',
         gradient: 'from-green-500 to-emerald-400',
         bg: 'bg-green-50'
      },
      {
         icon: Award,
         title: 'Chất lượng',
         description: 'Chú trọng trải nghiệm viết, độ bền, hoàn thiện chỉn chu.',
         gradient: 'from-amber-500 to-orange-400',
         bg: 'bg-amber-50'
      },
      {
         icon: Heart,
         title: 'Đồng hành',
         description: 'Luôn ở bên người dùng trong từng giai đoạn - từ lập kế hoạch đến bắt đầu lại nhẹ nhàng.',
         gradient: 'from-rose-500 to-pink-400',
         bg: 'bg-rose-50'
      }
   ];

   return (
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-4 pb-20 space-y-16 md:space-y-24">
         {/* Hero Section - Matching Home style */}
         <section className="bg-paper rounded-[2.5rem] p-6 lg:p-10 shadow-sm border border-stone-100 flex flex-col-reverse lg:flex-row gap-8 lg:gap-12 lg:min-h-[500px] overflow-hidden relative">
            <div className="flex-1 flex flex-col justify-center items-start z-10 lg:pl-4">
               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                  <Leaf className="w-4 h-4" />
                  Câu chuyện thương hiệu
               </div>
               <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-charcoal leading-[1.1] mb-6">
                  Viết điều bạn muốn.<br />
                  <span className="text-primary italic">Sống điều bạn tin.</span>
               </h1>
               <p className="font-body text-lg text-charcoal/70 leading-relaxed mb-8 max-w-lg">
                  Và tái tạo từng ngày — Hành trình của MEDE bắt đầu từ niềm tin rằng mỗi cuốn sổ có thể tốt hơn cho cả bạn và Trái Đất.
               </p>
               <Link to="/shop" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl shadow-primary/20 flex items-center gap-2">
                  Khám phá sản phẩm <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
            <div className="flex-1 relative group h-64 lg:h-auto">
               <div className="absolute inset-0 bg-primary/5 rounded-[2rem] transform rotate-2 group-hover:rotate-1 transition-transform duration-700"></div>
               <div className="absolute inset-0 w-full h-full rounded-[2rem] overflow-hidden shadow-inner">
                  <img
                     src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop"
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                     alt="MEDE Planner"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:to-paper/30"></div>
               </div>
               {/* Floating Badge */}
               <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl hidden sm:block animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Recycle className="w-6 h-6 text-primary" />
                     </div>
                     <div>
                        <p className="text-xs font-bold text-charcoal">Giấy tái chế</p>
                        <p className="text-2xl font-display font-bold text-primary">100%</p>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* The Question - Quote Block */}
         <section className="relative">
            <div className="bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-[2.5rem] p-8 md:p-12 lg:p-16 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
               <div className="absolute bottom-0 right-0 w-60 h-60 bg-accent/10 rounded-full blur-3xl"></div>

               <div className="relative z-10 max-w-4xl mx-auto text-center">
                  <Quote className="w-16 h-16 text-primary/30 mx-auto mb-6 rotate-180" />
                  <p className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-charcoal leading-relaxed mb-6">
                     Nếu mỗi ngày mình đều lập kế hoạch để sống tốt hơn, tại sao cuốn sổ đồng hành lại không thể
                     <span className="text-primary"> tốt hơn cho Trái Đất?</span>
                  </p>
                  <div className="flex items-center justify-center gap-3">
                     <div className="w-12 h-[2px] bg-primary/30"></div>
                     <p className="text-charcoal/60 text-sm font-medium">Câu hỏi khởi nguồn của MEDE</p>
                     <div className="w-12 h-[2px] bg-primary/30"></div>
                  </div>
               </div>
            </div>
         </section>

         {/* Brand Story - Grid Layout */}
         <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
               {/* Left - Image Stack */}
               <div className="relative h-[400px] lg:h-auto">
                  <div className="absolute top-0 left-0 w-[70%] h-[70%] rounded-3xl overflow-hidden shadow-2xl z-10">
                     <img
                        src="https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop"
                        className="w-full h-full object-cover"
                        alt="Writing"
                     />
                  </div>
                  <div className="absolute bottom-0 right-0 w-[65%] h-[65%] rounded-3xl overflow-hidden shadow-2xl border-4 border-paper">
                     <img
                        src="https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800&auto=format&fit=crop"
                        className="w-full h-full object-cover"
                        alt="Eco materials"
                     />
                  </div>
                  {/* Decorative Element */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-xl z-20">
                     <TreePine className="w-10 h-10 text-white" />
                  </div>
               </div>

               {/* Right - Content */}
               <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-stone-100 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-6 w-fit">
                     <Zap className="w-4 h-4" />
                     Câu chuyện của chúng tôi
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal mb-6">
                     Một cách làm sổ planner <span className="text-primary">khác biệt</span>
                  </h2>
                  <div className="space-y-4 text-charcoal/70 leading-relaxed">
                     <p>
                        Chúng ta đã quá quen với những năm tháng chạy vội: công việc chồng lên công việc, mục tiêu chồng lên mục tiêu. Khi mọi thứ trở nên rối, con người thường tìm về một điều đơn giản: <strong className="text-charcoal">viết ra</strong>.
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
         </section>

         {/* Mission & Vision - Cards */}
         <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission */}
            <div className="group relative bg-charcoal rounded-[2.5rem] p-8 lg:p-10 overflow-hidden hover:shadow-2xl transition-all duration-500">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                     <Target className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">Sứ mệnh</h3>
                  <p className="text-white/70 text-lg leading-relaxed">
                     Giúp mọi người lập kế hoạch sống rõ ràng hơn mỗi ngày với những cuốn planner <strong className="text-primary">đẹp — bền — thân thiện môi trường</strong>, bắt đầu từ bìa giấy tái chế.
                  </p>
               </div>
            </div>

            {/* Vision */}
            <div className="group relative bg-gradient-to-br from-primary to-primary/80 rounded-[2.5rem] p-8 lg:p-10 overflow-hidden hover:shadow-2xl transition-all duration-500">
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                     <Eye className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">Tầm nhìn</h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                     Trở thành thương hiệu planner được yêu thích vì tính hữu ích và lối sống bền vững, nơi mỗi cuốn sổ là một <strong className="text-white">lựa chọn tử tế</strong> với bản thân và Trái Đất.
                  </p>
               </div>
            </div>
         </section>

         {/* Core Values - Bento Style */}
         <section className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-stone-100">
            <div className="text-center mb-12">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-4">
                  <Sparkles className="w-4 h-4" /> Giá trị cốt lõi
               </div>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-charcoal">
                  Điều chúng mình <span className="text-primary">tin tưởng</span>
               </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {coreValues.map((value, index) => (
                  <div
                     key={index}
                     className="group relative bg-paper rounded-3xl p-6 md:p-8 hover:shadow-xl transition-all duration-300 border border-stone-100 hover:-translate-y-2 overflow-hidden"
                  >
                     <div className={`absolute top-0 right-0 w-32 h-32 ${value.bg} rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                     <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                           <value.icon className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-charcoal mb-3">{value.title}</h3>
                        <p className="text-charcoal/60 leading-relaxed text-sm">{value.description}</p>
                     </div>
                  </div>
               ))}
            </div>
         </section>

         {/* Belief Quote - Full Width */}
         <section className="relative rounded-[2.5rem] overflow-hidden">
            <div className="absolute inset-0">
               <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1600&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Nature"
               />
               <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"></div>
            </div>
            <div className="relative z-10 text-center py-16 md:py-24 px-8">
               <Leaf className="w-12 h-12 text-primary mx-auto mb-6" />
               <p className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-white leading-relaxed mb-6 max-w-3xl mx-auto">
                  "Một kế hoạch tốt không chỉ giúp bạn hoàn thành nhiều việc hơn, mà giúp bạn <span className="text-primary">sống đúng hơn</span>."
               </p>
               <p className="text-white/60 text-lg max-w-2xl mx-auto">
                  Một cuốn sổ planner tốt không chỉ đẹp trên bàn làm việc, mà còn tử tế với thế giới mà bạn đang xây tương lai trong đó.
               </p>
            </div>
         </section>

         {/* CTA Section */}
         <section className="bg-gradient-to-br from-primary via-primary to-green-600 rounded-[2.5rem] p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
               <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <Leaf className="w-10 h-10 text-white" />
               </div>
               <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-tight max-w-2xl">
                  Sẵn sàng lập kế hoạch một cách nhẹ nhàng hơn?
               </h2>
               <p className="text-white/80 text-lg max-w-xl">
                  Cho cả bạn và cho hành tinh này.
               </p>
               <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 h-14 px-10 bg-white hover:bg-white/90 text-primary font-bold rounded-full transition-all shadow-2xl hover:shadow-xl hover:scale-105"
               >
                  Khám phá sản phẩm <ArrowRight className="w-5 h-5" />
               </Link>
            </div>
         </section>
      </div>
   );
};

export default About;