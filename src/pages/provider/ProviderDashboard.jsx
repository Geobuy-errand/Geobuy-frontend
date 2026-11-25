import React from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { useGetProviderServiceRequestsQuery } from '../../redux/services/serviceApi'
import { useGetWalletQuery } from '../../redux/services/walletApi'
import { FaBriefcase, FaCheckCircle, FaWallet, FaStar, FaExchangeAlt, FaBell } from 'react-icons/fa'
import useCountry from '../../hooks/useCountry'
import useLiveUpdates from '../../hooks/useLiveUpdates'
import { StatLink, JobList } from '../../components/dashboard/DashboardCards'
import IdentityBanner from '../../components/verification/IdentityBanner'
import { PROVIDER_VIEWS, providerAction, providerPath } from '../../utils/jobStages'

const ProviderDashboard = () => {
  const { format } = useCountry()
  const { user } = useSelector((state) => state.auth)

  // Polling backs up the live connection (iPhone Safari pauses sockets in the background)
  const live = { pollingInterval: 30000, refetchOnFocus: true, refetchOnReconnect: true }
  const { data: providerRequests, isLoading: requestsLoading, refetch } = useGetProviderServiceRequestsQuery(undefined, live)
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletQuery(undefined, live)

  useLiveUpdates(['new-service-invite', 'new-service-request', 'negotiation-update', 'quote-accepted', 'service-paid', 'funds-released'], (name, data) => {
    if (name === 'new-service-invite' || name === 'new-service-request') toast.success('📋 New service request')
    if (name === 'negotiation-update' && data?.from === 'customer') toast(data.declined ? 'A customer declined your quote' : 'A customer sent you a counter-offer', { icon: '🔄' })
    if (name === 'service-paid') toast.success('💷 A customer has paid — you can start the job')
    if (name === 'funds-released') toast.success('Earnings added to your wallet')
    refetch()
    refetchWallet()
  })

  const all = providerRequests || []
  const by = (fn) => all.filter(fn)
  const newRequests = by(PROVIDER_VIEWS.new)
  const respond = by(PROVIDER_VIEWS.respond)
  const quoted = by(PROVIDER_VIEWS.quoted)
  const active = by(PROVIDER_VIEWS.active)
  const completed = by(PROVIDER_VIEWS.completed)

  const item = (r) => ({
    key: r._id,
    to: providerPath(r),
    title: r.serviceType || r.category,
    subtitle: [r.customerId?.fullName, r.location?.address].filter(Boolean).join(' · '),
    amount: r.finalPrice != null ? format(r.finalPrice) : r.myQuote ? format(r.myQuote.amount) : r.budget != null ? `Budget ${format(r.budget)}` : null,
    action: providerAction(r),
    status: (r.status || '').replace(/_/g, ' '),
  })

  // What the provider should do next, most urgent first
  const needsAction = [
    ...respond,
    ...by(PROVIDER_VIEWS.ready),
    ...by(PROVIDER_VIEWS.in_progress),
    ...newRequests,
  ].map(item)

  if (requestsLoading || walletLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-48 rounded-xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="card"><div className="skeleton h-12 rounded-xl" /></div>)}
        </div>
        <div className="card"><div className="skeleton h-48 rounded-xl" /></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          Welcome back, {user?.fullName?.split(' ')[0] || 'Provider'}! 👋
        </h1>
        <p className="text-text-light mt-1">Here's your service provider overview.</p>
      </div>

      <IdentityBanner />

      {/* Stats — each opens the matching section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <StatLink to="/provider/available-jobs" label="New requests" value={newRequests.length} icon={FaBriefcase} tone="yellow" testId="stat-new-requests" />
        <StatLink to="/provider/available-jobs?tab=quoted" label="Negotiations" value={quoted.length} icon={FaExchangeAlt} tone="purple" hint={respond.length ? `${respond.length} need your reply` : 'waiting on customers'} testId="stat-negotiations" />
        <StatLink to="/provider/accepted-jobs" label="Active jobs" value={active.length} icon={FaCheckCircle} tone="blue" testId="stat-active-jobs" />
        <StatLink to="/provider/wallet" label="Wallet" value={format(wallet?.balance || 0)} icon={FaWallet} tone="primary" hint={wallet?.pendingBalance ? `${format(wallet.pendingBalance)} pending` : 'withdrawable'} testId="stat-wallet" />
        <StatLink to="/provider/reviews" label="Rating" value={user?.averageRating ? Number(user.averageRating).toFixed(1) : 'New'} icon={FaStar} tone="yellow" hint={`${completed.length} completed`} testId="stat-rating" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobList
          testId="provider-needs-action"
          title={<span className="flex items-center gap-2"><FaBell className="text-yellow-600" /> Needs your action</span>}
          items={needsAction.slice(0, 8)}
          empty="Nothing needs you right now."
          viewAllTo="/provider/available-jobs"
        />
        <JobList
          testId="provider-active-jobs"
          title="Active jobs"
          items={active.map(item).slice(0, 8)}
          empty="No active jobs yet. Send quotes to get booked."
          viewAllTo="/provider/accepted-jobs"
        />
      </div>
    </div>
  )
}

export default ProviderDashboard
