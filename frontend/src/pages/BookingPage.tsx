import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService, CheckAvailabilityResponse } from '../services/bookingService';
import { propertyService } from '../services/propertyService';
import { paymentService, PaymentMethod } from '../services/paymentService';
import { Property } from '../types';

type BookingStep = 'details' | 'payment' | 'confirmation';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedPropertyId = searchParams.get('property') || '';

  const [properties, setProperties] = useState<Property[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [availability, setAvailability] = useState<CheckAvailabilityResponse | null>(null);
  const [step, setStep] = useState<BookingStep>('details');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    propertyId: preselectedPropertyId,
    checkIn: '',
    checkOut: '',
    guests: 2,
    specialRequests: '',
  });

  const [paymentForm, setPaymentForm] = useState<{
    method: 'credit_card' | 'paypal' | 'bank_transfer' | 'stripe';
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    cardName: string;
  }>({
    method: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
  });

  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const steps: BookingStep[] = ['details', 'payment', 'confirmation'];
  
  const getStepColor = (currentStep: BookingStep, targetStep: BookingStep, targetIndex: number): string => {
    if (currentStep === targetStep) return 'bg-gold text-white';
    if (steps.indexOf(currentStep) > targetIndex) return 'bg-green-500 text-white';
    return 'bg-platinum text-charcoal/60';
  };

  const getSubmitButtonText = (): string => {
    if (submitting) return 'Processing...';
    if (availability?.totalPrice === 0) return 'Confirm Free Booking';
    return `Pay $${availability?.totalPrice.toLocaleString() || '0'}`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [propertiesData, methodsData] = await Promise.all([
          propertyService.list(),
          paymentService.getMethods(),
        ]);
        setProperties(propertiesData);
        setPaymentMethods(methodsData);
      } catch {
        // Silent fail - data will remain empty
      }
    };
    load();
  }, []);

  // Check availability when dates change
  useEffect(() => {
    const checkAvail = async () => {
      if (form.propertyId && form.checkIn && form.checkOut) {
        setCheckingAvailability(true);
        try {
          const result = await bookingService.checkAvailability(
            form.propertyId,
            form.checkIn,
            form.checkOut
          );
          setAvailability(result ?? null);
        } catch {
          setAvailability(null);
        } finally {
          setCheckingAvailability(false);
        }
      }
    };
    checkAvail();
  }, [form.propertyId, form.checkIn, form.checkOut]);

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!availability?.available) {
      setStatus({ type: 'error', message: 'Selected dates are not available.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const booking = await bookingService.create({
        propertyId: form.propertyId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        guests: Number(form.guests),
        specialRequests: form.specialRequests,
      });
      if (booking) {
        setBookingId(booking.id);
        setStep('payment');
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to create booking. Please verify details.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingId) return;

    setSubmitting(true);
    setStatus(null);
    try {
      // For free bookings, send 'free' as the method
      const paymentPayload = availability?.totalPrice === 0 
        ? { method: 'free' as const }
        : paymentForm;
      
      const result = await paymentService.processPayment(bookingId, paymentPayload);
      if (result.success) {
        setStep('confirmation');
        setStatus({ type: 'success', message: 'Payment successful! Your booking is confirmed.' });
      } else {
        setStatus({ type: 'error', message: result.message || 'Payment failed. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Payment processing failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProperty = properties.find(p => p.id === form.propertyId);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Private booking atelier</p>
      <h1 className="mt-4 text-4xl font-semibold text-charcoal">Craft your stay</h1>
      <p className="mt-3 text-charcoal/70">Every detail is secured through encrypted workflows and concierge verification.</p>

      {/* Progress Steps */}
      <div className="mt-10 flex items-center justify-center gap-4">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${getStepColor(step, s, i)}`}>
              {i + 1}
            </div>
            <span className={`ml-2 text-sm uppercase tracking-wider ${step === s ? 'text-charcoal' : 'text-charcoal/60'}`}>
              {s}
            </span>
            {i < 2 && <div className="mx-4 h-px w-12 bg-platinum" />}
          </div>
        ))}
      </div>

      {/* Step 1: Booking Details */}
      {step === 'details' && (
        <form onSubmit={handleBookingSubmit} className="mt-10 space-y-6 rounded-3xl border border-platinum/60 bg-white/80 p-10">
          <div>
            <label className="text-sm font-semibold text-charcoal" htmlFor="property">
              Residence
            </label>
            <select
              id="property"
              required
              className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
              value={form.propertyId}
              onChange={(event) => setForm((prev) => ({ ...prev, propertyId: event.target.value }))}
            >
              <option value="" disabled>
                Select property
              </option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} — ${property.price_per_night.toLocaleString()} / night
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-charcoal" htmlFor="checkIn">
                Check-in
              </label>
              <input
                id="checkIn"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
                value={form.checkIn}
                onChange={(event) => setForm((prev) => ({ ...prev, checkIn: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-charcoal" htmlFor="checkOut">
                Check-out
              </label>
              <input
                id="checkOut"
                type="date"
                required
                min={form.checkIn || new Date().toISOString().split('T')[0]}
                className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
                value={form.checkOut}
                onChange={(event) => setForm((prev) => ({ ...prev, checkOut: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-charcoal" htmlFor="guests">
              Guests
            </label>
            <input
              id="guests"
              type="number"
              min={1}
              max={selectedProperty?.max_guests || 12}
              className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
              value={form.guests}
              onChange={(event) => setForm((prev) => ({ ...prev, guests: Number(event.target.value) }))}
            />
            {selectedProperty && (
              <p className="mt-1 text-xs text-charcoal/60">Maximum {selectedProperty.max_guests} guests</p>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-charcoal" htmlFor="specialRequests">
              Special Requests (optional)
            </label>
            <textarea
              id="specialRequests"
              rows={3}
              className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
              placeholder="Any special requests or preferences..."
              value={form.specialRequests}
              onChange={(event) => setForm((prev) => ({ ...prev, specialRequests: event.target.value }))}
            />
          </div>

          {/* Availability & Price Summary */}
          {availability && (
            <div className={`rounded-2xl p-6 ${availability.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {availability.available ? (
                <>
                  <p className="text-green-700 font-semibold">✓ Available</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>${availability.property.pricePerNight.toLocaleString()} × {availability.nights} nights</span>
                      <span>${availability.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-green-200 pt-2 font-semibold">
                      <span>Total</span>
                      <span>${availability.totalPrice.toLocaleString()} {availability.property.currency}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-red-700 font-semibold">✗ Not available for selected dates</p>
              )}
            </div>
          )}

          {checkingAvailability && (
            <div className="text-center text-charcoal/60">Checking availability...</div>
          )}

          <button
            type="submit"
            disabled={submitting || !availability?.available}
            className="w-full rounded-full bg-charcoal px-6 py-4 text-sm font-semibold text-ivory disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creating booking...' : 'Continue to Payment'}
          </button>

          {status && (
            <p className={`text-sm ${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {status.message}
            </p>
          )}
        </form>
      )}

      {/* Step 2: Payment */}
      {step === 'payment' && (
        <form onSubmit={handlePaymentSubmit} className="mt-10 space-y-6 rounded-3xl border border-platinum/60 bg-white/80 p-10">
          <h2 className="text-xl font-semibold text-charcoal">
            {availability?.totalPrice === 0 ? 'Confirm Free Booking' : 'Payment Details'}
          </h2>

          {/* Order Summary */}
          {availability && (
            <div className="rounded-2xl bg-charcoal/5 p-6">
              <h3 className="font-semibold text-charcoal">Order Summary</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{selectedProperty?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>{availability.nights} nights</span>
                  <span>{availability.totalPrice === 0 ? 'FREE' : `$${availability.totalPrice.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between border-t border-charcoal/10 pt-2 font-semibold text-lg">
                  <span>Total</span>
                  <span className={availability.totalPrice === 0 ? 'text-green-600' : ''}>
                    {availability.totalPrice === 0 ? 'FREE' : `$${availability.totalPrice.toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Free Booking Notice */}
          {availability?.totalPrice === 0 ? (
            <div className="rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="mt-4 font-semibold text-green-700">This is a FREE booking!</p>
              <p className="mt-2 text-sm text-green-600">No payment required. Click confirm to complete your reservation.</p>
            </div>
          ) : (
            <>
              {/* Payment Method Selection */}
              <fieldset>
                <legend className="text-sm font-semibold text-charcoal">Payment Method</legend>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {paymentMethods.filter(m => m.enabled).map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentForm(prev => ({ ...prev, method: method.id as typeof prev.method }))}
                      className={`rounded-2xl border-2 p-4 text-left transition-all ${
                        paymentForm.method === method.id
                          ? 'border-gold bg-gold/5'
                          : 'border-platinum/60 hover:border-gold/50'
                      }`}
                    >
                      <p className="font-semibold text-charcoal">{method.name}</p>
                      <p className="mt-1 text-xs text-charcoal/60">{method.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Credit Card Form */}
              {paymentForm.method === 'credit_card' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-charcoal" htmlFor="cardName">
                      Name on Card
                    </label>
                    <input
                      id="cardName"
                      type="text"
                      required
                      className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
                      placeholder="John Doe"
                      value={paymentForm.cardName}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, cardName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-charcoal" htmlFor="cardNumber">
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      required
                      maxLength={19}
                      className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
                      placeholder="4242 4242 4242 4242"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-charcoal" htmlFor="cardExpiry">
                        Expiry Date
                      </label>
                      <input
                        id="cardExpiry"
                        type="text"
                        required
                        maxLength={5}
                        className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
                        placeholder="MM/YY"
                        value={paymentForm.cardExpiry}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cardExpiry: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-charcoal" htmlFor="cardCvv">
                        CVV
                      </label>
                      <input
                        id="cardCvv"
                        type="text"
                        required
                        maxLength={4}
                        className="mt-2 w-full rounded-2xl border border-platinum/80 bg-transparent px-4 py-3"
                        placeholder="123"
                        value={paymentForm.cardCvv}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cardCvv: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal */}
              {paymentForm.method === 'paypal' && (
                <div className="rounded-2xl bg-blue-50 p-6 text-center">
                  <p className="text-blue-700">You will be redirected to PayPal to complete your payment.</p>
                </div>
              )}

              {/* Bank Transfer */}
              {paymentForm.method === 'bank_transfer' && (
                <div className="rounded-2xl bg-gray-50 p-6">
                  <p className="font-semibold text-charcoal">Bank Transfer Details</p>
                  <p className="mt-2 text-sm text-charcoal/70">
                    Transfer instructions will be sent to your email after confirmation.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="flex-1 rounded-full border-2 border-charcoal px-6 py-4 text-sm font-semibold text-charcoal"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 rounded-full px-6 py-4 text-sm font-semibold text-white disabled:opacity-50 ${
                availability?.totalPrice === 0 ? 'bg-green-600' : 'bg-gold'
              }`}
            >
              {getSubmitButtonText()}
            </button>
          </div>

          {status && (
            <p className={`text-sm text-center ${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {status.message}
            </p>
          )}
        </form>
      )}

      {/* Step 3: Confirmation */}
      {step === 'confirmation' && (
        <div className="mt-10 rounded-3xl border border-green-200 bg-green-50 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-charcoal">Booking Confirmed!</h2>
          <p className="mt-4 text-charcoal/70">
            Your reservation has been confirmed. A confirmation email has been sent to your email address.
          </p>
          <div className="mt-6 rounded-2xl bg-white p-6 text-left">
            <h3 className="font-semibold text-charcoal">Booking Details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal/60">Property</span>
                <span>{selectedProperty?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Check-in</span>
                <span>{new Date(form.checkIn).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Check-out</span>
                <span>{new Date(form.checkOut).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/60">Guests</span>
                <span>{form.guests}</span>
              </div>
              <div className="flex justify-between border-t border-charcoal/10 pt-2 font-semibold">
                <span>Total Paid</span>
                <span>${availability?.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-full bg-charcoal px-8 py-3 text-sm font-semibold text-ivory"
            >
              View My Bookings
            </button>
            <button
              type="button"
              onClick={() => navigate('/properties')}
              className="rounded-full border-2 border-charcoal px-8 py-3 text-sm font-semibold text-charcoal"
            >
              Browse More
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
