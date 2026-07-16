import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '../redux/services/authApi'
import { setUser } from '../redux/slices/authSlice'
import { toast } from 'react-hot-toast'
import { FaEnvelope, FaLock, FaShieldAlt, FaArrowLeft } from 'react-icons/fa'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginMutation] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await loginMutation({ email, password }).unwrap()
      
      if (result.user) {
        // Check if user is admin
        if (result.user.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.')
          setIsLoading(false)
          return
        }

        dispatch(setUser({ user: result.user, providerProfile: null }))
        toast.success('Admin login successful!')
        navigate('/admin/dashboard')
      }
    } catch (error) {
      toast.error(error.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Admin Badge */}
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <FaShieldAlt className="text-3xl text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text">Admin Login</h1>
            <p className="text-text-light mt-2">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Admin Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="admin@geobuy.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Admin Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In as Admin'}
            </button>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-text-light hover:text-primary transition-colors text-sm flex items-center justify-center space-x-2">
                <FaArrowLeft className="text-xs" />
                <span>Back to User Login</span>
              </Link>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700 text-center">
                <strong>Demo Admin Credentials:</strong><br />
                Email: admin@geobuy.com<br />
                Password: Admin123!
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin