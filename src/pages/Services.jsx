import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetServicesQuery } from '../redux/services/serviceApi'
import { FaSearch } from 'react-icons/fa'

const Services = () => {
  const { data: services, isLoading } = useGetServicesQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    'all',
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

  const filteredServices = services?.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="section-title">Our Services</h1>
          <p className="section-subtitle">
            Choose from a wide range of errand services offered by verified local providers.
          </p>
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
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-light hover:bg-gray-200'
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
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
        ) : filteredServices?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-light">No services found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices?.map((service) => (
              <div key={service._id} className="card hover:shadow-large transition-shadow">
                <div className="text-4xl mb-4">{service.icon || '📋'}</div>
                <h3 className="text-lg font-semibold text-text mb-2">{service.name}</h3>
                <p className="text-text-light text-sm mb-4">{service.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-lighter">Starting from</p>
                    <p className="text-xl font-bold text-primary">£{service.basePrice}</p>
                  </div>
                  <Link
                    to={`/register/customer`}
                    className="btn-primary text-sm py-2"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Services