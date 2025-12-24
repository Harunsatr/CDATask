const express = require('express');
const roles = require('../constants/roles');
const authController = require('../controllers/authController');
const propertyController = require('../controllers/propertyController');
const bookingController = require('../controllers/bookingController');
const adminController = require('../controllers/adminController');
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const rateLimiter = require('../middlewares/rateLimiter');
const { registerSchema, loginSchema, propertySchema, bookingSchema, paymentSchema } = require('../utils/validators');

const router = express.Router();

router.use(rateLimiter);

// ============ AUTH ROUTES ============
router.post('/auth/register', validateRequest(registerSchema), authController.register);
router.post('/auth/login', validateRequest(loginSchema), authController.login);
router.get('/auth/profile', authenticate, authController.profile);
router.put('/auth/profile', authenticate, authController.updateProfile);

// ============ PROPERTY ROUTES ============
router.get('/properties', propertyController.list);
router.get('/properties/featured', propertyController.featured);
router.get('/properties/:id', propertyController.getOne);
router.get('/properties/:id/availability', propertyController.checkAvailability);
router.post(
  '/properties',
  authenticate,
  authorize(roles.MERCHANT),
  validateRequest(propertySchema),
  propertyController.create,
);
router.put('/properties/:id', authenticate, authorize(roles.MERCHANT, roles.ADMIN), propertyController.update);
router.delete('/properties/:id', authenticate, authorize(roles.MERCHANT, roles.ADMIN), propertyController.remove);
router.post('/properties/:id/approve', authenticate, authorize(roles.ADMIN), propertyController.approve);
router.post('/properties/:id/reject', authenticate, authorize(roles.ADMIN), propertyController.reject);

// ============ BOOKING ROUTES ============
// Note: check-availability must be before :id to avoid matching 'check-availability' as id
router.get('/bookings/check-availability', bookingController.checkAvailability);
router.get('/bookings', authenticate, bookingController.list);
router.get('/bookings/:id', authenticate, bookingController.getOne);
router.post(
  '/bookings',
  authenticate,
  authorize(roles.CUSTOMER, roles.MERCHANT, roles.ADMIN),
  validateRequest(bookingSchema),
  bookingController.create,
);
router.put('/bookings/:id/status', authenticate, authorize(roles.MERCHANT, roles.ADMIN), bookingController.updateStatus);
router.post('/bookings/:id/cancel', authenticate, bookingController.cancel);

// ============ PAYMENT ROUTES ============
router.get('/payments/methods', paymentController.getPaymentMethods);
router.get('/payments', authenticate, paymentController.getUserPayments);
router.get('/payments/:id', authenticate, paymentController.getPayment);
router.post('/bookings/:bookingId/pay', authenticate, validateRequest(paymentSchema), paymentController.processPayment);
router.post('/payments/:id/refund', authenticate, paymentController.requestRefund);

// ============ ADMIN ROUTES ============
router.get('/admin/users', authenticate, authorize(roles.ADMIN), adminController.userDirectory);
router.get('/admin/analytics', authenticate, authorize(roles.ADMIN), adminController.analytics);
router.get('/admin/bookings', authenticate, authorize(roles.ADMIN), adminController.allBookings);
router.get('/admin/payments', authenticate, authorize(roles.ADMIN), paymentController.getAllPayments);
router.get('/admin/payments/stats', authenticate, authorize(roles.ADMIN), paymentController.getPaymentStats);
router.post('/admin/payments/:id/refund', authenticate, authorize(roles.ADMIN), paymentController.processRefund);

// ============ MERCHANT ROUTES ============
router.get('/merchant/properties', authenticate, authorize(roles.MERCHANT), propertyController.merchantProperties);
router.get('/merchant/bookings', authenticate, authorize(roles.MERCHANT), bookingController.merchantBookings);
router.get('/merchant/stats', authenticate, authorize(roles.MERCHANT), bookingController.merchantStats);

module.exports = router;
