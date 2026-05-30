import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Check, SlidersHorizontal } from 'lucide-react';
import { setSelectedCategory } from '../../redux/slices/productSlice.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Sidebar = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { selectedCategory } = useSelector((state) => state.products);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories`);
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSelect = (id) => {
    const nextCategory = selectedCategory === id ? '' : id;
    dispatch(setSelectedCategory(nextCategory));
    onCategoryChange?.(nextCategory);
  };

  const categoryButton = (id, label, description) => {
    const active = selectedCategory === id;

    return (
      <button
        key={id || 'all'}
        onClick={() => handleSelect(id)}
        className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
          active
            ? 'bg-slate-950 font-black text-white dark:bg-white dark:text-slate-950'
            : 'text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`}
        title={description}
      >
        <span className="truncate pr-3">{label}</span>
        {active && <Check className="h-4 w-4 flex-shrink-0 text-emerald-300 dark:text-emerald-700" />}
      </button>
    );
  };

  return (
    <aside className="w-full flex-shrink-0">
      <div className="sticky top-24 rounded-3xl border border-white bg-white/82 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><SlidersHorizontal className="h-4 w-4" /></div>
          <div>
            <h3 className="text-sm font-black text-slate-950 dark:text-white">Danh mục</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Lọc nhanh theo nhóm hàng</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-11 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : (
          <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
            {categoryButton('', 'Tất cả sản phẩm', 'Xem toàn bộ sản phẩm')}
            {categories.map((category) => categoryButton(category.id, category.name, category.description))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
