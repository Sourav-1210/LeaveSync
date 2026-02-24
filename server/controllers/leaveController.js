const Leave = require('../models/Leave');
const User = require('../models/User');

// Helper to calculate working days
const calcWorkingDays = (start, end) => {
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count || 1;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Employee
const applyLeave = async (req, res, next) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        if (!leaveType || !startDate || !endDate || !reason) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            return res.status(400).json({ message: 'End date cannot be before start date' });
        }

        // Check for overlapping leaves
        const overlap = await Leave.findOne({
            employeeId: req.user._id,
            status: { $ne: 'rejected' },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
            ],
        });

        if (overlap) {
            return res.status(400).json({ message: 'You have an overlapping leave request in this date range' });
        }

        const totalDays = calcWorkingDays(start, end);

        const leave = await Leave.create({
            employeeId: req.user._id,
            leaveType,
            startDate: start,
            endDate: end,
            totalDays,
            reason,
        });

        await leave.populate('employeeId', 'name email department');

        res.status(201).json({ message: 'Leave application submitted', leave });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all leaves (admin/manager) or own leaves (employee)
// @route   GET /api/leaves
// @access  Private
const getLeaves = async (req, res, next) => {
    try {
        const { status, leaveType, employeeId, page = 1, limit = 20 } = req.query;
        const filter = {};

        // Employees can only see their own leaves
        if (req.user.role === 'employee') {
            filter.employeeId = req.user._id;
        } else if (employeeId) {
            filter.employeeId = employeeId;
        }

        if (status) filter.status = status;
        if (leaveType) filter.leaveType = leaveType;

        const skip = (page - 1) * limit;

        const [leaves, total] = await Promise.all([
            Leave.find(filter)
                .populate('employeeId', 'name email department role')
                .populate('approvedBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Leave.countDocuments(filter),
        ]);

        res.json({
            leaves,
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

// @desc    Get single leave
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveById = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id)
            .populate('employeeId', 'name email department')
            .populate('approvedBy', 'name email');

        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        // Employee can only see their own
        if (
            req.user.role === 'employee' &&
            leave.employeeId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ leave });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve leave
// @route   PATCH /api/leaves/:id/approve
// @access  Manager, Admin
const approveLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        if (leave.status !== 'pending') {
            return res.status(400).json({ message: `Leave already ${leave.status}` });
        }

        leave.status = 'approved';
        leave.approvedBy = req.user._id;
        leave.approverComment = req.body.comment || '';
        leave.reviewedAt = new Date();
        await leave.save();

        await leave.populate('employeeId', 'name email department');
        await leave.populate('approvedBy', 'name email');

        res.json({ message: 'Leave approved successfully', leave });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject leave
// @route   PATCH /api/leaves/:id/reject
// @access  Manager, Admin
const rejectLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) return res.status(404).json({ message: 'Leave not found' });
        if (leave.status !== 'pending') {
            return res.status(400).json({ message: `Leave already ${leave.status}` });
        }

        leave.status = 'rejected';
        leave.approvedBy = req.user._id;
        leave.approverComment = req.body.comment || '';
        leave.reviewedAt = new Date();
        await leave.save();

        await leave.populate('employeeId', 'name email department');
        await leave.populate('approvedBy', 'name email');

        res.json({ message: 'Leave rejected', leave });
    } catch (error) {
        next(error);
    }
};

// @desc    Get leave analytics/stats
// @route   GET /api/leaves/stats
// @access  Manager, Admin
const getLeaveStats = async (req, res, next) => {
    try {
        const filter = req.user.role === 'employee' ? { employeeId: req.user._id } : {};

        const [byStatus, byType, monthly] = await Promise.all([
            Leave.aggregate([
                { $match: filter },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            Leave.aggregate([
                { $match: filter },
                { $group: { _id: '$leaveType', count: { $sum: 1 }, totalDays: { $sum: '$totalDays' } } },
            ]),
            Leave.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } },
                { $limit: 12 },
            ]),
        ]);

        res.json({ byStatus, byType, monthly });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete leave (employee - only pending)
// @route   DELETE /api/leaves/:id
// @access  Employee
const deleteLeave = async (req, res, next) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) return res.status(404).json({ message: 'Leave not found' });

        if (
            req.user.role === 'employee' &&
            leave.employeeId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending leaves can be deleted' });
        }

        await leave.deleteOne();
        res.json({ message: 'Leave application deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = { applyLeave, getLeaves, getLeaveById, approveLeave, rejectLeave, getLeaveStats, deleteLeave };
