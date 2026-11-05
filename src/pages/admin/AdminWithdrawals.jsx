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

  const totals = useMemo(() => {
    const t = {}
    withdrawals.forEach((w) => {
      const cur = w.currency || 'GBP'
      t[cur] = (t[cur] || 0) + (w.amount || 0)
    })
    return t
  }, [withdrawals])

  const act = async (w, action) => {
    let failureReason
    if (action === 'rejected') {
      failureReason = window.prompt('Reason for rejecting this withdrawal (shown to the user):', 'Bank details could not be verified')
      if (failureReason === null) return
    } else {
      const isNG = (w.country || 'GB') === 'NG'
      const msg = isNG
        ? `Send ${formatMoney(w.amount, w.currency)} to ${w.bankDetails?.accountName || w.userId?.fullName} via Paystack?`
        : `Confirm you have paid ${formatMoney(w.amount, w.currency)} to ${w.userId?.fullName} by bank transfer?`
      if (!window.confirm(msg)) return
    }
    setBusyId(w._id)
    try {
      const res = await processWithdrawal({ id: w._id, data: { status: action, failureReason } }).unwrap()
      toast.success(res.message || 'Done')
      refetch()
    } catch (e) {
      toast.error(e.data?.message || 'Failed to process withdrawal')
      refetch()
    } finally {
      setBusyId(null)
    }
  }

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
    </div>
  )
}

export default AdminWithdrawals
