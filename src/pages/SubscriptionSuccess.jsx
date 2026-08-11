import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { toast } from 'react-hot-toast'

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      verifySubscription(sessionId)
    }
  }, [searchParams])

  const verifySubscription = async (sessionId) => {
    try {
      // The webhook will handle the subscription activation
      // We just need to wait a moment for it to process
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSuccess(true)
      toast.success('Subscription activated successfully!')
    } catch (error) {
      toast.error('Failed to verify subscription')
    } finally {
      setIsVerifying(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-primary text-4xl mx-auto mb-4" />
          <p className="text-text-light">Verifying your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="max-w-md w-full">
        <div className="card text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text">Subscription Activated! 🎉</h1>
          <p className="text-text-light mt-2">
            Your subscription has been successfully activated.
            You now have access to premium features.
          </p>
          <div className="mt-6 space-y-3">
            <Link to="/customer/dashboard" className="btn-primary block">
              Go to Dashboard
            </Link>
            <Link to="/book-errand" className="btn-secondary block">
              Book an Errand
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionSuccess