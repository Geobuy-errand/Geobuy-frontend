import React, { useState, useEffect } from 'react'
import { 
  useGetServicesQuery, 
  useCreateServiceMutation, 
  useUpdateServiceMutation, 
  useDeleteServiceMutation 
} from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, FaSpinner, FaToggleOn, FaToggleOff 
} from 'react-icons/fa'
import Pagination from '../../components/utils/Pagination'

const ServiceDefinitions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    basePrice: '',
    pricePerKm: '0',
    minPrice: '',
    maxPrice: '',
    estimatedTime: '',
    icon: '📋',
    isPopular: false,
    isActive: true,
    requiresDBS: false,
  })

  const { data: services, isLoading, refetch } = useGetServicesQuery()
  const [createService] = useCreateServiceMutation()
  const [updateService] = useUpdateServiceMutation()
  const [deleteService] = useDeleteServiceMutation()

  const categories = [
    'shopping', 'groceries', 'pharmacy', 'retail', 'food_pickup',
    'parcel_delivery', 'document_delivery', 'dry_cleaning', 'key_collection',
    'bill_payments', 'queue_standing', 'school_pickup', 'pet_assistance',
    'elderly_shopping', 'appointment_assistance', 'business_deliveries',
    'basic_care_and_support', 'plumbing', 'electrical', 'barbing',
    'masseuse', 'nail_tech', 'hairdressing', 'tutoring', 'cleaning',
    'gardening', 'painting', 'carpentry', 'legal', 'accounting',
    'personal_trainer', 'beauty', 'other_services', 'custom'
  ]

  const iconOptions = ['🛒', '💊', '📦', '🍕', '📄', '👴', '👔', '🔑', '💳', '👥', '🏫', '🐕', '📋', '❤️', '🔧', '⚡', '✂️', '💆', '💅', '💇', '📚', '🧹', '🌱', '🎨', '🪚', '⚖️', '📊', '🏋️', '💄']

  const filteredServices = services?.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedData = filteredServices?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || []

  const totalPages = Math.ceil((filteredServices?.length || 0) / itemsPerPage)

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name || '',
        category: service.category || '',
        description: service.description || '',
        basePrice: service.basePrice || '',
        pricePerKm: service.pricePerKm || '0',
        minPrice: service.minPrice || '',
        maxPrice: service.maxPrice || '',
        estimatedTime: service.estimatedTime || '',
        icon: service.icon || '📋',
        isPopular: service.isPopular || false,
        isActive: service.isActive !== undefined ? service.isActive : true,
        requiresDBS: service.requiresDBS || false,
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        category: '',
        description: '',
        basePrice: '',
        pricePerKm: '0',
        minPrice: '',
        maxPrice: '',
        estimatedTime: '',
        icon: '📋',
        isPopular: false,
        isActive: true,
        requiresDBS: false,
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        pricePerKm: parseFloat(formData.pricePerKm) || 0,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : undefined,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : undefined,
        estimatedTime: parseInt(formData.estimatedTime),
      }

      if (editingService) {
        await updateService({ id: editingService._id, data: submitData }).unwrap()
        toast.success('Service updated successfully')
      } else {
        await createService(submitData).unwrap()
        toast.success('Service created successfully')
      }
      refetch()
      setIsModalOpen(false)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save service')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return
    try {
      await deleteService(id).unwrap()
      toast.success('Service deleted successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete service')
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      'shopping': 'Shopping', 'groceries': 'Groceries', 'pharmacy': 'Pharmacy',
      'retail': 'Retail', 'food_pickup': 'Food Pickup', 'parcel_delivery': 'Parcel Delivery',
      'document_delivery': 'Document Delivery', 'dry_cleaning': 'Dry Cleaning',
      'key_collection': 'Key Collection', 'bill_payments': 'Bill Payments',
      'queue_standing': 'Queue Standing', 'school_pickup': 'School Pickup',
      'pet_assistance': 'Pet Assistance', 'elderly_shopping': 'Elderly Shopping',
      'appointment_assistance': 'Appointment Assistance', 'business_deliveries': 'Business Deliveries',
      'basic_care_and_support': 'Care & Support', 'plumbing': 'Plumbing',
      'electrical': 'Electrical', 'barbing': 'Barbing', 'masseuse': 'Massage',
      'nail_tech': 'Nail Tech', 'hairdressing': 'Hairdressing', 'tutoring': 'Tutoring',
      'cleaning': 'Cleaning', 'gardening': 'Gardening', 'painting': 'Painting',
      'carpentry': 'Carpentry', 'legal': 'Legal', 'accounting': 'Accounting',
      'personal_trainer': 'Personal Trainer', 'beauty': 'Beauty',
      'other_services': 'Other Services', 'custom': 'Custom'
    }
    return labels[category] || category
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Service Definitions</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Service</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
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
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-20 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-light">No services found</p>
          <button onClick={() => handleOpenModal()} className="text-primary hover:underline mt-2">
            Add your first service
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedData.map((service) => (
              <div key={service._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{service.icon || '📋'}</div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-text">{service.name}</h3>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {getCategoryLabel(service.category)}
                        </span>
                        {service.isPopular && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            ★ Popular
                          </span>
                        )}
                        {service.requiresDBS && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            DBS Required
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-text-light mt-1">{service.description}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className="text-text-light">Base: <span className="font-medium text-primary">£{service.basePrice}</span></span>
                        <span className="text-text-light">Per Km: <span className="font-medium">£{service.pricePerKm}</span></span>
                        <span className="text-text-light">Est. Time: <span className="font-medium">{service.estimatedTime} min</span></span>
                        {service.minPrice && <span className="text-text-light">Min: £{service.minPrice}</span>}
                        {service.maxPrice && <span className="text-text-light">Max: £{service.maxPrice}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredServices?.length || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-light hover:text-text">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Service Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Icon</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="input-field"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Estimated Time (minutes) *</label>
                  <input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    className="input-field"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Base Price (£) *</label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Price Per Km (£)</label>
                  <input
                    type="number"
                    value={formData.pricePerKm}
                    onChange={(e) => setFormData({ ...formData, pricePerKm: e.target.value })}
                    className="input-field"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Min Price (£)</label>
                  <input
                    type="number"
                    value={formData.minPrice}
                    onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                    className="input-field"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Max Price (£)</label>
                  <input
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                    className="input-field"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="input-field resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-text-light">Popular</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-text-light">Active</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.requiresDBS}
                    onChange={(e) => setFormData({ ...formData, requiresDBS: e.target.checked })}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-text-light">Requires DBS</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-outline">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceDefinitions