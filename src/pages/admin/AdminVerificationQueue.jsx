import React, { useState } from 'react'
import { useGetPendingVerificationsQuery, useReviewVerificationMutation } from '../../redux/services/verificationApi'
import { toast } from 'react-hot-toast'
import { 
  FaUser, 
  FaFileAlt, 
  FaCheck, 
  FaTimes, 
  FaClock,
  FaSearch,
  FaEye,
  FaDownload,
  FaShieldAlt,
  FaUserCheck,
  FaIdCard,
  FaHome,
  FaBriefcase
} from 'react-icons/fa'

const AdminVerificationQueue = () => {
  const { data: verifications, isLoading, refetch } = useGetPendingVerificationsQuery()
  const [reviewVerification, { isLoading: isReviewing }] = useReviewVerificationMutation()
  const [selectedVerification, setSelectedVerification] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const getTypeIcon = (type) => {
    switch (type) {
      case 'identity': return FaIdCard
      case 'dbs': return FaShieldAlt
      case 'certification': return FaUserCheck
      case 'insurance': return FaBriefcase
      case 'address': return FaHome
      default: return FaFileAlt
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'identity': return 'Identity Verification'
      case 'dbs': return 'DBS Check'
      case 'certification': return 'Certification'
      case 'insurance': return 'Insurance'
      case 'address': return 'Proof of Address'
      default: return type
    }
  }

  const handleReview = async (verificationId, status) => {
    if (status === 'rejected' && !rejectionReason) {
      toast.error('Please provide a rejection reason')
      return
    }

    try {
      await reviewVerification({
        id: verificationId,
        data: {
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        },
      }).unwrap()
      toast.success(`Verification ${status} successfully`)
      setSelectedVerification(null)
      setRejectionReason('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to review verification')
    }
  }

  const filteredVerifications = verifications?.filter(v => {
    const matchesSearch = v.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.type?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || v.type === filterType
    return matchesSearch && matchesFilter
  })

  const typeOptions = ['all', 'identity', 'dbs', 'certification', 'insurance', 'address']

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Verification Queue</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search verifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field w-full md:w-48"
        >
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type === 'all' ? 'All Types' : getTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-text-light">Total Pending</span>
            <span className="text-2xl font-bold text-primary">{verifications?.length || 0}</span>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-text-light">Identity Checks</span>
            <span className="text-2xl font-bold text-blue-600">
              {verifications?.filter(v => v.type === 'identity').length || 0}
            </span>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <span className="text-text-light">DBS Checks</span>
            <span className="text-2xl font-bold text-green-600">
              {verifications?.filter(v => v.type === 'dbs').length || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Verifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-32 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredVerifications?.length === 0 ? (
        <div className="text-center py-12">
          <FaCheck className="text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-text-light">No pending verifications</p>
          <p className="text-sm text-text-lighter">All documents have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVerifications?.map((verification) => {
            const Icon = getTypeIcon(verification.type)
            const user = verification.userId

            return (
              <div key={verification._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="text-primary text-xl" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-text">{user?.fullName}</h3>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center">
                          <FaClock className="mr-1" />
                          Pending
                        </span>
                      </div>
                      <p className="text-sm text-text-light">{user?.email}</p>
                      <p className="text-sm text-text-light">{user?.phoneNumber}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {getTypeLabel(verification.type)}
                        </span>
                        {verification.documentNumber && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            #{verification.documentNumber}
                          </span>
                        )}
                        {verification.expiryDate && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                            Expires: {new Date(verification.expiryDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-lighter mt-1">
                        Submitted: {new Date(verification.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="flex gap-2">
                      <a
                        href={verification.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline text-sm py-1 px-3 flex items-center space-x-1"
                      >
                        <FaEye />
                        <span>View</span>
                      </a>
                      <a
                        href={verification.documentUrl}
                        download
                        className="btn-outline text-sm py-1 px-3 flex items-center space-x-1"
                      >
                        <FaDownload />
                        <span>Download</span>
                      </a>
                    </div>
                    <button
                      onClick={() => setSelectedVerification(selectedVerification === verification._id ? null : verification._id)}
                      className="text-primary hover:underline text-sm"
                    >
                      {selectedVerification === verification._id ? 'Hide Actions' : 'Review'}
                    </button>
                  </div>
                </div>

                {/* Review Actions */}
                {selectedVerification === verification._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-text-light mb-1">
                          Rejection Reason (if rejecting)
                        </label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="input-field"
                          placeholder="Provide reason for rejection..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview(verification._id, 'approved')}
                          disabled={isReviewing}
                          className="btn-primary text-sm py-2 px-6 flex items-center space-x-2 disabled:opacity-50"
                        >
                          <FaCheck />
                          <span>{isReviewing ? 'Processing...' : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => handleReview(verification._id, 'rejected')}
                          disabled={isReviewing}
                          className="bg-red-600 text-white text-sm py-2 px-6 rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                          <FaTimes />
                          <span>{isReviewing ? 'Processing...' : 'Reject'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminVerificationQueue