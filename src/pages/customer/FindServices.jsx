import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { 
  useGetServiceCategoriesQuery, 
  useGetServiceProvidersQuery, 
  useCreateServiceRequestMutation 
} from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import { 
  FaSearch, FaStar, FaMapMarkerAlt, FaClock, FaShieldAlt, FaCheckCircle, 
  FaUserCheck, FaHeart, FaTools, FaBriefcase, FaUser, FaPlus, 
  FaArrowRight, FaSpinner, FaLocationArrow, FaRuler, FaCheck,
  FaFilter, FaTimes, FaUsers, FaEnvelope, FaPhone, FaInfoCircle,
  FaPaperPlane
} from 'react-icons/fa'

const FindServices = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  
  // State
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedProviders, setSelectedProviders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    dbsChecked: false,
    insured: false,
    rated: false,
    maxDistance: 20,
    sortBy: 'nearest',
  })
  const [userLocation, setUserLocation] = useState(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [showProviderSelection, setShowProviderSelection] = useState(false)
  
  // Request form state
  const [serviceRequest, setServiceRequest] = useState({
    category: '',
    serviceType: '',
    description: '',
    location: {
      address: '',
      town: '',
      postcode: '',
      coordinates: null,
    },
    preferredDate: '',
    preferredTime: '',
    budget: '',
    isUrgent: false,
    requiresDBS: false,
    requiresCertification: false,
  })

  // API hooks
  const { data: categories, isLoading: categoriesLoading } = useGetServiceCategoriesQuery()
  const { data: providers, isLoading: providersLoading, refetch: refetchProviders } = useGetServiceProvidersQuery({
    category: selectedCategory,
    dbsChecked: filters.dbsChecked,
    insured: filters.insured,
    rated: filters.rated,
    lat: userLocation?.lat || null,  // Send null instead of undefined
    lng: userLocation?.lng || null,  // Send null instead of undefined
    radius: filters.maxDistance,
    limit: 50,
  }, {
    skip: !selectedCategory,
  })


  const [createServiceRequest, { isLoading: isCreating }] = useCreateServiceRequestMutation()

  // Get user's location
  const getUserLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsGettingLocation(false)
          toast.success('Location detected successfully!')
          refetchProviders()
        },
        (error) => {
          console.error('Location error:', error)
          setIsGettingLocation(false)
          toast.error('Could not get your location. Please enter your address manually.')
          setUserLocation({
            lat: 51.5074,
            lng: -0.1276,
          })
        }
      )
    } else {
      setIsGettingLocation(false)
      toast.error('Geolocation is not supported by your browser.')
      setUserLocation({
        lat: 51.5074,
        lng: -0.1276,
      })
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.name)
    setSelectedProviders([])
    setServiceRequest(prev => ({ ...prev, category: category.name }))
    setShowRequestForm(true)
    setShowProviderSelection(true)
  }

  const handleRequestChange = (e) => {
    const { name, value, type, checked } = e.target
    setServiceRequest(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleLocationSelect = (suggestion) => {
    const addressParts = suggestion.displayName?.split(',') || []
    setServiceRequest(prev => ({
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

  const toggleProviderSelection = (providerId) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    )
  }

  const selectAllProviders = () => {
    if (providers) {
      const allIds = providers.map(p => p._id)
      setSelectedProviders(allIds)
    }
  }

  const deselectAllProviders = () => {
    setSelectedProviders([])
  }

  const handleCreateRequest = async () => {
    // Validate form
    if (!serviceRequest.serviceType) {
      toast.error('Please select a service type')
      return
    }
    if (!serviceRequest.description) {
      toast.error('Please describe what you need')
      return
    }
    if (selectedProviders.length === 0) {
      toast.error('Please select at least one provider to invite')
      return
    }

    try {
      const result = await createServiceRequest({
        ...serviceRequest,
        invitedProviders: selectedProviders,
      }).unwrap()
      
      toast.success(`Service request created and sent to ${selectedProviders.length} provider(s)!`)
      navigate(`/customer/service-request/${result.serviceRequest._id}`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to create service request')
    }
  }

  const sortedProviders = () => {
    if (!providers) return []
    
    const providersList = [...providers]
    
    if (filters.sortBy === 'nearest') {
      providersList.sort((a, b) => (a.distance || 999) - (b.distance || 999))
    } else if (filters.sortBy === 'rating') {
      providersList.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    }
    
    return providersList
  }

  const displayProviders = sortedProviders()
  const hasProviders = displayProviders && displayProviders.length > 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text">Find Local Services</h1>
            <p className="text-text-light mt-2">
              Browse providers, select who you want to work with, and create a service request
            </p>
          </div>

          {/* Location Detection */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <button
              onClick={getUserLocation}
              disabled={isGettingLocation}
              className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 disabled:opacity-50"
            >
              {isGettingLocation ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaLocationArrow />
              )}
              <span>{isGettingLocation ? 'Detecting...' : 'Use My Location'}</span>
            </button>
            {userLocation && (
              <span className="text-sm text-green-600 flex items-center">
                <FaCheckCircle className="mr-1" />
                Location detected
              </span>
            )}
            <div className="flex-1 max-w-xs">
              <select
                value={filters.maxDistance}
                onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                className="input-field py-2"
              >
                <option value={5}>Within 5 miles</option>
                <option value={10}>Within 10 miles</option>
                <option value={20}>Within 20 miles</option>
                <option value={50}>Within 50 miles</option>
                <option value={100}>Any distance</option>
              </select>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
              <input
                type="text"
                placeholder="Search for services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-soft">
                <input
                  type="checkbox"
                  checked={filters.dbsChecked}
                  onChange={(e) => setFilters({ ...filters, dbsChecked: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm">DBS Checked</span>
              </label>
              <label className="flex items-center space-x-2 px-3 py-2 bg-white rounded-lg shadow-soft">
                <input
                  type="checkbox"
                  checked={filters.insured}
                  onChange={(e) => setFilters({ ...filters, insured: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="text-sm">Insured</span>
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="input-field py-2 w-40"
              >
                <option value="nearest">Nearest First</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Categories - Dynamic from Database */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-4">Service Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categoriesLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-xl"></div>
                  ))
                : categories?.map((category) => {
                    const isSelected = selectedCategory === category.name
                    return (
                      <button
                        key={category._id}
                        onClick={() => handleCategorySelect(category)}
                        className={`p-4 rounded-xl text-center transition-all duration-200
                          ${isSelected
                            ? 'bg-primary text-white shadow-soft'
                            : 'bg-white hover:shadow-soft text-text'
                          }`}
                      >
                        <span className="text-2xl mx-auto mb-2 block">{category.icon || '📋'}</span>
                        <p className="font-medium text-sm">{category.label}</p>
                        {category.subCategories && category.subCategories.length > 0 && (
                          <p className="text-xs opacity-70 mt-1">
                            {category.subCategories.length} sub-categories
                          </p>
                        )}
                      </button>
                    )
                  })}
            </div>
          </div>

          {/* Providers List with Selection */}
          {selectedCategory && (
            <div className="mb-8">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-text">Available Providers</h2>
                  {userLocation && hasProviders && (
                    <p className="text-sm text-text-light">
                      Showing {displayProviders.length} provider(s) near your location
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {hasProviders && (
                    <>
                      <button
                        onClick={selectAllProviders}
                        className="btn-outline text-sm py-1 px-3"
                      >
                        Select All
                      </button>
                      <button
                        onClick={deselectAllProviders}
                        className="btn-outline text-sm py-1 px-3"
                      >
                        Deselect All
                      </button>
                      <span className="text-sm text-text-light flex items-center">
                        {selectedProviders.length} selected
                      </span>
                    </>
                  )}
                </div>
              </div>

              {providersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card mb-4">
                    <div className="skeleton h-24 rounded-xl"></div>
                  </div>
                ))
              ) : !hasProviders ? (
                <div className="card text-center py-12">
                  <p className="text-text-light text-lg">No providers found in this category</p>
                  <p className="text-sm text-text-lighter mt-2">
                    Try adjusting your filters or expanding your search radius
                  </p>
                  <button
                    onClick={() => {
                      setFilters({
                        ...filters,
                        dbsChecked: false,
                        insured: false,
                        maxDistance: 100,
                      })
                      refetchProviders()
                    }}
                    className="mt-4 text-primary hover:underline"
                  >
                    Clear filters and expand search
                  </button>
                </div>
              ) : (
                displayProviders.map((provider) => {
                  const isSelected = selectedProviders.includes(provider._id)
                  return (
                    <div
                      key={provider._id}
                      className={`card mb-4 transition-all duration-200 ${
                        isSelected ? 'border-2 border-primary shadow-medium' : 'hover:shadow-medium'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                            <h3 className="font-semibold text-text">
                              {provider.fullName}
                            </h3>
                            <div className="flex items-center text-sm text-yellow-500">
                              <FaStar />
                              <span className="ml-1 text-text-light">
                                {provider.averageRating?.toFixed(1) || 'New'}
                              </span>
                            </div>
                            <span className="text-xs text-text-lighter">
                              ({provider.totalReviews || 0} reviews)
                            </span>
                            {provider.distance && (
                              <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                <FaRuler className="mr-1" />
                                {provider.distance.toFixed(1)} miles away
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {provider.verificationBadges?.includes('dbs_checked') && (
                              <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                <FaCheckCircle className="mr-1" /> DBS Checked
                              </span>
                            )}
                            {provider.verificationBadges?.includes('insured') && (
                              <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                <FaShieldAlt className="mr-1" /> Insured
                              </span>
                            )}
                            {provider.verificationBadges?.includes('certified') && (
                              <span className="flex items-center text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                <FaCheckCircle className="mr-1" /> Certified
                              </span>
                            )}
                            {provider.verificationBadges?.includes('id_checked') && (
                              <span className="flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                <FaUserCheck className="mr-1" /> ID Verified
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-text-light mt-2">
                            {provider.about || `Professional service provider`}
                          </p>
                          <div className="flex items-center text-sm text-text-light mt-2">
                            <FaMapMarkerAlt className="mr-1" />
                            {provider.address?.town || 'Location available'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {provider.serviceRates?.hourlyRate && (
                            <p className="text-sm text-text-light">
                              <span className="font-semibold text-primary">
                                £{provider.serviceRates.hourlyRate}
                              </span>
                              /hr
                            </p>
                          )}
                          <button
                            onClick={() => toggleProviderSelection(provider._id)}
                            className={`text-sm py-2 px-4 rounded-lg font-medium transition-all duration-200 w-full md:w-auto ${
                              isSelected
                                ? 'bg-primary text-white'
                                : 'border-2 border-gray-300 text-text-light hover:border-primary hover:text-primary'
                            }`}
                          >
                            {isSelected ? (
                              <span className="flex items-center justify-center space-x-1">
                                <FaCheck />
                                <span>Selected</span>
                              </span>
                            ) : (
                              <span>Select Provider</span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Service Request Form */}
          {showRequestForm && selectedCategory && (
            <div className="card mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-text">Create Service Request</h2>
                <span className="text-sm text-primary">
                  {selectedProviders.length} provider(s) selected
                </span>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateRequest(); }} className="space-y-4">
                {/* Service Type Dropdown - Dynamic from selected category's subcategories */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Service Type *
                  </label>
                  <select
                    name="serviceType"
                    value={serviceRequest.serviceType}
                    onChange={handleRequestChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select a service type...</option>
                    {categories?.find(c => c.name === selectedCategory)?.subCategories?.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                    <option value="other">Other (Please specify in description)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={serviceRequest.description}
                    onChange={handleRequestChange}
                    rows="4"
                    className="input-field resize-none"
                    placeholder="Describe what you need..."
                    required
                  />
                </div>

                {/* Location with Autocomplete */}
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Location
                  </label>
                  <AddressAutocomplete
                    label=""
                    placeholder="Enter your address..."
                    value={serviceRequest.location.address}
                    onSelect={handleLocationSelect}
                    onChange={(e) => {
                      setServiceRequest(prev => ({
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={serviceRequest.preferredDate}
                      onChange={handleRequestChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-1">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={serviceRequest.preferredTime}
                      onChange={handleRequestChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Budget (£)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={serviceRequest.budget}
                    onChange={handleRequestChange}
                    className="input-field"
                    placeholder="Your estimated budget"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isUrgent"
                      checked={serviceRequest.isUrgent}
                      onChange={handleRequestChange}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-text-light">This is urgent</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="requiresDBS"
                      checked={serviceRequest.requiresDBS}
                      onChange={handleRequestChange}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-text-light">Requires DBS checked provider</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="requiresCertification"
                      checked={serviceRequest.requiresCertification}
                      onChange={handleRequestChange}
                      className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-text-light">Requires certified provider</span>
                  </label>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-blue-700">
                        💳 Service Fee
                      </span>
                      <p className="text-xs text-blue-600">Fixed booking fee</p>
                    </div>
                    <span className="font-bold text-blue-700">£1.99</span>
                  </div>
                  <p className="text-xs text-text-lighter mt-2">
                    * Service fee is charged by GEOBUY. Service provider amount is negotiated directly.
                  </p>
                </div>

                {selectedProviders.length > 0 && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-700">
                      ✅ {selectedProviders.length} provider(s) will be invited to quote for this service
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating || selectedProviders.length === 0}
                  className="w-full btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPaperPlane />
                  )}
                  <span>
                    {isCreating 
                      ? 'Creating Request...' 
                      : selectedProviders.length === 0 
                        ? 'Select Providers First' 
                        : `Send to ${selectedProviders.length} Provider(s)`
                    }
                  </span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FindServices