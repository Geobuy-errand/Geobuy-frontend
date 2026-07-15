import React, { useState } from 'react'
import { useGetAllPaymentsQuery, useRefundPaymentMutation } from '../../redux/services/adminApi'
import { toast } from 'react-hot-toast'
import { FaSearch, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle, FaUndo } from 'react-icons/fa'

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data: payments, isLoading, refetch } = useGetAllPaymentsQuery()
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation()

  const filteredPayments = payments?.filter(p => {
    const matchesSearch = p.bookingId?.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.providerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === '' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'succeeded': return <FaCheckCircle className="text-green-600" />
      case 'processing': return <FaClock className="text-yellow-600" />
      case 'refunded': return <FaUndo className="text-red-600" />
      case 'failed': return <FaTimesCircle className="text-red-600" />
      default: return <FaClock className="text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-700'
      case 'processing': return 'bg-yellow-100 text-yellow-700'
      case 'refunded': return 'bg-red-100 text-red-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to refund this payment?')) return

    try {
      await refundPayment({
        paymentId,
        reason: 'Admin refund',
      }).unwrap()
      toast.success('Payment refunded successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to refund payment')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Payments</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search payments..."
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
          <option value="processing">Processing</option>
          <option value="succeeded">Succeeded</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-20 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredPayments?.length === 0 ? (
        <div className="text-center py-12">
          <FaMoneyBillWave className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No payments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments?.map((payment) => (
            <div key={payment._id} className="card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{getStatusIcon(payment.status)}</div>
                  <div>
                    <p className="font-semibold text-text">
                      Booking #{payment.bookingId?.bookingId}
                    </p>
                    <p className="text-sm text-text-light">
                      Customer: {payment.customerId?.fullName}
                    </p>
                    <p className="text-sm text-text-light">
                      Provider: {payment.providerId?.fullName}
                    </p>
                    <p className="text-xs text-text-lighter">
                      {new Date(payment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      £{payment.amount?.toFixed(2)}
                    </p>
                    <p className="text-sm text-text-lighter">
                      Fee: £{payment.platformFee?.toFixed(2)} | Provider: £{payment.providerAmount?.toFixed(2)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  {payment.status === 'succeeded' && (
                    <button
                      onClick={() => handleRefund(payment._id)}
                      disabled={isRefunding}
                      className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1 disabled:opacity-50"
                    >
                      <FaUndo />
                      <span>{isRefunding ? 'Refunding...' : 'Refund'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminPayments