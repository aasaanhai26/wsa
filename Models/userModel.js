const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,

    },
    profileImage: {
        type: String,
        default: 'logo.png'
    }
    
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;