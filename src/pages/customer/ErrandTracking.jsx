import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetErrandByIdQuery, useUpdateErrandStatusMutation } from '../../redux/services/errandApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  FaPhone,
  FaCheckCircle,
  FaCircle,
  FaLocationArrow,
  FaBox,
  FaFileAlt,
  FaPills,
  FaTshirt,
  FaUsers,
  FaShoppingBag
} from 'react-icons/fa'

const ErrandTracking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { data: errand, isLoading } = useGetErrandByIdQuery(id)
  const [updateStatus, { isLoading: isUpdating }] = useUpdateErrandStatusMutation()
  const [showLocation, setShowLocation] = useState(false)

  const getServiceIcon = (type) => {
    switch (type) {
      case 'parcel_delivery': return FaBox
      case 'document_delivery': return FaFileAlt
      case 'prescription_pickup': return FaPills
      case 'dry_cleaning_pickup': return FaTshirt
      case 'queue_waiting': return FaUsers
      case 'shopping': return FaShoppingBag
      default: return FaBox
    }
  }

  const statusSteps = [
    { key: 'pending', label: 'Pending', icon: FaCircle },
    { key: 'accepted', label: 'Accepted', icon: FaCheckCircle },
    { key: 'en_route', label: 'En Route', icon: FaLocationArrow },
    { key: 'collected', label: 'Collected', icon: FaBox },
    { key: 'delivered', label: 'Delivered', icon: FaCheckCircle },
  ]

  const getCurrentStepIndex = () => {
    const statusMap = {
      pending: 0,
      accepted: 1,
      en_route: 2,
      collected: 3,
      delivered: 4,
    }
    return statusMap[errand?.status] || 0
  }

  const canUpdateStatus = () => {
    if (!user || !errand) return false
    const isProvider = user._id === errand.providerId?._id
    const isCustomer = user._id === errand.customerId?._id
    
    if (errand.status === 'pending') return false
    if (errand.status === 'delivered' || errand.status === 'cancelled') return false
    
    return isProvider || user.role === 'admin'
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      // Simulate location for demo
      const location = {
        lat: 51.5074 + (Math.random() - 0.5) * 0.01,
        lng: -0.1276 + (Math.random() - 0.5) * 0.01,
      }
      
      await updateStatus({ id, status: newStatus, location }).unwrap()
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update status')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-64 rounded-xl"></div>
        <div className="mt-6 space-y-4">
          <div className="skeleton h-32 rounded-xl"></div>
          <div className="skeleton h-32 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!errand) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Errand not found</p>
        <button onClick={() => navigate('/customer/errands')} className="text-primary hover:underline mt-2">
          Back to errands
        </button>
      </div>
    )
  }

  const ServiceIcon = getServiceIcon(errand.serviceType)
  const currentStep = getCurrentStepIndex()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/customer/errands')}
        className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors mb-6"
      >
        <FaArrowLeft />
        <span>Back to Errands</span>
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ServiceIcon className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Errand #{errand.errandId}</h1>
              <p className="text-text-light capitalize">{errand.serviceType.replace('_', ' ')}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium
            ${errand.status === 'delivered' ? 'bg-green-100 text-green-700' :
              errand.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              errand.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'}`}
          >
            {errand.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-text mb-6">Progress</h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div 
            className="absolute left-5 top-0 w-0.5 bg-primary transition-all duration-500"
            style={{ height: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
          />

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStep
            const isCurrent = index === currentStep
            const Icon = step.icon

            return (
              <div key={step.key} className="flex items-start space-x-4 mb-6 last:mb-0 relative">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10
                  ${isCompleted ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}
                  ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                `}>
                  <Icon className={isCompleted ? 'text-white' : 'text-gray-400'} />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isCompleted ? 'text-text' : 'text-text-light'}`}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-xs text-primary font-medium">Current</span>
                    )}
                  </div>
                  {isCompleted && index < statusSteps.length - 1 && (
                    <p className="text-xs text-text-lighter">
                      {index === 0 && errand.acceptedAt && `Accepted at ${new Date(errand.acceptedAt).toLocaleTimeString()}`}
                      {index === 1 && errand.enRouteAt && `En route at ${new Date(errand.enRouteAt).toLocaleTimeString()}`}
                      {index === 2 && errand.collectedAt && `Collected at ${new Date(errand.collectedAt).toLocaleTimeString()}`}
                      {index === 3 && errand.deliveredAt && `Delivered at ${new Date(errand.deliveredAt).toLocaleTimeString()}`}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Location & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-primary" />
            Location
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-text-light">Pickup</span>
              <p className="text-text">{errand.pickup?.address}</p>
              {errand.pickup?.instructions && (
                <p className="text-sm text-text-lighter mt-1">📝 {errand.pickup.instructions}</p>
              )}
            </div>
            {errand.dropoff?.address && (
              <div>
                <span className="text-sm text-text-light">Dropoff</span>
                <p className="text-text">{errand.dropoff.address}</p>
                {errand.dropoff?.instructions && (
                  <p className="text-sm text-text-lighter mt-1">📝 {errand.dropoff.instructions}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Provider Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <FaUser className="mr-2 text-primary" />
            {errand.providerId ? 'Provider' : 'Status'}
          </h2>
          {errand.providerId ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaUser className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text">{errand.providerId.fullName}</p>
                  <p className="text-sm text-text-light">⭐ {errand.providerId.averageRating?.toFixed(1) || 'New'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-light">
                <FaPhone className="text-text-lighter" />
                <span>{errand.providerId.phoneNumber}</span>
              </div>
            </div>
          ) : (
            <p className="text-text-light">Waiting for a provider to accept</p>
          )}
        </div>
      </div>

      {/* Task Details */}
      {errand.taskDetails && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-text mb-2">Task Details</h2>
          <p className="text-text-light">{errand.taskDetails}</p>
        </div>
      )}

      {/* Action Buttons */}
      {canUpdateStatus() && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-text mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-3">
            {errand.status === 'accepted' && (
              <button
                onClick={() => handleStatusUpdate('en_route')}
                disabled={isUpdating}
                className="btn-primary text-sm py-2"
              >
                Mark as En Route
              </button>
            )}
            {errand.status === 'en_route' && (
              <button
                onClick={() => handleStatusUpdate('collected')}
                disabled={isUpdating}
                className="btn-primary text-sm py-2"
              >
                Mark as Collected
              </button>
            )}
            {errand.status === 'collected' && (
              <button
                onClick={() => handleStatusUpdate('delivered')}
                disabled={isUpdating}
                className="btn-primary text-sm py-2"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Location (Optional) */}
      {errand.requiresLiveTracking && errand.status !== 'pending' && (
        <div className="card mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text flex items-center">
              <FaLocationArrow className="mr-2 text-primary" />
              Live Location
            </h2>
            <button
              onClick={() => setShowLocation(!showLocation)}
              className="text-primary hover:underline text-sm"
            >
              {showLocation ? 'Hide' : 'Show'}
            </button>
          </div>
          {showLocation && (
            <div className="mt-4 h-64 bg-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <FaMapMarkerAlt className="text-4xl text-primary mx-auto mb-2" />
                <p className="text-text-light">Live location tracking coming soon</p>
                <p className="text-sm text-text-lighter">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ErrandTracking