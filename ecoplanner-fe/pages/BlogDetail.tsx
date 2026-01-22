import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShoppingBag, Loader2, Play, Lightbulb } from 'lucide-react';
import { api, BlogPost, Product, BlogBlock } from '../services/api';

const BlockRenderer: React.FC<{ block: BlogBlock, products?: Product[] }> = ({ block, products }) => {
    switch (block.type) {
        case 'quote':
            return (
                <div
                    className="my-10 p-10 rounded-3xl border border-primary/10 relative"
                    style={{
                        backgroundColor: block.styles?.backgroundColor || 'transparent',
                        fontFamily: block.styles?.fontFamily === 'serif' ? 'Playfair Display, serif' : 'inherit'
                    }}
                >
                    <span className="text-6xl text-primary/20 absolute top-4 left-6 font-serif">"</span>
                    <blockquote className="text-2xl md:text-3xl font-bold text-charcoal italic leading-snug relative z-10">
                        {block.content}
                    </blockquote>
                </div>
            );
        case 'tip':
            return (
                <div
                    className="my-8 p-6 rounded-2xl text-white shadow-lg"
                    style={{ backgroundColor: block.styles?.backgroundColor || '#e28d68' }}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-wider opacity-90">Quick Tip</span>
                    </div>
                    <p className="text-lg leading-relaxed">{block.content}</p>
                </div>
            );
        case 'podcast':
            return (
                <div className="my-8 p-6 rounded-2xl bg-paper border-l-4 border-primary shadow-sm flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary text-white shrink-0">
                        <Play className="w-5 h-5 fill-current ml-1" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Podcast Episode</span>
                        <h4 className="text-xl font-bold text-charcoal">{block.content}</h4>
                    </div>
                </div>
            );
        case 'product':
            const linkedProduct = products?.find(p => p.id === block.productId);
            if (!linkedProduct) return null;
            return (
                <div className="my-10">
                    <Link
                        to={`/product/${linkedProduct.slug}`}
                        className="flex items-center gap-6 p-6 rounded-3xl bg-white border border-stone-100 hover:border-primary/30 transition-all hover:shadow-xl group"
                    >
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0">
                            <img
                                src={linkedProduct.image?.startsWith('http') ? linkedProduct.image : `${api.baseUrl}${linkedProduct.image}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={linkedProduct.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=ERR'; }}
                            />
                        </div>
                        <div className="flex-1">
                            <span className="text-primary font-bold text-xs uppercase tracking-widest mb-1 block">Sản phẩm nhắc đến</span>
                            <h4 className="text-xl font-bold text-charcoal mb-2 group-hover:text-primary transition-colors">{linkedProduct.name}</h4>
                            <p className="text-2xl font-black text-charcoal">
                                {linkedProduct.price.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <ShoppingBag className="w-8 h-8 text-stone-200 group-hover:text-primary transition-colors" />
                    </Link>
                </div>
            );
        default: // text
            return <p className="mb-6 text-lg md:text-xl text-charcoal/80 leading-relaxed">{block.content}</p>;
    }
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
                console.log('Fetching post for slug:', slug);
                const data = await api.getBlogBySlug(slug);
                console.log('Post data received:', data);
                setPost(data);
            } catch (error) {
                console.error('Failed to fetch blog post', error);
                // Don't navigate away yet, let's see the error
            } finally {
                setIsLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-black text-charcoal mb-4">Không tìm thấy bài viết</h1>
                    <p className="text-charcoal/60 mb-8 font-bold">Chúng mình không tìm thấy nội dung cho đường dẫn này: <strong>{slug}</strong></p>
                    <Link to="/blog" className="inline-flex items-center gap-2 text-primary hover:bg-primary/10 px-6 py-3 rounded-full font-bold transition-all border border-primary/20">
                        <ArrowLeft className="w-5 h-5" /> Quay lại Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-cream min-h-screen pb-20">
            {/* Navigation */}
            <div className="max-w-[850px] mx-auto px-6 py-8">
                <Link to="/blog" className="inline-flex items-center gap-2 text-charcoal/60 hover:text-primary transition-colors font-bold">
                    <ArrowLeft className="w-5 h-5" /> Quay lại Blog
                </Link>
            </div>

            <article className="max-w-[850px] mx-auto px-6">
                {/* Header */}
                <div className="mb-14 text-center">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {post.tags.map(tag => (
                            <span key={tag} className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">{tag}</span>
                        ))}
                    </div>
                    <h1 className="font-display text-4xl md:text-6xl font-black text-charcoal leading-tight mb-10 tracking-tight">{post.title}</h1>
                    <div className="flex items-center justify-center gap-8 text-charcoal/40 text-sm font-bold uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /> 5-min read
                        </div>
                        <div>•</div>
                        <div>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>

                {/* Cover Image */}
                {post.image && (
                    <div className="mb-16 rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
                        <img
                            src={post.image.startsWith('http') ? post.image : `${api.baseUrl}${post.image}`}
                            className="w-full h-auto object-cover max-h-[600px]"
                            alt={post.title}
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/850x500?text=ERR'; }}
                        />
                    </div>
                )}

                {/* Content Blocks */}
                <div className="max-w-[700px] mx-auto">
                    {post.content.map((block, index) => (
                        <BlockRenderer key={index} block={block} products={post.relatedProducts} />
                    ))}
                </div>

                {/* Footer Shop Section */}
                {post.relatedProducts && post.relatedProducts.length > 0 && (
                    <div className="mt-20 pt-20 border-t border-stone-200">
                        <h2 className="font-display text-4xl font-black text-charcoal mb-12 text-center">Shop the Story</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {post.relatedProducts.map(product => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.slug}`}
                                    className="group"
                                >
                                    <div className="aspect-square rounded-[2rem] overflow-hidden mb-6 shadow-sm group-hover:shadow-xl transition-all duration-500">
                                        <img
                                            src={product.image?.startsWith('http') ? product.image : `${api.baseUrl}${product.image}`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={product.name}
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=ERR'; }}
                                        />
                                    </div>
                                    <h3 className="font-bold text-xl text-charcoal group-hover:text-primary transition-colors text-center">{product.name}</h3>
                                    <p className="text-primary font-black mt-2 text-2xl text-center">
                                        {product.price.toLocaleString('vi-VN')}đ
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
};

export default BlogDetail;
