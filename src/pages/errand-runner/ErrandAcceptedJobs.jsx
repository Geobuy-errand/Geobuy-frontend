import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetErrandsQuery, useUpdateErrandStatusMutation } from '../../redux/services/errandApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaPlay, FaCheck, FaTimes, FaQrcode } from 'react-icons/fa'

const ErrandAcceptedJobs = () => {
  const { data: errands, isLoading, refetch } = useGetErrandsQuery()
  const [updateStatus, { isLoading: isUpdating }] = useUpdateErrandStatusMutation()
  const [filter, setFilter] = useState('all')

  const acceptedJobs = errands?.filter(j => 
    j.status === 'accepted' || j.status === 'en_route' || j.status === 'collected'
  ) || []

  const filteredJobs = acceptedJobs.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  const handleStatusUpdate = async (jobId, status) => {
    try {
      await updateStatus({ id: jobId, status }).unwrap()
      toast.success(`Job ${status.replace('_', ' ')} successfully`)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-700'
      case 'en_route': return 'bg-purple-100 text-purple-700'
      case 'collected': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getNextStatus = (status) => {
    const map = {
      'accepted': { label: 'Start Journey', value: 'en_route', icon: FaPlay },
      'en_route': { label: 'Collected', value: 'collected', icon: FaCheck },
      'collected': { label: 'Deliver', value: 'delivered', icon: FaCheck },
    }
    return map[status]
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">My Jobs</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'accepted' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setFilter('en_route')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'en_route' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          En Route
        </button>
        <button
          onClick={() => setFilter('collected')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'collected' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          Collected
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No accepted jobs</p>
          <Link to="/errand-runner/available-jobs" className="text-primary hover:underline mt-2 inline-block">
            Browse available jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const nextStep = getNextStatus(job.status)
            return (
              <div key={job._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-text">{job.serviceType?.replace('_', ' ')}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-text-light mt-1">
                      <FaMapMarkerAlt className="mr-1" />
                      {job.pickup?.address}
                    </div>
                    {job.dropoff?.address && (
                      <div className="flex items-center text-sm text-text-light mt-1">
                        <FaMapMarkerAlt className="mr-1 text-secondary" />
                        {job.dropoff.address}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-text-light mt-1">
                      <FaClock className="mr-1" />
                      Customer: {job.customerId?.fullName}
                    </div>
                    <div className="flex items-center text-sm text-text-light mt-1">
                      <FaDollarSign className="mr-1" />
                      £{job.total?.toFixed(2) || job.estimatedPrice?.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    {nextStep && (
                      <button
                        onClick={() => handleStatusUpdate(job._id, nextStep.value)}
                        disabled={isUpdating}
                        className="btn-primary text-sm py-2 px-4 flex items-center space-x-2 w-full md:w-auto disabled:opacity-50"
                      >
                        <nextStep.icon />
                        <span>{nextStep.label}</span>
                      </button>
                    )}
                    <div className="flex gap-2 w-full md:w-auto">
                      <Link
                        to={`/errand-runner/job/${job._id}`}
                        className="btn-outline text-sm py-2 px-4 w-full md:w-auto text-center"
                      >
                        Details
                      </Link>
                      {job.status === 'collected' && (
                        <Link
                          to={`/errand-runner/scan-qr/${job._id}`}
                          className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 w-full md:w-auto"
                        >
                          <FaQrcode />
                          <span>Scan QR</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ErrandAcceptedJobs