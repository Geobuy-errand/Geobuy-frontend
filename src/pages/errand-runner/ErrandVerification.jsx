import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetErrandRunnerProfileQuery } from '../../redux/services/errandRunnerApi'
import { toast } from 'react-hot-toast'
import { FaShieldAlt, FaCheck, FaClock, FaTimes, FaUpload, FaFileAlt, FaIdCard, FaCar, FaHome, FaBriefcase } from 'react-icons/fa'
import axios from 'axios'

const ErrandVerification = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: profile, refetch } = useGetErrandRunnerProfileQuery()
  const [uploading, setUploading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState({
    passport: profile?.documents?.passport || '',
    drivingLicence: profile?.documents?.drivingLicence || '',
    proofOfAddress: profile?.documents?.proofOfAddress || '',
    rightToWork: profile?.documents?.rightToWork || '',
    vehicleRegistration: profile?.documents?.vehicleRegistration || '',
    vehicleInsurance: profile?.documents?.vehicleInsurance || '',
    dbs: profile?.dbsDocument || '',
  })

  const verificationSteps = [
    {
      id: 'passport',
      label: 'Identity Verification',
      description: 'Upload your Passport or Driving Licence',
      status: uploadedDocs.passport ? 'completed' : 'pending',
      icon: FaIdCard,
    },
    {
      id: 'proofOfAddress',
      label: 'Proof of Address',
      description: 'Upload a recent utility bill or bank statement',
      status: uploadedDocs.proofOfAddress ? 'completed' : 'pending',
      icon: FaHome,
    },
    {
      id: 'rightToWork',
      label: 'Right to Work',
      description: 'Upload your right to work documentation',
      status: uploadedDocs.rightToWork ? 'completed' : 'pending',
      icon: FaBriefcase,
    },
    {
      id: 'drivingLicence',
      label: 'Driving Licence',
      description: 'Upload your driving licence',
      status: uploadedDocs.drivingLicence ? 'completed' : 'pending',
      icon: FaIdCard,
    },
    {
      id: 'vehicleRegistration',
      label: 'Vehicle Registration',
      description: 'Upload your vehicle registration document',
      status: uploadedDocs.vehicleRegistration ? 'completed' : 'pending',
      icon: FaCar,
    },
    {
      id: 'vehicleInsurance',
      label: 'Vehicle Insurance',
      description: 'Upload your vehicle insurance certificate',
      status: uploadedDocs.vehicleInsurance ? 'completed' : 'pending',
      icon: FaShieldAlt,
    },
  ]

  // Add DBS if care services are offered
  if (user?.renderCareServices) {
    verificationSteps.push({
      id: 'dbs',
      label: 'DBS Check',
      description: 'Upload your enhanced DBS certificate',
      status: uploadedDocs.dbs ? 'completed' : 'pending',
      icon: FaShieldAlt,
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

  const handleDocumentUpload = async (docType, file) => {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    const formData = new FormData()
    formData.append('document', file)
    formData.append('documentType', docType)

    setUploading(true)
    try {
      const response = await axios.post(
        `/api/verifications/upload`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      if (response.data.fileUrl) {
        setUploadedDocs(prev => ({
          ...prev,
          [docType]: response.data.fileUrl,
        }))
        toast.success(`${docType} uploaded successfully!`)
        refetch()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const requestVerification = async () => {
    try {
      const response = await axios.post(
        '/api/verifications/request-review',
        {},
        { withCredentials: true }
      )
      
      if (response.data.success) {
        toast.success('Verification review requested!')
        refetch()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request verification')
    }
  }

  const allDocumentsUploaded = () => {
    const requiredDocs = ['passport', 'proofOfAddress', 'rightToWork']
    if (user?.renderCareServices) requiredDocs.push('dbs')
    return requiredDocs.every(doc => uploadedDocs[doc])
  }

  const isPendingReview = profile?.verificationStatus === 'pending'
  const isApproved = profile?.verificationStatus === 'approved'
  const isRejected = profile?.verificationStatus === 'rejected'

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Verification</h1>

      <div className="card mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FaShieldAlt className="text-2xl text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text">Verification Status</h2>
            <p className="text-text-light">
              Your account is currently{' '}
              <span className={`font-semibold ${
                isApproved ? 'text-green-600' :
                isRejected ? 'text-red-600' :
                isPendingReview ? 'text-blue-600' :
                'text-yellow-600'
              }`}>
                {isApproved ? 'Approved ✅' :
                 isRejected ? 'Rejected ❌' :
                 isPendingReview ? 'Under Review' :
                 'Not Submitted'}
              </span>
            </p>
            {isApproved && (
              <p className="text-green-600 text-sm mt-2">✅ You are verified and can accept errands</p>
            )}
            {isRejected && profile?.rejectionReason && (
              <p className="text-red-600 text-sm mt-2">Reason: {profile.rejectionReason}</p>
            )}
            {isPendingReview && (
              <p className="text-blue-600 text-sm mt-2">⏳ Your documents are being reviewed</p>
            )}
            {!isApproved && !isPendingReview && allDocumentsUploaded() && (
              <button
                onClick={requestVerification}
                className="mt-3 btn-primary text-sm py-2 px-4"
              >
                Request Verification Review
              </button>
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
                  <step.icon className="text-primary" />
                  <h3 className="font-semibold text-text">{step.label}</h3>
                </div>
                <p className="text-sm text-text-light mt-1">{step.description}</p>
                <div className="mt-2">
                  {getStatusBadge(step.status)}
                </div>
              </div>
              {step.status !== 'completed' && !isPendingReview && !isApproved && (
                <label className="cursor-pointer btn-outline text-sm py-1 px-3 flex items-center space-x-1">
                  <FaUpload />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleDocumentUpload(step.id, e.target.files[0])}
                    className="hidden"
                    disabled={uploading || isPendingReview}
                  />
                </label>
              )}
              {step.status === 'completed' && (
                <span className="text-green-500 text-sm flex items-center">
                  <FaCheck className="mr-1" /> Uploaded
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> All documents are checked securely and stored safely.
        </p>
        {allDocumentsUploaded() && !isPendingReview && !isApproved && (
          <button
            onClick={requestVerification}
            className="mt-3 btn-primary text-sm py-2 px-4"
          >
            Submit for Verification
          </button>
        )}
        {isPendingReview && (
          <p className="mt-2 text-sm text-blue-600">⏳ Your verification is pending review</p>
        )}
      </div>
    </div>
  )
}

export default ErrandVerification