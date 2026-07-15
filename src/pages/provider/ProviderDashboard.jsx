import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetAvailableJobsQuery, useGetBookingsQuery } from '../../redux/services/bookingApi'
import { useGetWalletQuery } from '../../redux/services/walletApi'
import { FaBriefcase, FaCheckCircle, FaWallet, FaStar, FaClock, FaArrowRight } from 'react-icons/fa'

const ProviderDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: availableJobs } = useGetAvailableJobsQuery()
  const { data: bookings } = useGetBookingsQuery()
  const { data: wallet } = useGetWalletQuery()

  const acceptedJobs = bookings?.filter(b => b.status === 'accepted' || b.status === 'in_progress') || []
  const completedJobs = bookings?.filter(b => b.status === 'completed') || []

  const stats = [
    {
      icon: FaBriefcase,
      label: 'Available Jobs',
      value: availableJobs?.length || 0,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: FaCheckCircle,
      label: 'Active Jobs',
      value: acceptedJobs.length,
      color: 'text-green-600',
      bg: 'bg-green-100',
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          Welcome back, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-text-light mt-1">
          Here's your provider overview.
        </p>
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
        {/* Available Jobs */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text">Available Jobs</h2>
            <Link to="/provider/available-jobs" className="text-primary hover:underline text-sm flex items-center">
              View all <FaArrowRight className="ml-1" />
            </Link>
          </div>
          {availableJobs?.length === 0 ? (
            <p className="text-text-light text-sm">No jobs available right now</p>
          ) : (
            <div className="space-y-3">
              {availableJobs?.slice(0, 5).map((job) => (
                <Link
                  key={job._id}
                  to={`/provider/job/${job._id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text">{job.serviceType}</p>
                      <p className="text-sm text-text-light">{job.pickup?.address}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      £{job.estimatedPrice?.toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Recent Activity</h2>
          {acceptedJobs.length === 0 && completedJobs.length === 0 ? (
            <p className="text-text-light text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {acceptedJobs.slice(0, 3).map((job) => (
                <div key={job._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text">{job.serviceType}</p>
                    <p className="text-sm text-text-light flex items-center">
                      <FaClock className="mr-1 text-xs" />
                      {job.status}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    £{job.estimatedPrice?.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderDashboard