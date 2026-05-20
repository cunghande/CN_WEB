import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, setSelectedCategory } from '../redux/slices/productSlice.js';

const useProduct = () => {
  const { items, loading, error, selectedCategory } = useSelector((state) => state.products);
  const dispatch = useDispatch();

  useEffect(() => {
    // selectedCategory thay đổi thì Redux tự gọi lại API /products?category=...
    dispatch(fetchProducts(selectedCategory));
  }, [dispatch, selectedCategory]);

  const selectCategory = (categoryId) => {
    dispatch(setSelectedCategory(categoryId));
  };

  return {
    products: items,
    loading,
    error,
    selectedCategory,
    selectCategory,
    refreshProducts: () => dispatch(fetchProducts(selectedCategory))
  };
};

export default useProduct;
