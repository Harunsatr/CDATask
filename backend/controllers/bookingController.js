const roles = require('../constants/roles');
const bookingService = require('../services/bookingService');
const { buildResponse } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    let data;
    
    if (req.user.role === roles.MERCHANT) {
      data = await bookingService.listBookingsForMerchant(req.user.id, { status, limit: parseInt(limit), offset: parseInt(offset) });
    } else if (req.user.role === roles.ADMIN) {
      data = await bookingService.listAllBookings({ status, limit: parseInt(limit), offset: parseInt(offset) });
    } else {
      data = await bookingService.listBookingsByUser(req.user.id, { status, limit: parseInt(limit), offset: parseInt(offset) });
    }
    
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const data = await bookingService.getBookingById(req.params.id);
    
    // Check authorization
    if (data.user_id !== req.user.id && req.user.role !== roles.ADMIN) {
      // For merchant, check if they own the property
      if (req.user.role === roles.MERCHANT && data.merchant_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }
    
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await bookingService.createBooking(req.validatedBody, req.user);
    return buildResponse(res, 201, { message: 'Booking created successfully.', data });
  } catch (error) {
    return next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const data = await bookingService.updateBookingStatus(req.params.id, status, req.user);
    return buildResponse(res, 200, { message: 'Booking status updated.', data });
  } catch (error) {
    return next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const data = await bookingService.cancelBooking(req.params.id, req.user);
    return buildResponse(res, 200, { message: 'Booking cancelled.', data });
  } catch (error) {
    return next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { propertyId, checkIn, checkOut } = req.query;
    
    if (!propertyId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'propertyId, checkIn, and checkOut are required'
      });
    }
    
    const data = await bookingService.checkAvailability(propertyId, checkIn, checkOut);
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const merchantBookings = async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;
    const data = await bookingService.listBookingsForMerchant(req.user.id, {
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const merchantStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await bookingService.getBookingStats({
      merchantId: req.user.id,
      startDate,
      endDate
    });
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  list,
  getOne,
  create,
  updateStatus,
  cancel,
  checkAvailability,
  merchantBookings,
  merchantStats
};
