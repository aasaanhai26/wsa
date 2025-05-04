const User = require('../Models/userModel');
const Location = require('../Models/locationModel');
const bcryptjs = require('bcryptjs');
const Settings = require('../Models/settingModel');
const EmergencyContact = require('../Models/EmergencyContactDetailsModel');

const nodemailer = require('nodemailer');

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
        // Fetching Location
        const location = await Location.findOne({ userId: user._id }).sort({ timestamp: -1 }); // latest location
        const lastLocationUpdateTime = location ? location.timestamp.getTime() : null;
        // const location = await Location.findOne({ userId: user._id }); // latest location
        console.log('latiture, lan', location.latitude, location.longitude);

        // fetching the setting data
        const setting = await Settings.findOne({ userId: user._id });
        const EmergencyDetails = await EmergencyContact.find({ userId: user._id });
        if (user) {
            res.render('dashboard', {
                user,
                location,
                lastLocationUpdateTime,
                setting,
                EmergencyDetails
            });
        }
        else {
            return res.redirect('/login');
        }
    } catch (error) {
        console.log('error while loading the dashboard page', error.message);
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;
        const profileImage = req.file ? req.file.filename : null;

        const updateFields = {
            name,
            email,
            phone,
            address,
        };

        if (profileImage) {
            updateFields.profileImage = profileImage;
        }

        const savedData = await User.findByIdAndUpdate(
            req.session.user,
            updateFields,
            { new: true }
        );

        if (savedData) {
            res.json({
                success: true,
                message: 'Profile updated successfully!',
                profileImage: '/uploads/' + savedData.profileImage,
                name: savedData.name
            });
        } else {
            res.json({ success: false, message: 'Failed to update profile.' });
        }

    } catch (error) {
        // console.error('Error while updating profile:', error.message);
        // res.status(500).json({ error: 'An error occurred while updating the profile.' });
    }
};

// updateSettings

const updateSettings = async (req, res) => {
    try {
        const userId = req.session.user;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. User not logged in." });
        }

        console.log('User ID for settings update:', userId);

        const {
            // emergencyContact,
            alertMode,
            // safeZone,
            liveLocation,
            // notifyAlerts
        } = req.body;

        await Settings.findOneAndUpdate(
            { userId },
            {
                // emergencyContact,
                alertMode,
                // safeZone: parseInt(safeZone),
                liveLocation: !!liveLocation,
                // notifyAlerts: !!notifyAlerts
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({ message: "Settings saved successfully." });

    } catch (error) {
        console.error("Error while updating settings:", error.message);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};

// saveEmergencyContact
const saveEmergencyContact = async (req, res) => {
    try {
        const { emergencyContact, emergencyContactName, emergencyContactEmail, relation } = req.body;
        const userId = req.session.user; // Adjust depending on your session setup

        // Validate input
        if (!emergencyContact || !emergencyContactName || !relation) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        const savedData = await EmergencyContact.create({
            userId,
            contactNumber: emergencyContact,
            contactName: emergencyContactName,
            relation,
            emergencyContactEmail
        });
        console.log('savedData', savedData);
        if (savedData) {
            res.json({
                success: true,
                message: 'Emergency contact saved successfully!',
                contactNumber: savedData.contactNumber,
                contactName: savedData.contactName,
                relation: savedData.relation
            });
        }

        // res.status(200).json({ message: 'Emergency contact saved successfully' });
    } catch (error) {
        console.error('Error saving emergency contact:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// deleteEmergencyContact
const deleteEmergencyContact = async (req, res) => {
    try {
        const contactId = req.params.id;
        const userId = req.session.user;

        const deleted = await EmergencyContact.findOneAndDelete({
            _id: contactId,
            userId
        });

        if (!deleted) {
            return res.status(404).json({ error: 'Contact not found or unauthorized' });
        }

        res.status(200).json({ message: 'Emergency contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// triggerAlert 
const triggerAlert = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch all emergency contacts for this user
        const emergencyContacts = await EmergencyContact.find({ userId }).select('emergencyContactEmail');
        console.log("emergencyContacts", emergencyContacts);

        if (!emergencyContacts.length) {
            return res.status(400).json({ message: 'No emergency contacts found' });
        }

        // Extract email addresses
        const emailList = emergencyContacts.map(contact => contact.emergencyContactEmail).filter(Boolean); // filter out undefined/null
        console.log("emailList", emailList);

        if (!emailList.length) {
            return res.status(400).json({ message: 'No valid email addresses found in emergency contacts' });
        }
        const location = await Location.findOne({ userId: user._id }); // latest location
        console.log('latiture, lan', location.latitude, location.longitude);


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Loop through each email and send individual emails
        for (let i = 0; i < emailList.length; i++) {
            const email = emailList[i];

            // Sending email to each recipient
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email, // Send to one email at a time
                subject: '🚨 Emergency Alert!',
                html: `
                    <p><strong>${user.name}</strong> has triggered an <span style="color: red;"><strong>EMERGENCY ALERT</strong></span>!</p>
                    <p>Please try to contact them immediately.</p>
                    <p>Sent via Emergency Response System</p>
                    <p>Location: <a href="https://maps.google.com/?q=${location.latitude},${location.longitude}">View on map</a></p>
                `,
            });

            console.log(`Email sent successfully to ${email}`);
        }

        return res.status(200).json({ message: 'Emergency alert sent to all contacts.' });

    } catch (error) {
        console.error('Error while triggering alert:', error.message);
        res.status(500).json({ message: 'Internal server error while triggering alert.' });
    }
};



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
    updateProfile,
    updateSettings,
    saveEmergencyContact,
    deleteEmergencyContact,
    triggerAlert,
    logout
}