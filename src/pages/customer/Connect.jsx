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
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import UKStatesDropdown from '../../components/utils/UKStatesDropdown'
import { 
  FaUser, FaEnvelope, FaPhone, FaClock, FaSpinner, FaCheckCircle,
  FaCreditCard, FaLock, FaInfoCircle, FaHeart, FaStar, FaCalendar,
  FaMapMarkerAlt, FaUsers, FaEye, FaNewspaper, FaBullhorn, 
  FaArrowRight, FaLocationArrow
} from 'react-icons/fa'
import { useGetUserPostsQuery } from '../../redux/services/connectPostApi'

const Connect = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  
  // ============================================================
  // API HOOKS
  // ============================================================
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useGetConnectionStatusQuery()
  const { data: paymentStatus, refetch: refetchPaymentStatus } = useCheckPaymentStatusQuery()
  const { data: connectionFee } = useGetConnectionFeeQuery()
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useGetUserPostsQuery()
  
  const [createCheckoutSession, { isLoading: isCreatingSession }] = useCreateCheckoutSessionMutation()
  const [createConnection, { isLoading: isCreating }] = useCreateConnectionMutation()
  
  // ============================================================
  // STATE
  // ============================================================
  const [hasPaid, setHasPaid] = useState(false)
  const [hasConnected, setHasConnected] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)

  // ============================================================
  // FORM STATE
  // ============================================================
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    state: '',
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

  // ============================================================
  // OPTIONS
  // ============================================================
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

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    if (statusData?.hasConnected) {
      setHasConnected(true)
    }
  }, [statusData])

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

  // If user is not logged in, redirect
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // ============================================================
  // FUNCTIONS
  // ============================================================
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
      setHasConnected(true)
      refetchStatus()
      refetchPosts()
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

  const CONNECTION_FEE = connectionFee?.connectionFee || 1.99
  const posts = postsData?.data || []
  const connection = postsData?.connection

  const getTypeIcon = (type) => {
    const icons = {
      meeting_venue: <FaLocationArrow className="text-primary" />,
      activity: <FaUsers className="text-blue-500" />,
      announcement: <FaBullhorn className="text-yellow-500" />,
      event: <FaCalendar className="text-purple-500" />,
      general: <FaNewspaper className="text-gray-500" />,
    }
    return icons[type] || <FaNewspaper className="text-gray-500" />
  }

  const getTypeBadge = (type) => {
    const badges = {
      meeting_venue: 'bg-green-100 text-green-700',
      activity: 'bg-blue-100 text-blue-700',
      announcement: 'bg-yellow-100 text-yellow-700',
      event: 'bg-purple-100 text-purple-700',
      general: 'bg-gray-100 text-gray-700',
    }
    return badges[type] || 'bg-gray-100 text-gray-700'
  }

  const getTypeLabel = (type) => {
    const labels = {
      meeting_venue: '📍 Venue',
      activity: '🎯 Activity',
      announcement: '📢 Announcement',
      event: '🎉 Event',
      general: '📰 General',
    }
    return labels[type] || type
  }

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (statusLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-3xl text-primary" />
      </div>
    )
  }

  // ============================================================
  // DASHBOARD VIEW (When connected)
  // ============================================================
  if (hasPaid && hasConnected && statusData?.hasConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom max-w-5xl py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-text">Your Connect Dashboard</h1>
                <p className="text-text-light mt-1">
                  Welcome back, {user?.fullName}! 👋
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2">
                  <FaMapMarkerAlt />
                  {connection?.state || 'Your State'}
                </span>
                <span className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-full flex items-center gap-2">
                  <FaHeart />
                  Connected
                </span>
              </div>
            </div>
            
            {/* Sunday Highlight */}
            <div className="mt-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-3">
                <FaStar className="text-primary text-xl" />
                <div>
                  <p className="font-medium text-text">✨ Sunday Group Date</p>
                  <p className="text-sm text-text-light">
                    Join us this Sunday for our weekly group meetup in {connection?.state}!
                    Check the posts below for venue details.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-text">No Posts Yet</h3>
                <p className="text-text-light mt-2">
                  Check back soon for meetup venues and activities in your area.
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="card hover:shadow-medium transition-shadow">
                  <div className="flex flex-col gap-4">
                    {/* Post Header */}
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(post.type)} flex items-center gap-1`}>
                          {getTypeIcon(post.type)}
                          <span>{getTypeLabel(post.type)}</span>
                        </div>
                        {post.isFeatured && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <FaStar className="text-yellow-500" />
                            Featured
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-lighter">
                        {formatDistanceToNow(new Date(post.createdAt))} ago
                      </span>
                    </div>

                    {/* Post Content */}
                    <div>
                      <h3 className="text-xl font-semibold text-text mb-2">{post.title}</h3>
                      <p className="text-text-light whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Venue Details */}
                    {post.venue && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-primary mt-1" />
                          <div>
                            <p className="font-medium text-text">{post.venue.name}</p>
                            <p className="text-sm text-text-light">{post.venue.address}</p>
                            {post.venue.postcode && (
                              <p className="text-sm text-text-light">{post.venue.postcode}</p>
                            )}
                            {post.venue.googleMapsUrl && (
                              <a
                                href={post.venue.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm flex items-center gap-1 mt-1"
                              >
                                Open in Google Maps <FaArrowRight className="text-xs" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date & Time */}
                    {(post.date || post.time) && (
                      <div className="flex flex-wrap gap-4 text-sm text-text-light">
                        {post.date && (
                          <span className="flex items-center gap-1">
                            <FaCalendar className="text-primary" />
                            {format(new Date(post.date), 'EEEE, dd MMMM yyyy')}
                          </span>
                        )}
                        {post.time && (
                          <span className="flex items-center gap-1">
                            <FaClock className="text-primary" />
                            {post.time}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-text-lighter">
                      <span className="flex items-center gap-1">
                        <FaUser className="text-primary" />
                        Posted by {post.createdBy?.fullName || 'Admin'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="text-primary" />
                        {post.views || 0} views
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-primary/5 border border-primary/20 text-center">
              <FaCalendar className="text-2xl text-primary mx-auto mb-2" />
              <p className="font-medium text-text">Weekly Sunday Meetups</p>
              <p className="text-sm text-text-light">Every Sunday in your area</p>
            </div>
            <div className="card bg-blue-50 border border-blue-200 text-center">
              <FaUsers className="text-2xl text-blue-500 mx-auto mb-2" />
              <p className="font-medium text-text">Group Setting</p>
              <p className="text-sm text-text-light">Meet new people, no pressure</p>
            </div>
            <div className="card bg-purple-50 border border-purple-200 text-center">
              <FaHeart className="text-2xl text-purple-500 mx-auto mb-2" />
              <p className="font-medium text-text">Your Choice</p>
              <p className="text-sm text-text-light">Find your vibe, make connections</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // FORM VIEW (When not connected)
  // ============================================================
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

        {/* Payment Banner */}
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

        {/* Form - Only show if not connected */}
        {!hasConnected && (
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

              {/* UK State Dropdown */}
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
        )}

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