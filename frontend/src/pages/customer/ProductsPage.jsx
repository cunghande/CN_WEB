import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Eye, Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import useCart from '../../hooks/useCart.js';
import useProduct from '../../hooks/useProduct.js';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { setSelectedCategory } from '../../redux/slices/productSlice.js';
import { useDispatch } from 'react-redux';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getLowestStockVariant, getProductStock } from '../../utils/productHelpers.js';

const fallbackImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, selectedCategory } = useProduct();
  const { addToCart } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category') || '';
    if (category !== String(selectedCategory || '')) {
      dispatch(setSelectedCategory(category ? Number(category) : ''));
    }
  }, [dispatch, searchParams, selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (categoryId) nextParams.set('category', categoryId);
    else nextParams.delete('category');
    setSearchParams(nextParams);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const stock = getProductStock(product);
      const price = Number(product.base_price);
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
        || product.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStock = stockFilter === 'all' || (stockFilter === 'in' ? stock > 0 : stock <= 10);
      const matchesPrice =
        priceRange === 'all'
        || (priceRange === 'under300' && price < 300000)
        || (priceRange === '300to600' && price >= 300000 && price <= 600000)
        || (priceRange === 'over600' && price > 600000);

      return matchesSearch && matchesStock && matchesPrice;
    });
  }, [products, searchTerm, priceRange, stockFilter]);

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setSelectedVariant(getLowestStockVariant(product));
    setQuantity(1);
    setAddedToast(false);
  };

  const handleAddToCart = () => {
    if (!quickViewProduct || !selectedVariant || selectedVariant.stock_quantity <= 0) return;
    addToCart(quickViewProduct, selectedVariant, Math.min(quantity, selectedVariant.stock_quantity));
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-premium-700">Danh mục sản phẩm</p>
            <h1 className="mt-1 text-3xl font-black text-slate-950">Bộ sưu tập thời trang</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">Tìm kiếm theo tên, danh mục, khoảng giá và tình trạng tồn kho.</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
            {filteredProducts.length} sản phẩm phù hợp
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <Sidebar onCategoryChange={handleCategoryChange} />

          <div className="flex-1 space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm sản phẩm, danh mục..."
                    className="w-full rounded-md border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-premium-500"
                  />
                </div>
                <select value={priceRange} onChange={(event) => setPriceRange(event.target.value)} className="rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-premium-500">
                  <option value="all">Tất cả mức giá</option>
                  <option value="under300">Dưới 300.000đ</option>
                  <option value="300to600">300.000đ - 600.000đ</option>
                  <option value="over600">Trên 600.000đ</option>
                </select>
                <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-premium-500">
                  <option value="all">Tất cả tồn kho</option>
                  <option value="in">Còn hàng</option>
                  <option value="low">Sắp hết hàng</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="py-24"><Spinner size="lg" /></div>
            ) : error ? (
              <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-center text-sm font-bold text-red-600">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
                <SlidersHorizontal className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-4 font-black text-slate-950">Không có sản phẩm phù hợp</h3>
                <p className="mt-2 text-sm text-slate-500">Thử đổi từ khóa, danh mục hoặc khoảng giá.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const stock = getProductStock(product);
                  return (
                    <article key={product.id} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-soft">
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                        <img src={getImageUrl(product.image_url, fallbackImage)} alt={product.name} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                        <button onClick={() => openQuickView(product)} className="absolute right-3 top-3 rounded-md bg-white p-2 text-slate-800 shadow hover:bg-premium-700 hover:text-white" aria-label="Xem nhanh">
                          <Eye className="h-4 w-4" />
                        </button>
                        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-700">{product.category_name || 'Thời trang'}</span>
                        {stock <= 10 && <span className="absolute bottom-3 left-3 rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">Sắp hết hàng</span>}
                      </div>
                      <div className="space-y-3 p-4">
                        <div>
                          <h3 className="line-clamp-1 font-black text-slate-950">{product.name}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{product.description || 'Sản phẩm thời trang dễ phối đồ.'}</p>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <div>
                            <div className="font-black text-premium-800">{formatPrice(product.base_price)}</div>
                            <div className="text-xs text-slate-500">Tồn kho: {stock}</div>
                          </div>
                          <Button size="sm" onClick={() => openQuickView(product)}>
                            <ShoppingBag className="h-4 w-4" />
                            Chọn
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} title="Chi tiết sản phẩm" maxWidth="max-w-4xl">
        {quickViewProduct && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <img src={getImageUrl(quickViewProduct.image_url, fallbackImage)} alt={quickViewProduct.name} className="aspect-[3/4] w-full rounded-lg object-cover object-top" />
            <div className="flex flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase text-premium-700">{quickViewProduct.category_name || 'Thời trang'}</p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">{quickViewProduct.name}</h3>
                <div className="mt-3 text-2xl font-black text-premium-800">{formatPrice(quickViewProduct.base_price)}</div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{quickViewProduct.description || 'Sản phẩm thời trang dễ phối đồ, phù hợp sử dụng hằng ngày.'}</p>

                <div className="mt-6">
                  <label className="text-xs font-black uppercase text-slate-700">Biến thể</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickViewProduct.variants?.map((variant) => {
                      const active = selectedVariant?.id === variant.id;
                      const disabled = Number(variant.stock_quantity) <= 0;
                      return (
                        <button
                          key={variant.id}
                          disabled={disabled}
                          onClick={() => {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }}
                          className={`rounded-md border px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-45 ${active ? 'border-premium-700 bg-premium-50 text-premium-900' : 'border-slate-200 hover:border-slate-400'}`}
                        >
                          <span className="block font-black">{variant.size} - {variant.color}</span>
                          <span className="text-slate-500">Còn {variant.stock_quantity}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-700">Số lượng</span>
                  <div className="flex items-center overflow-hidden rounded-md border border-slate-200">
                    <button className="px-3 py-1.5 font-bold hover:bg-slate-50" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span className="min-w-10 border-x border-slate-200 px-3 py-1.5 text-center text-sm font-bold">{quantity}</span>
                    <button className="px-3 py-1.5 font-bold hover:bg-slate-50" onClick={() => setQuantity(Math.min(selectedVariant?.stock_quantity || 1, quantity + 1))}>+</button>
                  </div>
                </div>
                <Button size="lg" className="w-full" disabled={!selectedVariant || selectedVariant.stock_quantity <= 0} onClick={handleAddToCart}>
                  <ShoppingBag className="h-5 w-5" />
                  Thêm vào giỏ hàng
                </Button>
                {addedToast && (
                  <div className="flex items-center justify-center gap-2 rounded-md bg-emerald-50 py-2 text-sm font-bold text-emerald-700">
                    <Check className="h-4 w-4" />
                    Đã thêm sản phẩm vào giỏ
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductsPage;
