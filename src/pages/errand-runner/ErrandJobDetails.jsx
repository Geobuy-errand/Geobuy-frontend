import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetErrandByIdQuery, useUpdateErrandStatusMutation } from '../../redux/services/errandApi'
import { useGetMessagesQuery, useSendMessageMutation } from '../../redux/services/messageApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { 
  FaMapMarkerAlt, FaClock, FaUser, FaPhone, FaEnvelope, 
  FaDollarSign, FaComment, FaPlay, FaCheck, FaTimes, FaRuler,
  FaArrowLeft, FaLocationArrow, FaBox, FaFlagCheckered
} from 'react-icons/fa'

const ErrandJobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: errand, isLoading, refetch } = useGetErrandByIdQuery(id)
  const { data: messages } = useGetMessagesQuery(id)
  const [updateStatus, { isLoading: isUpdating }] = useUpdateErrandStatusMutation()
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [newMessage, setNewMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)

  const handleStatusUpdate = async (status) => {
    setPendingStatus(status)
    setShowConfirmModal(true)
  }

  const confirmStatusUpdate = async () => {
    try {
      await updateStatus({ id, status: pendingStatus }).unwrap()
      toast.success(`Errand ${pendingStatus.replace('_', ' ')} successfully`)
      setShowConfirmModal(false)
      setPendingStatus(null)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update status')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      await sendMessage({
        bookingId: id,
        content: newMessage,
        receiverId: errand?.customerId?._id,
      }).unwrap()
      setNewMessage('')
      toast.success('Message sent')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to send message')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-64 rounded-xl"></div>
        <div className="skeleton h-48 rounded-xl"></div>
      </div>
    )
  }

  if (!errand) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Errand not found</p>
        <button onClick={() => navigate('/errand-runner/accepted-jobs')} className="text-primary hover:underline mt-2">
          Back to errands
        </button>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const map = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-blue-100 text-blue-700',
      'en_route': 'bg-purple-100 text-purple-700',
      'collected': 'bg-indigo-100 text-indigo-700',
      'delivered': 'bg-green-100 text-green-700',
      'completed': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status) => {
    const map = {
      'pending': FaClock,
      'accepted': FaCheck,
      'en_route': FaLocationArrow,
      'collected': FaBox,
      'delivered': FaCheck,
      'completed': FaFlagCheckered,
      'cancelled': FaTimes,
    }
    return map[status] || FaClock
  }

  const getNextStatus = (status) => {
    const map = {
      'accepted': { 
        label: 'Start Journey', 
        value: 'en_route', 
        icon: FaLocationArrow,
        description: 'Mark that you are on your way to pickup',
        color: 'bg-purple-600 hover:bg-purple-700'
      },
      'en_route': { 
        label: 'Mark as Collected', 
        value: 'collected', 
        icon: FaBox,
        description: 'Confirm you have picked up the item',
        color: 'bg-indigo-600 hover:bg-indigo-700'
      },
      'collected': { 
        label: 'Mark as Delivered', 
        value: 'delivered', 
        icon: FaCheck,
        description: 'Confirm you have delivered the item',
        color: 'bg-green-600 hover:bg-green-700'
      },
      'delivered': null,
      'completed': null,
    }
    return map[status]
  }

  const StatusIcon = getStatusIcon(errand.status)
  const nextStep = getNextStatus(errand.status)

  // Status steps for timeline
  const statusSteps = [
    { key: 'accepted', label: 'Accepted', icon: FaCheck },
    { key: 'en_route', label: 'En Route', icon: FaLocationArrow },
    { key: 'collected', label: 'Collected', icon: FaBox },
    { key: 'delivered', label: 'Delivered', icon: FaCheck },
    { key: 'completed', label: 'Completed', icon: FaFlagCheckered },
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.key === errand.status)

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/errand-runner/accepted-jobs')}
        className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors text-sm md:text-base"
      >
        <FaArrowLeft />
        <span>Back to Accepted Errands</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-text">
              Errand #{errand.errandId}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(errand.status)} flex items-center gap-1`}>
              <StatusIcon className="text-xs" />
              {errand.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-text-light mt-1">
            {new Date(errand.preferredDate || errand.date).toLocaleDateString()} at {errand.preferredTime || errand.time}
          </p>
        </div>
        {errand.status === 'accepted' && (
          <button
            onClick={() => handleStatusUpdate('cancelled')}
            className="text-red-600 hover:text-red-700 text-sm border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancel Errand
          </button>
        )}
      </div>

      {/* Status Update Card - Replaces QR Code */}
      {nextStep && (
        <div className="card bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <nextStep.icon className="text-2xl text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text">Next Action</h3>
                <p className="text-text-light text-sm">{nextStep.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleStatusUpdate(nextStep.value)}
              disabled={isUpdating}
              className={`w-full md:w-auto px-6 py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors ${nextStep.color} disabled:opacity-50`}
            >
              <nextStep.icon />
              <span>{isUpdating ? 'Updating...' : nextStep.label}</span>
            </button>
          </div>

          {/* Quick Status Tips */}
          <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-text-light">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Keep customer updated via chat
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Confirm pickup/dropoff details
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Take photos if needed
            </div>
          </div>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="card">
        <h2 className="text-lg font-semibold text-text mb-4">Progress Timeline</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div 
            className="absolute left-4 top-0 w-0.5 bg-primary transition-all duration-500"
            style={{ height: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
          />
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const Icon = step.icon
            return (
              <div key={step.key} className="flex items-start space-x-4 mb-6 last:mb-0 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10
                  ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}`}
                >
                  <Icon className="text-sm" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className={`font-medium ${isCompleted ? 'text-text' : 'text-text-light'}`}>
                    {step.label}
                  </p>
                  {isCompleted && index < statusSteps.length - 1 && (
                    <p className="text-xs text-text-lighter">
                      {index === 0 && errand.acceptedAt && `Completed at ${new Date(errand.acceptedAt).toLocaleTimeString()}`}
                      {index === 1 && errand.enRouteAt && `Completed at ${new Date(errand.enRouteAt).toLocaleTimeString()}`}
                      {index === 2 && errand.collectedAt && `Completed at ${new Date(errand.collectedAt).toLocaleTimeString()}`}
                      {index === 3 && errand.deliveredAt && `Completed at ${new Date(errand.deliveredAt).toLocaleTimeString()}`}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Errand Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-light">Service Type</span>
                <span className="font-medium text-text">{errand.serviceType?.replace('_', ' ')}</span>
              </div>
              {errand.taskDetails && (
                <div>
                  <span className="text-text-light">Description</span>
                  <p className="text-text mt-1">{errand.taskDetails}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-light">Distance</span>
                <span className="font-medium text-text flex items-center">
                  <FaRuler className="mr-1 text-primary" />
                  {errand.distance?.toFixed(1)} miles
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Total</span>
                <span className="text-xl font-bold text-primary">
                  £{errand.total?.toFixed(2) || errand.estimatedPrice?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Your Earnings (80%)</span>
                <span className="font-bold text-green-600">
                  £{errand.providerAmount?.toFixed(2) || (errand.total * 0.8).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Location</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-text">Pickup</p>
                    <p className="text-text-light">{errand.pickup?.address}</p>
                    {errand.pickup?.instructions && (
                      <p className="text-sm text-text-lighter mt-1">📝 {errand.pickup.instructions}</p>
                    )}
                  </div>
                </div>
              </div>
              {errand.dropoff?.address && (
                <div>
                  <div className="flex items-start space-x-2">
                    <FaMapMarkerAlt className="text-secondary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-text">Dropoff</p>
                      <p className="text-text-light">{errand.dropoff.address}</p>
                      {errand.dropoff?.instructions && (
                        <p className="text-sm text-text-lighter mt-1">📝 {errand.dropoff.instructions}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
              <FaComment className="mr-2" />
              Messages
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {messages?.length === 0 ? (
                <p className="text-text-light text-sm">No messages yet</p>
              ) : (
                messages?.map((msg) => (
                  <div
                    key={msg._id}
                    className={`p-3 rounded-lg ${msg.senderId._id === user._id ? 'bg-primary/10 ml-8' : 'bg-gray-50 mr-8'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-text">{msg.senderId.fullName}</span>
                      <span className="text-xs text-text-lighter">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-text-light text-sm mt-1">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input-field flex-1"
                disabled={isSending}
              />
              <button 
                type="submit" 
                className="btn-primary py-2 px-4 disabled:opacity-50" 
                disabled={isSending || !newMessage.trim()}
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaUser className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-text">{errand.customerId?.fullName}</p>
                  {errand.customerId?.averageRating > 0 && (
                    <p className="text-sm text-text-light">⭐ {errand.customerId.averageRating.toFixed(1)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-light">
                <FaPhone className="text-text-lighter" />
                <span>{errand.customerId?.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-light">
                <FaEnvelope className="text-text-lighter" />
                <span>{errand.customerId?.email}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-light">Amount</span>
                <span className="font-bold text-primary">
                  £{errand.total?.toFixed(2) || errand.estimatedPrice?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Your Earnings</span>
                <span className="font-bold text-green-600">
                  £{errand.providerAmount?.toFixed(2) || (errand.total * 0.8).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Status</span>
                <span className={`font-medium ${errand.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {errand.paymentStatus || 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to={`/errand-runner/messages`}
                className="w-full btn-outline text-sm py-2 px-4 flex items-center justify-center gap-2"
              >
                <FaComment />
                View All Messages
              </Link>
              {errand.status !== 'delivered' && errand.status !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="w-full border-2 border-red-200 text-red-600 text-sm py-2 px-4 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FaTimes />
                  Cancel Errand
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4">
            <h3 className="text-xl font-bold text-text mb-2">Confirm Status Update</h3>
            <p className="text-text-light mb-4">
              Are you sure you want to mark this errand as <span className="font-semibold text-primary">{pendingStatus?.replace('_', ' ')}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                disabled={isUpdating}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ErrandJobDetails