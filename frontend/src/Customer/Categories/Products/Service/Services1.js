import React, { useState, useEffect, useCallback } from 'react';
import ServiceCard from './ServiceCard';
import './Services1.css'; // Link to the new CSS file
import { allServicesProducts } from './ServiceProductDetail'; // Import the consolidated data

// Mock data for all services, this will be the single source of truth.
const Services1 = ({ wishlistItems, onAddToCart, onToggleWishlist, onViewProduct, cartItems, navigateTo, searchQuery }) => {
    const [products, setProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const slideImages = [
        "/IMAGES/services-hero-1.jpg",
        "/IMAGES/services-hero-2.jpg",
        "/IMAGES/services-hero-3.jpg"
    ];

    useEffect(() => {
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

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/products/category/Services');
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                    setFilteredProducts(data);
                } else {
                    console.error('Failed to fetch services');
                    // Fallback to static data if API fails
                    setProducts(allServicesProducts);
                    setFilteredProducts(allServicesProducts);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                // Fallback to static data if API fails
                setProducts(allServicesProducts);
                setFilteredProducts(allServicesProducts);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Calculate distances after products are loaded
    useEffect(() => {
        if (products.length === 0) return;

        if (navigator.geolocation) {
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
                    setProducts(productsWithDistance);
                    setFilteredProducts(productsWithDistance);
                },
                (error) => {
                    console.warn(`Geolocation error: ${error.message}.`);
                    const productsWithDefaultDistance = products.map(p => ({...p, distance: 'Within 5km'}));
                    setProducts(productsWithDefaultDistance);
                    setFilteredProducts(productsWithDefaultDistance);
                }
            );
        } else {
            console.warn("Geolocation is not supported by this browser.");
            const productsWithDefaultDistance = products.map(p => ({...p, distance: 'Within 5km'}));
            setProducts(productsWithDefaultDistance);
            setFilteredProducts(productsWithDefaultDistance);
        }
    }, [products.length, getDistanceFromLatLonInKm]);

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchQuery) ||
                product.vendor.toLowerCase().includes(searchQuery) ||
                product.category.toLowerCase().includes(searchQuery)
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
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
                                <img src={img} alt={`Services slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section id="services-page" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Services</h2>
                    </div>
                    <div className="product-grid">
                        {filteredProducts.map(product => (
                            <ServiceCard
                                key={product._id || product.id}
                                service={product}
                                onAddToCart={onAddToCart}
                                onToggleWishlist={onToggleWishlist}
                                onViewProduct={onViewProduct}
                                isWishlisted={isProductInWishlist(product._id || product.id)}
                                cartItems={cartItems}
                                navigateTo={navigateTo}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default Services1;