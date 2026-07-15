import React, { useState } from 'react'
import { useGetVerificationQueueQuery, useVerifyProviderMutation } from '../../redux/services/adminApi'
import { toast } from 'react-hot-toast'
import { FaUser, FaCheck, FaTimes, FaClock, FaFileAlt, FaEye } from 'react-icons/fa'

const AdminVerificationQueue = () => {
  const { data: providers, isLoading, refetch } = useGetVerificationQueueQuery()
  const [verifyProvider] = useVerifyProviderMutation()
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const handleVerify = async (providerId, status) => {
    try {
      await verifyProvider({
        id: providerId,
        data: {
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        },
      }).unwrap()
      toast.success(`Provider ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
      setSelectedProvider(null)
      setRejectionReason('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update verification status')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Verification Queue</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-32 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : providers?.length === 0 ? (
        <div className="text-center py-12">
          <FaCheck className="text-4xl text-green-600 mx-auto mb-4" />
          <p className="text-text-light">No pending verifications</p>
          <p className="text-sm text-text-lighter">All providers have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers?.map((provider) => (
            <div key={provider._id} className="card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-primary text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text">{provider.fullName}</h3>
                    <p className="text-sm text-text-light">{provider.email}</p>
                    <p className="text-sm text-text-light">{provider.phoneNumber}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-text-light">
                      <span>{provider.address?.street}, {provider.address?.town}</span>
                      <span className="flex items-center">
                        <FaClock className="mr-1" />
                        {new Date(provider.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {provider.renderCareServices && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Care Services
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProvider(selectedProvider === provider._id ? null : provider._id)}
                      className="btn-outline text-sm py-1 px-3 flex items-center space-x-1"
                    >
                      <FaEye />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Review Section */}
              {selectedProvider === provider._id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-text mb-2">Documents</h4>
                      <div className="space-y-2">
                        {provider.documents?.passport && (
                          <div className="flex items-center space-x-2 text-sm">
                            <FaFileAlt className="text-primary" />
                            <span className="text-text-light">Passport/ID: </span>
                            <a href="#" className="text-primary hover:underline">View</a>
                          </div>
                        )}
                        {provider.documents?.proofOfAddress && (
                          <div className="flex items-center space-x-2 text-sm">
                            <FaFileAlt className="text-primary" />
                            <span className="text-text-light">Proof of Address: </span>
                            <a href="#" className="text-primary hover:underline">View</a>
                          </div>
                        )}
                        {provider.documents?.rightToWork && (
                          <div className="flex items-center space-x-2 text-sm">
                            <FaFileAlt className="text-primary" />
                            <span className="text-text-light">Right to Work: </span>
                            <a href="#" className="text-primary hover:underline">View</a>
                          </div>
                        )}
                        {provider.dbsDocument && (
                          <div className="flex items-center space-x-2 text-sm">
                            <FaFileAlt className="text-primary" />
                            <span className="text-text-light">DBS Certificate: </span>
                            <a href="#" className="text-primary hover:underline">View</a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-text mb-2">Bank Details</h4>
                      <div className="space-y-1 text-sm text-text-light">
                        <p>Bank: {provider.bankDetails?.bankName}</p>
                        <p>Sort Code: {provider.bankDetails?.sortCode}</p>
                        <p>Account: {provider.bankDetails?.accountNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
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
                        onClick={() => handleVerify(provider._id, 'approved')}
                        className="btn-primary text-sm py-2 px-6 flex items-center space-x-2"
                      >
                        <FaCheck />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleVerify(provider._id, 'rejected')}
                        className="bg-red-600 text-white text-sm py-2 px-6 rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <FaTimes />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminVerificationQueue