import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetBookingByIdQuery, useUpdateBookingStatusMutation } from '../../redux/services/bookingApi'
import { useGetMessagesQuery, useSendMessageMutation } from '../../redux/services/messageApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { 
  FaMapMarkerAlt, FaCalendar, FaClock, FaUser, FaPhone, FaEnvelope, 
  FaCheckCircle, FaTimesCircle, FaComment, FaCreditCard, FaSpinner,
  FaFlagCheckered, FaDollarSign
} from 'react-icons/fa'

const BookingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: booking, isLoading, refetch } = useGetBookingByIdQuery(id)
  const { data: messages, refetch: refetchMessages } = useGetMessagesQuery(id)
  const [updateStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation()
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [newMessage, setNewMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // ✅ Determine if customer can complete (only when delivered)
  const canComplete = booking?.status === 'delivered' && user?.role === 'customer'
  const canCancel = booking?.status === 'pending' || booking?.status === 'accepted'
  const isPaid = booking?.paymentStatus === 'paid' || booking?.paymentStatus === 'released'
  const isPaymentPending = booking?.paymentStatus === 'pending'

  const handleStatusUpdate = async (status) => {
    setPendingStatus(status)
    setShowConfirmModal(true)
  }

  const confirmStatusUpdate = async () => {
    try {
      await updateStatus({ id, status: pendingStatus }).unwrap()
      toast.success(`Booking ${pendingStatus} successfully`)
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
      }).unwrap()
      setNewMessage('')
      toast.success('Message sent')
      refetchMessages()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to send message')
    }
  }

  // ✅ Handle payment
  const handlePayment = async () => {
    setIsProcessingPayment(true)
    try {
      // Call the payment intent creation endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ errandId: id })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment initiation failed')
      }

      // Initialize Stripe checkout
      const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: {
            // Stripe Elements will handle this
          },
        },
        receipt_email: user?.email,
      })

      if (error) {
        throw new Error(error.message)
      }

      toast.success('Payment successful!')
      refetch()
    } catch (error) {
      toast.error(error.message || 'Payment failed')
    } finally {
      setIsProcessingPayment(false)
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

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Booking not found</p>
        <button onClick={() => navigate('/customer/bookings')} className="text-primary hover:underline mt-2">
          Back to bookings
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Booking #{booking.errandId || booking.bookingId}
          </h1>
          <p className="text-text-light">
            {new Date(booking.createdAt).toLocaleDateString()} at {booking.preferredTime}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0 flex-wrap gap-2">
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
              booking.status === 'en_route' ? 'bg-purple-100 text-purple-700' :
              booking.status === 'collected' ? 'bg-indigo-100 text-indigo-700' :
              booking.status === 'delivered' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'}`}
          >
            {booking.status}
          </span>
          
          {/* Payment Status Badge */}
          {isPaid ? (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 flex items-center gap-1">
              <FaCheckCircle className="text-xs" />
              Paid
            </span>
          ) : isPaymentPending ? (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
              <FaCreditCard className="text-xs" />
              Payment Pending
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
              Payment Required
            </span>
          )}

          {canCancel && (
            <button
              onClick={() => handleStatusUpdate('cancelled')}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Cancel
            </button>
          )}
          
          {/* ✅ Customer Complete Button */}
          {canComplete && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <FaFlagCheckered />
              {isUpdating ? 'Updating...' : 'Mark as Completed'}
            </button>
          )}
        </div>
      </div>

      {/* ✅ Payment Required Banner */}
      {!isPaid && booking.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-yellow-800 flex items-center gap-2">
              <FaCreditCard className="text-yellow-600" />
              Payment Required
            </p>
            <p className="text-sm text-yellow-700">
              Please complete payment of <span className="font-bold">£{booking.total?.toFixed(2) || booking.estimatedPrice?.toFixed(2)}</span> for your errand to proceed.
            </p>
          </div>
          <button
            onClick={handlePayment}
            disabled={isProcessingPayment}
            className="bg-yellow-600 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 whitespace-nowrap w-full md:w-auto justify-center"
          >
            {isProcessingPayment ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCreditCard />
            )}
            <span>{isProcessingPayment ? 'Processing...' : 'Pay Now'}</span>
          </button>
        </div>
      )}

      {/* ✅ Completed Banner */}
      {booking.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-2xl text-green-600" />
            <div>
              <p className="font-medium text-green-700">Booking Completed!</p>
              <p className="text-sm text-green-600">This booking has been completed successfully.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Service Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-light">Service Type</span>
                <span className="font-medium text-text">{booking.serviceType?.replace('_', ' ')}</span>
              </div>
              {booking.taskDetails && (
                <div>
                  <span className="text-text-light">Description</span>
                  <p className="text-text mt-1">{booking.taskDetails}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-light">Distance</span>
                <span className="font-medium text-text">{booking.distance?.toFixed(1) || 0} miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Total</span>
                <span className="text-xl font-bold text-primary">
                  £{booking.total?.toFixed(2) || booking.estimatedPrice?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Payment Status</span>
                <span className={`font-medium ${isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isPaid ? 'Paid' : isPaymentPending ? 'Pending' : 'Not Paid'}
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
                  <FaMapMarkerAlt className="text-primary mt-1" />
                  <div>
                    <p className="font-medium text-text">Pickup</p>
                    <p className="text-text-light">{booking.pickup?.address}</p>
                    {booking.pickup?.instructions && (
                      <p className="text-sm text-text-lighter mt-1">📝 {booking.pickup.instructions}</p>
                    )}
                  </div>
                </div>
              </div>
              {booking.dropoff?.address && (
                <div>
                  <div className="flex items-start space-x-2">
                    <FaMapMarkerAlt className="text-secondary mt-1" />
                    <div>
                      <p className="font-medium text-text">Dropoff</p>
                      <p className="text-text-light">{booking.dropoff.address}</p>
                      {booking.dropoff?.instructions && (
                        <p className="text-sm text-text-lighter mt-1">📝 {booking.dropoff.instructions}</p>
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
                    className={`p-3 rounded-lg ${msg.senderId?._id === user?._id ? 'bg-primary/10 ml-8' : 'bg-gray-50 mr-8'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm text-text">{msg.senderId?.fullName || 'Unknown'}</span>
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
          {/* Provider Info */}
          {booking.providerId && (
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-4">Provider</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaUser className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">{booking.providerId.fullName}</p>
                    <p className="text-sm text-text-light">⭐ {booking.providerId.averageRating?.toFixed(1) || 'New'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-text-light">
                  <FaPhone className="text-text-lighter" />
                  <span>{booking.providerId.phoneNumber}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-text-light">
                  <FaEnvelope className="text-text-lighter" />
                  <span>{booking.providerId.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
              <FaDollarSign className="mr-2 text-primary" />
              Payment Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Base Fee</span>
                <span className="font-medium">£{booking.baseFee?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-light">Distance Fee</span>
                <span className="font-medium">£{booking.distanceFee?.toFixed(2) || '0.00'}</span>
              </div>
              {booking.isHeavyItem && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">Heavy Item</span>
                  <span className="font-medium">£{booking.heavyItemFee?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              {booking.isPeakUrgent && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">Peak/Urgent</span>
                  <span className="font-medium">£{booking.peakUrgentFee?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              {booking.extraStopsCount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-text-light">Extra Stops ({booking.extraStopsCount})</span>
                  <span className="font-medium">£{booking.extraStopsFee?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              {booking.isSubscribed && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Subscription Discount (20%)</span>
                  <span>-£{booking.discountAmount?.toFixed(2) || '0.00'}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-semibold text-text">Total</span>
                <span className="font-bold text-primary">£{booking.total?.toFixed(2) || booking.estimatedPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-text-lighter pt-1">
                <span>Platform Fee (20%)</span>
                <span>£{booking.platformFee?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-text">Created</p>
                  <p className="text-sm text-text-light">
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {booking.acceptedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Accepted</p>
                    <p className="text-sm text-text-light">
                      {new Date(booking.acceptedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.enRouteAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">En Route</p>
                    <p className="text-sm text-text-light">
                      {new Date(booking.enRouteAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.collectedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Collected</p>
                    <p className="text-sm text-text-light">
                      {new Date(booking.collectedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.deliveredAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Delivered</p>
                    <p className="text-sm text-text-light">
                      {new Date(booking.deliveredAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.completedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <FaCheckCircle className="text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Completed</p>
                    <p className="text-sm text-text-light">
                      {new Date(booking.completedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.cancelledAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FaTimesCircle className="text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Cancelled</p>
                    <p className="text-sm text-text-light">
                      {new Date(booking.cancelledAt).toLocaleString()}
                    </p>
                  </div>
                </div>
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
              Are you sure you want to mark this booking as <span className="font-semibold text-primary">{pendingStatus}</span>?
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

export default BookingDetails