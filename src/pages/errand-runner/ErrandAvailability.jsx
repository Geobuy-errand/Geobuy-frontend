import React, { useState } from 'react'
import { useGetErrandRunnerProfileQuery, useUpdateErrandRunnerAvailabilityMutation } from '../../redux/services/errandRunnerApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { FaToggleOn, FaToggleOff, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa'

const ErrandAvailability = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: profile, isLoading, refetch } = useGetErrandRunnerProfileQuery()
  const [updateAvailability, { isLoading: isUpdating }] = useUpdateErrandRunnerAvailabilityMutation()
  
  const [isAvailable, setIsAvailable] = useState(profile?.isAvailable ?? true)
  const [location, setLocation] = useState({
    lat: profile?.location?.coordinates?.[1] || 51.5074,
    lng: profile?.location?.coordinates?.[0] || -0.1276,
  })
  const [availableDays, setAvailableDays] = useState(profile?.availableDays || {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  })
  const [availableHours, setAvailableHours] = useState(profile?.availableHours || {
    start: '08:00',
    end: '18:00',
  })

  const handleToggle = async () => {
    try {
      await updateAvailability({
        isAvailable: !isAvailable,
        location,
      }).unwrap()
      setIsAvailable(!isAvailable)
      toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for errands`)
      refetch()
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
            refetch()
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

  const handleDayToggle = (day) => {
    setAvailableDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }))
  }

  const handleHoursChange = (field, value) => {
    setAvailableHours(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const saveWorkingHours = async () => {
    try {
      await updateAvailability({
        isAvailable,
        location,
        availableDays,
        availableHours,
      }).unwrap()
      toast.success('Working hours saved successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save working hours')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-3xl" />
      </div>
    )
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
                {isAvailable ? '✅ Available for errands' : '❌ Unavailable'}
              </p>
            </div>
            <button
              onClick={handleToggle}
              disabled={isUpdating}
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
              ? 'You are currently visible to customers and can receive errand requests.'
              : 'You are currently hidden from customers and will not receive errand requests.'}
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
              Your location helps customers find errand runners in their area.
            </p>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-text mb-4">Working Hours</h2>
        <p className="text-text-light text-sm mb-4">
          Set your preferred working hours to let customers know when you're available.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
            <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={availableDays[day]}
                  onChange={() => handleDayToggle(day)}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="font-medium text-text capitalize">{day}</span>
              </div>
              {availableDays[day] && (
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={availableHours.start}
                    onChange={(e) => handleHoursChange('start', e.target.value)}
                    className="input-field py-1 px-2 w-24 text-sm"
                  />
                  <span className="text-text-light">to</span>
                  <input
                    type="time"
                    value={availableHours.end}
                    onChange={(e) => handleHoursChange('end', e.target.value)}
                    className="input-field py-1 px-2 w-24 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={saveWorkingHours}
          disabled={isUpdating}
          className="mt-4 btn-primary w-full md:w-auto"
        >
          {isUpdating ? 'Saving...' : 'Save Working Hours'}
        </button>
      </div>
    </div>
  )
}

export default ErrandAvailability