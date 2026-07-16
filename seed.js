const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
    department: String,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const DEMO_USERS = [
    { name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin', department: 'Management' },
    { name: 'Manager User', email: 'manager@demo.com', password: 'password123', role: 'manager', department: 'Engineering' },
    { name: 'Employee User', email: 'employee@demo.com', password: 'password123', role: 'employee', department: 'Software Intern' },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        await User.deleteMany({ email: { $in: DEMO_USERS.map(u => u.email) } });
        console.log('🧹 Cleaned up existing demo users');

        for (const u of DEMO_USERS) {
            await User.create(u);
            console.log(`✅ Created: ${u.role.toUpperCase()} — ${u.email}`);
        }

        console.log('\n🎉 Seed complete! Demo credentials:');
        console.log('   Admin:    admin@demo.com    / password123');
        console.log('   Manager:  manager@demo.com  / password123');
        console.log('   Employee: employee@demo.com / password123\n');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
