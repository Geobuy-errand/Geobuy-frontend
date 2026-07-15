import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetAvailableJobsQuery, useAcceptBookingMutation } from '../../redux/services/bookingApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaCheck, FaSearch } from 'react-icons/fa'

const AvailableJobs = () => {
  const { data: jobs, isLoading } = useGetAvailableJobsQuery()
  const [acceptBooking, { isLoading: isAccepting }] = useAcceptBookingMutation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState('all')

  const handleAccept = async (jobId) => {
    try {
      await acceptBooking(jobId).unwrap()
      toast.success('Job accepted successfully!')
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

  const serviceTypes = [...new Set(jobs?.map(j => j.serviceType) || [])]

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Available Jobs</h1>

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
            <option key={type} value={type}>{type}</option>
          ))}
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
      ) : filteredJobs?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No available jobs at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs?.map((job) => (
            <div key={job._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text">{job.serviceType}</h3>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaMapMarkerAlt className="mr-1" />
                    {job.pickup?.address}
                  </div>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaClock className="mr-1" />
                    {new Date(job.date).toLocaleDateString()} at {job.time}
                  </div>
                  {job.description && (
                    <p className="text-sm text-text-light mt-2">{job.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="flex items-center text-xl font-bold text-primary">
                    <FaDollarSign className="text-lg" />
                    {job.estimatedPrice?.toFixed(2)}
                  </div>
                  <button
                    onClick={() => handleAccept(job._id)}
                    disabled={isAccepting}
                    className="btn-primary text-sm py-2 px-6 flex items-center space-x-2 disabled:opacity-50 w-full md:w-auto"
                  >
                    <FaCheck />
                    <span>{isAccepting ? 'Accepting...' : 'Accept Job'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AvailableJobs