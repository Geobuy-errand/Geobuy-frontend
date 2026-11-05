import React, { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaShieldAlt, FaCheck, FaClock, FaTimes, FaUpload, FaIdCard, FaHome, FaBriefcase, FaCar, FaUserCheck } from 'react-icons/fa'
import http from '../../services/http'
import useCountry from '../../hooks/useCountry'
import { useGetCurrentUserQuery } from '../../redux/services/authApi'
import { VERIFICATION_DOCUMENTS, OPTIONAL_DOCUMENTS } from '../../config/countries'

const ICONS = {
  passport: FaIdCard,
  ninSlip: FaIdCard,
  proofOfAddress: FaHome,
  utilityBill: FaHome,
  rightToWork: FaBriefcase,
  drivingLicence: FaIdCard,
  vehicleRegistration: FaCar,
  vehicleInsurance: FaShieldAlt,
  certification: FaUserCheck,
  insurance: FaShieldAlt,
  dbs: FaShieldAlt,
}

/**
 * Document upload + "request review" for providers and errand runners.
 * The required documents depend on the account's country:
 *   UK: photo ID, proof of address, right to work (+ DBS for care work)
 *   Nigeria: NIN slip / National ID, utility bill
 */
const VerificationPage = ({ role = 'errand_runner' }) => {
  const { code } = useCountry()
  const { data: me, refetch } = useGetCurrentUserQuery()
  const user = me?.user
  const [uploading, setUploading] = useState('')

  const steps = useMemo(() => {
    const required = (VERIFICATION_DOCUMENTS[code] || []).map((d) => ({ ...d, required: true }))
    const optional = (OPTIONAL_DOCUMENTS[code] || []).map((d) => ({ ...d, required: false }))
    if (role === 'provider') {
      optional.push(
        { id: 'certification', name: 'Certifications', description: 'Professional certifications (if applicable)', required: false },
        { id: 'insurance', name: 'Insurance', description: 'Liability insurance certificate (if you have one)', required: false }
      )
    }
    if (code === 'GB' && user?.renderCareServices) {
      required.push({ id: 'dbs', name: 'DBS Check', description: 'Your enhanced DBS certificate', required: true })
    }
    return [...required, ...optional]
  }, [code, role, user?.renderCareServices])

  const uploadedUrl = (id) => (id === 'dbs' ? user?.dbsDocument : user?.documents?.[id])
  const allRequiredUploaded = steps.filter((s) => s.required).every((s) => uploadedUrl(s.id))

  const status = user?.verificationStatus
  const isApproved = status === 'approved'
  const isRejected = status === 'rejected'
  // New runners start as "pending" before they upload anything — they are only
  // "under review" once they have actually requested it.
  const isPendingReview = status === 'pending' && Boolean(user?.verificationRequestedAt)

  const handleUpload = async (docType, file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('File size must be less than 5MB')
    const formData = new FormData()
    formData.append('document', file)
    formData.append('documentType', docType)
    setUploading(docType)
    try {
      await http.post('/verifications/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Document uploaded')
      refetch()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading('')
    }
  }

  const requestVerification = async () => {
    try {
      const { data } = await http.post('/verifications/request-review', {})
      if (data.success) {
        toast.success('Verification review requested!')
        refetch()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request verification')
    }
  }

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
              <span
                className={`font-semibold ${
                  isApproved ? 'text-green-600' : isRejected ? 'text-red-600' : isPendingReview ? 'text-blue-600' : 'text-yellow-600'
                }`}
              >
                {isApproved ? 'Approved ✅' : isRejected ? 'Rejected ❌' : isPendingReview ? 'Under Review' : 'Not Submitted'}
              </span>
            </p>
            {isApproved && (
              <p className="text-green-600 text-sm mt-2">
                ✅ You are verified and can {role === 'provider' ? 'accept jobs' : 'accept errands'}
              </p>
            )}
            {isRejected && user?.rejectionReason && <p className="text-red-600 text-sm mt-2">Reason: {user.rejectionReason}</p>}
            {isPendingReview && <p className="text-blue-600 text-sm mt-2">⏳ Your documents are being reviewed</p>}
            {!isApproved && !isPendingReview && allRequiredUploaded && (
              <button onClick={requestVerification} className="mt-3 btn-primary text-sm py-2 px-4">
                Request Verification Review
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => {
          const Icon = ICONS[step.id] || FaIdCard
          const done = Boolean(uploadedUrl(step.id))
          return (
            <div key={step.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Icon className="text-primary" />
                    <h3 className="font-semibold text-text">
                      {step.name}
                      {step.required ? ' *' : <span className="text-xs text-text-lighter font-normal"> (optional)</span>}
                    </h3>
                  </div>
                  <p className="text-sm text-text-light mt-1">{step.description}</p>
                  <div className="mt-2">
                    {done ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <FaCheck className="mr-1" /> Uploaded
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600 text-sm">
                        <FaClock className="mr-1" /> Not uploaded
                      </span>
                    )}
                  </div>
                </div>
                {!isPendingReview && !isApproved && (
                  <label className="cursor-pointer btn-outline text-sm py-1 px-3 flex items-center space-x-1 whitespace-nowrap">
                    <FaUpload />
                    <span>{uploading === step.id ? 'Uploading...' : done ? 'Replace' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleUpload(step.id, e.target.files[0])}
                      className="hidden"
                      disabled={Boolean(uploading)}
                    />
                  </label>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Documents are checked by our team and stored securely. Items marked * are required.
        </p>
        {isRejected && (
          <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
            <FaTimes /> Upload corrected documents, then request a review again.
          </p>
        )}
      </div>
    </div>
  )
}

export default VerificationPage
