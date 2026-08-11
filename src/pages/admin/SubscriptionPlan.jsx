import React, { useState } from 'react'
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaSpinner, FaSeedling } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import {
  useGetAllPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useTogglePlanStatusMutation,
  useSeedPlansMutation,
} from '../../redux/services/subscriptionPlanApi'

const SubscriptionPlans = () => {
  const { data: plans, isLoading, refetch } = useGetAllPlansQuery()
  const [createPlan] = useCreatePlanMutation()
  const [updatePlan] = useUpdatePlanMutation()
  const [deletePlan] = useDeletePlanMutation()
  const [togglePlan] = useTogglePlanStatusMutation()
  const [seedPlans, { isLoading: isSeeding }] = useSeedPlansMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    interval: 'month',
    price: '',
    stripePriceId: '',
    isActive: true,
    isPopular: false,
    displayOrder: 0,
    features: {
      unlimited_errands: true,
      priority_support: false,
      discount: 20,
      advanced_tracking: true,
      business_analytics: false,
      dedicated_account_manager: false,
    },
  })

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        interval: plan.interval || 'month',
        price: plan.price || '',
        stripePriceId: plan.stripePriceId || '',
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        isPopular: plan.isPopular || false,
        displayOrder: plan.displayOrder || 0,
        features: {
          unlimited_errands: plan.features?.unlimited_errands || false,
          priority_support: plan.features?.priority_support || false,
          discount: plan.features?.discount || 0,
          advanced_tracking: plan.features?.advanced_tracking || false,
          business_analytics: plan.features?.business_analytics || false,
          dedicated_account_manager: plan.features?.dedicated_account_manager || false,
        },
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        description: '',
        interval: 'month',
        price: '',
        stripePriceId: '',
        isActive: true,
        isPopular: false,
        displayOrder: 0,
        features: {
          unlimited_errands: true,
          priority_support: false,
          discount: 20,
          advanced_tracking: true,
          business_analytics: false,
          dedicated_account_manager: false,
        },
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingPlan(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        displayOrder: parseInt(formData.displayOrder),
      }

      if (editingPlan) {
        await updatePlan({ id: editingPlan._id, data: submitData }).unwrap()
        toast.success('Plan updated successfully')
      } else {
        await createPlan(submitData).unwrap()
        toast.success('Plan created successfully')
      }
      refetch()
      handleCloseModal()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save plan')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return
    try {
      await deletePlan(id).unwrap()
      toast.success('Plan deleted successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete plan')
    }
  }

  const handleToggle = async (id) => {
    try {
      await togglePlan(id).unwrap()
      toast.success('Plan status toggled')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to toggle plan')
    }
  }

  const handleSeed = async () => {
    if (!window.confirm('This will create default plans if none exist. Continue?')) return
    try {
      await seedPlans().unwrap()
      toast.success('Default plans seeded successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to seed plans')
    }
  }

  const formatFeatureKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Subscription Plans</h1>
          <p className="text-text-light mt-1">Manage subscription plans shown to users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
          >
            <FaSeedling />
            <span>{isSeeding ? 'Seeding...' : 'Seed Default'}</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-20 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : plans?.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-light">No subscription plans found</p>
          <button
            onClick={handleSeed}
            className="mt-4 text-primary hover:underline"
          >
            Seed default plans
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {plans.map((plan) => (
            <div key={plan._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                    <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      plan.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {plan.isPopular && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        ★ Popular
                      </span>
                    )}
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                      {plan.interval}
                    </span>
                  </div>
                  <p className="text-sm text-text-light mt-1">{plan.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xl font-bold text-primary">£{plan.price}</span>
                    <span className="text-sm text-text-light">/{plan.interval}</span>
                    <span className="text-sm text-text-light">
                      Stripe ID: {plan.stripePriceId}
                    </span>
                    <span className="text-sm text-text-light">
                      Order: {plan.displayOrder}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Object.entries(plan.features || {}).map(([key, value]) => (
                      <span key={key} className={`text-xs px-2 py-1 rounded-full ${
                        value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {formatFeatureKey(key)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(plan._id)}
                    className="text-text-light hover:text-primary transition-colors"
                  >
                    {plan.isActive ? <FaToggleOn className="text-2xl text-primary" /> : <FaToggleOff className="text-2xl" />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-text">
                {editingPlan ? 'Edit Plan' : 'Create Plan'}
              </h2>
              <button onClick={handleCloseModal} className="text-text-light hover:text-text">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Plan Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Price (£) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Interval *</label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    className="input-field"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Stripe Price ID *</label>
                  <input
                    type="text"
                    value={formData.stripePriceId}
                    onChange={(e) => setFormData({ ...formData, stripePriceId: e.target.value })}
                    className="input-field"
                    placeholder="price_xxxxxxxxxx"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="input-field"
                    min="0"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="text-sm">Popular</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-text mb-3">Features</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(formData.features).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: { ...formData.features, [key]: e.target.checked }
                        })}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={handleCloseModal} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SubscriptionPlans