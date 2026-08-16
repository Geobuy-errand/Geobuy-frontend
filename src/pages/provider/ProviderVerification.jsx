import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetProviderProfileQuery } from '../../redux/services/providerApi'
import { toast } from 'react-hot-toast'
import { FaShieldAlt, FaCheck, FaClock, FaTimes, FaUpload, FaFileAlt, FaIdCard, FaHome, FaBriefcase, FaUserCheck } from 'react-icons/fa'
import axios from 'axios'

const ServiceProviderVerification = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: profile, refetch } = useGetProviderProfileQuery()
  const [uploading, setUploading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState({
    identity: user?.documents?.passport || '',
    address: user?.documents?.proofOfAddress || '',
    work: user?.documents?.rightToWork || '',
    certification: user?.documents?.certification || '',
    insurance: user?.documents?.insurance || '',
    dbs: user?.dbsDocument || '',
  })

  const verificationSteps = [
    {
      id: 'identity',
      label: 'Identity Verification',
      description: 'Upload your Passport or Driving Licence',
      status: uploadedDocs.identity ? 'completed' : 'pending',
      icon: FaIdCard,
    },
    {
      id: 'address',
      label: 'Proof of Address',
      description: 'Upload a recent utility bill or bank statement',
      status: uploadedDocs.address ? 'completed' : 'pending',
      icon: FaHome,
    },
    {
      id: 'work',
      label: 'Right to Work',
      description: 'Upload your right to work documentation',
      status: uploadedDocs.work ? 'completed' : 'pending',
      icon: FaBriefcase,
    },
    {
      id: 'certification',
      label: 'Certifications',
      description: 'Upload your professional certifications (if applicable)',
      status: uploadedDocs.certification ? 'completed' : 'pending',
      icon: FaUserCheck,
    },
    {
      id: 'insurance',
      label: 'Insurance',
      description: 'Upload your liability insurance certificate',
      status: uploadedDocs.insurance ? 'completed' : 'pending',
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

    // Validate file size (max 5MB)
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
        // Update local state
        setUploadedDocs(prev => ({
          ...prev,
          [docType]: response.data.fileUrl,
        }))
        
        toast.success(`${docType} uploaded successfully! Document is pending review.`)
        refetch()
        
        // If all documents are uploaded, prompt user to request verification
        const allUploaded = Object.values({ ...uploadedDocs, [docType]: response.data.fileUrl }).every(val => val)
        if (allUploaded) {
          toast.success('🎉 All documents uploaded! Admin will review your verification.')
        }
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
        toast.success('Verification review requested! Admin will review your documents.')
        refetch()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request verification')
    }
  }

  const allDocumentsUploaded = () => {
    // Check if all required documents are uploaded
    const requiredDocs = ['identity', 'address', 'work']
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
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
              <p className="text-green-600 text-sm mt-2">
                ✅ You are verified and can accept service requests
              </p>
            )}
            {isRejected && profile?.rejectionReason && (
              <p className="text-red-600 text-sm mt-2">
                Reason: {profile.rejectionReason}
              </p>
            )}
            {isPendingReview && (
              <p className="text-blue-600 text-sm mt-2">
                ⏳ Your documents are being reviewed by an admin. You'll be notified once approved.
              </p>
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
          We only ask what we need to confirm who you are, keep everyone protected, and pay you correctly.
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
          <p className="mt-2 text-sm text-blue-600">
            ⏳ Your verification is pending review. You'll be notified once approved.
          </p>
        )}
      </div>
    </div>
  )
}

export default ServiceProviderVerification