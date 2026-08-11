import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaCheck, FaSpinner, FaCrown, FaCalendar, FaClock } from 'react-icons/fa'
import { useGetActivePlansQuery } from '../redux/services/subscriptionPlanApi'
import { useCreateCheckoutSessionMutation, useGetSubscriptionStatusQuery } from '../redux/services/subscriptionApi'
import { toast } from 'react-hot-toast'
import SignupModal from '../components/modals/SignupModal'

const Pricing = () => {
  const { user } = useSelector((state) => state.auth)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const { data: plans, isLoading: plansLoading } = useGetActivePlansQuery()
  const { data: statusData } = useGetSubscriptionStatusQuery()
  const [createCheckout] = useCreateCheckoutSessionMutation()

  const isSubscribed = statusData?.isSubscribed || false
  const subscriptionStatus = statusData?.status || 'inactive'
  const currentPlan = statusData?.plan || null

  const handleSubscribe = async (planId) => {
    if (!user) {
      setIsSignupModalOpen(true)
      return
    }

    setIsProcessing(true)
    try {
      const result = await createCheckout({
        planId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/pricing`,
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

  const getPlanIcon = (plan) => {
    if (plan.name?.toLowerCase().includes('monthly')) return <FaCalendar className="text-blue-500" />
    if (plan.name?.toLowerCase().includes('yearly')) return <FaCalendar className="text-purple-500" />
    if (plan.name?.toLowerCase().includes('6 month') || plan.name?.toLowerCase().includes('six')) return <FaClock className="text-orange-500" />
    return <FaCrown />
  }

  const getIntervalLabel = (plan) => {
    if (plan.metadata?.billingPeriod === '6_months') return '6 months'
    if (plan.interval === 'month') return 'month'
    if (plan.interval === 'year') return 'year'
    return plan.interval
  }

  const getSavings = (plan) => {
    if (plan.metadata?.savings) return plan.metadata.savings
    if (plan.interval === 'year') return '38%'
    return null
  }

  const isActive = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'

  if (plansLoading) {
    return (
      <div className="py-12">
        <div className="container-custom">
          <div className="flex items-center justify-center h-64">
            <FaSpinner className="animate-spin text-primary text-3xl" />
          </div>
        </div>
      </div>
    )
  }

  // Sort plans by displayOrder or price
  const sortedPlans = plans ? [...plans].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) : []

  return (
    <div className="py-12">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h1 className="section-title">Simple, Transparent Pricing</h1>
          <p className="section-subtitle">
            Choose the plan that works best for you. No hidden fees, cancel anytime.
          </p>
          {isActive && (
            <div className="mt-4 inline-block p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">
                ✅ You are currently subscribed to the {currentPlan?.name || 'Active'} plan
              </p>
              <p className="text-sm text-green-600">
                Next billing: {new Date(statusData.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {sortedPlans.map((plan) => {
            const isCurrentPlan = isActive && currentPlan?._id === plan._id
            const featureList = Object.entries(plan.features || {})
            const savings = getSavings(plan)

            return (
              <div
                key={plan._id}
                className={`card relative ${plan.isPopular ? 'border-2 border-primary shadow-large' : ''} ${
                  isCurrentPlan ? 'border-2 border-primary shadow-large' : ''
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                )}
                {isCurrentPlan && (
                  <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-semibold">
                    Current Plan
                  </span>
                )}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 text-3xl mb-2">
                    {getPlanIcon(plan)}
                  </div>
                  <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-text">£{plan.price}</span>
                    <span className="text-text-light text-sm">/{getIntervalLabel(plan)}</span>
                  </div>
                  {savings && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Save {savings} compared to monthly
                    </p>
                  )}
                  {plan.description && (
                    <p className="text-text-light text-sm mt-2">{plan.description}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {featureList.map(([key, value]) => (
                    <li key={key} className="flex items-start space-x-3">
                      <FaCheck className="text-primary mt-1 flex-shrink-0" />
                      <span className="text-text-light text-sm">
                        {typeof value === 'boolean' 
                          ? key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          : value
                        }
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <Link
                    to="/subscription"
                    className="w-full block text-center py-3 rounded-xl font-medium transition-colors btn-primary"
                  >
                    Manage Subscription
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan._id)}
                    disabled={isProcessing}
                    className={`w-full block text-center py-3 rounded-xl font-medium transition-colors
                      ${plan.isPopular
                        ? 'btn-primary'
                        : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isProcessing ? (
                      <FaSpinner className="animate-spin mx-auto" />
                    ) : (
                      'Start 7-Day Free Trial'
                    )}
                  </button>
                )}
                {!isCurrentPlan && (
                  <p className="text-xs text-text-lighter mt-4 text-center">
                    7-day free trial • Cancel anytime
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-text-light text-sm">
            All plans include a 7-day free trial. No questions asked.
          </p>
          <p className="text-text-light text-sm mt-2">
            For errand runners: We take a 20% service fee on each completed errand.
          </p>
        </div>

        <div className="mt-8 bg-gray-50 rounded-2xl p-6 text-center">
          <p className="text-text-light">
            Need a custom plan?{' '}
            <Link to="/contact" className="text-primary hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="text-center p-4">
            <h4 className="font-semibold text-text">💳 Secure Payment</h4>
            <p className="text-sm text-text-light">All payments are processed securely via Stripe</p>
          </div>
          <div className="text-center p-4">
            <h4 className="font-semibold text-text">🔄 Cancel Anytime</h4>
            <p className="text-sm text-text-light">No long-term contracts, cancel with one click</p>
          </div>
          <div className="text-center p-4">
            <h4 className="font-semibold text-text">🎯 100% Satisfaction</h4>
            <p className="text-sm text-text-light">Love your subscription or get a full refund</p>
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </div>
  )
}

export default Pricing