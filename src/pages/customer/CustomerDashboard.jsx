import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetBookingsQuery } from '../../redux/services/bookingApi'
import { useGetErrandsQuery } from '../../redux/services/errandApi'
import socketService from '../../redux/services/socketService'
import { FaPlus, FaClock } from 'react-icons/fa'

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth || { user: null })
  const { data: bookings, isLoading, refetch } = useGetBookingsQuery()
  const { data: errands, isLoading: errandsLoading } = useGetErrandsQuery()
  const [liveUpdates, setLiveUpdates] = useState([])
  const [socketConnected, setSocketConnected] = useState(false)

  useEffect(() => {
    // Connect to socket
    socketService.connect()
    setSocketConnected(socketService.getConnectionStatus())

    // Listen for errand status updates
    const handleErrandUpdate = (data) => {
      setLiveUpdates(prev => [
        { 
          type: 'errand_update', 
          message: `Errand #${data.errandId} is now ${data.status}`,
          timestamp: new Date(),
        },
        ...prev.slice(0, 4),
      ])
      refetch()
    }
    socketService.on('errand-status-updated', handleErrandUpdate)

    return () => {
      socketService.off('errand-status-updated', handleErrandUpdate)
    }
  }, [refetch])

  // Combine bookings and errands for stats
  const allBookings = bookings || []
  const allErrands = errands || []
  const totalActive = allBookings.filter(b => b.status === 'pending' || b.status === 'accepted').length +
                      allErrands.filter(e => e.status === 'pending' || e.status === 'accepted' || e.status === 'en_route').length

  const stats = {
    total: allBookings.length + allErrands.length,
    pending: allBookings.filter(b => b.status === 'pending').length + allErrands.filter(e => e.status === 'pending').length,
    active: totalActive,
    completed: allBookings.filter(b => b.status === 'completed').length + allErrands.filter(e => e.status === 'delivered' || e.status === 'completed').length,
  }

  const recentItems = [...allBookings.slice(0, 3), ...allErrands.slice(0, 3)]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const getStatusColor = (status) => {
    const map = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-blue-100 text-blue-700',
      'en_route': 'bg-purple-100 text-purple-700',
      'collected': 'bg-indigo-100 text-indigo-700',
      'delivered': 'bg-green-100 text-green-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'in_progress': 'bg-blue-100 text-blue-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  if (isLoading || errandsLoading) {
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          Welcome back, {user?.fullName?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-text-light mt-1">
          Here's what's happening with your errands and bookings.
        </p>
        {socketConnected && (
          <span className="text-xs text-green-600 mt-1 inline-block">🟢 Live updates</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-text-light">Total</p>
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Pending</p>
          <p className="text-2xl font-bold text-secondary">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link to="/customer/create-booking" className="card hover:shadow-large transition-shadow flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-text">Create New Errand</h3>
            <p className="text-text-light text-sm">Get help with your errands</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <FaPlus className="text-primary text-xl" />
          </div>
        </Link>

        <Link to="/customer/bookings" className="card hover:shadow-large transition-shadow flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-text">View History</h3>
            <p className="text-text-light text-sm">Track all your errands</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
            <FaClock className="text-secondary text-xl" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-text mb-4">Recent Activity</h3>
        {recentItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-light">No activity yet.</p>
            <Link to="/customer/create-booking" className="text-primary hover:underline mt-2 inline-block">
              Create your first errand
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentItems.map((item) => (
              <Link
                key={item._id}
                to={`/customer/${item.errandId ? 'errand' : 'booking'}/${item._id}`}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-text">{item.serviceType || item.serviceType}</p>
                  <p className="text-sm text-text-light">{item.pickup?.address || item.pickup?.address}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status?.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-semibold text-text">
                    £{item.total?.toFixed(2) || item.estimatedPrice?.toFixed(2)}
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