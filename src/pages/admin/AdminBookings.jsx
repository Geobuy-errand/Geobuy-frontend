import React, { useState } from 'react'
import { useGetAllBookingsQuery } from '../../redux/services/adminApi'
import { FaSearch, FaCalendar, FaFilter } from 'react-icons/fa'

const AdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data: bookings, isLoading } = useGetAllBookingsQuery({
    status: statusFilter,
    startDate,
    endDate,
  })

  const filteredBookings = bookings?.filter(b => 
    b.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.providerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Bookings</h1>

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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-full md:w-40"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex items-center space-x-2">
          <FaCalendar className="text-text-lighter" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field py-2 w-36"
          />
          <span className="text-text-light">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field py-2 w-36"
          />
        </div>
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-16 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredBookings?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No bookings found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Booking ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Service</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings?.map((booking) => (
                <tr key={booking._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-text">
                    #{booking.bookingId}
                  </td>
                  <td className="py-3 px-4 text-text-light">
                    {booking.customerId?.fullName || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-text-light">
                    {booking.providerId?.fullName || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4 text-text-light">
                    {booking.serviceId?.name || booking.serviceType}
                  </td>
                  <td className="py-3 px-4 text-text-light text-sm">
                    {new Date(booking.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-primary">
                    £{booking.estimatedPrice?.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminBookings