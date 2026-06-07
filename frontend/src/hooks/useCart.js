import { useDispatch, useSelector } from 'react-redux';
import { addItem, clearCart, removeItem, updateQuantity } from '../redux/slices/cartSlice.js';

const useCart = () => {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const addToCart = (product, variant, quantity = 1) => {
    // Giỏ hàng lưu theo variant_id vì cùng một sản phẩm có thể có nhiều size/màu.
    dispatch(addItem({
      variant_id: variant.id,
      product_id: product.id,
      name: product.name,
      base_price: product.base_price,
      image_url: product.image_url,
      size: variant.size,
      color: variant.color,
      quantity,
      unit_price: product.base_price
    }));
  };

  const removeFromCart = (variantId) => {
    dispatch(removeItem(variantId));
  };

  const changeQuantity = (variantId, quantity) => {
    dispatch(updateQuantity({ variant_id: variantId, quantity }));
  };

  const emptyCart = () => {
    dispatch(clearCart());
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    totalAmount,
    totalItems,
    addToCart,
    removeFromCart,
    changeQuantity,
    emptyCart
  };
};

export default useCart;
