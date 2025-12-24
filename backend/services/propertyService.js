/**
 * Property Service
 * Handles property CRUD operations using SQLite
 */

const propertyRepository = require('../data/propertyRepository');
const roles = require('../constants/roles');

const listProperties = async (options = {}) => {
  const { status = 'active', merchantId, location, minPrice, maxPrice, bedrooms, guests, search, limit, offset } = options;
  
  return propertyRepository.findAll({
    status,
    merchantId,
    location,
    minPrice,
    maxPrice,
    bedrooms,
    guests,
    search,
    limit,
    offset
  });
};

const getPropertyById = async (id) => {
  const property = propertyRepository.findById(id);
  if (!property) {
    const error = new Error('Property not found.');
    error.status = 404;
    throw error;
  }
  return property;
};

const getFeaturedProperties = async (limit = 6) => {
  return propertyRepository.getFeatured(limit);
};

const createProperty = async (payload, merchantId) => {
  const property = propertyRepository.create({
    ...payload,
    merchantId,
    status: 'pending'
  });
  return property;
};

const updateProperty = async (id, payload, user) => {
  const property = propertyRepository.findById(id);
  if (!property) {
    const error = new Error('Property not found.');
    error.status = 404;
    throw error;
  }

  const authorized = user.role === roles.ADMIN || property.merchant_id === user.id;
  if (!authorized) {
    const error = new Error('Not allowed to update this property.');
    error.status = 403;
    throw error;
  }

  return propertyRepository.update(id, payload);
};

const deleteProperty = async (id, user) => {
  const property = propertyRepository.findById(id);
  if (!property) {
    const error = new Error('Property not found.');
    error.status = 404;
    throw error;
  }

  const authorized = user.role === roles.ADMIN || property.merchant_id === user.id;
  if (!authorized) {
    const error = new Error('Not allowed to delete this property.');
    error.status = 403;
    throw error;
  }

  propertyRepository.delete(id);
  return { message: 'Property deleted successfully' };
};

const approveProperty = async (id) => {
  const property = propertyRepository.findById(id);
  if (!property) {
    const error = new Error('Property not found.');
    error.status = 404;
    throw error;
  }
  
  return propertyRepository.update(id, { status: 'active' });
};

const rejectProperty = async (id) => {
  const property = propertyRepository.findById(id);
  if (!property) {
    const error = new Error('Property not found.');
    error.status = 404;
    throw error;
  }
  
  return propertyRepository.update(id, { status: 'rejected' });
};

const getPropertyStats = async (merchantId = null) => {
  const total = propertyRepository.count({ merchantId });
  const active = propertyRepository.count({ status: 'active', merchantId });
  const pending = propertyRepository.count({ status: 'pending', merchantId });
  
  return { total, active, pending };
};

module.exports = {
  listProperties,
  getPropertyById,
  getFeaturedProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  approveProperty,
  rejectProperty,
  getPropertyStats
};
