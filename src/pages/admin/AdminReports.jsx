import React, { useState } from 'react'
import { FaFileAlt, FaDownload, FaCalendar, FaUsers, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa'

const AdminReports = () => {
  const [reportType, setReportType] = useState('')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  })

  const reportTypes = [
    {
      id: 'users',
      label: 'User Report',
      icon: FaUsers,
      description: 'Complete user statistics and growth',
    },
    {
      id: 'bookings',
      label: 'Booking Report',
      icon: FaClipboardList,
      description: 'All bookings with status and revenue',
    },
    {
      id: 'revenue',
      label: 'Revenue Report',
      icon: FaMoneyBillWave,
      description: 'Detailed revenue breakdown',
    },
    {
      id: 'providers',
      label: 'Provider Report',
      icon: FaUsers,
      description: 'Provider performance and verification',
    },
  ]

  const handleGenerateReport = () => {
    if (!reportType || !dateRange.start || !dateRange.end) {
      alert('Please select report type and date range')
      return
    }
    alert(`Generating ${reportType} report from ${dateRange.start} to ${dateRange.end}`)
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Reports</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Report */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Generate Report</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Report Type *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select report type...</option>
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Date Range *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              <FaDownload />
              <span>Generate Report</span>
            </button>
          </div>
        </div>

        {/* Available Reports */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Available Reports</h2>
          <div className="space-y-3">
            {reportTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <type.icon className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text">{type.label}</p>
                    <p className="text-sm text-text-light">{type.description}</p>
                  </div>
                </div>
                <button className="text-primary hover:text-primary-dark transition-colors">
                  <FaDownload />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-text mb-4">Export Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition-colors">
            <FaFileAlt className="text-primary" />
            <span>CSV Export</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition-colors">
            <FaFileAlt className="text-primary" />
            <span>PDF Export</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition-colors">
            <FaFileAlt className="text-primary" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminReports