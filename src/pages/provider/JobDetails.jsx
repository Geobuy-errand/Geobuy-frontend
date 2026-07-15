import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetBookingByIdQuery, useUpdateBookingStatusMutation } from '../../redux/services/bookingApi'
import { useGetMessagesQuery, useSendMessageMutation } from '../../redux/services/messageApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaCalendar, FaClock, FaUser, FaPhone, FaEnvelope, FaDollarSign, FaComment, FaPlay, FaCheck, FaTimes } from 'react-icons/fa'

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: booking, isLoading } = useGetBookingByIdQuery(id)
  const { data: messages } = useGetMessagesQuery(id)
  const [updateStatus] = useUpdateBookingStatusMutation()
  const [sendMessage] = useSendMessageMutation()
  const [newMessage, setNewMessage] = useState('')

  const handleStatusUpdate = async (status) => {
    try {
      await updateStatus({ id, status }).unwrap()
      toast.success(`Job ${status} successfully`)
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
        receiverId: booking?.customerId?._id,
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

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Job not found</p>
        <button onClick={() => navigate('/provider/accepted-jobs')} className="text-primary hover:underline mt-2">
          Back to jobs
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
            Job #{booking.bookingId}
          </h1>
          <p className="text-text-light">
            {new Date(booking.date).toLocaleDateString()} at {booking.time}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${booking.status === 'completed' ? 'bg-green-100 text-green-700' :
              booking.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
              booking.status === 'in_progress' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-700'}`}
          >
            {booking.status}
          </span>
          {booking.status === 'accepted' && (
            <button
              onClick={() => handleStatusUpdate('in_progress')}
              className="btn-secondary text-sm py-2 flex items-center space-x-2"
            >
              <FaPlay />
              <span>Start Job</span>
            </button>
          )}
          {booking.status === 'in_progress' && (
            <button
              onClick={() => handleStatusUpdate('completed')}
              className="btn-primary text-sm py-2 flex items-center space-x-2"
            >
              <FaCheck />
              <span>Complete Job</span>
            </button>
          )}
          {(booking.status === 'accepted' || booking.status === 'in_progress') && (
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
                <span className="font-medium text-text">{booking.serviceType}</span>
              </div>
              {booking.customRequest && (
                <div className="flex justify-between">
                  <span className="text-text-light">Custom Request</span>
                  <span className="font-medium text-text">{booking.customRequest}</span>
                </div>
              )}
              {booking.description && (
                <div>
                  <span className="text-text-light">Description</span>
                  <p className="text-text mt-1">{booking.description}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-light">Price</span>
                <span className="text-xl font-bold text-primary">£{booking.estimatedPrice?.toFixed(2)}</span>
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
                    <p className="text-sm text-text-lighter">
                      {booking.pickup?.street}, {booking.pickup?.town}, {booking.pickup?.postcode}
                    </p>
                  </div>
                </div>
              </div>
              {booking.destination?.address && (
                <div>
                  <div className="flex items-start space-x-2">
                    <FaMapMarkerAlt className="text-secondary mt-1" />
                    <div>
                      <p className="font-medium text-text">Destination</p>
                      <p className="text-text-light">{booking.destination.address}</p>
                      <p className="text-sm text-text-lighter">
                        {booking.destination.street}, {booking.destination.town}, {booking.destination.postcode}
                      </p>
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
                  <p className="font-semibold text-text">{booking.customerId?.fullName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-light">
                <FaPhone className="text-text-lighter" />
                <span>{booking.customerId?.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-light">
                <FaEnvelope className="text-text-lighter" />
                <span>{booking.customerId?.email}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-light">Amount</span>
                <span className="font-bold text-primary">£{booking.estimatedPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Status</span>
                <span className={`font-medium ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {booking.paymentStatus}
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
                    {new Date(booking.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {booking.startedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FaPlay className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Started</p>
                    <p className="text-sm text-text-light">
                      {new Date(booking.startedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {booking.completedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FaCheck className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Completed</p>
                    <p className="text-sm text-text-light">
                      {new Date(booking.completedAt).toLocaleString()}
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

export default JobDetails