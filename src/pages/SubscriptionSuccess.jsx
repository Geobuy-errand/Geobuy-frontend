import React, { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import axios from 'axios'

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [subscriptionData, setSubscriptionData] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    console.log('🔍 Session ID from URL:', sessionId)
    
    if (sessionId) {
      verifySubscription(sessionId)
    } else {
      setError('No session ID found in the URL')
      setIsVerifying(false)
    }
  }, [searchParams])

  const verifySubscription = async (sessionId) => {
    try {
      console.log('🔍 Verifying subscription with session:', sessionId)
      
      // Step 1: Verify the subscription with the backend
      const response = await axios.get(`/api/subscription/verify-session/${sessionId}`, {
        withCredentials: true,
      })

      console.log('📦 Verification response:', response.data)

      if (response.data.success) {
        setSubscriptionData(response.data)
        setIsSuccess(true)
        toast.success('Subscription activated successfully! 🎉')
        
        // Check status after a moment
        setTimeout(() => {
          checkSubscriptionStatus()
        }, 2000)
      } else {
        setError(response.data.message || 'Failed to verify subscription')
        toast.error('Failed to verify subscription')
      }
    } catch (error) {
      console.error('❌ Verification error:', error)
      console.error('❌ Error response:', error.response?.data)
      setError(error.response?.data?.message || 'Failed to verify subscription. Please contact support.')
      toast.error('Failed to verify subscription')
    } finally {
      setIsVerifying(false)
    }
  }

  const checkSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/subscription/status', {
        withCredentials: true,
      })
      
      console.log('📊 Subscription status:', response.data)
      
      if (response.data.isSubscribed) {
        console.log('✅ Subscription active:', response.data)
      }
    } catch (error) {
      console.error('❌ Status check error:', error)
    }
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
            <h1 className="text-2xl font-bold text-text">Something Went Wrong</h1>
            <p className="text-text-light mt-2">{error}</p>
            <p className="text-sm text-text-lighter mt-1">
              Please contact support if this issue persists.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/subscription')}
                className="btn-primary block w-full"
              >
                Try Again
              </button>
              <Link to="/contact" className="btn-secondary block w-full">
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