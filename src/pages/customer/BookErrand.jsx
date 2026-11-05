import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * /book-errand used to be a demo page that priced errands with a RANDOM
 * distance (Math.random) in £. Real booking lives at /customer/create-errand,
 * where the server calculates the true road distance and price for the UK
 * or Nigeria. This route now forwards there.
 */
const BookErrand = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  if (isAuthenticated && user?.role === 'customer') {
    return <Navigate to="/customer/create-errand" replace />
  }
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <Navigate to="/login" replace state={{ from: '/customer/create-errand' }} />
}

export default BookErrand
