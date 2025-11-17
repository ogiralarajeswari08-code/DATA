import React, { useState, useEffect, useMemo } from 'react';
import './OrganicProductDetail.css';

const OrganicProductDetail = ({ product, onAddToCart, onToggleWishlist, cartItems, wishlistItems, navigateTo, onViewProduct }) => {
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

    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products/category/Organic%20Veggies%26Fruits');
                if (!response.ok) {
                    throw new Error('Failed to fetch related products');
                }
                const data = await response.json();
                const filtered = data
                    .filter(p => p._id !== product._id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);
                setRelatedProducts(filtered);
            } catch (err) {
                console.error('Error fetching related products:', err);
                setRelatedProducts([]);
            }
        };

        if (product) {
            fetchRelatedProducts();
        }
    }, [product]);

    if (!product) {
        return (
            <div className="container">
                <h1>Product not found</h1>
                <a href="#organic" onClick={(e) => { e.preventDefault(); navigateTo('organic'); }} className="back-link">&larr; Back to Organic Products</a>
            </div>
        );
    }

    return (
        <div className="container">
            <a href="#organic" onClick={(e) => { e.preventDefault(); navigateTo('organic'); }} className="back-link">&larr; Back to Organic Products</a>
            
            <div className="product-detail-container">
                <div className="product-images">
                    <div className="main-image">
                        <img src={mainImage} alt={product.name} onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/400x400?text=No+Image'} />
                    </div>
                    <div className="thumbnail-track">
                        {thumbnailImages.map((imgSrc, index) => (
                            <img
                                key={index}
                                src={imgSrc}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                className={`thumbnail ${mainImage === imgSrc ? 'active' : ''}`}
                                onClick={() => setMainImage(imgSrc)}
                                onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/80x80?text=No'}
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
                        <p>Fresh and organic, straight from the farm. This high-quality produce is perfect for a healthy lifestyle.</p>
                    </div>

                    <div className="product-distance">
                        <i className="fas fa-map-marker-alt" />
                        <span>{product.distance || 'Distance N/A'}</span>
                    </div>

                    <div className="product-actions">
                        {isInCart ? (
                            <button className="btn go-to-cart" onClick={() => navigateTo('cart')}>Go to Cart</button>
                        ) : (
                            <button className="btn" onClick={() => onAddToCart(product)}>Add to Cart</button>
                        )}

                        <button className={`wishlist-heart-btn ${isInWishlist ? 'active' : ''}`} title="Add to Wishlist" onClick={() => onToggleWishlist(product)}>
                            <i className={isInWishlist ? 'fas fa-heart' : 'far fa-heart'} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="related-products-section">
                <h2>Related Products</h2>
                <div className="related-product-grid">
                    {relatedProducts.map(related => (
                        <div key={related.id} className="related-product-card" onClick={() => onViewProduct(related)} style={{cursor: 'pointer'}}>
                            <img src={getImageSrc(related.image)} alt={related.name} onError={(e)=> e.currentTarget.src='https://via.placeholder.com/200x200?text=No+Image'} />
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
}

export default OrganicProductDetail;
