const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getLeaves,
    getLeaveById,
    approveLeave,
    rejectLeave,
    getLeaveStats,
    deleteLeave,
} = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/stats', getLeaveStats);
router.post('/', roleMiddleware('employee'), applyLeave);
router.get('/', getLeaves);
router.get('/:id', getLeaveById);
router.patch('/:id/approve', roleMiddleware('admin', 'manager'), approveLeave);
router.patch('/:id/reject', roleMiddleware('admin', 'manager'), rejectLeave);
router.delete('/:id', deleteLeave);

module.exports = router;
