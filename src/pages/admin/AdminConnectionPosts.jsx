import React, { useState, useEffect } from 'react'
import { useAdminGetAllPostsQuery, useCreatePostMutation, useAdminUpdatePostMutation, useAdminDeletePostMutation } from '../../redux/services/connectPostApi'
import { toast } from 'react-hot-toast'
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSpinner, FaCheck, FaEye, FaImage, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa'
import UKStatesDropdown from '../../components/utils/UKStatesDropdown'
import Pagination from '../../components/utils/Pagination'

const AdminConnectionPosts = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [stateFilter, setStateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const { data, isLoading, refetch } = useAdminGetAllPostsQuery({
    state: stateFilter || undefined,
    type: typeFilter || undefined,
    page: currentPage,
    limit: 10,
  })

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation()
  const [updatePost, { isLoading: isUpdating }] = useAdminUpdatePostMutation()
  const [deletePost, { isLoading: isDeleting }] = useAdminDeletePostMutation()

  const posts = data?.data || []
  const stats = data?.stats || {}
  const pagination = data?.pagination

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    state: '',
    venue: {
      name: '',
      address: '',
      postcode: '',
      googleMapsUrl: '',
    },
    date: '',
    time: '',
    imageUrl: '',
    isFeatured: false,
    expiresAt: '',
    tags: [],
  })
  const [newTag, setNewTag] = useState('')

  const postTypes = [
    { value: 'meeting_venue', label: '📍 Meeting Venue' },
    { value: 'activity', label: '🎯 Activity' },
    { value: 'announcement', label: '📢 Announcement' },
    { value: 'event', label: '🎉 Event' },
    { value: 'general', label: '📰 General' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPost) {
        await updatePost({ id: editingPost._id, data: formData }).unwrap()
        toast.success('Post updated successfully 🎉')
      } else {
        await createPost(formData).unwrap()
        toast.success('Post created successfully 🎉')
      }
      refetch()
      resetForm()
    } catch (error) {
      toast.error(error.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return
    try {
      await deletePost(id).unwrap()
      toast.success('Post deleted successfully 🗑️')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Delete failed')
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      type: post.type,
      state: post.state,
      venue: post.venue || { name: '', address: '', postcode: '', googleMapsUrl: '' },
      date: post.date ? post.date.split('T')[0] : '',
      time: post.time || '',
      imageUrl: post.imageUrl || '',
      isFeatured: post.isFeatured || false,
      expiresAt: post.expiresAt ? post.expiresAt.split('T')[0] : '',
      tags: post.tags || [],
    })
    setShowModal(true)
  }

  const handleView = (post) => {
    setSelectedPost(post)
    setShowViewModal(true)
  }

  const resetForm = () => {
    setShowModal(false)
    setEditingPost(null)
    setFormData({
      title: '',
      content: '',
      type: 'general',
      state: '',
      venue: { name: '', address: '', postcode: '', googleMapsUrl: '' },
      date: '',
      time: '',
      imageUrl: '',
      isFeatured: false,
      expiresAt: '',
      tags: [],
    })
    setNewTag('')
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const getTypeBadge = (type) => {
    const badges = {
      meeting_venue: 'bg-green-100 text-green-700',
      activity: 'bg-blue-100 text-blue-700',
      announcement: 'bg-yellow-100 text-yellow-700',
      event: 'bg-purple-100 text-purple-700',
      general: 'bg-gray-100 text-gray-700',
    }
    return badges[type] || 'bg-gray-100 text-gray-700'
  }

  const getTypeLabel = (type) => {
    const labels = {
      meeting_venue: '📍 Venue',
      activity: '🎯 Activity',
      announcement: '📢 Announcement',
      event: '🎉 Event',
      general: '📰 General',
    }
    return labels[type] || type
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Posts Management</h1>
          <p className="text-text-light text-sm">Create and manage posts for users in specific states</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Create Post</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats?.total || 0}</p>
          <p className="text-sm text-text-light">Total Posts</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats?.byState?.length || 0}</p>
          <p className="text-sm text-text-light">States Covered</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats?.byType?.length || 0}</p>
          <p className="text-sm text-text-light">Post Types</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">📢</p>
          <p className="text-sm text-text-light">Active Posts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <UKStatesDropdown
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            placeholder="Filter by state..."
            className="w-full"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="">All Types</option>
          {postTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-text-light">No posts found</p>
          <p className="text-sm text-text-lighter mt-2">Create your first post to notify users in their area</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 btn-primary inline-flex items-center space-x-2"
          >
            <FaPlus />
            <span>Create Post</span>
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(post.type)}`}>
                        {getTypeLabel(post.type)}
                      </span>
                      {post.isFeatured && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          ⭐ Featured
                        </span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                        {post.state}
                      </span>
                      {!post.isActive && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-lighter">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-text">{post.title}</h3>
                    <p className="text-sm text-text-light mt-1 line-clamp-2">{post.content}</p>
                  </div>

                  {post.venue?.name && (
                    <div className="flex items-center text-sm text-text-light gap-2">
                      <FaMapMarkerAlt className="text-primary" />
                      <span>{post.venue.name}</span>
                      {post.venue.address && <span>• {post.venue.address}</span>}
                    </div>
                  )}

                  {(post.date || post.time) && (
                    <div className="flex items-center text-sm text-text-light gap-4">
                      {post.date && (
                        <span className="flex items-center gap-1">
                          <FaCalendar className="text-primary" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                      )}
                      {post.time && <span>🕐 {post.time}</span>}
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="text-xs text-text-lighter">
                      👁️ {post.views || 0} views • Posted by {post.createdBy?.fullName || 'Admin'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(post)}
                        className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FaEye /> View
                      </button>
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-sm text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-text">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Enter post title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-field resize-none"
                  rows="5"
                  placeholder="Write your post content..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Post Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                    required
                  >
                    {postTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Target State *
                  </label>
                  <UKStatesDropdown
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Select state..."
                    required
                  />
                  <p className="text-xs text-text-lighter mt-1">
                    Users in this state will receive this post
                  </p>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-medium text-text mb-3 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-primary" />
                  Venue Details (Optional)
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.venue.name}
                    onChange={(e) => setFormData({ ...formData, venue: { ...formData.venue, name: e.target.value } })}
                    className="input-field"
                    placeholder="Venue name"
                  />
                  <input
                    type="text"
                    value={formData.venue.address}
                    onChange={(e) => setFormData({ ...formData, venue: { ...formData.venue, address: e.target.value } })}
                    className="input-field"
                    placeholder="Venue address"
                  />
                  <input
                    type="text"
                    value={formData.venue.postcode}
                    onChange={(e) => setFormData({ ...formData, venue: { ...formData.venue, postcode: e.target.value } })}
                    className="input-field"
                    placeholder="Postcode"
                  />
                  <input
                    type="url"
                    value={formData.venue.googleMapsUrl}
                    onChange={(e) => setFormData({ ...formData, venue: { ...formData.venue, googleMapsUrl: e.target.value } })}
                    className="input-field"
                    placeholder="Google Maps URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Expires At
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="input-field"
                />
                <p className="text-xs text-text-lighter mt-1">
                  Posts expire after 30 days by default
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light mb-1">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn-primary px-4 py-2 flex items-center gap-1"
                  >
                    <FaPlus className="text-xs" /> Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-600 ml-1"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm text-text-light">⭐ Featured Post (appears at top)</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {(isCreating || isUpdating) ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaCheck />
                  )}
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-text">Post Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(selectedPost.type)}`}>
                  {getTypeLabel(selectedPost.type)}
                </span>
                {selectedPost.isFeatured && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    ⭐ Featured
                  </span>
                )}
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  {selectedPost.state}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-text">{selectedPost.title}</h3>

              {selectedPost.imageUrl && (
                <img src={selectedPost.imageUrl} alt={selectedPost.title} className="rounded-xl w-full max-h-64 object-cover" />
              )}

              <p className="text-text-light whitespace-pre-wrap">{selectedPost.content}</p>

              {selectedPost.venue?.name && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-medium text-text mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" /> Venue
                  </h4>
                  <p className="font-medium">{selectedPost.venue.name}</p>
                  <p className="text-sm text-text-light">{selectedPost.venue.address}</p>
                  {selectedPost.venue.postcode && (
                    <p className="text-sm text-text-light">{selectedPost.venue.postcode}</p>
                  )}
                  {selectedPost.venue.googleMapsUrl && (
                    <a href={selectedPost.venue.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                      Open in Google Maps →
                    </a>
                  )}
                </div>
              )}

              {(selectedPost.date || selectedPost.time) && (
                <div className="flex items-center gap-4 text-sm text-text-light">
                  {selectedPost.date && (
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-primary" />
                      {new Date(selectedPost.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  {selectedPost.time && (
                    <span className="flex items-center gap-1">
                      🕐 {selectedPost.time}
                    </span>
                  )}
                </div>
              )}

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 text-xs text-text-lighter">
                <p>Created: {new Date(selectedPost.createdAt).toLocaleString()}</p>
                {selectedPost.updatedAt && <p>Updated: {new Date(selectedPost.updatedAt).toLocaleString()}</p>}
                {selectedPost.expiresAt && <p>Expires: {new Date(selectedPost.expiresAt).toLocaleDateString()}</p>}
                <p>👁️ {selectedPost.views || 0} views</p>
                <p>Posted by: {selectedPost.createdBy?.fullName || 'Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminConnectionPosts