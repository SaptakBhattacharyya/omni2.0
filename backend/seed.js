const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/user.model');
const Store = require('./src/models/store.model');
const Product = require('./src/models/product.model');
const Order = require('./src/models/order.model');
const Negotiation = require('./src/models/negotiation.model');
const Customer = require('./src/models/customer.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/omniretail';

const dummyStores = [
  {
    name: 'Tech Hub Electronics',
    address: '123 Main Street',
    city: 'Bangalore',
    phone: '+91 98765 43210',
    location: {
      type: 'Point',
      coordinates: [77.5946, 12.9716] // [lng, lat] - Bangalore
    },
    openingHours: '10:00 AM - 9:00 PM',
    isMainBranch: true
  },
  {
    name: 'Fashion Avenue',
    address: '456 MG Road',
    city: 'Bangalore',
    phone: '+91 98765 43211',
    location: {
      type: 'Point',
      coordinates: [77.5896, 12.9766]
    },
    openingHours: '9:30 AM - 8:30 PM',
    isMainBranch: false
  },
  {
    name: 'Grocery Plus',
    address: '789 Indiranagar',
    city: 'Bangalore',
    phone: '+91 98765 43212',
    location: {
      type: 'Point',
      coordinates: [77.6374, 12.9719]
    },
    openingHours: '8:00 AM - 10:00 PM',
    isMainBranch: false
  }
];

const dummyProducts = [
  {
    sku: 'PROD001',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30hr battery life',
    basePrice: 2999,
    minAcceptablePrice: 2499,
    category: 'Electronics',
    storeCategory: 'Electronics',
    negotiationEnabled: true,
    stockStatus: 'in_stock',
    stockQuantity: 45,
    isSurplus: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', isPrimary: true }
    ],
    specifications: new Map([['Brand', 'SoundMaster'], ['Color', 'Black'], ['Wireless', 'Yes']]),
    variants: { sizes: [], colors: ['Black', 'White', 'Blue'] }
  },
  {
    sku: 'PROD002',
    name: 'Smart Watch',
    description: 'Feature-packed smart watch with heart rate monitor',
    basePrice: 4999,
    minAcceptablePrice: 4299,
    category: 'Electronics',
    storeCategory: 'Electronics',
    negotiationEnabled: true,
    stockStatus: 'in_stock',
    stockQuantity: 30,
    isSurplus: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop', isPrimary: true }
    ],
    specifications: new Map([['Brand', 'TechWatch'], ['Waterproof', 'Yes']]),
    variants: { sizes: [], colors: ['Black', 'Silver'] }
  },
  {
    sku: 'PROD003',
    name: 'Men\'s Casual Shirt',
    description: 'Comfortable cotton casual shirt',
    basePrice: 999,
    minAcceptablePrice: 799,
    category: 'Fashion',
    storeCategory: 'Fashion',
    negotiationEnabled: true,
    stockStatus: 'in_stock',
    stockQuantity: 100,
    isSurplus: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', isPrimary: true }
    ],
    specifications: new Map([['Material', 'Cotton'], ['Fit', 'Regular']]),
    variants: { sizes: ['S', 'M', 'L', 'XL'], colors: ['Blue', 'White', 'Green'] }
  },
  {
    sku: 'PROD004',
    name: 'Organic Rice 5kg',
    description: 'Premium organic basmati rice',
    basePrice: 599,
    minAcceptablePrice: 499,
    category: 'Grocery',
    storeCategory: 'Grocery',
    negotiationEnabled: false,
    stockStatus: 'in_stock',
    stockQuantity: 80,
    isSurplus: false,
    images: [
      { url: 'https://images.unsplash.com/photo-1617098581197-28e0a6b0032e?w=400&h=300&fit=crop', isPrimary: true }
    ],
    specifications: new Map([['Type', 'Basmati'], ['Organic', 'Yes']]),
    variants: { sizes: ['5kg', '10kg'], colors: [] }
  }
];

