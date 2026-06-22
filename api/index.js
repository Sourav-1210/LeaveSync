const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('../server/config/db');
const errorHandler = require('../server/middleware/errorHandler');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Allowed Origins
const rawOrigins = [
    process.env.CLIENT_URL,
    'https://leave-sync-f2em.vercel.app',
    'https://leavesync.vercel.app',
    'http://localhost:5173'
].filter(Boolean);

// Normalize origins
const allowedOrigins = rawOrigins.map(url => {
    let normalized = url.trim().replace(/\/$/, '');
    if (!normalized.startsWith('http')) {
        normalized = `https://${normalized}`;
    }
    return normalized;
});

// CORS Configuration
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.trim().replace(/\/$/, '');

        const isAllowed =
            allowedOrigins.includes(normalizedOrigin) ||
            (process.env.NODE_ENV === 'development' &&
                /^http:\/\/localhost:\d+$/.test(normalizedOrigin)) ||
            normalizedOrigin.endsWith('.vercel.app');

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`❌ CORS Blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/users', require('../server/routes/userRoutes'));
app.use('/api/leaves', require('../server/routes/leaveRoutes'));
app.use('/api/reimbursements', require('../server/routes/reimbursementRoutes'));

// Root Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'LeaveSync Backend Running 🚀'
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export App
module.exports = app;