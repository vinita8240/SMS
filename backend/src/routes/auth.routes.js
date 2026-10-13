const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User Login (Admin, Teacher, Parent, Student)
 *     tags: [Authentication]
 */
router.post('/login', authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 */
router.post('/refresh', authController.refreshToken);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get Current User Profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change User Password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout session
 *     tags: [Authentication]
 */
router.post('/logout', authController.logout);

module.exports = router;