const dummyCustomers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    totalSpend: 15997,
    status: 'Top',
    initials: 'JD',
    feedback: [
      { text: 'Great products!', rating: 5, time: '2024-05-15' },
      { text: 'Fast delivery', rating: 4, time: '2024-05-20' }
    ]
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    totalSpend: 5998,
    status: 'Active',
    initials: 'JS',
    feedback: [
      { text: 'Good experience', rating: 4, time: '2024-05-18' }
    ]
  },
  {
    name: 'Robert Johnson',
    email: 'robert@example.com',
    totalSpend: 0,
    status: 'Inactive',
    initials: 'RJ',
    feedback: []
  }
];

const dummyOrders = [
  {
    orderId: 'ORD-001',
    customer: 'John Doe',
    initials: 'JD',
    total: 2999,
    status: 'Delivered',
    items: [
      { name: 'Wireless Headphones', qty: 1, price: 2999 }
    ]
  },
  {
    orderId: 'ORD-002',
    customer: 'Jane Smith',
    initials: 'JS',
    total: 4999,
    status: 'Shipped',
    items: [
      { name: 'Smart Watch', qty: 1, price: 4999 }
    ]
  },
  {
    orderId: 'ORD-003',
    customer: 'John Doe',
    initials: 'JD',
    total: 999,
    status: 'Processing',
    items: [
      { name: 'Men\'s Casual Shirt', qty: 1, price: 999 }
    ]
  }
];

const dummyNegotiations = [
  {
    productName: 'Wireless Headphones',
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    productSku: 'PROD001',
    basePrice: 2999,
    minAcceptablePrice: 2499,
    currentOffer: 2699,
    customerName: 'John Doe',
    customerInitials: 'JD',
    status: 'active',
    messages: [
      { sender: 'user', content: 'Hi, can I get this for 2500?', offer: 2500 },
      { sender: 'bot', content: 'Thanks for your offer! I can do 2700.', offer: 2700 },
      { sender: 'user', content: 'How about 2699?', offer: 2699 }
    ],
    roundsTotal: 3,
    roundsUsed: 2,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  {
    productName: 'Men\'s Casual Shirt',
    productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    productSku: 'PROD003',
    basePrice: 999,
    minAcceptablePrice: 799,
    currentOffer: 850,
    customerName: 'Jane Smith',
    customerInitials: 'JS',
    status: 'accepted',
    messages: [
      { sender: 'user', content: 'Is 800 possible?', offer: 800 },
      { sender: 'bot', content: 'Sure! 850 is the best I can do.', offer: 850 },
      { sender: 'user', content: 'Okay, accepted!', offer: 850 }
    ],
    roundsTotal: 3,
    roundsUsed: 3
  }
];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');

    console.log('🗑️ Clearing existing data...');
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Negotiation.deleteMany({});
    await Customer.deleteMany({});

    console.log('🌱 Seeding stores...');
    const stores = await Store.create(dummyStores);
    console.log(`✅ Created ${stores.length} stores`);

    console.log('🌱 Seeding products...');
    const products = await Product.create(dummyProducts);
    console.log(`✅ Created ${products.length} products`);

    console.log('🌱 Seeding customers...');
    const customers = await Customer.create(dummyCustomers);
    console.log(`✅ Created ${customers.length} customers`);

    console.log('🌱 Seeding orders...');
    const orders = await Order.create(dummyOrders);
    console.log(`✅ Created ${orders.length} orders`);

    console.log('🌱 Seeding negotiations...');
    const negotiations = await Negotiation.create(dummyNegotiations);
    console.log(`✅ Created ${negotiations.length} negotiations`);

    console.log('🌱 Seeding test users...');
    const users = await User.create([
      {
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'test123',
        role: 'customer'
      },
      {
        name: 'Test Retailer',
        email: 'retailer@test.com',
        password: 'test123',
        role: 'retailer',
        retailerCategory: 'Electronics'
      }
    ]);
    console.log(`✅ Created ${users.length} test users`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test credentials:');
    console.log('   Customer: customer@test.com / test123');
    console.log('   Retailer: retailer@test.com / test123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
