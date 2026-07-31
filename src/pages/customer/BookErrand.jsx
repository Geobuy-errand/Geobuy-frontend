import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useCreateErrandMutation } from '../../redux/services/errandApi'
import { toast } from 'react-hot-toast'
import { 
  FaMapMarkerAlt, 
  FaCalendar, 
  FaClock, 
  FaDollarSign, 
  FaInfoCircle,
  FaBox,
  FaFileAlt,
  FaPills,
  FaTshirt,
  FaUsers,
  FaShoppingBag,
  FaArrowRight,
  FaCalculator,
  FaCheck
} from 'react-icons/fa'

const BookErrand = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [createErrand, { isLoading }] = useCreateErrandMutation()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    serviceType: '',
    pickup: {
      address: '',
      street: '',
      town: '',
      postcode: '',
      instructions: '',
    },
    dropoff: {
      address: '',
      street: '',
      town: '',
      postcode: '',
      instructions: '',
    },
    taskDetails: '',
    preferredDate: '',
    preferredTime: '',
    requiresLiveTracking: false,
    estimatedPrice: {
      baseFee: 0,
      distanceFee: 0,
      total: 0,
    },
    priceBreakdown: {
      platformFee: 0,
      providerAmount: 0,
    },
  })

  const [hasDropoff, setHasDropoff] = useState(false)
  const [distance, setDistance] = useState(0)

  const serviceTypes = [
    { id: 'parcel_delivery', label: 'Parcel Delivery', icon: FaBox, basePrice: 8 },
    { id: 'document_delivery', label: 'Document Delivery', icon: FaFileAlt, basePrice: 10 },
    { id: 'prescription_pickup', label: 'Prescription Pickup', icon: FaPills, basePrice: 12 },
    { id: 'dry_cleaning_pickup', label: 'Dry Cleaning Pickup', icon: FaTshirt, basePrice: 8 },
    { id: 'queue_waiting', label: 'Queue Waiting Service', icon: FaUsers, basePrice: 15 },
    { id: 'shopping', label: 'Shopping', icon: FaShoppingBag, basePrice: 10 },
    { id: 'custom', label: 'Custom Errand', icon: FaInfoCircle, basePrice: 0 },
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }
  }

  const handleServiceSelect = (serviceId) => {
    const service = serviceTypes.find(s => s.id === serviceId)
    setFormData(prev => ({
      ...prev,
      serviceType: serviceId,
      estimatedPrice: {
        ...prev.estimatedPrice,
        baseFee: service?.basePrice || 0,
        total: service?.basePrice || 0,
      },
      priceBreakdown: {
        platformFee: Math.round((service?.basePrice || 0) * 0.1 * 100) / 100,
        providerAmount: Math.round((service?.basePrice || 0) * 0.9 * 100) / 100,
      },
    }))
    setStep(2)
  }

  const calculatePrice = () => {
    // Simulate distance calculation (in real app, use Google Maps API)
    const baseFee = formData.estimatedPrice.baseFee || 0
    const distanceFee = distance * 0.5 // £0.50 per km
    const total = baseFee + distanceFee
    
    setFormData(prev => ({
      ...prev,
      estimatedPrice: {
        ...prev.estimatedPrice,
        distanceFee: Math.round(distanceFee * 100) / 100,
        total: Math.round(total * 100) / 100,
      },
      priceBreakdown: {
        platformFee: Math.round(total * 0.1 * 100) / 100,
        providerAmount: Math.round(total * 0.9 * 100) / 100,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.pickup.address) {
      toast.error('Please enter pickup address')
      return
    }
    if (!formData.preferredDate || !formData.preferredTime) {
      toast.error('Please select date and time')
      return
    }

    try {
      const result = await createErrand(formData).unwrap()
      toast.success('Errand created successfully!')
      navigate(`/customer/errand/${result.errand._id}`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create errand')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text">Book an Errand</h1>
            <p className="text-text-light mt-2">
              Get your tasks done quickly by trusted local providers
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {[1, 2, 3, 4].map((num) => (
              <React.Fragment key={num}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm
                  ${step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${step > num ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">What do you need help with?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceTypes.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary transition-all duration-200 text-left group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <service.icon className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-text">{service.label}</h3>
                        <p className="text-sm text-text-light">
                          From £{service.basePrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Location & Details */}
          {step === 2 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Where and when?</h2>
              <form className="space-y-4">
                {/* Pickup Location */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Pickup Address *
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                    <input
                      type="text"
                      name="pickup.address"
                      value={formData.pickup.address}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Enter pickup address"
                      required
                    />
                  </div>
                </div>

                {/* Dropoff Toggle */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={hasDropoff}
                      onChange={(e) => setHasDropoff(e.target.checked)}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-text-light">Add dropoff location</span>
                  </label>
                </div>

                {hasDropoff && (
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Dropoff Address
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                      <input
                        type="text"
                        name="dropoff.address"
                        value={formData.dropoff.address}
                        onChange={handleChange}
                        className="input-field pl-10"
                        placeholder="Enter dropoff address"
                      />
                    </div>
                  </div>
                )}

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
                        onChange={handleChange}
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
                        onChange={handleChange}
                        className="input-field pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Task Details
                  </label>
                  <textarea
                    name="taskDetails"
                    value={formData.taskDetails}
                    onChange={handleChange}
                    rows="3"
                    className="input-field resize-none"
                    placeholder="Describe your errand in detail..."
                    maxLength="500"
                  />
                  <p className="text-xs text-text-lighter mt-1">
                    {formData.taskDetails.length}/500 characters
                  </p>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      calculatePrice()
                      setStep(3)
                    }}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <FaArrowRight />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Price Estimate */}
          {step === 3 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Price Estimate</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-light">Base Fee</span>
                    <span className="font-medium">£{formData.estimatedPrice.baseFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-light">Distance Fee</span>
                    <span className="font-medium">£{formData.estimatedPrice.distanceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-text">Total</span>
                    <span className="text-xl font-bold text-primary">£{formData.estimatedPrice.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-xl p-4">
                  <h4 className="font-semibold text-text mb-2 flex items-center">
                    <FaInfoCircle className="mr-2 text-primary" />
                    Price Breakdown
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-light">Platform Fee (10%)</span>
                      <span className="font-medium">£{formData.priceBreakdown.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">Provider Amount</span>
                      <span className="font-medium text-primary">£{formData.priceBreakdown.providerAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-text-lighter mt-2">
                      * You pay the platform fee now. Provider amount is paid directly to the provider.
                    </p>
                  </div>
                </div>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="requiresLiveTracking"
                    checked={formData.requiresLiveTracking}
                    onChange={handleChange}
                    className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm text-text-light">Enable live tracking</span>
                </label>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-outline"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <span>Confirm & Book</span>
                    <FaCheck />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirm & Book */}
          {step === 4 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Confirm Booking</h2>
              
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center space-x-2 text-green-700">
                    <FaCheck />
                    <span className="font-medium">Almost there!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Your errand will be sent to nearby providers. You'll be notified when someone accepts.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-light">Service</span>
                    <span className="font-medium capitalize">
                      {serviceTypes.find(s => s.id === formData.serviceType)?.label || formData.serviceType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Pickup</span>
                    <span className="font-medium text-sm text-right">{formData.pickup.address}</span>
                  </div>
                  {hasDropoff && (
                    <div className="flex justify-between">
                      <span className="text-text-light">Dropoff</span>
                      <span className="font-medium text-sm text-right">{formData.dropoff.address}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-light">Date & Time</span>
                    <span className="font-medium">
                      {new Date(formData.preferredDate).toLocaleDateString()} at {formData.preferredTime}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-text">Total</span>
                    <span className="text-xl font-bold text-primary">£{formData.estimatedPrice.total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <span>{isLoading ? 'Booking...' : 'Confirm & Book'}</span>
                  <FaArrowRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookErrand