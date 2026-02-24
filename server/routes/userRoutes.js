const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    updateUserRole,
    toggleUserStatus,
    getUserById,
    getUserStats,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/stats', roleMiddleware('admin'), getUserStats);
router.get('/', roleMiddleware('admin', 'manager'), getAllUsers);
router.get('/:id', roleMiddleware('admin'), getUserById);
router.patch('/:id/role', roleMiddleware('admin'), updateUserRole);
router.patch('/:id/status', roleMiddleware('admin'), toggleUserStatus);

module.exports = router;
