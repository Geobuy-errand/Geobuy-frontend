import React, { useState } from 'react'
import { useUpdateAvailabilityMutation } from '../../redux/services/providerApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { FaToggleOn, FaToggleOff, FaMapMarkerAlt } from 'react-icons/fa'

const ProviderAvailability = () => {
  const { user } = useSelector((state) => state.auth)
  const [updateAvailability, { isLoading }] = useUpdateAvailabilityMutation()
  
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true)
  const [location, setLocation] = useState({
    lat: user?.location?.coordinates?.[1] || 51.5074,
    lng: user?.location?.coordinates?.[0] || -0.1276,
  })

  const handleToggle = async () => {
    try {
      await updateAvailability({
        isAvailable: !isAvailable,
        location,
      }).unwrap()
      setIsAvailable(!isAvailable)
      toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for jobs`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update availability')
    }
  }

  const handleLocationUpdate = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(newLocation)
          try {
            await updateAvailability({
              isAvailable,
              location: newLocation,
            }).unwrap()
            toast.success('Location updated successfully')
          } catch (error) {
            toast.error('Failed to update location')
          }
        },
        () => {
          toast.error('Unable to get location. Please enable location services.')
        }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Availability</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Availability Toggle */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Availability Status</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-text">Current Status</p>
              <p className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                {isAvailable ? '✅ Available for jobs' : '❌ Unavailable'}
              </p>
            </div>
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className="text-4xl focus:outline-none"
            >
              {isAvailable ? (
                <FaToggleOn className="text-primary" />
              ) : (
                <FaToggleOff className="text-gray-400" />
              )}
            </button>
          </div>
          <p className="text-sm text-text-light mt-4">
            {isAvailable 
              ? 'You are currently visible to customers and can receive job notifications.'
              : 'You are currently hidden from customers and will not receive job notifications.'}
          </p>
        </div>

        {/* Location */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Location</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-text-light">Current Location</p>
              <p className="font-medium text-text">
                Lat: {location.lat.toFixed(6)}
              </p>
              <p className="font-medium text-text">
                Lng: {location.lng.toFixed(6)}
              </p>
            </div>
            <button
              onClick={handleLocationUpdate}
              className="w-full btn-secondary flex items-center justify-center space-x-2"
            >
              <FaMapMarkerAlt />
              <span>Update My Location</span>
            </button>
            <p className="text-xs text-text-lighter text-center">
              Your location helps customers find providers in their area.
            </p>
          </div>
        </div>
      </div>

      {/* Availability Schedule (Optional) */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-text mb-4">Working Hours</h2>
        <p className="text-text-light text-sm mb-4">
          Set your preferred working hours to let customers know when you're available.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-text">{day}</span>
              <div className="flex items-center space-x-2">
                <input type="time" className="input-field py-1 px-2 w-24" defaultValue="09:00" />
                <span className="text-text-light">to</span>
                <input type="time" className="input-field py-1 px-2 w-24" defaultValue="17:00" />
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 btn-primary w-full md:w-auto">
          Save Working Hours
        </button>
      </div>
    </div>
  )
}

export default ProviderAvailability