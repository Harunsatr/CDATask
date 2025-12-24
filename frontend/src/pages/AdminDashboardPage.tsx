import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { User, Booking } from '../types';
import { bookingService } from '../services/bookingService';

interface AnalyticsState {
  properties: {
    total: number;
    active: number;
    pending: number;
  };
  bookings: {
    total: number;
    revenue: number;
    pending: number;
    confirmed: number;
  };
  payments: {
    total: number;
    completed: number;
    completedAmount: number;
    pending: number;
    pendingAmount: number;
    failed: number;
  };
  users: {
    total: number;
    breakdown: Record<string, number>;
  };
}

const initialAnalytics: AnalyticsState = {
  properties: { total: 0, active: 0, pending: 0 },
  bookings: { total: 0, revenue: 0, pending: 0, confirmed: 0 },
  payments: { total: 0, completed: 0, completedAmount: 0, pending: 0, pendingAmount: 0, failed: 0 },
  users: { total: 0, breakdown: {} },
};

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsState>(initialAnalytics);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'bookings' | 'payments'>('overview');

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsData, usersData, bookingsData] = await Promise.all([
          adminService.analytics(),
          adminService.listUsers(),
          bookingService.list(),
        ]);
        if (analyticsData) {
          setAnalytics({
            properties: analyticsData.properties || initialAnalytics.properties,
            bookings: analyticsData.bookings || initialAnalytics.bookings,
            payments: analyticsData.payments || initialAnalytics.payments,
            users: analyticsData.users || initialAnalytics.users,
          });
        }
        if (usersData.length) setUsers(usersData);
        if (bookingsData.length) setBookings(bookingsData);
      } catch {
        // Silent fail - data will be empty
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

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700',
      merchant: 'bg-blue-100 text-blue-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentColor = (status: string): string => {
    const colors: Record<string, string> = {
      completed: 'text-green-600',
      paid: 'bg-green-100 text-green-700',
      pending: 'text-yellow-600',
      unpaid: 'bg-orange-100 text-orange-700',
      failed: 'text-red-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.4em] text-charcoal/60">Platform intelligence</p>
      <h1 className="mt-4 text-3xl font-semibold text-charcoal">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="mt-8 flex gap-4 border-b border-platinum/40">
        {(['overview', 'users', 'bookings', 'payments'] as const).map((tab) => (
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
        <>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { label: 'Total Properties', value: analytics.properties.total },
              { label: 'Active Properties', value: analytics.properties.active },
              { label: 'Total Bookings', value: analytics.bookings.total },
              { label: 'Total Revenue', value: formatCurrency(analytics.bookings.revenue) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-platinum/60 bg-white/80 p-6 text-center shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">{stat.label}</p>
                <p className="mt-4 text-3xl font-semibold text-charcoal">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-platinum/60 bg-white/80 p-6 shadow-sm">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-charcoal/60">Pending Bookings</h3>
              <p className="mt-4 text-4xl font-semibold text-gold">{analytics.bookings.pending}</p>
            </div>
            <div className="rounded-3xl border border-platinum/60 bg-white/80 p-6 shadow-sm">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-charcoal/60">Confirmed Bookings</h3>
              <p className="mt-4 text-4xl font-semibold text-green-600">{analytics.bookings.confirmed}</p>
            </div>
            <div className="rounded-3xl border border-platinum/60 bg-white/80 p-6 shadow-sm">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-charcoal/60">Total Users</h3>
              <p className="mt-4 text-4xl font-semibold text-charcoal">{analytics.users.total}</p>
            </div>
          </div>

          {/* User breakdown */}
          <div className="mt-8 rounded-3xl border border-platinum/60 bg-white/80 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-charcoal">User Breakdown</h3>
            <div className="mt-4 flex gap-8">
              {Object.entries(analytics.users.breakdown).map(([role, count]) => (
                <div key={role} className="text-center">
                  <p className="text-2xl font-semibold text-charcoal">{count}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-charcoal/60">{role}s</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="mt-8 rounded-3xl border border-platinum/60 bg-white/80 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-charcoal">User Directory</h2>
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="text-left text-charcoal/60">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-platinum/40">
                  <td className="py-3">{user.name}</td>
                  <td className="py-3">{user.email}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-charcoal/60">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="mt-8 rounded-3xl border border-platinum/60 bg-white/80 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-charcoal">All Bookings</h2>
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="text-left text-charcoal/60">
                <th className="pb-2">Property</th>
                <th className="pb-2">Check In</th>
                <th className="pb-2">Check Out</th>
                <th className="pb-2">Guests</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-platinum/40">
                  <td className="py-3">{booking.property_name || booking.property_id}</td>
                  <td className="py-3">{new Date(booking.check_in).toLocaleDateString()}</td>
                  <td className="py-3">{new Date(booking.check_out).toLocaleDateString()}</td>
                  <td className="py-3">{booking.guests}</td>
                  <td className="py-3">{formatCurrency(booking.total_price)}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs uppercase ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs uppercase ${getPaymentColor(booking.payment_status)}`}>
                      {booking.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-charcoal/60">
                    No bookings yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="mt-8">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-3xl border border-platinum/60 bg-white/80 p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Total Payments</p>
              <p className="mt-4 text-3xl font-semibold text-charcoal">{analytics.payments.total}</p>
            </div>
            <div className="rounded-3xl border border-platinum/60 bg-white/80 p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Completed</p>
              <p className="mt-4 text-3xl font-semibold text-green-600">{formatCurrency(analytics.payments.completedAmount)}</p>
            </div>
            <div className="rounded-3xl border border-platinum/60 bg-white/80 p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Pending</p>
              <p className="mt-4 text-3xl font-semibold text-yellow-600">{formatCurrency(analytics.payments.pendingAmount)}</p>
            </div>
            <div className="rounded-3xl border border-platinum/60 bg-white/80 p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Failed</p>
              <p className="mt-4 text-3xl font-semibold text-red-600">{analytics.payments.failed}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
