import React, { useState, useEffect } from 'react'
import { useGetProviderServiceRequestsQuery, useSubmitQuoteMutation } from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaDollarSign, FaClock, FaCheck, FaSearch, FaRuler, FaUser, FaStar } from 'react-icons/fa'
import { io } from 'socket.io-client'

const ServiceProviderAvailableJobs = () => {
  const [socket, setSocket] = useState(null)
  const { data: requests, isLoading, refetch } = useGetProviderServiceRequestsQuery()
  const { data: invitedRequests } = useGetProviderServiceRequestsQuery()

  const [submitQuote, { isLoading: isSubmitting }] = useSubmitQuoteMutation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteMessage, setQuoteMessage] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    })

    newSocket.on('connect', () => {
      console.log('✅ Socket connected')
    })

    newSocket.on('new-service-request', (data) => {
      toast.success(`📋 New service request: ${data.serviceType}`)
      refetch()
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [refetch])

  // Filter pending requests (not yet quoted or accepted)
  const pendingRequests = requests?.filter(r => 
    r.status === 'pending' || r.status === 'quotes_received'
  ) || []

  const filteredRequests = pendingRequests?.filter(request => {
    const matchesSearch = request.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || request.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(requests?.map(r => r.category) || [])]

  const invitedRequestsList = requests?.filter(r => 
    r.invitedProviders?.some(p => p.providerId === user._id && p.status === 'invited')
  ) || []

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
    } catch (error) {
      toast.error(error.data?.message || 'Failed to submit quote')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Available Service Requests</h1>

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
          <p className="text-text-light">No available service requests at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests?.map((request) => (
            <div key={request._id} className="card hover:shadow-medium transition-shadow">
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
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ DBS Required</span>
                    )}
                    {request.requiresCertification && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">✅ Certification Required</span>
                    )}
                    {request.budget && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Budget: £{request.budget.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-text-light mt-2">
                    <FaUser className="mr-1" />
                    {request.customerId?.fullName}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <button
                    onClick={() => handleOpenQuoteModal(request)}
                    className="btn-primary text-sm py-2 px-6 w-full md:w-auto"
                  >
                    Submit Quote
                  </button>
                </div>
              </div>
            </div>
          ))}
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
                  Quote Amount (£) *
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