import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import useProduct from '../../hooks/useProduct.js';
import Sidebar from '../../components/layout/Sidebar.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { setSelectedCategory } from '../../redux/slices/productSlice.js';
import { formatPrice } from '../../utils/formatPrice.js';
import { getImageUrl } from '../../utils/imageUrl.js';
import { getProductStock } from '../../utils/productHelpers.js';

const fallbackImage = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';
const PAGE_SIZE = 9;

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, selectedCategory } = useProduct();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilters, setMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '');
    setPriceRange(searchParams.get('price') || 'all');
    setStockFilter(searchParams.get('stock') || 'all');
    setSortBy(searchParams.get('sort') || 'featured');
    setCurrentPage(Number(searchParams.get('page') || 1));
  }, [searchParams]);

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
    nextParams.set('page', '1');
    setSearchParams(nextParams);
    setMobileFilters(false);
  };

  const updateUrlFilter = (key, value, { resetPage = true } = {}) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'featured') nextParams.delete(key);
    else nextParams.set(key, value);
    if (resetPage) nextParams.set('page', '1');
    setSearchParams(nextParams, { replace: true });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange('all');
    setStockFilter('all');
    setSortBy('featured');
    setCurrentPage(1);
    setSearchParams({});
    dispatch(setSelectedCategory(''));
    setMobileFilters(false);
  };

  const goToPage = (page) => {
    const nextPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(nextPage);
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage === 1) nextParams.delete('page');
    else nextParams.set('page', String(nextPage));
    setSearchParams(nextParams, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const list = products.filter((product) => {
      const stock = getProductStock(product);
      const price = Number(product.base_price);
      const matchesSearch = !keyword
        || product.name.toLowerCase().includes(keyword)
        || product.category_name?.toLowerCase().includes(keyword)
        || product.tags?.some((tag) => tag.name?.toLowerCase().includes(keyword));
      const matchesStock = stockFilter === 'all' || (stockFilter === 'in' ? stock > 0 : stock <= 10);
      const matchesPrice = priceRange === 'all'
        || (priceRange === 'under300' && price < 300000)
        || (priceRange === '300to600' && price >= 300000 && price <= 600000)
        || (priceRange === 'over600' && price > 600000);

      return matchesSearch && matchesStock && matchesPrice;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'priceAsc') return Number(a.base_price) - Number(b.base_price);
      if (sortBy === 'priceDesc') return Number(b.base_price) - Number(a.base_price);
      if (sortBy === 'rating') return Number(b.rating_avg || 0) - Number(a.rating_avg || 0);
      return Number(b.like_count || 0) - Number(a.like_count || 0);
    });
  }, [products, searchTerm, priceRange, stockFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice((safeCurrentPage - 1) * PAGE_SIZE, safeCurrentPage * PAGE_SIZE);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(totalPages, safeCurrentPage + 2);
    for (let page = start; page <= end; page += 1) pages.push(page);
    return pages;
  }, [safeCurrentPage, totalPages]);

  const filterControls = (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); updateUrlFilter('q', event.target.value); }} placeholder="Tìm áo khoác, váy, sneaker..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <select value={priceRange} onChange={(event) => { setPriceRange(event.target.value); updateUrlFilter('price', event.target.value); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="all">Tất cả mức giá</option>
          <option value="under300">Dưới 300.000đ</option>
          <option value="300to600">300.000đ - 600.000đ</option>
          <option value="over600">Trên 600.000đ</option>
        </select>
        <select value={stockFilter} onChange={(event) => { setStockFilter(event.target.value); updateUrlFilter('stock', event.target.value); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="all">Tất cả tồn kho</option>
          <option value="in">Còn hàng</option>
          <option value="low">Sắp hết hàng</option>
        </select>
        <select value={sortBy} onChange={(event) => { setSortBy(event.target.value); updateUrlFilter('sort', event.target.value); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="featured">Phổ biến</option>
          <option value="rating">Đánh giá cao</option>
          <option value="priceAsc">Giá thấp đến cao</option>
          <option value="priceDesc">Giá cao đến thấp</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-white/70 bg-white/58 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-black uppercase text-emerald-700 dark:text-emerald-300">LuxuryWear catalog</p>
              <h1 className="mt-2 max-w-3xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">Bộ sưu tập được thiết kế để mua nhanh, lọc rõ</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">Tìm theo tên, danh mục, hashtag, khoảng giá và tồn kho. Click vào sản phẩm để xem chi tiết, chọn biến thể và bình luận sau khi mua.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 px-6 py-5 text-white shadow-soft dark:bg-white dark:text-slate-950">
              <div className="text-3xl font-black">{filteredProducts.length}</div>
              <div className="text-sm font-bold text-slate-300 dark:text-slate-600">sản phẩm phù hợp</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <button onClick={() => setMobileFilters(true)} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950"><SlidersHorizontal className="h-4 w-4" />Bộ lọc</button>
          <button onClick={resetFilters} className="text-sm font-black text-slate-600 dark:text-slate-300">Xóa lọc</button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block"><Sidebar onCategoryChange={handleCategoryChange} /></div>
          <main className="space-y-5">
            <div className="rounded-3xl border border-white bg-white/82 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">{filterControls}</div>

            {loading ? (
              <div className="grid min-h-80 place-items-center"><Spinner size="lg" /></div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/35 dark:text-rose-200">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-white bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <SlidersHorizontal className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">Không có sản phẩm phù hợp</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Thử đổi từ khóa, danh mục hoặc khoảng giá.</p>
                <button onClick={resetFilters} className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-black text-white dark:bg-white dark:text-slate-950">Xóa bộ lọc</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map((product) => {
                  const stock = getProductStock(product);
                  const lowStock = stock <= 10;
                  return (
                    <Link key={product.id} to={`/products/${product.id}`} className="group overflow-hidden rounded-3xl border border-white bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
                      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={getImageUrl(product.image_url, fallbackImage)} alt={product.name} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                        <div className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-[11px] font-black uppercase text-slate-700 shadow-sm dark:bg-slate-950/90 dark:text-slate-200">{product.category_name || 'Thời trang'}</div>
                        {lowStock && <div className="absolute bottom-3 left-3 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-black text-slate-950 shadow-sm">Sắp hết hàng</div>}
                      </div>
                      <div className="space-y-3 p-4">
                        <div>
                          <h2 className="line-clamp-1 font-black text-slate-950 transition group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-300">{product.name}</h2>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{product.description || 'Sản phẩm thời trang dễ phối đồ.'}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {product.tags?.slice(0, 3).map((tag) => <span key={tag.id || tag.name} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{tag.name}</span>)}
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                          <div><div className="font-black text-slate-950 dark:text-white">{formatPrice(product.base_price)}</div><div className="text-xs text-slate-500 dark:text-slate-400">Tồn kho: {stock}</div></div>
                          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{Number(product.rating_avg || 0).toFixed(1)}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!loading && !error && filteredProducts.length > PAGE_SIZE && (
              <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-white bg-white/82 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
                <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Hiển thị {(safeCurrentPage - 1) * PAGE_SIZE + 1}-{Math.min(safeCurrentPage * PAGE_SIZE, filteredProducts.length)} trong {filteredProducts.length} sản phẩm
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Trước
                  </button>
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-black transition ${
                        page === safeCurrentPage
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 p-4 backdrop-blur-sm lg:hidden">
          <div className="ml-auto h-full max-w-sm overflow-y-auto rounded-3xl bg-[#f6f3ee] p-4 shadow-2xl dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between"><div className="text-lg font-black text-slate-950 dark:text-white">Bộ lọc</div><button onClick={() => setMobileFilters(false)} className="rounded-full p-2 text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></div>
            <div className="space-y-4"><Sidebar onCategoryChange={handleCategoryChange} /><div className="rounded-3xl border border-white bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">{filterControls}</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
