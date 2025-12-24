/**
 * Payment Service
 * Handles payment processing with mock payment gateway
 */

const paymentRepository = require('../data/paymentRepository');
const bookingRepository = require('../data/bookingRepository');
const { v4: uuidv4 } = require('uuid');

/**
 * Supported payment methods
 */
const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  FREE: 'free'
};

/**
 * Mock payment gateway - simulates payment processing
 * In production, this would integrate with Stripe, PayPal, etc.
 */
const mockPaymentGateway = {
  /**
   * Process credit card payment
   */
  async processCard(paymentData) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock validation - card numbers ending in 0000 fail
    if (paymentData.cardNumber?.endsWith('0000')) {
      return {
        success: false,
        error: 'Card declined',
        code: 'CARD_DECLINED'
      };
    }

    return {
      success: true,
      transactionId: `TXN_${uuidv4().slice(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Process PayPal payment
   */
  async processPayPal(paymentData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      transactionId: `PP_${uuidv4().slice(0, 8).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Process bank transfer
   */
  async processBankTransfer(paymentData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      transactionId: `BT_${uuidv4().slice(0, 8).toUpperCase()}`,
      reference: `REF_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Process Stripe payment
   */
  async processStripe(paymentData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock Stripe response
    return {
      success: true,
      transactionId: `pi_${uuidv4().replace(/-/g, '').slice(0, 24)}`,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Create and process a payment
 */
const processPayment = async (bookingId, userId, paymentData) => {
  // Get booking
  const booking = bookingRepository.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found.');
    error.status = 404;
    throw error;
  }

  // Verify booking belongs to user
  if (booking.user_id !== userId) {
    const error = new Error('Not authorized to pay for this booking.');
    error.status = 403;
    throw error;
  }

  // Check if already paid
  if (booking.payment_status === 'paid') {
    const error = new Error('Booking already paid.');
    error.status = 400;
    throw error;
  }

  // Handle FREE bookings (price = 0)
  if (booking.total_price === 0) {
    // Create a free payment record
    const payment = paymentRepository.create({
      bookingId,
      userId,
      amount: 0,
      currency: booking.currency,
      method: 'free',
      status: 'completed',
      transactionId: `FREE-${uuidv4().slice(0, 8).toUpperCase()}`,
      paymentData: {
        success: true,
        type: 'free_booking',
        processedAt: new Date().toISOString()
      }
    });

    // Update booking to confirmed
    bookingRepository.update(bookingId, {
      paymentStatus: 'paid',
      paymentId: payment.id,
      paymentMethod: 'free',
      status: 'confirmed'
    });

    return {
      payment,
      success: true,
      message: 'Free booking confirmed successfully!'
    };
  }

  // Validate payment method for paid bookings
  const method = paymentData.method?.toLowerCase();
  
  // Handle 'free' method for free bookings (if called with free method but total > 0)
  if (method === PAYMENT_METHODS.FREE && booking.total_price > 0) {
    const error = new Error('Free method not allowed for paid bookings.');
    error.status = 400;
    throw error;
  }
  
  // Handle free method for $0 bookings
  if (method === PAYMENT_METHODS.FREE) {
    const payment = paymentRepository.create({
      bookingId,
      userId,
      amount: 0,
      currency: booking.currency,
      method: 'free',
      status: 'completed',
      transactionId: `FREE-${uuidv4().slice(0, 8).toUpperCase()}`,
      paymentData: {
        success: true,
        type: 'free_booking',
        processedAt: new Date().toISOString()
      }
    });

    bookingRepository.update(bookingId, {
      paymentStatus: 'paid',
      paymentId: payment.id,
      paymentMethod: 'free',
      status: 'confirmed'
    });

    return {
      payment,
      success: true,
      message: 'Free booking confirmed successfully!'
    };
  }
  
  if (!Object.values(PAYMENT_METHODS).includes(method)) {
    const error = new Error('Invalid payment method.');
    error.status = 400;
    throw error;
  }

  // Process payment through mock gateway
  let gatewayResult;
  switch (method) {
    case PAYMENT_METHODS.CREDIT_CARD:
      gatewayResult = await mockPaymentGateway.processCard(paymentData);
      break;
    case PAYMENT_METHODS.PAYPAL:
      gatewayResult = await mockPaymentGateway.processPayPal(paymentData);
      break;
    case PAYMENT_METHODS.BANK_TRANSFER:
      gatewayResult = await mockPaymentGateway.processBankTransfer(paymentData);
      break;
    case PAYMENT_METHODS.STRIPE:
      gatewayResult = await mockPaymentGateway.processStripe(paymentData);
      break;
    default:
      gatewayResult = await mockPaymentGateway.processCard(paymentData);
  }

  // Create payment record
  const payment = paymentRepository.create({
    bookingId,
    userId,
    amount: booking.total_price,
    currency: booking.currency,
    method,
    status: gatewayResult.success ? 'completed' : 'failed',
    transactionId: gatewayResult.transactionId,
    paymentData: {
      ...gatewayResult,
      processedAt: new Date().toISOString()
    }
  });

  // Update booking payment status if successful
  if (gatewayResult.success) {
    bookingRepository.update(bookingId, {
      paymentStatus: 'paid',
      paymentId: payment.id,
      paymentMethod: method,
      status: 'confirmed'
    });
  }

  return {
    payment,
    success: gatewayResult.success,
    message: gatewayResult.success 
      ? 'Payment processed successfully' 
      : gatewayResult.error || 'Payment failed'
  };
};

/**
 * Get payment by ID
 */
const getPaymentById = async (id) => {
  const payment = paymentRepository.findById(id);
  if (!payment) {
    const error = new Error('Payment not found.');
    error.status = 404;
    throw error;
  }
  return payment;
};

/**
 * Get payments by booking ID
 */
const getPaymentsByBooking = async (bookingId) => {
  return paymentRepository.findByBookingId(bookingId);
};

/**
 * Get user payment history
 */
const getUserPayments = async (userId, options = {}) => {
  return paymentRepository.findByUserId(userId, options);
};

/**
 * Get all payments (admin)
 */
const getAllPayments = async (options = {}) => {
  return paymentRepository.findAll(options);
};

/**
 * Get payment statistics
 */
const getPaymentStats = async (options = {}) => {
  return paymentRepository.getStats(options);
};

/**
 * Request refund
 */
const requestRefund = async (paymentId, userId, reason) => {
  const payment = paymentRepository.findById(paymentId);
  
  if (!payment) {
    const error = new Error('Payment not found.');
    error.status = 404;
    throw error;
  }

  if (payment.user_id !== userId) {
    const error = new Error('Not authorized.');
    error.status = 403;
    throw error;
  }

  if (payment.status !== 'completed') {
    const error = new Error('Only completed payments can be refunded.');
    error.status = 400;
    throw error;
  }

  // Update payment status to refund pending
  const updated = paymentRepository.update(paymentId, {
    status: 'refund_pending',
    paymentData: {
      ...payment.payment_data,
      refundReason: reason,
      refundRequestedAt: new Date().toISOString()
    }
  });

  return updated;
};

/**
 * Process refund (admin)
 */
const processRefund = async (paymentId, approved) => {
  const payment = paymentRepository.findById(paymentId);
  
  if (!payment) {
    const error = new Error('Payment not found.');
    error.status = 404;
    throw error;
  }

  const newStatus = approved ? 'refunded' : 'completed';
  
  const updated = paymentRepository.update(paymentId, {
    status: newStatus,
    paymentData: {
      ...payment.payment_data,
      refundProcessedAt: new Date().toISOString(),
      refundApproved: approved
    }
  });

  // Update booking if refunded
  if (approved && payment.booking_id) {
    bookingRepository.update(payment.booking_id, {
      paymentStatus: 'refunded',
      status: 'cancelled'
    });
  }

  return updated;
};

module.exports = {
  processPayment,
  getPaymentById,
  getPaymentsByBooking,
  getUserPayments,
  getAllPayments,
  getPaymentStats,
  requestRefund,
  processRefund,
  PAYMENT_METHODS
};
