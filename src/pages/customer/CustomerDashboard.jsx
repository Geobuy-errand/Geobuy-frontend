import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetBookingsQuery } from '../../redux/services/bookingApi'
import { FaPlus, FaClock } from 'react-icons/fa'

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth || { user: null })
  const { data: bookings, isLoading, error } = useGetBookingsQuery()

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="skeleton h-8 w-48 rounded-xl"></div>
          <div className="skeleton h-4 w-64 rounded-xl mt-2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-12 rounded-xl"></div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-6">
        <div className="card bg-red-50 border border-red-200">
          <h3 className="text-red-700 font-semibold">Error loading bookings</h3>
          <p className="text-red-600 text-sm mt-2">
            {error?.data?.message || 'Failed to load bookings. Please try again later.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 btn-primary text-sm py-2"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter(b => b.status === 'pending').length || 0,
    completed: bookings?.filter(b => b.status === 'completed').length || 0,
    cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
  }

  const recentBookings = bookings?.slice(0, 5) || []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-text-light mt-1">
          Here's what's happening with your errands.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-text-light">Total Bookings</p>
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Pending</p>
          <p className="text-2xl font-bold text-secondary">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/customer/create-booking" className="card hover:shadow-large transition-shadow flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-text">Create New Booking</h3>
            <p className="text-text-light text-sm">Get help with your errands</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <FaPlus className="text-primary text-xl" />
          </div>
        </Link>

        <Link to="/customer/bookings" className="card hover:shadow-large transition-shadow flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-text">View All Bookings</h3>
            <p className="text-text-light text-sm">Track your errand history</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
            <FaClock className="text-secondary text-xl" />
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text mb-4">Recent Bookings</h3>
        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-light">No bookings yet.</p>
            <Link to="/customer/create-booking" className="text-primary hover:underline mt-2 inline-block">
              Create your first booking
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <Link
                key={booking._id}
                to={`/customer/booking/${booking._id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-text">{booking.serviceType}</p>
                  <p className="text-sm text-text-light">{booking.pickup?.address}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'}`}
                  >
                    {booking.status}
                  </span>
                  <span className="text-sm font-semibold text-text">
                    £{booking.estimatedPrice?.toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerDashboard