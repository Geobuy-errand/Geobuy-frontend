import React, { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaCheck, FaTimes, FaSpinner, FaMoneyCheckAlt } from 'react-icons/fa'
import { useGetAdminWithdrawalsQuery, useProcessWithdrawalMutation } from '../../redux/services/walletApi'
import { formatMoney } from '../../utils/money'

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  rejected: 'bg-red-100 text-red-700',
}

/**
 * Admin payout queue.
 *  - Nigeria: "Approve & pay" sends a Paystack Transfer to the verified account.
 *  - UK: pay by bank transfer yourself, then "Mark as paid".
 */
const AdminWithdrawals = () => {
  const [status, setStatus] = useState('pending')
  const [country, setCountry] = useState('')
  const { data: withdrawals = [], isLoading, refetch } = useGetAdminWithdrawalsQuery({ status, country })
  const [processWithdrawal] = useProcessWithdrawalMutation()
  const [busyId, setBusyId] = useState(null)

  // Modal state
  const [approveModal, setApproveModal] = useState(null) // withdrawal object
  const [rejectModal, setRejectModal] = useState(null) // withdrawal object
  const [rejectReason, setRejectReason] = useState('Bank details could not be verified')

  const totals = useMemo(() => {
    const t = {}
    withdrawals.forEach((w) => {
      const cur = w.currency || 'GBP'
      t[cur] = (t[cur] || 0) + (w.amount || 0)
    })
    return t
  }, [withdrawals])

  const closeModals = () => {
    if (busyId) return
    setApproveModal(null)
    setRejectModal(null)
  }

  // Esc closes whichever modal is open
  React.useEffect(() => {
    const anyOpen = approveModal || rejectModal
    if (!anyOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeModals()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveModal, rejectModal, busyId])

  const runAction = async (w, action, failureReason) => {
    setBusyId(w._id)
    try {
      const res = await processWithdrawal({ id: w._id, data: { status: action, failureReason } }).unwrap()
      toast.success(res.message || 'Done')
      setApproveModal(null)
      setRejectModal(null)
      refetch()
    } catch (e) {
      toast.error(e.data?.message || 'Failed to process withdrawal')
      refetch()
    } finally {
      setBusyId(null)
    }
  }

  const confirmApprove = () => {
    const w = approveModal
    if (!w) return
    const isNG = (w.country || 'GB') === 'NG'
    runAction(w, isNG ? 'approved' : 'completed')
  }

  const confirmReject = () => {
    const w = rejectModal
    if (!w) return
    runAction(w, 'rejected', rejectReason.trim())
  }

  // Helpers to open modals from the table
  const act = (w, action) => {
    if (action === 'rejected') {
      setRejectReason('Bank details could not be verified')
      setRejectModal(w)
    } else {
      setApproveModal(w)
    }
  }

  const approveIsNG = approveModal ? (approveModal.country || 'GB') === 'NG' : false

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text flex items-center gap-2">
          <FaMoneyCheckAlt className="text-primary" /> Withdrawals
        </h1>
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field py-2">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-field py-2">
            <option value="">All countries</option>
            <option value="GB">🇬🇧 United Kingdom</option>
            <option value="NG">🇳🇬 Nigeria</option>
          </select>
        </div>
      </div>

      {Object.keys(totals).length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {Object.entries(totals).map(([cur, total]) => (
            <div key={cur} className="card py-3 px-4">
              <p className="text-xs text-text-light">Total ({cur})</p>
              <p className="text-xl font-bold text-primary">{formatMoney(total, cur)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="py-12 text-center">
            <FaSpinner className="animate-spin text-primary text-2xl mx-auto" />
          </div>
        ) : withdrawals.length === 0 ? (
          <p className="text-text-light text-sm py-8 text-center">No withdrawals</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-light border-b">
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Bank</th>
                <th className="py-3 px-3">Requested</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => {
                const isNG = (w.country || 'GB') === 'NG'
                return (
                  <tr key={w._id} className="border-b last:border-0">
                    <td className="py-3 px-3">
                      <p className="font-medium text-text">
                        {isNG ? '🇳🇬' : '🇬🇧'} {w.userId?.fullName}
                      </p>
                      <p className="text-xs text-text-lighter">{w.userId?.email}</p>
                    </td>
                    <td className="py-3 px-3 font-semibold text-primary">{formatMoney(w.amount, w.currency)}</td>
                    <td className="py-3 px-3">
                      <p>{w.bankDetails?.bankName}</p>
                      <p className="text-xs text-text-lighter">
                        {isNG ? '' : `${w.bankDetails?.sortCode || ''} • `}
                        {w.bankDetails?.accountNumber}
                        {w.bankDetails?.accountName ? ` • ${w.bankDetails.accountName}` : ''}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-text-light">{new Date(w.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[w.status] || 'bg-gray-100'}`}>{w.status}</span>
                      {w.failureReason && <p className="text-xs text-red-500 mt-1">{w.failureReason}</p>}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {w.status === 'pending' && (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => act(w, isNG ? 'approved' : 'completed')}
                            disabled={busyId === w._id}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 disabled:opacity-50"
                          >
                            {busyId === w._id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                            {isNG ? 'Approve & pay' : 'Mark as paid'}
                          </button>
                          <button
                            onClick={() => act(w, 'rejected')}
                            disabled={busyId === w._id}
                            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1 text-red-600 disabled:opacity-50"
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Approve / mark-as-paid modal */}
      {approveModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModals}
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-withdrawal-title"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 id="approve-withdrawal-title" className="text-lg font-semibold text-text mb-2">
              {approveIsNG ? 'Approve & pay withdrawal?' : 'Mark as paid?'}
            </h3>
            <p className="text-sm text-text-light mb-4">
              {approveIsNG ? 'This will send a Paystack transfer to:' : 'Confirm you have paid by bank transfer to:'}
            </p>
            <div className="rounded-lg bg-gray-50 p-4 mb-5 text-sm space-y-1">
              <p className="font-medium text-text">{approveModal.userId?.fullName}</p>
              <p className="text-text-light">{approveModal.bankDetails?.bankName}</p>
              <p className="text-text-light">
                {approveIsNG ? '' : `${approveModal.bankDetails?.sortCode || ''} • `}
                {approveModal.bankDetails?.accountNumber}
                {approveModal.bankDetails?.accountName ? ` • ${approveModal.bankDetails.accountName}` : ''}
              </p>
              <p className="text-primary font-bold pt-1">{formatMoney(approveModal.amount, approveModal.currency)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeModals}
                disabled={busyId === approveModal._id}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-text font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                disabled={busyId === approveModal._id}
                className="flex-1 py-2 px-4 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busyId === approveModal._id ? <FaSpinner className="animate-spin" /> : null}
                {busyId === approveModal._id ? 'Processing…' : approveIsNG ? 'Approve & pay' : 'Mark as paid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeModals}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-withdrawal-title"
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 id="reject-withdrawal-title" className="text-lg font-semibold text-text mb-2">
              Reject withdrawal
            </h3>
            <p className="text-sm text-text-light mb-4">
              {formatMoney(rejectModal.amount, rejectModal.currency)} requested by {rejectModal.userId?.fullName}. This reason will be
              shown to the user.
            </p>
            <label htmlFor="reject-reason" className="block text-sm font-medium text-text mb-1">
              Reason
            </label>
            <textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="input-field w-full mb-5"
              placeholder="Explain why this withdrawal is being rejected"
            />
            <div className="flex gap-3">
              <button
                onClick={closeModals}
                disabled={busyId === rejectModal._id}
                className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-text font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={busyId === rejectModal._id || !rejectReason.trim()}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busyId === rejectModal._id ? <FaSpinner className="animate-spin" /> : null}
                {busyId === rejectModal._id ? 'Rejecting…' : 'Reject withdrawal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWithdrawals