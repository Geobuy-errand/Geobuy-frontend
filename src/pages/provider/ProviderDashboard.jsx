import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  useGetServiceRequestsQuery,
  useGetProviderServiceRequestsQuery 
} from '../../redux/services/serviceApi'
import { useGetWalletQuery } from '../../redux/services/walletApi'
import socketService from '../../redux/services/socketService'
import { FaBriefcase, FaCheckCircle, FaWallet, FaStar, FaClock, FaArrowRight } from 'react-icons/fa'

const ProviderDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  
  // ✅ Correct hooks for provider
  const { data: providerRequests, isLoading: requestsLoading, refetch } = useGetProviderServiceRequestsQuery()
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletQuery()
  const [socketConnected, setSocketConnected] = useState(false)

  useEffect(() => {
    socketService.connect()
    setSocketConnected(socketService.getConnectionStatus())

    if (user?._id) {
      socketService.joinRoom(user._id)
    }

    const handleNewRequest = () => {
      refetch()
    }
    socketService.on('new-service-request', handleNewRequest)

    return () => {
      socketService.off('new-service-request', handleNewRequest)
    }
  }, [user, refetch])

  // Provider sees requests they've been matched with or have submitted quotes for
  const pendingRequests = providerRequests?.filter(r => 
    r.status === 'pending' || r.status === 'quotes_received'
  ) || []
  
  const activeRequests = providerRequests?.filter(r => 
    r.status === 'provider_selected' || r.status === 'in_progress'
  ) || []
  
  const completedRequests = providerRequests?.filter(r => 
    r.status === 'completed'
  ) || []

  const stats = [
    {
      icon: FaBriefcase,
      label: 'Pending Requests',
      value: pendingRequests.length,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      icon: FaCheckCircle,
      label: 'Active Jobs',
      value: activeRequests.length,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: FaWallet,
      label: 'Balance',
      value: `£${wallet?.balance?.toFixed(2) || '0.00'}`,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: FaStar,
      label: 'Rating',
      value: user?.averageRating?.toFixed(1) || 'New',
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
  ]

  if (requestsLoading || walletLoading) {
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
          <div className="skeleton h-48 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Provider'}! 👋
        </h1>
        <p className="text-text-light mt-1">
          Here's your service provider overview.
        </p>
        {socketConnected && (
          <span className="text-xs text-green-600 mt-1 inline-block">🟢 Live updates</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={stat.color} />
              </div>
              <span className="text-xl font-bold text-text">{stat.value}</span>
            </div>
            <p className="text-sm text-text-light mt-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text">Pending Requests</h2>
            <Link to="/service-provider/requests" className="text-primary hover:underline text-sm flex items-center">
              View all <FaArrowRight className="ml-1" />
            </Link>
          </div>
          {pendingRequests.length === 0 ? (
            <p className="text-text-light text-sm">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 5).map((request) => (
                <Link
                  key={request._id}
                  to={`/service-provider/request/${request._id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text">{request.serviceType}</p>
                      <p className="text-sm text-text-light">{request.location?.address}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      £{request.budget?.toFixed(2) || 'Negotiable'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Jobs */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Active Jobs</h2>
          {activeRequests.length === 0 ? (
            <p className="text-text-light text-sm">No active jobs</p>
          ) : (
            <div className="space-y-3">
              {activeRequests.slice(0, 5).map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text">{request.serviceType}</p>
                    <p className="text-sm text-text-light flex items-center">
                      <FaClock className="mr-1 text-xs" />
                      {request.status.replace('_', ' ')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    £{request.finalPrice?.toFixed(2) || 'Negotiating'}
                  </span>
                </div>
              ))}
            </div>
          )}
          {activeRequests.length > 0 && (
            <Link to="/service-provider/active" className="text-primary hover:underline text-sm mt-4 inline-block">
              View all active jobs
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderDashboard