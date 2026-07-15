import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useGetCurrentUserQuery } from '../../redux/services/authApi'
import { setUser, setLoading } from '../../redux/slices/authSlice'
import LoadingSpinner from '../LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth)

  const { data, isLoading: queryLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: isAuthenticated && user,
  })

  useEffect(() => {
    if (data) {
      dispatch(setUser({ 
        user: data.user, 
        providerProfile: data.providerProfile 
      }))
    }
    if (error) {
      dispatch(setUser({ user: null, providerProfile: null }))
    }
  }, [data, error, dispatch])

  useEffect(() => {
    dispatch(setLoading(queryLoading))
  }, [queryLoading, dispatch])

  // Show loading spinner while checking authentication
  if (isLoading || queryLoading) {
    return <LoadingSpinner />
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />
    }
    if (user?.role === 'provider') {
      return <Navigate to="/provider/dashboard" replace />
    }
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }
    return <Navigate to="/" replace />
  }

  // If all checks pass, render the children
  return children
}

export default ProtectedRoute