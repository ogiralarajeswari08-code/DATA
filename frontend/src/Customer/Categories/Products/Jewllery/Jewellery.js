import React, { useState, useEffect, useCallback } from 'react';
import JewelleryCard from './JewelleryCard';
import './Jewellery.css';

const Jewellery = ({ wishlistItems, onAddToCart, onToggleWishlist, onViewProduct, cartItems, navigateTo, searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    const slideImages = [
        "IMAGES/jwellery-hero-2.jpg",
        "IMAGES/jwellery-hero-2.jpg",
        "IMAGES/jwellery-hero-3.jpg"
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
                const response = await fetch('http://localhost:5000/api/products/category/Jewellery');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                console.log('Fetched Jewellery products:', data);
                
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
        console.log('Jewellery Search Query:', searchQuery);
        console.log('Jewellery Products Count:', products.length);
        
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
            const subcategoryMatch = product.subcategory?.toLowerCase().includes(query);
            const brandMatch = product.brand?.toLowerCase().includes(query);
            
            return nameMatch || vendorMatch || categoryMatch || subcategoryMatch || brandMatch;
        });
        
        console.log('Filtered Jewellery Products Count:', filtered.length);
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    const isProductInWishlist = (productId) => {
        return wishlistItems.some(item => (item._id || item.id) === productId);
    };

    // Separate products by subcategory for rendering in sections
    const womensJewellery = filteredProducts.filter(p => p.subcategory === "Women's Jewellery");
    const mensJewellery = filteredProducts.filter(p => p.subcategory === "Men's Jewellery");
    const kidsJewellery = filteredProducts.filter(p => p.subcategory === "Kids' Jewellery");

    return (
        <>
            <section className="hero" id="hero">
                <div className="hero-carousel">
                    <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {slideImages.map((img, index) => (
                            <div className="carousel-slide" key={index}>
                                <img src={img} alt={`Jewellery slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section id="jewellery" className="section">
                <div className="container">
                    {searchQuery && (
                        <div className="search-results-info" style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <p>
                                {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found for "{searchQuery}"
                            </p>
                        </div>
                    )}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <p>Loading jewellery products...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
                            <p>Error loading products: {error}</p>
                        </div>
                    ) : filteredProducts.length === 0 && searchQuery ? (
                        <div className="no-results-message" style={{ textAlign: 'center', padding: '50px' }}>
                            <p>No products found for "{searchQuery}". Try a different search term.</p>
                        </div>
                    ) : (
                        <>
                            <section id="womens-jewellery" className="section">
                                <div className="container">
                                    <div className="section-title"><h2>Women's Jewellery</h2></div>
                                    {womensJewellery.length > 0 ? (
                                        <div className="product-grid">
                                            {womensJewellery.map(product => (
                                                <JewelleryCard 
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
                                    ) : !searchQuery && <p>No women's jewellery found.</p>}
                                </div>
                            </section>

                            <section id="mens-jewellery" className="section">
                                <div className="container">
                                    <div className="section-title"><h2>Men's Jewellery</h2></div>
                                     {mensJewellery.length > 0 ? (
                                        <div className="product-grid">
                                            {mensJewellery.map(product => (
                                                <JewelleryCard 
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
                                    ) : !searchQuery && <p>No men's jewellery found.</p>}
                                </div>
                            </section>

                            <section id="kids-jewellery" className="section">
                                <div className="container">
                                    <div className="section-title"><h2>Kids' Jewellery</h2></div>
                                     {kidsJewellery.length > 0 ? (
                                        <div className="product-grid">
                                            {kidsJewellery.map(product => (
                                                <JewelleryCard 
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
                                    ) : !searchQuery && <p>No kids' jewellery found.</p>}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </section>
        </>
    );
};

export default Jewellery;