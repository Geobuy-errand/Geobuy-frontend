import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useUpdateProfileMutation } from '../../redux/services/providerApi'
import { toast } from 'react-hot-toast'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave } from 'react-icons/fa'

const CustomerProfile = () => {
  const { user } = useSelector((state) => state.auth)
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: {
      street: user?.address?.street || '',
      town: user?.address?.town || '',
      postcode: user?.address?.postcode || '',
    },
    accessNeeds: user?.accessNeeds || '',
    preferredContactTime: user?.preferredContactTime || '',
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
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update profile')
    }
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

          <div>
            <label className="block text-sm font-medium text-text-light mb-1">
              Access Needs
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <FaSave />
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

export default CustomerProfile