import React, { useState } from 'react'
import { useGetMyConnectionsQuery, useCancelConnectionMutation, useRateConnectionMutation } from '../../redux/services/connectionApi'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { 
  FaSearch, FaStar, FaCalendar, FaMapMarkerAlt, FaClock, 
  FaEye, FaTimes, FaCheck, FaSpinner,
  FaEnvelope, FaPhone, FaTag
} from 'react-icons/fa'
import ConnectionDetailModal from '../../components/modals/ConnectionDetailModal'

const CustomerConnections = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingScore, setRatingScore] = useState(0)
  const [ratingFeedback, setRatingFeedback] = useState('')
  
  const { data, isLoading, refetch } = useGetMyConnectionsQuery({
    status: statusFilter || '',
    limit: 20,
  })
  
  const [cancelConnection, { isLoading: isCancelling }] = useCancelConnectionMutation()
  const [rateConnection, { isLoading: isRating }] = useRateConnectionMutation()

  const connections = data?.data || []
  const pagination = data?.pagination
  const hasPaid = data?.hasPaidConnectionFee || false

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const getPurposeLabel = (purpose) => {
    const labels = {
      professional_networking: '🤝 Professional Networking',
      mentorship: '🎓 Mentorship',
      collaboration: '🤲 Collaboration',
      business_partnership: '💼 Business Partnership',
      social_networking: '👋 Social Networking',
      job_referral: '💼 Job Referral',
      skill_sharing: '🔄 Skill Sharing',
      community_engagement: '🏘️ Community Engagement',
      other: '📋 Other',
    }
    return labels[purpose] || purpose
  }

  const handleViewDetails = (connection) => {
    setSelectedConnection(connection)
    setShowDetailModal(true)
  }

  const handleCancel = async () => {
    if (!selectedConnection) return
    
    try {
      await cancelConnection({
        id: selectedConnection._id,
        reason: cancelReason || 'Cancelled by user'
      }).unwrap()
      toast.success('Connection cancelled successfully')
      setShowCancelModal(false)
      setCancelReason('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to cancel connection')
    }
  }

  const handleRate = async () => {
    if (!selectedConnection || ratingScore === 0) {
      toast.error('Please select a rating')
      return
    }
    
    try {
      await rateConnection({
        id: selectedConnection._id,
        score: ratingScore,
        feedback: ratingFeedback
      }).unwrap()
      toast.success('Rating submitted successfully!')
      setShowRatingModal(false)
      setRatingScore(0)
      setRatingFeedback('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to submit rating')
    }
  }

  const canRate = (connection) => {
    return connection.status === 'completed' && !connection.rating?.score
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">My Connections</h1>
          <p className="text-text-light text-sm">
            {hasPaid ? '✅ Fee paid - Create unlimited connections' : '⚠️ Please pay the connection fee to create connections'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-light">Total: {pagination?.total || 0}</span>
          {!hasPaid && (
            <button
              onClick={() => window.location.href = '/customer/connect'}
              className="btn-primary text-sm py-1 px-3"
            >
              Pay Fee
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-40"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-text-light text-lg">No connections found</p>
          <p className="text-sm text-text-lighter mt-2">
            {hasPaid ? 'Create your first connection request to get started' : 'Pay the connection fee to start connecting'}
          </p>
          <button
            onClick={() => window.location.href = '/customer/connect'}
            className="mt-4 btn-primary inline-flex items-center space-x-2"
          >
            <span>{hasPaid ? 'Create Connection' : 'Pay Fee & Connect'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => (
            <div key={connection._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-text">{connection.fullName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(connection.status)}`}>
                      {connection.status.toUpperCase()}
                    </span>
                    {connection.rating?.score && (
                      <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        <FaStar className="text-yellow-500 mr-1" />
                        {connection.rating.score}/5
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-sm text-text-light">
                    <span className="flex items-center gap-1">
                      <FaEnvelope className="text-xs" />
                      {connection.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaPhone className="text-xs" />
                      {connection.phoneNumber}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 mt-2 text-sm text-text-light flex-wrap gap-2">
                    <span className="flex items-center space-x-1">
                      <FaTag className="text-primary" />
                      <span>{getPurposeLabel(connection.purpose)}</span>
                    </span>
                    {connection.location?.town && (
                      <span className="flex items-center space-x-1">
                        <FaMapMarkerAlt className="text-primary" />
                        <span>{connection.location.town}</span>
                      </span>
                    )}
                    {connection.connectionDate && (
                      <span className="flex items-center space-x-1">
                        <FaCalendar className="text-primary" />
                        <span>{format(new Date(connection.connectionDate), 'dd MMM yyyy')}</span>
                      </span>
                    )}
                    {connection.connectionTime && (
                      <span className="flex items-center space-x-1">
                        <FaClock className="text-primary" />
                        <span>{connection.connectionTime}</span>
                      </span>
                    )}
                  </div>

                  {connection.interests && connection.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {connection.interests.map(interest => (
                        <span key={interest} className="text-xs bg-gray-100 text-text-light px-2 py-0.5 rounded-full">
                          {interest.replace('_', ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  {connection.message && (
                    <p className="text-sm text-text-light mt-2 italic">"{connection.message}"</p>
                  )}

                  <div className="flex items-center text-xs text-text-lighter mt-2">
                    Created {formatDistanceToNow(new Date(connection.createdAt))} ago
                    {connection.connectionId && (
                      <span className="ml-3">ID: {connection.connectionId}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {canRate(connection) && (
                    <button
                      onClick={() => {
                        setSelectedConnection(connection)
                        setShowRatingModal(true)
                      }}
                      className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-1"
                    >
                      <FaStar /> Rate
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(connection)}
                      className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                      <FaEye /> View
                    </button>
                    {['pending', 'active'].includes(connection.status) && (
                      <button
                        onClick={() => {
                          setSelectedConnection(connection)
                          setShowCancelModal(true)
                        }}
                        className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                      >
                        <FaTimes /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedConnection && (
        <ConnectionDetailModal
          connection={selectedConnection}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text mb-4">Cancel Connection</h2>
            <p className="text-text-light text-sm mb-4">
              Are you sure you want to cancel this connection request?
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input-field resize-none"
              rows="3"
              placeholder="Reason for cancellation (optional)"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {isCancelling ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Confirm Cancel
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 btn-outline"
              >
                Keep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-text mb-4">Rate Your Connection</h2>
            <p className="text-text-light text-sm mb-4">
              How was your experience with this connection?
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingScore(star)}
                  className={`text-3xl transition-colors ${
                    star <= ratingScore ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={ratingFeedback}
              onChange={(e) => setRatingFeedback(e.target.value)}
              className="input-field resize-none"
              rows="3"
              placeholder="Share your experience (optional)"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleRate}
                disabled={isRating || ratingScore === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isRating ? <FaSpinner className="animate-spin" /> : <FaStar />}
                Submit Rating
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerConnections