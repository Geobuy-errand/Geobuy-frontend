import React from 'react'
import { FaTimes, FaMapMarkerAlt, FaCalendar, FaClock, FaTag, FaUser, FaEnvelope, FaPhone, FaInfoCircle, FaCheckCircle, FaClock as FaTime } from 'react-icons/fa'
import { format } from 'date-fns'

const ConnectionDetailModal = ({ connection, onClose }) => {
  if (!connection) return null

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const getPurposeLabel = (purpose) => {
    const labels = {
      professional_networking: 'Professional Networking',
      mentorship: 'Mentorship',
      collaboration: 'Collaboration',
      business_partnership: 'Business Partnership',
      social_networking: 'Social Networking',
      job_referral: 'Job Referral',
      skill_sharing: 'Skill Sharing',
      community_engagement: 'Community Engagement',
      other: 'Other',
    }
    return labels[purpose] || purpose
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text">Connection Details</h2>
            <p className="text-sm text-text-light">{connection.connectionId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Basic Info */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(connection.status)}`}>
              {connection.status.toUpperCase()}
            </span>
            {connection.fee?.paid && (
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                <FaCheckCircle /> Paid
              </span>
            )}
            {connection.rating?.score && (
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1">
                ⭐ {connection.rating.score}/5
              </span>
            )}
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-text-light">
              <FaUser className="text-primary" />
              <span className="font-medium text-text">{connection.fullName}</span>
            </div>
            <div className="flex items-center gap-2 text-text-light">
              <FaEnvelope className="text-primary" />
              <span>{connection.email}</span>
            </div>
            <div className="flex items-center gap-2 text-text-light">
              <FaPhone className="text-primary" />
              <span>{connection.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-text-light">
              <FaTag className="text-primary" />
              <span>{getPurposeLabel(connection.purpose)}</span>
            </div>
          </div>

          {/* Location */}
          {connection.location?.address && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-text mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" /> Location
              </h4>
              <p className="text-text-light">{connection.location.address}</p>
              {connection.location.town && (
                <p className="text-sm text-text-light">{connection.location.town}, {connection.location.postcode}</p>
              )}
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connection.connectionDate && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-text mb-2 flex items-center gap-2">
                  <FaCalendar className="text-primary" /> Date
                </h4>
                <p className="text-text-light">{format(new Date(connection.connectionDate), 'EEEE, dd MMMM yyyy')}</p>
              </div>
            )}
            {connection.connectionTime && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-text mb-2 flex items-center gap-2">
                  <FaClock className="text-primary" /> Time
                </h4>
                <p className="text-text-light">{connection.connectionTime}</p>
              </div>
            )}
          </div>

          {/* Meeting Type & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-text mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-primary" /> Meeting Type
              </h4>
              <p className="text-text-light capitalize">{connection.meetingType?.replace('_', ' ')}</p>
            </div>
            {connection.availability?.preferredTimeSlot && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-text mb-2 flex items-center gap-2">
                  <FaTime className="text-primary" /> Preferred Time
                </h4>
                <p className="text-text-light capitalize">{connection.availability.preferredTimeSlot}</p>
                {connection.availability.preferredDays?.length > 0 && (
                  <p className="text-sm text-text-light mt-1">
                    Days: {connection.availability.preferredDays.map(d => d.slice(0, 3)).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Interests */}
          {connection.interests && connection.interests.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-text mb-2">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {connection.interests.map(interest => (
                  <span key={interest} className="text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
                    {interest.replace('_', ' ').toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          {connection.message && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Message</h4>
              <p className="text-blue-700 italic">"{connection.message}"</p>
            </div>
          )}

          {/* Admin Notes */}
          {connection.adminNotes && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-medium text-text mb-2">Admin Notes</h4>
              <p className="text-text-light">{connection.adminNotes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-text-lighter border-t border-gray-100 pt-4">
            <p>Created: {format(new Date(connection.createdAt), 'dd MMM yyyy HH:mm')}</p>
            {connection.updatedAt && (
              <p>Updated: {format(new Date(connection.updatedAt), 'dd MMM yyyy HH:mm')}</p>
            )}
            {connection.expiresAt && (
              <p>Expires: {format(new Date(connection.expiresAt), 'dd MMM yyyy')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectionDetailModal