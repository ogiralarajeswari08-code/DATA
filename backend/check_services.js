const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/ecom_shopnest';

async function check() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('ecom_shopnest');
    const products = db.collection('products');
    const services = await products.find({ category: 'Services' }).toArray();
    console.log('Total Services products:', services.length);
    const activeServices = services.filter(p => p.status === 'active');
    console.log('Active Services products:', activeServices.length);
    const categories = db.collection('categories');
    const cat = await categories.findOne({ name: 'Services' });
    console.log('Services category:', cat ? 'exists' : 'not found');
    if (cat) {
      console.log('Category status:', cat.status);
    }
  } finally {
    await client.close();
  }
}

check().catch(console.error);
