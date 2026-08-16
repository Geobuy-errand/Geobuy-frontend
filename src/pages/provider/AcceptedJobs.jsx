import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetProviderServiceRequestsQuery, useStartServiceRequestMutation, useCompleteServiceRequestMutation } from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaPlay, FaCheck, FaUser, FaStar } from 'react-icons/fa'

const ServiceProviderAcceptedJobs = () => {
  const { data: requests, isLoading, refetch } = useGetProviderServiceRequestsQuery()
  const [startService] = useStartServiceRequestMutation()
  const [completeService] = useCompleteServiceRequestMutation()
  const [filter, setFilter] = useState('all')

  const acceptedRequests = requests?.filter(r => 
    r.status === 'provider_selected' || r.status === 'in_progress'
  ) || []

  const filteredJobs = acceptedRequests.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  const handleStart = async (jobId) => {
    try {
      await startService(jobId).unwrap()
      toast.success('Service started successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to start service')
    }
  }

  const handleComplete = async (jobId) => {
    if (!window.confirm('Mark this service as completed?')) return
    
    try {
      await completeService(jobId).unwrap()
      toast.success('Service completed successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to complete service')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'provider_selected': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">My Active Jobs</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('provider_selected')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'provider_selected' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          Selected
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'in_progress' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          In Progress
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
          <p className="text-text-light">No active jobs</p>
          <Link to="/service-provider/available-jobs" className="text-primary hover:underline mt-2 inline-block">
            Browse available requests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div key={job._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text">{job.serviceType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-text-light mt-1">{job.description}</p>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaMapMarkerAlt className="mr-1" />
                    {job.location?.address}
                  </div>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaUser className="mr-1" />
                    {job.customerId?.fullName}
                  </div>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaDollarSign className="mr-1" />
                    £{job.finalPrice?.toFixed(2) || 'Negotiating'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  {job.status === 'provider_selected' && (
                    <button
                      onClick={() => handleStart(job._id)}
                      className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 w-full md:w-auto"
                    >
                      <FaPlay />
                      <span>Start Service</span>
                    </button>
                  )}
                  {job.status === 'in_progress' && (
                    <button
                      onClick={() => handleComplete(job._id)}
                      className="btn-primary text-sm py-2 px-4 flex items-center space-x-2 w-full md:w-auto"
                    >
                      <FaCheck />
                      <span>Complete Service</span>
                    </button>
                  )}
                  <Link
                    to={`/service-provider/job/${job._id}`}
                    className="btn-outline text-sm py-2 px-4 w-full md:w-auto text-center"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ServiceProviderAcceptedJobs