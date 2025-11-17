import React, { useState, useEffect } from 'react';
import './SellerDashboard.css';

const SellerDashboard = ({ seller, setAllProducts, onLogout }) => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editIndex, setEditIndex] = useState(null);
    const [formData, setFormData] = useState({});

    // Fetch seller's products and orders from backend
    useEffect(() => {
        const fetchSellerData = async () => {
            try {
                // Fetch products by seller ID
                const productsResponse = await fetch(`http://localhost:3001/api/products?sellerId=${seller.id}`);
                if (productsResponse.ok) {
                    const contentType = productsResponse.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        const sellerProducts = await productsResponse.json();
                        setProducts(sellerProducts);
                    } else {
                        throw new Error('Response is not JSON');
                    }
                } else {
                    throw new Error('Failed to fetch products');
                }

                // For now, orders are stored locally, but you can add an orders API later
                const localOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
                setOrders(localOrders);
            } catch (error) {
                console.error('Error fetching seller data:', error);
                // Set products to empty array if API fails
                setProducts([]);
            }
        };

        if (seller && seller.id) {
            fetchSellerData();
        }
    }, [seller]);

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.category) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    price: parseFloat(formData.price),
                    category: formData.category,
                    image: formData.image || 'DefaultProduct.png',
                    vendor: seller.name,
                    sellerId: seller.id
                }),
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const newProduct = await response.json();
                    setProducts(prev => [...prev, newProduct]);
                    setAllProducts(prev => [...prev, newProduct]);
                    alert(`Product "${formData.name}" has been added!`);
                    closeModal();
                } else {
                    throw new Error('Response is not JSON');
                }
            } else {
                alert('Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product');
        }
    };

    const handleAddOrder = (e) => {
        e.preventDefault();
        const newOrder = {
            id: formData.id || Date.now().toString(),
            customer: formData.customer,
            amount: parseFloat(formData.amount),
            status: formData.status || 'pending',
            date: formData.date || new Date().toISOString().split('T')[0]
        };

        const updatedOrders = editIndex !== null ?
            orders.map((order, i) => i === editIndex ? newOrder : order) :
            [...orders, newOrder];

        setOrders(updatedOrders);
        localStorage.setItem('sellerOrders', JSON.stringify(updatedOrders));
        closeModal();
    };

    const openModal = (type, data = null, index = null) => {
        setModalType(type);
        setEditIndex(index);
        setFormData(data || {});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setFormData({});
        setEditIndex(null);
    };

    const deleteProduct = async (productId, index) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                // Note: You might want to add a DELETE endpoint to your backend
                // For now, we'll just remove from local state
                setProducts(prev => prev.filter((_, i) => i !== index));
                setAllProducts(prev => prev.filter(p => p._id !== productId));
                alert('Product deleted successfully');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Error deleting product');
            }
        }
    };

    const deleteOrder = (index) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            const updatedOrders = orders.filter((_, i) => i !== index);
            setOrders(updatedOrders);
            localStorage.setItem('sellerOrders', JSON.stringify(updatedOrders));
        }
    };

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h1><i className="fas fa-store"></i> Seller Center</h1>
                </div>
                <div className="seller-info">
                    <h3>{seller.name}</h3>
                    <p>Business Dashboard</p>
                </div>
                <nav className="sidebar-nav">
                    <a href="#" className="nav-item active">
                        <i className="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                </nav>
            </div>

            <div className="main-content">
                <div className="header">
                    <h2>Seller Dashboard</h2>
                    <div className="user-actions">
                        <a href="/" className="back-to-store">
                            <i className="fas fa-store"></i> Visit Store
                        </a>
                        <button className="logout-btn" onClick={onLogout}>
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card orders">
                        <div className="stat-icon">
                            <i className="fas fa-shopping-cart"></i>
                        </div>
                        <div className="stat-number">{orders.length}</div>
                        <div className="stat-label">New Orders</div>
                    </div>
                    <div className="stat-card revenue">
                        <div className="stat-icon">
                            <i className="fas fa-rupee-sign"></i>
                        </div>
                        <div className="stat-number">₹{totalRevenue}</div>
                        <div className="stat-label">Total Revenue</div>
                    </div>
                    <div className="stat-card products">
                        <div className="stat-icon">
                            <i className="fas fa-box"></i>
                        </div>
                        <div className="stat-number">{products.length}</div>
                        <div className="stat-label">Products</div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="content-section">
                    <div className="section-header">
                        <h3>Recent Orders</h3>
                        <button className="add-btn" onClick={() => openModal('order')}>
                            <i className="fas fa-plus"></i> Add Order
                        </button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order, index) => (
                                <tr key={index}>
                                    <td>{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>₹{order.amount}</td>
                                    <td>
                                        <span className={`status ${order.status}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{order.date}</td>
                                    <td>
                                        <button
                                            className="edit-btn action-btn"
                                            onClick={() => openModal('order', order, index)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn action-btn"
                                            onClick={() => deleteOrder(index)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Products Section */}
                <div className="content-section">
                    <div className="section-header">
                        <h3>Product Management</h3>
                        <button className="add-btn" onClick={() => openModal('product')}>
                            <i className="fas fa-plus"></i> Add Product
                        </button>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product._id}>
                                    <td>{product.name}</td>
                                    <td>₹{product.price}</td>
                                    <td>{product.category}</td>
                                    <td>
                                        <span className="status">Active</span>
                                    </td>
                                    <td>
                                        <button
                                            className="edit-btn action-btn"
                                            onClick={() => openModal('product', product, index)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn action-btn"
                                            onClick={() => deleteProduct(product._id, index)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="modal" style={{ display: 'block' }}>
                    <div className="modal-content">
                        <h3>
                            {editIndex !== null ? 'Edit' : 'Add'} {modalType === 'order' ? 'Order' : 'Product'}
                        </h3>
                        <form onSubmit={modalType === 'product' ? handleAddProduct : handleAddOrder}>
                            {modalType === 'order' ? (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Order ID"
                                        value={formData.id || ''}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Customer"
                                        value={formData.customer || ''}
                                        onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Amount"
                                        value={formData.amount || ''}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                    <select
                                        value={formData.status || 'pending'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <input
                                        type="date"
                                        value={formData.date || ''}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={formData.name || ''}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={formData.price || ''}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                    <select
                                        value={formData.category || 'Home Decor'}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Home Decor">Home Decor</option>
                                        <option value="Clothes">Clothes</option>
                                        <option value="Jewellery">Jewellery</option>
                                        <option value="Food & Dining">Food & Dining</option>
                                        <option value="Beauty">Beauty</option>
                                        <option value="Medicines">Medicines</option>
                                        <option value="Automotive">Automotive</option>
                                        <option value="Services">Services</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Image Filename"
                                        value={formData.image || 'DefaultProduct.png'}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-btn">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
