import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaIdCard, FaCheck, FaTimes, FaFlask, FaUserCheck } from 'react-icons/fa'
import { useGetIdentityChecksQuery, useReviewIdentityCheckMutation, useMarkIdentityVerifiedMutation } from '../../redux/services/identityApi'

const STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  in_review: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-800',
  awaiting_payment: 'bg-gray-100 text-text-light',
  awaiting_start: 'bg-gray-100 text-text-light',
  error: 'bg-red-50 text-red-600',
  cancelled: 'bg-gray-100 text-text-light',
}
const VENDOR = { dojah: 'Dojah (NIN)', didit: 'Didit (ID + selfie)', mock: 'Test mode', manual: 'Admin' }
const roleLabel = (r) => (r === 'errand_runner' ? 'Runner' : 'Provider')

/** Admin → Verification: automated identity checks (Dojah / Didit). */
export default function AdminIdentityChecks() {
  const [status, setStatus] = useState('in_review')
  const { data, isLoading, refetch } = useGetIdentityChecksQuery({ status })
  const [review, { isLoading: reviewing }] = useReviewIdentityCheckMutation()
  const [markVerified, { isLoading: marking }] = useMarkIdentityVerifiedMutation()
  const [showUnverified, setShowUnverified] = useState(false)

  const decide = async (check, decision) => {
    const note = decision === 'decline' ? window.prompt('Reason shown to the person:', check.result?.reason || '') : ''
    if (decision === 'decline' && note === null) return
    try {
      await review({ id: check._id, decision, note }).unwrap()
      toast.success(decision === 'approve' ? 'Approved' : 'Declined')
      refetch()
    } catch (e) {
      toast.error(e.data?.message || 'Could not update')
    }
  }

  const mark = async (user) => {
    const note = window.prompt(`Mark ${user.fullName} as verified? Add a note (e.g. "checked ID in person"):`, '')
    if (note === null) return
    try {
      await markVerified({ userId: user._id, note }).unwrap()
      toast.success(`${user.fullName} marked as verified`)
      refetch()
    } catch (e) {
      toast.error(e.data?.message || 'Could not update')
    }
  }

  const checks = data?.checks || []

  return (
    <div className="card mb-6" data-testid="admin-identity-checks">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FaIdCard className="text-primary" />
          <h2 className="text-lg font-semibold text-text">Identity checks</h2>
          {data?.mock && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1"><FaFlask /> Test mode (VERIFICATION_MOCK)</span>
          )}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field py-2 w-44" data-testid="identity-status-filter">
          <option value="in_review">Needs review</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="pending">In progress</option>
          <option value="error">Errors</option>
          <option value="all">All</option>
        </select>
      </div>

      {data?.settings && (
        <p className="text-sm text-text-light mb-4">
          {data.settings.paidBy === 'worker'
            ? `Providers/runners pay £${data.settings.feeGB} (UK) / ₦${data.settings.feeNG} (NG) per check.`
            : 'Geobuy pays for each check.'}{' '}
          {data.settings.autoApprove ? 'Accounts are approved automatically when the check passes.' : 'An admin approves each account after the check.'}{' '}
          <button className="text-primary hover:underline" onClick={() => setShowUnverified((v) => !v)}>
            {data.unverified} not verified yet
          </button>
        </p>
      )}

      {showUnverified && (
        <div className="mb-4 border rounded-lg divide-y" data-testid="identity-unverified">
          {(data?.unverifiedUsers || []).map((u) => (
            <div key={u._id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span className="min-w-0 truncate">{u.fullName} · {roleLabel(u.role)} · {u.country || 'GB'} <span className="text-text-lighter">{u.email}</span></span>
              <button onClick={() => mark(u)} disabled={marking} className="btn-outline text-xs py-1 px-3 flex items-center gap-1 whitespace-nowrap"><FaUserCheck /> Mark verified</button>
            </div>
          ))}
          {!data?.unverifiedUsers?.length && <p className="p-3 text-sm text-text-light">Everyone is verified.</p>}
        </div>
      )}

      {isLoading ? (
        <div className="skeleton h-24 rounded-xl" />
      ) : checks.length === 0 ? (
        <p className="text-sm text-text-light py-4 text-center">No identity checks here.</p>
      ) : (
        <div className="space-y-2">
          {checks.map((c) => (
            <div key={c._id} className="p-3 bg-gray-50 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3" data-testid="identity-check-row">
              <div className="min-w-0 text-sm">
                <p className="font-medium text-text">
                  {c.userId?.fullName || 'Unknown'} <span className="text-text-lighter font-normal">· {roleLabel(c.role || c.userId?.role)} · {c.country}</span>
                </p>
                <p className="text-text-light">
                  {VENDOR[c.vendor] || c.vendor}
                  {c.ninLast4 ? ` · NIN •••${c.ninLast4}` : ''}
                  {c.result?.firstName || c.result?.lastName ? ` · On record: ${[c.result.firstName, c.result.middleName, c.result.lastName].filter(Boolean).join(' ')}` : ''}
                  {c.result?.dateOfBirth ? ` (${c.result.dateOfBirth})` : ''}
                </p>
                {c.result?.reason && <p className="text-xs text-text-lighter">{c.result.reason}</p>}
                {c.fee > 0 && <p className="text-xs text-text-lighter">Fee {c.currency} {c.fee} · {c.paymentStatus}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[c.status] || 'bg-gray-100'}`}>{c.status.replace(/_/g, ' ')}</span>
                {['in_review', 'declined', 'error'].includes(c.status) && (
                  <button onClick={() => decide(c, 'approve')} disabled={reviewing} className="btn-primary text-xs py-1 px-3 flex items-center gap-1"><FaCheck /> Approve</button>
                )}
                {['in_review', 'approved'].includes(c.status) && (
                  <button onClick={() => decide(c, 'decline')} disabled={reviewing} className="text-xs py-1 px-3 text-red-600 hover:underline flex items-center gap-1"><FaTimes /> Decline</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
