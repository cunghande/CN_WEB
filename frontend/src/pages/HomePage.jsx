import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosInstance";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosClient.get("/products");
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <p>Đang tải sản phẩm...</p>;

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h1>Danh mục quần áo</h1>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: "1px solid #ddd", padding: "10px", borderRadius: "8px" }}>
              <h3>{product.name}</h3>
              <p style={{ color: "red", fontWeight: "bold" }}>{product.price?.toLocaleString()} VNĐ</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HomePage; 