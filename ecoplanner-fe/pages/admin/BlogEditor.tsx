import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, MoveUp, MoveDown, Save, ArrowLeft,
    Type, Quote, Lightbulb, Play, ShoppingBag, Loader2,
    Palette, Type as FontIcon, Eye, Search, Upload, Image as ImageIcon
} from 'lucide-react';
import { api, BlogPost, Product, BlogBlock } from '../../services/api';

const COLORS = [
    { name: 'Cream', hex: '#fdf6e3' },
    { name: 'Paper', hex: '#ffffff' },
    { name: 'Accent', hex: '#129ca1' },
    { name: 'Sunset', hex: '#e28d68' },
    { name: 'Stone', hex: '#f3f4f6' },
];

const AdminBlogEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    // Form state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [image, setImage] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [type, setType] = useState<BlogPost['type']>('ARTICLE');
    const [blocks, setBlocks] = useState<BlogBlock[]>([]);
    const [seoKeywords, setSeoKeywords] = useState<Record<string, string>>({});
    const [showProductSearch, setShowProductSearch] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const prods = await api.getProducts();
                setProducts(prods);

                if (id) {
                    const post = await api.request<BlogPost>(`/api/blogs/id/${id}`);
                    setTitle(post.title);
                    setSlug(post.slug);
                    setImage(post.image || '');
                    setTags(post.tags);
                    setType(post.type);
                    setBlocks(post.content || []);
                    setSeoKeywords(post.seoKeywords || {});
                }
            } catch (error) {
                console.error('Failed to init editor:', error);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, [id]);

    const generateSlug = (text: string) => {
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        const oldSlug = generateSlug(title);
        setTitle(newTitle);
        if (slug === '' || slug === oldSlug) {
            setSlug(generateSlug(newTitle));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { url } = await api.uploadFile(file);
            setImage(url);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Không thể upload ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    const handleBlockImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { url } = await api.uploadFile(file);
            updateBlock(index, { content: url });
        } catch (error) {
            console.error('Block upload failed:', error);
            alert('Không thể upload ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    const addBlock = (blockType: BlogBlock['type']) => {
        const newBlock: BlogBlock = {
            type: blockType,
            content: '',
            styles: {
                backgroundColor: blockType === 'quote' ? COLORS[0].hex : (blockType === 'tip' ? COLORS[3].hex : COLORS[1].hex),
                fontFamily: 'sans'
            }
        };
        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (index: number, updates: Partial<BlogBlock>) => {
        const newBlocks = [...blocks];
        newBlocks[index] = { ...newBlocks[index], ...updates };
        setBlocks(newBlocks);
    };

    const deleteBlock = (index: number) => {
        setBlocks(blocks.filter((_, i) => i !== index));
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;
        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    const handleSave = async () => {
        if (!title || !slug) {
            alert('Vui lòng nhập tiêu đề và slug');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                title, slug, image, tags, type,
                content: blocks,
                seoKeywords,
                relatedProductIds: blocks.filter(b => b.type === 'product' && b.productId).map(b => b.productId!)
            };

            if (id) {
                await api.request(`/api/blogs/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
            } else {
                await api.request('/api/blogs', { method: 'POST', body: JSON.stringify(payload) });
            }
            navigate('/admin/blog');
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Không thể lưu bài viết');
        } finally {
            setIsSaving(false);
        }
    };

    const addKeyword = () => {
        setSeoKeywords({ ...seoKeywords, "": "" });
    };

    const updateKeyword = (oldKey: string, newKey: string, url: string) => {
        const newKeywords = { ...seoKeywords };
        if (oldKey !== newKey) {
            delete newKeywords[oldKey];
        }
        newKeywords[newKey] = url;
        setSeoKeywords(newKeywords);
    };

    const deleteKeyword = (key: string) => {
        const newKeywords = { ...seoKeywords };
        delete newKeywords[key];
        setSeoKeywords(newKeywords);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="mt-4 text-gray-500 font-bold tracking-widest uppercase text-xs">Initializing Editor...</p>
            </div>
        );
    }

    return (
        <div className="bg-stone-50 min-h-screen">
            {/* Header Toolbar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/admin/blog')} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-stone-600" />
                    </button>
                    <h2 className="text-xl font-black text-charcoal">{id ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.open(`/blog/${slug}`, '_blank')}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 transition-all"
                    >
                        <Eye className="w-5 h-5" /> Xem trước
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-charcoal text-white font-bold hover:bg-primary transition-all shadow-lg shadow-charcoal/10 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Xuất bản bài viết
                    </button>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 p-12">

                {/* Editor Panel */}
                <div className="lg:col-span-7 space-y-10">
                    {/* Metadata Section */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6 ring-1 ring-stone-200">
                        <h3 className="font-bold text-stone-400 uppercase tracking-widest text-xs">Thông tin chung</h3>
                        <input
                            type="text" value={title} onChange={handleTitleChange}
                            placeholder="Tiêu đề bài viết..."
                            className="w-full text-4xl font-black bg-transparent border-none focus:ring-0 placeholder:text-stone-200"
                        />
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Đường dẫn (Slug)</label>
                                <input
                                    type="text" value={slug} onChange={e => setSlug(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-charcoal"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Loại nội dung</label>
                                <select
                                    value={type} onChange={e => setType(e.target.value as any)}
                                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-charcoal appearance-none"
                                >
                                    <option value="ARTICLE">Bài viết (Article)</option>
                                    <option value="QUOTE">Câu trích dẫn (Quote)</option>
                                    <option value="TIP">Mẹo nhanh (Tip)</option>
                                    <option value="PODCAST">Podcast</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Ảnh bìa bài viết</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-2xl hover:bg-stone-50 cursor-pointer transition-all">
                                        {isUploading ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-stone-300 mb-2" />
                                                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tải ảnh lên từ máy</span>
                                            </>
                                        )}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                    </label>
                                </div>
                                {image && (
                                    <div className="w-48 h-32 rounded-2xl overflow-hidden ring-1 ring-stone-200 relative group">
                                        <img src={image.startsWith('http') ? image : `${api.baseUrl}${image}`} className="w-full h-full object-cover" alt="Cover" />
                                        <button onClick={() => setImage('')} className="absolute inset-0 bg-red-500/80 text-white font-bold opacity-0 group-hover:opacity-100 transition-all">Xóa</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* SEO Keyword Mapping */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6 ring-1 ring-stone-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-stone-400 uppercase tracking-widest text-xs">SEO Keyword Map (Keyword ➔ Link)</h3>
                            <button onClick={addKeyword} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(seoKeywords).map(([key, url], idx) => (
                                <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                                    <input
                                        type="text" value={key}
                                        onChange={e => updateKeyword(key, e.target.value, url as string)}
                                        placeholder="Từ khóa..."
                                        className="flex-1 px-4 py-2 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                                    />
                                    <input
                                        type="text" value={url as string}
                                        onChange={e => updateKeyword(key, key, e.target.value)}
                                        placeholder="URL liên kết..."
                                        className="flex-[2] px-4 py-2 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-primary/20 text-sm"
                                    />
                                    <button onClick={() => deleteKeyword(key)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {Object.keys(seoKeywords).length === 0 && (
                                <p className="text-xs text-stone-300 italic">Chưa có từ khóa SEO nào được gắn.</p>
                            )}
                        </div>
                    </section>

                    {/* Blocks Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="font-bold text-stone-400 uppercase tracking-widest text-xs">Nội dung bài viết (Editor v2)</h3>
                            <div className="flex gap-2">
                                <button onClick={() => addBlock('heading')} title="Thêm tiêu đề" className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 text-stone-600 transition-all font-black text-xs">H2</button>
                                <button onClick={() => addBlock('text')} title="Thêm văn bản" className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 text-stone-600 transition-all"><Type className="w-5 h-5" /></button>
                                <button onClick={() => addBlock('image')} title="Thêm hình ảnh" className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 text-stone-600 transition-all"><ImageIcon className="w-5 h-5" /></button>
                                <button onClick={() => addBlock('quote')} title="Thêm trích dẫn" className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 text-stone-600 transition-all"><Quote className="w-5 h-5" /></button>
                                <button onClick={() => addBlock('tip')} title="Thêm mẹo vặt" className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 text-stone-600 transition-all"><Lightbulb className="w-5 h-5" /></button>
                                <button onClick={() => addBlock('podcast')} title="Thêm podcast" className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 text-stone-600 transition-all"><Play className="w-5 h-5" /></button>
                                <button onClick={() => addBlock('product')} title="Thêm sản phẩm" className="p-2.5 rounded-xl bg-white shadow-sm ring-1 ring-stone-200 hover:bg-stone-50 text-stone-600 transition-all"><ShoppingBag className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {blocks.map((block, index) => (
                                <div key={index} className="group bg-white p-6 rounded-3xl shadow-sm ring-1 ring-stone-200 relative animate-in fade-in slide-in-from-bottom-2">
                                    {/* Block Controls */}
                                    <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                        <button onClick={() => moveBlock(index, 'up')} className="p-2 hover:bg-stone-50 text-stone-400 rounded-lg"><MoveUp className="w-4 h-4" /></button>
                                        <button onClick={() => moveBlock(index, 'down')} className="p-2 hover:bg-stone-50 text-stone-400 rounded-lg"><MoveDown className="w-4 h-4" /></button>
                                        <button onClick={() => deleteBlock(index)} className="p-2 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>

                                    <div className="flex gap-6">
                                        <div className="shrink-0 w-8 flex flex-col items-center pt-2">
                                            {block.type === 'heading' && <div className="font-black text-stone-300 text-sm">H2</div>}
                                            {block.type === 'text' && <Type className="w-6 h-6 text-stone-300" />}
                                            {block.type === 'image' && <ImageIcon className="w-6 h-6 text-primary/40" />}
                                            {block.type === 'quote' && <Quote className="w-6 h-6 text-primary/40" />}
                                            {block.type === 'tip' && <Lightbulb className="w-6 h-6 text-orange-400" />}
                                            {block.type === 'podcast' && <Play className="w-6 h-6 text-primary" />}
                                            {block.type === 'product' && <ShoppingBag className="w-6 h-6 text-emerald-400" />}
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            {block.type === 'product' ? (
                                                <div className="space-y-4">
                                                    <button
                                                        onClick={() => setShowProductSearch(index)}
                                                        className="w-full p-4 rounded-2xl bg-stone-50 border-2 border-dashed border-stone-200 text-stone-400 font-bold hover:bg-stone-100 transition-all"
                                                    >
                                                        {block.productId ? products.find(p => p.id === block.productId)?.name : 'Chọn sản phẩm để tag...'}
                                                    </button>
                                                </div>
                                            ) : block.type === 'image' ? (
                                                <div className="space-y-4">
                                                    <div className="flex gap-4">
                                                        <label className="flex-1 relative flex flex-col items-center justify-center h-48 border-2 border-dashed border-stone-200 rounded-2xl hover:bg-stone-50 cursor-pointer transition-all overflow-hidden bg-stone-50/30">
                                                            {block.content ? (
                                                                <img src={block.content.startsWith('http') ? block.content : `${api.baseUrl}${block.content}`} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-8 h-8 text-stone-300 mb-2" />
                                                                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Tải ảnh đoạn hội thoại</span>
                                                                </>
                                                            )}
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleBlockImageUpload(index, e)} />
                                                        </label>
                                                        <div className="flex-1 space-y-3">
                                                            <input
                                                                type="text" value={block.alt || ''}
                                                                onChange={e => updateBlock(index, { alt: e.target.value })}
                                                                placeholder="Alt text (SEO)..."
                                                                className="w-full px-4 py-2 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-bold"
                                                            />
                                                            <textarea
                                                                value={block.caption || ''}
                                                                onChange={e => updateBlock(index, { caption: e.target.value })}
                                                                placeholder="Chú thích ảnh..."
                                                                rows={4}
                                                                className="w-full px-4 py-2 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-primary/20 text-sm resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <textarea
                                                    value={block.content} onChange={e => updateBlock(index, { content: e.target.value })}
                                                    placeholder={block.type === 'text' ? "Nhập nội dung (Hỗ trợ Markdown cơ bản)..." : "Nhập nội dung..."}
                                                    rows={block.type === 'text' ? 12 : 4}
                                                    className={`w-full bg-transparent border-none focus:ring-0 p-0 text-lg font-medium text-charcoal placeholder:text-stone-200 resize-y min-h-[100px] ${block.type === 'text' ? 'font-mono text-sm' : ''}`}
                                                />
                                            )}

                                            {/* Style Controls */}
                                            {(block.type === 'quote' || block.type === 'tip') && (
                                                <div className="flex items-center gap-6 pt-4 border-t border-stone-100 bg-stone-50/50 -mx-6 px-6 pb-2 rounded-b-3xl mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <Palette className="w-4 h-4 text-stone-400" />
                                                        <div className="flex gap-1.5">
                                                            {COLORS.map(c => (
                                                                <button
                                                                    key={c.hex}
                                                                    onClick={() => updateBlock(index, { styles: { ...block.styles, backgroundColor: c.hex } })}
                                                                    className={`w-5 h-5 rounded-full ring-2 ring-offset-2 transition-all ${block.styles?.backgroundColor === c.hex ? 'ring-primary' : 'ring-transparent'}`}
                                                                    style={{ backgroundColor: c.hex }}
                                                                    title={c.name}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-5 hidden lg:block sticky top-32 h-[calc(100vh-160px)]">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl h-full flex flex-col overflow-hidden ring-1 ring-black/5">
                        <div className="bg-stone-50 px-8 py-4 border-b border-stone-200 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Live Preview v2</span>
                            <div className="flex gap-1">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-cream p-12 custom-scrollbar">
                            <div className="max-w-[500px] mx-auto">
                                <div className="text-center mb-10">
                                    <h1 className="text-4xl font-black text-charcoal leading-tight mb-4">{title || 'Tiêu đề bài viết'}</h1>
                                    <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                        <span>{new Date().toLocaleDateString('vi-VN')}</span>
                                        <span>•</span>
                                        <span>7 min read</span>
                                    </div>
                                </div>
                                {image && <img src={image.startsWith('http') ? image : `${api.baseUrl}${image}`} className="w-full h-80 object-cover rounded-[2rem] mb-12 shadow-xl" alt="Preview" />}
                                <div className="space-y-10">
                                    {blocks.map((b, i) => (
                                        <div key={i}>
                                            {b.type === 'heading' && <h2 className="text-2xl font-black text-charcoal leading-tight mb-4">{b.content || 'Tiêu đề H2'}</h2>}
                                            {b.type === 'text' && <p className="text-base text-charcoal/80 leading-relaxed whitespace-pre-wrap">{b.content || 'Nội dung văn bản...'}</p>}
                                            {b.type === 'image' && b.content && (
                                                <figure className="space-y-3">
                                                    <img src={b.content.startsWith('http') ? b.content : `${api.baseUrl}${b.content}`} className="w-full h-auto rounded-3xl shadow-lg" alt={b.alt} />
                                                    {b.caption && <figcaption className="text-center text-xs text-stone-400 italic font-medium">{b.caption}</figcaption>}
                                                </figure>
                                            )}
                                            {b.type === 'quote' && (
                                                <div className="p-10 rounded-3xl relative shadow-sm border border-stone-100" style={{ backgroundColor: b.styles?.backgroundColor }}>
                                                    <span className="absolute top-2 left-6 text-6xl opacity-10 font-serif">"</span>
                                                    <p className="text-2xl font-black italic leading-tight text-charcoal">{b.content || 'Câu trích dẫn...'}</p>
                                                </div>
                                            )}
                                            {b.type === 'tip' && (
                                                <div className="p-6 rounded-2xl text-white shadow-lg" style={{ backgroundColor: b.styles?.backgroundColor }}>
                                                    <div className="flex items-center gap-2 mb-3 opacity-80"><Lightbulb className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest">Expert Tip</span></div>
                                                    <p className="text-lg font-bold leading-relaxed">{b.content || 'Mẹo vặt hữu ích...'}</p>
                                                </div>
                                            )}
                                            {b.type === 'product' && (
                                                <div className="p-5 rounded-3xl bg-white border border-stone-100 flex gap-5 items-center shadow-sm">
                                                    <div className="w-20 h-20 bg-stone-100 rounded-2xl overflow-hidden shrink-0 shadow-inner">
                                                        {b.productId && (
                                                            <img
                                                                src={products.find(p => p.id === b.productId)?.image?.startsWith('http') ? products.find(p => p.id === b.productId)?.image : `${api.baseUrl}${products.find(p => p.id === b.productId)?.image}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Item Highlight</p>
                                                        <p className="text-lg font-black text-charcoal truncate">{b.productId ? products.find(p => p.id === b.productId)?.name : 'Chưa chọn sản phẩm'}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Search Selector */}
            {showProductSearch !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
                        <div className="p-8 border-b border-stone-100 space-y-4">
                            <h3 className="text-2xl font-black text-charcoal">Gắn sản phẩm</h3>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                                <input
                                    type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Tìm theo tên sản phẩm..."
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 border-none focus:ring-2 focus:ring-primary/20 font-bold"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        updateBlock(showProductSearch, { productId: p.id });
                                        setShowProductSearch(null);
                                        setSearchTerm('');
                                    }}
                                    className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden ring-1 ring-stone-200">
                                        <img
                                            src={p.image?.startsWith('http') ? p.image : `${api.baseUrl}${p.image}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="font-bold text-charcoal truncate flex-1 group-hover:text-primary transition-colors">{p.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="p-8 border-t border-stone-100">
                            <button onClick={() => setShowProductSearch(null)} className="w-full py-3 rounded-xl bg-stone-100 text-stone-500 font-bold hover:bg-stone-200 transition-all">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogEditor;
