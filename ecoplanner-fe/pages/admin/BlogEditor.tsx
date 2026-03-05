import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Plus, Trash2, Save, ArrowLeft,
    Loader2, Eye, Upload, Search, ShoppingBag
} from 'lucide-react';
import { api, BlogPost, Product } from '../../services/api';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import QuoteTool from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import Table from '@editorjs/table';
import Checklist from '@editorjs/checklist';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';

const AdminBlogEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    // Editor.js ref
    const editorInstance = React.useRef<EditorJS | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [image, setImage] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [type, setType] = useState<BlogPost['type']>('ARTICLE');
    const [excerpt, setExcerpt] = useState('');
    const [seoKeywords, setSeoKeywords] = useState<Record<string, string>>({});
    const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const prods = await api.getProducts();
                setProducts(prods);

                if (id) {
                    const post = await api.request<BlogPost>(`/api/blogs/id/${id}`);
                    setTitle(post.title);
                    setSlug(post.slug);
                    setImage(post.image || '');
                    setExcerpt(post.excerpt || '');
                    setTags(post.tags);
                    setType(post.type);
                    setSeoKeywords(post.seoKeywords || {});
                    setRelatedProductIds(post.relatedProductIds || []);
                    (window as any)._initialEditorData = post.content;
                } else {
                    (window as any)._initialEditorData = undefined;
                }
                setIsDataLoaded(true);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (!isDataLoaded || editorInstance.current) return;

        const initEditor = () => {
            if (editorInstance.current) return;

            const container = document.getElementById('editorjs-container');
            if (!container) {
                // If container not found, try again shortly
                setTimeout(initEditor, 100);
                return;
            }

            const editor = new EditorJS({
                holder: 'editorjs-container',
                data: (window as any)._initialEditorData,
                tools: {
                    header: {
                        class: Header as any,
                        inlineToolbar: true,
                        config: { levels: [2, 3, 4], defaultLevel: 2 }
                    },
                    list: { class: List as any, inlineToolbar: true },
                    image: {
                        class: ImageTool as any,
                        inlineToolbar: true,
                        config: {
                            uploader: {
                                async uploadByFile(file: File) {
                                    const { url } = await api.uploadFile(file);
                                    return {
                                        success: 1,
                                        file: { url: url.startsWith('http') ? url : `${api.baseUrl}${url}` }
                                    };
                                }
                            }
                        }
                    },
                    table: { class: Table as any, inlineToolbar: true },
                    quote: { class: QuoteTool as any, inlineToolbar: true },
                    delimiter: Delimiter,
                    checklist: { class: Checklist as any, inlineToolbar: true },
                    inlineCode: InlineCode,
                    marker: Marker,
                    underline: Underline,
                },
                placeholder: 'Bắt đầu viết nội dung tuyệt vời của bạn tại đây...',
            });
            editorInstance.current = editor;
        };

        initEditor();

        return () => {
            if (editorInstance.current) {
                if (typeof editorInstance.current.destroy === 'function') {
                    editorInstance.current.destroy();
                }
                editorInstance.current = null;
            }
        };
    }, [isDataLoaded]);

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

    const handleSave = async () => {
        if (!title || !slug) {
            alert('Vui lòng nhập tiêu đề và slug');
            return;
        }

        if (!editorInstance.current) return;

        setIsSaving(true);
        try {
            const savedData = await editorInstance.current.save();

            const payload = {
                title, slug, image, excerpt, tags, type,
                content: savedData,
                seoKeywords,
                relatedProductIds
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

    const toggleProduct = (productId: string) => {
        if (relatedProductIds.includes(productId)) {
            setRelatedProductIds(relatedProductIds.filter(id => id !== productId));
        } else {
            setRelatedProductIds([...relatedProductIds, productId]);
        }
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

            <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 p-12">
                <div className="lg:col-span-8 space-y-10">
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
                        <div className="space-y-2">
                            <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Mô tả ngắn (Excerpt)</label>
                            <textarea
                                value={excerpt} onChange={e => setExcerpt(e.target.value)}
                                placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-stone-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-charcoal resize-none"
                            />
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

                    {/* Editor.js Container */}
                    <section className="bg-white p-12 rounded-[2.5rem] shadow-sm ring-1 ring-stone-200 min-h-[600px]">
                        <div id="editorjs-container" className="prose prose-stone max-w-none"></div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-10">
                    {/* Related Products Section */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6 ring-1 ring-stone-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-stone-400 uppercase tracking-widest text-xs">Sản phẩm liên quan</h3>
                            <button onClick={() => setShowProductSearch(true)} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {relatedProductIds.map(pid => {
                                const p = products.find(prod => prod.id === pid);
                                if (!p) return null;
                                return (
                                    <div key={pid} className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl group">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm border border-stone-200">
                                            <img src={p.image?.startsWith('http') ? p.image : `${api.baseUrl}${p.image}`} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <span className="flex-1 text-sm font-bold text-charcoal truncate">{p.name}</span>
                                        <button onClick={() => toggleProduct(pid)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                            {relatedProductIds.length === 0 && (
                                <p className="text-xs text-stone-300 italic">Chưa gắn sản phẩm nào.</p>
                            )}
                        </div>
                    </section>

                    {/* SEO Keyword Mapping */}
                    <section className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6 ring-1 ring-stone-200">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-stone-400 uppercase tracking-widest text-xs">SEO Keyword Map</h3>
                            <button onClick={addKeyword} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {Object.entries(seoKeywords).map(([key, url], idx) => (
                                <div key={idx} className="space-y-2 p-4 bg-stone-50 rounded-2xl relative group">
                                    <button onClick={() => deleteKeyword(key)} className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <input
                                        type="text" value={key}
                                        onChange={e => updateKeyword(key, e.target.value, url as string)}
                                        placeholder="Từ khóa..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold p-0"
                                    />
                                    <input
                                        type="text" value={url as string}
                                        onChange={e => updateKeyword(key, key, e.target.value)}
                                        placeholder="URL liên kết..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-[10px] text-stone-400 p-0"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
                        <h4 className="font-black text-primary text-xs uppercase tracking-widest mb-4">Mẹo soạn thảo</h4>
                        <ul className="text-xs font-medium text-primary/60 space-y-3">
                            <li>• Nhấn <kbd className="bg-white px-1.5 py-0.5 rounded border border-primary/20">Tab</kbd> để mở menu công cụ</li>
                            <li>• Quét chọn văn bản để định dạng (Đậm, Nghiêng, Link)</li>
                            <li>• Paste link ảnh hoặc video để tự động nhúng</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Product Search Selector */}
            {showProductSearch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 md:p-6 border-b border-stone-100 space-y-4">
                            <h3 className="text-2xl font-black text-charcoal">Gắn sản phẩm liên quan</h3>
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
                                    onClick={() => toggleProduct(p.id)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group ${relatedProductIds.includes(p.id) ? 'bg-primary/10' : 'hover:bg-stone-50'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden ring-1 ring-stone-200">
                                        <img
                                            src={p.image?.startsWith('http') ? p.image : `${api.baseUrl}${p.image}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className={`font-bold block truncate ${relatedProductIds.includes(p.id) ? 'text-primary' : 'text-charcoal'}`}>{p.name}</span>
                                        {relatedProductIds.includes(p.id) && <span className="text-[10px] text-primary font-black uppercase">Đã chọn</span>}
                                    </div>
                                    {relatedProductIds.includes(p.id) && <Plus className="w-5 h-5 text-primary rotate-45" />}
                                </button>
                            ))}
                        </div>
                        <div className="p-8 border-t border-stone-100">
                            <button onClick={() => setShowProductSearch(false)} className="w-full py-3 rounded-xl bg-charcoal text-white font-bold hover:bg-primary transition-all">Xong</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogEditor;
