import React from 'react'
import VerificationPage from '../../components/verification/VerificationPage'

// Country-aware documents: UK (ID, address, right to work) / Nigeria (NIN slip, utility bill)
const ServiceProviderVerification = () => <VerificationPage role="provider" />

export default ServiceProviderVerification
