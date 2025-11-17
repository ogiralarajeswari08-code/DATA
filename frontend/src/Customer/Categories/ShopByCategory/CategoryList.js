import React from 'react';
import CategoryCard from './CategoryCard';
import { categoriesData } from './data';

// Mock data based on your add1.html
const categoriesWithDetails = [
    { name: "Food & Dining", description: "Restaurants, cafes and more", image: "/IMAGES/food and dine.jpg" },
    { name: "Medicines", description: "Pharmacies and health products", image: "/IMAGES/medicine.jpg" },
    { name: "Automotive", description: "Mechanics and car services", image: "/IMAGES/automative.jpg" },
    { name: "Services", description: "Home services and repairs", image: "/IMAGES/services.jpg" },
    { name: "Jewellery", description: "Rings, necklaces and accessories", image: "/IMAGES/jewellaery.jpg" },
    { name: "Clothing", description: "Fashion for men and women", image: "/IMAGES/cloth.jpg" },
    { name: "Beauty Products", description: "Cosmetics and skincare", image: "/IMAGES/beauty products.jpg" },
    { name: "Footwear", description: "Shoes, sandals, and sneakers", image: "/IMAGES/footwear.jpg" },
    { name: "Groceries", description: "Daily essentials and pantry items", image: "/IMAGES/grocery.jpeg" },
    { name: "Fruits", description: "Fresh fruits and organic produce", image: "/IMAGES/fruit.jpg" },
    { name: "Books", description: "Novels, textbooks, and more", image: "/IMAGES/book.jpg" },
    { name: "Pet Food", description: "Nutrition for your pets", image: "/IMAGES/petfood.jpg" },
    { name: "Musical Instruments", description: "Guitars, pianos, and accessories", image: "/IMAGES/music.jpg" },
    { name: "Home Furniture", description: "Sofas, tables, and home essentials", image: "/IMAGES/furniture.jpg" },
    { name: "Bags", description: "Backpacks, handbags, and luggage", image: "/IMAGES/bag.jpg" },
    { name: "Kitchen Products", description: "Cookware and kitchen gadgets", image: "/IMAGES/kitchen.jpg" },
    { name: "Sports & Fitness", description: "Gym equipment and sportswear", image: "/IMAGES/sports.jpg" },
    { name: "Home Decor", description: "Decor items and home upgrades", image: "/IMAGES/decor.jpg" },
    { name: "Watches", description: "Stylish timepieces and smartwatches", image: "/IMAGES/watches.jpg" },
    { name: "Organic Veggies & Fruits", description: "Fresh veggies,fruits and organic produce", image: "/IMAGES/farmstyle.webp" },
];

const CategoryList = ({ navigateTo }) => {
  const handleCategoryNavigation = (categoryName) => {
    let pageToNavigate = '';

    switch (categoryName) {
        case 'Food & Dining':
            pageToNavigate = 'food';
            break;
        case 'Medicines':
            pageToNavigate = 'medicines';
            break;
        case 'Automotive':
            pageToNavigate = 'automotive';
            break;
        case 'Services':
            pageToNavigate = 'services';
            break;
        case 'Home Decor':
            pageToNavigate = 'homedecor';
            break;
        case 'Clothing':
            pageToNavigate = 'clothes';
            break;
        case 'Beauty Products':
            pageToNavigate = 'beauty';
            break;
        case 'Musical Instruments':
            pageToNavigate = 'musical';
            break;
        case 'Bags':
            pageToNavigate = 'bag';
            break;
        case 'Kitchen Products':
            pageToNavigate = 'kitchenproduct';
            break;
        case 'Organic Veggies & Fruits':
            pageToNavigate = 'organic';
            break;
        default:
            pageToNavigate = categoryName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '');
            break;
    }
    navigateTo(pageToNavigate);
  };

  const handleCategoryClick = (categoryName) => {
    handleCategoryNavigation(categoryName);
  };

  return (
    <section className="section categories" id="categories">
      <div className="container">
        <div className="section-title">
          <h2>Shop by Category</h2>
        </div>
        <div className="category-grid">
          {categoriesData.map(category => {
            const details = categoriesWithDetails.find(c => c.name === category.name);
            return (
              <CategoryCard
                key={category.name}
                category={{ ...category, ...details }}
                onCategoryClick={handleCategoryClick}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryList;