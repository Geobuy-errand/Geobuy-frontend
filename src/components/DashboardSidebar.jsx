import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
  FaTimes,
  FaStumbleupon,
  FaCrown,
  FaHandsHelping,
  FaHistory,
  FaTags,
  FaLink,
  FaUnlink,
  FaNewspaper
} from "react-icons/fa";

const DashboardSidebar = ({ open, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const getNavItems = () => {
    if (user?.role === "customer") {
      return [
        { to: "/customer/dashboard", icon: FaHome, label: "Dashboard" },
        {
          to: "/customer/create-booking",
          icon: FaPlus,
          label: "Create Booking",
        },
        { to: "/customer/bookings", icon: FaList, label: "Booking History" },
        { to: "/customer/messages", icon: FaComments, label: "Messages" },
        { to: "/find-services", icon: FaHandsHelping, label: "Find Services" },
        { to: "/customer/subscriptions", icon: FaCrown, label: "Subscription" },
        {
          to: "/customer/service-history",
          icon: FaHistory,
          label: "Service History",
        },
        {
          label: 'Connect',
          icon: FaLink,
          to: '/customer/connect',
        },
        { to: "/customer/payments", icon: FaCreditCard, label: "Payments" },
        { to: "/customer/reviews", icon: FaStar, label: "Reviews" },
        { to: "/customer/profile", icon: FaUser, label: "Profile" },
        { to: "/customer/notifications", icon: FaBell, label: "Notifications" },
        {
          to: "/customer/chat-support",
          icon: FaComments,
          label: "Chat Support",
        },
        { to: "/customer/settings", icon: FaCog, label: "Settings" },
        { to: "/customer/help", icon: FaQuestionCircle, label: "Help Center" },
      ];
    }

    if (user?.role === "provider") {
      return [
        {
          to: "/provider/dashboard",
          icon: FaTachometerAlt,
          label: "Dashboard",
        },
        {
          to: "/provider/available-jobs",
          icon: FaBriefcase,
          label: "Available Jobs",
        },
        {
          to: "/provider/accepted-jobs",
          icon: FaCheckCircle,
          label: "Accepted Jobs",
        },
        { to: "/provider/wallet", icon: FaWallet, label: "Wallet" },
        { to: '/provider/subscriptions', icon: FaCrown, label: 'Subscription' },
        {
          to: "/provider/withdrawals",
          icon: FaMoneyBillWave,
          label: "Withdrawals",
        },
        { to: "/provider/messages", icon: FaComments, label: "Messages" },
        { to: "/provider/notifications", icon: FaBell, label: "Notifications" },
        { to: "/provider/reviews", icon: FaStar, label: "Reviews" },
        {
          to: "/provider/availability",
          icon: FaCheckCircle,
          label: "Availability",
        },
        {
          to: "/provider/verification",
          icon: FaShieldAlt,
          label: "Verification",
        },
        {
          to: "/provider/chat-support",
          icon: FaComments,
          label: "Chat Support",
        },
        { to: "/provider/profile", icon: FaUser, label: "Profile" },
        { to: "/provider/settings", icon: FaCog, label: "Settings" },
      ];
    }

    if (user?.role === 'errand_runner') {
      return [
        { to: '/errand-runner/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
        { to: '/errand-runner/available-jobs', icon: FaBriefcase, label: 'Available Jobs' },
        { to: '/errand-runner/accepted-jobs', icon: FaCheckCircle, label: 'Accepted Jobs' },
        { to: '/errand-runner/wallet', icon: FaWallet, label: 'Wallet' },
        { to: '/errand-runner/withdrawals', icon: FaMoneyBillWave, label: 'Withdrawals' },
        { to: '/errand-runner/messages', icon: FaComments, label: 'Messages' },
        { to: '/errand-runner/notifications', icon: FaBell, label: 'Notifications' },
        { to: '/errand-runner/reviews', icon: FaStar, label: 'Reviews' },
        { to: '/errand-runner/availability', icon: FaCheckCircle, label: 'Availability' },
        { to: '/errand-runner/verification', icon: FaShieldAlt, label: 'Verification' },
        { to: '/errand-runner/profile', icon: FaUser, label: 'Profile' },
        { to: '/errand-runner/settings', icon: FaCog, label: 'Settings' },
      ]
    }

    if (user?.role === "admin") {
      return [
        { to: "/admin/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
        { to: "/admin/users", icon: FaUsers, label: "Users" },
        { to: "/admin/providers", icon: FaBriefcase, label: "Providers" },
        {
          to: "/admin/verification",
          icon: FaShieldAlt,
          label: "Verification Queue",
        },
        { to: "/admin/bookings", icon: FaClipboardList, label: "Bookings" },
        { to: '/admin/subscriptions', icon: FaCrown, label: 'Subscriptions' },
        { to: "/admin/payments", icon: FaCreditCard, label: "Payments" },
        { to: "/admin/reviews", icon: FaStar, label: "Reviews" },
        { to: '/admin/categories', icon: FaTags, label: 'Service Categories'},
        { to: "/admin/subscription-plans", icon: FaStumbleupon, label: "Subscription Plan" },
        { to: '/admin/service-definitions', icon: FaList, label: 'Service Definitions' },
        { to: '/admin/service-providers', icon: FaUsers, label: 'Service Providers' },
        {
          title: 'Connections',
          icon: FaLink,
          path: '/admin/connections',
        },
        {
          title: 'Connection Posts',
          icon: FaNewspaper,
          path: '/admin/connection-posts',
        },
        
        { to: '/admin/business-settings', icon: FaCog, label: 'Business Settings' },
        { to: "/admin/analytics", icon: FaChartBar, label: "Analytics" },
        { to: "/admin/support", icon: FaQuestionCircle, label: "Support" },
        { to: "/admin/settings", icon: FaCog, label: "Settings" },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const handleNavigation = (to, e) => {
    e.preventDefault();
    navigate(to);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay - with lighter darkening */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-large z-50
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:top-auto
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with close button */}
          <div className="p-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
            <button
              onClick={onClose}
              className="md:hidden text-text-light hover:text-primary transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary text-white shadow-soft"
                          : "text-text-light hover:bg-primary/5 hover:text-primary"
                      }
                    `}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        onClose();
                      }
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
          <div className="p-4 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">
                  {user?.fullName?.charAt(0) || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName}</p>
                <p className="text-xs text-text-lighter truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
