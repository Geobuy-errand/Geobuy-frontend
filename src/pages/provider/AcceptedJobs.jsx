import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from '../../redux/services/bookingApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaPlay, FaCheck, FaTimes } from 'react-icons/fa'

const AcceptedJobs = () => {
  const { data: bookings, isLoading } = useGetBookingsQuery()
  const [updateStatus] = useUpdateBookingStatusMutation()
  const [filter, setFilter] = useState('all')

  const acceptedJobs = bookings?.filter(b => 
    b.status === 'accepted' || b.status === 'in_progress'
  ) || []

  const filteredJobs = acceptedJobs.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  const handleStatusUpdate = async (jobId, status) => {
    try {
      await updateStatus({ id: jobId, status }).unwrap()
      toast.success(`Job ${status} successfully`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">My Jobs</h1>

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
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'accepted' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          Accepted
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

      {/* Jobs List */}
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
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaMapMarkerAlt className="mr-1" />
                    {job.pickup?.address}
                  </div>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaClock className="mr-1" />
                    {new Date(job.date).toLocaleDateString()} at {job.time}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="flex items-center text-xl font-bold text-primary">
                    <FaDollarSign className="text-lg" />
                    {job.estimatedPrice?.toFixed(2)}
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {job.status === 'accepted' && (
                      <button
                        onClick={() => handleStatusUpdate(job._id, 'in_progress')}
                        className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 w-full md:w-auto"
                      >
                        <FaPlay />
                        <span>Start</span>
                      </button>
                    )}
                    {job.status === 'in_progress' && (
                      <button
                        onClick={() => handleStatusUpdate(job._id, 'completed')}
                        className="btn-primary text-sm py-2 px-4 flex items-center space-x-2 w-full md:w-auto"
                      >
                        <FaCheck />
                        <span>Complete</span>
                      </button>
                    )}
                    <Link
                      to={`/provider/job/${job._id}`}
                      className="btn-outline text-sm py-2 px-4 w-full md:w-auto text-center"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AcceptedJobs