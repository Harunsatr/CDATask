import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { paymentService, Payment } from '../services/paymentService';
import { Booking } from '../types';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments'>('bookings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [bookingsData, paymentsData] = await Promise.all([
          bookingService.list(),
          paymentService.getPayments(),
        ]);
        setBookings(bookingsData);
        setPayments(paymentsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingService.cancel(bookingId);
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handlePayNow = (bookingId: string) => {
    navigate(`/booking?bookingId=${bookingId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'unpaid': return 'bg-orange-100 text-orange-700';
      case 'refunded': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center">
        <p className="text-charcoal/60">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      {/* Welcome Section */}
      <div className="rounded-3xl border border-platinum/60 bg-white/80 p-10">
        <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Welcome back</p>
        <h1 className="mt-4 text-3xl font-semibold text-charcoal">
          {user?.name || 'Guest'}
        </h1>
        <p className="mt-2 text-charcoal/60">{user?.email}</p>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-3xl font-semibold text-charcoal">{bookings.length}</p>
          <p className="mt-2 text-xs uppercase tracking-wider text-charcoal/60">Total Bookings</p>
        </div>
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-3xl font-semibold text-green-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wider text-charcoal/60">Confirmed</p>
        </div>
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-3xl font-semibold text-yellow-600">
            {bookings.filter(b => b.payment_status === 'unpaid').length}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wider text-charcoal/60">Pending Payment</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 flex gap-4 border-b border-platinum/40">
        {(['bookings', 'payments'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm uppercase tracking-[0.2em] transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-gold text-charcoal'
                : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="mt-8">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-platinum/60 bg-white/80 p-10 text-center">
              <p className="text-charcoal/60">No bookings yet.</p>
              <Link
                to="/properties"
                className="mt-4 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white"
              >
                Explore Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="rounded-2xl border border-platinum/60 bg-white/80 p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {booking.property_images?.[0] && (
                        <div 
                          className="h-24 w-32 rounded-xl bg-cover bg-center"
                          style={{ backgroundImage: `url(${booking.property_images[0]})` }}
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-charcoal">
                          {booking.property_name || 'Property'}
                        </h3>
                        <p className="mt-1 text-sm text-charcoal/60">
                          {booking.property_location}
                        </p>
                        <p className="mt-2 text-sm text-charcoal/70">
                          {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                        </p>
                        <p className="mt-1 text-sm text-charcoal/60">
                          {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-charcoal">
                        ${booking.total_price?.toLocaleString()}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${getPaymentStatusColor(booking.payment_status)}`}>
                          {booking.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-3 border-t border-platinum/40 pt-4">
                    {booking.payment_status === 'unpaid' && booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handlePayNow(booking.id)}
                        className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white"
                      >
                        Pay Now
                      </button>
                    )}
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
                    <Link
                      to={`/properties/${booking.property_id}`}
                      className="rounded-full border border-charcoal/20 px-4 py-2 text-sm font-semibold text-charcoal hover:bg-charcoal/5"
                    >
                      View Property
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="mt-8">
          {payments.length === 0 ? (
            <div className="rounded-2xl border border-platinum/60 bg-white/80 p-10 text-center">
              <p className="text-charcoal/60">No payment history.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-platinum/60 bg-white/80 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-charcoal/5">
                  <tr className="text-left text-charcoal/60">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-t border-platinum/40">
                      <td className="px-6 py-4">
                        {payment.created_at ? formatDate(payment.created_at) : '-'}
                      </td>
                      <td className="px-6 py-4">{payment.property_name || '-'}</td>
                      <td className="px-6 py-4 font-semibold">
                        ${payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        {payment.method.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
