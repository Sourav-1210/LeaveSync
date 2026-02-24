const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, role, department, teamName, employeeCount } = req.body;

        // Check for existing user
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Prevent direct admin registration (only first user or existing admin can create admins)
        const assignedRole = role === 'admin' ? 'employee' : (role || 'employee');

        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
            department: department || 'General',
            teamName,
            employeeCount,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                teamName: user.teamName,
                employeeCount: user.employeeCount,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                teamName: user.teamName,
                employeeCount: user.employeeCount,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error) {
        next(error);
    }
};

// @desc    Update current user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, department, phone, bio, teamName, employeeCount } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (name) user.name = name.trim();
        if (department) user.department = department.trim();
        if (phone !== undefined) user.phone = phone.trim();
        if (bio !== undefined) user.bio = bio.trim();
        if (teamName !== undefined) user.teamName = teamName.trim();
        if (employeeCount !== undefined) user.employeeCount = employeeCount;

        await user.save();

        const updatedUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            teamName: user.teamName,
            employeeCount: user.employeeCount,
            isActive: user.isActive,
            phone: user.phone || '',
            bio: user.bio || '',
            createdAt: user.createdAt,
        };

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getMe, updateProfile };
