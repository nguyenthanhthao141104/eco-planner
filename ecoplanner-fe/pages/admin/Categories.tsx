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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-charcoal">Categories</h1>
                    <p className="text-charcoal/60">Manage product categories</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Add Category
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-cream/50 border-b border-stone-100">
                            <tr>
                                <th className="text-left py-4 px-6 font-bold text-charcoal">Name</th>
                                <th className="text-left py-4 px-6 font-bold text-charcoal">Slug</th>
                                <th className="text-left py-4 px-6 font-bold text-charcoal">Description</th>
                                <th className="text-center py-4 px-6 font-bold text-charcoal">Products</th>
                                <th className="text-right py-4 px-6 font-bold text-charcoal">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="text-center py-8 text-stone-400">Loading...</td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-stone-400">No categories found</td></tr>
                            ) : (
                                filteredCategories.map(category => (
                                    <tr key={category.id} className="hover:bg-cream/20 transition-colors">
                                        <td className="py-4 px-6 font-semibold text-charcoal">{category.name}</td>
                                        <td className="py-4 px-6 text-stone-500 font-mono text-sm">{category.slug}</td>
                                        <td className="py-4 px-6 text-stone-500 max-w-xs truncate">{category.description || '-'}</td>
                                        <td className="py-4 px-6 text-center text-charcoal font-bold">{category._count?.products || 0}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="p-2 hover:bg-white rounded-lg text-stone-500 hover:text-primary transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id, category.name)}
                                                    className="p-2 hover:bg-white rounded-lg text-stone-500 hover:text-red-500 transition-colors"
                                                    title="Delete"
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
                            <h2 className="text-xl font-bold font-display text-charcoal">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-charcoal transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-charcoal mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    placeholder="e.g. Planners"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-charcoal mb-2">Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm"
                                    placeholder="e.g. planners"
                                    required
                                />
                                <p className="text-xs text-stone-400 mt-1">Unique identifier for URL</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-charcoal mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-24"
                                    placeholder="Optional description..."
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2 mr-2 font-bold text-stone-500 hover:bg-stone-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingCategory ? 'Update' : 'Create'}
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
