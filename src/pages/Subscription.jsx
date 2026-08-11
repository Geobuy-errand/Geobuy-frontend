import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { 
  FaCheck, 
  FaSpinner, 
  FaCrown, 
  FaStar, 
  FaRocket,
  FaCalendar,
} from 'react-icons/fa'
import {
  useGetActivePlansQuery,
} from '../redux/services/subscriptionPlanApi'
import {
  useCreateCheckoutSessionMutation,
  useCancelSubscriptionMutation,
  useResumeSubscriptionMutation,
  useGetSubscriptionStatusQuery,
} from '../redux/services/subscriptionApi'

const Subscription = () => {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  // RTK Query hooks
  const { data: plansData, isLoading: plansLoading, refetch: refetchPlans } = useGetActivePlansQuery()
  const { data: statusData, refetch: refetchStatus } = useGetSubscriptionStatusQuery()
  const [createCheckout] = useCreateCheckoutSessionMutation()
  const [cancelSubscription] = useCancelSubscriptionMutation()
  const [resumeSubscription] = useResumeSubscriptionMutation()

  const plans = plansData || []
  const isSubscribed = statusData?.isSubscribed || false
  const subscriptionStatus = statusData?.status || 'inactive'
  const currentPlan = statusData?.plan || null

  const handleSubscribe = async (planId) => {
    setIsProcessing(true)
    try {
      const result = await createCheckout({
        planId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`,
      }).unwrap()

      if (result.sessionUrl) {
        window.location.href = result.sessionUrl
      }
    } catch (error) {
      toast.error(error.data?.message || 'Failed to start subscription')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return

    try {
      await cancelSubscription().unwrap()
      toast.success('Subscription will be cancelled at end of billing period')
      refetchPlans()
      refetchStatus()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to cancel subscription')
    }
  }

  const handleResume = async () => {
    try {
      await resumeSubscription().unwrap()
      toast.success('Subscription resumed successfully')
      refetchPlans()
      refetchStatus()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to resume subscription')
    }
  }

  const getPlanIcon = (interval) => {
    if (interval === 'month') return <FaCalendar className="text-blue-500" />
    if (interval === 'year') return <FaCalendar className="text-purple-500" />
    return <FaStar />
  }

  const getIntervalLabel = (interval) => {
    return interval === 'month' ? 'month' : 'year'
  }

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-3xl" />
      </div>
    )
  }

  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-text">
          Choose Your Plan
        </h1>
        <p className="text-text-light mt-2">
          Get discounts on all errands with a subscription. Cancel anytime.
        </p>
        {isActive && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg inline-block">
            <p className="text-green-700 font-medium">
              ✅ You are currently subscribed to the {currentPlan?.name || 'Active'} plan
            </p>
            <p className="text-sm text-green-600">
              {statusData?.cancelAtPeriodEnd ? (
                <>
                  Cancels on {new Date(statusData.currentPeriodEnd).toLocaleDateString()}
                  <button 
                    onClick={handleResume}
                    className="ml-3 text-primary hover:underline"
                  >
                    Resume Subscription
                  </button>
                </>
              ) : (
                <>
                  Next billing: {new Date(statusData.currentPeriodEnd).toLocaleDateString()}
                  <button 
                    onClick={handleCancel}
                    className="ml-3 text-red-600 hover:underline"
                  >
                    Cancel
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = isActive && currentPlan?._id === plan._id
          const featureList = Object.entries(plan.features || {})

          return (
            <div
              key={plan._id}
              className={`card hover:shadow-large transition-shadow ${
                isCurrentPlan ? 'border-2 border-primary shadow-large' : ''
              } ${plan.isPopular ? 'relative' : ''}`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              {isCurrentPlan && (
                <span className="inline-block bg-primary text-white text-xs px-3 py-1 rounded-full mb-4">
                  Current Plan
                </span>
              )}
              <div className="flex items-center space-x-2 text-3xl mb-4">
                {getPlanIcon(plan.interval)}
              </div>
              <h3 className="text-xl font-bold text-text">{plan.name}</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                £{plan.price}
                <span className="text-sm font-normal text-text-light">
                  /{getIntervalLabel(plan.interval)}
                </span>
              </p>
              {plan.description && (
                <p className="text-sm text-text-light mt-1">{plan.description}</p>
              )}

              <ul className="mt-6 space-y-3">
                {featureList.map(([key, value]) => (
                  <li key={key} className="flex items-start space-x-2">
                    <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-light">
                      {typeof value === 'boolean' 
                        ? key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : value
                      }
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {isCurrentPlan ? (
                  <>
                    {statusData?.cancelAtPeriodEnd ? (
                      <button
                        onClick={handleResume}
                        className="w-full btn-primary"
                      >
                        Resume Subscription
                      </button>
                    ) : (
                      <button
                        onClick={handleCancel}
                        className="w-full border-2 border-red-500 text-red-500 px-4 py-3 rounded-xl font-medium hover:bg-red-500 hover:text-white transition-colors"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={isProcessing}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <FaSpinner className="animate-spin mx-auto" />
                    ) : (
                      'Start 7-Day Free Trial'
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-text-lighter mt-4 text-center">
                7-day free trial • Cancel anytime
              </p>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default Subscription