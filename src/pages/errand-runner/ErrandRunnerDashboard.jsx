import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { useGetAvailableErrandsQuery, useGetErrandsQuery } from '../../redux/services/errandApi'
import { useGetWalletQuery } from '../../redux/services/walletApi'
import { useGetErrandRunnerProfileQuery } from '../../redux/services/errandRunnerApi'
import { FaBriefcase, FaCheckCircle, FaWallet, FaStar, FaClock, FaRunning, FaHourglassHalf } from 'react-icons/fa'
import useCountry from '../../hooks/useCountry'
import useLiveUpdates from '../../hooks/useLiveUpdates'
import { StatLink, JobList } from '../../components/dashboard/DashboardCards'
import IdentityBanner from '../../components/verification/IdentityBanner'
import { useGetIdentityStatusQuery } from '../../redux/services/identityApi'
import { ERRAND_VIEWS, runnerErrandAction } from '../../utils/jobStages'

const label = (s = '') => s.replace(/_/g, ' ')

const ErrandRunnerDashboard = () => {
  const { format } = useCountry()
  const { user } = useSelector((state) => state.auth)
  const live = { pollingInterval: 30000, refetchOnFocus: true, refetchOnReconnect: true }
  const { data: availableJobs, isLoading: jobsLoading, refetch: refetchAvailable } = useGetAvailableErrandsQuery(undefined, live)
  const { data: allJobs, isLoading: allJobsLoading, refetch: refetchJobs } = useGetErrandsQuery(undefined, live)
  const { data: wallet, isLoading: walletLoading, refetch: refetchWallet } = useGetWalletQuery(undefined, live)
  const { data: profile } = useGetErrandRunnerProfileQuery()
  const { data: identity } = useGetIdentityStatusQuery()

  useLiveUpdates(['new-errand-available', 'errand-status-updated', 'errand-completed', 'funds-released'], (name) => {
    if (name === 'new-errand-available') toast('📦 New errand near you')
    if (name === 'funds-released') toast.success('Earnings added to your wallet')
    refetchAvailable()
    refetchJobs()
    refetchWallet()
  })

  const mine = allJobs || []
  const active = mine.filter(ERRAND_VIEWS.active)
  const waiting = mine.filter(ERRAND_VIEWS.to_confirm)
  const completed = mine.filter(ERRAND_VIEWS.completed)
  const accountApproved = (identity?.accountStatus ?? user?.verificationStatus ?? profile?.verificationStatus) === 'approved'
  const needsIdentity = identity?.required && !identity?.verified

  const item = (e) => ({
    key: e._id,
    to: `/errand-runner/job/${e._id}`,
    title: `Errand #${e.errandId || ''} ${e.serviceType ? `· ${label(e.serviceType)}` : ''}`,
    subtitle: [e.pickup?.address, e.dropoff?.address].filter(Boolean).join(' → '),
    amount: format(e.providerAmount ?? e.total),
    action: runnerErrandAction(e),
    status: label(e.status),
  })

  if (jobsLoading || allJobsLoading || walletLoading) {
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
          Welcome back, {user?.fullName?.split(' ')[0] || 'Runner'}! 🏃
        </h1>
        <p className="text-text-light mt-1">
          {needsIdentity
            ? 'Verify your identity to start accepting errands.'
            : accountApproved
            ? 'You are verified and ready to accept errands!'
            : 'Your account is waiting for approval. You can view errands but cannot accept them yet.'}
        </p>
        {!needsIdentity && !accountApproved && (
          <Link to="/errand-runner/verification" className="text-primary hover:underline text-sm mt-2 inline-block">Complete verification →</Link>
        )}
      </div>

      <IdentityBanner status={identity} />

      {/* Stats — each opens the matching section */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <StatLink to="/errand-runner/available-jobs" label="Available near you" value={availableJobs?.length || 0} icon={FaBriefcase} tone="primary" testId="stat-available" />
        <StatLink to="/errand-runner/accepted-jobs" label="Active errands" value={active.length} icon={FaRunning} tone="blue" testId="stat-active" />
        <StatLink to="/errand-runner/accepted-jobs?filter=delivered" label="Awaiting confirmation" value={waiting.length} icon={FaHourglassHalf} tone="yellow" hint="customer to confirm" testId="stat-awaiting" />
        <StatLink to="/errand-runner/wallet" label="Wallet" value={format(wallet?.balance || 0)} icon={FaWallet} tone="green" hint={wallet?.pendingBalance ? `${format(wallet.pendingBalance)} pending` : 'withdrawable'} testId="stat-wallet" />
        <StatLink to="/errand-runner/accepted-jobs?filter=completed" label="Completed" value={completed.length} icon={FaStar} tone="purple" hint={user?.averageRating ? `${Number(user.averageRating).toFixed(1)} ★` : 'New'} testId="stat-completed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobList
          testId="runner-active-list"
          title="Active errands — continue"
          items={[...active, ...waiting].map(item)}
          empty="No active errands. Pick one from the available list."
          viewAllTo="/errand-runner/accepted-jobs"
        />
        <JobList
          testId="runner-available-list"
          title="Available near you"
          items={(availableJobs || []).slice(0, 5).map((e) => ({ ...item(e), to: '/errand-runner/available-jobs', action: { label: 'View', tone: 'muted' } }))}
          empty="No errands near you right now."
          viewAllTo="/errand-runner/available-jobs"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        <Link to="/errand-runner/availability" className="card text-center hover:shadow-medium transition-shadow">
          <FaClock className="text-blue-600 text-xl mx-auto mb-2" />
          <p className="text-sm font-medium">Availability</p>
        </Link>
        <Link to="/errand-runner/verification" className="card text-center hover:shadow-medium transition-shadow">
          <FaCheckCircle className="text-yellow-600 text-xl mx-auto mb-2" />
          <p className="text-sm font-medium">Verification</p>
        </Link>
        <Link to="/errand-runner/withdrawals" className="card text-center hover:shadow-medium transition-shadow">
          <FaWallet className="text-green-600 text-xl mx-auto mb-2" />
          <p className="text-sm font-medium">Withdraw</p>
        </Link>
        <Link to="/errand-runner/reviews" className="card text-center hover:shadow-medium transition-shadow">
          <FaStar className="text-yellow-500 text-xl mx-auto mb-2" />
          <p className="text-sm font-medium">Reviews</p>
        </Link>
      </div>
    </div>
  )
}

export default ErrandRunnerDashboard
