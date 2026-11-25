import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { useGetErrandsQuery } from '../../redux/services/errandApi'
import { useGetServiceRequestsQuery } from '../../redux/services/serviceApi'
import { FaPlus, FaClock, FaRunning, FaTools, FaBell, FaCheckCircle } from 'react-icons/fa'
import useCountry from '../../hooks/useCountry'
import useLiveUpdates from '../../hooks/useLiveUpdates'
import { StatLink, JobList } from '../../components/dashboard/DashboardCards'
import {
  ERRAND_VIEWS,
  SERVICE_VIEWS,
  customerErrandAction,
  customerErrandPath,
  customerServiceAction,
  customerServicePath,
} from '../../utils/jobStages'

const label = (s = '') => s.replace(/_/g, ' ')

const CustomerDashboard = () => {
  const { format } = useCountry()
  const { user } = useSelector((state) => state.auth || { user: null })
  // Errands and service requests are separate lists (the old dashboard
  // counted every errand twice and left service requests out).
  const live = { pollingInterval: 30000, refetchOnFocus: true }
  const { data: errands, isLoading: errandsLoading, refetch: refetchErrands } = useGetErrandsQuery(undefined, live)
  const { data: services, isLoading: servicesLoading, refetch: refetchServices } = useGetServiceRequestsQuery(undefined, live)

  useLiveUpdates(
    ['errand-status-updated', 'errand-accepted', 'payment-succeeded', 'new-quote', 'negotiation-update', 'quote-accepted', 'service-started', 'service-marked-done'],
    (name, data) => {
      if (name === 'new-quote') toast('💰 New quote received')
      if (name === 'service-marked-done') toast('Your provider has finished — please confirm')
      if (name === 'errand-status-updated' && data?.status === 'delivered') toast('📦 Your errand was delivered — please confirm')
      refetchErrands()
      refetchServices()
    }
  )

  const allErrands = errands || []
  const allServices = services || []

  const errandItem = (e) => ({
    key: `e-${e._id}`,
    to: customerErrandAction(e)?.to || customerErrandPath(e),
    title: `Errand #${e.errandId || ''} ${e.serviceType ? `· ${label(e.serviceType)}` : ''}`,
    subtitle: [e.pickup?.address, e.dropoff?.address].filter(Boolean).join(' → '),
    amount: e.total != null ? format(e.total) : null,
    action: customerErrandAction(e),
    status: label(e.status),
  })
  const serviceItem = (r) => ({
    key: `s-${r._id}`,
    to: customerServiceAction(r)?.to || customerServicePath(r),
    title: r.serviceType || r.category || 'Service request',
    subtitle: r.selectedProviderId?.fullName ? `with ${r.selectedProviderId.fullName}` : r.location?.address,
    amount: r.finalPrice != null ? format(r.finalPrice) : r.budget != null ? `Budget ${format(r.budget)}` : null,
    action: customerServiceAction(r),
    status: label(r.status),
  })

  const needsAction = [
    ...allErrands.filter((e) => customerErrandAction(e)).map(errandItem),
    ...allServices.filter((r) => customerServiceAction(r)).map(serviceItem),
  ]
  const inProgress = [
    ...allErrands.filter((e) => ERRAND_VIEWS.active(e) || ERRAND_VIEWS.finding(e)).map(errandItem),
    ...allServices.filter((r) => SERVICE_VIEWS.booked(r) || SERVICE_VIEWS.in_progress(r) || SERVICE_VIEWS.awaiting_quotes(r)).map(serviceItem),
  ]
  const recent = [
    ...allErrands.map((e) => ({ ...errandItem(e), at: e.updatedAt || e.createdAt })),
    ...allServices.map((r) => ({ ...serviceItem(r), at: r.updatedAt || r.createdAt })),
  ]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 5)
    .map(({ action, ...rest }) => rest) // recent shows status only

  const openErrands = allErrands.filter(ERRAND_VIEWS.open).length
  const activeErrands = allErrands.filter((e) => ERRAND_VIEWS.active(e) || ERRAND_VIEWS.finding(e)).length
  const openServices = allServices.filter(SERVICE_VIEWS.open).length
  const completed = allErrands.filter(ERRAND_VIEWS.completed).length + allServices.filter(SERVICE_VIEWS.completed).length

  if (errandsLoading || servicesLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-48 rounded-xl mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="card"><div className="skeleton h-12 rounded-xl" /></div>)}
        </div>
        <div className="card"><div className="skeleton h-40 rounded-xl" /></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">
          Welcome back, {user?.fullName?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-text-light mt-1">Here's what's happening with your errands and services.</p>
      </div>

      {/* Stats — each opens the matching list */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatLink to="#needs-action" label="Needs your action" value={needsAction.length} icon={FaBell} tone={needsAction.length ? 'yellow' : 'green'} hint={needsAction.length ? 'Tap to see' : 'All caught up'} testId="stat-needs-action" />
        <StatLink to="/customer/bookings?view=active" label="Errands in progress" value={activeErrands} icon={FaRunning} tone="blue" hint={`${openErrands} open`} testId="stat-errands-active" />
        <StatLink to="/customer/service-history?view=open" label="Service requests" value={openServices} icon={FaTools} tone="purple" hint="open" testId="stat-services-open" />
        <StatLink to="/customer/bookings?view=completed" label="Completed" value={completed} icon={FaCheckCircle} tone="green" testId="stat-completed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <JobList
          id="needs-action"
          testId="needs-action-list"
          title="Needs your action"
          items={needsAction}
          empty="Nothing needs you right now."
        />
        <JobList
          testId="in-progress-list"
          title="In progress"
          items={inProgress.slice(0, 6)}
          empty="No errands or jobs in progress."
          viewAllTo="/customer/bookings?view=active"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Link to="/customer/create-errand" className="card hover:shadow-large transition-shadow flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-text">Create New Errand</h3>
            <p className="text-text-light text-sm">Get help with your errands</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <FaPlus className="text-primary text-xl" />
          </div>
        </Link>
        <Link to="/services" className="card hover:shadow-large transition-shadow flex items-center justify-between group">
          <div>
            <h3 className="text-lg font-semibold text-text">Book a Service</h3>
            <p className="text-text-light text-sm">Get quotes from local providers</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
            <FaClock className="text-secondary text-xl" />
          </div>
        </Link>
      </div>

      <JobList testId="recent-list" title="Recent activity" items={recent} empty="No activity yet — create your first errand." viewAllTo="/customer/bookings" />
    </div>
  )
}

export default CustomerDashboard
