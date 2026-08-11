import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetServiceRequestsQuery } from '../../redux/services/serviceApi'
import { FaSearch, FaClock, FaCheckCircle, FaTimesCircle, FaUser } from 'react-icons/fa'

const ServiceHistory = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const { data: requests, isLoading } = useGetServiceRequestsQuery()

  const filteredRequests = requests?.filter(req => {
    const matchesSearch = req.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.requestId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || req.status === filter
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'provider_selected': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Awaiting Quotes'
      case 'quotes_received': return 'Quotes Received'
      case 'provider_selected': return 'Provider Selected'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Service History</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search service requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-full md:w-40"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="quotes_received">Quotes Received</option>
          <option value="provider_selected">Provider Selected</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <Link to="/find-services" className="btn-primary text-sm py-2 px-4 whitespace-nowrap">
          New Service Request
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredRequests?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No service requests found</p>
          <Link to="/find-services" className="text-primary hover:underline mt-2 inline-block">
            Find Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests?.map((request) => (
            <Link
              key={request._id}
              to={`/customer/service-request/${request._id}`}
              className="card hover:shadow-large transition-shadow block"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text">{request.serviceType}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  <p className="text-sm text-text-light mt-1">
                    {request.location?.address}
                  </p>
                  <p className="text-sm text-text-light">
                    #{request.requestId}
                  </p>
                  {request.selectedProviderId && (
                    <div className="flex items-center text-sm text-text-light mt-1">
                      <FaUser className="mr-1" />
                      {request.selectedProviderId.fullName}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {request.finalPrice && (
                    <span className="text-lg font-bold text-primary">
                      £{request.finalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-sm text-text-light">
                    {new Date(request.createdAt).toLocaleDateString()}
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

export default ServiceHistory