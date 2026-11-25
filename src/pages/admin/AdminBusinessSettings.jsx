import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaSave, FaUndo, FaSpinner } from 'react-icons/fa'
import http from '../../services/http'
import { invalidatePublicSettings } from '../../hooks/usePublicPricing'

// Time limits & policies (both countries). Keys match Settings.operations.
const OPERATION_FIELDS = [
  { key: 'serviceRequestExpiryDays', label: 'Provider requests stay open for', unit: 'days' },
  { key: 'quoteExpiryDays', label: 'Provider quotes are valid for', unit: 'days' },
  { key: 'negotiationOfferExpiryHours', label: 'Errand price offers stay open for', unit: 'hours' },
  { key: 'maxCounterOffers', label: 'Counter-offers allowed per service quote', unit: 'offers', hint: 'Customer and provider combined. 0 = no limit' },
  { key: 'commissionDueDays', label: 'Commission invoices are due after', unit: 'days', hint: 'Bookings paid directly to providers' },
  { key: 'connectionExpiryDays', label: 'Connect requests expire after', unit: 'days' },
  { key: 'connectPostExpiryDays', label: 'Connect posts expire after', unit: 'days', hint: 'When no end date is given' },
  { key: 'qrCodeExpiryHours', label: 'QR codes expire after', unit: 'hours' },
  { key: 'maxRunnersNotified', label: 'Runners alerted per new errand', unit: 'runners' },
  { key: 'cancellationNoticeHours', label: 'Free cancellation notice', unit: 'hours', hint: 'Shown in Terms, FAQ and Help' },
  { key: 'supportResponseHours', label: 'Support replies within', unit: 'hours', hint: 'Shown on Contact page and support emails' },
]


