import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaSave, FaUndo, FaSpinner } from 'react-icons/fa'
import http from '../../services/http'


/** Pricing inputs for one country. UK tiers are in miles, Nigeria tiers in km. */
const PricingFields = ({ section, values, symbol, unit, onChange, onTierChange }) => {
  const isNG = section === 'pricingNG'
  const maxKey = isNG ? 'maxKm' : 'maxMiles'
  const rateKey = isNG ? 'ratePerKm' : 'ratePerMile'
  const tiers = values.distanceTiers || {}
  const num = (field, label, { step = '0.01', int = false } = {}) => (
    <div>
      <label className="block text-sm font-medium text-text-light mb-1">{label}</label>
      <input
        type="number"
        value={values[field] ?? ''}
        onChange={(e) => onChange(section, field, int ? parseInt(e.target.value, 10) : parseFloat(e.target.value))}
        className="input-field"
        step={step}
        min="0"
      />
    </div>
  )
  const tier = (key, label, last = false) => (
    <div key={key} className="bg-gray-50 rounded-xl p-3">
      <p className="text-sm font-medium text-text mb-2">{label}</p>
      {!last && (
        <>
          <label className="block text-xs text-text-light mb-1">Up to ({unit === 'km' ? 'km' : 'miles'})</label>
          <input
            type="number"
            value={tiers[key]?.[maxKey] ?? ''}
            onChange={(e) => onTierChange(section, 'distanceTiers', key, { ...tiers[key], [maxKey]: parseFloat(e.target.value) })}
            className="input-field mb-2"
            step="0.5"
            min="0"
          />
        </>
      )}
      <label className="block text-xs text-text-light mb-1">
        Rate ({symbol}/{unit})
      </label>
      <input
        type="number"
        value={tiers[key]?.[rateKey] ?? ''}
        onChange={(e) => onTierChange(section, 'distanceTiers', key, { ...tiers[key], [rateKey]: parseFloat(e.target.value) })}
        className="input-field"
        step="0.01"
        min="0"
      />
      {last && <p className="text-xs text-text-lighter mt-2">Beyond tier 3</p>}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {num('baseFee', `Base Fee (${symbol})`)}
        {num('connectionFee', `Connection Fee (${symbol})`)}
        {num('platformFeePercentage', 'Platform Fee (%)', { step: '1' })}
        {num('subscriptionDiscount', 'Subscriber Discount (%)', { step: '1' })}
        {num('heavyItemFee', `Heavy Item Fee (${symbol})`)}
        {num('peakUrgentFee', `Peak/Urgent Fee (${symbol})`)}
        {num('extraStopFee', `Extra Stop Fee (${symbol})`)}
        {num('waitTimeFeePerMin', `Wait Time Fee (${symbol}/min)`)}
        {num('waitTimeFreeMin', 'Free Wait Minutes', { step: '1', int: true })}
        {num('minimumFare', `Minimum Fare (${symbol}, 0 = none)`)}
        {num('minWithdrawal', `Minimum Withdrawal (${symbol})`)}
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">Distance pricing</label>
          <select value={values.distanceTierMode || 'progressive'} onChange={(e) => onChange(section, 'distanceTierMode', e.target.value)} className="input-field">
            <option value="progressive">Progressive (each band at its own rate)</option>
            <option value="flat">Flat (whole trip at one band's rate)</option>
          </select>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text mb-2">Distance tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {tier('tier1', 'Tier 1')}
          {tier('tier2', 'Tier 2')}
          {tier('tier3', 'Tier 3')}
          {tier('tier4', 'Tier 4', true)}
        </div>
      </div>
    </div>
  )
}

const AdminBusinessSetting = () => {
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [pricingTab, setPricingTab] = useState('pricing')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await http.get('/api/settings', {
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
      const { pricing, pricingNG, platform, notifications, features } = settings
      const response = await http.put('/api/settings', { pricing, pricingNG, platform, notifications, features }, {
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
      const response = await http.post('/api/settings/reset', {}, {
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
        {/* Pricing Settings — one tab per country */}
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-text">Errand Pricing</h2>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
              {[
                { key: 'pricing', label: '🇬🇧 United Kingdom (£, miles)' },
                { key: 'pricingNG', label: '🇳🇬 Nigeria (₦, km)' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setPricingTab(t.key)}
                  className={`px-3 py-1.5 rounded-md text-sm ${pricingTab === t.key ? 'bg-primary text-white' : 'text-text-light'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <PricingFields
            key={pricingTab}
            section={pricingTab}
            values={settings[pricingTab] || {}}
            symbol={pricingTab === 'pricingNG' ? '₦' : '£'}
            unit={pricingTab === 'pricingNG' ? 'km' : 'mile'}
            onChange={handleChange}
            onTierChange={handleNestedChange}
          />
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
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features?.requirePaymentBeforeAcceptance !== false}
                onChange={(e) => handleChange('features', 'requirePaymentBeforeAcceptance', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">Customers pay before runners see errands</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={settings.features?.paystackPayoutsEnabled !== false}
                onChange={(e) => handleChange('features', 'paystackPayoutsEnabled', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">Send Nigerian payouts via Paystack</span>
            </label>
            <label className="flex items-center space-x-3">
              <span className="text-sm text-text-light">Auto-complete delivered errands after</span>
              <input
                type="number"
                min="0"
                value={settings.features?.autoCompleteHours ?? 48}
                onChange={(e) => handleChange('features', 'autoCompleteHours', parseInt(e.target.value, 10) || 0)}
                className="w-20 input-field py-1"
              />
              <span className="text-sm text-text-light">hours (0 = off)</span>
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
            <div className="text-sm text-text-lighter self-end">
              Currencies are set per country: UK users pay in £ (Stripe), Nigerian users in ₦ (Paystack).
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Contact Email (UK)
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
                Contact Phone (UK)
              </label>
              <input
                type="text"
                value={settings.platform?.contactPhone || ''}
                onChange={(e) => handleChange('platform', 'contactPhone', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Contact Email (Nigeria)</label>
              <input
                type="email"
                value={settings.platform?.contactEmailNG || ''}
                onChange={(e) => handleChange('platform', 'contactEmailNG', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Contact Phone (Nigeria)</label>
              <input
                type="text"
                value={settings.platform?.contactPhoneNG || ''}
                onChange={(e) => handleChange('platform', 'contactPhoneNG', e.target.value)}
                className="input-field"
                placeholder="+234 ..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminBusinessSetting