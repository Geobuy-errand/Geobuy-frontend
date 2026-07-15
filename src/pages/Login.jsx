import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '../redux/services/authApi'
import { setUser } from '../redux/slices/authSlice'
import { toast } from 'react-hot-toast'
import { FaEnvelope, FaLock } from 'react-icons/fa'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loginMutation] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await loginMutation({ email, password }).unwrap()
      
      if (result.user) {
        dispatch(setUser({ user: result.user, providerProfile: null }))
        toast.success('Login successful!')
        
        // Redirect based on role
        const role = result.user.role
        if (role === 'customer') {
          navigate('/customer/dashboard')
        } else if (role === 'provider') {
          navigate('/provider/dashboard')
        } else if (role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/')
        }
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text">Welcome Back</h1>
            <p className="text-text-light mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Password
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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-light">
              Don't have an account?{' '}
              <Link to="/register/customer" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
            <div className="mt-3 flex justify-center space-x-4">
              <Link to="/register/customer" className="text-sm text-text-light hover:text-primary transition-colors">
                Register as Customer
              </Link>
              <span className="text-text-lighter">|</span>
              <Link to="/register/provider" className="text-sm text-text-light hover:text-primary transition-colors">
                Register as Provider
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login