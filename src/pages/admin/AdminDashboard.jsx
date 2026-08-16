import React, { useState, useEffect } from 'react'
import { useGetDashboardStatsQuery } from '../../redux/services/adminApi'
import socketService from '../../redux/services/socketService'
import { toast } from 'react-hot-toast'
import { 
  FaUsers, 
  FaBriefcase, 
  FaClipboardList, 
  FaMoneyBillWave, 
  FaUserCheck, 
  FaClock,
  FaBell,
  FaDollarSign,
  FaArrowRight,
  FaCheckCircle,
} from 'react-icons/fa'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const { data: stats, isLoading, refetch } = useGetDashboardStatsQuery()
  const [recentActivity, setRecentActivity] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [pendingPayments, setPendingPayments] = useState([])
  const [liveStats, setLiveStats] = useState(null)

  useEffect(() => {
    // Connect to socket
    socketService.connect()

    // Update connection status
    setIsConnected(socketService.getConnectionStatus())

    // Join admin room
    socketService.joinAdmin()

    // Listen for socket connection status
    const handleConnect = () => {
      setIsConnected(true)
      toast.success('🟢 Real-time connection established')
    }

    const handleDisconnect = () => {
      setIsConnected(false)
    }

    socketService.on('connect', handleConnect)
    socketService.on('disconnect', handleDisconnect)

    // === LISTEN FOR EVENTS ===
    
    // New Errand
    const handleNewErrand = (data) => {
      setRecentActivity(prev => [
        { 
          type: 'new_errand', 
          message: `📦 New errand available: ${data.serviceType || 'Errand'}`,
          data: data,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ])
      toast.success(`📦 New errand available`)
      refetch()
    }
    socketService.on('new-errand-available', handleNewErrand)

    // Errand Status Update
    const handleErrandStatusUpdate = (data) => {
      setRecentActivity(prev => [
        { 
          type: 'status_update', 
          message: `🔄 Errand #${data.errand?.errandId || data.errandId} is now ${data.status}`,
          data: data,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ])
      refetch()
    }
    socketService.on('errand-status-updated', handleErrandStatusUpdate)

    // Errand Completed
    const handleErrandCompleted = (data) => {
      setRecentActivity(prev => [
        { 
          type: 'completed', 
          message: `✅ Errand #${data.errandId || data.errandCode} completed!`,
          data: data,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ])
      toast.success(`✅ Errand completed!`)
      refetch()
    }
    socketService.on('errand-completed', handleErrandCompleted)

    // Payment Confirmed
    const handlePaymentConfirmed = (data) => {
      const amount = data.amount || 0
      setRecentActivity(prev => [
        { 
          type: 'payment', 
          message: `💰 Payment of £${amount.toFixed(2)} confirmed`,
          data: data,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ])
      setPendingPayments(prev => [...prev, { ...data, amount }])
      toast.success(`💰 New payment of £${amount.toFixed(2)}`)
      refetch()
    }
    socketService.on('payment-confirmed', handlePaymentConfirmed)

    // Funds Released
    const handleFundsReleased = (data) => {
      const amount = data.amount || 0
      setRecentActivity(prev => [
        { 
          type: 'payment_released', 
          message: `💸 £${amount.toFixed(2)} released to provider`,
          data: data,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ])
      setPendingPayments(prev => prev.filter(p => p._id !== data.paymentId))
      toast.success(`💸 Funds released: £${amount.toFixed(2)}`)
      refetch()
    }
    socketService.on('funds-released', handleFundsReleased)

    // New Provider
    const handleNewProvider = (data) => {
      setRecentActivity(prev => [
        { 
          type: 'new_provider', 
          message: `👤 New provider registered: ${data.name || 'Provider'}`,
          data: data,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ])
      toast.success(`👤 New provider registered`)
      refetch()
    }
    socketService.on('new-provider-registered', handleNewProvider)

    // New Service Request
    const handleNewServiceRequest = (data) => {
      setRecentActivity(prev => [
        { 
          type: 'new_service_request', 
          message: `📋 New service request: ${data.serviceType || 'Service'}`,
          data: data,
          timestamp: new Date(),
        },
        ...prev.slice(0, 49),
      ])
      toast.success(`📋 New service request received`)
      refetch()
    }
    socketService.on('new-service-request', handleNewServiceRequest)

    // Live Stats Update
    const handleLiveStats = (data) => {
      setLiveStats(data)
    }
    socketService.on('live-stats', handleLiveStats)

    // Cleanup
    return () => {
      socketService.off('connect', handleConnect)
      socketService.off('disconnect', handleDisconnect)
      socketService.off('new-errand-available', handleNewErrand)
      socketService.off('errand-status-updated', handleErrandStatusUpdate)
      socketService.off('errand-completed', handleErrandCompleted)
      socketService.off('payment-confirmed', handlePaymentConfirmed)
      socketService.off('funds-released', handleFundsReleased)
      socketService.off('new-provider-registered', handleNewProvider)
      socketService.off('new-service-request', handleNewServiceRequest)
      socketService.off('live-stats', handleLiveStats)
    }
  }, [refetch])

  // Display recent activity (limit to 20)
  const displayActivity = recentActivity.slice(0, 20)

  // Stats cards
  const statCards = [
    {
      icon: FaUsers,
      label: 'Total Customers',
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
      label: 'Revenue (Today)',
      value: `£${(stats?.totalRevenue || 0).toFixed(2)}`,
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text">Admin Dashboard</h1>
            <p className="text-text-light mt-1">Overview of your platform</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? '🟢 Live' : '🔴 Disconnected'}
            </span>
            <FaBell className="text-text-light" />
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-text mb-4">Live Activity Feed</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {displayActivity.length === 0 ? (
              <p className="text-text-light text-sm">No recent activity</p>
            ) : (
              displayActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {activity.type === 'new_errand' && <FaClipboardList className="text-blue-500" />}
                    {activity.type === 'status_update' && <FaClock className="text-yellow-500" />}
                    {activity.type === 'completed' && <FaCheckCircle className="text-green-500" />}
                    {activity.type === 'payment' && <FaDollarSign className="text-green-500" />}
                    {activity.type === 'payment_released' && <FaMoneyBillWave className="text-primary" />}
                    {activity.type === 'new_provider' && <FaUserCheck className="text-purple-500" />}
                    {activity.type === 'new_service_request' && <FaClipboardList className="text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text">{activity.message}</p>
                    <p className="text-xs text-text-lighter">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Pending Payments */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Pending Payments</h2>
            {pendingPayments.length === 0 ? (
              <p className="text-text-light text-sm">No pending payments</p>
            ) : (
              <div className="space-y-2">
                {pendingPayments.slice(0, 5).map((payment, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">£{(payment.amount || 0).toFixed(2)}</span>
                    <span className="text-xs text-text-lighter">Waiting for release</span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/admin/payments" className="text-primary hover:underline text-sm mt-4 inline-block flex items-center">
              View all <FaArrowRight className="ml-1" />
            </Link>
          </div>

          {/* System Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">System Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-light">Socket Connection</span>
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Active Sessions</span>
                <span className="font-medium">{stats?.activeSessions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Last Update</span>
                <span className="text-text-light">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard