import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { FaMoneyBillWave, FaClock, FaCheck, FaTimes, FaUniversity, FaCheckCircle, FaSpinner } from 'react-icons/fa'
import { useGetWalletQuery, useRequestWithdrawalMutation, useGetWithdrawalsQuery } from '../../redux/services/walletApi'
import { updateUser } from '../../redux/slices/authSlice'
import { useGetCurrentUserQuery } from '../../redux/services/authApi'
import useCountry from '../../hooks/useCountry'
import http from '../../services/http'
import BankDetailsFields from '../forms/BankDetailsFields'

/** Saved payout account + edit form (UK sort code / Nigeria NUBAN verified with Paystack). */
const BankAccountCard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  // The login response doesn't include bank details, so read them fresh
  const { data: me, refetch: refetchMe } = useGetCurrentUserQuery()
  const { code, isNigeria } = useCountry()
  const saved = me?.user?.bankDetails || user?.bankDetails || {}
  const hasSaved = Boolean(saved.accountNumber)
  const [editing, setEditing] = useState(!hasSaved)
  const [bank, setBank] = useState({ bankName: '', bankCode: '', sortCode: '', accountNumber: '' })
  const [resolvedName, setResolvedName] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => setEditing(!hasSaved), [hasSaved])

  const onChange = (e) => {
    const key = e.target.name.split('.')[1]
    setBank((b) => ({ ...b, [key]: e.target.value }))
    setResolvedName('')
  }

  // Nigeria: look up the account name as soon as we have bank + 10 digits
  useEffect(() => {
    if (!isNigeria || !bank.bankCode || !/^\d{10}$/.test(bank.accountNumber)) return undefined
    let cancelled = false
    setBusy(true)
    http
      .post('/wallet/bank-account/resolve', { accountNumber: bank.accountNumber, bankCode: bank.bankCode })
      .then((r) => !cancelled && setResolvedName(r.data.accountName))
      .catch((err) => !cancelled && toast.error(err.response?.data?.message || 'Could not verify account'))
      .finally(() => !cancelled && setBusy(false))
    return () => {
      cancelled = true
    }
  }, [isNigeria, bank.bankCode, bank.accountNumber])

  const save = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await http.put('/wallet/bank-account', { ...bank, accountName: resolvedName || undefined })
      dispatch(updateUser({ bankDetails: data.bankDetails }))
      refetchMe()
      toast.success('Bank account saved')
      setEditing(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save bank account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-text flex items-center gap-2">
          <FaUniversity className="text-primary" /> Payout account
        </h2>
        {hasSaved && !editing && (
          <button type="button" onClick={() => setEditing(true)} className="text-sm text-primary hover:underline">
            Change
          </button>
        )}
      </div>

      {!editing ? (
        <div className="text-sm text-text-light">
          <p className="font-medium text-text">{saved.accountName || saved.bankName}</p>
          <p>
            {saved.bankName} • ****{String(saved.accountNumber).slice(-4)}
            {!isNigeria && saved.sortCode ? ` • ${saved.sortCode}` : ''}
          </p>
          {isNigeria &&
            (saved.isVerified ? (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <FaCheckCircle /> Verified with your bank
              </p>
            ) : (
              <p className="text-amber-600 text-xs mt-1">Not verified yet — re-save to verify</p>
            ))}
        </div>
      ) : (
        <form onSubmit={save} className="space-y-3">
          <BankDetailsFields
            country={code}
            bankDetails={bank}
            onChange={onChange}
            setBankDetails={(b) => {
              setBank((prev) => ({ ...prev, ...b }))
              setResolvedName('')
            }}
          />
          {isNigeria && (
            <p className="text-sm">
              {busy && !resolvedName ? (
                <span className="text-text-lighter flex items-center gap-2">
                  <FaSpinner className="animate-spin" /> Checking account name...
                </span>
              ) : resolvedName ? (
                <span className="text-green-700 flex items-center gap-2">
                  <FaCheckCircle /> {resolvedName}
                </span>
              ) : null}
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={busy || (isNigeria && !resolvedName)} className="btn-primary text-sm py-2 px-4 disabled:opacity-50">
              Save account
            </button>
            {hasSaved && (
              <button type="button" onClick={() => setEditing(false)} className="btn-outline text-sm py-2 px-4">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

const statusColor = (status) =>
  ({
    completed: 'text-green-600 bg-green-100',
    processing: 'text-blue-600 bg-blue-100',
    pending: 'text-yellow-600 bg-yellow-100',
    failed: 'text-red-600 bg-red-100',
    rejected: 'text-red-600 bg-red-100',
  }[status] || 'text-gray-600 bg-gray-100')

const statusIcon = (status) => (status === 'completed' ? <FaCheck /> : ['failed', 'rejected'].includes(status) ? <FaTimes /> : <FaClock />)

/** Withdrawals page shared by providers and errand runners. */
const WithdrawalsPage = () => {
  const { format, symbol, isNigeria } = useCountry()
  const { user } = useSelector((s) => s.auth)
  const { data: me } = useGetCurrentUserQuery()
  const { data: wallet, refetch: refetchWallet } = useGetWalletQuery()
  const { data: withdrawals, isLoading: withdrawalsLoading } = useGetWithdrawalsQuery()
  const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation()
  const [amount, setAmount] = useState('')

  const minWithdrawal = wallet?.minWithdrawal ?? (isNigeria ? 1000 : 10)
  const hasBank = Boolean((me?.user?.bankDetails || user?.bankDetails)?.accountNumber)

  const handleWithdraw = async (e) => {
    e.preventDefault()
    const withdrawalAmount = parseFloat(amount)
    if (Number.isNaN(withdrawalAmount) || withdrawalAmount <= 0) return toast.error('Please enter a valid amount')
    if (withdrawalAmount < minWithdrawal) return toast.error(`Minimum withdrawal amount is ${format(minWithdrawal)}`)
    if (withdrawalAmount > (wallet?.balance || 0)) return toast.error('Insufficient balance')
    if (!hasBank) return toast.error('Please add your bank account first')

    try {
      await requestWithdrawal({ amount: withdrawalAmount }).unwrap()
      toast.success('Withdrawal request submitted successfully')
      setAmount('')
      refetchWallet()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to request withdrawal')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Withdrawals</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BankAccountCard />

        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Request Withdrawal</h2>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-text-light">Available Balance</p>
            <p className="text-2xl font-bold text-primary">{format(wallet?.balance)}</p>
            {wallet?.pendingBalance > 0 && <p className="text-xs text-text-lighter">{format(wallet.pendingBalance)} being paid out</p>}
          </div>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">Amount ({symbol})</label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field pl-10"
                  placeholder="0.00"
                  step="0.01"
                  min={minWithdrawal}
                  max={wallet?.balance || 0}
                  required
                />
              </div>
              <p className="text-xs text-text-lighter mt-1">
                Minimum withdrawal: {format(minWithdrawal)}
                {isNigeria ? ' • Paid to your bank via Paystack after approval' : ' • Paid by bank transfer after approval'}
              </p>
            </div>
            <button type="submit" disabled={isLoading || !wallet?.balance || !hasBank} className="w-full btn-primary disabled:opacity-50">
              {isLoading ? 'Processing...' : hasBank ? 'Request Withdrawal' : 'Add a bank account first'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Withdrawal History</h2>
          {withdrawalsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-xl"></div>
              ))}
            </div>
          ) : !withdrawals?.length ? (
            <p className="text-text-light text-sm">No withdrawals yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {withdrawals.map((w) => (
                <div key={w._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${statusColor(w.status)} flex items-center justify-center`}>{statusIcon(w.status)}</div>
                    <div>
                      <p className="font-medium text-text">{format(w.amount, w.currency)}</p>
                      <p className="text-xs text-text-lighter">{new Date(w.createdAt).toLocaleDateString()}</p>
                      {w.failureReason && <p className="text-xs text-red-500">{w.failureReason}</p>}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(w.status)}`}>{w.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WithdrawalsPage
