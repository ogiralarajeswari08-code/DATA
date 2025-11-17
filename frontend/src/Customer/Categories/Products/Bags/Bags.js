import React, { useState, useEffect, useCallback } from 'react';
import BagCard from './BagCard';
import './Bags.css';

const Bags = ({ 
    wishlistItems = [], 
    onAddToCart, 
    onToggleWishlist, 
    navigateTo, 
    onViewProduct, 
    cartItems,
    searchQuery // ADD THIS PROP
}) => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);

    const slideImages = [
        "/IMAGES/bags-hero-1.jpg",
        "/IMAGES/bags-hero-2.png",
        "/IMAGES/bags-hero-3.jpg"
    ];

    // Calculate distance helper
    const getDistanceFromLatLonInKm = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const deg2rad = (deg) => deg * (Math.PI / 180);
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
                  Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }, []);

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:5000/api/products/category/${encodeURIComponent("Bags")}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                console.log('Fetched Bags products:', data);
                
                // Add distance to products
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
                        },
                        (error) => {
                            console.warn(`Geolocation error: ${error.message}`);
                            const productsWithDefaultDistance = data.map(p => ({...p, distance: 'Within 5km'}));
                            setProducts(productsWithDefaultDistance);
                        }
                    );
                } else {
                    console.warn("Geolocation is not supported by this browser.");
                    const productsWithDefaultDistance = data.map(p => ({...p, distance: 'Within 5km'}));
                    setProducts(productsWithDefaultDistance);
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(err.message);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [getDistanceFromLatLonInKm]);

    // Carousel auto-slide
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slideImages.length);
        }, 5000);
        return () => clearInterval(slideInterval);
    }, [slideImages.length]);

    // Handle search filtering
    useEffect(() => {
        console.log('Bags Search Query:', searchQuery);
        console.log('Bags Products Count:', products.length);
        
        if (!searchQuery || !searchQuery.trim()) {
            setFilteredProducts(products);
            console.log('No search query - showing all products');
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = products.filter(product => {
            const nameMatch = product.name?.toLowerCase().includes(query);
            const vendorMatch = product.vendor?.toLowerCase().includes(query);
            const categoryMatch = product.category?.toLowerCase().includes(query);
            const brandMatch = product.brand?.toLowerCase().includes(query);
            
            return nameMatch || vendorMatch || categoryMatch || brandMatch;
        });
        
        console.log('Filtered Bags Products Count:', filtered.length);
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    const handleAddToCart = (product) => {
        if (onAddToCart) {
            onAddToCart(product);
        }
    };

    const handleToggleWishlist = (product) => {
        if (onToggleWishlist) {
            onToggleWishlist(product);
        }
    };

    const isProductInWishlist = (productId) => {
        return wishlistItems.some(item => item._id === productId || item.id === productId);
    };

    return (
        <>
            <section className="hero" id="hero">
                <div className="slider-container">
                    <div className="bg-slider-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {slideImages.map((img, index) => (
                            <div
                                key={index}
                                className={`bg-slide ${index === currentSlide ? 'active' : ''}`}
                                style={{ backgroundImage: `url('${img}')` }}
                            ></div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="bags" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Bags</h2>
                        {searchQuery && (
                            <p className="search-results-info">
                                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found for "{searchQuery}"
                            </p>
                        )}
                    </div>
                    
                    {loading && <p>Loading products...</p>}
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                    
                    {!loading && !error && filteredProducts.length === 0 && searchQuery && (
                        <div className="no-results-message" style={{ textAlign: 'center', padding: '50px' }}>
                            <p>No bags found for "{searchQuery}". Try a different search term.</p>
                        </div>
                    )}
                    
                    {!loading && !error && filteredProducts.length > 0 && (
                        <div className="product-grid">
                            {filteredProducts.map(product => (
                                <BagCard
                                    key={product._id || product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    onToggleWishlist={handleToggleWishlist}
                                    isWishlisted={isProductInWishlist(product._id || product.id)}
                                    cartItems={cartItems}
                                    onViewProduct={onViewProduct}
                                    navigateTo={navigateTo}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default Bags