const userService = require('../services/userService');
const propertyService = require('../services/propertyService');
const bookingService = require('../services/bookingService');
const paymentService = require('../services/paymentService');
const { buildResponse } = require('../utils/response');

const userDirectory = async (req, res, next) => {
  try {
    const { role, limit, offset } = req.query;
    const data = await userService.listUsers({
      role,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const analytics = async (req, res, next) => {
  try {
    const [propertyStats, bookingStats, paymentStats, users] = await Promise.all([
      propertyService.getPropertyStats(),
      bookingService.getBookingStats(),
      paymentService.getPaymentStats(),
      userService.listUsers()
    ]);

    const payload = {
      properties: propertyStats,
      bookings: bookingStats,
      payments: paymentStats,
      users: {
        total: users.length,
        breakdown: users.reduce(
          (acc, user) => ({
            ...acc,
            [user.role]: (acc[user.role] || 0) + 1,
          }),
          {},
        )
      }
    };
    
    return buildResponse(res, 200, { data: payload });
  } catch (error) {
    return next(error);
  }
};

const allBookings = async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    const data = await bookingService.listAllBookings({
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  userDirectory,
  analytics,
  allBookings
};
