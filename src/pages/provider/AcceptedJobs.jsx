import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetProviderServiceRequestsQuery, useStartServiceRequestMutation, useMarkServiceDoneMutation } from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaPlay, FaCheck, FaUser, FaStar } from 'react-icons/fa'
import useCountry from '../../hooks/useCountry'
import useLiveUpdates from '../../hooks/useLiveUpdates'

const ServiceProviderAcceptedJobs = () => {
  const { format, country: userCountry, distanceUnitLabel } = useCountry()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { data: requests, isLoading, refetch } = useGetProviderServiceRequestsQuery(undefined, { pollingInterval: 30000, refetchOnFocus: true })
  const [startService] = useStartServiceRequestMutation()
  const [markDone] = useMarkServiceDoneMutation()
  const filter = params.get('filter') || 'all'
  const setFilter = (f) => setParams(f === 'all' ? {} : { filter: f }, { replace: true })
  const { user } = useSelector((state) => state.auth)

  useLiveUpdates(['quote-accepted', 'service-paid', 'funds-released', 'negotiation-update'], () => refetch())

  // Only jobs awarded to THIS provider (the list also contains requests
  // they were invited to that went to someone else).
  const isMine = (r) => r.isMine ?? String(r.selectedProviderId?._id || r.selectedProviderId || '') === String(user?._id || user?.id || '')
  const acceptedRequests = requests?.filter(r =>
    isMine(r) && ['provider_selected', 'in_progress', 'awaiting_confirmation', ...(filter === 'completed' ? ['completed'] : [])].includes(r.status)
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
    if (!window.confirm('Mark this job as done? The customer will be asked to confirm, then your earnings go to your wallet.')) return

    try {
      const res = await markDone(jobId).unwrap()
      toast.success(res.message || 'Marked as done')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update job')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'provider_selected': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-purple-100 text-purple-700'
      case 'awaiting_confirmation': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">My Active Jobs</h1>

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
        <button
          onClick={() => setFilter('awaiting_confirmation')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'awaiting_confirmation' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          Done
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'completed' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'
          }`}
        >
          Completed
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
          <Link to="/provider/available-jobs" className="text-primary hover:underline mt-2 inline-block">
            Browse available requests
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              data-testid="active-job-card"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/provider/job/${job._id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/provider/job/${job._id}`)}
              className="card hover:shadow-medium transition-shadow cursor-pointer"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-text">{job.serviceType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status === 'awaiting_confirmation' ? 'waiting for customer' : job.status.replace(/_/g, ' ')}
                    </span>
                    {job.paymentStatus === 'pending' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">awaiting payment</span>
                    )}
                    {job.paymentStatus === 'paid' && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">paid</span>
                    )}
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
                    {job.finalPrice != null ? format(job.finalPrice) : 'Negotiating'}
                    {job.providerAmount != null && <span className="ml-2 text-green-700">(you receive {format(job.providerAmount)})</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
                  {job.status === 'provider_selected' && (
                    <button
                      onClick={() => handleStart(job._id)}
                      disabled={job.paymentStatus === 'pending'}
                      title={job.paymentStatus === 'pending' ? 'Waiting for the customer to pay' : undefined}
                      className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <span>Mark Job Done</span>
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
          ))}
        </div>
      )}
    </div>
  )
}

export default ServiceProviderAcceptedJobs