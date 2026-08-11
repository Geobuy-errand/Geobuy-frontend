import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetErrandRunnerProfileQuery, useUpdateErrandRunnerProfileMutation } from '../../redux/services/errandRunnerApi'
import { toast } from 'react-hot-toast'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaCar, FaWeightHanging, FaRuler } from 'react-icons/fa'

const ErrandProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: profile, isLoading, refetch } = useGetErrandRunnerProfileQuery()
  const [updateProfile, { isLoading: isUpdating }] = useUpdateErrandRunnerProfileMutation()

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: {
      street: user?.address?.street || '',
      town: user?.address?.town || '',
      postcode: user?.address?.postcode || '',
    },
    vehicleType: profile?.vehicleType || 'walking',
    maxWeightCapacity: profile?.maxWeightCapacity || 10,
    maxDistancePreference: profile?.maxDistancePreference || 10,
    about: profile?.about || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
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
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData).unwrap()
      toast.success('Profile updated successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update profile')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton h-96 w-full rounded-xl"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Profile</h1>

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">
              Full Name
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-light mb-1">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
              <input
                type="email"
                value={user?.email}
                className="input-field pl-10 bg-gray-50"
                disabled
              />
            </div>
            <p className="text-xs text-text-lighter mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-light mb-1">
              Phone Number
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-lg font-semibold text-text mb-3">Address</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Street Address
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Town/City
                  </label>
                  <input
                    type="text"
                    name="address.town"
                    value={formData.address.town}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Postcode
                  </label>
                  <input
                    type="text"
                    name="address.postcode"
                    value={formData.address.postcode}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-lg font-semibold text-text mb-3">Errand Runner Details</h3>
            <div className="space-y-3">
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
                  <option value="motorbike">Motorbike</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    <FaWeightHanging className="inline mr-2" />
                    Max Weight (kg)
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
                    Max Distance (miles)
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

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  About Me
                </label>
                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows="4"
                  className="input-field resize-none"
                  placeholder="Tell customers about yourself and your experience..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FaSave />
            <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default ErrandProfile