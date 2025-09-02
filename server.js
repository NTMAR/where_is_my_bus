const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet'); // Import Helmet
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware'); // Import error handlers

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// --- Security Middleware ---
app.use(helmet()); // Set security headers

// --- CORRECTED CORS Configuration ---
// List of allowed origins for development
const allowedOrigins = [
  'whereismybuses.netlify.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman, mobile apps) or from the allowed list
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/buses', require('./routes/busRoutes'));

// --- Error Handling Middleware ---
app.use(notFound); // Handle 404s
app.use(errorHandler); // Central error handler

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});