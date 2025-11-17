import React, { useState, useEffect, useCallback } from 'react';
import MedicineCard from './MedicineCard';
import './Medicines.css';

const Medicines = ({ wishlistItems, onAddToCart, onToggleWishlist, onViewProduct, cartItems, navigateTo, searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const slideImages = [
        "/IMAGES/medicine-hero-1.jpg",
        "/IMAGES/medicine-hero-2.jpg",
        "/IMAGES/medicine-hero-3.jpg"
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/products/category/Medicines');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
                setProducts([]);
                setFilteredProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        const slideInterval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slideImages.length);
        }, 5000); // Change slide every 5 seconds
        return () => clearInterval(slideInterval);
    }, [slideImages.length]);

    // --- Geolocation and Distance Calculation ---
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

    useEffect(() => {
        if (products.length > 0 && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;

                    const productsWithDistance = products.map(product => {
                        if (product.lat && product.lon) {
                            const distance = getDistanceFromLatLonInKm(userLat, userLon, product.lat, product.lon);
                            return { ...product, distance: `${distance.toFixed(1)} km away` };
                        }
                        return { ...product, distance: 'Distance N/A' };
                    });
                    // We update the filtered products as well to reflect distance changes
                    setFilteredProducts(productsWithDistance);
                },
                (error) => {
                    console.warn(`Geolocation error: ${error.message}.`);
                    const productsWithDefaultDistance = products.map(p => ({...p, distance: 'Within 5km'}));
                    setFilteredProducts(productsWithDefaultDistance);
                }
            );
        } else if (products.length > 0) {
            console.warn("Geolocation is not supported by this browser.");
            const productsWithDefaultDistance = products.map(p => ({...p, distance: 'Within 5km'}));
            setFilteredProducts(productsWithDefaultDistance);
        }
    }, [products, getDistanceFromLatLonInKm]);

    useEffect(() => {
        let filtered = products;
        if (searchQuery && searchQuery.trim()) {
            filtered = products.filter(product =>
                product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.vendor && product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.type && product.type.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
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
                                <img src={img} alt={`Medicine slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section id="medicine" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Medicines</h2>
                    </div>
                    {loading && (
                        <div className="loading-message">
                            <p>Loading medicines...</p>
                        </div>
                    )}
                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}
                    {!loading && !error && (
                        <div className="product-grid">
                            {filteredProducts.map(product => (
                                <MedicineCard
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

export default Medicines;