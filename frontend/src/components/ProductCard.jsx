import React from 'react';

function ProductCard({ product }) {
  return (
    <div className="card">
      <img src={product.image} alt={product.name} className="card-image" />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className="price">${product.price}</p>
      <button className="btn-add">Add to Cart</button>
    </div>
  );
}

export default ProductCard;
