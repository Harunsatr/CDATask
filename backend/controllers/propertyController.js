const roles = require('../constants/roles');
const propertyService = require('../services/propertyService');
const bookingService = require('../services/bookingService');
const { buildResponse } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitizer');

const list = async (req, res, next) => {
  try {
    const { location, minPrice, maxPrice, bedrooms, guests, search, limit, offset } = req.query;
    
    const data = await propertyService.listProperties({
      location,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      guests: guests ? parseInt(guests) : undefined,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });
    
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const featured = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const data = await propertyService.getFeaturedProperties(limit);
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const getOne = async (req, res, next) => {
  try {
    const data = await propertyService.getPropertyById(req.params.id);
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;
    const propertyId = req.params.id;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({ 
        success: false, 
        message: 'checkIn and checkOut dates are required' 
      });
    }
    
    const data = await bookingService.checkAvailability(propertyId, checkIn, checkOut);
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = req.validatedBody;
    const data = await propertyService.createProperty(payload, req.user.id);
    return buildResponse(res, 201, { message: 'Property submitted for approval.', data });
  } catch (error) {
    return next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const safeBody = sanitizePayload(req.body);
    const data = await propertyService.updateProperty(req.params.id, safeBody, req.user);
    return buildResponse(res, 200, { message: 'Property updated.', data });
  } catch (error) {
    return next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await propertyService.deleteProperty(req.params.id, req.user);
    return buildResponse(res, 200, { message: 'Property deleted.', data });
  } catch (error) {
    return next(error);
  }
};

const approve = async (req, res, next) => {
  try {
    const data = await propertyService.approveProperty(req.params.id);
    return buildResponse(res, 200, { message: 'Property approved.', data });
  } catch (error) {
    return next(error);
  }
};

const reject = async (req, res, next) => {
  try {
    const data = await propertyService.rejectProperty(req.params.id);
    return buildResponse(res, 200, { message: 'Property rejected.', data });
  } catch (error) {
    return next(error);
  }
};

const merchantProperties = async (req, res, next) => {
  try {
    const { limit, offset, status } = req.query;
    const data = await propertyService.listProperties({
      merchantId: req.user.id,
      status: status || null,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined
    });
    return buildResponse(res, 200, { data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  list,
  featured,
  getOne,
  checkAvailability,
  create,
  update,
  remove,
  approve,
  reject,
  merchantProperties
};
