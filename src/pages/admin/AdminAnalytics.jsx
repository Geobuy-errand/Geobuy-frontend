import React, { useState } from 'react'
import { useGetRevenueAnalyticsQuery, useGetBookingAnalyticsQuery } from '../../redux/services/adminApi'
import { FaChartLine, FaChartBar, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa'
import { formatMoney } from '../../utils/money'

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('month')
  const [currency, setCurrency] = useState('GBP')
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueAnalyticsQuery({ period, currency })
  const format = (v) => formatMoney(v, currency)
  const { data: bookingData, isLoading: bookingLoading } = useGetBookingAnalyticsQuery()

  const isLoading = revenueLoading || bookingLoading

  const totalRevenue = revenueData?.reduce((sum, item) => sum + item.total, 0) || 0
  const totalBookings = bookingData?.total || 0

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Analytics</h1>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field py-2 w-auto">
          <option value="GBP">🇬🇧 United Kingdom (GBP)</option>
          <option value="NGN">🇳🇬 Nigeria (NGN)</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Total Revenue</p>
              <p className="text-2xl font-bold text-primary">{format(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FaMoneyBillWave className="text-primary text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Total Bookings</p>
              <p className="text-2xl font-bold text-text">{totalBookings}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <FaClipboardList className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Average Price</p>
              <p className="text-2xl font-bold text-text">{format(bookingData?.averagePrice)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <FaChartLine className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-light">Total Platform Fee</p>
              <p className="text-2xl font-bold text-secondary">
                {format(revenueData?.reduce((sum, item) => sum + (item.platformFee || 0), 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <FaChartBar className="text-secondary text-xl" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="skeleton h-64 rounded-xl"></div>
          <div className="skeleton h-64 rounded-xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text">Revenue</h2>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="input-field py-1 px-3 w-32 text-sm"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <div className="space-y-3">
              {revenueData?.map((item) => (
                <div key={item._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-light">{item._id}</span>
                    <span className="font-medium text-text">{format(item.total)}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all"
                      style={{
                        width: `${Math.min((item.total / Math.max(...revenueData.map(i => i.total), 1)) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Booking Status Distribution</h2>
            <div className="space-y-3">
              {bookingData?.byStatus?.map((status) => (
                <div key={status._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-light capitalize">{status._id}</span>
                    <span className="font-medium text-text">{status.count}</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        status._id === 'completed' ? 'bg-green-500' :
                        status._id === 'pending' ? 'bg-yellow-500' :
                        status._id === 'cancelled' ? 'bg-red-500' :
                        status._id === 'in_progress' ? 'bg-purple-500' :
                        'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min((status.count / (bookingData?.total || 1)) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAnalytics