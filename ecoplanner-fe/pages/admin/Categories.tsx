import React, { useState, useEffect } from 'react';
import { api, Category } from '../../services/api';
import { Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Categories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || ''
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '' });
    };

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData(prev => ({
            ...prev,
            name,
            slug: !editingCategory ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : prev.slug
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.updateCategory(editingCategory.id, formData);
                toast.success('Category updated successfully');
            } else {
                await api.createCategory(formData);
                toast.success('Category created successfully');
            }
            fetchCategories();
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
        try {
            await api.deleteCategory(id);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete category');
        }
    };

    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#1a2e24] tracking-tight font-display">Quản lý danh mục</h1>
                    <p className="text-[#5D7365] text-base font-medium">Quản lý các danh mục sản phẩm của hệ thống</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-[#129ca1] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#0e7c80] transition-colors shadow-lg"
                >
                    <Plus className="w-5 h-5" /> Thêm danh mục
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#129ca1]/20 focus:border-[#129ca1]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#F9F9F5] border-b border-stone-100">
                            <tr>
                                <th className="text-left py-4 px-6 font-bold text-[#1a2e24]">Tên danh mục</th>
                                <th className="text-left py-4 px-6 font-bold text-[#1a2e24]">Mã (Slug)</th>
                                <th className="text-left py-4 px-6 font-bold text-[#1a2e24]">Mô tả</th>
                                <th className="text-center py-4 px-6 font-bold text-[#1a2e24]">Sản phẩm</th>
                                <th className="text-right py-4 px-6 font-bold text-[#1a2e24]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-8 text-stone-400">Đang tải...</td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-stone-400">Không tìm thấy danh mục nào</td></tr>
                            ) : (
                                filteredCategories.map(category => (
                                    <tr key={category.id} className="hover:bg-[#F9F9F5] transition-colors">
                                        <td className="py-4 px-6 font-semibold text-[#1a2e24]">{category.name}</td>
                                        <td className="py-4 px-6 text-stone-500 font-mono text-sm">{category.slug}</td>
                                        <td className="py-4 px-6 text-stone-500 max-w-xs truncate">{category.description || '-'}</td>
                                        <td className="py-4 px-6 text-center text-[#1a2e24] font-bold">{category._count?.products || 0}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="p-2 hover:bg-white rounded-lg text-stone-500 hover:text-[#129ca1] transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    className="p-2 hover:bg-white rounded-lg text-stone-500 hover:text-red-500 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-stone-100">
                            <h2 className="text-xl font-bold font-display text-[#1a2e24]">
                                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-[#1a2e24] transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#1a2e24] mb-2">Tên danh mục</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#129ca1]/20 focus:border-[#129ca1]"
                                    placeholder="VD: Sổ kế hoạch"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#1a2e24] mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#129ca1]/20 focus:border-[#129ca1] font-mono text-sm"
                                    placeholder="so-ke-hoach"
                                    required
                                />
                                <p className="text-xs text-stone-400 mt-1">Định danh duy nhất trên URL</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#1a2e24] mb-2">Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#129ca1]/20 focus:border-[#129ca1] h-24"
                                    placeholder="Mô tả tùy chọn..."
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 mr-2 font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition-colors"
                                >
                                    Huỷ
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#129ca1] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#0e7c80] transition-colors shadow-lg shadow-[#129ca1]/20"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
