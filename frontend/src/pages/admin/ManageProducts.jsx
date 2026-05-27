import React, { useMemo, useState } from 'react';
import { Edit, Image as ImageIcon, Plus, Search, Trash2 } from 'lucide-react';
import useProduct from '../../hooks/useProduct.js';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { createProductAPI, deleteProductAPI, updateProductAPI } from '../../services/productService.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getProductStock } from '../../utils/productHelpers.js';

const categoryOptions = [
  { id: 1, name: 'Áo thun nam' },
  { id: 2, name: 'Áo thun nữ' },
  { id: 3, name: 'Quần jean nam' },
  { id: 4, name: 'Quần short' },
  { id: 5, name: 'Áo khoác' },
  { id: 6, name: 'Váy công sở' },
  { id: 7, name: 'Đồ tập gym' },
  { id: 8, name: 'Phụ kiện' },
  { id: 9, name: 'Giày sneaker' },
  { id: 15, name: 'Áo hoodie' }
];

const emptyVariant = () => ({ size: '', color: '', image_url: '', stock_quantity: 0 });

const ManageProducts = () => {
  const { products, loading, refreshProducts } = useProduct();
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

  const [form, setForm] = useState({
    name: '',
    category_id: 1,
    base_price: '',
    description: '',
    image_url: '',
    imageFile: null,
    variants: [
      { size: 'S', color: 'Đen', image_url: '', stock_quantity: 20 },
      { size: 'M', color: 'Đen', image_url: '', stock_quantity: 30 },
      { size: 'L', color: 'Đen', image_url: '', stock_quantity: 20 }
    ]
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        || product.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const stock = getProductStock(product);
      const matchesStock = stockFilter === 'all' || (stockFilter === 'low' ? stock <= 10 : stock > 10);
      return matchesSearch && matchesStock;
    });
  }, [products, searchTerm, stockFilter]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateVariant = (index, key, value) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, idx) => idx === index ? { ...variant, [key]: value } : variant)
    }));
  };

  const openCreateModal = () => {
    setEditId(null);
    setError('');
    setForm({
      name: '',
      category_id: 1,
      base_price: '',
      description: '',
      image_url: '',
      imageFile: null,
      variants: [
        { size: 'S', color: 'Đen', image_url: '', stock_quantity: 20 },
        { size: 'M', color: 'Đen', image_url: '', stock_quantity: 30 },
        { size: 'L', color: 'Đen', image_url: '', stock_quantity: 20 }
      ]
    });
    setIsOpen(true);
  };

  const openEditModal = (product) => {
    setEditId(product.id);
    setError('');
    setForm({
      name: product.name,
      category_id: product.category_id || 1,
      base_price: product.base_price,
      description: product.description || '',
      image_url: product.image_url || '',
      imageFile: null,
      variants: product.variants?.length
        ? product.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          image_url: variant.image_url || '',
          stock_quantity: variant.stock_quantity
        }))
        : [emptyVariant()]
    });
    setIsOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name || !form.base_price) {
      setError('Vui lòng nhập tên và giá sản phẩm.');
      return;
    }

    const variants = form.variants
      .filter((variant) => variant.size && variant.color)
      .map((variant) => ({
        size: variant.size,
        color: variant.color,
        image_url: variant.image_url || '',
        stock_quantity: Number(variant.stock_quantity) || 0
      }));

    if (variants.length === 0) {
      setError('Vui lòng nhập ít nhất một biến thể size/màu.');
      return;
    }

    setFormLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('category_id', form.category_id);
      formData.append('base_price', form.base_price);
      formData.append('description', form.description);
      formData.append('variants', JSON.stringify(variants));

      if (form.imageFile) {
        formData.append('image', form.imageFile);
      } else if (form.image_url) {
        formData.append('image_url', form.image_url);
      }

      if (editId) await updateProductAPI(editId, formData);
      else await createProductAPI(formData);

      setIsOpen(false);
      refreshProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu sản phẩm.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      await deleteProductAPI(id);
      refreshProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa sản phẩm thất bại');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-premium-700">Kho hàng</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">Quản lý sản phẩm</h1>
            <p className="mt-2 text-sm text-slate-500">Thêm, sửa, xóa sản phẩm và quản lý nhiều biến thể size/màu.</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm theo tên sản phẩm hoặc danh mục..."
              className="w-full rounded-md border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-premium-500"
            />
          </div>
          <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-premium-500">
            <option value="all">Tất cả tồn kho</option>
            <option value="ok">Tồn kho ổn định</option>
            <option value="low">Tồn kho thấp</option>
          </select>
        </div>

        {loading ? (
          <div className="py-24"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4">Giá</th>
                    <th className="p-4">Biến thể</th>
                    <th className="p-4">Tồn kho</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const stock = getProductStock(product);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {product.image_url ? (
                              <img src={getImageUrl(product.image_url)} alt={product.name} className="h-12 w-12 rounded-md object-cover object-top" />
                            ) : (
                              <div className="grid h-12 w-12 place-items-center rounded-md bg-slate-100 text-slate-400"><ImageIcon className="h-5 w-5" /></div>
                            )}
                            <div>
                              <div className="line-clamp-1 font-black text-slate-950 dark:text-white">{product.name}</div>
                              <div className="line-clamp-1 text-xs text-slate-500">{product.description || 'Chưa có mô tả'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{product.category_name || 'Khác'}</span></td>
                        <td className="p-4 font-black text-premium-800">{formatPrice(product.base_price)}</td>
                        <td className="p-4 text-slate-600">{product.variants?.length || 0}</td>
                        <td className="p-4"><span className={`font-black ${stock <= 10 ? 'text-amber-700' : 'text-emerald-700'}`}>{stock}</span></td>
                        <td className="p-4 text-right">
                          <button onClick={() => openEditModal(product)} className="rounded-md p-2 text-blue-600 hover:bg-blue-50" aria-label="Sửa sản phẩm"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(product.id)} className="rounded-md p-2 text-red-600 hover:bg-red-50" aria-label="Xóa sản phẩm"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr><td colSpan="6" className="p-10 text-center text-slate-500">Không có sản phẩm phù hợp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-600">{error}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-black uppercase text-slate-600">Tên sản phẩm</span>
              <input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-black uppercase text-slate-600">Danh mục</span>
              <select value={form.category_id} onChange={(event) => updateForm('category_id', event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500">
                {categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-black uppercase text-slate-600">Giá bán</span>
              <input required type="number" value={form.base_price} onChange={(event) => updateForm('base_price', event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500" />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-black uppercase text-slate-600">Ảnh sản phẩm</span>
              <input type="file" accept="image/*" onChange={(event) => updateForm('imageFile', event.target.files[0])} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm" />
            </label>
          </div>

          {!form.imageFile && (
            <input value={form.image_url} onChange={(event) => updateForm('image_url', event.target.value)} placeholder="Hoặc nhập URL hình ảnh" className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500" />
          )}

          <label className="space-y-1">
            <span className="text-xs font-black uppercase text-slate-600">Mô tả</span>
            <textarea rows="3" value={form.description} onChange={(event) => updateForm('description', event.target.value)} className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-premium-500" />
          </label>

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-black text-slate-950 dark:text-white">Biến thể size/màu/tồn kho/ảnh</h4>
              <Button size="sm" variant="outline" onClick={() => updateForm('variants', [...form.variants, emptyVariant()])}>
                <Plus className="h-4 w-4" />
                Thêm biến thể
              </Button>
            </div>
            <div className="space-y-2">
              {form.variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <input value={variant.size} onChange={(event) => updateVariant(index, 'size', event.target.value)} placeholder="Size" className="col-span-2 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" />
                  <input value={variant.color} onChange={(event) => updateVariant(index, 'color', event.target.value)} placeholder="Màu" className="col-span-2 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" />
                  <input value={variant.image_url} onChange={(event) => updateVariant(index, 'image_url', event.target.value)} placeholder="URL ảnh biến thể" className="col-span-4 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" />
                  <input type="number" value={variant.stock_quantity} onChange={(event) => updateVariant(index, 'stock_quantity', event.target.value)} placeholder="Tồn" className="col-span-2 rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700" />
                  <button type="button" onClick={() => updateForm('variants', form.variants.filter((_, idx) => idx !== index))} className="col-span-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">Xóa</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={formLoading}>{formLoading ? <Spinner size="sm" /> : 'Lưu sản phẩm'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageProducts;
