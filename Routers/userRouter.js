const express = require('express');
const router = express.Router();

router.use(express.urlencoded({ extended: true })); // To parse form data (application/x-www-form-urlencoded)

const userController = require('../Controllers/userController');

router.get('/', userController.landingPage);
router.get('/login', userController.loginPage);
router.post('/login', userController.login);
router.get('/register', userController.registerPage);
router.post('/registerll', userController.register);



router.get('/logout', userController.logout);
router.get('/dashboard', userController.dashboardPage);

module.exports = router;