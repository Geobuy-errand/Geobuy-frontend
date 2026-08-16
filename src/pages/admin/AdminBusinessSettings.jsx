import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaSave, FaUndo, FaSpinner } from 'react-icons/fa'
import axios from 'axios'

const AdminBusinessSetting = () => {
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/settings', {
        withCredentials: true,
      })
      setSettings(response.data)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleNestedChange = (section, nested, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nested]: {
          ...prev[section]?.[nested],
          [field]: value,
        },
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await axios.put('/api/settings', settings, {
        withCredentials: true,
      })
      toast.success('Settings updated successfully')
      setSettings(response.data.settings)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults?')) return
    
    try {
      const response = await axios.post('/api/settings/reset', {}, {
        withCredentials: true,
      })
      toast.success('Settings reset to defaults')
      setSettings(response.data.settings)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset settings')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-3xl" />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">No settings found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Platform Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="btn-outline text-sm py-2 px-4 flex items-center gap-2"
          >
            <FaUndo />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary text-sm py-2 px-4 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Pricing Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Pricing Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Base Fee (£)
              </label>
              <input
                type="number"
                value={settings.pricing?.baseFee || 0}
                onChange={(e) => handleChange('pricing', 'baseFee', parseFloat(e.target.value))}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Subscription Discount (%)
              </label>
              <input
                type="number"
                value={settings.pricing?.subscriptionDiscount || 0}
                onChange={(e) => handleChange('pricing', 'subscriptionDiscount', parseFloat(e.target.value))}
                className="input-field"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Platform Fee (%)
              </label>
              <input
                type="number"
                value={settings.pricing?.platformFeePercentage || 0}
                onChange={(e) => handleChange('pricing', 'platformFeePercentage', parseFloat(e.target.value))}
                className="input-field"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Heavy Item Fee (£)
              </label>
              <input
                type="number"
                value={settings.pricing?.heavyItemFee || 0}
                onChange={(e) => handleChange('pricing', 'heavyItemFee', parseFloat(e.target.value))}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Wait Time Fee (£/min)
              </label>
              <input
                type="number"
                value={settings.pricing?.waitTimeFeePerMin || 0}
                onChange={(e) => handleChange('pricing', 'waitTimeFeePerMin', parseFloat(e.target.value))}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Free Wait Time (minutes)
              </label>
              <input
                type="number"
                value={settings.pricing?.waitTimeFreeMin || 0}
                onChange={(e) => handleChange('pricing', 'waitTimeFreeMin', parseInt(e.target.value))}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Peak/Urgent Fee (£)
              </label>
              <input
                type="number"
                value={settings.pricing?.peakUrgentFee || 0}
                onChange={(e) => handleChange('pricing', 'peakUrgentFee', parseFloat(e.target.value))}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Extra Stop Fee (£)
              </label>
              <input
                type="number"
                value={settings.pricing?.extraStopFee || 0}
                onChange={(e) => handleChange('pricing', 'extraStopFee', parseFloat(e.target.value))}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <h3 className="font-medium text-text mt-4 mb-2">Distance Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Tier 1: Max Miles
              </label>
              <input
                type="number"
                value={settings.pricing?.distanceTiers?.tier1?.maxMiles || 3}
                onChange={(e) => handleNestedChange('pricing', 'distanceTiers', 'tier1', {
                  ...settings.pricing?.distanceTiers?.tier1,
                  maxMiles: parseFloat(e.target.value),
                })}
                className="input-field"
                min="0"
              />
              <label className="block text-sm font-medium text-text-light mb-1 mt-2">
                Rate (£/mile)
              </label>
              <input
                type="number"
                value={settings.pricing?.distanceTiers?.tier1?.ratePerMile || 0.80}
                onChange={(e) => handleNestedChange('pricing', 'distanceTiers', 'tier1', {
                  ...settings.pricing?.distanceTiers?.tier1,
                  ratePerMile: parseFloat(e.target.value),
                })}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Tier 2: Max Miles
              </label>
              <input
                type="number"
                value={settings.pricing?.distanceTiers?.tier2?.maxMiles || 10}
                onChange={(e) => handleNestedChange('pricing', 'distanceTiers', 'tier2', {
                  ...settings.pricing?.distanceTiers?.tier2,
                  maxMiles: parseFloat(e.target.value),
                })}
                className="input-field"
                min="0"
              />
              <label className="block text-sm font-medium text-text-light mb-1 mt-2">
                Rate (£/mile)
              </label>
              <input
                type="number"
                value={settings.pricing?.distanceTiers?.tier2?.ratePerMile || 0.70}
                onChange={(e) => handleNestedChange('pricing', 'distanceTiers', 'tier2', {
                  ...settings.pricing?.distanceTiers?.tier2,
                  ratePerMile: parseFloat(e.target.value),
                })}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Tier 3: Max Miles
              </label>
              <input
                type="number"
                value={settings.pricing?.distanceTiers?.tier3?.maxMiles || 20}
                onChange={(e) => handleNestedChange('pricing', 'distanceTiers', 'tier3', {
                  ...settings.pricing?.distanceTiers?.tier3,
                  maxMiles: parseFloat(e.target.value),
                })}
                className="input-field"
                min="0"
              />
              <label className="block text-sm font-medium text-text-light mb-1 mt-2">
                Rate (£/mile)
              </label>
              <input
                type="number"
                value={settings.pricing?.distanceTiers?.tier3?.ratePerMile || 0.60}
                onChange={(e) => handleNestedChange('pricing', 'distanceTiers', 'tier3', {
                  ...settings.pricing?.distanceTiers?.tier3,
                  ratePerMile: parseFloat(e.target.value),
                })}
                className="input-field"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Tier 4: Rate (£/mile)
              </label>
              <input
                type="number"
                value={settings.pricing?.distanceTiers?.tier4?.ratePerMile || 0.50}
                onChange={(e) => handleNestedChange('pricing', 'distanceTiers', 'tier4', {
                  ...settings.pricing?.distanceTiers?.tier4,
                  ratePerMile: parseFloat(e.target.value),
                })}
                className="input-field"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-text-lighter mt-2">For distances beyond Tier 3</p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Feature Toggles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features?.subscriptionsEnabled !== false}
                onChange={(e) => handleChange('features', 'subscriptionsEnabled', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">Subscriptions</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features?.liveTrackingEnabled !== false}
                onChange={(e) => handleChange('features', 'liveTrackingEnabled', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">Live Tracking</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features?.qrCodeEnabled !== false}
                onChange={(e) => handleChange('features', 'qrCodeEnabled', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">QR Codes</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features?.negotiationEnabled !== false}
                onChange={(e) => handleChange('features', 'negotiationEnabled', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">Negotiation</span>
            </label>
          </div>
        </div>

        {/* Platform Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Platform Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.platform?.name || ''}
                onChange={(e) => handleChange('platform', 'name', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.platform?.currencySymbol || '£'}
                onChange={(e) => handleChange('platform', 'currencySymbol', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.platform?.contactEmail || ''}
                onChange={(e) => handleChange('platform', 'contactEmail', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={settings.platform?.contactPhone || ''}
                onChange={(e) => handleChange('platform', 'contactPhone', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBusinessSetting