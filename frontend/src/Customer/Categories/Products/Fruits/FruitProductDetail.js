import React, { useState, useEffect, useMemo } from 'react';
import './FruitProductDetail.css';

// Mock data extracted from the HTML file
export const allFruitProducts = [
    { id: 1001, name: "Fresh Apples", price: 299, vendor: "Orchard Fresh", image: "Fresh Apples.jpg", otherImages: ["Fresh Apples1.jpg", "Fresh Apples2.jpg", "Fresh Apples3.jpg"], lat: 17.4486, lon: 78.3908, category: "Fruits" },
    { id: 1002, name: "Fresh Bananas", price: 99, vendor: "Fruit Basket", image: "Fresh Bananas.jpg", otherImages: ["Fresh Bananas1.jpg", "Fresh Bananas2.jpg", "Fresh Bananas3.jpg"], lat: 17.4512, lon: 78.3855, category: "Fruits" },
    { id: 1003, name: "Fresh Tomatoes", price: 99, vendor: "Green Veggie", image: "Fresh Tomatoes.jpg", otherImages: ["Fresh Tomatoes1.jpg", "Fresh Tomatoes2.jpg", "Fresh Tomatoes3.jpg"], lat: 17.4421, lon: 78.3882, category: "Fruits" },
    { id: 1004, name: "Fresh Spinach", price: 79, vendor: "Green Grocer", image: "Fresh Spinach.jpg", otherImages: ["Fresh Spinach1.jpg", "Fresh Spinach2.jpg", "Fresh Spinach3.jpg"], lat: 17.4550, lon: 78.3920, category: "Fruits" },
    { id: 1005, name: "Fresh Oranges", price: 149, vendor: "Citrus Grove", image: "Fresh Oranges.jpg", otherImages: ["Fresh Oranges1.jpg", "Fresh Oranges2.jpg", "Fresh Oranges3.jpg"], lat: 17.4399, lon: 78.4421, category: "Fruits" }
];

const FruitProductDetail = ({ product, onAddToCart, onToggleWishlist, cartItems, wishlistItems, navigateTo, onViewProduct }) => {
    // Handle image source - check for uploaded files (with timestamps) vs static images
    const getImageSrc = (image) => {
        if (!image) {
            console.log('No image provided for product');
            return 'https://via.placeholder.com/200x150?text=No+Image';
        }

        // Check if image is already a full URL (uploaded via admin)
        if (image.startsWith('http://') || image.startsWith('https://')) {
            console.log('Using full URL image:', image);
            return image;
        }

        // Check if image is an uploaded file (contains timestamp like "1234567890-filename.jpg")
        if (image.includes('-') && /^\d+-\w+\./.test(image)) {
            const uploadPath = `http://localhost:5000/uploads/${image}`;
            console.log('Using uploaded image path:', uploadPath);
            return uploadPath;
        }

        // Otherwise, it's a static image
        const staticPath = `/IMAGES/${image}`;
        console.log('Using static image path:', staticPath);
        return staticPath;
    };

    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        if (product) {
            setMainImage(getImageSrc(product.image));
        }
        window.scrollTo(0, 0);
    }, [product]);

    const isInCart = useMemo(() => cartItems && cartItems.some(item => (item._id || item.id) === (product._id || product.id)), [cartItems, product]);
    const isInWishlist = useMemo(() => wishlistItems.some(item => (item._id || item.id) === (product._id || product.id)), [wishlistItems, product]);

    const thumbnailImages = useMemo(() => {
        if (!product) return [];
        const images = [getImageSrc(product.image)];
        if (product.otherImages && product.otherImages.length > 0) {
            return images.concat(product.otherImages.map(img => getImageSrc(img)));
        }
        return images;
    }, [product]);

    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return allFruitProducts
            .filter(p => p.id !== product.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
    }, [product]);

    if (!product) {
        return (
            <div className="container">
                <h1>Product not found</h1>
                <a href="#fruits" onClick={(e) => { e.preventDefault(); navigateTo('fruits'); }} className="back-link">&larr; Back to Fruits</a>
            </div>
        );
    }

    return (
        <div className="container">
            <a
                href="#fruits"
                onClick={(e) => { e.preventDefault(); navigateTo('fruits'); }}
                className="back-link"
            >
                &larr; Back to Fruits
            </a>

            <div className="product-detail-container">
                <div className="product-images">
                    <div className="main-image">
                        <img src={mainImage} alt={product.name} />
                    </div>
                    <div className="thumbnail-track">
                        {thumbnailImages.map((imgSrc, index) => (
                            <img
                                key={index}
                                src={imgSrc}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                className={`thumbnail ${mainImage === imgSrc ? 'active' : ''}`}
                                onClick={() => setMainImage(imgSrc)}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/80x80?text=No+Img'}
                            />
                        ))}
                    </div>
                </div>

                <div className="product-details">
                    <h1>{product.name}</h1>
                    <p className="product-vendor">by {product.vendor}</p>
                    <div className="product-price">₹{product.price.toLocaleString()}</div>
                    <div className="product-description">
                        <h3>Description</h3>
                        <p>Fresh, juicy fruits packaged with care. A healthy choice for your daily nutrition needs.</p>
                    </div>
                    <div className="product-distance">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{product.distance || 'Distance N/A'}</span>
                    </div>
                    <div className="product-actions">
                        {isInCart ? (
                             <button onClick={() => navigateTo('cart')} className="btn go-to-cart">Go to Cart</button>
                        ) : (
                            <button className="btn" onClick={() => onAddToCart(product)}>Add to Cart</button>
                        )}
                        <button
                            className={`wishlist-heart-btn ${isInWishlist ? 'active' : ''}`}
                            title="Add to Wishlist"
                            onClick={() => onToggleWishlist(product)}
                        >
                            <i className={isInWishlist ? "fas fa-heart" : "far fa-heart"}></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="related-products-section">
                <h2>Related Products</h2>
                <div className="related-product-grid">
                    {relatedProducts.map(related => (
                        <div key={related.id} className="related-product-card" onClick={() => onViewProduct(related)} style={{cursor: 'pointer'}}>
                            <img
                                src={getImageSrc(related.image)}
                                alt={related.name}
                                onError={(e) => e.target.src = 'https://via.placeholder.com/200x150?text=No+Img'}
                            />
                            <div className="related-product-info">
                                <h4>{related.name}</h4>
                                <p style={{fontSize: '14px', color: 'var(--gray)'}}>{related.vendor}</p>
                                <div className="product-price" style={{fontSize: '18px', marginTop: '10px'}}>
                                    ₹{related.price.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FruitProductDetail;