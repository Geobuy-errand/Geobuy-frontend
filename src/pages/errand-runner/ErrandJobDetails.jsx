import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetErrandByIdQuery, useUpdateErrandStatusMutation } from '../../redux/services/errandApi'
import { useGetMessagesQuery, useSendMessageMutation } from '../../redux/services/messageApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaCalendar, FaClock, FaUser, FaPhone, FaEnvelope, FaDollarSign, FaComment, FaPlay, FaCheck, FaTimes, FaQrcode } from 'react-icons/fa'

const ErrandJobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: errand, isLoading } = useGetErrandByIdQuery(id)
  const { data: messages } = useGetMessagesQuery(id)
  const [updateStatus] = useUpdateErrandStatusMutation()
  const [sendMessage] = useSendMessageMutation()
  const [newMessage, setNewMessage] = useState('')
  const [showQR, setShowQR] = useState(false)

  const handleStatusUpdate = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap()
      toast.success(`Job ${status.replace('_', ' ')} successfully`)
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
        <p className="text-text-light">Job not found</p>
        <button onClick={() => navigate('/errand-runner/accepted-jobs')} className="text-primary hover:underline mt-2">
          Back to jobs
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

  const getNextStatus = (status) => {
    const map = {
      'accepted': { label: 'Start Journey', value: 'en_route', icon: FaPlay },
      'en_route': { label: 'Mark as Collected', value: 'collected', icon: FaCheck },
      'collected': { label: 'Mark as Delivered', value: 'delivered', icon: FaCheck },
      'delivered': null,
      'completed': null,
    }
    return map[status]
  }

  const nextStep = getNextStatus(errand.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Job #{errand.errandId}
          </h1>
          <p className="text-text-light">
            {new Date(errand.date || errand.preferredDate).toLocaleDateString()} at {errand.time || errand.preferredTime}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(errand.status)}`}>
            {errand.status.replace('_', ' ')}
          </span>
          {nextStep && (
            <button
              onClick={() => handleStatusUpdate(nextStep.value)}
              className="btn-primary text-sm py-2 flex items-center space-x-2"
            >
              <nextStep.icon />
              <span>{nextStep.label}</span>
            </button>
          )}
          {errand.status === 'accepted' && (
            <button
              onClick={() => handleStatusUpdate('cancelled')}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Service Details</h2>
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
                <span className="font-medium text-text">{errand.distance?.toFixed(1)} miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Total</span>
                <span className="text-xl font-bold text-primary">£{errand.total?.toFixed(2) || errand.estimatedPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Location</h2>
            <div className="space-y-3">
              <div>
                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="text-primary mt-1" />
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
                    <FaMapMarkerAlt className="text-secondary mt-1" />
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

          {/* QR Code */}
          {errand.status !== 'pending' && errand.status !== 'cancelled' && (
            <div className="card">
              <button
                onClick={() => setShowQR(!showQR)}
                className="flex items-center justify-between w-full"
              >
                <h2 className="text-lg font-semibold text-text flex items-center">
                  <FaQrcode className="mr-2 text-primary" />
                  QR Code Verification
                </h2>
                <span className="text-primary">{showQR ? 'Hide' : 'Show'}</span>
              </button>
              {showQR && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-text-light text-sm mb-4">
                    Ask the customer to scan this QR code to verify pickup or delivery
                  </p>
                  <Link
                    to={`/errand-runner/scan-qr/${errand._id}`}
                    className="btn-primary text-sm py-2 px-4 inline-flex items-center space-x-2"
                  >
                    <FaQrcode />
                    <span>Open QR Scanner</span>
                  </Link>
                </div>
              )}
            </div>
          )}

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
              />
              <button type="submit" className="btn-primary py-2 px-4">
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
                <span className="font-bold text-primary">£{errand.total?.toFixed(2) || errand.estimatedPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Your Earnings (80%)</span>
                <span className="font-bold text-green-600">£{errand.providerAmount?.toFixed(2) || (errand.total * 0.8).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">GEOBUY Fee (20%)</span>
                <span className="font-medium text-text-light">£{errand.platformFee?.toFixed(2) || (errand.total * 0.2).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Status</span>
                <span className={`font-medium ${errand.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {errand.paymentStatus || 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FaCheck className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-text">Created</p>
                  <p className="text-sm text-text-light">
                    {new Date(errand.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {errand.acceptedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FaPlay className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Accepted</p>
                    <p className="text-sm text-text-light">
                      {new Date(errand.acceptedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {errand.enRouteAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FaPlay className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">En Route</p>
                    <p className="text-sm text-text-light">
                      {new Date(errand.enRouteAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {errand.collectedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FaCheck className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Collected</p>
                    <p className="text-sm text-text-light">
                      {new Date(errand.collectedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {errand.deliveredAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FaCheck className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Delivered</p>
                    <p className="text-sm text-text-light">
                      {new Date(errand.deliveredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrandJobDetails