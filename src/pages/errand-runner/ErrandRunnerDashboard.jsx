import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetAvailableErrandsQuery, useGetErrandsQuery } from '../../redux/services/errandApi'
import { useGetWalletQuery } from '../../redux/services/walletApi'
import { useGetErrandRunnerProfileQuery } from '../../redux/services/errandRunnerApi'
import socketService from '../../redux/services/socketService'
import { 
  FaBriefcase, FaCheckCircle, FaWallet, FaStar, FaClock, 
  FaArrowRight, FaMapMarkerAlt, FaDollarSign, FaTachometerAlt 
} from 'react-icons/fa'

const ErrandRunnerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: availableJobs, isLoading: jobsLoading, refetch: refetchAvailable } = useGetAvailableErrandsQuery()
  const { data: allJobs, isLoading: allJobsLoading, refetch: refetchJobs } = useGetErrandsQuery()
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletQuery()
  const { data: profile } = useGetErrandRunnerProfileQuery()
  const [socketConnected, setSocketConnected] = useState(false)

  useEffect(() => {
    socketService.connect()
    setSocketConnected(socketService.getConnectionStatus())

    if (user?._id) {
      socketService.joinRoom(user._id)
    }

    const handleNewErrand = () => {
      refetchAvailable()
      refetchJobs()
    }
    socketService.on('new-errand-available', handleNewErrand)

    const handleErrandUpdate = () => {
      refetchJobs()
      refetchWallet()
    }
    socketService.on('errand-status-updated', handleErrandUpdate)

    return () => {
      socketService.off('new-errand-available', handleNewErrand)
      socketService.off('errand-status-updated', handleErrandUpdate)
    }
  }, [user, refetchAvailable, refetchJobs, refetchWallet])

  const stats = {
    available: availableJobs?.length || 0,
    accepted: allJobs?.filter(j => j.status === 'accepted' || j.status === 'en_route' || j.status === 'collected').length || 0,
    completed: allJobs?.filter(j => j.status === 'delivered' || j.status === 'completed').length || 0,
    balance: wallet?.balance || 0,
    rating: user?.averageRating || 0,
    verificationStatus: profile?.verificationStatus || 'pending',
  }

  const activeJobs = allJobs?.filter(j => j.status === 'accepted' || j.status === 'en_route' || j.status === 'collected') || []
  const recentCompleted = allJobs?.filter(j => j.status === 'delivered' || j.status === 'completed').slice(0, 3) || []

  const getStatusBadge = (status) => {
    const map = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-blue-100 text-blue-700',
      'en_route': 'bg-purple-100 text-purple-700',
      'collected': 'bg-indigo-100 text-indigo-700',
      'delivered': 'bg-green-100 text-green-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  if (jobsLoading || allJobsLoading || walletLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="skeleton h-8 w-48 rounded-xl"></div>
          <div className="skeleton h-4 w-64 rounded-xl mt-2"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-12 rounded-xl"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card"><div className="skeleton h-48 rounded-xl"></div></div>
          <div className="card"><div className="skeleton h-48 rounded-xl"></div></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Runner'}! 🏃
        </h1>
        <p className="text-text-light mt-1">
          {stats.verificationStatus === 'approved' 
            ? 'You are verified and ready to accept errands!' 
            : stats.verificationStatus === 'pending'
            ? 'Your account is pending verification. You can view errands but cannot accept them yet.'
            : 'Complete your verification to start accepting errands.'}
        </p>
        {socketConnected && (
          <span className="text-xs text-green-600 mt-1 inline-block">🟢 Live updates</span>
        )}
        {stats.verificationStatus !== 'approved' && (
          <Link to="/errand-runner/verification" className="text-primary hover:underline text-sm mt-2 inline-block">
            Complete Verification →
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-text-light">Available</p>
          <p className="text-2xl font-bold text-primary">{stats.available}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Active</p>
          <p className="text-2xl font-bold text-secondary">{stats.accepted}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Balance</p>
          <p className="text-2xl font-bold text-primary">£{stats.balance.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-text-light">Rating</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.rating.toFixed(1) || 'New'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text">Active Errands</h2>
            <Link to="/errand-runner/accepted-jobs" className="text-primary hover:underline text-sm flex items-center">
              View all <FaArrowRight className="ml-1" />
            </Link>
          </div>
          {activeJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-light">No active errands</p>
              <Link to="/errand-runner/available-jobs" className="text-primary hover:underline mt-2 inline-block">
                Find available errands
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeJobs.slice(0, 5).map((job) => (
                <Link
                  key={job._id}
                  to={`/errand-runner/job/${job._id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text">{job.serviceType?.replace('_', ' ')}</p>
                      <p className="text-sm text-text-light flex items-center">
                        <FaMapMarkerAlt className="mr-1 text-xs flex-shrink-0" />
                        <span className="truncate">{job.pickup?.address}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        £{job.total?.toFixed(2) || job.estimatedPrice?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/errand-runner/available-jobs"
                className="p-4 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors text-center"
              >
                <FaBriefcase className="text-primary text-xl mx-auto mb-2" />
                <p className="text-sm font-medium">Browse Errands</p>
              </Link>
              <Link
                to="/errand-runner/wallet"
                className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center"
              >
                <FaWallet className="text-green-600 text-xl mx-auto mb-2" />
                <p className="text-sm font-medium">Wallet</p>
              </Link>
              <Link
                to="/errand-runner/availability"
                className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center"
              >
                <FaClock className="text-blue-600 text-xl mx-auto mb-2" />
                <p className="text-sm font-medium">Availability</p>
              </Link>
              <Link
                to="/errand-runner/verification"
                className="p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors text-center"
              >
                <FaCheckCircle className="text-yellow-600 text-xl mx-auto mb-2" />
                <p className="text-sm font-medium">Verification</p>
              </Link>
            </div>
          </div>

          {/* Recent Completed */}
          {recentCompleted.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-4">Recent Completed</h2>
              <div className="space-y-2">
                {recentCompleted.map((job) => (
                  <div key={job._id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text">{job.serviceType?.replace('_', ' ')}</p>
                      <p className="text-xs text-text-light">
                        {new Date(job.completedAt || job.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">
                      £{job.total?.toFixed(2) || job.estimatedPrice?.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrandRunnerDashboard