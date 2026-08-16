import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGetErrandsQuery } from '../../redux/services/errandApi'
import { useGetMessagesQuery, useSendMessageMutation } from '../../redux/services/messageApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import { FaComments, FaChevronRight, FaUser, FaBox, FaPaperPlane, FaSpinner } from 'react-icons/fa'

const ErrandRunnerMessages = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: errands, isLoading: errandsLoading } = useGetErrandsQuery()
  const [selectedErrand, setSelectedErrand] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [socket, setSocket] = useState(null)
  const messagesEndRef = useRef(null)
  
  const { data: messages, refetch } = useGetMessagesQuery(selectedErrand?._id, {
    skip: !selectedErrand,
  })

  // Socket connection for real-time messages
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    })

    newSocket.on('connect', () => {
      console.log('Messages socket connected')
    })

    newSocket.on('new-message', (data) => {
      if (data.bookingId === selectedErrand?._id) {
        refetch()
        scrollToBottom()
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [selectedErrand, refetch])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedErrand) return

    try {
      await sendMessage({
        bookingId: selectedErrand._id,
        content: newMessage.trim(),
        receiverId: selectedErrand.customerId?._id,
      }).unwrap()
      setNewMessage('')
      refetch()
      scrollToBottom()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to send message')
    }
  }

  // Get active errands (not completed or cancelled)
  const activeErrands = errands?.filter(e => 
    e.status !== 'cancelled' && e.status !== 'delivered' && e.status !== 'completed'
  ) || []

  const getStatusBadge = (status) => {
    const map = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'accepted': 'bg-blue-100 text-blue-700',
      'en_route': 'bg-purple-100 text-purple-700',
      'collected': 'bg-indigo-100 text-indigo-700',
      'delivered': 'bg-green-100 text-green-700',
    }
    return map[status] || 'bg-gray-100 text-gray-700'
  }

  if (errandsLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="skeleton h-64 rounded-xl"></div>
          </div>
          <div className="md:col-span-2">
            <div className="skeleton h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Errand List */}
        <div className="lg:col-span-1 card p-0 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-text-light font-medium">Active Errands</p>
            <p className="text-xs text-text-lighter">{activeErrands.length} conversations</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {activeErrands.length === 0 ? (
              <div className="text-center py-8 text-text-light">
                <FaComments className="text-3xl mx-auto mb-2 text-text-lighter" />
                <p className="text-sm">No active errands to message about</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activeErrands.map((errand) => {
                  const isSelected = selectedErrand?._id === errand._id
                  const customerName = errand.customerId?.fullName || 'Customer'
                  
                  return (
                    <button
                      key={errand._id}
                      onClick={() => setSelectedErrand(errand)}
                      className={`w-full text-left p-3 transition-colors ${
                        isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text truncate flex items-center gap-2">
                            <FaUser className="text-primary text-sm flex-shrink-0" />
                            {customerName}
                          </p>
                          <p className="text-sm text-text-light truncate flex items-center gap-2">
                            <FaBox className="text-xs flex-shrink-0" />
                            {errand.serviceType?.replace('_', ' ')}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(errand.status)}`}>
                              {errand.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-text-lighter">
                              #{errand.errandId}
                            </span>
                          </div>
                        </div>
                        <FaChevronRight className={`text-text-lighter flex-shrink-0 transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2 card p-0 overflow-hidden flex flex-col h-[500px]">
          {selectedErrand ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-primary text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text truncate">
                      {selectedErrand.customerId?.fullName}
                    </p>
                    <p className="text-xs text-text-light truncate">
                      {selectedErrand.serviceType?.replace('_', ' ')} #{selectedErrand.errandId}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/errand-runner/job/${selectedErrand._id}`}
                  className="text-primary hover:underline text-sm flex-shrink-0"
                >
                  View Details
                </Link>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages?.length === 0 ? (
                  <div className="text-center py-8 text-text-light">
                    <p>No messages yet</p>
                    <p className="text-sm text-text-lighter">Start the conversation!</p>
                  </div>
                ) : (
                  messages?.map((msg) => {
                    const isOwn = msg.senderId._id === user._id
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div className={`p-3 rounded-xl ${isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-text'}`}>
                            <p className="text-sm break-words">{msg.content}</p>
                          </div>
                          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-text-lighter">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 input-field py-2 px-3 text-sm"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending}
                  className="btn-primary py-2 px-3 flex items-center space-x-1 disabled:opacity-50 flex-shrink-0"
                >
                  {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-light p-4">
              <FaComments className="text-4xl mb-3 text-text-lighter" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm text-center">Choose an errand from the list to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrandRunnerMessages