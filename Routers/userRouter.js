const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const userController = require('../Controllers/userController');
const { isLoggedIn, isLoggedOut } = require('../middleware/authMiddle');

// Middleware to parse URL-encoded form data
router.use(express.urlencoded({ extended: true }));

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Make sure this path exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpg, jpeg, png, gif)'));
    }
  }
});

// Routes
router.get('/', isLoggedOut, userController.landingPage);
router.get('/login', isLoggedOut, userController.loginPage);
router.post('/login', userController.login);
router.get('/register', isLoggedOut, userController.registerPage);
router.post('/registerll', userController.register);

router.get('/logout', userController.logout);
router.get('/dashboard', isLoggedIn, userController.dashboardPage);
// Setting Update
router.post('/update-settings', userController.updateSettings);
router.post('/save-emergency-contact', userController.saveEmergencyContact);
router.delete('/delete-emergency-contact/:id', userController.deleteEmergencyContact);
router.post('/trigger-alert', userController.triggerAlert);


// Profile Update with Image Upload (use 'profileImage' field from the frontend)
router.post('/profile/update', upload.single('profileImage'), userController.updateProfile);

module.exports = router;
