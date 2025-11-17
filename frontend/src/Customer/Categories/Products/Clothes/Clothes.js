import React, { useState, useEffect, useCallback } from 'react';
import ClothesCard from './ClothesCard';
import './Clothes.css';

const Clothes = ({ wishlistItems, onAddToCart, onToggleWishlist, onViewProduct, navigateTo, searchQuery, cartItems }) => {
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
        "../IMAGES/cloths-hero-1.webp",
        "../IMAGES/cloths-hero-2.webp",
        "../IMAGES/cloths-hero-3.webp"

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
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }, []);

    const addDistanceToProducts = useCallback((products, userLat, userLon) => {
        return products.map(product => {
            if (product.lat && product.lon) {
                const distance = getDistanceFromLatLonInKm(userLat, userLon, product.lat, product.lon);
                return { ...product, distance: `${distance.toFixed(1)} km away` };
            }
            return { ...product, distance: 'Distance N/A' };
        });
    }, [getDistanceFromLatLonInKm]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/products/category/Clothes');
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();

                // Debug: Log all products to see what's being fetched
                console.log('Fetched products for Clothes:', data.map(p => ({ name: p.name, subcategory: p.subcategory, category: p.category })));

                // Categorize products based on name patterns or check for subcategory field
                const categorizeProducts = (products) => {
                    const kids = products.filter(p =>
                        p.subcategory?.toLowerCase() === 'kids' ||
                        p.subcategory?.toLowerCase() === 'kid' ||
                        p.subcategory?.toLowerCase() === 'children' ||
                        p.name.toLowerCase().includes('kids') ||
                        p.name.toLowerCase().includes('kid') ||
                        p.name.toLowerCase().includes('children')
                    );

                    const womens = products.filter(p =>
                        !kids.includes(p) && (
                        p.subcategory?.toLowerCase() === 'women' ||
                        p.subcategory?.toLowerCase() === 'womens' ||
                        p.subcategory?.toLowerCase() === 'woman' ||
                        p.name.toLowerCase().includes('saree') ||
                        p.name.toLowerCase().includes('kurti') ||
                        p.name.toLowerCase().includes('lehenga') ||
                        p.name.toLowerCase().includes('anarkali') ||
                        p.name.toLowerCase().includes('dress') ||
                        p.name.toLowerCase().includes('gown') ||
                        p.name.toLowerCase().includes('blouse') ||
                        p.name.toLowerCase().includes('scarf') ||
                        p.name.toLowerCase().includes('leggings') ||
                        p.name.toLowerCase().includes('top'))
                    );

                    const mens = products.filter(p =>
                        !kids.includes(p) && !womens.includes(p) && (
                        p.subcategory?.toLowerCase() === 'men' ||
                        p.subcategory?.toLowerCase() === 'mens' ||
                        p.subcategory?.toLowerCase() === 'man' ||
                        p.name.toLowerCase().includes('shirt') ||
                        p.name.toLowerCase().includes('jacket') ||
                        p.name.toLowerCase().includes('coat') ||
                        p.name.toLowerCase().includes('suit') ||
                        p.name.toLowerCase().includes('pants') ||
                        p.name.toLowerCase().includes('jeans') ||
                        p.name.toLowerCase().includes('t-shirt') ||
                        p.name.toLowerCase().includes('sweater') ||
                        p.name.toLowerCase().includes('blazer'))
                    );

                    // Debug: Log categorization results
                    console.log('Categorization results:', {
                        total: products.length,
                        womens: womens.length,
                        mens: mens.length,
                        kids: kids.length,
                        uncategorized: products.length - (womens.length + mens.length + kids.length)
                    });

                    return { womens, mens, kids };
                };

                const categorized = categorizeProducts(data);

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const userLat = position.coords.latitude;
                            const userLon = position.coords.longitude;
                            const updatedProducts = {
                                womens: addDistanceToProducts(categorized.womens, userLat, userLon),
                                mens: addDistanceToProducts(categorized.mens, userLat, userLon),
                                kids: addDistanceToProducts(categorized.kids, userLat, userLon)
                            };
                            setAllProducts(updatedProducts);
                            setFilteredProducts(updatedProducts);
                        },
                        (error) => {
                            console.warn(`Geolocation error: ${error.message}.`);
                            const updatedProducts = {
                                womens: categorized.womens.map(p => ({...p, distance: 'Within 5km'})),
                                mens: categorized.mens.map(p => ({...p, distance: 'Within 5km'})),
                                kids: categorized.kids.map(p => ({...p, distance: 'Within 5km'}))
                            };
                            setAllProducts(updatedProducts);
                            setFilteredProducts(updatedProducts);
                        }
                    );
                } else {
                    console.warn("Geolocation is not supported by this browser.");
                    const updatedProducts = {
                        womens: categorized.womens.map(p => ({...p, distance: 'Within 5km'})),
                        mens: categorized.mens.map(p => ({...p, distance: 'Within 5km'})),
                        kids: categorized.kids.map(p => ({...p, distance: 'Within 5km'}))
                    };
                    setAllProducts(updatedProducts);
                    setFilteredProducts(updatedProducts);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [addDistanceToProducts]);

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

    const isProductInWishlist = (productId) => {
        return wishlistItems.some(item => (item._id || item.id) === productId);
    };

    const renderProductGrid = (products) => (
        <div className="product-grid">
            {products.map(product => (
                <ClothesCard
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
    );

    return (
        <>
            <section className="hero" id="hero">
                <div className="hero-carousel">
                    <div className="carousel-slides" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {slideImages.map((img, index) => (
                            <div className="carousel-slide" key={index}>
                                <img src={img} alt={`Clothes slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section id="womens-clothes" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Women's Clothes</h2>
                    </div>
                    {loading && <div className="loading">Loading products...</div>}
                    {error && <div className="error">Error: {error}</div>}
                    {!loading && !error && renderProductGrid(filteredProducts.womens)}
                </div>
            </section>

            <section id="mens-clothes" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Men's Clothes</h2>
                    </div>
                    {loading && <div className="loading">Loading products...</div>}
                    {error && <div className="error">Error: {error}</div>}
                    {!loading && !error && renderProductGrid(filteredProducts.mens)}
                </div>
            </section>

            <section id="kids-clothes" className="section">
                <div className="container">
                    <div className="section-title">
                        <h2>Kid's Clothes</h2>
                    </div>
                    {loading && <div className="loading">Loading products...</div>}
                    {error && <div className="error">Error: {error}</div>}
                    {!loading && !error && renderProductGrid(filteredProducts.kids)}
                </div>
            </section>
        </>
    );
};

export default Clothes;