import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { FaShieldAlt, FaCheck, FaClock, FaTimes, FaUpload, FaFileAlt } from 'react-icons/fa'

const ProviderVerification = () => {
  const { user, providerProfile } = useSelector((state) => state.auth)
  const [uploading, setUploading] = useState(false)

  const verificationSteps = [
    {
      id: 'identity',
      label: 'Identity Verification',
      description: 'Upload your Passport or Driving Licence',
      status: user?.documents?.passport ? 'completed' : 'pending',
    },
    {
      id: 'address',
      label: 'Proof of Address',
      description: 'Upload a recent utility bill or bank statement',
      status: user?.documents?.proofOfAddress ? 'completed' : 'pending',
    },
    {
      id: 'work',
      label: 'Right to Work',
      description: 'Upload your right to work documentation',
      status: user?.documents?.rightToWork ? 'completed' : 'pending',
    },
    {
      id: 'driving',
      label: 'Driving Licence',
      description: 'Upload your driving licence',
      status: user?.documents?.drivingLicence ? 'completed' : 'pending',
    },
    {
      id: 'vehicle',
      label: 'Vehicle Registration',
      description: 'Upload your vehicle registration document',
      status: user?.documents?.vehicleRegistration ? 'completed' : 'pending',
    },
    {
      id: 'insurance',
      label: 'Vehicle Insurance',
      description: 'Upload your vehicle insurance certificate',
      status: user?.documents?.vehicleInsurance ? 'completed' : 'pending',
    },
  ]

  // Add DBS if care services are offered
  if (user?.renderCareServices) {
    verificationSteps.push({
      id: 'dbs',
      label: 'DBS Check',
      description: 'Upload your enhanced DBS certificate',
      status: user?.dbsDocument ? 'completed' : 'pending',
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center text-green-600 text-sm"><FaCheck className="mr-1" /> Verified</span>
      case 'pending':
        return <span className="flex items-center text-yellow-600 text-sm"><FaClock className="mr-1" /> Pending</span>
      case 'rejected':
        return <span className="flex items-center text-red-600 text-sm"><FaTimes className="mr-1" /> Rejected</span>
      default:
        return <span className="flex items-center text-gray-600 text-sm"><FaClock className="mr-1" /> Not Submitted</span>
    }
  }

  const handleUpload = (stepId) => {
    // In a real app, this would open a file picker and upload to Cloudinary
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      toast.success('Document uploaded successfully')
    }, 2000)
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Verification</h1>

      <div className="card mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FaShieldAlt className="text-2xl text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text">Verification Status</h2>
            <p className="text-text-light">
              Your account is currently{' '}
              <span className={`font-semibold ${
                user?.verificationStatus === 'approved' ? 'text-green-600' :
                user?.verificationStatus === 'rejected' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {user?.verificationStatus || 'pending'}
              </span>
            </p>
            {user?.rejectionReason && (
              <p className="text-red-600 text-sm mt-2">
                Reason: {user.rejectionReason}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {verificationSteps.map((step) => (
          <div key={step.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <FaFileAlt className="text-primary" />
                  <h3 className="font-semibold text-text">{step.label}</h3>
                </div>
                <p className="text-sm text-text-light mt-1">{step.description}</p>
                <div className="mt-2">
                  {getStatusBadge(step.status)}
                </div>
              </div>
              {step.status !== 'completed' && (
                <button
                  onClick={() => handleUpload(step.id)}
                  disabled={uploading}
                  className="btn-outline text-sm py-1 px-3 flex items-center space-x-1"
                >
                  <FaUpload />
                  <span>Upload</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> All documents are checked securely and stored safely. 
          We only ask what we need to confirm who you are, keep everyone protected, and pay you correctly.
        </p>
      </div>
    </div>
  )
}

export default ProviderVerification