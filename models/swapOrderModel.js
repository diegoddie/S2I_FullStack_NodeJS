const mongoose = require('mongoose');

const swapOrderSchema = new mongoose.Schema({
    // Define the products field as an array of ObjectIds, referencing the 'Product' model, and it's required
    products: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required: true,
    }],
    // Define the users field as an array of ObjectIds, referencing the 'User' model, and it's required
    users: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }],
    // Define the insertionDate field as a Date with a default value of the current date and time
    insertionDate: { 
        type: Date, 
        default: Date.now 
    },
});

const SwapOrder = mongoose.model('SwapOrder', swapOrderSchema);

module.exports = SwapOrder;