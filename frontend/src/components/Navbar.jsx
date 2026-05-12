import React from 'react';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container">
        <h1>BTL WebCN</h1>
        <ul className="nav-menu">
          <li><a href="/">Home</a></li>
          <li><a href="/products">Products</a></li>
          <li><a href="/cart">Cart</a></li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
