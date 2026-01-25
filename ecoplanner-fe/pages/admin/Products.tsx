import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, X, Save, Upload } from 'lucide-react';
import { api, Product, Category } from '../../services/api';

interface ProductFormData {
   name: string;
   slug: string;
   price: number;
   oldPrice?: number;
   description: string;
   image: string;
   images: string[];
   tags: string[];
   stock: number;
   categoryId?: string;
}

const emptyForm: ProductFormData = {
   name: '', slug: '', price: 0, description: '', image: '', images: [], tags: [], stock: 0, categoryId: ''
};

const AdminProducts: React.FC = () => {
   const [products, setProducts] = useState<Product[]>([]);
   const [categories, setCategories] = useState<Category[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');

   // Modal state
   const [showModal, setShowModal] = useState(false);
   const [editingProduct, setEditingProduct] = useState<Product | null>(null);
   const [formData, setFormData] = useState<ProductFormData>(emptyForm);
   const [saving, setSaving] = useState(false);
   const [formError, setFormError] = useState('');
   const [isUploading, setIsUploading] = useState(false);

   // Delete state
   const [deletingId, setDeletingId] = useState<string | null>(null);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

   useEffect(() => {
      loadProducts();
   }, []);

   const loadProducts = async () => {
      try {
         setIsLoading(true);
         const [productsData, categoriesData] = await Promise.all([
            api.getProducts(),
            api.getCategories()
         ]);
         setProducts(productsData);
         setCategories(categoriesData);
      } catch (error) {
         console.error('Failed to load data:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const openCreateModal = () => {
      setEditingProduct(null);
      setFormData(emptyForm);
      setFormError('');
      setShowModal(true);
   };

   const openEditModal = (product: Product) => {
      setEditingProduct(product);
      setFormData({
         name: product.name,
         slug: product.slug,
         price: product.price,
         oldPrice: product.oldPrice,
         description: product.description || '',
         image: product.image,
         images: product.images || [],
         tags: product.tags || [],
         stock: product.stock,
         categoryId: product.categoryId || '',
      });
      setFormError('');
      setShowModal(true);
   };

   const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError('');

      if (!formData.name || !formData.slug || !formData.price || !formData.image) {
         setFormError('Vui lòng điền đầy đủ thông tin bắt buộc');
         return;
      }

      try {
         setSaving(true);
         if (editingProduct) {
            const updated = await api.updateProduct(editingProduct.id, formData);
            setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
         } else {
            const created = await api.createProduct(formData as Omit<Product, 'id'>);
            setProducts([created, ...products]);
         }
         setShowModal(false);
      } catch (error: unknown) {
         const err = error as Error;
         setFormError(err.message || 'Không thể lưu sản phẩm');
      } finally {
         setSaving(false);
      }
   };

   const handleDelete = async (id: string) => {
      try {
         setDeletingId(id);
         await api.deleteProduct(id);
         setProducts(products.filter(p => p.id !== id));
         setShowDeleteConfirm(null);
      } catch (error) {
         console.error('Failed to delete:', error);
         alert('Không thể xóa sản phẩm');
      } finally {
         setDeletingId(null);
      }
   };

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
         setIsUploading(true);
         setFormError('');
         const { url } = await api.uploadFile(file);
         // The backend returns a relative URL like /uploads/..., we need to ensure it has the base URL if needed, 
         // but usually the frontend handles /uploads/ as serving from the API base.
         setFormData({ ...formData, image: url });
      } catch (error: any) {
         console.error('Upload failed:', error);
         setFormError('Tải ảnh thất bại: ' + (error.message || 'Lỗi không xác định'));
      } finally {
         setIsUploading(false);
      }
   };

   const generateSlug = (name: string) => {
      return name.toLowerCase()
         .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
         .replace(/đ/g, 'd').replace(/Đ/g, 'D')
         .replace(/[^a-z0-9]+/g, '-')
         .replace(/^-|-$/g, '');
   };

   const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

   const getStockStatus = (stock: number) => {
      if (stock > 100) return { text: 'Còn hàng', color: 'bg-emerald-100 text-emerald-800' };
      if (stock > 20) return { text: 'Sắp hết', color: 'bg-yellow-100 text-yellow-800' };
      if (stock > 0) return { text: 'Ít hàng', color: 'bg-orange-100 text-orange-800' };
      return { text: 'Hết hàng', color: 'bg-red-100 text-red-800' };
   };

   const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
   );

   if (isLoading) {
      return (
         <div className="p-8 lg:p-12 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-500">Đang tải sản phẩm...</span>
         </div>
      );
   }

   return (
      <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2e24] tracking-tight font-display">Quản lý sản phẩm</h2>
               <p className="text-[#5D7365] text-base font-medium">Danh sách {products.length} sản phẩm trong kho.</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
               <div className="relative group w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                     type="text"
                     placeholder="Tìm kiếm sản phẩm..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full rounded-xl border-none bg-white py-3 pl-12 pr-4 text-sm shadow-sm focus:ring-2 focus:ring-[#129ca1]"
                  />
               </div>
               <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 rounded-xl bg-[#129ca1] hover:bg-[#0e7c80] px-6 py-3 text-sm font-bold text-white shadow-lg whitespace-nowrap"
               >
                  <Plus className="w-5 h-5" /> Thêm sản phẩm
               </button>
            </div>
         </div>

         <div className="flex flex-col gap-4">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
               <div className="col-span-5">Sản phẩm</div>
               <div className="col-span-2 text-center">Danh mục</div>
               <div className="col-span-2 text-center">Tồn kho</div>
               <div className="col-span-2 text-right">Giá</div>
               <div className="col-span-1 text-right">Hành động</div>
            </div>

            {filteredProducts.length === 0 ? (
               <div className="text-center py-12 text-gray-500">
                  {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}
               </div>
            ) : filteredProducts.map((p) => {
               const status = getStockStatus(p.stock);
               return (
                  <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-all">
                     <div className="col-span-1 md:col-span-5 flex items-center gap-5">
                        <div className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden">
                           <img
                              src={p.image?.startsWith('http') ? p.image : `${api.baseUrl}${p.image}`}
                              className="w-full h-full object-cover"
                              alt={p.name}
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/64?text=ERR'; }}
                           />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-[#1a2e24]">{p.name}</h3>
                           <p className="text-sm font-medium text-gray-500">SKU: {p.slug}</p>
                        </div>
                     </div>
                     <div className="col-span-1 md:col-span-2 flex md:justify-center">
                        {p.category ? (
                           <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-cream text-charcoal border border-stone-200">
                              {p.category.name}
                           </span>
                        ) : (
                           <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${status.color}`}>{status.text}</span>
                        )}
                     </div>
                     <div className="col-span-1 md:col-span-2 flex md:justify-center font-medium text-gray-600">{p.stock} sản phẩm</div>
                     <div className="col-span-1 md:col-span-2 flex md:justify-end font-bold text-[#1a2e24]">{formatPrice(p.price)}</div>
                     <div className="col-span-1 md:col-span-1 flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(p)} className="p-2 text-gray-400 hover:text-[#129ca1] rounded-lg"><Edit className="w-5 h-5" /></button>
                        <button onClick={() => setShowDeleteConfirm(p.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Create/Edit Modal */}
         {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
               <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl my-8">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-[#1a2e24]">
                        {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                     </h3>
                     <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                     </button>
                  </div>

                  {formError && (
                     <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl mb-4 text-sm">
                        {formError}
                     </div>
                  )}

                  <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                        <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => {
                              setFormData({
                                 ...formData,
                                 name: e.target.value,
                                 slug: editingProduct ? formData.slug : generateSlug(e.target.value)
                              });
                           }}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                           placeholder="VD: Sổ Planner 2025"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                        <input
                           type="text"
                           value={formData.slug}
                           onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                           placeholder="so-planner-2025"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                        <select
                           value={formData.categoryId}
                           onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent bg-white"
                           required
                        >
                           <option value="">Chọn danh mục</option>
                           {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                           ))}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Giá *</label>
                           <input
                              type="number"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                              placeholder="185000"
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Giá cũ</label>
                           <input
                              type="number"
                              value={formData.oldPrice || ''}
                              onChange={(e) => setFormData({ ...formData, oldPrice: parseInt(e.target.value) || undefined })}
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                              placeholder="220000"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tồn kho</label>
                        <input
                           type="number"
                           value={formData.stock}
                           onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                           placeholder="100"
                        />
                     </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                           <label className="block text-sm font-medium text-gray-700">Hình ảnh *</label>
                           <label className="cursor-pointer text-xs font-bold text-[#129ca1] hover:text-[#0e7c80] flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              Tải ảnh lên
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                           </label>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex-1 relative">
                              <input
                                 type="text"
                                 value={formData.image}
                                 onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                 className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                                 placeholder="URL Hình ảnh (https://...)"
                                 disabled={isUploading}
                              />
                              {isUploading && (
                                 <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#129ca1]" />
                                 </div>
                              )}
                           </div>
                           {formData.image && (
                              <div className="w-[46px] h-[46px] rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
                                 <img
                                    src={formData.image.startsWith('http') ? formData.image : `${api.baseUrl}${formData.image}`}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                       (e.target as HTMLImageElement).src = 'https://placehold.co/46?text=ERR';
                                    }}
                                 />
                              </div>
                           )}
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (cách nhau bởi dấu phẩy)</label>
                        <input
                           type="text"
                           value={formData.tags.join(', ')}
                           onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent"
                           placeholder="planner, 2025, bestseller"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                           value={formData.description}
                           onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                           rows={3}
                           className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#129ca1] focus:border-transparent resize-none"
                           placeholder="Mô tả chi tiết sản phẩm..."
                        />
                     </div>

                     <div className="flex gap-3 pt-4">
                        <button
                           type="button"
                           onClick={() => setShowModal(false)}
                           className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                        >
                           Huỷ
                        </button>
                        <button
                           type="submit"
                           disabled={saving}
                           className="flex-1 px-4 py-2.5 rounded-xl bg-[#129ca1] text-white font-bold hover:bg-[#0e7c80] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                           {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                           {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Delete Confirmation */}
         {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
                  <h3 className="text-lg font-bold text-[#1a2e24] mb-2">Xác nhận xóa</h3>
                  <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.</p>
                  <div className="flex gap-3">
                     <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                     >
                        Huỷ
                     </button>
                     <button
                        onClick={() => handleDelete(showDeleteConfirm)}
                        disabled={deletingId === showDeleteConfirm}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {deletingId === showDeleteConfirm ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Xóa
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default AdminProducts;