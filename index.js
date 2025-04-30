const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.log('MongoDB connection error ❌:', err));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set public folder for CSS, JS, images
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON and form data
app.use(express.json()); // To parse JSON payloads
app.use(express.urlencoded({ extended: true })); // To parse form data (application/x-www-form-urlencoded)

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'yoursecretkey',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Import routers
const userRouter = require('./Routers/userRouter');
app.use('/', userRouter);

const locationRoutes = require('./Routers/locationRouter');
app.use(locationRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} 🚀`);
});
