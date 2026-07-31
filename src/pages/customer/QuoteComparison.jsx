import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetServiceRequestByIdQuery, useGetQuotesQuery, useSelectQuoteMutation } from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { 
  FaUser, 
  FaStar, 
  FaClock, 
  FaDollarSign, 
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaUserCheck,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa'

const QuoteComparison = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showProviderDetails, setShowProviderDetails] = useState(null)

  const { data: request, isLoading: requestLoading } = useGetServiceRequestByIdQuery(id)
  const { data: quotes, isLoading: quotesLoading } = useGetQuotesQuery(id)
  const [selectQuote, { isLoading: isSelecting }] = useSelectQuoteMutation()

  const handleSelectQuote = async (quoteId) => {
    if (!window.confirm('Are you sure you want to select this provider?')) return

    try {
      await selectQuote(quoteId).unwrap()
      toast.success('Provider selected successfully!')
      navigate(`/customer/service-request/${id}`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to select provider')
    }
  }

  const formatDate = (date) => {
    if (!date) return 'Not specified'
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (requestLoading || quotesLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-64 rounded-xl"></div>
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!request || !quotes) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Request not found</p>
        <button onClick={() => navigate('/customer/service-requests')} className="text-primary hover:underline mt-2">
          Back to requests
        </button>
      </div>
    )
  }

  const sortedQuotes = [...quotes].sort((a, b) => a.amount - b.amount)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors mb-6"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* Request Summary */}
      <div className="card mb-6">
        <h1 className="text-2xl font-bold text-text mb-2">Compare Quotes</h1>
        <p className="text-text-light">
          {request.category} - {request.serviceType}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <span className="text-sm text-text-lighter">Location</span>
            <p className="text-text">{request.location?.address || 'Not specified'}</p>
          </div>
          <div>
            <span className="text-sm text-text-lighter">Preferred Date</span>
            <p className="text-text">{formatDate(request.preferredDate)}</p>
          </div>
          <div>
            <span className="text-sm text-text-lighter">Budget</span>
            <p className="text-text">£{request.budget?.toFixed(2) || 'Not specified'}</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-text-light text-sm">{request.description}</p>
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {sortedQuotes.map((quote, index) => {
          const isSelected = quote.isSelected
          const isLowest = index === 0 && !isSelected
          const provider = quote.providerId

          return (
            <div
              key={quote._id}
              className={`card transition-all duration-200 ${
                isSelected ? 'border-2 border-green-500 bg-green-50' :
                isLowest ? 'border-2 border-primary' :
                'hover:shadow-medium'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Provider Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-primary text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-text">{provider?.fullName}</h3>
                        <div className="flex items-center text-sm text-yellow-500">
                          <FaStar />
                          <span className="ml-1 text-text-light">
                            {provider?.averageRating?.toFixed(1) || 'New'}
                          </span>
                        </div>
                        <span className="text-xs text-text-lighter">
                          ({provider?.totalReviews || 0} reviews)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {provider?.verificationBadges?.includes('dbs_checked') && (
                          <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <FaCheckCircle className="mr-1" /> DBS Checked
                          </span>
                        )}
                        {provider?.verificationBadges?.includes('insured') && (
                          <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            <FaShieldAlt className="mr-1" /> Insured
                          </span>
                        )}
                        {provider?.verificationBadges?.includes('certified') && (
                          <span className="flex items-center text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            <FaCheckCircle className="mr-1" /> Certified
                          </span>
                        )}
                        {isLowest && !isSelected && (
                          <span className="flex items-center text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                            Best Price
                          </span>
                        )}
                        {isSelected && (
                          <span className="flex items-center text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      {quote.message && (
                        <p className="text-sm text-text-light mt-2">"{quote.message}"</p>
                      )}
                      <button
                        onClick={() => setShowProviderDetails(showProviderDetails === quote._id ? null : quote._id)}
                        className="text-xs text-primary hover:underline mt-1"
                      >
                        {showProviderDetails === quote._id ? 'Hide details' : 'Show details'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Provider Details */}
                  {showProviderDetails === quote._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-text mb-2">Contact Information</h4>
                        <div className="space-y-1 text-sm text-text-light">
                          <p className="flex items-center space-x-2">
                            <FaPhone className="text-primary" />
                            <span>{provider?.phoneNumber}</span>
                          </p>
                          <p className="flex items-center space-x-2">
                            <FaEnvelope className="text-primary" />
                            <span>{provider?.email}</span>
                          </p>
                          {provider?.address && (
                            <p className="flex items-center space-x-2">
                              <FaMapMarkerAlt className="text-primary" />
                              <span>{provider.address.street}, {provider.address.town}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-text mb-2">Service Details</h4>
                        <div className="space-y-1 text-sm text-text-light">
                          <p>Estimated Duration: {quote.estimatedDuration || 'Not specified'} hours</p>
                          <p>Available: {formatDate(quote.availability?.startDate)} - {formatDate(quote.availability?.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quote Price and Actions */}
                <div className="flex flex-col items-end gap-2 min-w-[150px]">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">£{quote.amount.toFixed(2)}</span>
                    <p className="text-xs text-text-lighter">Quote amount</p>
                  </div>
                  {!isSelected && request.status !== 'provider_selected' && (
                    <button
                      onClick={() => handleSelectQuote(quote._id)}
                      disabled={isSelecting}
                      className="btn-primary text-sm py-2 px-6 disabled:opacity-50"
                    >
                      {isSelecting ? 'Selecting...' : 'Select Provider'}
                    </button>
                  )}
                  {isSelected && (
                    <span className="text-green-600 font-medium flex items-center space-x-1">
                      <FaCheckCircle />
                      <span>Selected</span>
                    </span>
                  )}
                  {request.status === 'provider_selected' && !isSelected && (
                    <span className="text-gray-500 text-sm">Not selected</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {quotes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-light">No quotes received yet</p>
            <p className="text-sm text-text-lighter mt-1">Check back later or expand your request</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteComparison