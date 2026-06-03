import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="text-lg font-black tracking-wide text-white">
              LUXURY<span className="text-premium-400">WEAR</span>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              Cửa hàng thời trang hiện đại với sản phẩm rõ biến thể, tồn kho minh bạch và quy trình đặt hàng đơn giản.
            </p>
            <div className="flex gap-3">
              <a href="#" className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase text-white">Mua sắm</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/products" className="hover:text-white">Tất cả sản phẩm</Link></li>
              <li><Link to="/products?category=1" className="hover:text-white">Thời trang nam</Link></li>
              <li><Link to="/products?category=2" className="hover:text-white">Thời trang nữ</Link></li>
              <li><Link to="/cart" className="hover:text-white">Giỏ hàng</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase text-white">Hỗ trợ</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white">Chính sách vận chuyển</a></li>
              <li><a href="#" className="hover:text-white">Đổi trả sản phẩm</a></li>
              <li><a href="#" className="hover:text-white">Hướng dẫn chọn size</a></li>
              <li><a href="#" className="hover:text-white">Thanh toán COD</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase text-white">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 text-premium-400" /> Thôn Ông Tố -thị trấn Yên Mỹ - Huyện Yên Mỹ- Tỉnh Hưng Yên</li>
              <li className="flex gap-2"><Phone className="h-4 w-4 text-premium-400" /> 0387378391</li>
              <li className="flex gap-2"><Mail className="h-4 w-4 text-premium-400" /> support@luxurywear.vn</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-slate-500">
          © 2026 LUXURYWEAR. Liên hệ với chúng tôi.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
