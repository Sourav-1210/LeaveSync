const Reimbursement = require('../models/Reimbursement');
const User = require('../models/User');

// @desc    Apply for reimbursement
// @route   POST /api/reimbursements
// @access  Employee
const applyReimbursement = async (req, res, next) => {
    try {
        const { title, amount, category, description, expenseDate, receiptUrl } = req.body;

        if (!title || !amount || !category || !description || !expenseDate) {
            return res.status(400).json({ message: 'All fields except receipt PDF are required' });
        }

        const reimbursement = await Reimbursement.create({
            employeeId: req.user._id,
            title,
            amount,
            category,
            description,
            expenseDate,
            receiptUrl,
        });

        await reimbursement.populate('employeeId', 'name email department');

        res.status(201).json({ message: 'Reimbursement request submitted', reimbursement });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reimbursements (role-based)
// @route   GET /api/reimbursements
// @access  Private
const getReimbursements = async (req, res, next) => {
    try {
        const { status, category, employeeId, page = 1, limit = 20 } = req.query;
        const filter = {};

        // Employees can only see their own reimbursements
        if (req.user.role === 'employee') {
            filter.employeeId = req.user._id;
        } else if (employeeId) {
            filter.employeeId = employeeId;
        }

        if (status) filter.status = status;
        if (category) filter.category = category;

        const skip = (page - 1) * limit;

        const [reimbursements, total] = await Promise.all([
            Reimbursement.find(filter)
                .populate('employeeId', 'name email department role')
                .populate('approvedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Reimbursement.countDocuments(filter),
        ]);

        res.json({
            reimbursements,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve reimbursement
// @route   PATCH /api/reimbursements/:id/approve
// @access  Manager, Admin
const approveReimbursement = async (req, res, next) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id);

        if (!reimbursement) return res.status(404).json({ message: 'Reimbursement not found' });
        if (reimbursement.status !== 'pending') {
            return res.status(400).json({ message: `Reimbursement already ${reimbursement.status}` });
        }

        reimbursement.status = 'approved';
        reimbursement.approvedBy = req.user._id;
        reimbursement.approverComment = req.body.comment || '';
        reimbursement.reviewedAt = new Date();
        await reimbursement.save();

        await reimbursement.populate('employeeId', 'name email department');
        await reimbursement.populate('approvedBy', 'name email');

        res.json({ message: 'Reimbursement approved successfully', reimbursement });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject reimbursement
// @route   PATCH /api/reimbursements/:id/reject
// @access  Manager, Admin
const rejectReimbursement = async (req, res, next) => {
    try {
        const reimbursement = await Reimbursement.findById(req.params.id);

        if (!reimbursement) return res.status(404).json({ message: 'Reimbursement not found' });
        if (reimbursement.status !== 'pending') {
            return res.status(400).json({ message: `Reimbursement already ${reimbursement.status}` });
        }

        reimbursement.status = 'rejected';
        reimbursement.approvedBy = req.user._id;
        reimbursement.approverComment = req.body.comment || '';
        reimbursement.reviewedAt = new Date();
        await reimbursement.save();

        await reimbursement.populate('employeeId', 'name email department');
        await reimbursement.populate('approvedBy', 'name email');

        res.json({ message: 'Reimbursement rejected', reimbursement });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reimbursement analytics
// @route   GET /api/reimbursements/stats
// @access  Private
const getReimbursementStats = async (req, res, next) => {
    try {
        const filter = req.user.role === 'employee' ? { employeeId: req.user._id } : {};

        const [byStatus, byCategory, monthly] = await Promise.all([
            Reimbursement.aggregate([
                { $match: filter },
                { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
            ]),
            Reimbursement.aggregate([
                { $match: filter },
                { $group: { _id: '$category', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
            ]),
            Reimbursement.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
                { $limit: 12 },
            ]),
        ]);

        res.json({ byStatus, byCategory, monthly });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyReimbursement,
    getReimbursements,
    approveReimbursement,
    rejectReimbursement,
    getReimbursementStats,
};
