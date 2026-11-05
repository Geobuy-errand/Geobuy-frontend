import React from 'react'
import VerificationPage from '../../components/verification/VerificationPage'

// Country-aware documents: UK (ID, address, right to work) / Nigeria (NIN slip, utility bill)
const ErrandVerification = () => <VerificationPage role="errand_runner" />

export default ErrandVerification
