const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
    try {
        const { role, isActive, search } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(filter).sort({ createdAt: -1 });
        res.json({ count: users.length, users });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Admin
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['admin', 'manager', 'employee'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Role updated successfully', user });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/status
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user stats for admin
// @route   GET /api/users/stats
// @access  Admin
const getUserStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const byRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);
        res.json({ totalUsers, activeUsers, byRole });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllUsers, updateUserRole, toggleUserStatus, getUserById, getUserStats };
