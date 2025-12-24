import { useEffect, useState } from 'react';
import { propertyService } from '../services/propertyService';
import { bookingService } from '../services/bookingService';
import { Property, Booking } from '../types';
import { useAuth } from '../hooks/useAuth';

interface MerchantStats {
  totalProperties: number;
  activeProperties: number;
  pendingProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
}

export default function MerchantDashboardPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'bookings'>('overview');
  const [loading, setLoading] = useState(true);

  const stats: MerchantStats = {
    totalProperties: properties.length,
    activeProperties: properties.filter(p => p.status === 'active' || p.status === 'approved').length,
    pendingProperties: properties.filter(p => p.status === 'pending').length,
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: bookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (b.total_price || 0), 0),
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [propsData, bookingsData] = await Promise.all([
          propertyService.list(),
          bookingService.list(),
        ]);
        setProperties(propsData);
        setBookings(bookingsData);
      } catch {
        // Silent fail - data will be empty
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'unpaid':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 text-center">
        <p className="text-charcoal/60">Loading merchant dashboard...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="rounded-3xl border border-platinum/60 bg-white/80 p-10">
        <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Merchant Dashboard</p>
        <h1 className="mt-4 text-3xl font-semibold text-charcoal">
          Welcome, {user?.name || 'Merchant'}
        </h1>
        <p className="mt-2 text-charcoal/60">Manage your properties and track bookings</p>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-2xl font-semibold text-charcoal">{stats.totalProperties}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/60">Properties</p>
        </div>
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-2xl font-semibold text-green-600">{stats.activeProperties}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/60">Active</p>
        </div>
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-2xl font-semibold text-yellow-600">{stats.pendingProperties}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/60">Pending</p>
        </div>
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-2xl font-semibold text-charcoal">{stats.totalBookings}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/60">Bookings</p>
        </div>
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-2xl font-semibold text-blue-600">{stats.confirmedBookings}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/60">Confirmed</p>
        </div>
        <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6 text-center">
          <p className="text-2xl font-semibold text-gold">{formatCurrency(stats.totalRevenue)}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-charcoal/60">Revenue</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 flex gap-4 border-b border-platinum/40">
        {(['overview', 'properties', 'bookings'] as const).map((tab) => (
          <button
            type="button"
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Recent Properties */}
          <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-charcoal">Your Properties</h3>
            <div className="mt-4 space-y-3">
              {properties.slice(0, 5).map((property) => (
                <div key={property.id} className="flex items-center justify-between rounded-xl bg-charcoal/5 p-3">
                  <div>
                    <p className="font-medium text-charcoal">{property.name}</p>
                    <p className="text-sm text-charcoal/60">{property.location}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs uppercase ${getStatusColor(property.status || 'pending')}`}>
                    {property.status || 'pending'}
                  </span>
                </div>
              ))}
              {properties.length === 0 && (
                <p className="text-sm text-charcoal/60">No properties yet.</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="rounded-2xl border border-platinum/60 bg-white/80 p-6">
            <h3 className="text-lg font-semibold text-charcoal">Recent Bookings</h3>
            <div className="mt-4 space-y-3">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-xl bg-charcoal/5 p-3">
                  <div>
                    <p className="font-medium text-charcoal">{booking.property_name}</p>
                    <p className="text-sm text-charcoal/60">
                      {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal">{formatCurrency(booking.total_price || 0)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs uppercase ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-sm text-charcoal/60">No bookings yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Properties Tab */}
      {activeTab === 'properties' && (
        <div className="mt-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-charcoal">All Properties</h3>
            <button type="button" className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white">
              + Add Property
            </button>
          </div>
          <div className="grid gap-6">
            {properties.map((property) => (
              <div key={property.id} className="rounded-3xl border border-platinum/60 bg-white/80 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    {property.images?.[0] && (
                      <div 
                        className="h-20 w-28 rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: `url(${property.images[0]})` }}
                      />
                    )}
                    <div>
                      <span className={`rounded-full px-2 py-0.5 text-xs uppercase ${getStatusColor(property.status || 'pending')}`}>
                        {property.status || 'pending'}
                      </span>
                      <h3 className="mt-1 text-xl font-semibold text-charcoal">{property.name}</h3>
                      <p className="text-sm text-charcoal/70">{property.location}</p>
                      <p className="mt-1 text-sm text-charcoal/60">
                        {property.bedrooms} bed • {property.bathrooms} bath • {property.max_guests} guests
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Nightly rate</p>
                    <p className="text-2xl font-semibold text-charcoal">
                      {formatCurrency(property.price_per_night)}
                    </p>
                    <div className="mt-2 flex gap-2 justify-end">
                      <button type="button" className="rounded-full border border-charcoal/20 px-3 py-1 text-sm text-charcoal hover:bg-charcoal/5">
                        Edit
                      </button>
                      <button type="button" className="rounded-full border border-charcoal/20 px-3 py-1 text-sm text-charcoal hover:bg-charcoal/5">
                        Availability
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {properties.length === 0 && (
              <p className="text-center text-sm text-charcoal/60">No properties yet. Add your first listing.</p>
            )}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="mt-8">
          <h3 className="mb-6 text-lg font-semibold text-charcoal">Bookings for Your Properties</h3>
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-platinum/60 bg-white/80 p-10 text-center">
              <p className="text-charcoal/60">No bookings yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-platinum/60 bg-white/80 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-charcoal/5">
                  <tr className="text-left text-charcoal/60">
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Guest</th>
                    <th className="px-6 py-4">Dates</th>
                    <th className="px-6 py-4">Guests</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-platinum/40">
                      <td className="px-6 py-4">
                        <p className="font-medium text-charcoal">{booking.property_name}</p>
                        <p className="text-xs text-charcoal/60">{booking.property_location}</p>
                      </td>
                      <td className="px-6 py-4">{booking.user_name || 'Guest'}</td>
                      <td className="px-6 py-4">
                        {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                      </td>
                      <td className="px-6 py-4">{booking.guests}</td>
                      <td className="px-6 py-4 font-semibold">{formatCurrency(booking.total_price || 0)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs uppercase ${getPaymentStatusColor(booking.payment_status)}`}>
                          {booking.payment_status}
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
