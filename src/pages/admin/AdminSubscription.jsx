import React, { useState } from 'react'
import { FaSearch, FaMoneyBillWave, FaUsers } from 'react-icons/fa'
import { useGetSubscriptionHistoryQuery } from '../../redux/services/subscriptionApi'
import { toast } from 'react-hot-toast'

const AdminSubscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const { data, isLoading, refetch } = useGetSubscriptionHistoryQuery()


  const subscriptions = data?.subscriptions || []
  const stats = data?.stats || {}

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'trialing': return 'bg-blue-100 text-blue-700'
      case 'past_due': return 'bg-yellow-100 text-yellow-700'
      case 'canceled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.plan?.interval?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || sub.status === filter
    return matchesSearch && matchesFilter
  })


  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Subscriptions</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-text-light">Total</p>
          <p className="text-2xl font-bold text-text">{stats.total || 0}</p>
        </div>
        <div className="card border-green-200 bg-green-50">
          <p className="text-sm text-text-light">Active</p>
          <p className="text-2xl font-bold text-green-700">{stats.active || 0}</p>
        </div>
        <div className="card border-blue-200 bg-blue-50">
          <p className="text-sm text-text-light">Trialing</p>
          <p className="text-2xl font-bold text-blue-700">{stats.trialing || 0}</p>
        </div>
        <div className="card border-red-200 bg-red-50">
          <p className="text-sm text-text-light">Canceled</p>
          <p className="text-2xl font-bold text-red-700">{stats.canceled || 0}</p>
        </div>
        <div className="card border-primary/10 bg-primary/5">
          <p className="text-sm text-text-light">Monthly Revenue</p>
          <p className="text-2xl font-bold text-primary">£{stats.revenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search subscriptions..."
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
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>

      {/* Subscription Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-16 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">User</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Period</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Started</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((sub) => (
                <tr key={sub._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-text">{sub.userId?.fullName}</p>
                      <p className="text-sm text-text-light">{sub.userId?.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-medium">{sub.plan.interval}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    £{sub.plan.price}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-light">
                    {sub.currentPeriodStart && sub.currentPeriodEnd ? (
                      <>
                        {new Date(sub.currentPeriodStart).toLocaleDateString()} - {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                      </>
                    ) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-text-light">
                    {new Date(sub.createdAt).toLocaleDateString()}
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

export default AdminSubscriptions