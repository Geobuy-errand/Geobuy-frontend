import React, { useState } from 'react'
import { useAdminGetConnectionsQuery, useAdminUpdateConnectionMutation } from '../../redux/services/connectionApi'
import { toast } from 'react-hot-toast'
import { 
  FaSearch, FaEdit, FaSave, FaTimes, FaEye, FaUser, FaMapMarkerAlt, 
  FaCalendar, FaClock, FaTag, FaPlus, FaUsers, 
  FaCity, FaSpinner, 
  FaLocationArrow
} from 'react-icons/fa'
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
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showBulkScheduleModal, setShowBulkScheduleModal] = useState(false)
  const [isBulkScheduling, setIsBulkScheduling] = useState(false)
  const [scheduleData, setScheduleData] = useState({
    connectionDate: '',
    connectionTime: '',
    venue: {
      name: '',
      address: '',
      postcode: '',
    },
    notes: '',
  })
  const [bulkScheduleData, setBulkScheduleData] = useState({
    state: '',
    connectionDate: '',
    connectionTime: '',
    venue: {
      name: '',
      address: '',
      postcode: '',
    },
    notes: '',
    status: 'active',
  })

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
      meetingType: connection.meetingType || 'virtual',
      connectionDate: connection.connectionDate?.split('T')[0] || '',
      connectionTime: connection.connectionTime || '',
      venue: connection.venue || { name: '', address: '', postcode: '' },
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

  const handleOpenSchedule = (connection) => {
    setSelectedConnection(connection)
    setScheduleData({
      connectionDate: connection.connectionDate?.split('T')[0] || '',
      connectionTime: connection.connectionTime || '',
      venue: connection.venue || { name: '', address: '', postcode: '' },
      notes: connection.adminNotes || '',
    })
    setShowScheduleModal(true)
  }

  const handleScheduleSave = async () => {
    if (!selectedConnection) return

    try {
      await updateConnection({
        id: selectedConnection._id,
        data: {
          connectionDate: scheduleData.connectionDate,
          connectionTime: scheduleData.connectionTime,
          venue: scheduleData.venue,
          adminNotes: scheduleData.notes,
          status: 'active',
        }
      }).unwrap()
      toast.success('Connection scheduled successfully! 🎉')
      setShowScheduleModal(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to schedule connection')
    }
  }

  // ✅ Bulk Schedule by City
  const handleBulkSchedule = async () => {
    if (!bulkScheduleData.state) {
      toast.error('Please select a city to schedule meetups for')
      return
    }
    if (!bulkScheduleData.connectionDate || !bulkScheduleData.connectionTime) {
      toast.error('Please select date and time')
      return
    }

    setIsBulkScheduling(true)
    try {
      // First, get all connections for this state/city
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/connections/admin/all?state=${bulkScheduleData.state}&limit=1000`,
        {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      const result = await response.json()
      const connectionsInCity = result.data || []

      if (connectionsInCity.length === 0) {
        toast.info(`No connections found for ${bulkScheduleData.state}`)
        setIsBulkScheduling(false)
        return
      }

      let updatedCount = 0
      for (const conn of connectionsInCity) {
        try {
          await updateConnection({
            id: conn._id,
            data: {
              connectionDate: bulkScheduleData.connectionDate,
              connectionTime: bulkScheduleData.connectionTime,
              venue: bulkScheduleData.venue,
              adminNotes: bulkScheduleData.notes,
              status: bulkScheduleData.status,
            }
          }).unwrap()
          updatedCount++
        } catch (e) {
          console.error(`Failed to update connection ${conn._id}:`, e)
        }
      }

      toast.success(`✅ Scheduled meetups for ${updatedCount} connections in ${bulkScheduleData.state}!`)
      setShowBulkScheduleModal(false)
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to bulk schedule')
    } finally {
      setIsBulkScheduling(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Connections Management</h1>
          <p className="text-text-light text-sm">Manage user connections, schedule meetups by city, and update venues</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkScheduleModal(true)}
            className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
          >
            <FaUsers />
            Bulk Schedule by City
          </button>
          <span className="text-sm text-text-light">Total: {stats?.total || 0}</span>
        </div>
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
          placeholder="All Cities"
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

                  {/* Scheduled Date/Time & Venue */}
                  {(connection.connectionDate || connection.connectionTime || connection.venue?.name) && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {connection.connectionDate && (
                          <span className="flex items-center gap-1 text-blue-700">
                            <FaCalendar className="text-blue-600" />
                            {new Date(connection.connectionDate).toLocaleDateString('en-GB', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </span>
                        )}
                        {connection.connectionTime && (
                          <span className="flex items-center gap-1 text-blue-700">
                            <FaClock className="text-blue-600" />
                            {connection.connectionTime}
                          </span>
                        )}
                        {connection.venue?.name && (
                          <span className="flex items-center gap-1 text-blue-700">
                            <FaLocationDot className="text-blue-600" />
                            {connection.venue.name}
                          </span>
                        )}
                      </div>
                      {connection.venue?.address && (
                        <p className="text-xs text-blue-600 mt-1">{connection.venue.address}</p>
                      )}
                    </div>
                  )}

                  {/* Edit Section */}
                  {editingId === connection._id ? (
                    <div className="border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-text-light mb-1">Venue Name</label>
                          <input
                            type="text"
                            value={editData.venue?.name || ''}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              venue: { ...editData.venue, name: e.target.value } 
                            })}
                            className="input-field text-sm py-1"
                            placeholder="Venue name"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-text-light mb-1">Venue Address</label>
                          <input
                            type="text"
                            value={editData.venue?.address || ''}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              venue: { ...editData.venue, address: e.target.value } 
                            })}
                            className="input-field text-sm py-1"
                            placeholder="Venue address"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="block text-xs font-medium text-text-light mb-1">Postcode</label>
                          <input
                            type="text"
                            value={editData.venue?.postcode || ''}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              venue: { ...editData.venue, postcode: e.target.value } 
                            })}
                            className="input-field text-sm py-1"
                            placeholder="Postcode"
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
                          onClick={() => handleOpenSchedule(connection)}
                          className="text-sm text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FaCalendar /> Schedule
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

              {/* Scheduled Info */}
              {(selectedConnection.connectionDate || selectedConnection.connectionTime || selectedConnection.venue?.name) && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">📅 Scheduled Meetup</h4>
                  <div className="space-y-1 text-sm">
                    {selectedConnection.connectionDate && (
                      <p className="flex items-center gap-2 text-blue-700">
                        <FaCalendar className="text-blue-600" />
                        {new Date(selectedConnection.connectionDate).toLocaleDateString('en-GB', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                    {selectedConnection.connectionTime && (
                      <p className="flex items-center gap-2 text-blue-700">
                        <FaClock className="text-blue-600" />
                        {selectedConnection.connectionTime}
                      </p>
                    )}
                    {selectedConnection.venue?.name && (
                      <>
                        <p className="flex items-center gap-2 text-blue-700 font-medium mt-2">
                          <FaLocationArrow className="text-blue-600" />
                          {selectedConnection.venue.name}
                        </p>
                        {selectedConnection.venue?.address && (
                          <p className="text-blue-600 ml-6">{selectedConnection.venue.address}</p>
                        )}
                        {selectedConnection.venue?.postcode && (
                          <p className="text-blue-600 ml-6">{selectedConnection.venue.postcode}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {selectedConnection.message && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-1">Message</h4>
                  <p className="text-blue-700 italic">"{selectedConnection.message}"</p>
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

      {/* Individual Schedule Modal */}
      {showScheduleModal && selectedConnection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-text">Schedule Individual Meetup</h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Scheduling for:</p>
                <p className="text-sm text-blue-600">{selectedConnection.fullName}</p>
                <p className="text-xs text-blue-500">{selectedConnection.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={scheduleData.connectionDate}
                  onChange={(e) => setScheduleData({ ...scheduleData, connectionDate: e.target.value })}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={scheduleData.connectionTime}
                  onChange={(e) => setScheduleData({ ...scheduleData, connectionTime: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-text mb-3">📍 Venue Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={scheduleData.venue.name}
                      onChange={(e) => setScheduleData({ 
                        ...scheduleData, 
                        venue: { ...scheduleData.venue, name: e.target.value } 
                      })}
                      className="input-field text-sm"
                      placeholder="e.g., The Coffee House"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={scheduleData.venue.address}
                      onChange={(e) => setScheduleData({ 
                        ...scheduleData, 
                        venue: { ...scheduleData.venue, address: e.target.value } 
                      })}
                      className="input-field text-sm"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={scheduleData.venue.postcode}
                      onChange={(e) => setScheduleData({ 
                        ...scheduleData, 
                        venue: { ...scheduleData.venue, postcode: e.target.value } 
                      })}
                      className="input-field text-sm"
                      placeholder="Postcode"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Admin Notes
                </label>
                <textarea
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  className="input-field resize-none"
                  rows="2"
                  placeholder="Add notes about this scheduled meetup..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleScheduleSave}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <FaCalendar />
                  Schedule Meetup
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-6 btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Bulk Schedule by City Modal */}
      {showBulkScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-text">Bulk Schedule by City</h2>
              <button
                onClick={() => setShowBulkScheduleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-sm text-purple-700 flex items-center gap-2">
                  <FaCity className="text-purple-600" />
                  Schedule meetups for all connections in a city at once
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Select City / State *
                </label>
                <UKStatesDropdown
                  value={bulkScheduleData.state}
                  onChange={(e) => setBulkScheduleData({ ...bulkScheduleData, state: e.target.value })}
                  placeholder="Select a city to schedule..."
                  required
                  className="bg-white"
                />
                <p className="text-xs text-text-lighter mt-1">
                  All connections in this city will be scheduled with the same date, time, and venue
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={bulkScheduleData.connectionDate}
                  onChange={(e) => setBulkScheduleData({ ...bulkScheduleData, connectionDate: e.target.value })}
                  className="input-field"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={bulkScheduleData.connectionTime}
                  onChange={(e) => setBulkScheduleData({ ...bulkScheduleData, connectionTime: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-medium text-text mb-3">📍 Venue Details (All Connections)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1">
                      Venue Name
                    </label>
                    <input
                      type="text"
                      value={bulkScheduleData.venue.name}
                      onChange={(e) => setBulkScheduleData({ 
                        ...bulkScheduleData, 
                        venue: { ...bulkScheduleData.venue, name: e.target.value } 
                      })}
                      className="input-field text-sm"
                      placeholder="e.g., The Coffee House"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={bulkScheduleData.venue.address}
                      onChange={(e) => setBulkScheduleData({ 
                        ...bulkScheduleData, 
                        venue: { ...bulkScheduleData.venue, address: e.target.value } 
                      })}
                      className="input-field text-sm"
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-light mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={bulkScheduleData.venue.postcode}
                      onChange={(e) => setBulkScheduleData({ 
                        ...bulkScheduleData, 
                        venue: { ...bulkScheduleData.venue, postcode: e.target.value } 
                      })}
                      className="input-field text-sm"
                      placeholder="Postcode"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Status
                </label>
                <select
                  value={bulkScheduleData.status}
                  onChange={(e) => setBulkScheduleData({ ...bulkScheduleData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="active">Active (Ready for meetup)</option>
                  <option value="pending">Pending (Not yet confirmed)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={bulkScheduleData.notes}
                  onChange={(e) => setBulkScheduleData({ ...bulkScheduleData, notes: e.target.value })}
                  className="input-field resize-none"
                  rows="2"
                  placeholder="Add notes for all connections in this city..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleBulkSchedule}
                  disabled={isBulkScheduling}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isBulkScheduling ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaUsers />
                  )}
                  {isBulkScheduling ? 'Scheduling...' : 'Schedule All in City'}
                </button>
                <button
                  onClick={() => setShowBulkScheduleModal(false)}
                  className="px-6 btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminConnections