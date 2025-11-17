import React, { useState, useEffect, useCallback } from 'react';
import ProductCard1 from './ProductCard1';
import './FoodAndDining.css';

const FoodAndDining = ({ wishlistItems, onAddToCart, onToggleWishlist, onViewProduct, cartItems, navigateTo, searchQuery, activePage }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    const slideImages = [
        "../IMAGES/a3e06c8f7b389ecacdbcd59f2b29fc17.jpg",
        "../IMAGES/pngtree-salad-with-vegetables-in-a-black-bowl-image_2962609.jpg",
        "../IMAGES/arabic-shawarma-with-fries-ketchup-raita-served-dish-isolated-grey-background-side-view-fastfood_689047-1158.jpg"
    ];

    // Calculate distance helper
    const getDistanceFromLatLonInKm = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const deg2rad = (deg) => deg * (Math.PI / 180);
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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
                const response = await fetch('http://localhost:5000/api/products/category/Food%20%26%20Dining');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                
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
                setError('Failed to load products. Please try again later.');
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
        console.log('Search Query:', searchQuery);
        console.log('Products Count:', products.length);
        
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
            
            return nameMatch || vendorMatch || categoryMatch;
        });
        
        console.log('Filtered Products Count:', filtered.length);
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    const isProductInWishlist = (productId) => {
        return wishlistItems.some(item => (item._id || item.id) === productId);
    };

    return (
        <>
            <section className="hero" id="hero">
                <div className="hero-carousel">
                    <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {slideImages.map((img, index) => (
                            <div className="carousel-slide" key={index}>
                                <img src={img} alt={`Food slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="section" id="restaurants">
                <div className="container">
                    <div className="section-title">
                        <h2>Food & Dining</h2>
                        {searchQuery && (
                            <p className="search-results-info">
                                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found for "{searchQuery}"
                            </p>
                        )}
                    </div>
                    {loading && (
                        <div className="loading-message">
                            <p>Loading delicious food options...</p>
                        </div>
                    )}
                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}
                    {!loading && !error && filteredProducts.length === 0 && searchQuery && (
                        <div className="no-results-message">
                            <p>No products found for "{searchQuery}". Try a different search term.</p>
                        </div>
                    )}
                    {!loading && !error && filteredProducts.length > 0 && (
                        <div className="product-grid">
                            {filteredProducts.map(product => (
                                <ProductCard1
                                    key={product._id || product.id}
                                    product={product}
                                    onAddToCart={onAddToCart}
                                    onToggleWishlist={onToggleWishlist}
                                    onViewProduct={onViewProduct}
                                    isWishlisted={isProductInWishlist(product._id || product.id)}
                                    cartItems={cartItems}
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

export default FoodAndDining;