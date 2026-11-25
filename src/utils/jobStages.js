// Where an errand / service request is, what the viewer should do next,
// and which detail page continues the process. Used by the dashboards and
// the list pages so the numbers, filters and links always agree.

const id = (v) => String(v?._id || v?.id || v || '')
export const sameId = (a, b) => !!a && !!b && id(a) === id(b)

// ---------------- Errands ----------------
export const ERRAND_VIEWS = {
  needs_payment: (e) => e.status === 'pending' && e.paymentStatus === 'pending',
  finding: (e) => e.status === 'pending' && e.paymentStatus !== 'pending',
  active: (e) => ['accepted', 'en_route', 'collected'].includes(e.status),
  to_confirm: (e) => e.status === 'delivered',
  open: (e) => !['completed', 'cancelled'].includes(e.status),
  completed: (e) => e.status === 'completed',
  cancelled: (e) => e.status === 'cancelled',
}

export const ERRAND_VIEW_LABELS = {
  open: 'All open',
  needs_payment: 'Waiting for payment',
  finding: 'Finding a runner',
  active: 'In progress',
  to_confirm: 'Delivered — confirm',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const matchesErrandView = (e, view) => !view || view === 'all' || (ERRAND_VIEWS[view] ? ERRAND_VIEWS[view](e) : e.status === view)

/** Customer: the next step on an errand, or null if nothing to do. */
export function customerErrandAction(e) {
  if (ERRAND_VIEWS.needs_payment(e)) return { label: 'Pay now', tone: 'warning', to: `/customer/booking/${e._id}` }
  if (ERRAND_VIEWS.to_confirm(e)) return { label: 'Confirm delivery', tone: 'primary', to: `/customer/errand/${e._id}` }
  return null
}
export const customerErrandPath = (e) => (ERRAND_VIEWS.needs_payment(e) || ['completed', 'cancelled'].includes(e.status) ? `/customer/booking/${e._id}` : `/customer/errand/${e._id}`)

/** Runner: the next step on an errand they've accepted. */
export function runnerErrandAction(e) {
  return {
    accepted: { label: 'Start journey', tone: 'primary' },
    en_route: { label: 'Mark collected', tone: 'primary' },
    collected: { label: 'Mark delivered', tone: 'primary' },
    delivered: { label: 'Waiting for customer to confirm', tone: 'muted' },
  }[e.status] || null
}

// ---------------- Service requests ----------------
export const SERVICE_VIEWS = {
  awaiting_quotes: (r) => r.status === 'pending',
  quotes: (r) => ['quotes_received', 'negotiating'].includes(r.status),
  needs_payment: (r) => r.status === 'provider_selected' && r.paymentStatus === 'pending',
  booked: (r) => r.status === 'provider_selected' && r.paymentStatus !== 'pending',
  in_progress: (r) => r.status === 'in_progress',
  to_confirm: (r) => r.status === 'awaiting_confirmation',
  active: (r) => ['provider_selected', 'in_progress', 'awaiting_confirmation'].includes(r.status),
  open: (r) => !['completed', 'cancelled', 'expired'].includes(r.status),
  completed: (r) => r.status === 'completed',
  cancelled: (r) => ['cancelled', 'expired'].includes(r.status),
}

export const SERVICE_VIEW_LABELS = {
  open: 'All open',
  awaiting_quotes: 'Waiting for quotes',
  quotes: 'Quotes & offers',
  needs_payment: 'Waiting for payment',
  booked: 'Booked',
  in_progress: 'In progress',
  to_confirm: 'Done — confirm',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const matchesServiceView = (r, view) => !view || view === 'all' || (SERVICE_VIEWS[view] ? SERVICE_VIEWS[view](r) : r.status === view)

export function customerServiceAction(r) {
  if (SERVICE_VIEWS.quotes(r)) return { label: r.status === 'negotiating' ? 'Review offers' : 'Compare quotes', tone: 'primary', to: `/customer/quote-comparison/${r._id}` }
  if (SERVICE_VIEWS.needs_payment(r)) return { label: 'Pay now', tone: 'warning', to: `/customer/service-request/${r._id}` }
  if (SERVICE_VIEWS.to_confirm(r)) return { label: 'Confirm job is done', tone: 'primary', to: `/customer/service-request/${r._id}` }
  return null
}
export const customerServicePath = (r) => (SERVICE_VIEWS.quotes(r) ? `/customer/quote-comparison/${r._id}` : `/customer/service-request/${r._id}`)

// Provider view (the API adds providerStage / isMine / myQuote)
export const PROVIDER_VIEWS = {
  new: (r) => r.providerStage === 'pending_quote',
  respond: (r) => r.providerStage === 'respond_to_counter',
  waiting: (r) => r.providerStage === 'awaiting_customer',
  quoted: (r) => ['respond_to_counter', 'awaiting_customer'].includes(r.providerStage),
  awaiting_payment: (r) => r.isMine && r.status === 'provider_selected' && r.paymentStatus === 'pending',
  ready: (r) => r.isMine && r.status === 'provider_selected' && r.paymentStatus !== 'pending',
  in_progress: (r) => r.isMine && r.status === 'in_progress',
  to_confirm: (r) => r.isMine && r.status === 'awaiting_confirmation',
  active: (r) => r.isMine && ['provider_selected', 'in_progress', 'awaiting_confirmation'].includes(r.status),
  completed: (r) => r.isMine && r.status === 'completed',
}

export function providerAction(r) {
  if (PROVIDER_VIEWS.new(r)) return { label: 'Send a quote', tone: 'primary' }
  if (PROVIDER_VIEWS.respond(r)) return { label: 'Respond to counter-offer', tone: 'warning' }
  if (PROVIDER_VIEWS.waiting(r)) return { label: 'Waiting for the customer', tone: 'muted' }
  if (PROVIDER_VIEWS.awaiting_payment(r)) return { label: 'Waiting for payment', tone: 'muted' }
  if (PROVIDER_VIEWS.ready(r)) return { label: 'Start the job', tone: 'primary' }
  if (PROVIDER_VIEWS.in_progress(r)) return { label: 'Mark job done', tone: 'primary' }
  if (PROVIDER_VIEWS.to_confirm(r)) return { label: 'Waiting for customer to confirm', tone: 'muted' }
  return null
}
export const providerPath = (r) => `/provider/job/${r._id}`
