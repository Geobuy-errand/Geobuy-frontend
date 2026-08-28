import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  useCreateConnectionMutation,
  useCreateCheckoutSessionMutation,
  useCheckPaymentStatusQuery,
  useGetConnectionStatusQuery,
  useGetConnectionFeeQuery,
} from '../../redux/services/connectionApi'
import { toast } from 'react-hot-toast'
import UKStatesDropdown from '../../components/utils/UKStatesDropdown'
import { 
  FaUser, FaEnvelope, FaPhone, 
  FaClock, FaSpinner, FaCheckCircle,
  FaCreditCard, FaLock, FaInfoCircle,
  FaHeart, FaStar,
  FaCalendar
} from 'react-icons/fa'

const Connect = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  
  // ✅ Check if user already connected
  const { data: statusData, isLoading: statusLoading } = useGetConnectionStatusQuery()
  const { data: paymentStatus, refetch: refetchPaymentStatus } = useCheckPaymentStatusQuery()
  const { data: connectionFee, refetch: refetchConnectionnFee } = useGetConnectionFeeQuery()
  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation()
  const [createConnection, { isLoading: isCreating }] = useCreateConnectionMutation()
  
  const [hasPaid, setHasPaid] = useState(false)
  const [hasConnected, setHasConnected] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ✅ UK States for dropdown
  const UK_STATES = [
    'England', 'Scotland', 'Wales', 'Northern Ireland',
    'London', 'Manchester', 'Birmingham', 'Liverpool',
    'Bristol', 'Sheffield', 'Leeds', 'Newcastle',
    'Nottingham', 'Southampton', 'Brighton', 'Oxford',
    'Cambridge', 'York', 'Bath', 'Edinburgh', 'Glasgow',
    'Aberdeen', 'Dundee', 'Cardiff', 'Swansea', 'Belfast',
    'Derry', 'All UK'
  ]

  // ✅ Check if already connected
  useEffect(() => {
    if (statusData?.hasConnected) {
      setHasConnected(true)
      // Redirect to Connect Dashboard
      navigate('/customer/connect-dashboard')
    }
  }, [statusData, navigate])

  // Form state - ✅ Replaced location with state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    state: '', // ✅ New field - UK State
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

  // Purpose Options
  const purposeOptions = [
    { value: 'casual_date', label: '😊 Casual date', description: 'Relaxed, fun, no pressure' },
    { value: 'flirting_fun', label: '🔥 Flirting & fun', description: 'Lighthearted chats, good vibes' },
    { value: 'serious_relationship', label: '❤️ Serious relationship', description: 'Long-term, genuine connection' },
    { value: 'friendship_first', label: '☕ Friendship first', description: 'Start as friends, see where it goes' },
    { value: 'open_to_anything', label: '🧭 Open to anything', description: 'Keep it easy, see how it flows' },
    { value: 'group_meetups_only', label: '💃 Group meetups only', description: 'Enjoy the gathering, no pressure' },
    { value: 'meaningful_connections', label: '🤝 Meaningful connections', description: 'Real chats, no games' },
    { value: 'just_to_mingle', label: '🎉 Just to mingle', description: 'Meet new people, have a great time' },
    { value: 'ready_for_commitment', label: '💍 Ready for commitment', description: 'Looking for my person' },
  ]

  const interestOptions = [
    'technology', 'business', 'healthcare', 'education', 'arts',
    'finance', 'legal', 'real_estate', 'hospitality', 'retail',
    'manufacturing', 'non_profit', 'government', 'other'
  ]

  const dayOptions = [
    { value: 'sunday', label: 'Sunday ✨', special: true },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
  ]

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
        toast.success('Payment successful! You can now create your connection.')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!hasPaid) {
      setShowPaymentModal(true)
      return
    }

    if (!formData.state) {
      toast.error('Please select your state')
      return
    }

    if (!formData.purpose) {
      toast.error('Please select what you\'re looking for')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createConnection(formData).unwrap()
      toast.success('Connection created successfully! 🎉')
      // ✅ Redirect to Connect Dashboard with posts
      navigate('/customer/connect-dashboard')
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

  const CONNECTION_FEE = connectionFee?.connectionFee

  // If user is not logged in, redirect
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // If already connected, redirect to dashboard
  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-3xl text-primary" />
      </div>
    )
  }

  if (hasConnected) {
    return null // Will redirect via useEffect
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">Create Your Connect Profile</h1>
          <p className="text-text-light text-sm">
            {hasPaid ? (
              <span className="text-green-600 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                You've paid the fee — complete your profile to start connecting!
              </span>
            ) : (
              <span>Pay a one-time fee of £{CONNECTION_FEE} to unlock weekly group dates and individual meetups</span>
            )}
          </p>
        </div>

        {/* Sunday Highlight Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <FaStar className="text-primary" />
            </div>
            <div>
              <p className="font-medium text-text">✨ Sunday Group Dates</p>
              <p className="text-sm text-text-light">
                Every Sunday, we'll share a meetup spot near you. Come mingle and meet new people!
                <span className="text-primary font-medium"> Your next connection could be closer than you think.</span>
              </p>
              <p className="text-xs text-text-lighter mt-1">
                💡 Can't make Sunday? You can also schedule individual meetups on other days.
              </p>
            </div>
          </div>
        </div>

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

        {hasPaid &&
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
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

            {/* ✅ UK State Dropdown - Replaces location */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Your State / Region *
              </label>
              <UKStatesDropdown
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Select your state..."
                required
                className="bg-white"
              />
              <p className="text-xs text-text-lighter mt-1">
                We'll show you meetup spots and activities in your area 🗺️
              </p>
            </div>

            {/* Purpose Dropdown */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                What are you looking for? *
              </label>
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select what you're looking for...</option>
                {purposeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} — {opt.description}
                  </option>
                ))}
              </select>
              {formData.purpose && (
                <p className="text-xs text-text-lighter mt-1">
                  {purposeOptions.find(p => p.value === formData.purpose)?.description}
                </p>
              )}
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">
                Your Interests (Select all that apply)
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
                      key={day.value}
                      className={`px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
                        formData.availability.preferredDays.includes(day.value)
                          ? day.special 
                            ? 'bg-primary text-white' 
                            : 'bg-primary text-white'
                          : day.special
                            ? 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
                            : 'bg-gray-100 text-text-light hover:bg-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="preferredDays"
                        value={day.value}
                        checked={formData.availability.preferredDays.includes(day.value)}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-text-lighter mt-1">
                  ✨ Sunday is our featured group meetup day!
                </p>
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
                  <p className="text-sm text-green-600">Complete your profile to start connecting!</p>
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
                <FaHeart />
              )}
              <span>
                {isSubmitting 
                  ? 'Creating...' 
                  : hasPaid 
                    ? 'Create Your Connect Profile' 
                    : 'Pay Fee & Create Profile'
                }
              </span>
            </button>
          </form>
        </div>
        }

        {/* Help Section */}
        <div className="mt-6 card bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FaInfoCircle className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-text">How GEOBUY Connect Works</h4>
              <p className="text-sm text-text-light mt-1">
                1. Pay the one-time fee of £{CONNECTION_FEE}<br />
                2. Select your state and tell us what you're looking for<br />
                3. Get weekly Sunday group meetup spots in your area<br />
                4. Or schedule individual meetups any day of the week<br />
                5. Show up, mingle, and make meaningful connections!
              </p>
              <p className="text-xs text-text-lighter mt-2">
                ✨ Sunday is our featured group date day — don't miss it!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Connect