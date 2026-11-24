import React from 'react'
import { Link } from 'react-router-dom'
import { FaWallet, FaArrowUp, FaArrowDown, FaLock, FaMoneyBillWave, FaUniversity } from 'react-icons/fa'
import { useGetWalletQuery, useGetTransactionsQuery } from '../../redux/services/walletApi'
import useCountry from '../../hooks/useCountry'

/**
 * Wallet for errand runners and service providers (UK and Nigeria).
 *
 *   Available   — released earnings; can be withdrawn now
 *   On hold     — customers have paid, waiting for them to confirm the job
 *   Withdrawing — withdrawal requests being paid out to the bank
 */
const WalletOverview = ({ withdrawalsPath }) => {
  const { format, country } = useCountry()
  const { data: wallet, isLoading: walletLoading } = useGetWalletQuery()
  const { data: transactions, isLoading: transactionsLoading } = useGetTransactionsQuery()

  if (walletLoading || transactionsLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-32 rounded-xl"></div>
        <div className="skeleton h-64 rounded-xl"></div>
      </div>
    )
  }

  const available = Number(wallet?.balance || 0)
  const minWithdrawal = Number(wallet?.minWithdrawal || 0)
  const canWithdraw = available >= minWithdrawal && available > 0
  const payoutText =
    country.code === 'NG'
      ? 'Withdrawals are approved by Geobuy and sent to your Nigerian bank account by Paystack.'
      : 'Withdrawals are approved by Geobuy and paid to your UK bank account by bank transfer.'

  const earningLabel = (e) => {
    if (e.errandId) return `Errand #${e.errandId.errandId || ''}`
    if (e.serviceRequestId) return `${e.serviceRequestId.serviceType || 'Service'} #${e.serviceRequestId.requestId || ''}`
    if (e.bookingId) return `Booking #${e.bookingId.bookingId || ''}`
    return 'Job'
  }

  const items = [
    ...(transactions?.earnings || []).map((e) => ({
      id: `e-${e._id}`,
      kind: 'earning',
      label: earningLabel(e),
      amount: e.providerAmount,
      date: e.releasedAt || e.createdAt,
    })),
    ...(transactions?.withdrawals || []).map((w) => ({
      id: `w-${w._id}`,
      kind: 'withdrawal',
      label: `Withdrawal — ${w.status}`,
      amount: w.amount,
      date: w.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Wallet</h1>

      <div className="card bg-gradient-to-br from-primary to-primary-dark text-white mb-6" data-testid="wallet-balance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-light text-sm">Available to withdraw</p>
            <p className="text-4xl font-bold mt-1">{format(available)}</p>
          </div>
          <FaWallet className="text-4xl text-white/20" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
          <div>
            <p className="text-primary-light text-xs sm:text-sm flex items-center gap-1">
              <FaLock className="text-[10px]" /> On hold
            </p>
            <p className="text-sm sm:text-lg font-semibold break-words">{format(wallet?.onHold || 0)}</p>
          </div>
          <div>
            <p className="text-primary-light text-xs sm:text-sm">Withdrawing</p>
            <p className="text-sm sm:text-lg font-semibold break-words">{format(wallet?.pendingBalance || 0)}</p>
          </div>
          <div>
            <p className="text-primary-light text-xs sm:text-sm">Total earned</p>
            <p className="text-sm sm:text-lg font-semibold break-words">{format(wallet?.totalEarned || 0)}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <Link
            to={withdrawalsPath}
            className={`bg-white text-primary font-semibold px-5 py-2 rounded-lg text-center flex items-center justify-center gap-2 ${
              canWithdraw ? 'hover:bg-gray-100' : 'opacity-70'
            }`}
          >
            <FaMoneyBillWave />
            <span>{wallet?.hasBankDetails ? 'Withdraw' : 'Add bank account & withdraw'}</span>
          </Link>
          {!canWithdraw && minWithdrawal > 0 && (
            <p className="text-xs text-primary-light">Minimum withdrawal is {format(minWithdrawal)}.</p>
          )}
        </div>
      </div>

      {Number(wallet?.onHold || 0) > 0 && (
        <div className="p-4 mb-6 rounded-lg bg-blue-50 text-blue-800 text-sm flex items-start gap-3">
          <FaLock className="mt-1 flex-shrink-0" />
          <p>
            {format(wallet.onHold)} from paid jobs you're working on is held securely. It moves to your available balance when the customer
            confirms the job is done (or automatically after the waiting period).
          </p>
        </div>
      )}

      <div className="p-4 mb-6 rounded-lg bg-gray-50 text-text-light text-sm flex items-start gap-3">
        <FaUniversity className="mt-1 flex-shrink-0" />
        <p>{payoutText}</p>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-text mb-4">Recent activity</h2>
        {items.length === 0 ? (
          <p className="text-text-light text-sm">No earnings yet. Completed, paid jobs will appear here.</p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 15).map((it) => (
              <div
                key={it.id}
                className={`flex items-center justify-between p-3 rounded-lg ${it.kind === 'earning' ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex items-center space-x-3">
                  {it.kind === 'earning' ? <FaArrowDown className="text-green-600" /> : <FaArrowUp className="text-red-600" />}
                  <div>
                    <p className="font-medium text-text">{it.kind === 'earning' ? 'Earnings received' : 'Withdrawal'}</p>
                    <p className="text-sm text-text-light">{it.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${it.kind === 'earning' ? 'text-green-600' : 'text-red-600'}`}>
                    {it.kind === 'earning' ? '+' : '-'}
                    {format(it.amount)}
                  </p>
                  <p className="text-xs text-text-lighter">{it.date ? new Date(it.date).toLocaleDateString() : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletOverview
