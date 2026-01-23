import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, Calendar, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, BlogPost } from '../../services/api';

const AdminBlogList: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const data = await api.getBlogs();
            setPosts(data);
        } catch (error) {
            console.error('Failed to load blogs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            setIsDeleting(true);
            // Assuming we add a delete endpoint to api client
            // await api.deleteBlog(id); 
            // For now, let's assume it exists or we use a generic request
            await api.request(`/api/blogs/${id}`, { method: 'DELETE' });
            setPosts(posts.filter(p => p.id !== id));
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Failed to delete blog:', error);
            alert('Không thể xóa bài viết');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-500 font-medium">Đang tải danh sách bài viết...</span>
            </div>
        );
    }

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e24] tracking-tight font-display">Góc Yên Tĩnh (Admin)</h2>
                    <p className="text-[#5D7365] text-base font-medium">Quản lý các bài viết, trích dẫn và podcast trên blog.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border-none bg-white py-3 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-[#129ca1]"
                        />
                    </div>
                    <button
                        onClick={() => navigate('/admin/blog/new')}
                        className="flex items-center gap-2 rounded-xl bg-[#129ca1] hover:bg-[#0e7c80] px-6 py-3 text-sm font-bold text-white shadow-lg whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> Viết bài mới
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    <div className="col-span-6">Bài viết</div>
                    <div className="col-span-2 text-center">Loại</div>
                    <div className="col-span-3 text-center">Ngày tạo</div>
                    <div className="col-span-1 text-right">Hành động</div>
                </div>

                {filteredPosts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <p className="text-gray-400 font-medium">{searchTerm ? 'Không tìm thấy bài viết nào phù hợp' : 'Chưa có bài viết nào'}</p>
                    </div>
                ) : (
                    filteredPosts.map((post) => (
                        <div key={post.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="col-span-1 md:col-span-6 flex items-center gap-5">
                                <div className="h-16 w-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                    {post.image ? (
                                        <img
                                            src={post.image.startsWith('http') ? post.image : `${api.baseUrl}${post.image}`}
                                            className="w-full h-full object-cover"
                                            alt={post.title}
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/96x64?text=ERR'; }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold uppercase">No Image</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-[#1a2e24] truncate">{post.title}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 flex md:justify-center">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${post.type === 'ARTICLE' ? 'bg-blue-100 text-blue-700' :
                                    post.type === 'QUOTE' ? 'bg-purple-100 text-purple-700' :
                                        post.type === 'TIP' ? 'bg-orange-100 text-orange-700' :
                                            'bg-green-100 text-green-700'
                                    }`}>
                                    {post.type}
                                </span>
                            </div>
                            <div className="col-span-1 md:col-span-3 flex md:justify-center items-center gap-2 text-sm font-bold text-gray-500">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="col-span-1 md:col-span-1 flex items-center justify-end gap-1">
                                <button
                                    onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                                    className="p-2 text-gray-400 hover:text-[#129ca1] rounded-lg transition-colors"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(post.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
                        <h3 className="text-2xl font-black text-[#1a2e24] mb-4">Xóa bài viết?</h3>
                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">Hành động này không thể hoàn tác. Bài viết sẽ biến mất vĩnh viễn khỏi blog của bạn.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Huỷ
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-200"
                            >
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                Xóa ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogList;
