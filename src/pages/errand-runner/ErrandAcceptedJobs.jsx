import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetErrandsQuery, useUpdateErrandStatusMutation } from '../../redux/services/errandApi'
import { toast } from 'react-hot-toast'
import { 
  FaMapMarkerAlt, FaDollarSign, FaClock, FaPlay, FaCheck, FaTimes, 
  FaQrcode, FaRuler, FaArrowRight, FaHistory 
} from 'react-icons/fa'

const ErrandAcceptedJobs = () => {
  const { data: errands, isLoading, refetch } = useGetErrandsQuery()
  const [updateStatus, { isLoading: isUpdating }] = useUpdateErrandStatusMutation()
  const [filter, setFilter] = useState('all')
  const [showCancelled, setShowCancelled] = useState(false)

  // Filter for accepted, en_route, collected, and optionally cancelled
  const activeJobs = errands?.filter(j => 
    j.status === 'accepted' || j.status === 'en_route' || j.status === 'collected'
  ) || []

  const cancelledJobs = errands?.filter(j => 
    j.status === 'cancelled'
  ) || []

  const allJobs = showCancelled ? [...activeJobs, ...cancelledJobs] : activeJobs

  const filteredJobs = allJobs.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  const handleStatusUpdate = async (jobId, status) => {
    try {
      await updateStatus({ id: jobId, status }).unwrap()
      toast.success(`Errand ${status.replace('_', ' ')} successfully`)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'accepted': 'bg-blue-100 text-blue-700',
      'en_route': 'bg-purple-100 text-purple-700',
      'collected': 'bg-indigo-100 text-indigo-700',
      'cancelled': 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getNextStatus = (status) => {
    const map = {
      'accepted': { label: 'Start Journey', value: 'en_route', icon: FaPlay },
      'en_route': { label: 'Mark Collected', value: 'collected', icon: FaCheck },
      'collected': { label: 'Mark Delivered', value: 'delivered', icon: FaCheck },
    }
    return map[status]
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="skeleton h-24 rounded-xl"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap justify-between items-center mb-4 md:mb-6 gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-text">My Accepted Errands</h1>
        <button
          onClick={() => setShowCancelled(!showCancelled)}
          className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${
            showCancelled 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          <FaHistory />
          <span>{showCancelled ? 'Hide Cancelled' : 'Show Cancelled'}</span>
          {cancelledJobs.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cancelledJobs.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters - Scrollable on mobile */}
      <div className="flex flex-wrap gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
        {['all', 'accepted', 'en_route', 'collected', ...(showCancelled ? ['cancelled'] : [])].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
              filter === status ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">
            {showCancelled ? 'No accepted or cancelled errands' : 'No accepted errands'}
          </p>
          <Link to="/errand-runner/available-jobs" className="text-primary hover:underline mt-2 inline-block">
            Browse available errands →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const nextStep = getNextStatus(job.status)
            const isCancelled = job.status === 'cancelled'
            
            return (
              <div key={job._id} className={`card hover:shadow-medium transition-shadow p-4 md:p-6 ${isCancelled ? 'opacity-75 border-l-4 border-red-500' : ''}`}>
                <div className="flex flex-col gap-4">
                  {/* Top Section: Status and Actions */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                      {job.distance && !isCancelled && (
                        <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          <FaRuler className="mr-1 text-xs" />
                          {job.distance.toFixed(1)} miles
                        </span>
                      )}
                      {isCancelled && job.cancelledAt && (
                        <span className="text-xs text-text-lighter">
                          Cancelled: {new Date(job.cancelledAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-primary whitespace-nowrap">
                        £{job.total?.toFixed(2) || job.estimatedPrice?.toFixed(2)}
                      </span>
                      {nextStep && !isCancelled && (
                        <button
                          onClick={() => handleStatusUpdate(job._id, nextStep.value)}
                          disabled={isUpdating}
                          className="btn-primary text-xs md:text-sm py-1.5 px-3 md:py-2 md:px-4 flex items-center space-x-1 disabled:opacity-50 whitespace-nowrap"
                        >
                          <nextStep.icon className="text-xs md:text-sm" />
                          <span className="hidden sm:inline">{nextStep.label}</span>
                          <span className="sm:hidden">
                            {nextStep.value === 'en_route' ? 'Go' : 
                             nextStep.value === 'collected' ? 'Pick' : 'Deliver'}
                          </span>
                        </button>
                      )}
                      {isCancelled && (
                        <span className="text-xs text-red-600 font-medium">Cancelled</span>
                      )}
                    </div>
                  </div>

                  {/* Middle Section: Details */}
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-text">
                      {job.serviceType?.replace('_', ' ')}
                    </h3>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-start text-sm text-text-light">
                        <FaMapMarkerAlt className="mr-1.5 mt-0.5 flex-shrink-0 text-primary" />
                        <span className="break-words">{job.pickup?.address}</span>
                      </div>
                      {job.dropoff?.address && (
                        <div className="flex items-start text-sm text-text-light">
                          <FaMapMarkerAlt className="mr-1.5 mt-0.5 flex-shrink-0 text-secondary" />
                          <span className="break-words">{job.dropoff.address}</span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-text-light">
                        <FaClock className="mr-1.5 flex-shrink-0" />
                        <span>Customer: {job.customerId?.fullName}</span>
                      </div>
                      {isCancelled && job.cancellationReason && (
                        <div className="text-sm text-red-600 mt-1">
                          Reason: {job.cancellationReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Section: Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                    {!isCancelled ? (
                      <>
                        <Link
                          to={`/errand-runner/job/${job._id}`}
                          className="btn-outline text-xs md:text-sm py-1.5 px-3 md:py-2 md:px-4 flex items-center gap-1"
                        >
                          Details
                          <FaArrowRight className="text-xs" />
                        </Link>
                        {job.status === 'collected' && (
                          <Link
                            to={`/errand-runner/scan-qr/${job._id}`}
                            className="btn-secondary text-xs md:text-sm py-1.5 px-3 md:py-2 md:px-4 flex items-center gap-1"
                          >
                            <FaQrcode className="text-xs" />
                            Scan QR
                          </Link>
                        )}
                        {job.status === 'accepted' && (
                          <button
                            onClick={() => handleStatusUpdate(job._id, 'cancelled')}
                            className="text-red-600 hover:text-red-700 text-xs md:text-sm py-1.5 px-2"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-text-lighter">No actions available for cancelled errands</span>
                    )}
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