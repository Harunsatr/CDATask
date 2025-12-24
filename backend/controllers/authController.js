const authService = require('../services/authService');
const { buildResponse } = require('../utils/response');
const { sanitizePayload } = require('../utils/sanitizer');

const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.validatedBody);
    return buildResponse(res, 201, {
      message: 'Account created successfully.',
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const authResult = await authService.authenticate(req.validatedBody);
    return buildResponse(res, 200, {
      message: 'Login successful.',
      token: authResult.token,
      user: authResult.user,
    });
  } catch (error) {
    return next(error);
  }
};

const profile = async (req, res) =>
  buildResponse(res, 200, {
    data: req.user,
  });

const updateProfile = async (req, res, next) => {
  try {
    const safeBody = sanitizePayload(req.body);
    const user = await authService.updateUser(req.user.id, safeBody);
    return buildResponse(res, 200, {
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  profile,
  updateProfile
};
