import React, { useState, useEffect, useCallback } from 'react';
import KitchenProductCard from './KitchenProductCard';
import './KitchenProducts.css';

const KitchenProducts = ({ wishlistItems, onAddToCart, onToggleWishlist, onViewProduct, cartItems, navigateTo, searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Geolocation and Distance Calculation ---
    const getDistanceFromLatLonInKm = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const deg2rad = (deg) => deg * (Math.PI / 180);
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/products/category/${encodeURIComponent("Kitchen Products")}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const userLat = position.coords.latitude;
                            const userLon = position.coords.longitude;

                            const productsWithDistance = data.map(product => {
                                if (product.lat && product.lon) {
                                    const distance = getDistanceFromLatLonInKm(userLat, userLon, product.lat, product.lon);
                                    return { ...product, distance: `${distance.toFixed(1)} km away` };
                                }
                                return { ...product, distance: 'Distance N/A' };
                            });
                            setProducts(productsWithDistance);
                            setFilteredProducts(productsWithDistance);
                        },
                        (error) => {
                            console.warn(`Geolocation error: ${error.message}.`);
                            const productsWithDefaultDistance = data.map(p => ({...p, distance: 'Within 5km'}));
                            setProducts(productsWithDefaultDistance);
                            setFilteredProducts(productsWithDefaultDistance);
                        }
                    );
                } else {
                    console.warn("Geolocation is not supported by this browser.");
                    const productsWithDefaultDistance = data.map(p => ({...p, distance: 'Within 5km'}));
                    setProducts(productsWithDefaultDistance);
                    setFilteredProducts(productsWithDefaultDistance);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [getDistanceFromLatLonInKm]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const isProductInWishlist = (productId) => {
        return wishlistItems.some(item => item._id === productId);
    };

    // --- Hero Slider Logic ---
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideImages = [
        "/IMAGES/kithchen-hero-3.webp",
        "/IMAGES/kitchen-hero-2.webp",
        "/IMAGES/kitchen-hero-1.webp"
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slideImages.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, [slideImages.length]);

    return (
        <>
            {/* <Header cartCount={cart.length} wishlistCount={wishlist.length} /> */}
            {/* <Nav /> */}

            <section className="hero" id="hero">
                <div className="slider-container">
                    <div className="bg-slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {slideImages.map((img, index) => (
                            <div key={index} className={`bg-slide ${index === currentSlide ? 'active' : ''}`} style={{ backgroundImage: `url('${img}')` }}></div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="Kitchen" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Kitchen Products</h2>
                    </div>
                    {loading ? (
                        <div className="loading">Loading products...</div>
                    ) : error ? (
                        <div className="error">Error loading products: {error}</div>
                    ) : (
                        <div className="product-grid">
                            {filteredProducts.map(product => (
                                <KitchenProductCard
                                    key={product._id}
                                    product={product}
                                    onAddToCart={onAddToCart}
                                    onToggleWishlist={onToggleWishlist}
                                    isWishlisted={isProductInWishlist(product._id)}
                                    cartItems={cartItems}
                                    onViewProduct={onViewProduct}
                                    navigateTo={navigateTo}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* <Footer /> */}
        </>
    );
};

export default KitchenProducts;