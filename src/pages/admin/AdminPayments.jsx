import React, { useState } from 'react'
import { useGetAllPaymentsQuery, useGetPaymentStatsQuery } from '../../redux/services/adminApi'
import { FaSearch, FaMoneyBillWave, FaCheckCircle, FaClock, FaTimesCircle, FaUndo } from 'react-icons/fa'

const AdminPayments = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data: payments, isLoading, refetch } = useGetAllPaymentsQuery()
  const { data: stats } = useGetPaymentStatsQuery()

  const filteredPayments = payments?.filter(p => {
    const matchesSearch = p.bookingId?.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.providerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === '' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded': return 'bg-green-100 text-green-700'
      case 'processing': return 'bg-yellow-100 text-yellow-700'
      case 'refunded': return 'bg-red-100 text-red-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Payments</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-text-light">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">£{stats.totalRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <p className="text-sm text-text-light">Today's Revenue</p>
            <p className="text-2xl font-bold text-secondary">£{stats.todayRevenue?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <p className="text-sm text-text-light">Platform Fee</p>
            <p className="text-2xl font-bold text-blue-600">£{stats.totalPlatformFee?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="card">
            <p className="text-sm text-text-light">Pending Disbursements</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingDisbursements || 0}</p>
          </div>
        </div>
      )}

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

      {/* Payments Table */}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments?.map((payment) => (
                <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-text">
                    {payment.bookingId?.bookingId || payment.errandId?.errandId || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-text-light">{payment.customerId?.fullName}</td>
                  <td className="py-3 px-4 text-text-light">{payment.providerId?.fullName}</td>
                  <td className="py-3 px-4 font-semibold text-primary">£{payment.amount?.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-text-light">
                    {new Date(payment.createdAt).toLocaleDateString()}
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

export default AdminPayments