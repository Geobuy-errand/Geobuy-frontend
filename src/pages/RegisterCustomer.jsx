import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useRegisterCustomerMutation } from '../redux/services/authApi'
import { setUser } from '../redux/slices/authSlice'
import { toast } from 'react-hot-toast'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaHome, FaCity, FaMapPin, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const RegisterCustomer = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      town: '',
      postcode: '',
    },
    accessNeeds: '',
    preferredContactTime: '',
    over18: false,
    acceptedTerms: false,
    acceptedPrivacy: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [registerMutation] = useRegisterCustomerMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
  })

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

    // Validate password in real-time
    if (name === 'password') {
      validatePassword(value)
    }
  }

  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
    })
  }

  const validatePasswordMatch = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    return true
  }

  const validatePasswordStrength = () => {
    const { minLength, hasUppercase, hasLowercase, hasNumber } = passwordValidation
    
    if (!minLength) {
      toast.error('Password must be at least 8 characters')
      return false
    }
    if (!hasUppercase) {
      toast.error('Password must contain at least one uppercase letter')
      return false
    }
    if (!hasLowercase) {
      toast.error('Password must contain at least one lowercase letter')
      return false
    }
    if (!hasNumber) {
      toast.error('Password must contain at least one number')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate password match
    if (!validatePasswordMatch()) {
      return
    }

    // Validate password strength
    if (!validatePasswordStrength()) {
      return
    }

    setIsLoading(true)

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...submitData } = formData
      const result = await registerMutation(submitData).unwrap()
      
      if (result.user) {
        dispatch(setUser({ user: result.user, providerProfile: null }))
        toast.success('Registration successful! Welcome to GEOBUY.')
        navigate('/customer/dashboard')
      }
    } catch (error) {
      // Handle validation errors from backend
      if (error.data?.message) {
        toast.error(error.data.message)
      } else if (error.data?.errors && Array.isArray(error.data.errors)) {
        const errorMessage = error.data.errors.map(err => err.message).join('. ')
        toast.error(errorMessage)
      } else {
        toast.error(error.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Check if password is valid
  const isPasswordValid = () => {
    const { minLength, hasUppercase, hasLowercase, hasNumber } = passwordValidation
    return minLength && hasUppercase && hasLowercase && hasNumber
  }

  // Check if passwords match
  const doPasswordsMatch = () => {
    return formData.password === formData.confirmPassword && formData.password.length > 0
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text">Create Customer Account</h1>
            <p className="text-text-light mt-2">Start getting your errands done</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="input-field pl-10"
                    placeholder="John Doe"
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
                    className="input-field pl-10"
                    placeholder="john@example.com"
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
                    className="input-field pl-10"
                    placeholder="07700 900000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Password *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
                <p className="text-xs text-text-lighter mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Street Address *
                </label>
                <div className="relative">
                  <FaHome className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="123 Main Street"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Town/City *
                </label>
                <div className="relative">
                  <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="text"
                    name="address.town"
                    value={formData.address.town}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="London"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Postcode *
                </label>
                <div className="relative">
                  <FaMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="text"
                    name="address.postcode"
                    value={formData.address.postcode}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="SW1A 1AA"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Preferred Contact Time
                </label>
                <input
                  type="text"
                  name="preferredContactTime"
                  value={formData.preferredContactTime}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., 9 AM - 5 PM"
                />
              </div>
            </div>

            {/* Password Requirements */}
            {formData.password.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-text">Password Requirements:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    {passwordValidation.minLength ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordValidation.hasUppercase ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordValidation.hasLowercase ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordValidation.hasNumber ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-gray-400" />
                    )}
                    <span className={`text-sm ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      One number
                    </span>
                  </div>
                </div>
                {formData.confirmPassword.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                    {doPasswordsMatch() ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                    <span className={`text-sm ${doPasswordsMatch() ? 'text-green-600' : 'text-red-600'}`}>
                      {doPasswordsMatch() ? 'Passwords match ✓' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Access Needs (Optional)
              </label>
              <input
                type="text"
                name="accessNeeds"
                value={formData.accessNeeds}
                onChange={handleChange}
                className="input-field"
                placeholder="Any special requirements..."
              />
            </div>

            <div className="bg-primary/5 rounded-xl p-4 text-sm text-text-light">
              <p>
                We only use these details to process your bookings, keep you safe and follow UK privacy rules. 
                We never share your information without your permission.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="over18"
                  checked={formData.over18}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  required
                />
                <span className="text-sm text-text-light">✔ I am over 18</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  required
                />
                <span className="text-sm text-text-light">✔ I agree to the Terms</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="acceptedPrivacy"
                  checked={formData.acceptedPrivacy}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  required
                />
                <span className="text-sm text-text-light">✔ I agree to the Privacy Policy</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid() || !doPasswordsMatch()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-text-light">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterCustomer