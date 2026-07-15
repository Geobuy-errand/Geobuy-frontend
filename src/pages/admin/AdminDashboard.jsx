import React from 'react'
import { Link } from 'react-router-dom'
import { useGetDashboardStatsQuery } from '../../redux/services/adminApi'
import { FaUsers, FaBriefcase, FaClipboardList, FaMoneyBillWave, FaUserCheck, FaClock, FaArrowRight } from 'react-icons/fa'

const AdminDashboard = () => {
  const { data: stats, isLoading } = useGetDashboardStatsQuery()

  const statCards = [
    {
      icon: FaUsers,
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      link: '/admin/users',
    },
    {
      icon: FaBriefcase,
      label: 'Total Providers',
      value: stats?.totalProviders || 0,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      link: '/admin/providers',
    },
    {
      icon: FaClipboardList,
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      color: 'text-green-600',
      bg: 'bg-green-100',
      link: '/admin/bookings',
    },
    {
      icon: FaMoneyBillWave,
      label: 'Revenue',
      value: `£${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      color: 'text-primary',
      bg: 'bg-primary/10',
      link: '/admin/payments',
    },
    {
      icon: FaUserCheck,
      label: 'Pending Providers',
      value: stats?.pendingProviders || 0,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      link: '/admin/verification',
    },
    {
      icon: FaClock,
      label: 'Pending Bookings',
      value: stats?.pendingBookings || 0,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      link: '/admin/bookings',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Admin Dashboard</h1>
        <p className="text-text-light mt-1">Overview of your platform</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-16 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <Link key={index} to={stat.link} className="card hover:shadow-medium transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={stat.color} />
                </div>
                <span className="text-xl font-bold text-text">{stat.value}</span>
              </div>
              <p className="text-sm text-text-light mt-2">{stat.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-primary hover:underline text-sm flex items-center">
              View all <FaArrowRight className="ml-1" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-xl"></div>
              ))}
            </div>
          ) : stats?.recentBookings?.length === 0 ? (
            <p className="text-text-light text-sm">No recent bookings</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentBookings?.slice(0, 5).map((booking) => (
                <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text">{booking.serviceId?.name || booking.serviceType}</p>
                    <p className="text-sm text-text-light">
                      {booking.customerId?.fullName} → {booking.providerId?.fullName || 'Unassigned'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'}`}
                  >
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Growth */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text">User Growth (Last 7 Days)</h2>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="skeleton h-8 rounded-xl"></div>
              ))}
            </div>
          ) : stats?.userGrowth?.length === 0 ? (
            <p className="text-text-light text-sm">No user growth data</p>
          ) : (
            <div className="space-y-2">
              {stats?.userGrowth?.map((day) => (
                <div key={day._id} className="flex items-center justify-between">
                  <span className="text-sm text-text-light">{day._id}</span>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((day.count / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-text">{day.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard