const User = require('../Models/userModel');
const Location = require('../Models/locationModel');
const bcryptjs = require('bcryptjs');
const landingPage = async (req, res) => {
    res.render('landingPage');
}
const loginPage = async (req, res) => {
    res.render('login');
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists and the password is correct
        if (user && await bcryptjs.compare(password, user.password)) {
            // Setting session 
            req.session.user = user._id;
            // Redirect to the dashboard page
            return res.redirect('/dashboard');
        } else {
            // Return to the login page with an error message
            return res.render('login', { message: 'Invalid email or password' });
        }
    } catch (error) {
        console.log('error while loading the login page', error.message);
    }
};
const registerPage = async (req, res) => {
    res.render('signUp');
}
const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if the user already exists (use findOne instead of find)
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { phone: phone },
            ]
        });

        if (existingUser) {
            return res.render('login', { message: 'User already exists' }); // Return to prevent further code execution
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create a new user
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
        });

        // Save the user to the database
        const userRegister = await user.save();

        if (userRegister) {
            return res.redirect('/login'); // Redirect to the login page after successful registration
        } else {
            return res.render('register', { message: 'Something went wrong!' }); // Return to stop further execution
        }
    } catch (error) {
        console.log('error while loading the register page', error.message);
        return res.render('register', { message: 'An error occurred. Please try again later.' });
    }
};







const dashboardPage = async (req, res) => {
    try {
        const user = await User.findById(req.session.user);
        console.log('user', user, user._id)
        const location = await Location.findOne({ userId: user._id }).sort({ timestamp: -1 }); // latest location

        const lastLocationUpdateTime = location ? location.timestamp.getTime() : null;
        
        if (user) {
            res.render('dashboard', { user, location, lastLocationUpdateTime });
        }
        else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.log('error while loading the dashboard page', error.message);
    }
}








const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/login');
    } catch (error) {
        console.log('error while loading the logout page', error.message);
    }
}
module.exports = {
    landingPage,
    loginPage,
    register,
    login,
    registerPage,
    dashboardPage,
    logout
}