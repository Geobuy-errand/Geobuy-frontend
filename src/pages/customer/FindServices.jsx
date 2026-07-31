import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetServiceCategoriesQuery, useGetServiceProvidersQuery, useCreateServiceRequestMutation } from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { 
  FaSearch, 
  FaFilter, 
  FaStar, 
  FaMapMarkerAlt, 
  FaClock,
  FaShieldAlt,
  FaCheckCircle,
  FaUserCheck,
  FaHeart,
  FaTools,
  FaBriefcase,
  FaUser,
  FaPlus,
  FaArrowRight
} from 'react-icons/fa'

const FindServices = () => {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    dbsChecked: false,
    insured: false,
    rated: false,
    nearest: true,
  })
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [serviceRequest, setServiceRequest] = useState({
    category: '',
    serviceType: '',
    description: '',
    location: {
      address: '',
      town: '',
      postcode: '',
    },
    preferredDate: '',
    preferredTime: '',
    budget: '',
    isUrgent: false,
    requiresDBS: false,
    requiresCertification: false,
  })

  const { data: categories, isLoading: categoriesLoading } = useGetServiceCategoriesQuery()
  const { data: providers, isLoading: providersLoading } = useGetServiceProvidersQuery({
    category: selectedCategory,
    dbsChecked: filters.dbsChecked,
    insured: filters.insured,
  })
  const [createServiceRequest, { isLoading: isCreating }] = useCreateServiceRequestMutation()

  const categoryIcons = {
    care: FaHeart,
    trades: FaTools,
    professional: FaBriefcase,
    personal: FaUser,
    other: FaPlus,
  }

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
    setServiceRequest(prev => ({ ...prev, category: categoryId }))
  }

  const handleRequestChange = (e) => {
    const { name, value, type, checked } = e.target
    setServiceRequest(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleRequestSubmit = async (e) => {
    e.preventDefault()
    
    if (!serviceRequest.serviceType || !serviceRequest.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const result = await createServiceRequest(serviceRequest).unwrap()
      toast.success('Service request submitted successfully!')
      navigate(`/customer/service-request/${result.serviceRequest._id}`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to submit request')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text">Find Local Services</h1>
            <p className="text-text-light mt-2">
              Connect with trusted local professionals for any service you need
            </p>
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
            </div>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-text mb-4">Service Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categoriesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton h-24 rounded-xl"></div>
                ))
              ) : (
                categories?.map((category) => {
                  const Icon = categoryIcons[category.id] || FaPlus
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`p-4 rounded-xl text-center transition-all duration-200
                        ${selectedCategory === category.id 
                          ? 'bg-primary text-white shadow-soft' 
                          : 'bg-white hover:shadow-soft text-text'}`}
                    >
                      <Icon className="text-2xl mx-auto mb-2" />
                      <p className="font-medium text-sm">{category.label}</p>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Providers List */}
          {selectedCategory && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text">Available Providers</h2>
                <button
                  onClick={() => setShowRequestForm(!showRequestForm)}
                  className="btn-primary text-sm py-2"
                >
                  {showRequestForm ? 'Hide Form' : 'Request Service'}
                </button>
              </div>

              {providersLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card mb-4">
                    <div className="skeleton h-24 rounded-xl"></div>
                  </div>
                ))
              ) : providers?.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-text-light">No providers found in this category</p>
                </div>
              ) : (
                providers?.map((provider) => (
                  <div key={provider._id} className="card mb-4 hover:shadow-medium transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-text">{provider.fullName}</h3>
                          <div className="flex items-center text-sm text-yellow-500">
                            <FaStar />
                            <span className="ml-1 text-text-light">
                              {provider.averageRating?.toFixed(1) || 'New'}
                            </span>
                          </div>
                          <span className="text-xs text-text-lighter">
                            ({provider.totalReviews || 0} reviews)
                          </span>
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
                        <p className="text-sm text-text-light mt-2">{provider.about}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {provider.serviceRates?.hourlyRate && (
                          <p className="text-sm text-text-light">
                            £{provider.serviceRates.hourlyRate}/hr
                          </p>
                        )}
                        <Link
                          to={`/provider/${provider._id}`}
                          className="btn-outline text-sm py-1 px-4"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Service Request Form */}
          {showRequestForm && selectedCategory && (
            <div className="card">
              <h2 className="text-xl font-semibold text-text mb-4">Request Service</h2>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Service Type *
                  </label>
                  <input
                    type="text"
                    name="serviceType"
                    value={serviceRequest.serviceType}
                    onChange={handleRequestChange}
                    className="input-field"
                    placeholder="e.g., Plumbing, Tutoring, Caregiving"
                    required
                  />
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

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={serviceRequest.location.address}
                    onChange={handleRequestChange}
                    className="input-field"
                    placeholder="Your address"
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

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <span>{isCreating ? 'Submitting...' : 'Submit Request'}</span>
                  <FaArrowRight />
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