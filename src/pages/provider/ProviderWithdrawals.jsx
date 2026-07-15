import React, { useState } from 'react'
import { useGetWalletQuery, useRequestWithdrawalMutation, useGetWithdrawalsQuery } from '../../redux/services/walletApi'
import { toast } from 'react-hot-toast'
import { FaMoneyBillWave, FaClock, FaCheck, FaTimes } from 'react-icons/fa'

const ProviderWithdrawals = () => {
  const { data: wallet, refetch: refetchWallet } = useGetWalletQuery()
  const { data: withdrawals, isLoading: withdrawalsLoading } = useGetWithdrawalsQuery()
  const [requestWithdrawal, { isLoading }] = useRequestWithdrawalMutation()
  const [amount, setAmount] = useState('')

  const handleWithdraw = async (e) => {
    e.preventDefault()
    const withdrawalAmount = parseFloat(amount)

    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (withdrawalAmount < 10) {
      toast.error('Minimum withdrawal amount is £10')
      return
    }

    if (withdrawalAmount > (wallet?.balance || 0)) {
      toast.error('Insufficient balance')
      return
    }

    try {
      await requestWithdrawal({ amount: withdrawalAmount }).unwrap()
      toast.success('Withdrawal request submitted successfully')
      setAmount('')
      refetchWallet()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to request withdrawal')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FaCheck />
      case 'processing': return <FaClock />
      case 'pending': return <FaClock />
      case 'failed': return <FaTimes />
      default: return <FaClock />
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Withdrawals</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdraw Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Request Withdrawal</h2>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-text-light">Available Balance</p>
            <p className="text-2xl font-bold text-primary">£{wallet?.balance?.toFixed(2) || '0.00'}</p>
          </div>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Amount (£)
              </label>
              <div className="relative">
                <FaMoneyBillWave className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field pl-10"
                  placeholder="0.00"
                  step="0.01"
                  min="10"
                  max={wallet?.balance || 0}
                  required
                />
              </div>
              <p className="text-xs text-text-lighter mt-1">Minimum withdrawal: £10.00</p>
            </div>
            <button
              type="submit"
              disabled={isLoading || !wallet?.balance}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Withdrawal History</h2>
          {withdrawalsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-16 rounded-xl"></div>
              ))}
            </div>
          ) : withdrawals?.length === 0 ? (
            <p className="text-text-light text-sm">No withdrawals yet</p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {withdrawals?.map((withdrawal) => (
                <div key={withdrawal._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full ${getStatusColor(withdrawal.status)} flex items-center justify-center`}>
                      {getStatusIcon(withdrawal.status)}
                    </div>
                    <div>
                      <p className="font-medium text-text">£{withdrawal.amount?.toFixed(2)}</p>
                      <p className="text-xs text-text-lighter">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProviderWithdrawals