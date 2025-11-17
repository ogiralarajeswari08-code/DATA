import React, { useState } from 'react';
import './CartPage.css';

const CartPage = ({ cartItems, onUpdateQuantity, onRemoveFromCart, navigateTo, onToggleWishlist, wishlistItems }) => {
  const [selectedItemsIds, setSelectedItemsIds] = useState([]);

  const handleSelectItem = (itemId) => {
    const uniqueId = itemId._id || itemId.id || itemId;
    setSelectedItemsIds(prev =>
      prev.includes(uniqueId) ? prev.filter(id => id !== uniqueId) : [...prev, uniqueId]
    );
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <div className="section-title">
          <h2>Your Cart</h2>
        </div>
        <p>Your cart is empty. Add some products to get started!</p>
        <button className="btn" onClick={() => navigateTo('home')}>Continue Shopping</button>
      </div>
    );
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const commission = subtotal * 0.05;
  const total = subtotal + commission;

  return (
    <section className="section cart-section">
      <div className="container">
        <div className="section-title">
          <h2>Your Cart</h2>
        </div>
        <div className="cart-container">
          <div className="cart-actions">
            <button className="btn btn-secondary" onClick={() => {
              const selectedItems = cartItems.filter(item => selectedItemsIds.includes(item._id || item.id));
              const alreadyInWishlist = selectedItems.filter(item => wishlistItems.some(wishlistItem => (wishlistItem._id || wishlistItem.id) === (item._id || item.id)));
              if (alreadyInWishlist.length > 0) {
                alert('Selected items are already in wishlist');
              } else {
                selectedItems.forEach(item => onToggleWishlist(item));
              }
            }}>
              <i className="fas fa-heart"></i>
            </button>
            <button className="btn btn-danger" onClick={() => {
              const selectedItems = cartItems.filter(item => selectedItemsIds.includes(item._id || item.id));
              selectedItems.forEach(item => onRemoveFromCart(item._id || item.id));
            }}>
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
          <div id="cart-items">
            {cartItems.map(item => {
              const isInWishlist = wishlistItems.some(wishlistItem => (wishlistItem._id || wishlistItem.id) === (item._id || item.id));
              return (
                <div key={item.id} className="cart-item">
                  <input
                    type="checkbox"
                    checked={selectedItemsIds.includes(item._id || item.id)}
                    onChange={() => handleSelectItem(item)}
                    className="cart-item-checkbox"
                  />
                  <div className="cart-item-details">
                    <img
                      src={item.image.startsWith('http') ? item.image : `/IMAGES/${item.image}`}
                      alt={item.name}
                      onClick={() => navigateTo('productDetail', item)}
                      style={{cursor: 'pointer'}}
                    />
                    <div>
                      <span className="cart-item-name" onClick={() => navigateTo('productDetail', item)} style={{cursor: 'pointer'}}>{item.name}</span>
                      <span className="cart-item-vendor">by {item.vendor}</span>
                    </div>
                  </div>
                  <div className="cart-item-quantity">
                    <button onClick={() => onUpdateQuantity(item._id || item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item._id || item.id, item.quantity + 1)}>+</button>
                  </div>
                  <span className="cart-item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className="cart-bill">
            <h3>Order Summary</h3>
            <div id="cart-bill-items">
              {cartItems.map(item => (
                <div key={item.id} className="cart-bill-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="cart-bill-item">
              <span>Subtotal</span>
              <span id="cart-subtotal">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-bill-item">
              <span>Admin Commission (5%)</span>
              <span id="cart-commission">₹{commission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="cart-bill-total">
              <span>Total</span>
              <span id="cart-total">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="cart-checkout">
            <button className="btn" onClick={() => alert('Checkout functionality coming soon!')}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;