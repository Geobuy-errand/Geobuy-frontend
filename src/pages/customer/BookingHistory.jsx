import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetBookingsQuery } from '../../redux/services/bookingApi'
import { FaSearch, FaFilter } from 'react-icons/fa'

const BookingHistory = () => {
  const { data: bookings, isLoading } = useGetBookingsQuery()
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBookings = bookings?.filter(booking => {
    const matchesStatus = filter === 'all' || booking.status === filter
    const matchesSearch = booking.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'accepted': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-purple-100 text-purple-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Booking History</h1>
        <Link to="/customer/create-booking" className="btn-primary text-sm py-2 mt-4 md:mt-0">
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FaFilter className="text-text-lighter" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field py-2 w-32"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-20 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredBookings?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No bookings found.</p>
          <Link to="/customer/create-booking" className="text-primary hover:underline mt-2 inline-block">
            Create your first booking
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings?.map((booking) => (
            <Link
              key={booking._id}
              to={`/customer/booking/${booking._id}`}
              className="card hover:shadow-large transition-shadow block"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-text">{booking.serviceType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-light mt-1">
                    {booking.pickup?.address}
                  </p>
                  <p className="text-sm text-text-light">
                    {new Date(booking.date).toLocaleDateString()} at {booking.time}
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <span className="text-lg font-bold text-primary">
                    £{booking.estimatedPrice?.toFixed(2)}
                  </span>
                  <span className="text-sm text-text-light">
                    #{booking.bookingId}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookingHistory