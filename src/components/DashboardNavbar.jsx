import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../redux/services/authApi";
import { logout } from "../redux/slices/authSlice";
import { toast } from "react-hot-toast";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaComments,
} from "react-icons/fa";
import { useGetUnreadNotificationCountQuery } from "../redux/services/notificationApi";

const DashboardNavbar = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const [logoutMutation] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: unreadCount } = useGetUnreadNotificationCountQuery();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="bg-white shadow-soft sticky top-0 z-40">
      <div className="px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="md:hidden text-text-light hover:text-primary transition-colors"
            >
              <FaBars size={24} />
            </button>
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">GEOBUY</span>
              <span className="text-sm text-text-light hidden sm:inline">Errands</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* ✅ Notification - Hidden on mobile */}
            <Link
              to={`/${user?.role}/notifications`}
              className="hidden md:block relative text-text-light hover:text-primary transition-colors"
            >
              <FaBell size={20} />
              {unreadCount?.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount.count > 9 ? "9+" : unreadCount.count}
                </span>
              )}
            </Link>

            {/* Chat - Hidden on mobile */}
            <Link
              to={`/${user?.role}/chat-support`}
              className="hidden md:block text-text-light hover:text-primary transition-colors relative"
            >
              <FaComments size={20} />
            </Link>

            {/* Subscription - Hidden on mobile */}
            <Link
              to={`/${user?.role}/subscriptions`}
              className="hidden md:block text-sm text-text-light hover:text-primary transition-colors"
            >
              Subscription
            </Link>

            <div className="flex items-center space-x-2 md:space-x-3">
              {/* ✅ Profile Icon - Hidden on mobile */}
              <FaUserCircle className="hidden md:block text-2xl text-text-light" />
              
              {/* ✅ User Name - Hidden on mobile */}
              <span className="hidden md:block text-sm text-text-light">
                {user?.fullName}
              </span>
              
              {/* ✅ Logout Button - Always Visible */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 md:px-4 md:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer text-sm md:text-base"
                title="Logout"
              >
                <FaSignOutAlt size={16} className="md:size-[18]" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;