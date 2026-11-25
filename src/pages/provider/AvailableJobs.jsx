import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useGetProviderServiceRequestsQuery, useSubmitQuoteMutation } from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaClock, FaSearch, FaUser, FaArrowRight } from 'react-icons/fa'
import useCountry from '../../hooks/useCountry'
import useLiveUpdates from '../../hooks/useLiveUpdates'
import IdentityBanner from '../../components/verification/IdentityBanner'
import { useGetIdentityStatusQuery } from '../../redux/services/identityApi'
import { PROVIDER_VIEWS, providerAction } from '../../utils/jobStages'

const ServiceProviderAvailableJobs = () => {
  const { format, country: userCountry } = useCountry()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') === 'quoted' ? 'quoted' : 'new'
  const setTab = (t) => setParams(t === 'new' ? {} : { tab: t }, { replace: true })

  // Polling is a fallback for phones (e.g. iPhone Safari) that pause the
  // live connection when the app is in the background.
  const { data: requests, isLoading, isError, error, refetch } = useGetProviderServiceRequestsQuery(undefined, {
    pollingInterval: 30000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const { data: identity } = useGetIdentityStatusQuery()
  const needsIdentity = identity?.required && !identity?.verified

  const [submitQuote, { isLoading: isSubmitting }] = useSubmitQuoteMutation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteMessage, setQuoteMessage] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')

  useLiveUpdates(['new-service-invite', 'new-service-request', 'negotiation-update', 'quote-accepted'], (name, data) => {
    if (name === 'new-service-invite' || name === 'new-service-request') toast.success(`📋 New service request${data?.serviceType ? `: ${data.serviceType}` : ''}`)
    if (name === 'negotiation-update' && data?.from === 'customer') toast(data.declined ? 'A customer declined your quote' : 'A customer sent you a counter-offer', { icon: '🔄' })
    refetch()
  })

  const all = requests || []
  const newRequests = all.filter(PROVIDER_VIEWS.new)
  const quoted = all.filter(PROVIDER_VIEWS.quoted)
  const respondCount = all.filter(PROVIDER_VIEWS.respond).length
  const list = tab === 'quoted' ? quoted : newRequests

  const filteredRequests = list.filter((request) => {
    const q = searchTerm.toLowerCase()
    const matchesSearch = !q || request.serviceType?.toLowerCase().includes(q) || request.description?.toLowerCase().includes(q)
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(all.map((r) => r.category).filter(Boolean))]

  const handleOpenQuoteModal = (request) => {
    setSelectedRequest(request)
    setQuoteAmount('')
    setQuoteMessage('')
    setEstimatedDuration('')
    setShowQuoteModal(true)
  }

  const handleSubmitQuote = async (e) => {
    e.preventDefault()
    
    if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      await submitQuote({
        serviceRequestId: selectedRequest._id,
        amount: parseFloat(quoteAmount),
        message: quoteMessage,
        estimatedDuration: parseFloat(estimatedDuration) || 1,
        availabilityStart: new Date().toISOString(),
        availabilityEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }).unwrap()
      
      toast.success('Quote submitted successfully!')
      setShowQuoteModal(false)
      refetch()
      setTab('quoted')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to submit quote')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-4">Service Requests</h1>

      {needsIdentity && <IdentityBanner status={identity} />}

      <div className="flex gap-2 mb-4" role="tablist">
        <button role="tab" aria-selected={tab === 'new'} onClick={() => setTab('new')} data-testid="tab-new"
          className={`px-4 py-2 rounded-full text-sm font-medium ${tab === 'new' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'}`}>
          New requests ({newRequests.length})
        </button>
        <button role="tab" aria-selected={tab === 'quoted'} onClick={() => setTab('quoted')} data-testid="tab-quoted"
          className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${tab === 'quoted' ? 'bg-primary text-white' : 'bg-gray-100 text-text-light hover:bg-gray-200'}`}>
          My quotes ({quoted.length})
          {respondCount > 0 && <span className="bg-yellow-400 text-yellow-900 text-xs rounded-full px-1.5">{respondCount}</span>}
        </button>
      </div>

      {isError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center justify-between gap-2">
          <span>{error?.status === 401 ? 'Your session has expired — please log in again.' : "We couldn't load your requests."}</span>
          <button onClick={refetch} className="underline">Try again</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field w-full md:w-48"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredRequests?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">{tab === 'quoted' ? "You haven't got any open quotes" : 'No new service requests at the moment'}</p>
          {tab === 'new' && quoted.length > 0 && (
            <button onClick={() => setTab('quoted')} className="text-primary hover:underline text-sm mt-2">See your quotes →</button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests?.map((request) => {
            const action = providerAction(request)
            return (
            <div
              key={request._id}
              data-testid="request-card"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/provider/job/${request._id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/provider/job/${request._id}`)}
              className="card hover:shadow-medium transition-shadow cursor-pointer"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-text">{request.serviceType}</h3>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full capitalize">
                      {request.category}
                    </span>
                    {request.isUrgent && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        🔴 Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-light mt-1">{request.description}</p>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaMapMarkerAlt className="mr-1" />
                    {request.location?.address}
                  </div>
                  <div className="flex items-center text-sm text-text-light mt-1">
                    <FaClock className="mr-1" />
                    {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'Flexible'} 
                    {request.preferredTime && ` at ${request.preferredTime}`}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {request.requiresDBS && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ {userCountry.code === 'NG' ? 'Background check required' : 'DBS Required'}</span>
                    )}
                    {request.requiresCertification && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">✅ Certification Required</span>
                    )}
                    {request.budget && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Budget: {format(request.budget)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-text-light mt-2">
                    <FaUser className="mr-1" />
                    {request.customerId?.fullName}
                  </div>
                </div>
                <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
                  {request.myQuote && (
                    <p className="text-sm text-text md:text-right">
                      {request.myQuote.lastOfferBy === 'customer' ? 'Customer offered ' : 'Your offer '}
                      <strong>{format(request.myQuote.amount)}</strong>
                    </p>
                  )}
                  {request.providerStage === 'pending_quote' ? (
                    <button
                      onClick={() => handleOpenQuoteModal(request)}
                      disabled={needsIdentity}
                      title={needsIdentity ? 'Verify your identity first' : undefined}
                      className="btn-primary text-sm py-2 px-6 w-full md:w-auto disabled:opacity-50"
                      data-testid="open-quote"
                    >
                      Submit Quote
                    </button>
                  ) : (
                    <Link
                      to={`/provider/job/${request._id}`}
                      className={`text-sm py-2 px-4 rounded-lg text-center flex items-center justify-center gap-1 ${action?.tone === 'warning' ? 'bg-yellow-100 text-yellow-900 font-medium' : 'btn-outline'}`}
                    >
                      {action?.label || 'Open'} <FaArrowRight className="text-xs" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text">Submit Quote</h2>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="text-text-light hover:text-text"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-text">{selectedRequest.serviceType}</p>
              <p className="text-sm text-text-light">{selectedRequest.description}</p>
            </div>

            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Quote Amount ({userCountry.currencySymbol}) *
                </label>
                <input
                  type="number"
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value)}
                  className="input-field"
                  placeholder="Enter your price"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Estimated Duration (hours)
                </label>
                <input
                  type="number"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="input-field"
                  placeholder="e.g., 2"
                  step="0.5"
                  min="0.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Message to Customer
                </label>
                <textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="Add a message to the customer..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceProviderAvailableJobs