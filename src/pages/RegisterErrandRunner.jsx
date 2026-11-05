import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useRegisterErrandRunnerMutation } from '../redux/services/authApi'
import { setUser } from '../redux/slices/authSlice'
import { toast } from 'react-hot-toast'
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaHome, FaCity, FaMapPin, 
  FaBirthdayCake, FaUniversity, FaCar, FaWeightHanging, FaRuler,
  FaCheckCircle, FaTimesCircle, 
  FaEyeSlash,
  FaEye
} from 'react-icons/fa'
import CountrySelector from '../components/CountrySelector'
import CountryAddressFields from '../components/forms/CountryAddressFields'
import useCountry from '../hooks/useCountry'
import { getCountry, PHONE_PATTERNS } from '../config/countries'
import BankDetailsFields from '../components/forms/BankDetailsFields'

const RegisterErrandRunner = () => {
  const { code: initialCountry, setCountry: setVisitorCountry } = useCountry()
  const [formData, setFormData] = useState({
    country: initialCountry,
    fullName: '',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      area: '',
      town: '',
      state: '',
      postcode: '',
    },
    bankDetails: {
      bankName: '',
      bankCode: '',
      sortCode: '',
      accountNumber: '',
    },
    vehicleType: 'walking',
    maxWeightCapacity: 10,
    maxDistancePreference: 10,
    renderCareServices: false,
    over18: false,
    acceptedTerms: false,
    acceptedPrivacy: false,
    informationTrue: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerMutation] = useRegisterErrandRunnerMutation()
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
    
    if (!PHONE_PATTERNS[formData.country].test(formData.phoneNumber.trim())) {
      toast.error(formData.country === 'NG' ? 'Enter a valid Nigerian phone number, e.g. 0803 123 4567' : 'Enter a valid UK phone number')
      return
    }

    // Validate password match
    if (!validatePasswordMatch()) {
      return
    }
    if (!validatePasswordStrength()) return

    setIsLoading(true)

    try {
      const { confirmPassword, ...submitData } = formData
      const result = await registerMutation(submitData).unwrap()
      
      if (result.user) {
        dispatch(setUser({ user: result.user, providerProfile: null }))
        toast.success('Registration successful! Your account is pending verification.')
        navigate('/errand-runner/dashboard')
      }
    } catch (error) {
      toast.error(error.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isPasswordValid = () => {
    const { minLength, hasUppercase, hasLowercase, hasNumber } = passwordValidation
    return minLength && hasUppercase && hasLowercase && hasNumber
  }

  const doPasswordsMatch = () => {
    return formData.password === formData.confirmPassword && formData.password.length > 0
  }

  const isFormValid = () => {
    return (
      formData.fullName &&
      formData.dateOfBirth &&
      formData.email &&
      formData.phoneNumber &&
      formData.address.street &&
      formData.address.town &&
      (formData.country === 'NG'
        ? formData.address.state
        : formData.address.postcode &&
          formData.bankDetails.bankName &&
          formData.bankDetails.sortCode &&
          formData.bankDetails.accountNumber) &&
      isPasswordValid() &&
      doPasswordsMatch() &&
      formData.over18 &&
      formData.acceptedTerms &&
      formData.acceptedPrivacy &&
      formData.informationTrue
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-2xl">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text">Become an Errand Runner</h1>
            <p className="text-text-light mt-2">Start earning by completing errands</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <CountrySelector
              variant="cards"
              value={formData.country}
              onChange={(c) => {
                setVisitorCountry(c)
                setFormData((prev) => ({
                  ...prev,
                  country: c,
                  address: { ...prev.address, state: '', postcode: '' },
                  ...(prev.bankDetails ? { bankDetails: { bankName: '', bankCode: '', sortCode: '', accountNumber: '' } } : {}),
                }))
              }}
            />
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
                  Date of Birth *
                </label>
                <div className="relative">
                  <FaBirthdayCake className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input-field pl-10"
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
                    placeholder={getCountry(formData.country).phonePlaceholder}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Password *
                </label>
                <div className="relative">
                  {showPassword ? <FaEyeSlash onClick={()=> setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter cursor-pointer" /> : <FaEye onClick={()=> setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter cursor-pointer" />}
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                  {showConfirmPassword ? <FaEyeSlash onClick={()=> setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter cursor-pointer" /> : <FaEye onClick={()=> setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter cursor-pointer" />}
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <CountryAddressFields country={formData.country} address={formData.address} onChange={handleChange} />

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  <FaCar className="inline mr-2" />
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="walking">Walking</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="motorbike">{formData.country === 'NG' ? 'Motorbike (okada)' : 'Motorbike'}</option>
                  {formData.country === 'NG' && <option value="keke">Tricycle (keke)</option>}
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  <FaWeightHanging className="inline mr-2" />
                  Max Weight Capacity (kg)
                </label>
                <input
                  type="number"
                  name="maxWeightCapacity"
                  value={formData.maxWeightCapacity}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  <FaRuler className="inline mr-2" />
                  Max Distance ({getCountry(formData.country).distanceUnitLabel})
                </label>
                <input
                  type="number"
                  name="maxDistancePreference"
                  value={formData.maxDistancePreference}
                  onChange={handleChange}
                  className="input-field"
                  min="0"
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

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-text mb-3">Bank Details</h3>
              <BankDetailsFields
                country={formData.country}
                bankDetails={formData.bankDetails}
                onChange={handleChange}
                required={formData.country !== 'NG'}
                setBankDetails={(b) => setFormData((prev) => ({ ...prev, bankDetails: { ...prev.bankDetails, ...b } }))}
              />
              {formData.country === 'NG' && (
                <p className="text-xs text-text-lighter mt-2">
                  Optional now — you can add and verify your account from your wallet before your first withdrawal.
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="renderCareServices"
                  checked={formData.renderCareServices}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-text-light">
                  Render care services? {formData.country === 'NG' ? '(Requires a background check)' : '(Requires DBS check)'}
                </span>
              </label>
            </div>

            <div className="bg-primary/5 rounded-xl p-4 text-sm text-text-light">
              <p>
                All documents are checked securely and stored safely. We only ask what we need to confirm who you are, 
                keep everyone protected, and pay you correctly.
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
                <span className="text-sm text-text-light">✔ Over 18</span>
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
                <span className="text-sm text-text-light">✔ Accept Terms</span>
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
                <span className="text-sm text-text-light">✔ Accept Privacy Policy</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="informationTrue"
                  checked={formData.informationTrue}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  required
                />
                <span className="text-sm text-text-light">✔ Information is true</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Register as Errand Runner'}
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

export default RegisterErrandRunner