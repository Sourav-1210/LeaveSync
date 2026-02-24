const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        leaveType: {
            type: String,
            enum: ['sick', 'casual', 'annual', 'maternity', 'paternity', 'unpaid'],
            required: [true, 'Leave type is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        totalDays: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: [true, 'Reason is required'],
            minlength: [10, 'Reason must be at least 10 characters'],
            maxlength: [500, 'Reason must not exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        approverComment: {
            type: String,
            default: '',
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Validate date range before saving
leaveSchema.pre('save', async function () {
    if (this.endDate < this.startDate) {
        throw new Error('End date cannot be before start date');
    }
});

module.exports = mongoose.model('Leave', leaveSchema);
