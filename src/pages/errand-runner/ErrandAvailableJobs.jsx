import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetAvailableErrandsQuery, useAcceptErrandMutation } from '../../redux/services/errandApi'
import { useGetErrandRunnerProfileQuery } from '../../redux/services/errandRunnerApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaCheck, FaSearch, FaRuler, FaSpinner, FaArrowRight } from 'react-icons/fa'
import socketService from '../../redux/services/socketService'

const ErrandAvailableJobs = () => {
  const { data: jobs, isLoading, refetch } = useGetAvailableErrandsQuery()
  const { data: profile } = useGetErrandRunnerProfileQuery()
  const [acceptErrand, { isLoading: isAccepting }] = useAcceptErrandMutation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState('all')
  const [sortBy, setSortBy] = useState('nearest')
  const [socketConnected, setSocketConnected] = useState(false)

  useEffect(() => {
    socketService.connect()
    setSocketConnected(socketService.getConnectionStatus())

    const handleNewErrand = () => {
      refetch()
    }
    socketService.on('new-errand-available', handleNewErrand)

    return () => {
      socketService.off('new-errand-available', handleNewErrand)
    }
  }, [refetch])

  const isVerified = profile?.verificationStatus === 'approved'

  const handleAccept = async (jobId) => {
    if (!isVerified) {
      toast.error('Please complete verification before accepting errands')
      return
    }

    try {
      await acceptErrand(jobId).unwrap()
      toast.success('Errand accepted successfully!')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to accept errand')
    }
  }

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.pickup?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.taskDetails?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesService = filterService === 'all' || job.serviceType === filterService
    return matchesSearch && matchesService
  })

  const sortedJobs = filteredJobs?.sort((a, b) => {
    if (sortBy === 'nearest') return (a.distance || 999) - (b.distance || 999)
    if (sortBy === 'price') return (a.total || a.estimatedPrice || 0) - (b.total || b.estimatedPrice || 0)
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    return 0
  })

  const serviceTypes = [...new Set(jobs?.map(j => j.serviceType) || [])]

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Available Errands</h1>
          <p className="text-text-light text-sm md:text-base mt-1">
            {isVerified ? 'Browse and accept errands near you' : 'Complete verification to accept errands'}
            {socketConnected && <span className="ml-2 text-xs text-green-600">🟢 Live</span>}
          </p>
        </div>
        {!isVerified && (
          <Link to="/errand-runner/verification" className="btn-secondary text-sm py-1.5 px-3 md:py-2 md:px-4 whitespace-nowrap w-full md:w-auto text-center">
            Complete Verification
          </Link>
        )}
      </div>

      {/* Filters - Stack on mobile */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search errands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 md:py-3 pl-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm md:text-base"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="w-full sm:w-48 px-4 py-2 md:py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm md:text-base"
          >
            <option value="all">All Services</option>
            {serviceTypes.map((type) => (
              <option key={type} value={type}>{type.replace('_', ' ')}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 md:py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white text-sm md:text-base"
          >
            <option value="nearest">Nearest First</option>
            <option value="price">Price: Low to High</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-4 md:p-6">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : sortedJobs?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No available errands at the moment</p>
          <p className="text-sm text-text-lighter mt-1">Check back later or adjust your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedJobs?.map((job) => (
            <div key={job._id} className="card hover:shadow-medium transition-shadow p-4 md:p-6">
              <div className="flex flex-col gap-4">
                {/* Header: Service Type, Distance, Urgent */}
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base md:text-lg font-semibold text-text">
                    {job.serviceType?.replace('_', ' ')}
                  </h3>
                  {job.distance && (
                    <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      <FaRuler className="mr-1 text-xs" />
                      {job.distance.toFixed(1)} miles
                    </span>
                  )}
                  {job.isUrgent && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      🔴 Urgent
                    </span>
                  )}
                </div>

                {/* Location Details */}
                <div className="space-y-1">
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
                </div>

                {/* Date/Time and Price */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center text-sm text-text-light">
                    <FaClock className="mr-1.5 flex-shrink-0" />
                    {new Date(job.preferredDate || job.date).toLocaleDateString()} at {job.preferredTime || job.time}
                  </div>
                  <div className="flex items-center text-base md:text-lg font-bold text-primary">
                    <FaDollarSign className="text-sm md:text-base" />
                    £{job.total?.toFixed(2) || job.estimatedPrice?.toFixed(2)}
                  </div>
                </div>

                {/* Task Details (if any) */}
                {job.taskDetails && (
                  <p className="text-sm text-text-light line-clamp-2">{job.taskDetails}</p>
                )}

                {/* Action Button - Full width on mobile */}
                <div className="pt-3 border-t border-gray-100">
                  {isVerified ? (
                    <button
                      onClick={() => handleAccept(job._id)}
                      disabled={isAccepting}
                      className="w-full btn-primary text-sm md:text-base py-2.5 md:py-3 px-4 flex items-center justify-center space-x-2 disabled:opacity-50 rounded-xl"
                    >
                      {isAccepting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Accepting...</span>
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          <span>Accept Errand</span>
                          <FaArrowRight className="text-xs" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-center">
                      <p className="text-xs text-red-500 mb-2">Complete verification to accept errands</p>
                      <Link
                        to="/errand-runner/verification"
                        className="btn-secondary text-sm py-2 px-4 inline-block w-full md:w-auto text-center"
                      >
                        Complete Verification
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ErrandAvailableJobs