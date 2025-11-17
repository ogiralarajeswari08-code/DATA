const mongoose = require('mongoose');

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

module.exports = mongoose.model('Product', productSchema);
