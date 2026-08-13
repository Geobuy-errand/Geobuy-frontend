import React, { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useVerifySubscriptionSessionQuery, useGetSubscriptionStatusQuery } from '../redux/services/subscriptionApi'

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [subscriptionData, setSubscriptionData] = useState(null)
  
  const sessionId = searchParams.get('session_id')
  
  // ✅ RTK Query - Verify subscription
  const { 
    data: verificationData, 
    isLoading: isVerifying, 
    error: verificationError,
    refetch 
  } = useVerifySubscriptionSessionQuery(sessionId, {
    skip: !sessionId,
  })

  // ✅ RTK Query - Check subscription status
  const { data: statusData, refetch: refetchStatus } = useGetSubscriptionStatusQuery(undefined, {
    skip: !isSuccess,
  })

  // Handle verification response
  useEffect(() => {
    if (verificationData) {
      console.log('📦 Verification response:', verificationData)
      
      if (verificationData.success) {
        setSubscriptionData(verificationData)
        setIsSuccess(true)
        toast.success('Subscription activated successfully! 🎉')
        
        // Check status after a moment
        setTimeout(() => {
          refetchStatus()
        }, 2000)
      } else {
        setError(verificationData.message || 'Failed to verify subscription')
        toast.error('Failed to verify subscription')
      }
    }
  }, [verificationData])

  // Handle verification error
  useEffect(() => {
    if (verificationError) {
      console.error('❌ Verification error:', verificationError)
      
      const errorMessage = verificationError?.data?.message || 
                          'Failed to verify subscription. Please contact support.'
      
      setError(errorMessage)
      toast.error('Failed to verify subscription')
    }
  }, [verificationError])

  // Handle status check
  useEffect(() => {
    if (statusData?.isSubscribed) {
      console.log('✅ Subscription active:', statusData)
    }
  }, [statusData])

  // If no session ID
  if (!sessionId && !isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-12">
        <div className="max-w-md w-full">
          <div className="card text-center border-2 border-red-200 bg-red-50">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text">Invalid Request</h1>
            <p className="text-text-light mt-2">No session ID found in the URL.</p>
            <div className="mt-6">
              <Link to="/subscription" className="btn-primary block w-full">
                Go to Subscriptions
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FaSpinner className="animate-spin text-primary text-4xl mx-auto mb-4" />
          <p className="text-text-light font-medium">Verifying your subscription...</p>
          <p className="text-sm text-text-lighter mt-1">Please wait while we activate your account</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] py-12">
        <div className="max-w-md w-full">
          <div className="card text-center border-2 border-red-200 bg-red-50">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text">Verification Failed</h1>
            <p className="text-text-light mt-2">{error}</p>
            <p className="text-sm text-text-lighter mt-1">
              Your subscription may still be active. Please check your dashboard.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => refetch()}
                className="btn-primary block w-full"
              >
                Try Again
              </button>
              <Link to={`/${user?.role || 'customer'}/dashboard`} className="btn-secondary block w-full">
                Go to Dashboard
              </Link>
              <Link to="/contact" className="text-primary hover:underline text-sm block">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <div className="max-w-md w-full">
        <div className="card text-center border-2 border-green-200">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text">Subscription Activated! 🎉</h1>
          <p className="text-text-light mt-2">
            Your subscription has been successfully activated.
            You now have access to premium features.
          </p>
          
          {subscriptionData && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm text-text-light">
                <span className="font-medium">Plan:</span> {subscriptionData.planName || 'Subscription'}
              </p>
              <p className="text-sm text-text-light">
                <span className="font-medium">Status:</span> {subscriptionData.localRecord?.status || subscriptionData.subscription?.status || 'Active'}
              </p>
              <p className="text-sm text-text-light">
                <span className="font-medium">Trial Period:</span> 7 days free
              </p>
            </div>
          )}
          
          <div className="mt-6 space-y-3">
            <Link to={`/${user?.role || 'customer'}/dashboard`} className="btn-primary block">
              Go to Dashboard
            </Link>
            <Link to="/book-errand" className="btn-secondary block">
              Book an Errand
            </Link>
            <Link to="/subscription" className="text-primary hover:underline text-sm">
              Manage Subscription
            </Link>
          </div>
          
          <p className="text-xs text-text-lighter mt-4">
            Need help? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionSuccess