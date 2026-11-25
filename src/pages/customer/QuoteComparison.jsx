import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetServiceRequestByIdQuery, useGetQuotesQuery } from '../../redux/services/serviceApi'
import NegotiationPanel from '../../components/services/NegotiationPanel'
import useLiveUpdates from '../../hooks/useLiveUpdates'
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
import useCountry from '../../hooks/useCountry'
import { backgroundCheckLabel } from '../../config/countries'

const QuoteComparison = () => {
  const { format, country: userCountry, distanceUnitLabel } = useCountry()
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [showProviderDetails, setShowProviderDetails] = useState(null)

  // Poll as a fallback for phones that drop the live connection in the background
  const { data: request, isLoading: requestLoading, refetch: refetchRequest } = useGetServiceRequestByIdQuery(id, { pollingInterval: 30000 })
  const { data: quotes, isLoading: quotesLoading, refetch: refetchQuotes } = useGetQuotesQuery(id, { pollingInterval: 30000 })
  const refresh = () => {
    refetchRequest()
    refetchQuotes()
  }

  // New quotes and counter-offers appear without reloading
  useLiveUpdates(['new-quote', 'negotiation-update', 'quote-accepted'], (name, data) => {
    if (data?.serviceRequestId && String(data.serviceRequestId) !== String(id)) return
    if (name === 'negotiation-update' && data?.from === 'provider') toast(data.declined ? 'A provider withdrew their quote' : 'The provider sent a new offer', { icon: '🔄' })
    refresh()
  }, { rooms: [{ type: 'booking', id }] })

  const goToBooking = () => navigate(`/customer/service-request/${id}`)

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
        <button onClick={() => navigate('/customer/service-history')} className="text-primary hover:underline mt-2">
          Back to requests
        </button>
      </div>
    )
  }

  // Open quotes first (cheapest first), then the closed ones
  const rank = (q) => (q.isSelected ? 0 : q.status === 'pending' ? 1 : 2)
  const sortedQuotes = [...quotes].sort((a, b) => rank(a) - rank(b) || a.amount - b.amount)
  const isOpen = ['pending', 'quotes_received', 'negotiating'].includes(request.status)
  const yourTurn = quotes.filter((q) => q.status === 'pending' && q.lastOfferBy !== 'customer').length

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
            <p className="text-text">{request.budget != null ? format(request.budget) : 'Not specified'}</p>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-text-light text-sm">{request.description}</p>
        </div>
      </div>

      {!isOpen && request.selectedProviderId && (
        <div className="card mb-6 border-2 border-green-500 bg-green-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-testid="booked-banner">
          <div>
            <p className="font-semibold text-text">You booked {request.selectedProviderId?.fullName || 'a provider'} for {format(request.finalPrice)}</p>
            <p className="text-sm text-text-light">{request.paymentStatus === 'pending' ? 'Pay now to confirm the booking.' : 'Follow the job, chat and confirm when it is done.'}</p>
          </div>
          <button onClick={goToBooking} className="btn-primary text-sm py-2 px-5">{request.paymentStatus === 'pending' ? 'Pay now' : 'Open booking'}</button>
        </div>
      )}
      {isOpen && quotes.length > 0 && (
        <p className="text-sm text-text-light mb-4" data-testid="quotes-summary">
          {quotes.length} quote{quotes.length === 1 ? '' : 's'} · {yourTurn > 0 ? `${yourTurn} waiting for your answer` : 'waiting for providers to respond'}
        </p>
      )}

      {/* Quotes List */}
      <div className="space-y-4">
        {sortedQuotes.map((quote, index) => {
          const isSelected = quote.isSelected
          const isLowest = index === 0 && !isSelected && quote.status === 'pending' && quotes.filter((q) => q.status === 'pending').length > 1
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
                        {provider?.verificationBadges?.includes('id_checked') && (
                          <span className="flex items-center text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            <FaUserCheck className="mr-1" /> ID verified
                          </span>
                        )}
                        {quote.status === 'rejected' && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Declined</span>
                        )}
                        {quote.status === 'pending' && quote.lastOfferBy === 'customer' && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Waiting for provider</span>
                        )}
                        {quote.status === 'pending' && quote.lastOfferBy === 'provider' && (quote.counterCount || 0) > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">New offer</span>
                        )}
                        {provider?.verificationBadges?.includes('dbs_checked') && (
                          <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            <FaCheckCircle className="mr-1" /> {backgroundCheckLabel(userCountry.code)}
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

                {/* Quote Price */}
                <div className="flex flex-col items-start md:items-end gap-1 min-w-[150px]">
                  <span className="text-2xl font-bold text-primary">{format(quote.amount)}</span>
                  <p className="text-xs text-text-lighter">
                    {quote.originalAmount != null && Number(quote.originalAmount) !== Number(quote.amount)
                      ? <>Quoted {format(quote.originalAmount)}</>
                      : 'Quote amount'}
                  </p>
                  {isSelected && (
                    <span className="text-green-600 font-medium flex items-center space-x-1">
                      <FaCheckCircle />
                      <span>Booked</span>
                    </span>
                  )}
                  {!isOpen && !isSelected && quote.status !== 'rejected' && (
                    <span className="text-gray-500 text-sm">Not selected</span>
                  )}
                </div>
              </div>

              {/* Negotiation: accept, counter or decline */}
              {isOpen && quote.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <NegotiationPanel
                    role="customer"
                    quote={quote}
                    history={quote.history}
                    format={format}
                    currencySymbol={userCountry.currencySymbol}
                    onBooked={goToBooking}
                    onChanged={refresh}
                  />
                </div>
              )}
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