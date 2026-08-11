import React, { useState } from 'react'
import { useGetErrandRunnersQuery, useToggleErrandRunnerStatusMutation } from '../../redux/services/adminApi'
import { toast } from 'react-hot-toast'
import { FaSearch, FaUser, FaCheck, FaTimes, FaBan, FaUserCheck, FaCar, FaWalking, FaBicycle, FaMotorcycle } from 'react-icons/fa'

const ErrandRunners = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const { data: runners, isLoading, refetch } = useGetErrandRunnersQuery()
  const [toggleStatus] = useToggleErrandRunnerStatusMutation()

  const filteredRunners = runners?.filter(r => {
    const matchesSearch = r.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         r.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesVerification = verificationFilter === '' || r.verificationStatus === verificationFilter
    return matchesSearch && matchesVerification
  })

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center text-green-600 text-sm"><FaCheck className="mr-1" /> Verified</span>
      case 'pending':
        return <span className="flex items-center text-yellow-600 text-sm"><FaCheck className="mr-1" /> Pending</span>
      case 'rejected':
        return <span className="flex items-center text-red-600 text-sm"><FaCheck className="mr-1" /> Rejected</span>
      default:
        return <span className="text-gray-600 text-sm">Not Submitted</span>
    }
  }

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'car': return <FaCar />
      case 'van': return <FaCar />
      case 'bicycle': return <FaBicycle />
      case 'motorbike': return <FaMotorcycle />
      default: return <FaWalking />
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      await toggleStatus(userId).unwrap()
      toast.success('Runner status updated')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update runner status')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Errand Runners</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search runners..."
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
        <Link to="/admin/verification" className="btn-primary text-sm py-2 px-4 flex items-center whitespace-nowrap">
          <FaUserCheck className="mr-2" />
          Verification Queue
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
      ) : filteredRunners?.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No errand runners found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRunners?.map((runner) => (
            <div key={runner._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-primary text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text">{runner.userId?.fullName}</h3>
                    <p className="text-sm text-text-light">{runner.userId?.email}</p>
                    <p className="text-sm text-text-light">{runner.userId?.phoneNumber}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-sm text-text-light">
                        <FaStar className="text-yellow-400 mr-1" />
                        {runner.userId?.averageRating?.toFixed(1) || 'New'}
                      </span>
                      <span className="text-sm text-text-light">
                        {runner.completedJobs || 0} jobs
                      </span>
                      <span className="text-sm text-text-light">
                        <FaCar className="inline mr-1" />
                        {runner.vehicleType || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  {getVerificationBadge(runner.verificationStatus)}
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${runner.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {runner.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(runner.userId._id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        runner.isActive
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {runner.isActive ? 'Suspend' : 'Activate'}
                    </button>
                    <Link
                      to={`/admin/verification`}
                      className="btn-outline text-sm py-1 px-3"
                    >
                      Review
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

export default ErrandRunners