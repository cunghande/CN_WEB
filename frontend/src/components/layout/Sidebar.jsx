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
        className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition ${
          active ? 'bg-premium-50 font-bold text-premium-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
        }`}
        title={description}
      >
        <span className="truncate pr-3">{label}</span>
        {active && <Check className="h-4 w-4 flex-shrink-0 text-premium-700" />}
      </button>
    );
  };

  return (
    <aside className="w-full flex-shrink-0 lg:w-72">
      <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
          <SlidersHorizontal className="h-4 w-4 text-premium-700" />
          <h3 className="text-sm font-black uppercase text-slate-950">Danh mục</h3>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-9 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
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
