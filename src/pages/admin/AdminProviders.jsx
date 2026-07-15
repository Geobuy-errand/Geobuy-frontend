import React, { useState } from 'react'
import { useGetUsersQuery } from '../../redux/services/adminApi'
import { Link } from 'react-router-dom'
import { FaSearch, FaUser, FaStar, FaCheckCircle, FaClock } from 'react-icons/fa'

const AdminProviders = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')

  const { data: providers, isLoading } = useGetUsersQuery({
    role: 'provider',
    search: searchTerm,
  })

  const filteredProviders = providers?.filter(p => {
    if (verificationFilter === 'approved') return p.verificationStatus === 'approved'
    if (verificationFilter === 'pending') return p.verificationStatus === 'pending'
    if (verificationFilter === 'rejected') return p.verificationStatus === 'rejected'
    return true
  })

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center text-green-600 text-sm"><FaCheckCircle className="mr-1" /> Verified</span>
      case 'pending':
        return <span className="flex items-center text-yellow-600 text-sm"><FaClock className="mr-1" /> Pending</span>
      case 'rejected':
        return <span className="flex items-center text-red-600 text-sm"><FaCheckCircle className="mr-1" /> Rejected</span>
      default:
        return <span className="text-gray-600 text-sm">Not Submitted</span>
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Providers</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          className="input-field w-full md:w-48"
        >
          <option value="">All Verification</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <Link to="/admin/verification" className="btn-primary text-sm py-2 px-4 flex items-center">
          Verification Queue
        </Link>
      </div>

      {/* Providers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredProviders?.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No providers found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProviders?.map((provider) => (
            <div key={provider._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-primary text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text">{provider.fullName}</h3>
                    <p className="text-sm text-text-light">{provider.email}</p>
                    <p className="text-sm text-text-light">{provider.phoneNumber}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-sm text-text-light">
                        <FaStar className="text-yellow-400 mr-1" />
                        {provider.averageRating?.toFixed(1) || 'New'}
                      </span>
                      <span className="text-sm text-text-light">
                        {provider.totalReviews || 0} reviews
                      </span>
                      <span className="text-sm text-text-light">
                        {provider.completedJobs || 0} jobs
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  {getVerificationBadge(provider.verificationStatus)}
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/verification`}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminProviders