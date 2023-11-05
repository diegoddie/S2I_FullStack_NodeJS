const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const SwapOrder = require('../models/swapOrderModel');
const { hasDuplicates } = require('../utils/utils');

// Get all swap orders
router.get('/', async (req, res) => {
    try {
        const swapOrders = await SwapOrder.find().populate('products users');
        res.status(200).json(swapOrders)
    } catch (err) {
        console.error(`Error finding swap orders: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a swap order by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const swapOrder = await SwapOrder.findById(id).populate('products users');
        res.status(200).json(swapOrder)
    } catch (err) {
        console.error(`Swap Order not found: ${err.message}`);
        res.status(404).json({ error: 'Internal server error' });
    }
});

// Get swap orders by user ID
router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const swapOrders = await SwapOrder.find({ users: userId }).populate('products users');
        res.status(200).json(swapOrders)
    } catch (err) {
        console.error(`Error finding swap orders by user: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get swap orders by product ID
router.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const swapOrders = await SwapOrder.find({ products: productId }).populate('products users');
        res.status(200).json(swapOrders)
    } catch (err) {
        console.error(`Error finding swap orders by product: ${err.message}`);
        res.status(404).json({ error: 'Internal server error' });
    }
});

// Create a new swap order
router.post('/', [
        check('products')
            .notEmpty()
            .isArray({min:2})
            .withMessage('At least 2 products are required')
            .custom((value)=>{
                if(hasDuplicates(value)){
                    throw new Error('Duplicate product IDs are not allowed');
                }
                return true;
            }),
        check('users')
            .notEmpty()
            .isArray({min:2, max:2})
            .withMessage('Users must contain exactly 2 valid User IDs')
            .custom((value)=>{
                if(hasDuplicates(value)){
                    throw new Error('Duplicate user IDs are not allowed');
                }
                return true;
            }),
    ], async (req, res) => {

        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({errors: errors.array()})
            }else{
                const {products, users} = req.body
                const newSwapOrder = await SwapOrder.create({ products, users });
                res.status(200).json(newSwapOrder);
            }
        } catch (err) {
            console.error(`Error creating a new swap order: ${err.message}`);
            res.status(400).json({ error: 'Internal server error' });
        }
    }
);

// Update a swap order by ID
router.put('/:id', [
        check('products')
            .optional()
            .notEmpty()
            .isArray({min:2})
            .withMessage('At least 2 products are required')
            .custom((value)=>{
                if(hasDuplicates(value)){
                    throw new Error('Duplicate product IDs are not allowed');
                }
                return true;
            }),
        check('users')
            .optional()
            .notEmpty()
            .isArray({min:2, max:2})
            .withMessage('Users must contain exactly 2 valid User IDs')
            .custom((value)=>{
                if(hasDuplicates(value)){
                    throw new Error('Duplicate user IDs are not allowed');
                }
                return true;
            }),
    ], async (req, res) => {
        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({errors: errors.array()})
            }else{
                const id = req.params.id
                const updatedSwapOrderData = req.body;
                const updatedSwapOrder = await SwapOrder.findByIdAndUpdate(id, updatedSwapOrderData, { new: true });
                res.status(200).json(updatedSwapOrder);
            }
        } catch (err) {
            console.error(`Error updating swap order: ${err.message}`);
            res.status(404).json({ error: 'Internal server error' });
        }
    }
);

// Delete all swap orders
router.delete('/', async (req, res) => {
    try {
        await SwapOrder.deleteMany({});
        res.status(200).json({ message: 'All swap orders deleted' });
    } catch (err) {
        console.error(`Error deleting swap orders: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a swap order by ID
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const deletedSwapOrder = await SwapOrder.findByIdAndRemove(id);
        res.status(200).json(deletedSwapOrder);
    } catch (err) {
        console.error(`Error deleting swap order: ${err.message}`);
        res.status(404).json({ error: 'Internal server error' });
    }
});

module.exports = router;