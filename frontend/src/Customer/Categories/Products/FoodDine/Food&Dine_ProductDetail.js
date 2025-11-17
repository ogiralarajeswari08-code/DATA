import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './ProductDetail2.css'; // Assuming this CSS file exists

// Mock data - In a real app, this would be fetched from an API
const allProducts = {
    // This mock data is used for related products.
    // In a real app, this would be fetched from an API or a global product list.
    601: { id: 601, name: "Pepperoni Pizza", price: 349, vendor: "PizzaPalace", category: "Food & Dining", image: "Pepperoni Pizza.jpg", diet: "Non-Veg", otherImages: ["Pepperoni Pizza1.jpg", "Pepperoni Pizza2.jpg", "Pepperoni Pizza1.jpg"], lat: 17.4486, lon: 78.3908 },
    602: { id: 602, name: "Veggie Burger", price: 179, vendor: "BurgerBonanza", category: "Food & Dining", image: "Veggie Burger.jpg", diet: "Veg", otherImages: ["Veggie Burger1.jpeg", "Veggie Burger2.jpg", "Veggie Burger3.jpg"], lat: 17.4512, lon: 78.3855 },
    603: { id: 603, name: "Spaghetti Carbonara", price: 279, vendor: "PastaPlace", category: "Food & Dining", image: "Spaghetti Carbonara.jpg", diet: "Non-Veg", otherImages: ["Spaghetti Carbonara1.jpg", "Spaghetti Carbonara2.jpg", "Spaghetti Carbonara3.jpg"], lat: 17.4421, lon: 78.3882 },
    604: { id: 604, name: "Butter Chicken", price: 399, vendor: "CurryCorner", category: "Food & Dining", image: "Butter Chicken.jpg", diet: "Non-Veg", otherImages: ["Butter Chicken1.jpg", "Butter Chicken2.jpg", "Butter Chicken3.webp"], lat: 17.4550, lon: 78.3920 },
    605: { id: 605, name: "California Roll", price: 649, vendor: "SushiSpot", category: "Food & Dining", image: "California Roll.webp", diet: "Non-Veg", otherImages: ["California Roll1.jpg", "California Roll2.webp", "California Roll3.jpg"], lat: 17.4399, lon: 78.4421 },
    606: { id: 606, name: "Club Sandwich", price: 159, vendor: "SnackShack", category: "Food & Dining", image: "Club Sandwich.jpg", diet: "Non-Veg", otherImages: ["Club Sandwich1.jpg", "Club Sandwich2.jpg", "Club Sandwich3.jpg"], lat: 17.4455, lon: 78.3800 },
    607: { id: 607, name: "Greek Salad", price: 199, vendor: "SaladStop", category: "Food & Dining", image: "Greek Salad.jpg", diet: "Veg", otherImages: ["Greek Salad1.jpg", "Greek Salad2.jpg", "Greek Salad3.jpg"], lat: 17.4480, lon: 78.3890 },
    608: { id: 608, name: "BBQ Ribs", price: 449, vendor: "GrillGuru", image: "BBQ Ribs.jpeg", diet: "Non-Veg", otherImages: ["BBQ Ribs1.jpeg", "BBQ Ribs.jpeg", "BBQ Ribs1.jpeg"], lat: 17.4520, lon: 78.3870 },
    609: { id: 609, name: "Tiramisu", price: 249, vendor: "DessertDen", category: "Food & Dining", image: "Tiramisu.jpeg", diet: "Veg", otherImages: ["Tiramisu1.jpeg", "Tiramisu.jpeg", "Tiramisu1.jpeg"], lat: 17.4400, lon: 78.3850 },
    610: { id: 610, name: "South Indian Thali", price: 229, vendor: "TasteOfSouth", category: "Food & Dining", image: "South Indian Thali.jpeg", diet: "Veg", otherImages: ["South Indian Thali.jpeg", "South Indian Thali2.jpeg", "South Indian Thali3.jpeg"], lat: 17.4490, lon: 78.3950 },
    611: { id: 611, name: "Mutton Rogan Josh", price: 429, vendor: "CurryCorner", category: "Food & Dining", image: "Mutton Rogan Josh.jpeg", diet: "Non-Veg", otherImages: ["Mutton Rogan Josh2.jpeg", "Mutton Rogan Josh.jpeg", "Mutton Rogan Josh2.jpeg"], lat: 17.4550, lon: 78.3920 },
    612: { id: 612, name: "Veg Fried Rice", price: 169, vendor: "WokToss", category: "Food & Dining", image: "Veg Fried Rice.jpeg", diet: "Veg", otherImages: ["Veg Fried Rice2.jpeg", "Veg Fried Rice.jpeg", "Veg Fried Rice2.jpeg"], lat: 17.4430, lon: 78.3860 },
    613: { id: 613, name: "Steamed Bao Buns", price: 149, vendor: "AsianBites", category: "Food & Dining", image: "Steamed Bao Buns.jpg", diet: "Veg", otherImages: ["Steamed Bao Buns1.jpg", "Steamed Bao Buns2.jpg", "Steamed Bao Buns3.jpg"], lat: 17.4500, lon: 78.3840 },
    614: { id: 614, name: "Shawarma Wrap", price: 219, vendor: "MediterraneanMunch", image: "Shawarma Wrap.jpeg", diet: "Non-Veg", otherImages: ["Shawarma Wrap2.jpeg", "Shawarma Wrap.jpeg", "Shawarma Wrap2.jpeg"], lat: 17.4470, lon: 78.3910 },
    615: { id: 615, name: "Chocolate Lava Cake", price: 199, vendor: "DessertDen", category: "Food & Dining", image: "Chocolate Lava Cake.jpeg", diet: "Veg", otherImages: ["Chocolate Lava Cake2.jpeg", "Chocolate Lava Cake.jpeg", "Chocolate Lava Cake2.jpeg"], lat: 17.4400, lon: 78.3850 }
};

const ProductDetail = ({ product, onAddToCart, onToggleWishlist, cartItems, wishlistItems, navigateTo, onViewProduct }) => {
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

    // The product prop is already passed from App.js, so no need for useParams or fetching by ID here.

    const [mainImage, setMainImage] = useState('');
    const [productWithDistance, setProductWithDistance] = useState(product);
    const [relatedProductsWithDistance, setRelatedProductsWithDistance] = useState([]);

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
        if (product) {
            const imageSrc = getImageSrc(product.image);
            console.log('Setting main image for product:', product.name, 'Image path:', product.image, 'Resolved path:', imageSrc);
            setMainImage(imageSrc);
        }
        window.scrollTo(0, 0);
    }, [product]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;

                    // Calculate distance for main product
                    if (product && product.lat && product.lon) {
                        const distance = getDistanceFromLatLonInKm(userLat, userLon, product.lat, product.lon);
                        setProductWithDistance({ ...product, distance: `${distance.toFixed(1)} km away` });
                    } else {
                        setProductWithDistance({ ...product, distance: 'Distance N/A' });
                    }

                    // Calculate distance for related products
                    const related = Object.values(allProducts)
                        .filter(p => p.id !== product.id)
                        .sort(() => 0.5 - Math.random()) // Shuffle
                        .slice(0, 4); // Take 4
                    const relatedWithDistance = related.map(p => {
                        if (p.lat && p.lon) {
                            const distance = getDistanceFromLatLonInKm(userLat, userLon, p.lat, p.lon);
                            return { ...p, distance: `${distance.toFixed(1)} km away` };
                        }
                        return { ...p, distance: 'Distance N/A' };
                    });
                    setRelatedProductsWithDistance(relatedWithDistance);
                },
                (error) => {
                    console.warn(`Geolocation error: ${error.message}.`);
                    setProductWithDistance({ ...product, distance: 'Within 5km' });
                    const related = Object.values(allProducts)
                        .filter(p => p.id !== product.id)
                        .sort(() => 0.5 - Math.random()) // Shuffle
                        .slice(0, 4); // Take 4
                    const relatedWithDistance = related.map(p => ({ ...p, distance: 'Within 5km' }));
                    setRelatedProductsWithDistance(relatedWithDistance);
                }
            );
        } else {
            console.warn("Geolocation is not supported by this browser.");
            setProductWithDistance({ ...product, distance: 'Distance N/A' });
            const related = Object.values(allProducts)
                .filter(p => p.id !== product.id)
                .sort(() => 0.5 - Math.random()) // Shuffle
                .slice(0, 4); // Take 4
            const relatedWithDistance = related.map(p => ({ ...p, distance: 'Distance N/A' }));
            setRelatedProductsWithDistance(relatedWithDistance);
        }
    }, [product, getDistanceFromLatLonInKm]);

    const isInCart = useMemo(() => cartItems.some(item => item._id === product?._id || item.id === product?.id), [cartItems, product]);
    const isInWishlist = useMemo(() => wishlistItems.some(item => (item._id || item.id) === (product._id || product.id)), [wishlistItems, product]);

    const thumbnailImages = useMemo(() => {
        if (!product) return [];
        const images = [getImageSrc(product.image)];
        if (product.otherImages && product.otherImages.length > 0) {
            return images.concat(product.otherImages.map(img => getImageSrc(img)));
        }
        return images;
    }, [product]);

    if (!product) {
        return (
            <div className="container">
                <h1>Product not found</h1>
                <a href="#food" onClick={(e) => { e.preventDefault(); navigateTo('food'); }} className="back-link">&larr; Back to Food & Dining</a>
            </div>
        );
    }

    return (
        <div className="container">
            <a href="#food" onClick={(e) => { e.preventDefault(); navigateTo('food'); }} className="back-link">&larr; Back to Food & Dining</a>
            
            <div className="product-detail-container">
                <div className="product-images">
                    <div className="main-image">
                        <img id="main-product-image" src={mainImage} alt={product.name} onError={(e) => console.log('Image failed to load:', mainImage)} />
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
                    <div className="product-price-details">
                        {/* Discount logic would be implemented here */}
                        ₹{product.price}
                    </div>
                    <div className="product-description">
                        <h3>Description</h3>
                        <p>Delicious and freshly prepared. Made with high-quality ingredients to satisfy your cravings.</p>
                    </div>
                    <div className="diet-info">
                        <strong>Dietary Type:</strong>
                        <span 
                            className={`diet-indicator ${product.diet === 'Veg' ? 'diet-veg' : 'diet-non-veg'}`}
                            title={product.diet}
                        ></span>
                    </div>
                    <div className="product-distance">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{productWithDistance.distance || 'Calculating...'}</span>
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
                    {relatedProductsWithDistance.map(related => ( // Assuming related products should also navigate to their detail page
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
                                    ₹{related.price}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;