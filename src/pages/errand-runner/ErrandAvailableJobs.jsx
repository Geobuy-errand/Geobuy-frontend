import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetAvailableErrandsQuery, useAcceptErrandMutation } from '../../redux/services/errandApi'
import { useGetErrandRunnerProfileQuery } from '../../redux/services/errandRunnerApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaCheck, FaSearch, FaFilter, FaRuler, FaSpinner } from 'react-icons/fa'

const ErrandAvailableJobs = () => {
  const { data: jobs, isLoading, refetch } = useGetAvailableErrandsQuery()
  const { data: profile } = useGetErrandRunnerProfileQuery()
  const [acceptErrand, { isLoading: isAccepting }] = useAcceptErrandMutation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState('all')
  const [sortBy, setSortBy] = useState('nearest')

  const isVerified = profile?.verificationStatus === 'approved'

  const handleAccept = async (jobId) => {
    if (!isVerified) {
      toast.error('Please complete verification before accepting jobs')
      return
    }

    try {
      await acceptErrand(jobId).unwrap()
      toast.success('Job accepted successfully!')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to accept job')
    }
  }

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.pickup?.address?.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Available Jobs</h1>
          <p className="text-text-light mt-1">
            {isVerified ? 'Browse and accept errands near you' : 'Complete verification to accept jobs'}
          </p>
        </div>
        {!isVerified && (
          <Link to="/errand-runner/verification" className="btn-secondary text-sm py-2 mt-4 md:mt-0">
            Complete Verification
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterService}
          onChange={(e) => setFilterService(e.target.value)}
          className="input-field w-full md:w-48"
        >
          <option value="all">All Services</option>
          {serviceTypes.map((type) => (
            <option key={type} value={type}>{type.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field w-full md:w-40"
        >
          <option value="nearest">Nearest First</option>
          <option value="price">Price: Low to High</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : sortedJobs?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No available jobs at the moment</p>
          <p className="text-sm text-text-lighter mt-1">Check back later or adjust your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedJobs?.map((job) => (
            <div key={job._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text">{job.serviceType?.replace('_', ' ')}</h3>
                    {job.distance && (
                      <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <FaRuler className="mr-1" />
                        {job.distance.toFixed(1)} miles away
                      </span>
                    )}
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
                    {new Date(job.date || job.preferredDate).toLocaleDateString()} at {job.time || job.preferredTime}
                  </div>
                  {job.taskDetails && (
                    <p className="text-sm text-text-light mt-2 line-clamp-2">{job.taskDetails}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="flex items-center text-xl font-bold text-primary">
                    <FaDollarSign className="text-lg" />
                    £{job.total?.toFixed(2) || job.estimatedPrice?.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleAccept(job._id)}
                    disabled={isAccepting || !isVerified}
                    className="btn-primary text-sm py-2 px-6 flex items-center space-x-2 disabled:opacity-50 w-full md:w-auto"
                  >
                    {isAccepting ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                    <span>{isAccepting ? 'Accepting...' : 'Accept Job'}</span>
                  </button>
                  {!isVerified && (
                    <p className="text-xs text-red-500">Complete verification to accept</p>
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