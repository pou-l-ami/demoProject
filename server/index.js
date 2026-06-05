import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoute from './routes/users.js';
import eventRoute from './routes/events.js';
import reviewRoute from './routes/reviews.js';
import bookingRoute from './routes/bookings.js';
import timeslotRoute from './routes/timeslots.js';
import authRoute from './routes/auth.js';
import productsRoute from './routes/products.js';
import cartRoute from './routes/cart.js';
import ordersRoute from "./routes/orders.js";
import paymentsRoute from "./routes/payments.js";
import recommendationRoute from "./routes/recommendationRoutes.js";
import User from "./models/User.js";
import Product from "./models/Product.js";
dotenv.config();

const app = express();
const portNo = process.env.PORTNO || 8000;

// 🔹 ES-module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
const corsOptions = {
  origin: true,
  credentials: true,
};

// connect DB
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Mongodb Database Connected Succesfully');
    
    // Safeguard: Drop unique constraint index on password if it exists in DB
    try {
      await mongoose.connection.collections['users'].dropIndex('password_1');
      console.log('Successfully dropped old unique password database index.');
    } catch (indexErr) {
      // index did not exist or already dropped, safe to ignore!
    }

    // Auto-seed recommended products into MongoDB catalog
    try {
      const count = await Product.countDocuments();
      if (count < 10) {
        console.log('Pre-seeding recommended products catalog into MongoDB...');
        const productsToSeed = [
          { name: "Premium Banquet Chair", category: "Decoration Products", price: 150, type: "rent", photo: "/product-images/banquet-chair.png", stock: 100, description: "Comfortable banquet chair with covers" },
          { name: "Luxury Dining Table", category: "Decoration Products", price: 1200, type: "rent", photo: "/product-images/dining-table.png", stock: 50, description: "Premium wooden dining table" },
          { name: "Chafing Serving Dishes", category: "Food & Catering", price: 500, type: "rent", photo: "/product-images/chafing-dishes.png", stock: 40, description: "Stainless steel chafing dishes" },
          { name: "LED Dance Floor Lights", category: "Decoration Products", price: 3500, type: "rent", photo: "/product-images/led-lights.png", stock: 20, description: "RBG LED dance floor party lights" },
          { name: "Crystal Centerpieces", category: "Decoration Products", price: 800, type: "rent", photo: "/product-images/centerpieces.png", stock: 30, description: "Elegant crystal table centerpieces" },
          { name: "DJ Lighting Sound Rig", category: "Decoration Products", price: 8500, type: "rent", photo: "/product-images/dj-light.png", stock: 5, description: "Professional lighting & sound system" },
          { name: "Flower Garland Strings", category: "Decoration Products", price: 1200, type: "buy", photo: "/product-images/flower-garlands.png", stock: 150, description: "Vibrant flower garlands for entry gate" },
          { name: "Stage Decorative Pillars", category: "Decoration Products", price: 3000, type: "rent", photo: "/product-images/pillars.png", stock: 15, description: "Elegantly carved decorative stage pillars" },
          { name: "Drink Beverage Cooler", category: "Food & Catering", price: 1500, type: "rent", photo: "/product-images/drink-cooler.png", stock: 10, description: "Electric walk-in cooler for event beverages" },
          { name: "Stage Backdrop Frame", category: "Decoration Products", price: 6000, type: "rent", photo: "/product-images/stage-backdrop.png", stock: 8, description: "Heavy-duty steel backdrop frame for staging" }
        ];
        await Product.insertMany(productsToSeed);
        console.log('Successfully pre-seeded products catalog!');
      }
    } catch (seedErr) {
      console.error('Failed to pre-seed products catalog:', seedErr.message);
    }
  } catch (error) {
    console.log('Mongodb Database Connection Failed');
  }
};

// middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// ✅ API routes
app.use('/api/products', productsRoute);
app.use('/api/cart', cartRoute);
app.use("/api/orders", ordersRoute);
// ✅ serve product images from server/product-images
app.use(
  '/product-images',
  express.static(path.join(__dirname, 'product-images'))
);

// test route
app.get('/', (req, res) => {
  res.send('Api working succesfully');
});

// v1 routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/events', eventRoute);
app.use('/api/v1/review', reviewRoute);
app.use('/api/v1/booking', bookingRoute);
app.use('/api/v1/timeslot', timeslotRoute);
app.use("/api/v1/payments", paymentsRoute);
app.use('/api/v1/recommendation', recommendationRoute);
// start server
app.listen(portNo, () => {
  connect();
  console.log('Server listening on port No ' + portNo);
});
