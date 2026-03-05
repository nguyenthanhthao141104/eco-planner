import React, { useState, useEffect } from 'react';
import { ArrowRight, Mail, Lightbulb, Play, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, BlogPost } from '../services/api';

const categories = [
   { label: 'Tất cả', value: '' },
   { label: 'Sống chậm', value: 'Sống chậm' },
   { label: 'Mẹo lập kế hoạch', value: 'Mẹo lập kế hoạch' },
   { label: 'Bảo vệ môi trường', value: 'Bảo vệ môi trường' },
   { label: 'Journaling', value: 'Journaling' }
];

const Blog: React.FC = () => {
   const navigate = useNavigate();
   const [posts, setPosts] = useState<BlogPost[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [activeFilter, setActiveFilter] = useState('');

   useEffect(() => {
      const fetchBlogs = async () => {
         setIsLoading(true);
         try {
            const data = await api.getBlogs({ tag: activeFilter });
            setPosts(data);
         } catch (error) {
            console.error('Failed to fetch blogs', error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchBlogs();
   }, [activeFilter]);

   const renderCard = (post: BlogPost) => {
      switch (post.type) {
         case 'QUOTE':
            return (
               <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="break-inside-avoid rounded-2xl bg-primary/10 p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer group border border-primary/10"
               >
                  <div className="flex flex-col gap-4">
                     <span className="text-4xl text-primary">"</span>
                     <h3 className="font-display text-2xl font-bold leading-tight text-charcoal italic">{post.title}</h3>
                     <div className="mt-4 flex items-center justify-between border-t border-primary/20 pt-4">
                        <span className="font-bold text-charcoal">Trích dẫn</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary">Quote</span>
                     </div>
                  </div>
               </article>
            );
         case 'TIP':
            const tipContent = post.excerpt || (post.content.blocks?.find((b: any) => b.type === 'quote')?.data?.text || '');
            return (
               <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="break-inside-avoid rounded-2xl bg-accent p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer group text-white"
               >
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-wide opacity-90">Quick Tip</span>
                     </div>
                     <h3 className="font-display text-2xl font-bold leading-tight">{post.title}</h3>
                     <p className="opacity-90 leading-relaxed text-sm line-clamp-3">{tipContent}</p>
                  </div>
               </article>
            );
         case 'PODCAST':
            return (
               <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="break-inside-avoid rounded-2xl bg-paper p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer group border-l-4 border-primary"
               >
                  <div className="flex flex-col gap-3">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white"><Play className="w-3 h-3 fill-current" /></div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">Podcast</span>
                     </div>
                     <h3 className="font-display text-xl font-bold leading-tight text-charcoal group-hover:text-primary transition-colors">{post.title}</h3>
                  </div>
               </article>
            );
         default: // ARTICLE
            const previewText = post.excerpt || (post.content.blocks?.find((b: any) => b.type === 'paragraph')?.data?.text || '');
            return (
               <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="break-inside-avoid rounded-2xl bg-paper p-4 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg cursor-pointer group"
               >
                  <div className="relative mb-4 overflow-hidden rounded-xl">
                     {post.image ? (
                        <img
                           src={post.image.startsWith('http') ? post.image : `${api.baseUrl}${post.image}`}
                           className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                           alt={post.title}
                           onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x250?text=ERR'; }}
                        />
                     ) : (
                        <div className="h-64 w-full bg-stone-100 flex items-center justify-center text-stone-400">No Image</div>
                     )}
                     <span className="absolute right-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-bold text-charcoal backdrop-blur-md">5 min read</span>
                  </div>
                  <div className="flex flex-col gap-3 px-2 pb-2">
                     <div className="flex items-center gap-2">
                        {post.tags.map(tag => (
                           <span key={tag} className="rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">{tag}</span>
                        ))}
                        <span className="text-xs font-medium text-charcoal/50">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                     </div>
                     <h3 className="font-display text-2xl font-bold leading-tight text-charcoal group-hover:text-primary transition-colors">{post.title}</h3>
                     <p className="text-sm leading-relaxed text-charcoal/60 line-clamp-3">{previewText}</p>
                     <div className="mt-2 flex items-center gap-1 text-sm font-bold text-primary">Đọc tiếp <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
                  </div>
               </article>
            );
      }
   };

   return (
      <div className="px-4 md:px-10 lg:px-40 py-8 md:py-12 bg-cream min-h-screen">
         <div className="max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
               <div className="flex max-w-2xl flex-col gap-4">
                  <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">Journal</span>
                  <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-charcoal md:text-5xl lg:text-6xl">Góc Yên Tĩnh</h1>
                  <p className="text-lg font-medium leading-relaxed text-charcoal/60 md:text-xl md:max-w-lg">Chậm lại một chút để tìm thấy sự cân bằng trong cuộc sống bận rộn.</p>
               </div>
            </div>

            {/* Filters */}
            <div className="mb-12 flex flex-wrap gap-3 overflow-x-auto pb-2 hide-scrollbar">
               {categories.map((cat, idx) => (
                  <button
                     key={idx}
                     onClick={() => setActiveFilter(cat.value)}
                     className={`h-10 items-center justify-center rounded-full px-6 text-sm font-semibold transition-all ${activeFilter === cat.value ? 'bg-charcoal text-white shadow-md' : 'bg-paper border border-stone-200 text-charcoal hover:border-primary hover:text-primary'}`}
                  >
                     {cat.label}
                  </button>
               ))}
            </div>

            {/* Grid */}
            {isLoading ? (
               <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
               </div>
            ) : (
               <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                  {posts.map(post => renderCard(post))}
                  {posts.length === 0 && (
                     <div className="col-span-full py-20 text-center text-charcoal/40">
                        Chưa có bài viết nào trong danh mục này.
                     </div>
                  )}
               </div>
            )}
         </div>
      </div>
   );
};

export default Blog;