import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useLogoutMutation } from '../redux/services/authApi'
import { logout } from '../redux/slices/authSlice'
import { toast } from 'react-hot-toast'
import { FaBars, FaTimes, FaUserCircle, FaShieldAlt, FaRunning, FaSignOutAlt } from 'react-icons/fa'
import SignupModal from './modals/SignupModal'
import Logo from './utils/Logo'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [logoutMutation] = useLogoutMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap()
      dispatch(logout())
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const getDashboardLink = () => {
    if (!user) return '/login'
    if (user.role === 'customer') return '/customer/dashboard'
    if (user.role === 'errand_runner') return '/errand-runner/dashboard'
    if (user.role === 'provider') return '/service-provider/dashboard'
    if (user.role === 'admin') return '/admin/dashboard'
    return '/login'
  }

  const getRoleLabel = () => {
    if (!user) return ''
    if (user.role === 'errand_runner') return 'Errand Runner'
    if (user.role === 'provider') return 'Service Provider'
    return user.role
  }

  return (
    <>
      <nav className="bg-white shadow-soft sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            <Logo />

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/connect" className="text-primary font-medium hover:text-primary/80 transition-colors">
                Connect ❤️
              </Link>
              <Link to="/services" className="text-text-light hover:text-primary transition-colors">
                Services
              </Link>
              <Link to="/pricing" className="text-text-light hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link to="/become-provider" className="text-text-light hover:text-primary transition-colors">
                Become a Provider
              </Link>
              <Link to="/about" className="text-text-light hover:text-primary transition-colors">
                About
              </Link>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors"
                  >
                    <FaUserCircle className="text-2xl" />
                    <span>{user?.fullName?.split(' ')[0]}</span>
                    {user?.role !== 'customer' && user?.role !== 'admin' && (
                      <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                        {getRoleLabel()}
                      </span>
                    )}
                    {user?.role === 'admin' && (
                      <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-large py-2 border border-gray-100">
                      <Link
                        to={getDashboardLink()}
                        className="block px-4 py-2 text-text-light hover:bg-primary/5 hover:text-primary transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to={`/${user?.role}/profile`}
                        className="block px-4 py-2 text-text-light hover:bg-primary/5 hover:text-primary transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to={`/${user?.role}/settings`}
                        className="block px-4 py-2 text-text-light hover:bg-primary/5 hover:text-primary transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false)
                          handleLogout()
                        }}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/register/errand-runner" className="text-text-light hover:text-primary transition-colors text-sm flex items-center space-x-1">
                    <FaRunning className="text-xs" />
                    <span>Become a Runner</span>
                  </Link>
                  <Link to="/login" className="text-text-light hover:text-primary transition-colors">
                    Login
                  </Link>
                  <button
                    onClick={() => setIsSignupModalOpen(true)}
                    className="btn-primary text-sm py-2 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-2xl text-text"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                <Link to="/connect" className="text-primary font-medium hover:text-primary/80 transition-colors" onClick={() => setIsOpen(false)}>
                  Connect ❤️
                </Link>
                <Link to="/services" className="text-text-light hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                  Services
                </Link>
                <Link to="/pricing" className="text-text-light hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                  Pricing
                </Link>
                <Link to="/become-provider" className="text-text-light hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                  Become a Provider
                </Link>
                <Link to="/about" className="text-text-light hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                  About
                </Link>

                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardLink()} className="text-text-light hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                    <Link to={`/${user?.role}/settings`} className="text-text-light hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                      Settings
                    </Link>
                    {/* ✅ Logout Button in Mobile Menu */}
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors text-left py-2 border-t border-gray-100 mt-2 pt-3"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Link to="/register/errand-runner" className="text-text-light hover:text-primary transition-colors flex items-center space-x-2">
                      <FaRunning className="text-xs" />
                      <span>Become a Runner</span>
                    </Link>
                    <Link to="/login" className="text-text-light hover:text-primary transition-colors">
                      Login
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        setIsSignupModalOpen(true)
                      }}
                      className="btn-primary text-center text-sm py-2"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen} 
        onClose={() => setIsSignupModalOpen(false)} 
      />
    </>
  )
}

export default Navbar