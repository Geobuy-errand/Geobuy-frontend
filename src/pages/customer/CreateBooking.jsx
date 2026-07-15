import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useCreateBookingMutation } from '../../redux/services/bookingApi'
import { useGetServicesQuery } from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { FaMapMarkerAlt, FaCalendar, FaClock, FaCamera, FaDollarSign } from 'react-icons/fa'

const CreateBooking = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { data: services, isLoading: servicesLoading } = useGetServicesQuery()
  const [createBooking, { isLoading }] = useCreateBookingMutation()

  const [formData, setFormData] = useState({
    serviceId: '',
    serviceType: '',
    customRequest: '',
    pickup: {
      address: '',
      street: '',
      town: '',
      postcode: '',
    },
    destination: {
      address: '',
      street: '',
      town: '',
      postcode: '',
    },
    date: '',
    time: '',
    description: '',
    estimatedPrice: 0,
  })

  const [hasDestination, setHasDestination] = useState(false)
  const [photos, setPhotos] = useState([])

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

  const handleServiceSelect = (e) => {
    const serviceId = e.target.value
    const service = services?.find(s => s._id === serviceId)
    setFormData(prev => ({
      ...prev,
      serviceId,
      serviceType: service?.category || '',
      estimatedPrice: service?.basePrice || 0,
    }))
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    // In a real app, you'd upload to Cloudinary here
    const filePreviews = files.map(file => URL.createObjectURL(file))
    setPhotos(prev => [...prev, ...filePreviews])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.serviceId) {
      toast.error('Please select a service')
      return
    }
    if (!formData.pickup.address) {
      toast.error('Please enter pickup address')
      return
    }
    if (!formData.date || !formData.time) {
      toast.error('Please select date and time')
      return
    }

    try {
      const result = await createBooking({
        ...formData,
        photos: photos,
      }).unwrap()
      
      toast.success('Booking created successfully!')
      navigate(`/customer/booking/${result.booking._id}`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create booking')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Create New Booking</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Selection */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Select Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Service *
              </label>
              <select
                name="serviceId"
                value={formData.serviceId}
                onChange={handleServiceSelect}
                className="input-field"
                required
              >
                <option value="">Select a service...</option>
                {services?.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.icon} {service.name} - £{service.basePrice}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Custom Request
              </label>
              <input
                type="text"
                name="customRequest"
                value={formData.customRequest}
                onChange={handleChange}
                className="input-field"
                placeholder="Describe your specific needs..."
              />
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Pickup Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-light mb-1">
                Address *
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="text"
                  name="pickup.address"
                  value={formData.pickup.address}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Full address"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Street
              </label>
              <input
                type="text"
                name="pickup.street"
                value={formData.pickup.street}
                onChange={handleChange}
                className="input-field"
                placeholder="Street name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Town/City
              </label>
              <input
                type="text"
                name="pickup.town"
                value={formData.pickup.town}
                onChange={handleChange}
                className="input-field"
                placeholder="Town or city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Postcode
              </label>
              <input
                type="text"
                name="pickup.postcode"
                value={formData.pickup.postcode}
                onChange={handleChange}
                className="input-field"
                placeholder="Postcode"
              />
            </div>
          </div>
        </div>

        {/* Destination (Optional) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Destination (Optional)</h2>
            <button
              type="button"
              onClick={() => setHasDestination(!hasDestination)}
              className="text-primary hover:underline text-sm"
            >
              {hasDestination ? 'Remove destination' : 'Add destination'}
            </button>
          </div>

          {hasDestination && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-light mb-1">
                  Destination Address
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                  <input
                    type="text"
                    name="destination.address"
                    value={formData.destination.address}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Destination address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Street
                </label>
                <input
                  type="text"
                  name="destination.street"
                  value={formData.destination.street}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Street name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Town/City
                </label>
                <input
                  type="text"
                  name="destination.town"
                  value={formData.destination.town}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Town or city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  name="destination.postcode"
                  value={formData.destination.postcode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Postcode"
                />
              </div>
            </div>
          )}
        </div>

        {/* Date & Time */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Date *
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
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
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description & Photos */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="input-field resize-none"
                placeholder="Describe your errand in detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Photos (Optional)
              </label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer btn-outline text-sm py-2">
                  <FaCamera className="inline mr-2" />
                  Upload Photos
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-text-light">
                  {photos.length} photos uploaded
                </span>
              </div>
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Estimated Price
              </label>
              <div className="relative">
                <FaDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="number"
                  name="estimatedPrice"
                  value={formData.estimatedPrice}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || servicesLoading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating Booking...' : 'Create Booking'}
        </button>
      </form>
    </div>
  )
}

export default CreateBooking