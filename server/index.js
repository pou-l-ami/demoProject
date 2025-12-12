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
// start server
app.listen(portNo, () => {
  connect();
  console.log('Server listening on port No ' + portNo);
});
