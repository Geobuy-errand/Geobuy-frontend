import React, { useState } from 'react'
import { 
  useGetServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation
} from '../../redux/services/serviceApi'
import { toast } from 'react-hot-toast'
import EmojiPicker from '../../components/utils/EmojiPicker'
import { 
  FaPlus, FaEdit, FaTrash, FaTimes, FaSpinner, FaCheck, 
  FaChevronDown, FaChevronUp, FaSmile 
} from 'react-icons/fa'

const ServiceCategories = () => {
  const { data: categories, isLoading, refetch } = useGetServiceCategoriesQuery()
  const [createCategory] = useCreateServiceCategoryMutation()
  const [updateCategory] = useUpdateServiceCategoryMutation()
  const [deleteCategory] = useDeleteServiceCategoryMutation()

  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    label: '',
    icon: '📋',
    description: '',
    subCategories: [],
    displayOrder: 0,
  })
  const [newSubCategory, setNewSubCategory] = useState('')
  const [expandedCategories, setExpandedCategories] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await updateCategory({ 
          id: editingCategory._id, 
          data: formData 
        }).unwrap()
        toast.success('Category updated successfully 🎉')
      } else {
        await createCategory(formData).unwrap()
        toast.success('Category created successfully 🎉')
      }
      refetch()
      resetForm()
    } catch (error) {
      toast.error(error.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await deleteCategory(id).unwrap()
      toast.success('Category deleted successfully 🗑️')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Delete failed')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      label: category.label,
      icon: category.icon || '📋',
      description: category.description || '',
      subCategories: category.subCategories || [],
      displayOrder: category.displayOrder || 0,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      label: '',
      icon: '📋',
      description: '',
      subCategories: [],
      displayOrder: 0,
    })
    setNewSubCategory('')
  }

  const addSubCategory = () => {
    if (newSubCategory.trim() && !formData.subCategories.includes(newSubCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        subCategories: [...prev.subCategories, newSubCategory.trim()]
      }))
      setNewSubCategory('')
    }
  }

  const removeSubCategory = (subCategory) => {
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.filter(s => s !== subCategory)
    }))
  }

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Service Categories</h1>
          <p className="text-text-light mt-1">Manage service categories and their subcategories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Category</span>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-20 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-text-light text-lg">No service categories found</p>
          <p className="text-sm text-text-lighter mt-2">
            Create your first category to get started
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 btn-primary inline-flex items-center space-x-2"
          >
            <FaPlus />
            <span>Create Category</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{category.icon || '📋'}</span>
                    <div>
                      <h3 className="font-semibold text-text">{category.label}</h3>
                      <p className="text-sm text-text-light">{category.name}</p>
                    </div>
                    {!category.isActive && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                        Inactive
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      Order: {category.displayOrder || 0}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {category.type || 'provider'}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-text-light mt-1">{category.description}</p>
                  )}
                  {category.subCategories && category.subCategories.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleExpand(category._id)}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {expandedCategories.includes(category._id) ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                        {category.subCategories.length} sub-categories
                      </button>
                      {expandedCategories.includes(category._id) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {category.subCategories.map((sub) => (
                            <span
                              key={sub}
                              className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                            >
                              {sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-text">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Icon with Emoji Picker */}
              <div>
                <label className="block text-sm font-medium text-text-light mb-2">
                  Icon
                </label>
                <div className="flex items-center gap-4">
                  <EmojiPicker
                    selectedEmoji={formData.icon}
                    onSelect={(emoji) => setFormData({ ...formData, icon: emoji })}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-text-light">Click the emoji button to select an icon</p>
                    <p className="text-xs text-text-lighter">Choose from hundreds of emojis</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Category Name (unique identifier) *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="input-field"
                  placeholder="e.g., healthcare, trades, professional_services"
                  required
                  disabled={!!editingCategory}
                />
                <p className="text-xs text-text-lighter mt-1">Use lowercase and underscores (e.g., "professional_services")</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Display Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Healthcare Services"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Category Type *
                </label>
                <select
                  value={formData.type || 'provider'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="provider">Service Provider</option>
                  <option value="errand_runner">Errand Runner</option>
                </select>
                <p className="text-xs text-text-lighter mt-1">
                  Service Providers = Professional services (healthcare, trades, etc.)<br />
                  Errand Runners = Task-based services (delivery, shopping, errands)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows="2"
                  placeholder="Brief description of this category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-text-lighter mt-1">Lower numbers appear first</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Sub-Categories
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Add sub-category..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubCategory())}
                  />
                  <button
                    type="button"
                    onClick={addSubCategory}
                    className="btn-primary px-4 py-2 flex items-center gap-1"
                  >
                    <FaPlus className="text-xs" />
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.subCategories.map((sub) => (
                    <span
                      key={sub}
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      {sub.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      <button
                        type="button"
                        onClick={() => removeSubCategory(sub)}
                        className="hover:text-red-600 ml-1"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-text-lighter mt-1">
                  Sub-categories are used to match providers to specific services
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                  <span className="text-lg">
                    {editingCategory ? '✏️' : '✨'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceCategories