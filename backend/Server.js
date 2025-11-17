require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Email Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// TEST CONNECTION ON STARTUP
console.log('🔍 Testing email connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL CONNECTION FAILED!');
    console.error('Error:', error.message);
  } else {
    console.log('✅ Email server connected successfully!');
    console.log('   Email: tulasikolli23@gmail.com');
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this line
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB Atlas connection error:', err));

// Base User Schema
const baseUserSchema = {
  fullname: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, default: 'active', enum: ['active', 'blocked'] },
  phone: { type: String },
  address: { type: String },
  lastActive: { type: Date, default: Date.now },
  orders: { type: Number, default: 0 },
  products: { type: Array, default: [] },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
};

// Customer Schema
const customerSchema = new mongoose.Schema({
  ...baseUserSchema,
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'Customer' }
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);

// Seller Schema
const sellerSchema = new mongoose.Schema({
  ...baseUserSchema,
  businessName: { type: String, required: true, unique: true },
  businessType: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'Seller' }
}, { timestamps: true });

const Seller = mongoose.model('Seller', sellerSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
  ...baseUserSchema,
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'Admin' }
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// ============================================
// PRODUCT AND CATEGORY SCHEMAS
// ============================================

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  vendor: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String }, // Added subcategory field
  image: { type: String },
  lat: { type: Number },
  lon: { type: Number },
  status: { type: String, default: 'active', enum: ['active', 'inactive'] },
  stock: { type: Number, default: 0 },
  description: { type: String },
  type: { type: String } // Added type field for medicines
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// ============================================
// API ROUTES
// ============================================

// Commented out duplicate seed function that was causing errors
/*
app.post('/api/seed/food-dining', async (req, res) => {
  try {
    // Create category
    const category = new Category({
      name: 'Food & Dining',
      description: 'Delicious food and dining options',
      image: 'https://example.com/food-dining.jpg',
      status: 'active'
    });
    await category.save();

    // Create products
    const products = [
      { name: 'Margherita Pizza', price: 12.99, vendor: 'Pizza Palace', category: 'Food & Dining', image: 'https://example.com/pizza.jpg', stock: 50, description: 'Classic Italian pizza with tomato sauce, mozzarella, and basil' },
      { name: 'Chicken Burger', price: 8.99, vendor: 'Burger Joint', category: 'Food & Dining', image: 'https://example.com/burger.jpg', stock: 30, description: 'Juicy chicken burger with lettuce, tomato, and mayo' },
      { name: 'Caesar Salad', price: 7.99, vendor: 'Salad Bar', category: 'Food & Dining', image: 'https://example.com/salad.jpg', stock: 40, description: 'Fresh Caesar salad with romaine lettuce, croutons, and parmesan' },
      { name: 'Pasta Carbonara', price: 11.99, vendor: 'Italian Kitchen', category: 'Food & Dining', image: 'https://example.com/pasta.jpg', stock: 25, description: 'Creamy pasta with bacon, eggs, and parmesan cheese' },
      { name: 'Fish and Chips', price: 10.99, vendor: 'Seafood Delight', category: 'Food & Dining', image: 'https://example.com/fish-chips.jpg', stock: 35, description: 'Crispy battered fish with golden fries' },
      { name: 'Chocolate Cake', price: 5.99, vendor: 'Sweet Treats', category: 'Food & Dining', image: 'https://example.com/cake.jpg', stock: 20, description: 'Rich chocolate cake with chocolate frosting' },
      { name: 'Grilled Salmon', price: 15.99, vendor: 'Seafood Delight', category: 'Food & Dining', image: 'https://example.com/salmon.jpg', stock: 15, description: 'Perfectly grilled salmon with lemon and herbs' },
      { name: 'Vegetable Stir Fry', price: 9.99, vendor: 'Veggie House', category: 'Food & Dining', image: 'https://example.com/stir-fry.jpg', stock: 45, description: 'Mixed vegetables stir-fried with soy sauce' },
      { name: 'Beef Tacos', price: 8.49, vendor: 'Taco Town', category: 'Food & Dining', image: 'https://example.com/tacos.jpg', stock: 60, description: 'Three beef tacos with salsa and guacamole' },
      { name: 'Ice Cream Sundae', price: 4.99, vendor: 'Ice Cream Parlor', category: 'Food & Dining', image: 'https://example.com/sundae.jpg', stock: 80, description: 'Vanilla ice cream with chocolate syrup and nuts' },
      { name: 'Chicken Nuggets', price: 6.99, vendor: 'Fast Food Corner', category: 'Food & Dining', image: 'https://example.com/nuggets.jpg', stock: 70, description: 'Crispy chicken nuggets with dipping sauce' },
      { name: 'Greek Salad', price: 8.49, vendor: 'Mediterranean Grill', category: 'Food & Dining', image: 'https://example.com/greek-salad.jpg', stock: 30, description: 'Fresh Greek salad with feta cheese and olives' },
      { name: 'BBQ Ribs', price: 14.99, vendor: 'BBQ Pit', category: 'Food & Dining', image: 'https://example.com/ribs.jpg', stock: 20, description: 'Slow-cooked BBQ ribs with coleslaw' },
      { name: 'Fruit Smoothie', price: 4.49, vendor: 'Healthy Bites', category: 'Food & Dining', image: 'https://example.com/smoothie.jpg', stock: 90, description: 'Mixed fruit smoothie with yogurt' },
      { name: 'Cheese Quesadilla', price: 7.49, vendor: 'Mexican Fiesta', category: 'Food & Dining', image: 'https://example.com/quesadilla.jpg', stock: 40, description: 'Cheesy quesadilla with sour cream and salsa' }
    ];

    await Product.insertMany(products);

    res.json({ message: 'Food & Dining category and products seeded successfully' });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});
*/

// ============================================
// TEST ENDPOINT
// ============================================
app.get('/api/test-email', async (req, res) => {
  console.log('\n========================================');
  console.log('🧪 EMAIL TEST STARTED');
  console.log('========================================\n');
  
  try {
    console.log('📧 Sending test email...');
    console.log('   From: tulasikolli23@gmail.com');
    console.log('   To: tulasikolli23@gmail.com');
    
    const info = await transporter.sendMail({
      from: '"ShopNest Test" <tulasikolli23@gmail.com>',
      to: 'tulasikolli23@gmail.com',
      subject: '🧪 Test Email from ShopNest - ' + new Date().toLocaleTimeString(),
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4CAF50;">✅ Email Working!</h1>
            <p>Your email configuration is correct!</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From:</strong> tulasikolli23@gmail.com</p>
          </div>
        </div>
      `
    });
    
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('   Message ID:', info.messageId);
    console.log('\n📬 Check inbox: tulasikolli23@gmail.com');
    console.log('========================================\n');
    
    res.json({ 
      success: true, 
      message: 'Test email sent! Check tulasikolli23@gmail.com',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('\n❌ EMAIL FAILED!');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('========================================\n');

    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// Welcome endpoint with logging
app.get('/api/welcome', (req, res) => {
  console.log(`Request received: ${req.method} ${req.path}`);
  res.json({ message: 'Welcome to the ShopNest API Service!' });
});

// ============================================
// AUTH ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    let { fullname, email, businessName, businessType, password, role } = req.body;
    console.log('📝 Registration attempt:', { email, role });

    if (!email || !password || !fullname || !role) {
      return res.status(400).json({ message: 'Fullname, email, password, and role are required' });
    }

    // Normalize inputs
    email = email.trim().toLowerCase();
    if (businessName) businessName = businessName.trim();

    // 1. Check if email exists across ALL user types first
    const [customerExists, sellerExists, adminExists] = await Promise.all([
      Customer.findOne({ email }),
      Seller.findOne({ email }),
      Admin.findOne({ email })
    ]);

    if (customerExists || sellerExists || adminExists) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser;

    if (role === 'Seller') {
      if (!businessName || !businessType) {
        return res.status(400).json({ message: 'Business name and type are required for sellers' });
      }
      // 2. Now, check for unique business name (case-insensitive)
      const existingBusiness = await Seller.findOne({ businessName: { $regex: `^${businessName}$`, $options: 'i' } });
      if (existingBusiness) {
        console.log('❌ Business name already exists:', businessName);
        return res.status(400).json({ message: 'Business name already exists' });
      }
      newUser = new Seller({ fullname, businessName, businessType, email, password: hashedPassword });
    } else if (role === 'Customer') {
      newUser = new Customer({ fullname, email, password: hashedPassword });
    } else if (role === 'Admin') {
      newUser = new Admin({ fullname, email, password: hashedPassword });
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await newUser.save();
    console.log('✅ Registered successfully:', email);
    res.status(201).json({ message: `${role} registered successfully` });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Login - FIXED: All roles now search by email
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log('\n========================================');
    console.log('🔐 LOGIN ATTEMPT');
    console.log('   Email:', email);
    console.log('   Role:', role);
    console.log('========================================');

    let user;
    
    // ✅ FIXED: All roles now search by EMAIL
    if (role === 'Seller') {
      user = await Seller.findOne({ email });
      console.log('   Searching Seller by email...');
    } else if (role === 'Customer') {
      user = await Customer.findOne({ email });
      console.log('   Searching Customer by email...');
    } else if (role === 'Admin') {
      user = await Admin.findOne({ email });
      console.log('   Searching Admin by email...');
    }

    if (!user) {
      console.log('❌ User not found');
      console.log('========================================\n');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ User found:', user.fullname);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.log('❌ Invalid password');
      console.log('========================================\n');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('✅ Password valid');

    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    console.log('✅ LOGIN SUCCESSFUL');
    console.log('   User:', user.fullname);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('========================================\n');

    res.json({
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        role: user.role,
        status: user.status
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email, role } = req.body;

    console.log('\n========================================');
    console.log('🔑 FORGOT PASSWORD REQUEST');
    console.log('   Email:', email);
    console.log('   Role:', role);
    console.log('========================================\n');

    let user;
    if (role === 'seller') user = await Seller.findOne({ email });
    else if (role === 'customer') user = await Customer.findOne({ email });
    else if (role === 'admin') user = await Admin.findOne({ email });

    if (!user) {
      console.log('❌ User not found\n');
      return res.status(404).json({ message: 'No account found with this email' });
    }

    console.log('✅ User found:', user.fullname);

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    console.log('🔐 Token saved');

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { background: #f9f9f9; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .url-box { background: #f0f0f0; padding: 15px; border-radius: 5px; word-break: break-all; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.fullname}</strong>,</p>
            <p>We received a request to reset your password for your ShopNest account.</p>
            <p>Click the button below to reset your password:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p>Or copy this link:</p>
            <div class="url-box">${resetUrl}</div>
            <p><strong>⏰ This link expires in 1 hour.</strong></p>
            <p>If you didn't request this, ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2025 ShopNest. All rights reserved.</p>
            <p>Sent: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('📧 Sending email to:', user.email);
    
    const info = await transporter.sendMail({
      from: '"ShopNest Password Reset" <tulasikolli23@gmail.com>',
      to: user.email,
      subject: '🔐 Reset Your ShopNest Password',
      html: emailHTML
    });

    console.log('\n✅ PASSWORD RESET EMAIL SENT!');
    console.log('   To:', user.email);
    console.log('   Message ID:', info.messageId);
    console.log('========================================\n');
    
    res.json({ message: 'Password reset link has been sent to your email' });
    
  } catch (error) {
    console.error('\n❌ FORGOT PASSWORD ERROR');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('========================================\n');
    res.status(500).json({ message: 'Failed to send email. Check server logs.' });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let user = await Customer.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) user = await Seller.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) user = await Admin.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('✅ Password reset successful:', user.email);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// PRODUCT AND CATEGORY ROUTES
// ============================================

// Seed Food & Dining Category and Products
app.post('/api/seed/food-dining', async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('🌱 SEEDING FOOD & DINING DATA');
    console.log('========================================\n');

    // Create or update category
    const categoryData = {
      name: 'Food & Dining',
      description: 'Delicious food and dining options',
      image: 'food-dining-hero.jpg',
      status: 'active'
    };

    const category = await Category.findOneAndUpdate(
      { name: 'Food & Dining' },
      categoryData,
      { upsert: true, new: true }
    );

    console.log('✅ Category created/updated:', category.name);

    // Product data
    const productsData = [
      { "name": "Pepperoni Pizza", "price": 349, "vendor": "PizzaPalace", "category": "Food & Dining", "subcategory": "Pizza", "image": "Pepperoni Pizza.jpg", "lat": 17.4486, "lon": 78.3908, "stock": 50, "description": "Classic Italian pizza with pepperoni, cheese, and tomato sauce" },
      { "name": "Veggie Burger", "price": 179, "vendor": "BurgerBonanza", "category": "Food & Dining", "subcategory": "Burger", "image": "Veggie Burger.jpg", "lat": 17.4512, "lon": 78.3855, "stock": 30, "description": "Delicious veggie burger with fresh vegetables and special sauce" },
      { "name": "Spaghetti-Carbonara", "price": 279, "vendor": "PastaPlace", "category": "Food & Dining", "subcategory": "Pasta", "image": "Spaghetti Carbonara.jpg", "lat": 17.4421, "lon": 78.3882, "stock": 25, "description": "Creamy spaghetti carbonara with bacon and parmesan cheese" },
      { "name": "Butter Chicken", "price": 399, "vendor": "CurryCorner", "category": "Food & Dining", "subcategory": "Curry", "image": "Butter Chicken.jpg", "lat": 17.4550, "lon": 78.3920, "stock": 20, "description": "Rich and creamy butter chicken curry with aromatic spices" },
      { "name": "California Roll", "price": 649, "vendor": "SushiSpot", "category": "Food & Dining", "subcategory": "Sushi", "image": "California Roll.webp", "lat": 17.4399, "lon": 78.4421, "stock": 15, "description": "Fresh California roll with avocado, crab, and cucumber" },
      { "name": "Club Sandwich", "price": 159, "vendor": "SnackShack", "category": "Food & Dining", "subcategory": "Sandwich", "image": "Club Sandwich.jpg", "lat": 17.4455, "lon": 78.3800, "stock": 40, "description": "Triple-decker club sandwich with chicken, bacon, and veggies" },
      { "name": "Greek Salad", "price": 199, "vendor": "SaladStop", "category": "Food & Dining", "subcategory": "Salad", "image": "Greek Salad.jpg", "lat": 17.4480, "lon": 78.3890, "stock": 35, "description": "Fresh Greek salad with feta cheese, olives, and vegetables" },
      { "name": "BBQ Ribs", "price": 449, "vendor": "GrillGuru", "category": "Food & Dining", "subcategory": "Grilled", "image": "BBQ Ribs.jpeg", "lat": 17.4520, "lon": 78.3870, "stock": 18, "description": "Slow-cooked BBQ ribs with coleslaw and special sauce" },
      { "name": "Tiramisu", "price": 249, "vendor": "DessertDen", "category": "Food & Dining", "subcategory": "Dessert", "image": "Tiramisu.jpeg", "lat": 17.4400, "lon": 78.3850, "stock": 22, "description": "Classic Italian tiramisu with coffee and mascarpone cream" },
      { "name": "South Indian Thali", "price": 229, "vendor": "TasteOfSouth", "category": "Food & Dining", "subcategory": "Thali", "image": "South Indian Thali.jpeg", "lat": 17.4490, "lon": 78.3950, "stock": 28, "description": "Complete South Indian thali with rice, curries, and sides" },
      { "name": "Mutton Rogan Josh", "price": 429, "vendor": "CurryCorner", "category": "Food & Dining", "subcategory": "Curry", "image": "Mutton Rogan Josh.jpeg", "lat": 17.4550, "lon": 78.3920, "stock": 16, "description": "Spicy Kashmiri mutton rogan josh curry" },
      { "name": "Veg Fried Rice", "price": 169, "vendor": "WokToss", "category": "Food & Dining", "subcategory": "Rice", "image": "Veg Fried Rice.jpeg", "lat": 17.4430, "lon": 78.3860, "stock": 45, "description": "Vegetable fried rice with Asian spices and vegetables" },
      { "name": "Steamed Bao Buns", "price": 149, "vendor": "AsianBites", "category": "Food & Dining", "subcategory": "Asian", "image": "Steamed Bao Buns.jpg", "lat": 17.4500, "lon": 78.3840, "stock": 32, "description": "Soft steamed bao buns with savory fillings" },
      { "name": "Shawarma Wrap", "price": 219, "vendor": "MediterraneanMunch", "category": "Food & Dining", "subcategory": "Wrap", "image": "Shawarma Wrap.jpg", "lat": 17.4470, "lon": 78.3910, "stock": 38, "description": "Middle Eastern shawarma wrap with spiced meat and veggies" },
      { "name": "Chocolate Lava Cake", "price": 199, "vendor": "DessertDen", "category": "Food & Dining", "subcategory": "Dessert", "image": "Chocolate Lava Cake.jpg", "lat": 17.4400, "lon": 78.3850, "stock": 25, "description": "Warm chocolate lava cake with molten center" }
    ];

    // Insert products (skip if already exists based on name)
    const insertedProducts = [];
    for (const productData of productsData) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        insertedProducts.push(product);
        console.log('✅ Product inserted:', product.name);
      } else {
        console.log('⏭️  Product already exists:', productData.name);
      }
    }

    console.log('\n========================================');
    console.log('✅ SEEDING COMPLETED');
    console.log('   Category:', category.name);
    console.log('   New Products:', insertedProducts.length);
    console.log('========================================\n');

    res.json({
      success: true,
      message: 'Food & Dining data seeded successfully',
      category,
      newProductsCount: insertedProducts.length,
      totalProducts: productsData.length
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed Medicines Category and Products
app.post('/api/seed/medicines', async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('💊 SEEDING MEDICINES DATA');
    console.log('========================================\n');

    // Create or update category
    const categoryData = {
      name: 'Medicines',
      description: 'Health and wellness products',
      image: 'medicine-hero.jpg',
      status: 'active'
    };

    const category = await Category.findOneAndUpdate(
      { name: 'Medicines' },
      categoryData,
      { upsert: true, new: true }
    );

    console.log('✅ Category created/updated:', category.name);

    // Product data
    const productsData = [
      { "name": "Vitamin D3 2000IU", "price": 49, "vendor": "MediCare Pharmacy", "category": "Medicines", "image": "Vitamin D3 2000IU1.jpeg", "type": "Tablet", "description": "Vitamin D3 2000IU is essential for bone health, immune function, and calcium absorption. Benefits include stronger bones and reduced risk of deficiency. Precautions: Consult a doctor if pregnant, nursing, or on medication.", "lat": 17.4486, "lon": 78.3908, "stock": 50 },
      { "name": "Pain Relief", "price": 129, "vendor": "HealthPlus", "category": "Medicines", "image": "pain relif.jpg", "type": "Capsule", "description": "Pain Relief capsules provide fast relief from headaches, muscle pain, and inflammation. Benefits: Effective pain management without drowsiness. Precautions: Do not exceed recommended dosage; avoid if allergic to NSAIDs.", "lat": 17.4512, "lon": 78.3855, "stock": 50 },
      { "name": "Vitamin C 1000mg", "price": 299, "vendor": "NutriWell", "category": "Medicines", "image": "Vitamin-C-1000-mg-20-tablets-Orange_o.jpg", "type": "Supplement", "description": "Vitamin C 1000mg supplement boosts immunity, collagen production, and antioxidant protection. Benefits: Enhanced immune response and skin health. Precautions: High doses may cause stomach upset; consult a doctor if on blood thinners.", "lat": 17.4421, "lon": 78.3882, "stock": 50 },
      { "name": "Blood Pressure Monitor", "price": 1499, "vendor": "MediTech", "category": "Medicines", "image": "BPMonitor.jpg", "type": "Medical Device", "description": "Blood Pressure Monitor accurately measures systolic and diastolic pressure at home. Benefits: Helps monitor hypertension and prevent complications. Precautions: Ensure proper cuff size; consult a healthcare provider for interpretation.", "lat": 17.4550, "lon": 78.3920, "stock": 50 },
      { "name": "Atorvastatin 10mg", "price": 189, "vendor": "PharmaCare", "category": "Medicines", "image": "Atorvastatin.jpg", "type": "Tablet", "description": "Atorvastatin 10mg lowers cholesterol levels and reduces the risk of cardiovascular disease. Benefits: Reduces LDL cholesterol and triglyceride levels. Precautions: May cause muscle pain; monitor liver function; avoid grapefruit juice.", "lat": 17.4399, "lon": 78.4421, "stock": 50 },
      { "name": "Omeprazole 20mg", "price": 159, "vendor": "MediExpress", "category": "Medicines", "image": "Omeprazole.jpg", "type": "Capsule", "description": "Omeprazole 20mg reduces stomach acid production for acid reflux and ulcers. Benefits: Relieves heartburn and promotes healing. Precautions: Long-term use may affect vitamin B12 absorption; consult a doctor if symptoms persist.", "lat": 17.4455, "lon": 78.3800, "stock": 50 },
      { "name": "Diabetes Test Strips", "price": 799, "vendor": "DiabeCare", "category": "Medicines", "image": "TestStrips.jpg", "type": "Medical Supply", "description": "Diabetes Test Strips measure blood glucose levels for diabetes management. Benefits: Enables self-monitoring and better control. Precautions: Use with a compatible glucometer; store properly to maintain accuracy.", "lat": 17.4480, "lon": 78.3890, "stock": 50 },
      { "name": "Metformin 500mg", "price": 99, "vendor": "HealthFirst", "category": "Medicines", "image": "Metformin.jpg", "type": "Tablet", "description": "Metformin 500mg helps control blood sugar in type 2 diabetes. Benefits: Improves insulin sensitivity and reduces glucose production. Precautions: May cause digestive side effects; monitor kidney function.", "lat": 17.4520, "lon": 78.3870, "stock": 50 },
      { "name": "First Aid Kit", "price": 499, "vendor": "SafeLife", "category": "Medicines", "image": "FirstAidKit.jpg", "type": "Medical Kit", "description": "First Aid Kit contains essential supplies for minor injuries and emergencies. Benefits: Quick response for cuts, burns, and sprains. Precautions: Check expiration dates; restock used items regularly.", "lat": 17.4400, "lon": 78.3850, "stock": 50 },
      { "name": "Ibuprofen 400mg", "price": 79, "vendor": "QuickMeds", "category": "Medicines", "image": "ibprofen 400mg.jpg", "type": "Tablet", "description": "Ibuprofen 400mg relieves pain, fever, and inflammation. Benefits: Effective for arthritis and menstrual cramps. Precautions: Avoid if allergic to NSAIDs; long-term use may increase heart risks.", "lat": 17.4490, "lon": 78.3950, "stock": 50 },
      { "name": "Vitamin D3 1000IU", "price": 349, "vendor": "WellnessPlus", "category": "Medicines", "image": "VitaminD3.jpg", "type": "Supplement", "description": "Vitamin D3 1000IU supports bone density and immune health. Benefits: Prevents rickets and osteomalacia. Precautions: Overdose can cause hypercalcemia; consult a doctor for dosage.", "lat": 17.4550, "lon": 78.3920, "stock": 50 },
      { "name": "Thermometer Digital", "price": 249, "vendor": "HealthGadgets", "category": "Medicines", "image": "Thermometer.jpg", "type": "Medical Device", "description": "Digital Thermometer provides accurate body temperature readings. Benefits: Fast and hygienic measurement. Precautions: Clean after use; ensure battery is functional.", "lat": 17.4430, "lon": 78.3860, "stock": 50 },
      { "name": "Cetirizine 10mg", "price": 59, "vendor": "AllergyCare", "category": "Medicines", "image": "Cetirizine.jpg", "type": "Tablet", "description": "Cetirizine 10mg reduces allergy symptoms like runny nose and itching. Benefits: Non-drowsy antihistamine for hay fever. Precautions: May cause dry mouth; avoid alcohol.", "lat": 17.4500, "lon": 78.3840, "stock": 50 },
      { "name": "Nebulizer Machine", "price": 1899, "vendor": "BreathEasy", "category": "Medicines", "image": "Nebulizer.jpg", "type": "Medical Equipment", "description": "Nebulizer Machine converts liquid medicine into a mist for respiratory treatment. Benefits: Effective for asthma and COPD. Precautions: Clean regularly; use only prescribed medications.", "lat": 17.4470, "lon": 78.3910, "stock": 50 },
      { "name": "Aspirin 75mg", "price": 69, "vendor": "HeartCare", "category": "Medicines", "image": "Aspirin.jpg", "type": "Tablet", "description": "Aspirin 75mg prevents blood clots and reduces the risk of heart attack. Benefits: Anti-platelet action for cardiovascular disease. Precautions: May cause stomach bleeding; not for everyone; consult a doctor.", "lat": 17.4400, "lon": 78.3850, "stock": 50 }
    ];

    // Insert products (skip if already exists based on name)
    const insertedProducts = [];
    for (const productData of productsData) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        insertedProducts.push(product);
        console.log('✅ Product inserted:', product.name);
      } else {
        console.log('⏭️  Product already exists:', productData.name);
      }
    }

    console.log('\n========================================');
    console.log('✅ MEDICINES SEEDING COMPLETED');
    console.log('   Category:', category.name);
    console.log('   New Products:', insertedProducts.length);
    console.log('========================================\n');

    res.json({
      success: true,
      message: 'Medicines data seeded successfully',
      category,
      newProductsCount: insertedProducts.length,
      totalProducts: productsData.length
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed Automotive Category and Products
app.post('/api/seed/automotive', async (req, res) => {
  try {
    console.log('\n========================================');
    console.log('🚗 SEEDING AUTOMOTIVE DATA');
    console.log('========================================\n');

    // Create or update category
    const categoryData = {
      name: 'Automotive',
      description: 'Cars, vehicles, and automotive products',
      image: 'automotive-hero.jpg',
      status: 'active'
    };

    const category = await Category.findOneAndUpdate(
      { name: 'Automotive' },
      categoryData,
      { upsert: true, new: true }
    );

    console.log('✅ Category created/updated:', category.name);

    // Product data
    const productsData = [
      { "name": "Toyota Camry", "price": 2500000, "vendor": "Toyota Dealers", "category": "Automotive", "image": "Toyota Camry.jpg", "lat": 17.4486, "lon": 78.3908, "stock": 5, "description": "Reliable sedan with excellent fuel efficiency and comfort" },
      { "name": "Honda Civic", "price": 1800000, "vendor": "Honda Showroom", "category": "Automotive", "image": "Honda Civic.jpg", "lat": 17.4512, "lon": 78.3855, "stock": 8, "description": "Sporty compact car with advanced safety features" },
      { "name": "Ford Mustang", "price": 4500000, "vendor": "Ford Motors", "category": "Automotive", "image": "Ford Mustang.jpg", "lat": 17.4421, "lon": 78.3882, "stock": 3, "description": "Iconic muscle car with powerful V8 engine" },
      { "name": "BMW X5", "price": 6500000, "vendor": "BMW Premium", "category": "Automotive", "image": "BMW X5.jpg", "lat": 17.4550, "lon": 78.3920, "stock": 2, "description": "Luxury SUV with cutting-edge technology and performance" },
      { "name": "Tesla Model 3", "price": 5500000, "vendor": "Tesla Hyderabad", "category": "Automotive", "image": "Tesla Model 3.jpg", "lat": 17.4399, "lon": 78.4421, "stock": 4, "description": "Electric sedan with autopilot and zero emissions" },
      { "name": "Mahindra Scorpio", "price": 1500000, "vendor": "Mahindra Auto", "category": "Automotive", "image": "Mahindra Scorpio.jpg", "lat": 17.4455, "lon": 78.3800, "stock": 10, "description": "Rugged SUV perfect for Indian roads and off-road adventures" },
      { "name": "Hyundai Creta", "price": 1200000, "vendor": "Hyundai Plaza", "category": "Automotive", "image": "Hyundai Creta.jpg", "lat": 17.4480, "lon": 78.3890, "stock": 12, "description": "Compact SUV with modern design and features" },
      { "name": "Audi A6", "price": 6000000, "vendor": "Audi Center", "category": "Automotive", "image": "Audi A6.jpg", "lat": 17.4520, "lon": 78.3870, "stock": 1, "description": "Premium executive sedan with luxury and performance" },
      { "name": "Maruti Suzuki Swift", "price": 600000, "vendor": "Maruti Suzuki", "category": "Automotive", "image": "Maruti Suzuki Swift.jpg", "lat": 17.4400, "lon": 78.3850, "stock": 15, "description": "Affordable hatchback with great mileage and reliability" },
      { "name": "Mercedes-Benz C-Class", "price": 5500000, "vendor": "Mercedes-Benz Hyderabad", "category": "Automotive", "image": "Mercedes-Benz C-Class.jpg", "lat": 17.4490, "lon": 78.3950, "stock": 2, "description": "Luxury sedan combining elegance and advanced technology" },
      { "name": "Kia Seltos", "price": 1100000, "vendor": "Kia Motors", "category": "Automotive", "image": "Kia Seltos.jpg", "lat": 17.4550, "lon": 78.3920, "stock": 9, "description": "Stylish SUV with bold design and smart features" },
      { "name": "Volkswagen Polo", "price": 700000, "vendor": "Volkswagen India", "category": "Automotive", "image": "Volkswagen Polo.jpg", "lat": 17.4430, "lon": 78.3860, "stock": 11, "description": "Compact hatchback with German engineering and comfort" },
      { "name": "Nissan Magnite", "price": 650000, "vendor": "Nissan Showroom", "category": "Automotive", "image": "Nissan Magnite.jpg", "lat": 17.4500, "lon": 78.3840, "stock": 7, "description": "Urban SUV with rugged looks and modern amenities" },
      { "name": "Jeep Compass", "price": 2000000, "vendor": "Jeep India", "category": "Automotive", "image": "Jeep Compass.jpg", "lat": 17.4470, "lon": 78.3910, "stock": 4, "description": "Adventure-ready SUV with 4x4 capability" },
      { "name": "Tata Nexon", "price": 800000, "vendor": "Tata Motors", "category": "Automotive", "image": "Tata Nexon.jpg", "lat": 17.4400, "lon": 78.3850, "stock": 13, "description": "Compact SUV with strong build and connected features" }
    ];

    // Insert products (skip if already exists based on name)
    const insertedProducts = [];
    for (const productData of productsData) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product(productData);
        await product.save();
        insertedProducts.push(product);
        console.log('✅ Product inserted:', product.name);
      } else {
        console.log('⏭️  Product already exists:', productData.name);
      }
    }

    console.log('\n========================================');
    console.log('✅ AUTOMOTIVE SEEDING COMPLETED');
    console.log('   Category:', category.name);
    console.log('   New Products:', insertedProducts.length);
    console.log('========================================\n');

    res.json({
      success: true,
      message: 'Automotive data seeded successfully',
      category,
      newProductsCount: insertedProducts.length,
      totalProducts: productsData.length
    });

  } catch (error) {
    console.error('❌ Seeding error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find({ status: 'active' });
    res.json(categories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products by category
app.get('/api/products/category/:categoryName', async (req, res) => {
    try {
        const { categoryName } = req.params;
        let query;

        if (categoryName.toLowerCase() === 'jewellery') {
            // Special handling for Jewellery to include all subcategories
            query = {
                $or: [
                    { category: 'Jewellery' },
                    { category: 'Mens Jewellery' },
                    { category: 'Kids Jewellery' }
                ],
                status: 'active'
            };
        } else {
            query = {
                category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
                status: 'active'
            };
        }
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error('❌ Error fetching products by category:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ status: 'active' });
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unique subcategories, optionally filtered by category
app.get('/api/products/subcategories', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { subcategory: { $ne: null, $ne: '' } };
    if (category) {
      query.category = category;
    }
    const subcategories = await Product.distinct('subcategory', query);
    res.json(subcategories);
  } catch (error) {
    console.error('❌ Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// CRUD OPERATIONS FOR ADMIN PANEL
// ============================================

// Create Category
app.post('/api/admin/categories', async (req, res) => {
  try {
    const { name, description, image, status } = req.body;
    const category = new Category({
      name,
      description,
      image,
      status: status || 'active'
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('❌ Error creating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Category
app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const category = await Category.findByIdAndUpdate(id, updates, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error) {
    console.error('❌ Error updating category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Category
app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    // Update products to remove category reference
    await Product.updateMany({ category: category.name }, { category: null });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Product with File Upload
app.post('/api/admin/products/upload', upload.single('image'), async (req, res) => {
  try {
    const productData = req.body;
    console.log('📦 Creating product with data:', productData);
    console.log('📁 File received:', req.file ? req.file.filename : 'No file');

    if (req.file) {
      productData.image = req.file.filename;
    }

    // Ensure required fields are present
    const { name, price, vendor, category, stock, description, status } = productData;
    if (!name || !price || !vendor || !category) {
      return res.status(400).json({ message: 'Name, price, vendor, and category are required' });
    }

    const product = new Product({
      name: name.trim(),
      price: Number(price),
      vendor: vendor.trim(),
      category: category.trim(),
      image: productData.image,
      stock: Number(stock) || 0,
      description: description ? description.trim() : '',
      status: status || 'active'
    });

    await product.save();
    console.log('✅ Product created successfully:', product.name);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update Product
app.put('/api/admin/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (req.file) {
      updates.image = req.file.filename;
    }
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Product
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

app.get('/api/admin/users', async (req, res) => {
  try {
    const [customers, sellers, admins] = await Promise.all([
      Customer.find().select('-password -resetPasswordToken -resetPasswordExpires'),
      Seller.find().select('-password -resetPasswordToken -resetPasswordExpires'),
      Admin.find().select('-password -resetPasswordToken -resetPasswordExpires')
    ]);
    res.json([...customers, ...sellers, ...admins]);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

    let user = await Customer.findByIdAndUpdate(id, updates, { new: true }).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) user = await Seller.findByIdAndUpdate(id, updates, { new: true }).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) user = await Admin.findByIdAndUpdate(id, updates, { new: true }).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let result = await Customer.findByIdAndDelete(id);
    if (!result) result = await Seller.findByIdAndDelete(id);
    if (!result) result = await Admin.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 SERVER STARTED');
  console.log('========================================');
  console.log('Port:', PORT);
  console.log('API:', `http://localhost:${PORT}`);
  console.log('Email:', 'tulasikolli23@gmail.com');
  console.log('');
  console.log('🧪 Test email: http://localhost:5000/api/test-email');
  console.log('========================================\n');
});