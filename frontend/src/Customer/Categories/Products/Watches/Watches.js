import React, { useState, useEffect, useCallback } from 'react';
import './watches.css';
import { allWatchesProducts } from './WatchesProductDetail'; // Assuming data is in detail file

const WatchCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted, onViewProduct, cartItems, navigateTo }) => {
    const handleImageError = (e) => {
        e.target.src = `https://via.placeholder.com/200x200?text=${product.name.replace(/\s/g, '+')}`;
    };

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return;
        onViewProduct(product);
    };

    // Handle image source - check for uploaded files (with timestamps) vs static images
    const getImageSrc = () => {
        if (!product.image) {
            return `https://via.placeholder.com/200x200?text=${product.name.replace(/\s/g, '+')}`;
        }
        if (product.image.startsWith('http')) {
            return product.image;
        }
        // Check if it's an uploaded file (contains timestamp like "1234567890-filename.jpg")
        if (product.image.includes('-') && /^\d+-\w+\./.test(product.image)) {
            return `http://localhost:5000/uploads/${product.image}`;
        }
        // Otherwise, it's a static image in IMAGES folder
        return `/IMAGES/${product.image}`;
    };

    return (
        <div className="product-card" draggable="true" onClick={handleCardClick} style={{cursor: 'pointer'}}>
            <img
                src={getImageSrc()}
                alt={product.name}
                className="product-img"
                onError={handleImageError}
            />
            <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <div className="product-vendor"><i className="fas fa-store"></i> <span>{product.vendor}</span></div>
                <div className="product-distance"><i className="fas fa-map-marker-alt"></i> <span>{product.distance || 'Calculating...'}</span></div>
                <div className="product-price">₹{product.price.toLocaleString()}</div>
                <div className="product-actions">
                    <button className="like-btn" onClick={() => onToggleWishlist(product)} style={{ color: isWishlisted ? 'var(--secondary)' : 'var(--gray)' }}>
                        <i className={isWishlisted ? "fas fa-heart" : "far fa-heart"}></i>
                    </button>
                    {cartItems && cartItems.some(item => (item._id || item.id) === (product._id || product.id)) ? (
                        <button className="btn go-to-cart" onClick={() => navigateTo('cart')}>Go to Cart</button>
                    ) : (
                        <button className="btn add-to-cart" onClick={() => onAddToCart(product)}>Add to Cart</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const Watches = ({ wishlistItems, onAddToCart, onToggleWishlist, onViewProduct, cartItems, navigateTo, searchQuery }) => {
    const [allProducts, setAllProducts] = useState({
        womens: [],
        mens: [],
        kids: []
    });
    const [filteredProducts, setFilteredProducts] = useState({
        womens: [],
        mens: [],
        kids: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideImages = [
        "IMAGES/watches-hero-11.jpg",
        "IMAGES/watches-hero-2.jpg",
        "IMAGES/wateches-hero-3.jpeg"
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slideImages.length);
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(slideInterval);
    }, [slideImages.length]);

    const getDistanceFromLatLonInKm = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const deg2rad = (deg) => deg * (Math.PI / 180);
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }, []);

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/products/category/Watches');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const products = await response.json();

                // Filter products into categories
                const womens = products.filter(p => p.subcategory === "Women's Watches");
                const mens = products.filter(p => p.subcategory === "Men's Watches");
                const kids = products.filter(p => p.subcategory === "Kids' Watches");

                const categorizedProducts = {
                    womens,
                    mens,
                    kids
                };

                setAllProducts(categorizedProducts);
                setFilteredProducts(categorizedProducts);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Apply geolocation and distance calculation
    useEffect(() => {
        if (allProducts.womens.length > 0 && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;
                    const updatedProducts = {
                        womens: allProducts.womens.map(product => {
                            if (product.lat && product.lon) {
                                const distance = getDistanceFromLatLonInKm(userLat, userLon, product.lat, product.lon);
                                return { ...product, distance: `${distance.toFixed(1)} km away` };
                            }
                            return { ...product, distance: 'Distance N/A' };
                        }),
                        mens: allProducts.mens.map(product => {
                            if (product.lat && product.lon) {
                                const distance = getDistanceFromLatLonInKm(userLat, userLon, product.lat, product.lon);
                                return { ...product, distance: `${distance.toFixed(1)} km away` };
                            }
                            return { ...product, distance: 'Distance N/A' };
                        }),
                        kids: allProducts.kids.map(product => {
                            if (product.lat && product.lon) {
                                const distance = getDistanceFromLatLonInKm(userLat, userLon, product.lat, product.lon);
                                return { ...product, distance: `${distance.toFixed(1)} km away` };
                            }
                            return { ...product, distance: 'Distance N/A' };
                        })
                    };
                    setAllProducts(updatedProducts);
                    setFilteredProducts(updatedProducts);
                },
                (error) => {
                    console.warn(`Geolocation error: ${error.message}.`);
                    const updatedProducts = {
                        womens: allProducts.womens.map(p => ({...p, distance: 'Within 5km'})),
                        mens: allProducts.mens.map(p => ({...p, distance: 'Within 5km'})),
                        kids: allProducts.kids.map(p => ({...p, distance: 'Within 5km'}))
                    };
                    setAllProducts(updatedProducts);
                    setFilteredProducts(updatedProducts);
                }
            );
        } else if (allProducts.womens.length > 0) {
            console.warn("Geolocation is not supported by this browser.");
            const updatedProducts = {
                womens: allProducts.womens.map(p => ({...p, distance: 'Within 5km'})),
                mens: allProducts.mens.map(p => ({...p, distance: 'Within 5km'})),
                kids: allProducts.kids.map(p => ({...p, distance: 'Within 5km'}))
            };
            setAllProducts(updatedProducts);
            setFilteredProducts(updatedProducts);
        }
    }, [allProducts.womens.length, allProducts.mens.length, allProducts.kids.length, getDistanceFromLatLonInKm]);

    useEffect(() => {
        if (searchQuery) {
            const filterProducts = (products) => products.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.vendor.toLowerCase().includes(searchQuery) ||
                product.category.toLowerCase().includes(searchQuery)
            );
            setFilteredProducts({
                womens: filterProducts(allProducts.womens),
                mens: filterProducts(allProducts.mens),
                kids: filterProducts(allProducts.kids)
            });
        } else {
            setFilteredProducts(allProducts);
        }
    }, [searchQuery, allProducts]);

    const isProductInWishlist = (productId) => wishlistItems.some(item => (item._id || item.id) === productId);

    const renderProductGrid = (products) => (
        <div className="product-grid">
            {products.map(product => (
                <WatchCard key={product._id || product.id} product={product} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} onViewProduct={onViewProduct} isWishlisted={isProductInWishlist(product._id || product.id)} cartItems={cartItems} navigateTo={navigateTo} />
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading watches products...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <>
            <section className="hero" id="hero">
                <div className="hero-carousel">
                    <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {slideImages.map((img, index) => (
                            <div className="carousel-slide" key={index}>
                                <img src={img} alt={`Watches slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section id="womens-watches" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Women's Watches</h2>
                    </div>
                    {renderProductGrid(filteredProducts.womens)}
                </div>
            </section>

            <section id="mens-watches" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Men's Watches</h2>
                    </div>
                    {renderProductGrid(filteredProducts.mens)}
                </div>
            </section>

            <section id="kids-watches" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Kids' Watches</h2>
                    </div>
                    {renderProductGrid(filteredProducts.kids)}
                </div>
            </section>
        </>
    );
};

export default Watches;


