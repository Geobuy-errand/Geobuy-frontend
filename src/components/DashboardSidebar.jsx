import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  FaHome,
  FaPlus,
  FaList,
  FaComments,
  FaBell,
  FaUser,
  FaCog,
  FaCreditCard,
  FaStar,
  FaQuestionCircle,
  FaBriefcase,
  FaWallet,
  FaMoneyBillWave,
  FaCheckCircle,
  FaUsers,
  FaChartBar,
  FaShieldAlt,
  FaClipboardList,
  FaTachometerAlt,
} from 'react-icons/fa'

const DashboardSidebar = ({ open, onClose }) => {
  const { user } = useSelector((state) => state.auth)

  const getNavItems = () => {
    if (user?.role === 'customer') {
      return [
        { to: '/customer/dashboard', icon: FaHome, label: 'Dashboard' },
        { to: '/customer/create-booking', icon: FaPlus, label: 'Create Booking' },
        { to: '/customer/bookings', icon: FaList, label: 'Booking History' },
        { to: '/customer/messages', icon: FaComments, label: 'Messages' },
        { to: '/customer/notifications', icon: FaBell, label: 'Notifications' },
        { to: '/customer/payments', icon: FaCreditCard, label: 'Payments' },
        { to: '/customer/reviews', icon: FaStar, label: 'Reviews' },
        { to: '/customer/profile', icon: FaUser, label: 'Profile' },
        { to: '/customer/settings', icon: FaCog, label: 'Settings' },
        { to: '/customer/help', icon: FaQuestionCircle, label: 'Help Center' },
      ]
    }

    if (user?.role === 'provider') {
      return [
        { to: '/provider/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
        { to: '/provider/available-jobs', icon: FaBriefcase, label: 'Available Jobs' },
        { to: '/provider/accepted-jobs', icon: FaCheckCircle, label: 'Accepted Jobs' },
        { to: '/provider/wallet', icon: FaWallet, label: 'Wallet' },
        { to: '/provider/withdrawals', icon: FaMoneyBillWave, label: 'Withdrawals' },
        { to: '/provider/messages', icon: FaComments, label: 'Messages' },
        { to: '/provider/notifications', icon: FaBell, label: 'Notifications' },
        { to: '/provider/reviews', icon: FaStar, label: 'Reviews' },
        { to: '/provider/availability', icon: FaCheckCircle, label: 'Availability' },
        { to: '/provider/verification', icon: FaShieldAlt, label: 'Verification' },
        { to: '/provider/profile', icon: FaUser, label: 'Profile' },
        { to: '/provider/settings', icon: FaCog, label: 'Settings' },
      ]
    }

    if (user?.role === 'admin') {
      return [
        { to: '/admin/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
        { to: '/admin/users', icon: FaUsers, label: 'Users' },
        { to: '/admin/providers', icon: FaBriefcase, label: 'Providers' },
        { to: '/admin/verification', icon: FaShieldAlt, label: 'Verification Queue' },
        { to: '/admin/bookings', icon: FaClipboardList, label: 'Bookings' },
        { to: '/admin/payments', icon: FaCreditCard, label: 'Payments' },
        { to: '/admin/reviews', icon: FaStar, label: 'Reviews' },
        { to: '/admin/analytics', icon: FaChartBar, label: 'Analytics' },
        { to: '/admin/support', icon: FaQuestionCircle, label: 'Support' },
        { to: '/admin/settings', icon: FaCog, label: 'Settings' },
      ]
    }

    return []
  }

  const navItems = getNavItems()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-large z-50 transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">GEOBUY</span>
              <span className="text-xs text-text-light">Errands</span>
            </div>
            <p className="text-xs text-text-light mt-1">
              {user?.role === 'customer' && 'Customer Dashboard'}
              {user?.role === 'provider' && 'Provider Dashboard'}
              {user?.role === 'admin' && 'Admin Dashboard'}
            </p>
          </div> */}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-text-light hover:bg-primary/5 hover:text-primary'
                      }
                    `}
                    onClick={() => {
                      if (window.innerWidth < 768) onClose()
                    }}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-text-lighter truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default DashboardSidebar