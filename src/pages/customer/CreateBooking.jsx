import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useCreateErrandMutation } from '../../redux/services/errandApi'
import { getDistance } from '../../services/distanceService'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import { toast } from 'react-hot-toast'
import { 
  FaCalendar, 
  FaClock, 
  FaCamera, 
  FaBox,
  FaFileAlt,
  FaPills,
  FaTshirt,
  FaUsers,
  FaShoppingBag,
  FaInfoCircle,
  FaArrowRight,
  FaRuler,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa'

const CreateBooking = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [createErrand, { isLoading }] = useCreateErrandMutation()

  // Pricing constants
  const BASE_FEE = 3.50
  const DISTANCE_FEE_PER_MILE = 1.60
  const SUBSCRIPTION_DISCOUNT = 20 // 20%

  const [formData, setFormData] = useState({
    serviceType: '',
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
    subtotal: 0,
    discountPercentage: 0,
    discountAmount: 0,
    total: 0,
  })
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isDistanceCalculated, setIsDistanceCalculated] = useState(false)

  const serviceTypes = [
    { id: 'parcel_delivery', label: 'Parcel Delivery', icon: FaBox, description: 'Pick up and deliver parcels' },
    { id: 'document_delivery', label: 'Document Delivery', icon: FaFileAlt, description: 'Secure document handling' },
    { id: 'prescription_pickup', label: 'Prescription Pickup', icon: FaPills, description: 'Collect prescriptions' },
    { id: 'dry_cleaning_pickup', label: 'Dry Cleaning Pickup', icon: FaTshirt, description: 'Pick up dry cleaning' },
    { id: 'queue_waiting', label: 'Queue Waiting', icon: FaUsers, description: 'Wait in line on your behalf' },
    { id: 'shopping', label: 'Shopping', icon: FaShoppingBag, description: 'Grocery, pharmacy, retail' },
    { id: 'custom', label: 'Custom Errand', icon: FaInfoCircle, description: 'Any other errand' },
  ]

  // Check if user is subscribed
  useEffect(() => {
    if (user?.subscription?.isSubscribed) {
      setIsSubscribed(true)
    }
  }, [user])

  // Log state changes for debugging
  useEffect(() => {
    console.log('🔍 Addresses Valid:', addressesValid)
    console.log('🔍 Distance:', distance)
    console.log('🔍 Is Distance Calculated:', isDistanceCalculated)
    console.log('🔍 Has Dropoff:', hasDropoff)
    console.log('🔍 Pickup Address:', formData.pickup.address)
    console.log('🔍 Dropoff Address:', formData.dropoff.address)
  }, [addressesValid, distance, isDistanceCalculated, hasDropoff, formData.pickup.address, formData.dropoff.address])

  // Auto-calculate distance when addresses are selected and valid
  useEffect(() => {
    console.log('🔄 Auto-calc effect triggered:', {
      pickupValid: addressesValid.pickup,
      dropoffValid: addressesValid.dropoff,
      hasDropoff: hasDropoff,
      pickupAddress: formData.pickup.address,
      dropoffAddress: formData.dropoff.address,
    })

    if (addressesValid.pickup && addressesValid.dropoff && hasDropoff && formData.pickup.address && formData.dropoff.address) {
      console.log('✅ Both addresses valid, calculating distance...')
      const timer = setTimeout(() => {
        calculateRealDistance()
      }, 500)

      return () => clearTimeout(timer)
    } else {
      console.log('❌ Conditions not met for auto-calc')
    }
  }, [addressesValid.pickup, addressesValid.dropoff, hasDropoff, formData.pickup.address, formData.dropoff.address])

  const handleAddressSelect = (type, suggestion) => {
    console.log('📍 Address selected:', type, suggestion)
    
    const addressField = type === 'pickup' ? 'pickup' : 'dropoff'
    
    // Extract address components
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

    // Mark address as valid
    setAddressesValid(prev => ({
      ...prev,
      [type]: true,
    }))

    // Reset distance when address changes
    setIsDistanceCalculated(false)
    setDistance(0)
    setDistanceText('')
    setDurationText('')
    setDistanceError(null)

    // If both addresses are now valid, calculate distance
    if (type === 'pickup' && formData.dropoff.address) {
      console.log('🔄 Pickup selected, dropoff exists, calculating...')
      setTimeout(() => calculateRealDistance(), 100)
    } else if (type === 'dropoff' && formData.pickup.address) {
      console.log('🔄 Dropoff selected, pickup exists, calculating...')
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

    // Reset validity when user types manually
    setAddressesValid(prev => ({
      ...prev,
      [type]: false,
    }))
    
    // Reset distance
    setIsDistanceCalculated(false)
    setDistance(0)
    setDistanceText('')
    setDurationText('')
    setDistanceError(null)
  }

  const handleServiceSelect = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      serviceType: serviceId,
    }))
  }

  const calculatePrice = (dist) => {
    const distanceInMiles = dist || distance || 0
    
    if (distanceInMiles === 0) {
      setPriceEstimate({
        baseFee: BASE_FEE,
        distanceFee: 0,
        subtotal: 0,
        discountPercentage: 0,
        discountAmount: 0,
        total: 0,
      })
      return
    }
    
    // Calculate pricing
    const distanceFee = distanceInMiles * DISTANCE_FEE_PER_MILE
    const subtotal = distanceFee + BASE_FEE
    
    let discountPercentage = 0
    let discountAmount = 0
    let total = subtotal

    if (isSubscribed) {
      discountPercentage = SUBSCRIPTION_DISCOUNT
      discountAmount = Math.round(subtotal * (SUBSCRIPTION_DISCOUNT / 100) * 100) / 100
      total = Math.round((subtotal - discountAmount) * 100) / 100
    }

    setPriceEstimate({
      baseFee: BASE_FEE,
      distanceFee: Math.round(distanceFee * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      discountPercentage,
      discountAmount: Math.round(discountAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
    })
  }

  const calculateRealDistance = async () => {
    console.log('🚗 Calculating real distance...')
    
    if (!formData.pickup.address || !formData.dropoff.address) {
      console.log('❌ Missing addresses:', {
        pickup: formData.pickup.address,
        dropoff: formData.dropoff.address,
      })
      return
    }

    setIsCalculating(true)
    setDistanceError(null)

    try {
      console.log('📡 Calling getDistance with:', {
        pickup: formData.pickup.address,
        dropoff: formData.dropoff.address,
      })
      
      const result = await getDistance(
        formData.pickup.address,
        formData.dropoff.address,
        'DRIVING'
      )

      console.log('✅ Distance result:', result)

      const distanceInMiles = result.distance.value
      setDistance(distanceInMiles)
      setDistanceText(result.distance.text)
      setDurationText(result.duration.text)
      setIsDistanceCalculated(true)
      calculatePrice(distanceInMiles)
      
      toast.success(`Distance: ${result.distance.text} (approx ${result.duration.text})`)
    } catch (error) {
      console.error('❌ Distance calculation error:', error)
      setDistanceError(error.message || 'Could not calculate distance. Please check addresses.')
      setDistance(0)
      setDistanceText('')
      setDurationText('')
      setIsDistanceCalculated(false)
      toast.error('Could not calculate distance. Please check both addresses are valid UK addresses.')
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
    
    console.log('📝 Submitting form:', formData)
    
    // Validate required fields
    if (!formData.serviceType) {
      toast.error('Please select a service type')
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
        estimatedPrice: {
          baseFee: priceEstimate.baseFee,
          distanceFee: priceEstimate.distanceFee,
          subtotal: priceEstimate.subtotal,
          discountPercentage: priceEstimate.discountPercentage,
          discountAmount: priceEstimate.discountAmount,
          total: priceEstimate.total,
        },
        isSubscribed: isSubscribed,
      }).unwrap()
      
      toast.success('Errand created successfully!')
      navigate(`/customer/errand/${result.errand._id}`)
    } catch (error) {
      console.error('❌ Create errand error:', error)
      toast.error(error.data?.message || 'Failed to create errand')
    }
  }

  // Check if form is ready for submission
  const isFormReady = () => {
    return (
      !isLoading &&
      !isCalculating &&
      distance > 0 &&
      isDistanceCalculated &&
      addressesValid.pickup &&
      addressesValid.dropoff &&
      formData.serviceType &&
      formData.pickup.address &&
      formData.dropoff.address &&
      formData.preferredDate &&
      formData.preferredTime
    )
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Create New Errand</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">What do you need?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {serviceTypes.map((service) => {
              const Icon = service.icon
              const isSelected = formData.serviceType === service.id
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleServiceSelect(service.id)}
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
                      <Icon className="text-lg" />
                    </div>
                    <div>
                      <h3 className={`font-medium ${isSelected ? 'text-primary' : 'text-text'}`}>
                        {service.label}
                      </h3>
                      <p className="text-xs text-text-light">{service.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Pickup Location with Autocomplete */}
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

        {/* Dropoff Location with Autocomplete */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Dropoff Location</h2>
            <button
              type="button"
              onClick={() => {
                setHasDropoff(!hasDropoff)
                if (!hasDropoff) {
                  // Reset dropoff when removing
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

        {/* Date & Time */}
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

        {/* Price Estimate */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Price Estimate</h2>
          
          <div className="space-y-4">
            {isCalculating ? (
              <div className="text-center py-8">
                <FaSpinner className="animate-spin text-primary text-3xl mx-auto mb-3" />
                <p className="text-text-light">Calculating distance...</p>
                <p className="text-xs text-text-lighter mt-1">Using OpenStreetMap routing</p>
              </div>
            ) : distanceError ? (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-start space-x-3">
                  <FaExclamationTriangle className="text-red-600 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Distance Calculation Failed</p>
                    <p className="text-red-600 text-sm">{distanceError}</p>
                    <p className="text-xs text-red-500 mt-1">
                      Tip: Please select addresses from the dropdown suggestions for best results.
                    </p>
                  </div>
                </div>
              </div>
            ) : distance > 0 && isDistanceCalculated ? (
              <>
                {/* Distance Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center space-x-2">
                      <FaRuler className="text-primary" />
                      <span className="text-sm text-text-light">Distance</span>
                    </div>
                    <span className="text-lg font-bold text-text">{distanceText || `${distance.toFixed(1)} miles`}</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-primary" />
                      <span className="text-sm text-text-light">Travel Time</span>
                    </div>
                    <span className="text-lg font-bold text-text">{durationText || 'Calculating...'}</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-light">Base Fee</span>
                    <span className="font-medium">£{priceEstimate.baseFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Distance Fee ({distance.toFixed(1)} × £{DISTANCE_FEE_PER_MILE.toFixed(2)})</span>
                    <span className="font-medium">£{priceEstimate.distanceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium text-text">Subtotal</span>
                    <span className="font-semibold text-text">£{priceEstimate.subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Subscription Discount */}
                {isSubscribed && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-green-700">🎉 Subscription Discount</span>
                        <p className="text-xs text-green-600">20% off total charges</p>
                      </div>
                      <span className="font-bold text-green-700">-£{priceEstimate.discountAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-text">Total</span>
                    <span className="text-2xl font-bold text-primary">£{priceEstimate.total.toFixed(2)}</span>
                  </div>
                  {isSubscribed && (
                    <p className="text-xs text-text-lighter mt-1">
                      * You saved £{priceEstimate.discountAmount.toFixed(2)} with your subscription
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-text mb-2 flex items-center">
                    <FaInfoCircle className="mr-2 text-blue-600" />
                    Price Breakdown
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-light">GEOBUY Platform Fee (10%)</span>
                      <span className="font-medium">£{(priceEstimate.total * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Provider Amount</span>
                      <span className="font-medium text-primary">£{(priceEstimate.total * 0.9).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-text-lighter mt-2">
                      * Platform fee is charged by GEOBUY. Provider amount goes directly to the provider.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-text-light">
                <p>Select both pickup and dropoff addresses from the suggestions</p>
                <p className="text-xs text-text-lighter mt-2">
                  Distance will be calculated automatically when both addresses are selected
                </p>
                {addressesValid.pickup && !addressesValid.dropoff && (
                  <p className="text-xs text-amber-600 mt-2">Waiting for dropoff address...</p>
                )}
                {!addressesValid.pickup && addressesValid.dropoff && (
                  <p className="text-xs text-amber-600 mt-2">Waiting for pickup address...</p>
                )}
                {addressesValid.pickup && addressesValid.dropoff && !isDistanceCalculated && (
                  <p className="text-xs text-amber-600 mt-2">Calculating distance... Please wait.</p>
                )}
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

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-text-lighter p-2 bg-gray-100 rounded">
            <p>Debug: Distance={distance}, Calculated={String(isDistanceCalculated)}, Ready={String(isFormReady())}</p>
            <p>Pickup: {addressesValid.pickup ? '✅' : '❌'} {formData.pickup.address?.substring(0, 30)}</p>
            <p>Dropoff: {addressesValid.dropoff ? '✅' : '❌'} {formData.dropoff.address?.substring(0, 30)}</p>
          </div>
        )}
      </form>
    </div>
  )
}

export default CreateBooking