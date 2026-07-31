import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetServiceRequestByIdQuery } from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { 
  FaArrowLeft, 
  FaUser, 
  FaClock, 
  FaMapMarkerAlt, 
  FaCalendar,
  FaDollarSign,
  FaCheckCircle,
  FaInfoCircle,
  FaEnvelope,
  FaPhone,
  FaStar
} from 'react-icons/fa'

const ServiceRequestDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: request, isLoading, error } = useGetServiceRequestByIdQuery(id)

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'quotes_received': return 'bg-blue-100 text-blue-700'
      case 'provider_selected': return 'bg-purple-100 text-purple-700'
      case 'in_progress': return 'bg-indigo-100 text-indigo-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Awaiting Quotes'
      case 'quotes_received': return 'Quotes Received'
      case 'provider_selected': return 'Provider Selected'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-64 rounded-xl"></div>
        <div className="mt-6 space-y-4">
          <div className="skeleton h-32 rounded-xl"></div>
          <div className="skeleton h-32 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Request not found</p>
        <button onClick={() => navigate('/customer/service-requests')} className="text-primary hover:underline mt-2">
          Back to requests
        </button>
      </div>
    )
  }

  const provider = request.selectedProviderId

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/customer/service-requests')}
        className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors mb-6"
      >
        <FaArrowLeft />
        <span>Back to Requests</span>
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">
              {request.category} - {request.serviceType}
            </h1>
            <p className="text-text-light">Request #{request.requestId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {getStatusLabel(request.status)}
          </span>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-text-light">{request.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Request Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-text-light">Category</span>
              <span className="font-medium capitalize">{request.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Service Type</span>
              <span className="font-medium">{request.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Budget</span>
              <span className="font-medium text-primary">£{request.budget?.toFixed(2) || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Urgent</span>
              <span className="font-medium">{request.isUrgent ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Requires DBS</span>
              <span className="font-medium">{request.requiresDBS ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Requires Certification</span>
              <span className="font-medium">{request.requiresCertification ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Location & Date */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Location & Schedule</h2>
          <div className="space-y-3">
            {request.location?.address && (
              <div>
                <span className="text-text-light">Location</span>
                <p className="text-text flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                  <span>{request.location.address}</span>
                </p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-light">Preferred Date</span>
              <span className="font-medium">
                {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Preferred Time</span>
              <span className="font-medium">{request.preferredTime || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Created</span>
              <span className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Selected Provider */}
        {provider && (
          <div className="card md:col-span-2">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
              <FaUser className="mr-2 text-primary" />
              Selected Provider
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaUser className="text-primary text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-text">{provider.fullName}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center text-sm text-yellow-500">
                      <FaStar />
                      <span className="ml-1 text-text-light">
                        {provider.averageRating?.toFixed(1) || 'New'}
                      </span>
                    </div>
                    <span className="text-xs text-text-lighter">
                      ({provider.totalReviews || 0} reviews)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {provider.verificationBadges?.includes('dbs_checked') && (
                      <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <FaCheckCircle className="mr-1" /> DBS Checked
                      </span>
                    )}
                    {provider.verificationBadges?.includes('insured') && (
                      <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        <FaCheckCircle className="mr-1" /> Insured
                      </span>
                    )}
                    {provider.verificationBadges?.includes('certified') && (
                      <span className="flex items-center text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        <FaCheckCircle className="mr-1" /> Certified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link
                  to={`/provider/${provider._id}`}
                  className="btn-outline text-sm py-1 px-4"
                >
                  View Profile
                </Link>
                <div className="flex items-center space-x-2 text-sm text-text-light">
                  <FaPhone className="text-text-lighter" />
                  <span>{provider.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-text-light">
                  <FaEnvelope className="text-text-lighter" />
                  <span>{provider.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {request.status === 'quotes_received' && !request.selectedProviderId && (
          <div className="md:col-span-2 flex justify-center">
            <Link
              to={`/customer/quote-comparison/${request._id}`}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Compare Quotes</span>
              <FaCheckCircle />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceRequestDetail