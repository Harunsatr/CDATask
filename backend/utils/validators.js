const { z } = require('zod');
const roles = require('../constants/roles');

// Relaxed password for demo - minimum 6 characters
const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum([roles.CUSTOMER, roles.MERCHANT]).optional().default(roles.CUSTOMER),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const propertySchema = z.object({
  name: z.string().min(4).max(140),
  description: z.string().min(20).max(1000),
  location: z.string().min(3).max(120),
  pricePerNight: z.number().positive(),
  images: z.array(z.string().url()).min(1).optional(),
  amenities: z.array(z.string().min(2)).min(1).optional(),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
});

const bookingSchema = z
  .object({
    propertyId: z.string().uuid(),
    checkIn: z.string(),
    checkOut: z.string(),
    guests: z.number().int().positive(),
    specialRequests: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.checkIn) < new Date(data.checkOut), {
    message: 'Check-out must be after check-in.',
    path: ['checkOut'],
  });

const paymentSchema = z.object({
  method: z.enum(['credit_card', 'paypal', 'bank_transfer', 'stripe', 'free']),
  // Credit card fields (optional based on method)
  cardNumber: z.string().min(13).max(19).optional(),
  cardExpiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be MM/YY format').optional(),
  cardCvv: z.string().min(3).max(4).optional(),
  cardName: z.string().optional(),
  // PayPal fields
  paypalEmail: z.string().email().optional(),
  // Bank transfer fields  
  bankAccount: z.string().optional(),
  // Billing address
  billingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zip: z.string().optional(),
  }).optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(20).optional(),
  avatar: z.string().url().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  propertySchema,
  bookingSchema,
  paymentSchema,
  updateProfileSchema,
};
