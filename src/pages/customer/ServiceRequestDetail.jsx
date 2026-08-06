import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetServiceRequestByIdQuery, useAcceptQuoteMutation, useRejectQuoteMutation, useNegotiateQuoteMutation } from '../../redux/services/serviceApi'
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
  FaPaperPlane
} from 'react-icons/fa'

const ServiceRequestDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: request, isLoading, refetch } = useGetServiceRequestByIdQuery(id)
  const [acceptQuote] = useAcceptQuoteMutation()
  const [rejectQuote] = useRejectQuoteMutation()
  const [negotiateQuote] = useNegotiateQuoteMutation()
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')
  const [negotiationMessage, setNegotiationMessage] = useState('')
  const [selectedQuoteId, setSelectedQuoteId] = useState(null)

  const isCustomer = user?._id === request?.customerId?._id
  const isProvider = user?._id === request?.selectedProviderId?._id

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

  const handleAcceptQuote = async (quoteId) => {
    try {
      await acceptQuote({ quoteId }).unwrap()
      toast.success('Quote accepted! Provider has been notified.')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to accept quote')
    }
  }

  const handleRejectQuote = async (quoteId) => {
    if (!window.confirm('Are you sure you want to reject this quote?')) return
    try {
      await rejectQuote({ quoteId }).unwrap()
      toast.success('Quote rejected')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to reject quote')
    }
  }

  const handleNegotiate = async (quoteId) => {
    if (!counterAmount || parseFloat(counterAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      await negotiateQuote({
        quoteId,
        counterAmount: parseFloat(counterAmount),
        message: negotiationMessage,
      }).unwrap()
      toast.success('Counter-offer sent!')
      setCounterAmount('')
      setNegotiationMessage('')
      setShowNegotiation(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to send counter-offer')
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

  if (!request) {
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

        {/* Matched Providers */}
        {request.matchedProviders?.length > 0 && (
          <div className="card md:col-span-2">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
              <FaUsers className="mr-2 text-primary" />
              Matched Providers ({request.matchedProviders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.matchedProviders.map((match) => (
                <div key={match.providerId._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-text">{match.providerId.fullName}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center text-sm text-yellow-500">
                          <FaStar />
                          <span className="ml-1 text-text-light">
                            {match.providerId.averageRating?.toFixed(1) || 'New'}
                          </span>
                        </div>
                        <span className="text-xs text-text-lighter">
                          ({match.providerId.totalReviews || 0} reviews)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {match.matchScore && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Match: {Math.round(match.matchScore)}%
                          </span>
                        )}
                        {match.distance && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {match.distance.toFixed(1)} km away
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      match.status === 'responded' ? 'bg-green-100 text-green-700' :
                      match.status === 'invited' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quotes & Negotiation */}
        {request.quotes?.length > 0 && (
          <div className="card md:col-span-2">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
              <FaComments className="mr-2 text-primary" />
              Quotes & Negotiation
            </h2>
            <div className="space-y-4">
              {request.quotes.map((quote) => (
                <div key={quote._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <p className="font-semibold text-text">{quote.providerId.fullName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          quote.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          quote.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-primary mt-1">£{quote.amount.toFixed(2)}</p>
                      {quote.message && (
                        <p className="text-sm text-text-light mt-1">"{quote.message}"</p>
                      )}
                      <p className="text-xs text-text-lighter mt-1">
                        Estimated duration: {quote.estimatedDuration || 'Not specified'} hours
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isCustomer && quote.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptQuote(quote._id)}
                            className="btn-primary text-sm py-1 px-3"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              setSelectedQuoteId(quote._id)
                              setShowNegotiation(true)
                            }}
                            className="btn-outline text-sm py-1 px-3"
                          >
                            Negotiate
                          </button>
                          <button
                            onClick={() => handleRejectQuote(quote._id)}
                            className="text-red-600 hover:text-red-700 text-sm py-1 px-3"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {quote.status === 'accepted' && (
                        <span className="flex items-center text-green-600">
                          <FaCheckCircle className="mr-1" />
                          Accepted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Negotiation UI */}
                  {showNegotiation && selectedQuoteId === quote._id && isCustomer && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-medium text-text mb-2">Make Counter-Offer</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-text-light mb-1">
                            Your Offer (£)
                          </label>
                          <input
                            type="number"
                            value={counterAmount}
                            onChange={(e) => setCounterAmount(e.target.value)}
                            className="input-field"
                            placeholder="Enter your offer"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-light mb-1">
                            Message (Optional)
                          </label>
                          <textarea
                            value={negotiationMessage}
                            onChange={(e) => setNegotiationMessage(e.target.value)}
                            rows="2"
                            className="input-field resize-none"
                            placeholder="Add a message..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleNegotiate(quote._id)}
                            className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
                          >
                            <FaPaperPlane />
                            <span>Send Counter-Offer</span>
                          </button>
                          <button
                            onClick={() => {
                              setShowNegotiation(false)
                              setSelectedQuoteId(null)
                              setCounterAmount('')
                              setNegotiationMessage('')
                            }}
                            className="btn-outline text-sm py-2 px-4"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Negotiation History */}
            {request.negotiationHistory?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-text mb-2 flex items-center">
                  <FaHandshake className="mr-2 text-primary" />
                  Negotiation History
                </h4>
                <div className="space-y-2">
                  {request.negotiationHistory.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${
                        entry.from === 'customer' ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        {entry.from === 'customer' ? 'C' : 'P'}
                      </div>
                      <div>
                        <p className="text-sm text-text-light">
                          <span className="font-medium">{entry.from === 'customer' ? 'You' : 'Provider'}</span>
                          {entry.offerAmount && ` offered £${entry.offerAmount.toFixed(2)}`}
                          {entry.status === 'accepted' && ' ✅ Accepted'}
                          {entry.status === 'rejected' && ' ❌ Rejected'}
                        </p>
                        {entry.message && (
                          <p className="text-sm text-text-lighter">"{entry.message}"</p>
                        )}
                        <p className="text-xs text-text-lighter">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

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
                {request.finalPrice && (
                  <div className="mt-2 p-2 bg-primary/5 rounded-lg">
                    <p className="text-sm text-text-light">Final Price</p>
                    <p className="text-xl font-bold text-primary">£{request.finalPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {isCustomer && request.status === 'quotes_received' && !request.selectedProviderId && (
          <div className="md:col-span-2 flex justify-center gap-4">
            <Link
              to={`/customer/quote-comparison/${request._id}`}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Compare Quotes</span>
              <FaCheckCircle />
            </Link>
          </div>
        )}

        {isCustomer && request.status === 'provider_selected' && (
          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={async () => {
                try {
                  await completeServiceRequest(request._id).unwrap()
                  toast.success('Service request completed!')
                  refetch()
                } catch (error) {
                  toast.error(error.data?.message || 'Failed to complete')
                }
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FaCheckCircle />
              <span>Mark as Completed</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceRequestDetail