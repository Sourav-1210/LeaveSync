const express = require('express');
const router = express.Router();
const {
    applyReimbursement,
    getReimbursements,
    approveReimbursement,
    rejectReimbursement,
    getReimbursementStats,
} = require('../controllers/reimbursementController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.post('/', roleMiddleware('employee'), applyReimbursement);
router.get('/', getReimbursements);
router.get('/stats', getReimbursementStats);

router.patch('/:id/approve', roleMiddleware('manager', 'admin'), approveReimbursement);
router.patch('/:id/reject', roleMiddleware('manager', 'admin'), rejectReimbursement);

module.exports = router;
