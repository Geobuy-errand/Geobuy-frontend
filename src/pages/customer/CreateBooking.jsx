import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useCreateErrandMutation } from '../../redux/services/errandApi'
import { useGetServicesQuery } from '../../redux/services/serviceApi'
import { getDistance } from '../../services/distanceService'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import { toast } from 'react-hot-toast'
import { 
  FaCalendar, 
  FaClock, 
  FaCamera, 
  FaInfoCircle,
  FaArrowRight,
  FaRuler,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaWeightHanging,
  FaClock as FaClockIcon,
  FaBolt,
  FaDollarSign,
} from 'react-icons/fa'

const CreateBooking = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [createErrand, { isLoading }] = useCreateErrandMutation()
  
  // ✅ Fetch services from API
  const { data: services, isLoading: servicesLoading } = useGetServicesQuery()

  // Pricing constants
  const BASE_FEE = 3.99
  const SUBSCRIPTION_DISCOUNT = 20 // 20%
  const HEAVY_ITEM_FEE = 2.99
  const WAIT_TIME_FEE_PER_MIN = 0.30
  const WAIT_TIME_FREE_MIN = 5
  const PEAK_URGENT_FEE = 1.99
  const EXTRA_STOP_FEE = 1.50

  // Distance tier rates
  const getDistanceRate = (miles) => {
    if (miles <= 3) return 0.80
    if (miles <= 10) return 0.70
    if (miles <= 20) return 0.60
    return 0.50
  }

  const [formData, setFormData] = useState({
    serviceType: '',
    serviceId: '',
    pickup: {
      address: '',
      street: '',
      town: '',
      postcode: '',
      instructions: '',
      coordinates: null,
    },
    dropoff: {
      address: '',
      street: '',
      town: '',
      postcode: '',
      instructions: '',
      coordinates: null,
    },
    taskDetails: '',
    preferredDate: '',
    preferredTime: '',
    requiresLiveTracking: false,
    isHeavyItem: false,
    isPeakUrgent: false,
    extraStopsCount: 0,
    waitTimeMinutes: 0,
  })

  const [hasDropoff, setHasDropoff] = useState(false)
  const [photos, setPhotos] = useState([])
  const [distance, setDistance] = useState(0)
  const [distanceText, setDistanceText] = useState('')
  const [durationText, setDurationText] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [distanceError, setDistanceError] = useState(null)
  const [addressesValid, setAddressesValid] = useState({
    pickup: false,
    dropoff: false,
  })
  const [priceEstimate, setPriceEstimate] = useState({
    baseFee: BASE_FEE,
    distanceFee: 0,
    distanceRate: 0.80,
    heavyItemFee: 0,
    waitTimeFee: 0,
    peakUrgentFee: 0,
    extraStopsFee: 0,
    subtotal: 0,
    discountPercentage: 0,
    discountAmount: 0,
    total: 0,
    platformFee: 0,
    providerAmount: 0,
  })
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isDistanceCalculated, setIsDistanceCalculated] = useState(false)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)

  // Check if user is subscribed
  useEffect(() => {
    if (user?.subscription?.isSubscribed) {
      setIsSubscribed(true)
    }
  }, [user])

  // Auto-calculate distance when addresses are selected
  useEffect(() => {
    if (addressesValid.pickup && addressesValid.dropoff && hasDropoff && formData.pickup.address && formData.dropoff.address) {
      const timer = setTimeout(() => {
        calculateRealDistance()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [addressesValid.pickup, addressesValid.dropoff, hasDropoff, formData.pickup.address, formData.dropoff.address])

  // Recalculate price when any pricing option changes
  useEffect(() => {
    if (distance > 0 && isDistanceCalculated) {
      calculatePrice(distance)
    }
  }, [distance, isSubscribed, formData.isHeavyItem, formData.isPeakUrgent, formData.extraStopsCount, formData.waitTimeMinutes])

  const handleAddressSelect = (type, suggestion) => {
    const addressField = type === 'pickup' ? 'pickup' : 'dropoff'
    const addressParts = suggestion.displayName?.split(',') || []
    const street = addressParts[0]?.trim() || ''
    const town = addressParts[1]?.trim() || ''
    const postcode = suggestion.postcode || addressParts[addressParts.length - 2]?.trim() || ''

    setFormData(prev => ({
      ...prev,
      [addressField]: {
        ...prev[addressField],
        address: suggestion.displayName || '',
        street: street,
        town: town,
        postcode: postcode,
        coordinates: suggestion.lat && suggestion.lon ? {
          lat: suggestion.lat,
          lng: suggestion.lon,
        } : null,
      }
    }))

    setAddressesValid(prev => ({
      ...prev,
      [type]: true,
    }))

    setIsDistanceCalculated(false)
    setDistance(0)
    setDistanceText('')
    setDurationText('')
    setDistanceError(null)

    if (type === 'pickup' && formData.dropoff.address) {
      setTimeout(() => calculateRealDistance(), 100)
    } else if (type === 'dropoff' && formData.pickup.address) {
      setTimeout(() => calculateRealDistance(), 100)
    }
  }

  const handleAddressChange = (type, e) => {
    const addressField = type === 'pickup' ? 'pickup' : 'dropoff'
    const value = e.target.value

    setFormData(prev => ({
      ...prev,
      [addressField]: {
        ...prev[addressField],
        address: value,
        coordinates: null,
      }
    }))

    setAddressesValid(prev => ({
      ...prev,
      [type]: false,
    }))
    
    setIsDistanceCalculated(false)
    setDistance(0)
    setDistanceText('')
    setDurationText('')
    setDistanceError(null)
  }

  // ✅ Handle service selection from API data
  const handleServiceSelect = (serviceId) => {
    const selectedService = services?.find(s => s._id === serviceId)
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        serviceId,
        serviceType: selectedService.category || selectedService.name,
      }))
    }
  }

  const calculatePrice = (dist) => {
    const distanceInMiles = dist || distance || 0
    
    if (distanceInMiles === 0) {
      setPriceEstimate({
        baseFee: BASE_FEE,
        distanceFee: 0,
        distanceRate: 0.80,
        heavyItemFee: 0,
        waitTimeFee: 0,
        peakUrgentFee: 0,
        extraStopsFee: 0,
        subtotal: 0,
        discountPercentage: 0,
        discountAmount: 0,
        total: 0,
        platformFee: 0,
        providerAmount: 0,
      })
      return
    }
    
    const ratePerMile = getDistanceRate(distanceInMiles)
    const distanceFee = Math.round((distanceInMiles * ratePerMile) * 100) / 100
    
    let subtotal = BASE_FEE + distanceFee
    
    let heavyItemFee = 0
    if (formData.isHeavyItem) {
      heavyItemFee = HEAVY_ITEM_FEE
      subtotal += heavyItemFee
    }
    
    let waitTimeFee = 0
    if (formData.waitTimeMinutes > WAIT_TIME_FREE_MIN) {
      const extraMinutes = formData.waitTimeMinutes - WAIT_TIME_FREE_MIN
      waitTimeFee = Math.round((extraMinutes * WAIT_TIME_FEE_PER_MIN) * 100) / 100
      subtotal += waitTimeFee
    }
    
    let peakUrgentFee = 0
    if (formData.isPeakUrgent) {
      peakUrgentFee = PEAK_URGENT_FEE
      subtotal += peakUrgentFee
    }
    
    let extraStopsFee = 0
    if (formData.extraStopsCount > 0) {
      extraStopsFee = Math.round((formData.extraStopsCount * EXTRA_STOP_FEE) * 100) / 100
      subtotal += extraStopsFee
    }
    
    subtotal = Math.round(subtotal * 100) / 100
    
    let discountPercentage = 0
    let discountAmount = 0
    let total = subtotal
    
    if (isSubscribed) {
      discountPercentage = SUBSCRIPTION_DISCOUNT
      discountAmount = Math.round((subtotal * SUBSCRIPTION_DISCOUNT / 100) * 100) / 100
      total = Math.round((subtotal - discountAmount) * 100) / 100
    }
    
    const platformFee = Math.round((total * 0.20) * 100) / 100
    const providerAmount = Math.round((total * 0.80) * 100) / 100

    setPriceEstimate({
      baseFee: BASE_FEE,
      distanceFee: distanceFee,
      distanceRate: ratePerMile,
      heavyItemFee: heavyItemFee,
      waitTimeFee: waitTimeFee,
      peakUrgentFee: peakUrgentFee,
      extraStopsFee: extraStopsFee,
      subtotal: subtotal,
      discountPercentage: discountPercentage,
      discountAmount: discountAmount,
      total: total,
      platformFee: platformFee,
      providerAmount: providerAmount,
    })
  }

  const calculateRealDistance = async () => {
    if (!formData.pickup.address || !formData.dropoff.address) {
      return
    }

    setIsCalculating(true)
    setDistanceError(null)

    try {
      const result = await getDistance(
        formData.pickup.address,
        formData.dropoff.address,
        'DRIVING'
      )

      const distanceInMiles = result.distance.value
      setDistance(distanceInMiles)
      setDistanceText(result.distance.text)
      setDurationText(result.duration.text)
      setIsDistanceCalculated(true)
      calculatePrice(distanceInMiles)
      
      toast.success(`Distance: ${result.distance.text} (approx ${result.duration.text})`)
    } catch (error) {
      setDistanceError(error.message || 'Could not calculate distance. Please check addresses.')
      setDistance(0)
      setDistanceText('')
      setDurationText('')
      setIsDistanceCalculated(false)
    } finally {
      setIsCalculating(false)
    }
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    const filePreviews = files.map(file => URL.createObjectURL(file))
    setPhotos(prev => [...prev, ...filePreviews])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.serviceId) {
      toast.error('Please select a service')
      return
    }
    if (!formData.pickup.address) {
      toast.error('Please select a pickup address')
      return
    }
    if (!formData.dropoff.address) {
      toast.error('Please select a dropoff address')
      return
    }
    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error('Please select date and time')
      return
    }
    if (distance === 0 || !isDistanceCalculated) {
      toast.error('Please calculate distance first')
      return
    }

    try {
      const result = await createErrand({
        ...formData,
        photos: photos,
        distance: distance,
        distanceText: distanceText,
        duration: durationText,
        isSubscribed: isSubscribed,
      }).unwrap()
      
      toast.success('Errand created successfully!')
      navigate(`/customer/errand/${result.errand._id}`)
    } catch (error) {
      console.error('Create errand error:', error)
      toast.error(error.data?.message || 'Failed to create errand')
    }
  }

  const isFormReady = () => {
    return (
      !isLoading &&
      !isCalculating &&
      distance > 0 &&
      isDistanceCalculated &&
      addressesValid.pickup &&
      addressesValid.dropoff &&
      formData.serviceId &&
      formData.pickup.address &&
      formData.dropoff.address &&
      formData.preferredDate &&
      formData.preferredTime
    )
  }

  // ✅ Get unique service types from API for display
  const getServiceIcon = (category) => {
    const icons = {
      'shopping': '🛍️',
      'groceries': '🛒',
      'pharmacy': '💊',
      'retail': '🏪',
      'food_pickup': '🍕',
      'parcel_delivery': '📦',
      'document_delivery': '📄',
      'dry_cleaning': '👔',
      'key_collection': '🔑',
      'bill_payments': '💳',
      'queue_standing': '👥',
      'school_pickup': '🏫',
      'pet_assistance': '🐕',
      'elderly_shopping': '👴',
      'appointment_assistance': '📋',
      'business_deliveries': '🏢',
      'custom': '📌',
    }
    return icons[category] || '📋'
  }

  if (servicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-3xl" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Create New Errand</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Selection - ✅ Dynamic from API */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">What do you need?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {services?.map((service) => {
              const isSelected = formData.serviceId === service._id
              const icon = service.icon || getServiceIcon(service.category)
              return (
                <button
                  key={service._id}
                  type="button"
                  onClick={() => handleServiceSelect(service._id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200
                    ${isSelected 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-gray-200 hover:border-primary/50'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}
                    >
                      <span className="text-lg">{icon}</span>
                    </div>
                    <div>
                      <h3 className={`font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {service.name}
                      </h3>
                      <p className="text-xs text-text-light">{service.description}</p>
                      {service.basePrice && (
                        <p className="text-xs text-primary font-medium mt-1">
                          From £{service.basePrice}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Pickup Location */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Pickup Location</h2>
          <div className="space-y-4">
            <AddressAutocomplete
              label="Full Address *"
              placeholder="Start typing your pickup address..."
              value={formData.pickup.address}
              onSelect={(suggestion) => handleAddressSelect('pickup', suggestion)}
              onChange={(e) => handleAddressChange('pickup', e)}
              required
              country="gb"
              minChars={2}
            />
            
            {addressesValid.pickup && (
              <div className="flex items-center text-green-600 text-sm">
                <FaCheckCircle className="mr-2" />
                <span>Address verified in UK</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Special Instructions
                </label>
                <input
                  type="text"
                  name="pickup.instructions"
                  value={formData.pickup.instructions}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      pickup: { ...prev.pickup, instructions: e.target.value }
                    }))
                  }}
                  className="input-field"
                  placeholder="e.g., Ring doorbell, leave with reception..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dropoff Location */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Dropoff Location</h2>
            <button
              type="button"
              onClick={() => {
                setHasDropoff(!hasDropoff)
                if (!hasDropoff) {
                  setFormData(prev => ({
                    ...prev,
                    dropoff: { ...prev.dropoff, address: '' }
                  }))
                  setAddressesValid(prev => ({ ...prev, dropoff: false }))
                  setIsDistanceCalculated(false)
                  setDistance(0)
                }
              }}
              className="text-primary hover:underline text-sm"
            >
              {hasDropoff ? 'Remove dropoff' : 'Add dropoff'}
            </button>
          </div>

          {hasDropoff && (
            <div className="space-y-4">
              <AddressAutocomplete
                label="Destination Address *"
                placeholder="Start typing your dropoff address..."
                value={formData.dropoff.address}
                onSelect={(suggestion) => handleAddressSelect('dropoff', suggestion)}
                onChange={(e) => handleAddressChange('dropoff', e)}
                required
                country="gb"
                minChars={2}
              />
              
              {addressesValid.dropoff && (
                <div className="flex items-center text-green-600 text-sm">
                  <FaCheckCircle className="mr-2" />
                  <span>Address verified in UK</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    name="dropoff.instructions"
                    value={formData.dropoff.instructions}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        dropoff: { ...prev.dropoff, instructions: e.target.value }
                      }))
                    }}
                    className="input-field"
                    placeholder="e.g., Leave at door, specific instructions..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Date *
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                  className="input-field pl-10"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Time *
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="card">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-text">Additional Options</h2>
            <span className="text-primary text-sm">
              {showAdvancedOptions ? 'Hide' : 'Show'} options
            </span>
          </button>

          {showAdvancedOptions && (
            <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isHeavyItem}
                  onChange={(e) => setFormData(prev => ({ ...prev, isHeavyItem: e.target.checked }))}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <div>
                  <span className="text-sm text-text-light">Heavy Item (over 5kg/large)</span>
                  <p className="text-xs text-text-lighter">+£{HEAVY_ITEM_FEE.toFixed(2)}</p>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isPeakUrgent}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPeakUrgent: e.target.checked }))}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <div>
                  <span className="text-sm text-text-light">Peak/Urgent</span>
                  <p className="text-xs text-text-lighter">+£{PEAK_URGENT_FEE.toFixed(2)}</p>
                </div>
              </label>

              <div>
                <label className="flex items-center space-x-3">
                  <span className="text-sm text-text-light">Extra Stops</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.extraStopsCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, extraStopsCount: parseInt(e.target.value) || 0 }))}
                    className="w-20 px-3 py-1 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <span className="text-xs text-text-lighter">× £{EXTRA_STOP_FEE.toFixed(2)} each</span>
                </label>
              </div>

              <div>
                <label className="flex items-center space-x-3">
                  <span className="text-sm text-text-light">Expected Wait Time</span>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.waitTimeMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, waitTimeMinutes: parseInt(e.target.value) || 0 }))}
                    className="w-20 px-3 py-1 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                  <span className="text-xs text-text-lighter">minutes (first 5 free, then £{WAIT_TIME_FEE_PER_MIN.toFixed(2)}/min)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Price Estimate */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Price Estimate</h2>
          
          <div className="space-y-4">
            {isCalculating ? (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin text-primary text-3xl mx-auto mb-3" />
                <p className="text-text-light">Calculating distance...</p>
              </div>
            ) : distanceError ? (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-start space-x-3">
                  <FaExclamationTriangle className="text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Distance Calculation Failed</p>
                    <p className="text-red-600 text-sm">{distanceError}</p>
                  </div>
                </div>
              </div>
            ) : distance > 0 && isDistanceCalculated ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center space-x-2">
                      <FaRuler className="text-primary" />
                      <span className="text-sm text-text-light">Distance</span>
                    </div>
                    <span className="text-lg font-bold text-text">{distanceText}</span>
                    <p className="text-xs text-text-lighter">Rate: £{priceEstimate.distanceRate.toFixed(2)}/mile</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center space-x-2">
                      <FaClockIcon className="text-primary" />
                      <span className="text-sm text-text-light">Travel Time</span>
                    </div>
                    <span className="text-lg font-bold text-text">{durationText}</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-light">Base Fee</span>
                    <span className="font-medium">£{priceEstimate.baseFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Distance Fee ({distance.toFixed(1)} miles × £{priceEstimate.distanceRate.toFixed(2)})</span>
                    <span className="font-medium">£{priceEstimate.distanceFee.toFixed(2)}</span>
                  </div>
                  
                  {formData.isHeavyItem && (
                    <div className="flex justify-between text-orange-600">
                      <span>Heavy Item Fee</span>
                      <span>+£{priceEstimate.heavyItemFee.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.waitTimeMinutes > 5 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Wait Time ({formData.waitTimeMinutes - 5} extra mins)</span>
                      <span>+£{priceEstimate.waitTimeFee.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.isPeakUrgent && (
                    <div className="flex justify-between text-orange-600">
                      <span>Peak/Urgent Fee</span>
                      <span>+£{priceEstimate.peakUrgentFee.toFixed(2)}</span>
                    </div>
                  )}
                  {formData.extraStopsCount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Extra Stops ({formData.extraStopsCount})</span>
                      <span>+£{priceEstimate.extraStopsFee.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-text">Subtotal</span>
                    <span className="font-semibold text-text">£{priceEstimate.subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {isSubscribed && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-green-700">🎉 Subscription Discount</span>
                        <p className="text-xs text-green-600">20% off</p>
                      </div>
                      <span className="font-bold text-green-700">-£{priceEstimate.discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-text">Total</span>
                    <span className="text-2xl font-bold text-primary">£{priceEstimate.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-text mb-2 flex items-center">
                    <FaDollarSign className="mr-2 text-blue-600" />
                    How It's Split
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-light">GEOBUY Fee (20%)</span>
                      <span className="font-medium text-blue-600">£{priceEstimate.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Provider Amount (80%)</span>
                      <span className="font-medium text-primary">£{priceEstimate.providerAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-text-light">
                <p>Select both pickup and dropoff addresses</p>
                <p className="text-xs text-text-lighter mt-2">
                  Distance will be calculated automatically
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Task Details & Photos */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Additional Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Task Details
              </label>
              <textarea
                name="taskDetails"
                value={formData.taskDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, taskDetails: e.target.value }))}
                rows="3"
                className="input-field resize-none"
                placeholder="Describe your errand in detail..."
                maxLength="500"
              />
              <p className="text-xs text-text-lighter mt-1">
                {formData.taskDetails.length}/500 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Photos (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer btn-outline text-sm py-2">
                  <FaCamera className="inline mr-2" />
                  Upload Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-text-light">
                  {photos.length} photos uploaded
                </span>
              </div>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="requiresLiveTracking"
                checked={formData.requiresLiveTracking}
                onChange={(e) => setFormData(prev => ({ ...prev, requiresLiveTracking: e.target.checked }))}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">Enable live tracking</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormReady()}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span>{isLoading ? 'Creating...' : 'Create Errand'}</span>
          <FaArrowRight />
        </button>
      </form>
    </div>
  )
}

export default CreateBooking