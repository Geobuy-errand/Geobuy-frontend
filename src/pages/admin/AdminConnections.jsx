import React, { useState } from 'react'
import { useAdminGetConnectionsQuery, useAdminUpdateConnectionMutation } from '../../redux/services/connectionApi'
import { toast } from 'react-hot-toast'
import { FaSearch, FaEdit, FaSave, FaTimes, FaEye, FaUser, FaMapMarkerAlt, FaCalendar, FaClock, FaTag } from 'react-icons/fa'
import UKStatesDropdown from '../../components/utils/UKStatesDropdown'
import Pagination from '../../components/utils/Pagination'

const AdminConnections = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [selectedConnection, setSelectedConnection] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const { data, isLoading, refetch } = useAdminGetConnectionsQuery({
    status: statusFilter || undefined,
    search: searchTerm || undefined,
    page: currentPage,
    limit: 10,
  })

  const [updateConnection] = useAdminUpdateConnectionMutation()

  const connections = data?.data || []
  const stats = data?.stats || {}
  const pagination = data?.pagination

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
      casual_date: '😊 Casual date',
      flirting_fun: '🔥 Flirting & fun',
      serious_relationship: '❤️ Serious relationship',
      friendship_first: '☕ Friendship first',
      open_to_anything: '🧭 Open to anything',
      group_meetups_only: '💃 Group meetups only',
      meaningful_connections: '🤝 Meaningful connections',
      just_to_mingle: '🎉 Just to mingle',
      ready_for_commitment: '💍 Ready for commitment',
    }
    return labels[purpose] || purpose
  }

  const handleEdit = (connection) => {
    setEditingId(connection._id)
    setEditData({
      status: connection.status,
      adminNotes: connection.adminNotes || '',
      meetingType: connection.meetingType,
      connectionDate: connection.connectionDate?.split('T')[0] || '',
      connectionTime: connection.connectionTime || '',
    })
  }

  const handleSave = async (id) => {
    try {
      await updateConnection({ id, data: editData }).unwrap()
      toast.success('Connection updated successfully')
      setEditingId(null)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleView = (connection) => {
    setSelectedConnection(connection)
    setShowViewModal(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Connections Management</h1>
          <p className="text-text-light text-sm">Manage user connections and meetup preferences</p>
        </div>
        <span className="text-sm text-text-light">Total: {stats?.total || 0}</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
          <p className="text-sm text-text-light">Total Connections</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
          <p className="text-sm text-text-light">Pending</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
          <p className="text-sm text-text-light">Active</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary">£{(stats?.totalRevenue?.[0]?.total || 0).toFixed(2)}</p>
          <p className="text-sm text-text-light">Revenue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-40"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <UKStatesDropdown
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          placeholder="All States"
          className="w-48"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : connections.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🔗</div>
          <p className="text-text-light">No connections found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FaUser className="text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-text">{connection.fullName}</p>
                        <p className="text-sm text-text-light">{connection.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(connection.status)}`}>
                        {connection.status.toUpperCase()}
                      </span>
                      {connection.fee?.paid && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          💳 Paid
                        </span>
                      )}
                      {connection.state && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs" />
                          {connection.state}
                        </span>
                      )}
                      <span className="text-xs text-text-lighter">
                        {connection.connectionId}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-text-light">Purpose:</span>
                      <span className="ml-1">{getPurposeLabel(connection.purpose)}</span>
                    </div>
                    <div>
                      <span className="text-text-light">Phone:</span>
                      <span className="ml-1">{connection.phoneNumber}</span>
                    </div>
                    <div>
                      <span className="text-text-light">Meeting:</span>
                      <span className="ml-1 capitalize">{connection.meetingType || 'Virtual'}</span>
                    </div>
                  </div>

                  {connection.interests && connection.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {connection.interests.map(interest => (
                        <span key={interest} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {interest.replace('_', ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Edit Section */}
                  {editingId === connection._id ? (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-text-light mb-1">Status</label>
                          <select
                            value={editData.status}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                            className="input-field text-sm py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-light mb-1">Meeting Type</label>
                          <select
                            value={editData.meetingType}
                            onChange={(e) => setEditData({ ...editData, meetingType: e.target.value })}
                            className="input-field text-sm py-1"
                          >
                            <option value="virtual">Virtual</option>
                            <option value="in_person">In Person</option>
                            <option value="phone">Phone</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-light mb-1">Date</label>
                          <input
                            type="date"
                            value={editData.connectionDate}
                            onChange={(e) => setEditData({ ...editData, connectionDate: e.target.value })}
                            className="input-field text-sm py-1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-light mb-1">Time</label>
                          <input
                            type="time"
                            value={editData.connectionTime}
                            onChange={(e) => setEditData({ ...editData, connectionTime: e.target.value })}
                            className="input-field text-sm py-1"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-text-light mb-1">Admin Notes</label>
                        <textarea
                          value={editData.adminNotes}
                          onChange={(e) => setEditData({ ...editData, adminNotes: e.target.value })}
                          className="input-field text-sm resize-none"
                          rows="2"
                          placeholder="Add admin notes..."
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSave(connection._id)}
                          className="btn-primary text-sm py-1 px-3 flex items-center gap-1"
                        >
                          <FaSave /> Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btn-outline text-sm py-1 px-3 flex items-center gap-1"
                        >
                          <FaTimes /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-gray-100 pt-3 flex flex-wrap justify-between items-center">
                      <div className="text-sm text-text-light">
                        <span>Created: {new Date(connection.createdAt).toLocaleDateString()}</span>
                        {connection.connectionDate && (
                          <span className="ml-3 flex items-center gap-1">
                            <FaCalendar className="text-xs" />
                            {new Date(connection.connectionDate).toLocaleDateString()}
                          </span>
                        )}
                        {connection.connectionTime && (
                          <span className="ml-3 flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {connection.connectionTime}
                          </span>
                        )}
                        {connection.adminNotes && (
                          <span className="block text-xs text-text-lighter mt-1">
                            Notes: {connection.adminNotes}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(connection)}
                          className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FaEye /> View
                        </button>
                        <button
                          onClick={() => handleEdit(connection)}
                          className="text-sm text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FaEdit /> Edit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-text">Connection Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`text-sm px-3 py-1 rounded-full ${getStatusBadge(selectedConnection.status)}`}>
                  {selectedConnection.status.toUpperCase()}
                </span>
                {selectedConnection.fee?.paid && (
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-1">
                    💳 Paid - £{selectedConnection.fee?.amount}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-text-light">
                  <FaUser className="text-primary" />
                  <span className="font-medium text-text">{selectedConnection.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <span className="text-primary">📧</span>
                  <span>{selectedConnection.email}</span>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <span className="text-primary">📞</span>
                  <span>{selectedConnection.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <FaMapMarkerAlt className="text-primary" />
                  <span>{selectedConnection.state || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <FaTag className="text-primary" />
                  <span>{getPurposeLabel(selectedConnection.purpose)}</span>
                </div>
                <div className="flex items-center gap-2 text-text-light">
                  <span className="text-primary">🤝</span>
                  <span className="capitalize">{selectedConnection.meetingType || 'Virtual'}</span>
                </div>
              </div>

              {selectedConnection.message && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-1">Message</h4>
                  <p className="text-blue-700 italic">"{selectedConnection.message}"</p>
                </div>
              )}

              {selectedConnection.interests && selectedConnection.interests.length > 0 && (
                <div>
                  <h4 className="font-medium text-text mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnection.interests.map(interest => (
                      <span key={interest} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        {interest.replace('_', ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedConnection.availability?.preferredDays?.length > 0 && (
                <div>
                  <h4 className="font-medium text-text mb-2">Preferred Days</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedConnection.availability.preferredDays.map(day => (
                      <span key={day} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-full capitalize">
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedConnection.availability?.preferredTimeSlot && (
                <div className="flex items-center gap-2 text-text-light">
                  <FaClock className="text-primary" />
                  <span className="capitalize">{selectedConnection.availability.preferredTimeSlot}</span>
                </div>
              )}

              {selectedConnection.adminNotes && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-medium text-text mb-1">Admin Notes</h4>
                  <p className="text-text-light">{selectedConnection.adminNotes}</p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 text-xs text-text-lighter">
                <p>Connection ID: {selectedConnection.connectionId}</p>
                <p>Created: {new Date(selectedConnection.createdAt).toLocaleString()}</p>
                {selectedConnection.updatedAt && <p>Updated: {new Date(selectedConnection.updatedAt).toLocaleString()}</p>}
                {selectedConnection.expiresAt && <p>Expires: {new Date(selectedConnection.expiresAt).toLocaleDateString()}</p>}
                <p>User ID: {selectedConnection.userId?._id || selectedConnection.userId}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminConnections