const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./server/config/db');
const errorHandler = require('./server/middleware/errorHandler');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
const rawOrigins = [
    process.env.CLIENT_URL,
    'https://leave-sync-f2em.vercel.app',
    'https://leavesync.vercel.app',
    'http://localhost:5173'
].filter(Boolean);

// Normalize origins: Ensure protocol exists and remove trailing slashes
const allowedOrigins = rawOrigins.map(url => {
    let normalized = url.trim().replace(/\/$/, '');
    if (!normalized.startsWith('http')) {
        normalized = `https://${normalized}`;
    }
    return normalized;
});

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const normalizedOrigin = origin.trim().replace(/\/$/, '');

        const isAllowed = allowedOrigins.includes(normalizedOrigin) ||
            (process.env.NODE_ENV === 'development' && /^http:\/\/localhost:\d+$/.test(normalizedOrigin)) ||
            (normalizedOrigin.endsWith('.vercel.app'));

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`CORS Blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./server/routes/authRoutes'));
app.use('/api/users', require('./server/routes/userRoutes'));
app.use('/api/leaves', require('./server/routes/leaveRoutes'));
app.use('/api/reimbursements', require('./server/routes/reimbursementRoutes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 API: http://localhost:${PORT}/api\n`);
    });
}

module.exports = app;
