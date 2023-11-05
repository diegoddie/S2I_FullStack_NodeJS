const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Product = require('../models/productModel');
const SwapOrder = require('../models/swapOrderModel');

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products)
    } catch (err) {
        console.error(`Error finding products: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a product by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const product = await Product.findById(id);
        res.status(200).json(product)
    } catch (err) {
        console.error(`Product not found: ${err.message}`);
        res.status(404).json({ error: 'Internal server error' });
    }
});

// Create a new product
router.post('/', [
        check('name').notEmpty().escape().withMessage('Product name cannot be empty'), 
        check('image')
            .notEmpty()
            .isArray({min:1})
            .withMessage('Image field must be an array with min. 1 element'),
        check('image.*')
            .isURL({protocols: ['http','https','ftp']})
            .withMessage('not a valid URL'),
        ], async (req, res) => {

        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({errors: errors.array()})
            }else{
                const {name, image} = req.body
                const newProduct = await Product.create({ name, image })
                res.status(200).json(newProduct)
            }
        } catch (err) {
            console.error(`Error creating a new product: ${err.message}`);
            res.status(400).json({ error: 'Internal server error' });
        }
    }
);

// Update a product by ID
router.put('/:id', [
        check('name').optional().notEmpty().escape().withMessage('Product name cannot be empty'),
        check('image')
            .optional()
            .notEmpty()
            .isArray({min:1})
            .withMessage('Image field must be an array with min. 1 element'),
        check('image.*')
            .isURL({protocols: ['http','https','ftp']})
            .withMessage('not a valid URL'),
        ], async (req, res) => {
            
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({errors: errors.array()})
            }else{
                const id = req.params.id
                const updatedProductData = req.body;
                const updatedProduct = await Product.findByIdAndUpdate(id, updatedProductData, { new: true });
                res.status(200).json(updatedProduct);
            }
        } catch (err) {
            console.error(`Error updating product: ${err.message}`);
            res.status(404).json({ error: 'Internal server error' });
        }
    }
);

// Delete all products
router.delete('/', async (req, res) => {
    try {
        const deletedProducts = await Product.deleteMany({});
        const deletedSwapOrders = await SwapOrder.deleteMany({});
        res.status(200).json({ message: 'All products deleted' , deletedProducts: deletedProducts.deletedCount, deletedSwapOrders: deletedSwapOrders.deletedCount});
    } catch (err) {
        console.error(`Error deleting products: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a product by ID
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const deletedProduct = await Product.findOneAndRemove({_id: id});
        const deletedSwapOrders = await SwapOrder.deleteMany({ products: deletedProduct._id });
        res.status(200).json([deletedProduct, deletedSwapOrders]); 
    } catch (err) {
        console.error(`Error deleting product: ${err.message}`);
        res.status(404).json({ error: 'Internal server error' });
    }
});

module.exports = router;