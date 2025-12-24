/**
 * Payment Controller
 * Handles payment-related HTTP requests
 */

const paymentService = require('../services/paymentService');
const { buildResponse } = require('../utils/response');

/**
 * Process a payment for a booking
 */
const processPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const paymentData = req.body;

    const result = await paymentService.processPayment(bookingId, userId, paymentData);
    
    res.status(result.success ? 200 : 400).json({
      success: result.success,
      message: result.message,
      data: result.payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment by ID
 */
const getPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.getPaymentById(id);
    
    // Verify user owns this payment or is admin
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    return buildResponse(res, 200, { data: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payments for a booking
 */
const getBookingPayments = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const payments = await paymentService.getPaymentsByBooking(bookingId);
    return buildResponse(res, 200, { data: payments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's payment history
 */
const getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset, status } = req.query;
    
    const payments = await paymentService.getUserPayments(userId, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      status
    });
    
    return buildResponse(res, 200, { data: payments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all payments (admin only)
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { limit, offset, status, method } = req.query;
    
    const payments = await paymentService.getAllPayments({
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
      status,
      method
    });
    
    return buildResponse(res, 200, { data: payments });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment statistics (admin only)
 */
const getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await paymentService.getPaymentStats({ startDate, endDate });
    return buildResponse(res, 200, { data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * Request a refund
 */
const requestRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const payment = await paymentService.requestRefund(id, userId, reason);
    
    return buildResponse(res, 200, { message: 'Refund request submitted', data: payment });
  } catch (error) {
    next(error);
  }
};

/**
 * Process a refund (admin only)
 */
const processRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const payment = await paymentService.processRefund(id, approved);
    
    return buildResponse(res, 200, { 
      message: approved ? 'Refund approved' : 'Refund rejected', 
      data: payment 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available payment methods
 */
const getPaymentMethods = (req, res) => {
  const methods = [
    {
      id: 'credit_card',
      name: 'Credit Card',
      description: 'Pay with Visa, MasterCard, or American Express',
      icon: 'credit-card',
      enabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay securely with your PayPal account',
      icon: 'paypal',
      enabled: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank transfer',
      icon: 'bank',
      enabled: true
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Pay with Stripe',
      icon: 'stripe',
      enabled: true
    }
  ];

  return buildResponse(res, 200, { data: methods });
};

module.exports = {
  processPayment,
  getPayment,
  getBookingPayments,
  getUserPayments,
  getAllPayments,
  getPaymentStats,
  requestRefund,
  processRefund,
  getPaymentMethods
};
