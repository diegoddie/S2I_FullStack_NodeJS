const express = require('express');
const app = express();
app.use(express.json());

// Import API route handlers
const userAPI = require('../api/userAPI');
const productAPI = require('../api/productAPI');
const swapOrderAPI = require('../api/swapOrderAPI');

// Define the routes for different API endpoints
app.use('/users', userAPI);
app.use('/products', productAPI);
app.use('/swap-orders', swapOrderAPI);

module.exports = app;