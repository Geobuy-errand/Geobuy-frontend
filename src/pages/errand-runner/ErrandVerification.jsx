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
  const [formData, setFormData] = useState({
    vehicleType: profile?.vehicleType || 'walking',
    maxWeightCapacity: profile?.maxWeightCapacity || 10,
    maxDistancePreference: profile?.maxDistancePreference || 10,
    about: profile?.about || '',
    documents: {
      passport: profile?.documents?.passport || '',
      drivingLicence: profile?.documents?.drivingLicence || '',
      proofOfAddress: profile?.documents?.proofOfAddress || '',
      rightToWork: profile?.documents?.rightToWork || '',
      vehicleRegistration: profile?.documents?.vehicleRegistration || '',
      vehicleInsurance: profile?.documents?.vehicleInsurance || '',
    },
  })

  const verificationSteps = [
    {
      id: 'identity',
      label: 'Identity Verification',
      description: 'Upload your Passport or Driving Licence',
      status: profile?.documents?.passport ? 'completed' : 'pending',
      icon: FaIdCard,
    },
    {
      id: 'address',
      label: 'Proof of Address',
      description: 'Upload a recent utility bill or bank statement',
      status: profile?.documents?.proofOfAddress ? 'completed' : 'pending',
      icon: FaHome,
    },
    {
      id: 'work',
      label: 'Right to Work',
      description: 'Upload your right to work documentation',
      status: profile?.documents?.rightToWork ? 'completed' : 'pending',
      icon: FaBriefcase,
    },
    {
      id: 'driving',
      label: 'Driving Licence',
      description: 'Upload your driving licence',
      status: profile?.documents?.drivingLicence ? 'completed' : 'pending',
      icon: FaIdCard,
    },
    {
      id: 'vehicle',
      label: 'Vehicle Registration',
      description: 'Upload your vehicle registration document',
      status: profile?.documents?.vehicleRegistration ? 'completed' : 'pending',
      icon: FaCar,
    },
    {
      id: 'insurance',
      label: 'Vehicle Insurance',
      description: 'Upload your vehicle insurance certificate',
      status: profile?.documents?.vehicleInsurance ? 'completed' : 'pending',
      icon: FaShieldAlt,
    },
  ]

  // Add DBS if care services are offered
  if (user?.renderCareServices) {
    verificationSteps.push({
      id: 'dbs',
      label: 'DBS Check',
      description: 'Upload your enhanced DBS certificate',
      status: profile?.dbsDocument ? 'completed' : 'pending',
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
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docType]: response.data.fileUrl,
          },
        }))
        toast.success(`${docType} uploaded successfully`)
        refetch()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
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
                profile?.verificationStatus === 'approved' ? 'text-green-600' :
                profile?.verificationStatus === 'rejected' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {profile?.verificationStatus || 'pending'}
              </span>
            </p>
            {profile?.rejectionReason && (
              <p className="text-red-600 text-sm mt-2">
                Reason: {profile.rejectionReason}
              </p>
            )}
            {profile?.verificationStatus === 'approved' && (
              <p className="text-green-600 text-sm mt-2">
                ✅ You are verified and can accept errands
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
                  <step.icon className="text-primary" />
                  <h3 className="font-semibold text-text">{step.label}</h3>
                </div>
                <p className="text-sm text-text-light mt-1">{step.description}</p>
                <div className="mt-2">
                  {getStatusBadge(step.status)}
                </div>
              </div>
              {step.status !== 'completed' && (
                <label className="cursor-pointer btn-outline text-sm py-1 px-3 flex items-center space-x-1">
                  <FaUpload />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleDocumentUpload(step.id, e.target.files[0])}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
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

export default ErrandVerification