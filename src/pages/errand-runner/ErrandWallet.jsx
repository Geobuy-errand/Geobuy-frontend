import React from 'react'
import WalletOverview from '../../components/wallet/WalletOverview'

// Shared with service providers — available balance, money on hold, withdrawals (UK + Nigeria)
const ErrandWallet = () => <WalletOverview withdrawalsPath="/errand-runner/withdrawals" />

export default ErrandWallet
