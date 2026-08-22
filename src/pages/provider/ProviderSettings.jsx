import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useChangePasswordMutation } from '../../redux/services/providerApi'
import { useLogoutMutation } from '../../redux/services/authApi'
import { logout } from '../../redux/slices/authSlice'
import { toast } from 'react-hot-toast'
import { FaLock, FaKey, FaSignOutAlt } from 'react-icons/fa'

const ProviderSettings = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation()
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap()
      toast.success('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(error.data?.message || 'Failed to change password')
    }
  }

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

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Password Change */}
        <div className="card max-w-2xl">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <FaLock className="mr-2 text-primary" />
            Change Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Current Password
              </label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                New Password
              </label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input-field pl-10"
                  required
                />
              </div>
              <p className="text-xs text-text-lighter mt-1">
                Must be at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* ✅ Logout Section */}
        <div className="card max-w-2xl border-gray-200">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <FaSignOutAlt className="mr-2 text-red-500" />
            Account Actions
          </h2>
          <p className="text-sm text-text-light mb-4">
            Sign out of your account on this device.
          </p>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <FaSignOutAlt />
            <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>

        {/* ⚠️ Danger Zone - Commented out */}
        {/*
        <div className="card max-w-2xl border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-sm text-red-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors text-sm">
            Delete Account
          </button>
        </div>
        */}
      </div>
    </div>
  )
}

export default ProviderSettings