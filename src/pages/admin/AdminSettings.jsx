import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaSave, FaDollarSign, FaUsers, FaPercent, FaClock, FaGlobe } from 'react-icons/fa'

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    platformFee: 10,
    minWithdrawal: 10,
    maxWithdrawal: 1000,
    bookingTimeout: 30,
    currency: 'GBP',
    timezone: 'Europe/London',
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings({
      ...settings,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings updated successfully')
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Platform Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Platform Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                <FaPercent className="inline mr-2" />
                Platform Fee (%)
              </label>
              <input
                type="number"
                name="platformFee"
                value={settings.platformFee}
                onChange={handleChange}
                className="input-field"
                min="0"
                max="100"
                step="0.5"
              />
              <p className="text-xs text-text-lighter mt-1">Percentage charged on each booking</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  <FaDollarSign className="inline mr-2" />
                  Min Withdrawal (£)
                </label>
                <input
                  type="number"
                  name="minWithdrawal"
                  value={settings.minWithdrawal}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  <FaDollarSign className="inline mr-2" />
                  Max Withdrawal (£)
                </label>
                <input
                  type="number"
                  name="maxWithdrawal"
                  value={settings.maxWithdrawal}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                <FaClock className="inline mr-2" />
                Booking Timeout (minutes)
              </label>
              <input
                type="number"
                name="bookingTimeout"
                value={settings.bookingTimeout}
                onChange={handleChange}
                className="input-field"
                min="5"
                max="120"
              />
              <p className="text-xs text-text-lighter mt-1">Time before pending bookings expire</p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Regional Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                <FaGlobe className="inline mr-2" />
                Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="input-field"
              >
                <option value="GBP">GBP (£)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                <FaClock className="inline mr-2" />
                Timezone
              </label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <FaSave />
          <span>{isLoading ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </form>
    </div>
  )
}

export default AdminSettings