/** Pricing inputs for one country. UK tiers are in miles, Nigeria tiers in km. */
const PricingFields = ({ section, values, symbol, unit, onChange, onTierChange }) => {
  const isNG = section === 'pricingNG'
  const maxKey = isNG ? 'maxKm' : 'maxMiles'
  const rateKey = isNG ? 'ratePerKm' : 'ratePerMile'
  const tiers = values.distanceTiers || {}
  const num = (field, label, { step = '0.01', int = false, hint, min = '0', max } = {}) => (
    <div>
      <label className="block text-sm font-medium text-text-light mb-1">{label}</label>
      <input
        type="number"
        value={values[field] ?? ''}
        onChange={(e) => onChange(section, field, e.target.value === '' ? '' : int ? parseInt(e.target.value, 10) : parseFloat(e.target.value))}
        className="input-field"
        step={step}
        min={min}
        {...(max ? { max } : {})}
        data-field={`${section}.${field}`}
      />
      {hint && <p className="text-xs text-text-lighter mt-1">{hint}</p>}
    </div>
  )
  const group = (title, children, cols = 3) => (
    <div>
      <h3 className="text-sm font-semibold text-text mb-2">{title}</h3>
      <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>{children}</div>
    </div>
  )
  const unitWord = unit === 'km' ? 'km' : 'miles'
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
      {group(
        'Errand prices',
        <>
          {num('baseFee', `Base Fee (${symbol})`)}
          {num('minimumFare', `Minimum Fare (${symbol})`, { hint: '0 = no minimum' })}
          {num('heavyItemFee', `Heavy Item Fee (${symbol})`)}
          {num('peakUrgentFee', `Peak/Urgent Fee (${symbol})`)}
          {num('extraStopFee', `Extra Stop Fee (${symbol})`, { hint: 'Per extra stop' })}
          {num('waitTimeFeePerMin', `Wait Time Fee (${symbol}/min)`)}
          {num('waitTimeFreeMin', 'Free Wait Minutes', { step: '1', int: true })}
          {num('subscriptionDiscount', 'Subscriber Discount (%)', { step: '1', max: '100' })}
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">Distance pricing</label>
            <select value={values.distanceTierMode || 'progressive'} onChange={(e) => onChange(section, 'distanceTierMode', e.target.value)} className="input-field">
              <option value="progressive">Progressive (each band at its own rate)</option>
              <option value="flat">Flat (whole trip at one band's rate)</option>
            </select>
          </div>
        </>
      )}
      {group(
        "Geobuy's share",
        <>
          {num('platformFeePercentage', 'Platform Fee (%) — errands', { step: '1', max: '100', hint: 'Runner receives the rest' })}
          {num('providerCommissionPercentage', 'Provider Commission (%) — service bookings', { step: '1', max: '100' })}
          {num('connectionFee', `Connect Fee (${symbol})`, { hint: 'One-time fee to use Connect' })}
        </>
      )}
      {group(
        'Wallets & withdrawals',
        <>
          {num('minWithdrawal', `Minimum Withdrawal (${symbol})`)}
          {num('maxWithdrawal', `Maximum Withdrawal (${symbol})`, { hint: 'Per request; 0 = no limit' })}
        </>,
        2
      )}
      {group(
        'Price negotiation (errand offers)',
        <>
          {num('negotiationMinPercent', 'Lowest offer (% of quoted price)', { step: '1', min: '1', max: '100' })}
          {num('negotiationMaxPercent', 'Highest offer (% of quoted price)', { step: '1', min: '100', max: '1000' })}
        </>,
        2
      )}
      {group(
        'Matching',
        <>
          {num('runnerSearchRadius', `Runner search radius (${unitWord})`, { step: '1', hint: 'How far from the pickup to look for runners' })}
          {num('providerSearchRadius', `Provider search radius (${unitWord})`, { step: '1', hint: 'Default “near me” radius for providers' })}
        </>,
        2
      )}
      <div className="bg-gray-50 rounded-xl p-4" data-testid="distance-method-settings">
        <h3 className="text-sm font-semibold text-text mb-2">Distance calculation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">Method</label>
            <select
              value={values.distanceMethod || (isNG ? 'haversine' : 'road')}
              onChange={(e) => onChange(section, 'distanceMethod', e.target.value)}
              className="input-field"
            >
              <option value="haversine">Haversine — straight-line distance between the two points</option>
              <option value="road">Road routing — Google / OpenStreetMap road distance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">Distance multiplier (Haversine only)</label>
            <input
              type="number"
              value={values.distanceMultiplier ?? 1}
              onChange={(e) => onChange(section, 'distanceMultiplier', parseFloat(e.target.value))}
              className="input-field"
              step="0.05"
              min="1"
              max="3"
              disabled={(values.distanceMethod || (isNG ? 'haversine' : 'road')) !== 'haversine'}
            />
          </div>
        </div>
        <p className="text-xs text-text-lighter mt-2">
          Haversine measures the direct distance, which is shorter than the road route. Leave the multiplier at 1 for pure
          straight-line pricing, or raise it (e.g. 1.3) to allow for roads — or adjust the per-{unit} rates below instead.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {num('roadFactor', 'Road factor', { step: '0.05', min: '1', max: '3', hint: 'Road ÷ straight-line distance, used when no routing service answers (road method)' })}
          {num('fallbackSpeedKmh', 'Average speed (km/h)', { step: '1', min: '5', max: '120', hint: 'For travel-time estimates' })}
          {num('trafficMultiplier', 'Traffic multiplier', { step: '0.05', min: '1', max: '4', hint: 'Applied to OpenStreetMap travel times' })}
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
      const { pricing, pricingNG, operations, platform, notifications, features, verification } = settings
      const response = await http.put('/api/settings', { pricing, pricingNG, operations, platform, notifications, features, verification }, {
        withCredentials: true,
      })
      toast.success('Settings updated successfully')
      setSettings(response.data.settings)
      invalidatePublicSettings() // pages pick up the new values straight away
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
      invalidatePublicSettings()
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
              <input
                type="checkbox"
                checked={settings.notifications?.emailEnabled !== false}
                onChange={(e) => handleChange('notifications', 'emailEnabled', e.target.checked)}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">Email notifications</span>
            </label>
            <label className="flex items-center space-x-3">
              <span className="text-sm text-text-light">Auto-confirm delivered errands and finished jobs after</span>
              <input
                type="number"
                min="0"
                value={settings.features?.autoCompleteHours ?? ''}
                onChange={(e) => handleChange('features', 'autoCompleteHours', parseInt(e.target.value, 10) || 0)}
                className="w-20 input-field py-1"
              />
              <span className="text-sm text-text-light">hours (0 = off)</span>
            </label>
          </div>
        </div>

        {/* Operations & time limits */}
        <div className="card" data-testid="operations-settings">
          <h2 className="text-lg font-semibold text-text mb-1">Operations & time limits</h2>
          <p className="text-sm text-text-lighter mb-4">Apply to both countries.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OPERATION_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-text-light mb-1">{f.label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.operations?.[f.key] ?? ''}
                    onChange={(e) => handleChange('operations', f.key, e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    className="input-field"
                    data-field={`operations.${f.key}`}
                  />
                  <span className="text-sm text-text-light w-16">{f.unit}</span>
                </div>
                {f.hint && <p className="text-xs text-text-lighter mt-1">{f.hint}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Identity verification for providers & errand runners */}
        <div className="card" data-testid="verification-settings">
          <h2 className="text-lg font-semibold text-text mb-1">Identity verification</h2>
          <p className="text-sm text-text-lighter mb-4">
            Nigeria: NIN check with Dojah. UK: photo ID + selfie with Didit. Set <code>VERIFICATION_MOCK=true</code> in the backend .env to pass checks automatically until the keys are in.
          </p>
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-text">Providers must verify before quoting or taking jobs</span>
              <input type="checkbox" className="w-5 h-5" checked={settings.verification?.requiredForProviders !== false}
                onChange={(e) => handleChange('verification', 'requiredForProviders', e.target.checked)} data-field="verification.requiredForProviders" />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-text">Errand runners must verify before accepting errands</span>
              <input type="checkbox" className="w-5 h-5" checked={settings.verification?.requiredForRunners !== false}
                onChange={(e) => handleChange('verification', 'requiredForRunners', e.target.checked)} data-field="verification.requiredForRunners" />
            </label>
            <div>
              <p className="text-sm font-medium text-text-light mb-2">Who pays for each check?</p>
              <div className="flex flex-col sm:flex-row gap-2">
                {[
                  ['platform', 'Geobuy pays', 'Free for providers and runners — you are billed by Dojah / Didit'],
                  ['worker', 'Provider / runner pays', 'They pay the fee below by card before the check runs'],
                ].map(([value, title, hint]) => (
                  <label key={value} className={`flex-1 p-3 rounded-lg border cursor-pointer ${(settings.verification?.paidBy || 'platform') === value ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <input type="radio" name="verification-paidBy" value={value} className="mr-2" data-field={`verification.paidBy.${value}`}
                      checked={(settings.verification?.paidBy || 'platform') === value}
                      onChange={() => handleChange('verification', 'paidBy', value)} />
                    <span className="font-medium text-text">{title}</span>
                    <span className="block text-xs text-text-lighter mt-1">{hint}</span>
                  </label>
                ))}
              </div>
            </div>
            {(settings.verification?.paidBy || 'platform') === 'worker' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Fee in the UK (£)</label>
                  <input type="number" min="0" step="0.01" className="input-field" value={settings.verification?.feeGB ?? ''} data-field="verification.feeGB"
                    onChange={(e) => handleChange('verification', 'feeGB', e.target.value === '' ? '' : parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Fee in Nigeria (₦)</label>
                  <input type="number" min="0" step="1" className="input-field" value={settings.verification?.feeNG ?? ''} data-field="verification.feeNG"
                    onChange={(e) => handleChange('verification', 'feeNG', e.target.value === '' ? '' : parseFloat(e.target.value))} />
                </div>
              </div>
            )}
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm text-text">
                Approve the account automatically when the ID check passes
                <span className="block text-xs text-text-lighter">Off: an admin approves each account after the check</span>
              </span>
              <input type="checkbox" className="w-5 h-5" checked={settings.verification?.autoApprove !== false}
                onChange={(e) => handleChange('verification', 'autoApprove', e.target.checked)} data-field="verification.autoApprove" />
            </label>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-text-light mb-1">Attempts allowed per person</label>
              <input type="number" min="0" step="1" className="input-field" value={settings.verification?.maxAttempts ?? ''} data-field="verification.maxAttempts"
                onChange={(e) => handleChange('verification', 'maxAttempts', e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
              <p className="text-xs text-text-lighter mt-1">0 = no limit</p>
            </div>
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