import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGetServicesQuery } from '../redux/services/serviceApi'
import { FaSearch, FaRunning, FaHandsHelping, FaArrowRight, FaInfoCircle } from 'react-icons/fa'
import SignupModal from '../components/modals/SignupModal'
import { useSelector } from 'react-redux'

const Services = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: services, isLoading } = useGetServicesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('errands')
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  // Part 1: Errands & Deliveries
  const errandCategories = [
    'shopping',
    'groceries',
    'pharmacy',
    'retail',
    'food_pickup',
    'parcel_delivery',
    'document_delivery',
    'dry_cleaning',
    'key_collection',
    'bill_payments',
    'queue_standing',
    'school_pickup',
    'pet_assistance',
    'elderly_shopping',
    'appointment_assistance',
    'business_deliveries',
    'custom',
  ]

  // Part 2: Local Services
  const serviceCategories = [
    'basic_care_and_support',
    'plumbing',
    'electrical',
    'barbing',
    'masseuse',
    'nail_tech',
    'hairdressing',
    'tutoring',
    'cleaning',
    'gardening',
    'painting',
    'carpentry',
    'legal',
    'accounting',
    'personal_trainer',
    'beauty',
    'other_services',
  ]

  const getCategoryLabel = (category) => {
    const labels = {
      'shopping': 'Shopping',
      'groceries': 'Groceries',
      'pharmacy': 'Pharmacy',
      'retail': 'Retail',
      'food_pickup': 'Food Pickup',
      'parcel_delivery': 'Parcel Delivery',
      'document_delivery': 'Document Delivery',
      'dry_cleaning': 'Dry Cleaning',
      'key_collection': 'Key Collection',
      'bill_payments': 'Bill Payments',
      'queue_standing': 'Queue Standing',
      'school_pickup': 'School Pickup',
      'pet_assistance': 'Pet Assistance',
      'elderly_shopping': 'Elderly Shopping',
      'appointment_assistance': 'Appointment Assistance',
      'business_deliveries': 'Business Deliveries',
      'custom': 'Custom',
      'basic_care_and_support': 'Care & Domestic Support',
      'plumbing': 'Plumbing Services',
      'electrical': 'Electrical Services',
      'barbing': 'Barbing/Haircut',
      'masseuse': 'Massage Therapy',
      'nail_tech': 'Nail Technician',
      'hairdressing': 'Hairdressing',
      'tutoring': 'Tutoring',
      'cleaning': 'Cleaning Services',
      'gardening': 'Gardening',
      'painting': 'Painting Services',
      'carpentry': 'Carpentry',
      'legal': 'Legal Services',
      'accounting': 'Accounting',
      'personal_trainer': 'Personal Training',
      'beauty': 'Beauty Services',
      'other_services': 'Other Services',
    }
    return labels[category] || category
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      'shopping': '🛍️',
      'groceries': '🛒',
      'pharmacy': '💊',
      'retail': '🏪',
      'food_pickup': '🍕',
      'parcel_delivery': '📦',
      'document_delivery': '📄',
      'dry_cleaning': '👔',
      'key_collection': '🔑',
      'bill_payments': '💳',
      'queue_standing': '👥',
      'school_pickup': '🏫',
      'pet_assistance': '🐕',
      'elderly_shopping': '👴',
      'appointment_assistance': '📋',
      'business_deliveries': '🏢',
      'custom': '📌',
      'basic_care_and_support': '❤️',
      'plumbing': '🔧',
      'electrical': '⚡',
      'barbing': '✂️',
      'masseuse': '💆',
      'nail_tech': '💅',
      'hairdressing': '💇',
      'tutoring': '📚',
      'cleaning': '🧹',
      'gardening': '🌱',
      'painting': '🎨',
      'carpentry': '🪚',
      'legal': '⚖️',
      'accounting': '📊',
      'personal_trainer': '🏋️',
      'beauty': '💄',
      'other_services': '📋',
    }
    return emojis[category] || '📋'
  }

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesCategory = false
    if (selectedCategory === 'all') {
      matchesCategory = true
    } else if (activeTab === 'errands' && errandCategories.includes(selectedCategory)) {
      matchesCategory = service.category === selectedCategory
    } else if (activeTab === 'services' && serviceCategories.includes(selectedCategory)) {
      matchesCategory = service.category === selectedCategory
    }
    
    return matchesSearch && matchesCategory
  })

  // Get services by tab
  const getServicesByTab = () => {
    if (!services) return []
    
    if (activeTab === 'errands') {
      return filteredServices?.filter(service => errandCategories.includes(service.category))
    } else {
      return filteredServices?.filter(service => serviceCategories.includes(service.category))
    }
  }

  const tabServices = getServicesByTab()

  // Category buttons for current tab
  const getCategoryButtons = () => {
    if (activeTab === 'errands') {
      return ['all', ...errandCategories]
    } else {
      return ['all', ...serviceCategories]
    }
  }

  const categoryButtons = getCategoryButtons()

  // Handle service request action
  const handleRequestService = (service) => {
    if (!user) {
      setIsSignupModalOpen(true)
      return
    }
    
    // If user is logged in but not a customer, redirect to find-services
    if (user.role === 'customer') {
      navigate('/find-services', { 
        state: { 
          selectedCategory: service.category,
          serviceName: service.name,
          serviceId: service._id 
        } 
      })
    } else {
      // For other roles, redirect to find-services
      navigate('/find-services')
    }
  }

  // Handle book errand action
  const handleBookErrand = (service) => {
    if (!user) {
      setIsSignupModalOpen(true)
      return
    }
    
    if (user.role === 'customer') {
      navigate('/customer/create-errand', { 
        state: {
          selectedService: service,
          serviceId: service._id,
          serviceName: service.name 
        } 
      })
    } else {
      navigate('/customer/create-errand')
    }
  }

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="section-title">Our Services</h1>
          <p className="section-subtitle">
            Choose from a wide range of services offered by verified local providers.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 overflow-x-auto">
          <div className="bg-gray-100 rounded-xl p-1 flex flex-nowrap">
            <button
              onClick={() => {
                setActiveTab('errands')
                setSelectedCategory('all')
              }}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap
                ${activeTab === 'errands' 
                  ? 'bg-primary text-white shadow-soft' 
                  : 'text-text-light hover:bg-gray-200'}`}
            >
              <FaRunning className="text-sm sm:text-base" />
              <span className="text-xs sm:text-sm">Part 1: Errands & Deliveries</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('services')
                setSelectedCategory('all')
              }}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 whitespace-nowrap
                ${activeTab === 'services' 
                  ? 'bg-primary text-white shadow-soft' 
                  : 'text-text-light hover:bg-gray-200'}`}
            >
              <FaHandsHelping className="text-sm sm:text-base" />
              <span className="text-xs sm:text-sm">Part 2: Local Services</span>
            </button>
          </div>
        </div>

        {/* Tab Description */}
        <div className="text-center mb-8">
          {activeTab === 'errands' ? (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-blue-700 text-sm sm:text-base">
                <strong>Errands & Deliveries:</strong> Shopping, groceries, pharmacy, parcel delivery, 
                document delivery, dry cleaning, and more.
              </p>
            </div>
          ) : (
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <p className="text-purple-700 text-sm sm:text-base">
                <strong>Local Services:</strong> Care & support, plumbing, electrical, barbing, 
                massage, nail tech, hairdressing, tutoring, cleaning, and more.
              </p>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-200 bg-white"
            />
          </div>
        </div>

        {/* Category Filters - Scrollable */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex flex-wrap gap-2 pb-2 min-w-max">
            {categoryButtons.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                  ${selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-light hover:bg-gray-200'
                  }`}
              >
                {category === 'all' ? 'All' : getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card">
                <div className="skeleton h-48 rounded-xl"></div>
                <div className="skeleton h-6 w-3/4 mt-4"></div>
                <div className="skeleton h-4 w-full mt-2"></div>
                <div className="skeleton h-4 w-2/3 mt-2"></div>
              </div>
            ))}
          </div>
        ) : tabServices?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No services found matching your criteria.</p>
            <p className="text-sm text-text-lighter mt-2">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Show count */}
            <p className="text-sm text-text-light mb-4">
              Showing {tabServices.length} {activeTab === 'errands' ? 'errand' : 'service'} {tabServices.length === 1 ? 'provider' : 'providers'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tabServices?.map((service) => {
                const isErrand = errandCategories.includes(service.category)
                const isService = serviceCategories.includes(service.category)
                
                return (
                  <div key={service._id} className="card hover:shadow-large transition-shadow">
                    <div className="text-4xl mb-4">{getCategoryEmoji(service.category) || service.icon || '📋'}</div>
                    <h3 className="text-lg font-semibold text-text mb-2">{service.name}</h3>
                    <p className="text-text-light text-sm mb-4">{service.description}</p>
                    
                    {/* Pricing Info - No fixed price, only service fee and negotiation */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <FaInfoCircle className="text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          {isErrand ? (
                            <>
                              <p className="text-sm text-text-light">
                                <span className="font-medium">Distance-based pricing:</span> £3.50 base + £1.60/mile
                              </p>
                              <p className="text-xs text-text-lighter mt-1">
                                📍 Price calculated based on distance
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-text-light">
                                <span className="font-medium">Service Fee:</span> £1.99 (GEOBUY fee)
                              </p>
                              <p className="text-xs text-text-lighter mt-1">
                                💬 Service price is negotiated directly between you and the provider
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isErrand ? (
                      <button
                        onClick={() => handleBookErrand(service)}
                        className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-1"
                      >
                        <span>Book Errand</span>
                        <FaArrowRight className="text-xs" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequestService(service)}
                        className="w-full btn-primary text-sm py-2 flex items-center justify-center space-x-1"
                      >
                        <span>Request Service</span>
                        <FaArrowRight className="text-xs" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Signup Modal */}
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </div>
  )
}

export default Services