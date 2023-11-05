const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/userModel');
const SwapOrder = require('../models/swapOrderModel');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users)
    } catch (err) {
        console.error(`Error reading users: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const user = await User.findById(id);
        res.status(200).json(user)
    } catch (err) {
        console.error(`User not found: ${err.message}`);
        res.status(404).json({ error: 'Internal server error' });
    }
});

// Create a new user
router.post('/', [
        check('firstName').notEmpty().escape().withMessage('First name cannot be empty'), 
        check('lastName').notEmpty().escape().withMessage('Last name cannot be empty'), 
        check('email').isEmail().escape().withMessage('Email required'),
    ], async (req, res) => {

        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({errors: errors.array()})
            }else{
                const {firstName, lastName, email} = req.body
                const newUser = await User.create({ firstName, lastName, email });
                res.status(200).json(newUser)
            }
        } catch (err) {
            console.error(`Error creating a new user: ${err.message}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

// Update a user by ID
router.put('/:id', [
        check('firstName').optional().notEmpty().escape().withMessage('First name cannot be empty'),
        check('lastName').optional().notEmpty().escape().withMessage('Last name cannot be empty'),
        check('email').optional().isEmail().escape().withMessage('Email required'),
    ], async (req, res) => {

        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }else{
                const id = req.params.id
                const updatedUserData = req.body;
                const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true });
                res.status(200).json(updatedUser);
            }
        } catch (err) {
            console.error(`Error updating user: ${err.message}`);
            res.status(404).json({ error: 'Internal server error' });
        }
    }
);

// Delete all users
router.delete('/', async (req, res) => {
    try {
        const deletedUsers = await User.deleteMany({});
        const deletedSwapOrders = await SwapOrder.deleteMany({});
        res.status(200).json({ message: 'All users deleted' , usersDeleted: deletedUsers.deletedCount, deletedSwapOrders: deletedSwapOrders.deletedCount}); 
    } catch (err) {
        console.error(`Error deleting users: ${err.message}`);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const deletedUser = await User.findOneAndRemove({_id: id});
        const deletedSwapOrders = await SwapOrder.deleteMany({ users: deletedUser._id });
        res.status(200).json([deletedUser, deletedSwapOrders]); 
    } catch (err) {
        console.error(`Error deleting user: ${err.message}`);
        res.status(404).json({ error: 'Internal server error' });
    }
});

module.exports = router;
