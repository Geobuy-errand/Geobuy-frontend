import React from 'react'
import WalletOverview from '../../components/wallet/WalletOverview'

// Shared with errand runners — available balance, money on hold, withdrawals (UK + Nigeria)
const ProviderWallet = () => <WalletOverview withdrawalsPath="/provider/withdrawals" />

export default ProviderWallet
