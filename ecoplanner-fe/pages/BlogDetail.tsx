import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShoppingBag, Loader2, Play, Lightbulb, Plus } from 'lucide-react';
import { api, BlogPost, Product, BlogBlock } from '../services/api';

const slugify = (text: string) => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "")
        .replace(/(\s+)/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const applyAutolinks = (text: string, keywords: Record<string, string>) => {
    if (!keywords || Object.keys(keywords).length === 0) return text;

    // Sort keywords by length descending to avoid short keywords breaking longer ones
    const sortedKeys = Object.keys(keywords).sort((a, b) => b.length - a.length);

    let result = text;
    const usedRanges: { start: number, end: number }[] = [];

    // Simple heuristic: only auto-link the first occurrence of each keyword
    sortedKeys.forEach(keyword => {
        if (!keyword) return;
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        let match;

        // We handle this carefully to avoid linking inside already linked text
        // For simplicity in React, we'll return a mix of string and JSX if needed, 
        // but since we are rendering as text, we'll use dangerouslySetInnerHTML for the autolinked version
        // if we want to support HTML. For now let's just do a string replacement with <a> tags
        // and sanitize later if needed.

        result = result.replace(regex, (m) => {
            return `<a href="${keywords[keyword]}" class="text-primary font-bold hover:underline" target="_blank" rel="noopener noreferrer">${m}</a>`;
        });
    });
    return result;
};

const BlockRenderer: React.FC<{ block: any, products?: Product[], keywords?: Record<string, string> }> = ({ block, products, keywords }) => {
    const { type, data } = block;

    switch (type) {
        case 'header':
            const id = slugify(data.text);
            const Tag = `h${data.level || 2}` as any;
            const className = data.level === 1 ? "text-4xl md:text-6xl font-black text-charcoal mb-12" :
                data.level === 2 ? "text-3xl md:text-4xl font-black text-charcoal mt-16 mb-8 scroll-mt-24" :
                    "text-2xl font-black text-charcoal mt-12 mb-6 scroll-mt-24";
            return <Tag id={id} className={className} dangerouslySetInnerHTML={{ __html: data.text }} />;

        case 'paragraph':
            const processedText = keywords ? applyAutolinks(data.text, keywords) : data.text;
            return <p className="mb-8 text-xl text-charcoal/80 leading-[1.8] font-medium" dangerouslySetInnerHTML={{ __html: processedText }} />;

        case 'list':
            const ListTag = data.style === 'ordered' ? 'ol' : 'ul';
            return (
                <ListTag className={`mb-8 ml-6 space-y-3 ${data.style === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
                    {data.items.map((item: string, i: number) => (
                        <li key={i} className="text-xl text-charcoal/80 leading-relaxed pl-2" dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ListTag>
            );

        case 'image':
            return (
                <figure className="my-12 group">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-xl ring-1 ring-black/5">
                        <img
                            src={data.file.url}
                            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000"
                            alt={data.caption || 'Blog image'}
                            loading="lazy"
                        />
                    </div>
                    {data.caption && (
                        <figcaption className="text-center mt-4 text-sm text-charcoal/50 italic font-medium px-4" dangerouslySetInnerHTML={{ __html: data.caption }} />
                    )}
                </figure>
            );

        case 'quote':
            return (
                <div className="my-12 p-12 rounded-[2.5rem] bg-stone-50 border border-stone-200 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                    <span className="text-8xl text-stone-200 absolute -top-4 -left-2 font-serif select-none">"</span>
                    <blockquote className="text-2xl md:text-3xl font-black text-charcoal italic leading-tight relative z-10 pr-4" dangerouslySetInnerHTML={{ __html: data.text }} />
                    {data.caption && <cite className="block mt-6 text-sm font-bold text-stone-400 uppercase tracking-widest">— {data.caption}</cite>}
                </div>
            );

        case 'delimiter':
            return <hr className="my-16 border-t-2 border-dashed border-stone-200 w-24 mx-auto" />;

        case 'table':
            return (
                <div className="my-10 overflow-x-auto rounded-3xl border border-stone-200 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            {data.content.map((row: string[], i: number) => (
                                <tr key={i} className={i === 0 ? "bg-stone-50" : "border-t border-stone-100"}>
                                    {row.map((cell: string, j: number) => (
                                        <td key={j} className={`p-4 text-lg ${i === 0 ? "font-black text-charcoal" : "text-charcoal/70"}`} dangerouslySetInnerHTML={{ __html: cell }} />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        case 'checklist':
            return (
                <div className="mb-8 space-y-4">
                    {data.items.map((item: any, i: number) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-stone-100 shadow-sm">
                            <div className={`mt-1 size-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${item.checked ? 'bg-primary border-primary text-white' : 'border-stone-200'}`}>
                                {item.checked && <Plus className="w-4 h-4 rotate-45" />} { /* Placeholder for checkmark */}
                            </div>
                            <span className={`text-xl font-medium ${item.checked ? 'text-charcoal/40 line-through' : 'text-charcoal/80'}`} dangerouslySetInnerHTML={{ __html: item.text }} />
                        </div>
                    ))}
                </div>
            );

        default:
            return null;
    }
};

const TableOfContents: React.FC<{ blocks: any[] }> = ({ blocks }) => {
    const headings = blocks.filter(b => b.type === 'header');
    if (headings.length < 2) return null;

    return (
        <div className="my-16 p-8 md:p-10 rounded-[2.5rem] bg-white border border-stone-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            <h3 className="text-xl font-black text-charcoal mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-xs">01</span>
                Nội dung chính
            </h3>
            <nav className="space-y-4">
                {headings.map((h, i) => (
                    <a
                        key={i}
                        href={`#${slugify(h.data.text)}`}
                        className="flex items-start gap-4 text-charcoal/60 hover:text-primary transition-all group py-1"
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(slugify(h.data.text))?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        <span className="text-[10px] font-black mt-1.5 opacity-20 group-hover:opacity-100 transition-opacity">{(i + 1).toString().padStart(2, '0')}</span>
                        <span className="font-bold text-lg leading-tight border-b border-transparent group-hover:border-primary/20" dangerouslySetInnerHTML={{ __html: h.data.text }} />
                    </a>
                ))}
            </nav>
        </div>
    );
};

const BlogDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<(BlogPost & { relatedProducts: Product[] }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) return;
            setIsLoading(true);
            try {
                const data = await api.getBlogBySlug(slug);
                setPost(data);
            } catch (error) {
                console.error('Failed to fetch blog post', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                <p className="text-stone-400 font-black uppercase tracking-[0.2em] text-[10px]">Đang tải nội dung...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-black text-charcoal mb-4">Mất dấu rồi... 🍃</h1>
                    <p className="text-charcoal/60 mb-8 font-bold leading-relaxed">Bài viết này đã được dời đi hoặc không tồn tại. Thử tìm nội dung khác xem?</p>
                    <Link to="/blog" className="inline-flex items-center gap-3 bg-charcoal text-white px-10 py-4 rounded-full font-black transition-all hover:bg-primary shadow-xl shadow-charcoal/10">
                        <ArrowLeft className="w-5 h-5" /> Trở lại Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-cream min-h-screen pb-32">
            {/* Header / Hero Area */}
            <div className="max-w-[1000px] mx-auto px-6 pt-12">
                <Link to="/blog" className="inline-flex items-center gap-2 text-charcoal/40 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-12">
                    <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                </Link>

                <div className="mb-16">
                    <div className="flex flex-wrap items-center justify-start gap-3 mb-8">
                        {post.tags.map(tag => (
                            <span key={tag} className="bg-white border border-stone-100 text-charcoal/60 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{tag}</span>
                        ))}
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-black text-charcoal leading-[1.1] mb-12 tracking-tight">
                        {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-8 text-charcoal/40 text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-stone-100">
                            <Clock className="w-4 h-4 text-primary" /> 7-min read
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-stone-100">
                            Published {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>

                {/* Cover Image */}
                {post.image && (
                    <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/5 ring-1 ring-black/5 animate-in fade-in zoom-in duration-1000">
                        <img
                            src={post.image.startsWith('http') ? post.image : `${api.baseUrl}${post.image}`}
                            className="w-full h-auto object-cover max-h-[700px] hover:scale-105 transition-transform duration-[2000ms]"
                            alt={post.title}
                        />
                    </div>
                )}
            </div>

            {/* Main Content */}
            <article className="max-w-[750px] mx-auto px-6">
                <div className="content-renderer">
                    <TableOfContents blocks={post.content.blocks || []} />

                    {(post.content.blocks || []).map((block: any, index: number) => (
                        <BlockRenderer
                            key={index}
                            block={block}
                            products={post.relatedProducts}
                            keywords={post.seoKeywords}
                        />
                    ))}
                </div>

                {/* Article Footer Shop */}
                {post.relatedProducts && post.relatedProducts.length > 0 && (
                    <div className="mt-32 pt-20 border-t border-stone-200">
                        <div className="text-center mb-16 space-y-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Curated Collection</span>
                            <h2 className="font-display text-5xl font-black text-charcoal">Sản phẩm trong bài</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {post.relatedProducts.map(product => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}`}
                                    className="group flex flex-col items-center"
                                >
                                    <div className="aspect-square w-full rounded-[2.5rem] overflow-hidden mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700 ring-1 ring-black/5">
                                        <img
                                            src={product.image?.startsWith('http') ? product.image : `${api.baseUrl}${product.image}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            alt={product.name}
                                        />
                                    </div>
                                    <h3 className="font-black text-2xl text-charcoal group-hover:text-primary transition-colors text-center leading-tight mb-2">{product.name}</h3>
                                    <p className="text-primary font-black text-3xl text-center">
                                        {product.price.toLocaleString('vi-VN')}đ
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>

            {/* Newsletter Shortcut */}
            <div className="max-w-[1000px] mx-auto px-6 mt-32">
                <div className="bg-charcoal rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    <div className="relative z-10 max-w-xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-5xl font-display font-black text-white leading-tight">Yêu những trang viết?</h2>
                        <p className="text-white/60 text-lg font-medium">Nhận thông báo khi có bài viết mới và ưu đãi độc quyền hàng tuần.</p>
                        <form className="flex flex-col sm:flex-row gap-3 pt-6" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Email của bạn..." className="flex-1 px-8 py-5 rounded-full border-none focus:ring-2 focus:ring-primary/50 outline-none text-charcoal bg-white font-bold" required />
                            <button className="bg-primary text-white font-black px-10 py-5 rounded-full hover:scale-105 transition-all shadow-xl shadow-primary/20">Tham gia ngay</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
