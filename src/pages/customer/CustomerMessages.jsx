import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGetBookingsQuery } from '../../redux/services/bookingApi'
import { useGetMessagesQuery, useSendMessageMutation } from '../../redux/services/messageApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import { FaComments, FaChevronRight, FaPaperPlane, FaSpinner } from 'react-icons/fa'
import axios from 'axios'

const CustomerMessages = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: bookings } = useGetBookingsQuery()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
  const [socket, setSocket] = useState(null)
  const [chatId, setChatId] = useState(null)
  const messagesEndRef = useRef(null)
  
  const { data: messages, refetch } = useGetMessagesQuery(selectedBooking?._id, {
    skip: !selectedBooking,
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
      if (data.bookingId === selectedBooking?._id) {
        refetch()
        scrollToBottom()
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [selectedBooking, refetch])

  // Get or create chat when a booking is selected
  useEffect(() => {
    if (selectedBooking) {
      getOrCreateChat()
    }
  }, [selectedBooking])

  const getOrCreateChat = async () => {
    try {
      const response = await axios.post(
        '/api/chats/get-or-create',
        {
          userId: selectedBooking.providerId?._id,
          errandId: selectedBooking._id,
          bookingId: selectedBooking._id,
        },
        { withCredentials: true }
      )
      setChatId(response.data._id)
    } catch (error) {
      console.error('Failed to get/create chat:', error)
      toast.error('Failed to load chat')
    }
  }

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
    if (!newMessage.trim() || !selectedBooking || !chatId) return

    try {
      await sendMessage({
        bookingId: selectedBooking._id,
        content: newMessage.trim(),
        receiverId: selectedBooking.providerId?._id,
        chatId: chatId, // ✅ Now passing chatId
      }).unwrap()
      setNewMessage('')
      refetch()
      scrollToBottom()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to send message')
    }
  }

  // Get bookings that have messages or are active
  const activeBookings = bookings?.filter(b => 
    b.status !== 'cancelled' && b.status !== 'completed'
  ) || []

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking List */}
        <div className="card md:col-span-1">
          <h2 className="text-lg font-semibold text-text mb-4">Active Bookings</h2>
          {activeBookings.length === 0 ? (
            <p className="text-text-light text-sm">No active bookings to message about</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {activeBookings.map((booking) => (
                <button
                  key={booking._id}
                  onClick={() => {
                    setSelectedBooking(booking)
                    setChatId(null) // Reset chat ID when switching bookings
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedBooking?._id === booking._id
                      ? 'bg-primary/10'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text">{booking.serviceType}</p>
                      <p className="text-sm text-text-light">
                        #{booking.bookingId}
                      </p>
                    </div>
                    <FaChevronRight className={`text-text-lighter transition-transform ${
                      selectedBooking?._id === booking._id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="card md:col-span-2 flex flex-col">
          {selectedBooking ? (
            <>
              <div className="border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-lg font-semibold text-text">
                  {selectedBooking.serviceType}
                </h3>
                <p className="text-sm text-text-light">
                  #{selectedBooking.bookingId} - {selectedBooking.status}
                </p>
                {selectedBooking.providerId && (
                  <p className="text-sm text-text-light">
                    Provider: {selectedBooking.providerId.fullName}
                  </p>
                )}
              </div>
              
              {/* Messages List */}
              <div className="flex-1 space-y-3 max-h-[300px] overflow-y-auto mb-4">
                {messages?.length === 0 ? (
                  <p className="text-text-light text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages?.map((msg) => {
                    const isOwn = msg.senderId?._id === user?._id
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          <div className={`p-3 rounded-xl ${isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-text'}`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                          <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-text-lighter">
                              {new Date(msg.createdAt).toLocaleTimeString()}
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
              <form onSubmit={handleSendMessage} className="flex space-x-2 border-t border-gray-100 pt-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                  disabled={isSending || !chatId}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isSending || !chatId}
                  className="btn-primary py-2 px-4 flex items-center space-x-2 disabled:opacity-50"
                >
                  {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                </button>
              </form>
              {!chatId && (
                <p className="text-xs text-text-lighter mt-2 text-center">Loading chat...</p>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FaComments className="text-4xl text-text-lighter mx-auto mb-4" />
              <p className="text-text-light">Select a booking to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerMessages