import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetBookingsQuery } from '../../redux/services/bookingApi'
import { useGetMessagesQuery } from '../../redux/services/messageApi'
import { FaComments, FaChevronRight } from 'react-icons/fa'

const CustomerMessages = () => {
  const { data: bookings } = useGetBookingsQuery()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const { data: messages } = useGetMessagesQuery(selectedBooking?._id, {
    skip: !selectedBooking,
  })

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
            <div className="space-y-2">
              {activeBookings.map((booking) => (
                <button
                  key={booking._id}
                  onClick={() => setSelectedBooking(booking)}
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
        <div className="card md:col-span-2">
          {selectedBooking ? (
            <>
              <div className="border-b border-gray-100 pb-3 mb-4">
                <h3 className="text-lg font-semibold text-text">
                  {selectedBooking.serviceType}
                </h3>
                <p className="text-sm text-text-light">
                  #{selectedBooking.bookingId} - {selectedBooking.status}
                </p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages?.length === 0 ? (
                  <p className="text-text-light text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages?.map((msg) => (
                    <div key={msg._id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">
                          {msg.senderId.fullName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-text text-sm">
                            {msg.senderId.fullName}
                          </span>
                          <span className="text-xs text-text-lighter">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-text-light text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
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