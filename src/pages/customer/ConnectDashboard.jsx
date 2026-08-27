import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetUserPostsQuery, useGetConnectionStatusQuery } from '../../redux/services/connectPostApi'
import { format, formatDistanceToNow } from 'date-fns'
import { 
  FaMapMarkerAlt, FaCalendar, FaClock, FaUser, 
  FaHeart, FaUsers, FaStar, FaSpinner, FaEye,
  FaNewspaper, FaBullhorn, FaArrowRight,
  FaLocationArrow
} from 'react-icons/fa'

const ConnectDashboard = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  
  const { data: statusData, isLoading: statusLoading } = useGetConnectionStatusQuery()
  const { data: postsData, isLoading: postsLoading, refetch } = useGetUserPostsQuery()
  
  const [selectedPost, setSelectedPost] = useState(null)

  // Check if user is connected
  useEffect(() => {
    if (!statusLoading && !statusData?.hasConnected) {
      navigate('/customer/connect')
    }
  }, [statusData, statusLoading, navigate])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  if (statusLoading || postsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-3xl text-primary" />
      </div>
    )
  }

  if (!statusData?.hasConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-text">Not Connected Yet</h2>
          <p className="text-text-light mt-2">Please complete your connection profile first.</p>
          <button
            onClick={() => navigate('/customer/connect')}
            className="mt-4 btn-primary"
          >
            Go to Connect
          </button>
        </div>
      </div>
    )
  }

  const posts = postsData?.data || []
  const connection = postsData?.connection

  const getTypeIcon = (type) => {
    const icons = {
      meeting_venue: <FaLocationArrow className="text-primary" />,
      activity: <FaUsers className="text-blue-500" />,
      announcement: <FaBullhorn className="text-yellow-500" />,
      event: <FaCalendar className="text-purple-500" />,
      general: <FaNewspaper className="text-gray-500" />,
    }
    return icons[type] || <FaNewspaper className="text-gray-500" />
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
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom max-w-5xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-text">Your Connect Dashboard</h1>
              <p className="text-text-light mt-1">
                Welcome back, {user?.fullName}! 👋
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-2">
                <FaMapMarkerAlt />
                {connection?.state || 'Your State'}
              </span>
              <span className="text-sm bg-green-100 text-green-700 px-4 py-2 rounded-full flex items-center gap-2">
                <FaHeart />
                Connected
              </span>
            </div>
          </div>
          
          {/* Sunday Highlight */}
          <div className="mt-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <FaStar className="text-primary text-xl" />
              <div>
                <p className="font-medium text-text">✨ Sunday Group Date</p>
                <p className="text-sm text-text-light">
                  Join us this Sunday for our weekly group meetup in {connection?.state}!
                  Check the posts below for venue details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-text">No Posts Yet</h3>
              <p className="text-text-light mt-2">
                Check back soon for meetup venues and activities in your area.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="card hover:shadow-medium transition-shadow">
                <div className="flex flex-col gap-4">
                  {/* Post Header */}
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(post.type)} flex items-center gap-1`}>
                        {getTypeIcon(post.type)}
                        <span>{getTypeLabel(post.type)}</span>
                      </div>
                      {post.isFeatured && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaStar className="text-yellow-500" />
                          Featured
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-text-lighter">
                      {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                  </div>

                  {/* Post Content */}
                  <div>
                    <h3 className="text-xl font-semibold text-text mb-2">{post.title}</h3>
                    <p className="text-text-light whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Venue Details */}
                  {post.venue && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-primary mt-1" />
                        <div>
                          <p className="font-medium text-text">{post.venue.name}</p>
                          <p className="text-sm text-text-light">{post.venue.address}</p>
                          {post.venue.postcode && (
                            <p className="text-sm text-text-light">{post.venue.postcode}</p>
                          )}
                          {post.venue.googleMapsUrl && (
                            <a
                              href={post.venue.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm flex items-center gap-1 mt-1"
                            >
                              Open in Google Maps <FaArrowRight className="text-xs" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Date & Time */}
                  {(post.date || post.time) && (
                    <div className="flex flex-wrap gap-4 text-sm text-text-light">
                      {post.date && (
                        <span className="flex items-center gap-1">
                          <FaCalendar className="text-primary" />
                          {format(new Date(post.date), 'EEEE, dd MMMM yyyy')}
                        </span>
                      )}
                      {post.time && (
                        <span className="flex items-center gap-1">
                          <FaClock className="text-primary" />
                          {post.time}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-text-lighter">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-primary" />
                      Posted by {post.createdBy?.fullName || 'Admin'}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye className="text-primary" />
                      {post.views || 0} views
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-primary/5 border border-primary/20 text-center">
            <FaCalendar className="text-2xl text-primary mx-auto mb-2" />
            <p className="font-medium text-text">Weekly Sunday Meetups</p>
            <p className="text-sm text-text-light">Every Sunday in your area</p>
          </div>
          <div className="card bg-blue-50 border border-blue-200 text-center">
            <FaUsers className="text-2xl text-blue-500 mx-auto mb-2" />
            <p className="font-medium text-text">Group Setting</p>
            <p className="text-sm text-text-light">Meet new people, no pressure</p>
          </div>
          <div className="card bg-purple-50 border border-purple-200 text-center">
            <FaHeart className="text-2xl text-purple-500 mx-auto mb-2" />
            <p className="font-medium text-text">Your Choice</p>
            <p className="text-sm text-text-light">Find your vibe, make connections</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConnectDashboard