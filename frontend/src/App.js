import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// Customer-facing components
import CategoryList from './Customer/Categories/ShopByCategory/CategoryList';
import PopularProductList from './Customer/Popularproducts/ProductList';
import Services from './Customer/Services/Services';
import BusinessList from './Customer/Bussiness/BusinessList';
import WishlistPage from './Customer/Header/WishlistPage';
import CartPage from './Customer/Header/CartPage';
import LoginPage from './Auth/LoginPage';
import ResetPassword from './Auth/ResetPassword';
import Header from './Customer/Header/Header';
import Navbar from './Customer/Navbar/Navbar';
import HeroSlider from './Customer/Header/HeroSlider';

import Footer from './Customer/Footer/Footer';
// Category pages
import FoodAndDining from './Customer/Categories/Products/FoodDine/FoodAndDining';
import Medicines from './Customer/Categories/Products/Medicine/Medicines';
import Services1 from './Customer/Categories/Products/Service/Services1';
import Jewellery from './Customer/Categories/Products/Jewllery/Jewellery';
import Clothes from './Customer/Categories/Products/Clothes/Clothes';
import Beauty from './Customer/Categories/Products/Beauty/Beauty';
import Grocery from './Customer/Categories/Products/Groceries/Grocery';
import Fruits from './Customer/Categories/Products/Fruits/Fruits';
import Books from './Customer/Categories/Products/Books/Books';
import Petfood from './Customer/Categories/Products/Petfood/Petfood';
import Musical from './Customer/Categories/Products/Musical/Musical';
import Footwear from './Customer/Categories/Products/Footwear/Footwear';
import HomeFurniture from './Customer/Categories/Products/Furniture/HomeFurniture';
import HomeDecor from './Customer/Categories/Products/Decor/HomeDecor';
import Bags from './Customer/Categories/Products/Bags/Bags';
import KitchenProducts from './Customer/Categories/Products/KitchenProducts/KitchenProducts';
import Organic from './Customer/Categories/Products/Organic/Organic';
import Automotive from './Customer/Categories/Products/Automotive/Automotive';
import SportsAndFitness from './Customer/Categories/Products/SportsFitness/SportsAndFitness';
import Watches from './Customer/Categories/Products/Watches/Watches';

// Product detail pages
import FoodDineProductDetail from './Customer/Categories/Products/FoodDine/Food&Dine_ProductDetail';
import MedicineProductDetail from './Customer/Categories/Products/Medicine/MedicineProductDetail';
import ServiceProductDetail from './Customer/Categories/Products/Service/ServiceProductDetail';
import AutomotiveProductDetail from './Customer/Categories/Products/Automotive/AutomotiveProductDetail';
import JewelleryProductDetail from './Customer/Categories/Products/Jewllery/JewelleryProductDetail';
import ClothesProductDetail from './Customer/Categories/Products/Clothes/ClothesProductDetail';
import BeautyProductDetail from './Customer/Categories/Products/Beauty/BeautyProductDetail';
import FootwearProductDetail from './Customer/Categories/Products/Footwear/FootwearProductDetail';
import GroceryProductDetail from './Customer/Categories/Products/Groceries/GroceryProductDetail';
import FruitProductDetail from './Customer/Categories/Products/Fruits/FruitProductDetail';
import BookProductDetail from './Customer/Categories/Products/Books/BookProductDetail';
import PetfoodProductDetail from './Customer/Categories/Products/Petfood/PetfoodProductDetail';
import MusicalProductDetail from './Customer/Categories/Products/Musical/MusicalProductDetail';
import HomeFurnitureProductDetail from './Customer/Categories/Products/Furniture/HomeFurnitureProductDetail';
import BagProductDetail from './Customer/Categories/Products/Bags/BagProductDetail';
import KitchenProductDetail from './Customer/Categories/Products/KitchenProducts/KitchenProductDetail';
import OrganicProductDetail from './Customer/Categories/Products/Organic/OrganicProductDetail';
import SportsAndFitnessProductDetail from './Customer/Categories/Products/SportsFitness/SportsAndFitnessProductDetail';
import WatchesProductDetail from './Customer/Categories/Products/Watches/WatchesProductDetail';
import HomeDecorProductDetail from './Customer/Categories/Products/Decor/HomeDecorProductDetail';

// Admin components
import AdminDashboard from './Admin/AdminDashboard';
import AdminOffersManagement from './Admin/Admin-offers';
import AdminPaymentManagement from './Admin/Admin-payment-management';
import AdminProductManagement from './Admin/Admin-product-management';
import AdminProfileManagement from './Admin/Admin-profile-management';
import AdminUserManagement from './Admin/Admin-user-management';

// Seller component
import SellerDashboard from './Seller/SellerDashboard';

// Product arrays
import { allClothesProducts } from './Customer/Categories/Products/Clothes/ClothesProductDetail';
import { allBookProducts } from './Customer/Categories/Products/Books/BookProductDetail';
import { allBagProducts } from './Customer/Categories/Products/Bags/BagProductDetail';
import { allKitchenProducts } from './Customer/Categories/Products/KitchenProducts/KitchenProductDetail';
import { allMusicalProducts } from './Customer/Categories/Products/Musical/MusicalProductDetail';
import { allPetfoodProducts } from './Customer/Categories/Products/Petfood/PetfoodProductDetail';
import { allWatchesProducts } from './Customer/Categories/Products/Watches/WatchesProductDetail';
import { allFootwearProducts } from './Customer/Categories/Products/Footwear/FootwearProductDetail';
import { allHomeFurnitureProducts } from './Customer/Categories/Products/Furniture/HomeFurnitureProductDetail';

// Combine all products
const initialProducts = [
  ...allClothesProducts,
  ...allBookProducts,
  ...allBagProducts,
  ...allKitchenProducts,
  ...allMusicalProducts,
  ...allPetfoodProducts,
  ...allWatchesProducts,
  ...allFootwearProducts,
  ...allHomeFurnitureProducts
];

const popularProducts = initialProducts.slice(0, 8);

const API_URL = 'http://localhost:5000';

function App() {
  // State management
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [activePage, setActivePage] = useState('home');
  const [viewingProduct, setViewingProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState({ 
    isAuthenticated: false, 
    role: null, 
    details: null 
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [allSellers, setAllSellers] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);

  const categorySectionRef = useRef(null);

  // Helper function to save cart to server
  const saveCartToServer = async (cart, userEmail, userRole) => {
    try {
      await fetch(`${API_URL}/api/cart/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, role: userRole, cart })
      });
    } catch (error) {
      console.error('Error saving cart to server:', error);
    }
  };

  // Helper function to save wishlist to server
  const saveWishlistToServer = async (wishlist, userEmail, userRole) => {
    try {
      await fetch(`${API_URL}/api/wishlist/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, role: userRole, wishlist })
      });
    } catch (error) {
      console.error('Error saving wishlist to server:', error);
    }
  };

  // Helper function to fetch cart from server
  const fetchCartFromServer = async (userEmail, userRole) => {
    try {
      const response = await fetch(`${API_URL}/api/cart/${userEmail}/${userRole}`);
      const data = await response.json();
      return data.cart || [];
    } catch (error) {
      console.error('Error fetching cart from server:', error);
      return [];
    }
  };

  // Helper function to fetch wishlist from server
  const fetchWishlistFromServer = async (userEmail, userRole) => {
    try {
      const response = await fetch(`${API_URL}/api/wishlist/${userEmail}/${userRole}`);
      const data = await response.json();
      return data.wishlist || [];
    } catch (error) {
      console.error('Error fetching wishlist from server:', error);
      return [];
    }
  };

  // CHECK URL FOR RESET PASSWORD
  useEffect(() => {
    const search = window.location.search;
    if (search.includes('token=')) {
      setActivePage('reset-password');
    }
  }, []);

  // CLEAR USER SESSION ON PAGE LOAD/REFRESH - Always start at home
  useEffect(() => {
    // Clear user session when page loads or refreshes
    localStorage.removeItem('currentUser');
    setCurrentUser({ isAuthenticated: false, role: null, details: null });
    setCartItems([]);
    setWishlistItems([]);
    setActivePage('home');
  }, []);

  // Authentication handlers
  const handleLoginSuccess = async (role, userDetails) => {
    const userData = { isAuthenticated: true, role: role, details: userDetails };
    
    // Update state
    setCurrentUser(userData);
    
    // Save user to localStorage (but will be cleared on refresh)
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    // Fetch cart and wishlist from SERVER
    const userEmail = userDetails.email;
    const userRole = role;
    
    const serverCart = await fetchCartFromServer(userEmail, userRole);
    const serverWishlist = await fetchWishlistFromServer(userEmail, userRole);
    
    setCartItems(serverCart);
    setWishlistItems(serverWishlist);
    
    const lowerCaseRole = role.toLowerCase();
    if (lowerCaseRole === 'customer') {
      navigateTo('home');
    } else if (lowerCaseRole === 'seller') {
      navigateTo('seller-dashboard');
    } else if (lowerCaseRole === 'admin') {
      navigateTo('admin-dashboard');
    }
  };

  // LOGOUT FUNCTION - SAVES TO SERVER BEFORE CLEARING
  const handleLogout = async () => {
    // SAVE current user's cart and wishlist to SERVER before logout
    if (currentUser.isAuthenticated && currentUser.details) {
      const userEmail = currentUser.details.email;
      const userRole = currentUser.role;
      await saveCartToServer(cartItems, userEmail, userRole);
      await saveWishlistToServer(wishlistItems, userEmail, userRole);
    }
    
    // Clear user state
    setCurrentUser({ isAuthenticated: false, role: null, details: null });
    
    // Clear displayed cart and wishlist (for privacy)
    setCartItems([]);
    setWishlistItems([]);
    
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    
    navigateTo('home');
  };

  const handleSellerRegister = (newSeller) => {
    setAllSellers(prevSellers => [...prevSellers, newSeller]);
  };

  const handleAdminRegister = (newAdmin) => {
    setAllAdmins(prevAdmins => [...prevAdmins, newAdmin]);
    console.log('Admin registered:', newAdmin);
  };

  // Cart handlers - Save to SERVER
  const handleAddToCart = async (productToAdd) => {
    const productKey = productToAdd._id || productToAdd.id;
    const itemInCart = cartItems.find(item => (item._id || item.id) === productKey);
    
    let updatedCart;
    if (itemInCart) {
      updatedCart = cartItems.map(item =>
        (item._id || item.id) === productKey ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cartItems, { ...productToAdd, quantity: 1 }];
    }
    
    setCartItems(updatedCart);
    
    // Save to SERVER
    if (currentUser.isAuthenticated && currentUser.details) {
      await saveCartToServer(updatedCart, currentUser.details.email, currentUser.role);
    }
    
    alert(`${productToAdd.name} has been added to your cart!`);
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      const updatedCart = cartItems.map(item => 
        ((item._id || item.id) === productId ? { ...item, quantity: newQuantity } : item)
      );
      setCartItems(updatedCart);
      
      // Save to SERVER
      if (currentUser.isAuthenticated && currentUser.details) {
        await saveCartToServer(updatedCart, currentUser.details.email, currentUser.role);
      }
    }
  };

  const handleRemoveFromCart = async (productId) => {
    const updatedCart = cartItems.filter(item => (item._id || item.id) !== productId);
    setCartItems(updatedCart);
    
    // Save to SERVER
    if (currentUser.isAuthenticated && currentUser.details) {
      await saveCartToServer(updatedCart, currentUser.details.email, currentUser.role);
    }
  };

  // Wishlist handlers - Save to SERVER
  const handleToggleWishlist = async (productToAdd) => {
    const productKey = productToAdd._id || productToAdd.id;
    const itemInWishlist = wishlistItems.find(item => (item._id || item.id) === productKey);
    
    let updatedWishlist;
    if (itemInWishlist) {
      updatedWishlist = wishlistItems.filter(item => (item._id || item.id) !== productKey);
      alert(`${productToAdd.name} removed from wishlist!`);
    } else {
      updatedWishlist = [...wishlistItems, productToAdd];
      alert(`${productToAdd.name} added to wishlist!`);
    }
    
    setWishlistItems(updatedWishlist);
    
    // Save to SERVER
    if (currentUser.isAuthenticated && currentUser.details) {
      await saveWishlistToServer(updatedWishlist, currentUser.details.email, currentUser.role);
    }
  };

  // Navigation
  const navigateTo = (page, product = null) => {
    setActivePage(page);
    if (product) {
      setViewingProduct(product);
    }
    window.scrollTo(0, 0);
  };

  const handleViewProduct = (product) => {
    setViewingProduct(product);
    navigateTo('productDetail');
  };

  // Search handler
  const handleSearch = (query) => {
    const lowerCaseQuery = query.toLowerCase().trim();
    setSearchQuery(lowerCaseQuery);
    
    if (!lowerCaseQuery) {
      setAllProducts(initialProducts);
      return;
    }

    const categoryMapping = {
      'food & dining': 'food',
      'food': 'food',
      'medicines': 'medicines',
      'automotive': 'automotive',
      'services': 'services',
      'jewellery': 'jewellery',
      'clothes': 'clothes',
      'beauty': 'beauty',
      'footwear': 'footwear',
      'groceries': 'groceries',
      'fruits': 'fruits',
      'books': 'books',
      'Pet Food': 'petfood',
      'musical': 'musical',
      'homefurniture': 'homefurniture',
      'bags': 'bag',
      'kitchen': 'kitchenproduct',
      'sports': 'sports-fitness',
      'watches': 'watches',
      'homedecor': 'homedecor',
      'organic': 'organic'
    };

    if (categoryMapping[lowerCaseQuery]) {
      navigateTo(categoryMapping[lowerCaseQuery]);
      setSearchQuery('');
      return;
    }

    const filteredProducts = initialProducts.filter(product =>
      product.name.toLowerCase().includes(lowerCaseQuery) ||
      product.vendor.toLowerCase().includes(lowerCaseQuery) ||
      product.category.toLowerCase().includes(lowerCaseQuery)
    );

    setAllProducts(filteredProducts);
  };

  // Common props for category pages
  const commonProps = {
    cartItems,
    wishlistItems,
    onAddToCart: handleAddToCart,
    onToggleWishlist: handleToggleWishlist,
    allProducts,
    onViewProduct: handleViewProduct,
    navigateTo,
    searchQuery
  };

  // Render page content
  const renderPage = () => {
    // Reset Password page - No header/navbar
    if (activePage === 'reset-password') {
      return <ResetPassword navigateTo={navigateTo} />;
    }

    // Admin pages
    if (currentUser.role && currentUser.role.toLowerCase() === 'admin') {
      const adminPages = { 
        'admin-dashboard': <AdminDashboard navigateTo={navigateTo} onLogout={handleLogout} />,
        'admin-offers': <AdminOffersManagement />,
        'admin-orders': <AdminPaymentManagement />,
        'admin-catalog': <AdminProductManagement />,
        'admin-profiles': <AdminProfileManagement navigateTo={navigateTo} />,
        'admin-users': <AdminUserManagement navigateTo={navigateTo} />
      };

      if (adminPages[activePage]) {
        return adminPages[activePage];
      }
    }

    // Seller dashboard
    if (currentUser.role && currentUser.role.toLowerCase() === 'seller' && activePage === 'seller-dashboard') {
      return (
        <SellerDashboard
          seller={currentUser.details}
          setAllProducts={setAllProducts}
          onLogout={handleLogout}
        />
      );
    }

    // Customer pages
    const categoryPages = {
      'login': <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onSellerRegister={handleSellerRegister}
        onAdminRegister={handleAdminRegister}
      />,
      'food': <FoodAndDining {...commonProps} />,
      'medicines': <Medicines {...commonProps} />,
      'automotive': <Automotive {...commonProps} />,
      'services': <Services1 {...commonProps} />,
      'jewellery': <Jewellery {...commonProps} />,
      'clothes': <Clothes {...commonProps} />,
      'beauty': <Beauty {...commonProps} />,
      'groceries': <Grocery {...commonProps} />,
      'fruits': <Fruits {...commonProps} />,
      'books': <Books {...commonProps} />,
      'petfood': <Petfood {...commonProps} />,
      'musical': <Musical {...commonProps} />,
      'footwear': <Footwear {...commonProps} />,
      'homefurniture': <HomeFurniture {...commonProps} />,
      'bag': <Bags {...commonProps} />,
      'kitchenproduct': <KitchenProducts {...commonProps} />,
      'organic': <Organic {...commonProps} />,
      'sports-fitness': <SportsAndFitness {...commonProps} />,
      'watches': <Watches {...commonProps} />,
      'homedecor': <HomeDecor {...commonProps} />,
      'cart': <CartPage
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        navigateTo={navigateTo}
        onToggleWishlist={handleToggleWishlist}
        wishlistItems={wishlistItems}
      />,
      'wishlist': <WishlistPage 
        wishlistItems={wishlistItems}
        cartItems={cartItems}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        navigateTo={navigateTo}
      />
    };

    // Product detail pages
    if (activePage === 'productDetail' && viewingProduct) {
      const detailPages = {
        'Medicines': MedicineProductDetail,
        'Automotive': AutomotiveProductDetail,
        'Services': ServiceProductDetail,
        'Jewellery': JewelleryProductDetail,
        'Clothes': ClothesProductDetail,
        'Footwear': FootwearProductDetail,
        'Women\'s Footwear': FootwearProductDetail,
        'Men\'s Footwear': FootwearProductDetail,
        'Kids\' Footwear': FootwearProductDetail,
        'Groceries': GroceryProductDetail,
        'Grocery': GroceryProductDetail,
        'Fruits': FruitProductDetail,
        'Books': BookProductDetail,
        'Pet Food': PetfoodProductDetail,
        'Beauty Products': BeautyProductDetail,
        'Musical Instruments': MusicalProductDetail,
        'Home Furniture': HomeFurnitureProductDetail,
        'Bags': BagProductDetail,
        'Kitchen Products': KitchenProductDetail,
        'Organic Veggies&Fruits': OrganicProductDetail,
        'Sports & Fitness': SportsAndFitnessProductDetail,
        'Watches': WatchesProductDetail,
        'Home Decor': HomeDecorProductDetail,
        'Food & Dining': FoodDineProductDetail
      };

      const DetailComponent = detailPages[viewingProduct.category] || (() => <div>Product Detail Not Found</div>);
      
      return (
        <DetailComponent
          product={viewingProduct}
          cartItems={cartItems}
          wishlistItems={wishlistItems}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          allProducts={allProducts}
          navigateTo={navigateTo}
          onViewProduct={handleViewProduct}
        />
      );
    }

    // Check if it's a category page
    if (categoryPages[activePage]) {
      return categoryPages[activePage];
    }

    // Default home page
    return (
      <>
        <HeroSlider navigateTo={navigateTo} />
        <div ref={categorySectionRef}>
          <CategoryList navigateTo={navigateTo} />
        </div>
        <PopularProductList
          popularProducts={popularProducts}
          onAddToCart={handleAddToCart}
          wishlistItems={wishlistItems}
          onViewProduct={handleViewProduct}
          onToggleWishlist={handleToggleWishlist}
          cartItems={cartItems}
          navigateTo={navigateTo}
        />
        <Services />
        <BusinessList />
      </>
    );
  };

  const showCustomerHeader = 
    activePage !== 'seller-dashboard' && 
    !activePage.startsWith('admin-') &&
    activePage !== 'reset-password' &&
    (!currentUser.role || currentUser.role.toLowerCase() !== 'admin');

  return (
    <div className="App">
      {showCustomerHeader && (
        <>
          <Header
            cartItems={cartItems}
            wishlistItems={wishlistItems}
            onSearch={handleSearch}
            navigateTo={navigateTo}
            onLogout={handleLogout}
            currentUser={currentUser}
          />
          <Navbar navigateTo={navigateTo} />
        </>
      )}
      <main>{renderPage()}</main>
      {showCustomerHeader && (
        <Footer navigateTo={navigateTo} />
      )}
    </div>
  );
}

export default App;