import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  useCreateConnectionMutation,
  useCreateCheckoutSessionMutation,  // ✅ Use this instead of usePayConnectionFeeMutation
  useCheckPaymentStatusQuery,
} from '../../redux/services/connectionApi'
import { toast } from 'react-hot-toast'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar, 
  FaClock, FaTag, FaSpinner, FaCheckCircle, FaArrowRight,
  FaCreditCard, FaLink, FaLock, FaCheck, FaInfoCircle
} from 'react-icons/fa'

const Connect = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  
  // ✅ Use the correct hook names - no usePayConnectionFeeMutation
  const { data: paymentStatus, refetch: refetchPaymentStatus } = useCheckPaymentStatusQuery()
  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation()
  const [createConnection, { isLoading: isCreating }] = useCreateConnectionMutation()
  
  const [hasPaid, setHasPaid] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    location: {
      address: user?.address?.street ? `${user.address.street}, ${user.address.town}, ${user.address.postcode}` : '',
      town: user?.address?.town || '',
      postcode: user?.address?.postcode || '',
      coordinates: null,
    },
    purpose: '',
    customPurpose: '',
    interests: [],
    availability: {
      preferredDays: [],
      preferredTimeSlot: 'anytime',
    },
    message: '',
    meetingType: 'virtual',
    connectionDate: '',
    connectionTime: '',
  })

  const purposeOptions = [
    { value: 'professional_networking', label: '🤝 Professional Networking' },
    { value: 'mentorship', label: '🎓 Mentorship' },
    { value: 'collaboration', label: '🤲 Collaboration' },
    { value: 'business_partnership', label: '💼 Business Partnership' },
    { value: 'social_networking', label: '👋 Social Networking' },
    { value: 'job_referral', label: '💼 Job Referral' },
    { value: 'skill_sharing', label: '🔄 Skill Sharing' },
    { value: 'community_engagement', label: '🏘️ Community Engagement' },
    { value: 'other', label: '📋 Other' },
  ]

  const interestOptions = [
    'technology', 'business', 'healthcare', 'education', 'arts',
    'finance', 'legal', 'real_estate', 'hospitality', 'retail',
    'manufacturing', 'non_profit', 'government', 'other'
  ]

  const dayOptions = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const timeSlotOptions = ['morning', 'afternoon', 'evening', 'anytime']
  const meetingTypeOptions = ['virtual', 'in_person', 'phone']

  // Update hasPaid when payment status changes
  useEffect(() => {
    if (paymentStatus?.hasPaid) {
      setHasPaid(true)
    }
  }, [paymentStatus])

  // Handle redirect from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentSuccess = urlParams.get('payment')
    const sessionId = urlParams.get('session_id')

    if (paymentSuccess === 'success' && sessionId) {
      verifyPayment(sessionId)
    }

    if (paymentSuccess === 'cancelled') {
      toast.info('Payment was cancelled. You can try again.')
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/connections/verify-payment?session_id=${sessionId}`, {
        credentials: 'include',
      })
      const data = await response.json()
      
      if (data.message === 'Payment verified successfully') {
        toast.success('Payment successful! You can now create connections.')
        setHasPaid(true)
        refetchPaymentStatus()
        window.history.replaceState({}, document.title, window.location.pathname)
      } else {
        toast.error('Payment verification failed. Please contact support.')
      }
    } catch (error) {
      toast.error('Failed to verify payment. Please contact support.')
    }
  }

  const handlePayWithStripe = async () => {
    setIsProcessingPayment(true)
    try {
      const result = await createCheckoutSession().unwrap()
      // Redirect to Stripe checkout page
      window.location.href = result.sessionUrl
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create payment session')
      setIsProcessingPayment(false)
    }
  }

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
    } else if (type === 'checkbox') {
      if (name === 'interests') {
        setFormData(prev => ({
          ...prev,
          interests: checked 
            ? [...prev.interests, value]
            : prev.interests.filter(i => i !== value)
        }))
      } else if (name === 'preferredDays') {
        setFormData(prev => ({
          ...prev,
          availability: {
            ...prev.availability,
            preferredDays: checked
              ? [...prev.availability.preferredDays, value]
              : prev.availability.preferredDays.filter(d => d !== value)
          }
        }))
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleLocationSelect = (suggestion) => {
    const addressParts = suggestion.displayName?.split(',') || []
    setFormData(prev => ({
      ...prev,
      location: {
        address: suggestion.displayName || '',
        town: addressParts[1]?.trim() || '',
        postcode: suggestion.postcode || '',
        coordinates: {
          lat: suggestion.lat,
          lng: suggestion.lon,
        },
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user has paid
    if (!hasPaid) {
      setShowPaymentModal(true)
      return
    }

    // Validate form
    if (!formData.purpose) {
      toast.error('Please select a purpose')
      return
    }
    if (formData.purpose === 'other' && !formData.customPurpose) {
      toast.error('Please specify your purpose')
      return
    }
    if (!formData.location.address) {
      toast.error('Please enter your location')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createConnection(formData).unwrap()
      toast.success('Connection created successfully! 🎉')
      navigate('/customer/connections')
    } catch (error) {
      if (error.data?.requiresPayment) {
        setShowPaymentModal(true)
        toast.error('Please pay the connection fee first')
      } else {
        toast.error(error.data?.message || 'Failed to create connection')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const CONNECTION_FEE = 1.99

  // If user is not logged in, redirect
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">Connect with Others</h1>
          <p className="text-text-light text-sm">
            {hasPaid ? (
              <span className="text-green-600 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                You have paid the connection fee. Create unlimited connections!
              </span>
            ) : (
              <span>Pay a one-time fee of £{CONNECTION_FEE} to connect with people in your area</span>
            )}
          </p>
        </div>

        {/* Payment Status Banner */}
        {!hasPaid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaLock className="text-yellow-600 text-xl" />
              <div>
                <p className="font-medium text-yellow-800">One-time Payment Required</p>
                <p className="text-sm text-yellow-700">
                  Pay £{CONNECTION_FEE} once to unlock unlimited connections
                </p>
              </div>
            </div>
            <button
              onClick={handlePayWithStripe}
              disabled={isCreatingSession || isProcessingPayment}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isCreatingSession || isProcessingPayment ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCreditCard />
              )}
              <span>{isCreatingSession || isProcessingPayment ? 'Processing...' : 'Pay Now'}</span>
            </button>
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info - Auto-populated */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-text-light mb-2 flex items-center">
                <FaInfoCircle className="mr-2 text-primary" />
                Your details are auto-filled from your profile
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input-field pl-10 bg-white"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10 bg-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="input-field pl-10 bg-white"
                      placeholder="07700 900000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Meeting Type
                  </label>
                  <select
                    name="meetingType"
                    value={formData.meetingType}
                    onChange={handleChange}
                    className="input-field bg-white"
                  >
                    {meetingTypeOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Location *
              </label>
              <AddressAutocomplete
                label=""
                placeholder="Enter your location..."
                value={formData.location.address}
                onSelect={handleLocationSelect}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    location: {
                      ...prev.location,
                      address: e.target.value,
                    },
                  }))
                }}
                country="gb"
                minChars={2}
              />
              <p className="text-xs text-text-lighter mt-1">
                We'll connect you with people in your area
              </p>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Purpose of Connection *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select a purpose...</option>
                {purposeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.purpose === 'other' && (
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Custom Purpose *
                </label>
                <input
                  type="text"
                  name="customPurpose"
                  value={formData.customPurpose}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Please specify your purpose..."
                  required
                />
              </div>
            )}

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                Interests (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(interest => (
                  <label
                    key={interest}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      formData.interests.includes(interest)
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-text-light hover:bg-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="interests"
                      value={interest}
                      checked={formData.interests.includes(interest)}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {interest.replace('_', ' ').toUpperCase()}
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">
                  Preferred Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map(day => (
                    <label
                      key={day}
                      className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                        formData.availability.preferredDays.includes(day)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-text-light hover:bg-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="preferredDays"
                        value={day}
                        checked={formData.availability.preferredDays.includes(day)}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {day.slice(0, 3)}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Preferred Time
                </label>
                <select
                  name="preferredTimeSlot"
                  value={formData.availability.preferredTimeSlot}
                  onChange={handleChange}
                  className="input-field"
                >
                  {timeSlotOptions.map(slot => (
                    <option key={slot} value={slot}>
                      {slot.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Preferred Date
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="date"
                    name="connectionDate"
                    value={formData.connectionDate}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Preferred Time
                </label>
                <div className="relative">
                  <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="time"
                    name="connectionTime"
                    value={formData.connectionTime}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="3"
                className="input-field resize-none"
                placeholder="Tell us more about what you're looking for..."
              />
            </div>

            {hasPaid && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex items-center">
                <FaCheckCircle className="text-green-500 text-xl mr-3" />
                <div>
                  <p className="font-medium text-green-700">Fee Already Paid</p>
                  <p className="text-sm text-green-600">You can create unlimited connections</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (!hasPaid && !showPaymentModal)}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaLink />
              )}
              <span>
                {isSubmitting 
                  ? 'Creating...' 
                  : hasPaid 
                    ? 'Create Connection' 
                    : 'Pay Fee & Create Connection'
                }
              </span>
            </button>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 card bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FaInfoCircle className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-text">How it works</h4>
              <p className="text-sm text-text-light mt-1">
                1. Pay the one-time fee of £{CONNECTION_FEE}<br />
                2. Fill in your details and purpose<br />
                3. Your connection request will be reviewed<br />
                4. Start connecting with people in your area!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Connect