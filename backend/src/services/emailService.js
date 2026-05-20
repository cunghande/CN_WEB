export const sendOrderConfirmationEmail = (email, orderId, totalAmount) => {
  console.log(`\n✉️ [EMAIL SERVICE] Đang gửi email xác nhận đặt hàng...`);
  console.log(`- Đến: ${email}`);
  console.log(`- Mã đơn hàng: #${orderId}`);
  console.log(`- Tổng thanh toán: ${totalAmount.toLocaleString('vi-VN')} VND`);
  console.log(`✅ [EMAIL SERVICE] Gửi email thành công!\n`);
};
