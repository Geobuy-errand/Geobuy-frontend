import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetServiceRequestByIdQuery, useInviteProvidersMutation } from '../../redux/services/serviceApi'
import { useSelector } from 'react-redux'
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
  FaStar,
  FaComments,
  FaHandshake,
  FaTimesCircle,
  FaPaperPlane,
  FaUsers,
  FaCheck,
  FaSpinner,
} from 'react-icons/fa'

const ServiceRequestDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: request, isLoading, refetch } = useGetServiceRequestByIdQuery(id)
  const [inviteProviders, { isLoading: isInviting }] = useInviteProvidersMutation()
  const [selectedProviders, setSelectedProviders] = useState([])
  const [showInviteModal, setShowInviteModal] = useState(false)

  const isCustomer = user?._id === request?.customerId?._id

  const handleInviteProviders = async () => {
    if (selectedProviders.length === 0) {
      toast.error('Please select at least one provider to invite')
      return
    }

    try {
      await inviteProviders({
        requestId: id,
        providerIds: selectedProviders,
      }).unwrap()
      
      toast.success(`Invited ${selectedProviders.length} provider(s)`)
      setSelectedProviders([])
      setShowInviteModal(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to invite providers')
    }
  }

  const toggleProviderSelection = (providerId) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    )
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

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Request not found</p>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline mt-2">
          Go back
        </button>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'quotes_received': return 'bg-blue-100 text-blue-700'
      case 'negotiating': return 'bg-purple-100 text-purple-700'
      case 'provider_selected': return 'bg-green-100 text-green-700'
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
      case 'negotiating': return 'Negotiating'
      case 'provider_selected': return 'Provider Selected'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  // Providers that have been invited or matched
  const matchedProviders = request.matchedProviders || []
  const invitedProviders = request.invitedProviders || []
  
  // Combine and deduplicate
  const allProviders = [...matchedProviders, ...invitedProviders]
  const uniqueProviders = allProviders.reduce((acc, current) => {
    const exists = acc.find(item => item.providerId._id === current.providerId._id)
    if (!exists) {
      acc.push(current)
    }
    return acc
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors mb-6"
      >
        <FaArrowLeft />
        <span>Back</span>
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
              <span className="font-medium text-primary">£{request.budget?.toFixed(2) || 'Negotiable'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Service Fee</span>
              <span className="font-medium">£{request.serviceFee?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-light">Urgent</span>
              <span className="font-medium">{request.isUrgent ? 'Yes' : 'No'}</span>
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
          </div>
        </div>
      </div>

      {/* Matched Providers Section */}
      {isCustomer && request.status === 'pending' && (
        <div className="card mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-text flex items-center">
              <FaUsers className="mr-2 text-primary" />
              Available Providers ({uniqueProviders.length})
            </h2>
            {uniqueProviders.length > 0 && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
              >
                <FaPaperPlane />
                <span>Invite Selected</span>
              </button>
            )}
          </div>

          {uniqueProviders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-light">No providers available for this service yet</p>
              <p className="text-sm text-text-lighter mt-1">Check back later or expand your search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uniqueProviders.map((match) => {
                const provider = match.providerId
                const isInvited = match.status === 'invited'
                const hasQuoted = match.quote?.amount > 0
                
                return (
                  <div key={provider._id} className={`p-4 rounded-lg border ${isInvited ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-text">{provider.fullName}</p>
                          {isInvited && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Invited
                            </span>
                          )}
                          {hasQuoted && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Quoted £{match.quote.amount}
                            </span>
                          )}
                        </div>
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
                          {match.distance && (
                            <span className="text-xs text-text-lighter">
                              • {match.distance.toFixed(1)} miles away
                            </span>
                          )}
                          {match.matchScore && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {Math.round(match.matchScore)}% match
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-light mt-1">{match.about || 'Professional service provider'}</p>
                      </div>
                      {isCustomer && !isInvited && (
                        <input
                          type="checkbox"
                          checked={selectedProviders.includes(provider._id)}
                          onChange={() => toggleProviderSelection(provider._id)}
                          className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary mt-1"
                        />
                      )}
                      {isInvited && (
                        <FaCheckCircle className="text-green-500 text-xl" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text">Invite Providers</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-text-light hover:text-text"
              >
                ✕
              </button>
            </div>

            <p className="text-text-light mb-4">
              Selected {selectedProviders.length} provider(s) to invite. They will be notified and can submit quotes.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {uniqueProviders.map((match) => {
                const provider = match.providerId
                const isSelected = selectedProviders.includes(provider._id)
                return (
                  <div
                    key={provider._id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleProviderSelection(provider._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-text">{provider.fullName}</p>
                        <div className="flex items-center space-x-2 text-sm text-text-light">
                          <span>⭐ {provider.averageRating?.toFixed(1) || 'New'}</span>
                          <span>• {match.distance?.toFixed(1) || '?'} miles</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                        {isSelected && <FaCheck className="text-white text-xs mt-1 mx-auto" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteProviders}
                disabled={isInviting || selectedProviders.length === 0}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isInviting ? (
                  <FaSpinner className="animate-spin mx-auto" />
                ) : (
                  `Invite ${selectedProviders.length} Provider(s)`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceRequestDetail