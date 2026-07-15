import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import DashboardLayout from './components/layout/DashboardLayout'

// Public Pages
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import BecomeProvider from './pages/BecomeProvider'
import Pricing from './pages/Pricing'
import FAQ from './pages/FAQ'
import Contact from './pages/Contact'
import Login from './pages/Login'
import RegisterCustomer from './pages/RegisterCustomer'
import RegisterProvider from './pages/RegisterProvider'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'

// Customer Dashboard
import CustomerDashboard from './pages/customer/CustomerDashboard'
import CreateBooking from './pages/customer/CreateBooking'
import BookingHistory from './pages/customer/BookingHistory'
import BookingDetails from './pages/customer/BookingDetails'
import CustomerMessages from './pages/customer/CustomerMessages'
import CustomerNotifications from './pages/customer/CustomerNotification'
import CustomerProfile from './pages/customer/CustomerProfile'
import CustomerSettings from './pages/customer/Settings'
import CustomerPayments from './pages/customer/CustomerPayments'
import CustomerReviews from './pages/customer/CustomerReviews'
import CustomerHelp from './pages/customer/CustomerHelp'

// Provider Dashboard
import ProviderDashboard from './pages/provider/ProviderDashboard'
import AvailableJobs from './pages/provider/AvailableJobs'
import AcceptedJobs from './pages/provider/AcceptedJobs'
import JobDetails from './pages/provider/JobDetails'
import ProviderMessages from './pages/provider/ProviderMessages'
import ProviderNotifications from './pages/provider/ProviderNotification'
import ProviderProfile from './pages/provider/ProviderProfile'
import ProviderSettings from './pages/provider/ProviderSettings'
import ProviderReviews from './pages/provider/ProviderReviews'
import ProviderWallet from './pages/provider/ProviderWallet'
import ProviderWithdrawals from './pages/provider/ProviderWallet'
import ProviderAvailability from './pages/provider/ProviderAvailability'
import ProviderVerification from './pages/provider/ProviderVerification'

// Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProviders from './pages/admin/AdminProviders'
import AdminBookings from './pages/admin/AdminBookings'
import AdminPayments from './pages/admin/AdminPayments'
import AdminReviews from './pages/admin/AdminReviews'
import AdminSupport from './pages/admin/AdminSupport'
import AdminReports from './pages/admin/AdminReports'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'
import AdminVerificationQueue from './pages/admin/AdminVerificationQueue'

import ProtectedRoute from './components/routes/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1A1A1A',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="become-provider" element={<BecomeProvider />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="contact" element={<Contact />} />
          <Route path="login" element={<Login />} />
          <Route path="register/customer" element={<RegisterCustomer />} />
          <Route path="register/provider" element={<RegisterProvider />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<Terms />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CustomerDashboard />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="create-booking" element={<CreateBooking />} />
          <Route path="bookings" element={<BookingHistory />} />
          <Route path="booking/:id" element={<BookingDetails />} />
          <Route path="messages" element={<CustomerMessages />} />
          <Route path="notifications" element={<CustomerNotifications />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="settings" element={<CustomerSettings />} />
          <Route path="payments" element={<CustomerPayments />} />
          <Route path="reviews" element={<CustomerReviews />} />
          <Route path="help" element={<CustomerHelp />} />
        </Route>

        {/* Provider Routes */}
        <Route path="/provider" element={
          <ProtectedRoute allowedRoles={['provider']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ProviderDashboard />} />
          <Route path="dashboard" element={<ProviderDashboard />} />
          <Route path="available-jobs" element={<AvailableJobs />} />
          <Route path="accepted-jobs" element={<AcceptedJobs />} />
          <Route path="job/:id" element={<JobDetails />} />
          <Route path="messages" element={<ProviderMessages />} />
          <Route path="notifications" element={<ProviderNotifications />} />
          <Route path="profile" element={<ProviderProfile />} />
          <Route path="settings" element={<ProviderSettings />} />
          <Route path="reviews" element={<ProviderReviews />} />
          <Route path="wallet" element={<ProviderWallet />} />
          <Route path="withdrawals" element={<ProviderWithdrawals />} />
          <Route path="availability" element={<ProviderAvailability />} />
          <Route path="verification" element={<ProviderVerification />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="verification" element={<AdminVerificationQueue />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App