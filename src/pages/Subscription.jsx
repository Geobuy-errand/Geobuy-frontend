import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  FaCheck,
  FaSpinner,
  FaStar,
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

  const [processingPlanId, setProcessingPlanId] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // RTK Query hooks
  const {
    data: plansData,
    isLoading: plansLoading,
    refetch: refetchPlans,
  } = useGetActivePlansQuery()

  const {
    data: statusData,
    refetch: refetchStatus,
  } = useGetSubscriptionStatusQuery()

  const [createCheckout] = useCreateCheckoutSessionMutation()
  const [cancelSubscription] = useCancelSubscriptionMutation()
  const [resumeSubscription] = useResumeSubscriptionMutation()

  const plans = plansData || []

  const isSubscribed = statusData?.isSubscribed || false
  const subscriptionStatus = statusData?.status || 'inactive'
  const currentPlan = statusData?.plan || null

  const handleSubscribe = async (planId) => {
    setProcessingPlanId(planId)

    try {
      const result = await createCheckout({
        planId,
        successUrl: `${window.location.origin}/${user?.role || 'customer'}/subscriptions/success`,
        cancelUrl: `${window.location.origin}/${user?.role || 'customer'}/subscriptions/cancel`,
      }).unwrap()

      if (result.sessionUrl) {
        window.location.href = result.sessionUrl
      }
    } catch (error) {
      // Handle subscription conflict errors
      if (
        error.data?.message?.includes(
          'already have an active subscription'
        )
      ) {
        toast.error('You already have an active subscription')
        refetchStatus()
      } else if (error.data?.canResume) {
        toast.info(
          'You have a canceled subscription that can be resumed'
        )
      } else {
        toast.error(
          error.data?.message || 'Failed to start subscription'
        )
      }
    } finally {
      setProcessingPlanId(null)
    }
  }

  // Cancel subscription
  const handleCancel = async () => {
    setIsCancelling(true)

    try {
      await cancelSubscription().unwrap()

      toast.success(
        'Subscription will be cancelled at end of billing period'
      )

      setShowCancelModal(false)

      refetchPlans()
      refetchStatus()
    } catch (error) {
      toast.error(
        error.data?.message || 'Failed to cancel subscription'
      )
    } finally {
      setIsCancelling(false)
    }
  }

  // Resume subscription
  const handleResume = async () => {
    try {
      await resumeSubscription().unwrap()

      toast.success('Subscription resumed successfully')

      refetchPlans()
      refetchStatus()
    } catch (error) {
      toast.error(
        error.data?.message || 'Failed to resume subscription'
      )
    }
  }

  const getPlanIcon = (plan) => {
    if (plan.name?.toLowerCase().includes('month')) {
      return <FaCalendar className="text-blue-500" />
    }

    if (plan.name?.toLowerCase().includes('year')) {
      return <FaCalendar className="text-purple-500" />
    }

    if (
      plan.name?.toLowerCase().includes('6 month') ||
      plan.name?.toLowerCase().includes('six')
    ) {
      return <FaCalendar className="text-orange-500" />
    }

    return <FaStar />
  }

  const getIntervalLabel = (plan) => {
    if (plan.metadata?.billingPeriod === '6_months') {
      return '6 months'
    }

    if (plan.interval === 'month') {
      return 'month'
    }

    if (plan.interval === 'year') {
      return 'year'
    }

    return plan.interval
  }

  const getSavings = (plan) => {
    if (plan.metadata?.savings) {
      return plan.metadata.savings
    }

    if (plan.interval === 'year') {
      return '38%'
    }

    if (plan.name?.toLowerCase().includes('6 month')) {
      return '23%'
    }

    return null
  }

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-primary text-3xl" />
      </div>
    )
  }

  const isActive =
    subscriptionStatus === 'active' ||
    subscriptionStatus === 'trialing'

  // Sort plans by displayOrder or price
  const sortedPlans = plans
    ? [...plans].sort(
        (a, b) =>
          (a.displayOrder || 0) - (b.displayOrder || 0)
      )
    : []

  return (
    <>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-text">
            Choose Your Plan
          </h1>

          <p className="text-text-light mt-2">
            Get discounts on all errands with a subscription.
            Cancel anytime.
          </p>

          {/* Current subscription status */}
          {isActive && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg inline-block">
              <p className="text-green-700 font-medium">
                ✅ You are currently subscribed to the{' '}
                {currentPlan?.name || 'Active'} plan
              </p>

              <p className="text-sm text-green-600">
                {statusData?.cancelAtPeriodEnd ? (
                  <>
                    Cancels on{' '}
                    {new Date(
                      statusData.currentPeriodEnd
                    ).toLocaleDateString()}

                    <button
                      onClick={handleResume}
                      className="ml-3 text-primary hover:underline"
                    >
                      Resume Subscription
                    </button>
                  </>
                ) : (
                  <>
                    Next billing:{' '}
                    {new Date(
                      statusData.currentPeriodEnd
                    ).toLocaleDateString()}

                    <button
                      onClick={() =>
                        setShowCancelModal(true)
                      }
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

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlans.map((plan) => {
            const isCurrentPlan =
              isActive &&
              currentPlan?._id === plan._id

            const isProcessingThisPlan =
              processingPlanId === plan._id

            const featureList = Object.entries(
              plan.features || {}
            )

            const savings = getSavings(plan)

            return (
              <div
                key={plan._id}
                className={`card hover:shadow-large transition-shadow ${
                  isCurrentPlan
                    ? 'border-2 border-primary shadow-large'
                    : ''
                } ${
                  plan.isPopular ? 'relative' : ''
                }`}
              >
                {/* Popular badge */}
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                {/* Current plan badge */}
                {isCurrentPlan && (
                  <span className="inline-block bg-primary text-white text-xs px-3 py-1 rounded-full mb-4">
                    Current Plan
                  </span>
                )}

                {/* Plan icon */}
                <div className="flex items-center space-x-2 text-3xl mb-4">
                  {getPlanIcon(plan)}
                </div>

                {/* Plan name */}
                <h3 className="text-xl font-bold text-text">
                  {plan.name}
                </h3>

                {/* Price */}
                <p className="text-3xl font-bold text-primary mt-2">
                  £{plan.price}

                  <span className="text-sm font-normal text-text-light">
                    /{getIntervalLabel(plan)}
                  </span>
                </p>

                {/* Savings */}
                {savings && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Save {savings} compared to monthly
                  </p>
                )}

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-text-light mt-1">
                    {plan.description}
                  </p>
                )}

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {featureList.map(([key, value]) => (
                    <li
                      key={key}
                      className="flex items-start space-x-2"
                    >
                      <FaCheck className="text-green-500 mt-0.5 flex-shrink-0" />

                      <span className="text-sm text-text-light">
                        {typeof value === 'boolean'
                          ? key
                              .replace(/_/g, ' ')
                              .replace(
                                /\b\w/g,
                                (l) => l.toUpperCase()
                              )
                          : value}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action */}
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
                          onClick={() =>
                            setShowCancelModal(true)
                          }
                          className="w-full border-2 border-red-500 text-red-500 px-4 py-3 rounded-xl font-medium hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() =>
                        handleSubscribe(plan._id)
                      }
                      disabled={isProcessingThisPlan}
                      className="w-full btn-primary disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isProcessingThisPlan ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>
                          Start now | Subscribe
                        </span>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-text-lighter mt-4 text-center">
                  Subscribe • Cancel anytime
                </p>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 card bg-gray-50">
          <h3 className="text-lg font-semibold text-text mb-2">
            Frequently Asked Questions
          </h3>

          <div className="space-y-4">
            <div>
              <p className="font-medium text-text">
                What payment methods do you accept?
              </p>

              <p className="text-sm text-text-light">
                We accept all major credit and debit cards
                through Stripe.
              </p>
            </div>

            <div>
              <p className="font-medium text-text">
                Is there a discount for yearly subscriptions?
              </p>

              <p className="text-sm text-text-light">
                Yes, yearly subscribers save up to 38%
                compared to monthly billing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => {
            if (!isCancelling) {
              setShowCancelModal(false)
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-text">
                Cancel Subscription?
              </h3>

              <button
                onClick={() =>
                  setShowCancelModal(false)
                }
                disabled={isCancelling}
                className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <p className="mt-4 text-sm text-text-light leading-6">
              Are you sure you want to cancel your
              subscription?
            </p>

            <p className="mt-2 text-sm text-text-light leading-6">
              Your subscription will remain active and
              you'll continue to have access to your
              benefits until the end of your current
              billing period.
            </p>

            {/* Current period end */}
            {statusData?.currentPeriodEnd && (
              <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p className="text-sm text-text-light">
                  Your access will remain active until:
                </p>

                <p className="mt-1 font-semibold text-text">
                  {new Date(
                    statusData.currentPeriodEnd
                  ).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  setShowCancelModal(false)
                }
                disabled={isCancelling}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-text hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Keep Subscription
              </button>

              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Subscription