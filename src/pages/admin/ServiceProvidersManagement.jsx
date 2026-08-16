import React, { useState } from 'react'
import { useGetUsersQuery, useToggleUserStatusMutation } from '../../redux/services/adminApi'
import { toast } from 'react-hot-toast'
import { FaSearch, FaUser, FaStar, FaCheckCircle, FaClock, FaEdit, FaBan, FaUserCheck } from 'react-icons/fa'
import Pagination from '../../components/utils/Pagination'

const ServiceProvidersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data, isLoading, refetch } = useGetUsersQuery({
    role: 'provider',
    search: searchTerm,
    verificationStatus: verificationFilter,
    page: currentPage,
    limit: itemsPerPage,
  })

  const [toggleStatus] = useToggleUserStatusMutation()

  const providers = data?.users || []
  const totalProviders = data?.total || 0
  const totalPages = data?.totalPages || 0

  const handleToggleStatus = async (userId) => {
    try {
      await toggleStatus(userId).unwrap()
      toast.success('Provider status updated')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update status')
    }
  }

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Service Providers</h1>
        <span className="text-sm text-text-light">Total: {totalProviders}</span>
      </div>

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
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No service providers found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-primary text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-text">{provider.fullName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${provider.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
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
                        {provider.serviceCategories && (
                          <span className="text-sm text-text-light">
                            Categories: {provider.serviceCategories?.join(', ') || 'None'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    {getVerificationBadge(provider.verificationStatus)}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(provider._id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          provider.isActive
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {provider.isActive ? (
                          <span className="flex items-center space-x-1">
                            <FaBan />
                            <span>Suspend</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1">
                            <FaUserCheck />
                            <span>Activate</span>
                          </span>
                        )}
                      </button>
                      <button className="btn-outline text-sm py-1 px-3">
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProviders}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ServiceProvidersManagement