import React from 'react'
import { useGetWalletQuery, useGetTransactionsQuery } from '../../redux/services/walletApi'
import { FaWallet, FaArrowUp, FaArrowDown, FaClock } from 'react-icons/fa'
import useCountry from '../../hooks/useCountry'

const ProviderWallet = () => {
  const { format, country: userCountry, distanceUnitLabel } = useCountry()
  const { data: wallet, isLoading: walletLoading } = useGetWalletQuery()
  const { data: transactions, isLoading: transactionsLoading } = useGetTransactionsQuery()

  const isLoading = walletLoading || transactionsLoading

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Wallet</h1>

      {isLoading ? (
        <div className="space-y-4">
          <div className="skeleton h-32 rounded-xl"></div>
          <div className="skeleton h-64 rounded-xl"></div>
        </div>
      ) : (
        <>
          {/* Balance Card */}
          <div className="card bg-gradient-to-br from-primary to-primary-dark text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-light text-sm">Available Balance</p>
                <p className="text-4xl font-bold mt-1">
                  {format(wallet?.balance)}
                </p>
              </div>
              <FaWallet className="text-4xl text-white/20" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
              <div>
                <p className="text-primary-light text-sm">Total Earned</p>
                <p className="text-lg font-semibold">{format(wallet?.totalEarned)}</p>
              </div>
              <div>
                <p className="text-primary-light text-sm">Pending Balance</p>
                <p className="text-lg font-semibold">{format(wallet?.pendingBalance)}</p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-text mb-4">Recent Transactions</h2>
            {transactions?.earnings?.length === 0 && transactions?.withdrawals?.length === 0 ? (
              <p className="text-text-light text-sm">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions?.earnings?.slice(0, 5).map((earning) => (
                  <div key={earning._id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaArrowDown className="text-green-600" />
                      <div>
                        <p className="font-medium text-text">Payment Received</p>
                        <p className="text-sm text-text-light">
                          Booking #{earning.bookingId?.bookingId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">+{format(earning.providerAmount)}</p>
                      <p className="text-xs text-text-lighter">
                        {new Date(earning.releasedAt || earning.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {transactions?.withdrawals?.slice(0, 5).map((withdrawal) => (
                  <div key={withdrawal._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FaArrowUp className="text-red-600" />
                      <div>
                        <p className="font-medium text-text">Withdrawal</p>
                        <p className="text-sm text-text-light">
                          {withdrawal.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">-{format(withdrawal.amount)}</p>
                      <p className="text-xs text-text-lighter">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ProviderWallet