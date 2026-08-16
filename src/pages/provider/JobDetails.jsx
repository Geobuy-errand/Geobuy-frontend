import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetServiceRequestByIdQuery, useStartServiceRequestMutation, useCompleteServiceRequestMutation } from '../../redux/services/serviceApi'
import { useGetMessagesQuery, useSendMessageMutation } from '../../redux/services/messageApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { 
  FaMapMarkerAlt, 
  FaCalendar, 
  FaClock, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaDollarSign, 
  FaComment, 
  FaPlay, 
  FaCheck, 
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa'

const ServiceProviderJobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: request, isLoading, refetch } = useGetServiceRequestByIdQuery(id)
  const { data: messages } = useGetMessagesQuery(id)
  const [startService] = useStartServiceRequestMutation()
  const [completeService] = useCompleteServiceRequestMutation()
  const [sendMessage] = useSendMessageMutation()
  const [newMessage, setNewMessage] = useState('')

  const handleStart = async () => {
    try {
      await startService(id).unwrap()
      toast.success('Service started successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to start service')
    }
  }

  const handleComplete = async () => {
    if (!window.confirm('Mark this service as completed?')) return
    
    try {
      await completeService(id).unwrap()
      toast.success('Service completed successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to complete service')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      await sendMessage({
        bookingId: id,
        content: newMessage,
        receiverId: request?.customerId?._id,
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

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Job not found</p>
        <button onClick={() => navigate('/service-provider/accepted-jobs')} className="text-primary hover:underline mt-2">
          Back to jobs
        </button>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'provider_selected': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">
            Job #{request.requestId}
          </h1>
          <p className="text-text-light">
            {request.category} - {request.serviceType}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
            {request.status.replace('_', ' ')}
          </span>
          {request.status === 'provider_selected' && (
            <button
              onClick={handleStart}
              className="btn-secondary text-sm py-2 flex items-center space-x-2"
            >
              <FaPlay />
              <span>Start Service</span>
            </button>
          )}
          {request.status === 'in_progress' && (
            <button
              onClick={handleComplete}
              className="btn-primary text-sm py-2 flex items-center space-x-2"
            >
              <FaCheck />
              <span>Complete Service</span>
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
                <span className="font-medium text-text">{request.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Category</span>
                <span className="font-medium text-text capitalize">{request.category}</span>
              </div>
              {request.description && (
                <div>
                  <span className="text-text-light">Description</span>
                  <p className="text-text mt-1">{request.description}</p>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-text-light">Agreed Price</span>
                <span className="text-xl font-bold text-primary">£{request.finalPrice?.toFixed(2) || 'Negotiating'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Service Fee (GEOBUY)</span>
                <span className="font-medium text-text-light">£{request.serviceFee?.toFixed(2) || '1.99'}</span>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Location</h2>
            <div className="space-y-3">
              {request.location?.address && (
                <div>
                  <div className="flex items-start space-x-2">
                    <FaMapMarkerAlt className="text-primary mt-1" />
                    <div>
                      <p className="font-medium text-text">Service Location</p>
                      <p className="text-text-light">{request.location.address}</p>
                    </div>
                  </div>
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
              {request.isUrgent && (
                <div className="flex items-center text-red-600">
                  <FaInfoCircle className="mr-2" />
                  <span>Urgent request</span>
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
                  <p className="font-semibold text-text">{request.customerId?.fullName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-light">
                <FaPhone className="text-text-lighter" />
                <span>{request.customerId?.phoneNumber}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-light">
                <FaEnvelope className="text-text-lighter" />
                <span>{request.customerId?.email}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-light">Service Amount</span>
                <span className="font-bold text-primary">£{request.finalPrice?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Service Fee</span>
                <span className="font-medium text-text-light">£{request.serviceFee?.toFixed(2) || '1.99'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-light">Your Earnings</span>
                <span className="font-bold text-green-600">£{(request.finalPrice || 0).toFixed(2)}</span>
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
                  <p className="font-medium text-text">Request Created</p>
                  <p className="text-sm text-text-light">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {request.status === 'provider_selected' && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Provider Selected</p>
                    <p className="text-sm text-text-light">
                      You were selected for this job
                    </p>
                  </div>
                </div>
              )}
              {request.status === 'in_progress' && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <FaPlay className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text">In Progress</p>
                    <p className="text-sm text-text-light">
                      Service is currently in progress
                    </p>
                  </div>
                </div>
              )}
              {request.completedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FaCheck className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Completed</p>
                    <p className="text-sm text-text-light">
                      {new Date(request.completedAt).toLocaleString()}
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

export default ServiceProviderJobDetails