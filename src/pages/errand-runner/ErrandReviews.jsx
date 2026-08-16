import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useGetUserReviewsQuery, useRespondToReviewMutation } from '../../redux/services/reviewApi'
import { toast } from 'react-hot-toast'
import { FaStar, FaStarHalfAlt, FaUser, FaClock, FaReply } from 'react-icons/fa'

const ErrandRunnerReviews = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: reviews, isLoading, refetch } = useGetUserReviewsQuery(user?._id, { skip: !user?._id })
  const [respondToReview, { isLoading: isResponding }] = useRespondToReviewMutation()

  const [respondingTo, setRespondingTo] = useState(null)
  const [responseText, setResponseText] = useState('')

  const handleRespond = async (reviewId) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    try {
      await respondToReview({ id: reviewId, response: responseText }).unwrap()
      toast.success('Response added successfully')
      setRespondingTo(null)
      setResponseText('')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to add response')
    }
  }

  const getRatingStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />)
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />)
    }
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300" />)
    }
    return stars
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const totalReviews = reviews?.length || 0
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
    : 0

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Reviews</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-sm text-text-light">Total Reviews</p>
          <p className="text-2xl font-bold text-text">{totalReviews}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-text-light">Average Rating</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-2xl font-bold text-yellow-500">{averageRating.toFixed(1)}</span>
            <div className="flex">
              {getRatingStars(Math.round(averageRating))}
            </div>
          </div>
        </div>
        <div className="card text-center">
          <p className="text-sm text-text-light">Response Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {totalReviews > 0 
              ? `${Math.round((reviews.filter(r => r.response).length / totalReviews) * 100)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {reviews?.length === 0 ? (
        <div className="text-center py-12">
          <FaStar className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No reviews yet</p>
          <p className="text-sm text-text-lighter mt-1">Complete more errands to receive reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews?.map((review) => (
            <div key={review._id} className="card hover:shadow-medium transition-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Reviewer Info */}
                <div className="flex items-start space-x-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-semibold text-sm">
                      {getInitials(review.reviewerId?.fullName)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text truncate">
                      {review.reviewerId?.fullName}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {getRatingStars(review.rating)}
                      </div>
                      <span className="text-sm text-text-light">{review.rating}.0</span>
                    </div>
                    <p className="text-xs text-text-lighter flex items-center gap-1 mt-0.5">
                      <FaClock className="text-xs" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  {review.comment && (
                    <p className="text-text-light text-sm">{review.comment}</p>
                  )}
                  
                  {/* Response */}
                  {review.response ? (
                    <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-text-lighter font-medium">Your Response:</p>
                      <p className="text-text-light text-sm mt-0.5">{review.response}</p>
                      <p className="text-xs text-text-lighter mt-1">
                        Responded on {new Date(review.respondedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      {respondingTo === review._id ? (
                        <div className="space-y-2">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response..."
                            className="input-field text-sm w-full"
                            rows="2"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRespond(review._id)}
                              disabled={isResponding || !responseText.trim()}
                              className="btn-primary text-sm py-1 px-3 disabled:opacity-50"
                            >
                              {isResponding ? 'Sending...' : 'Send Response'}
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null)
                                setResponseText('')
                              }}
                              className="btn-outline text-sm py-1 px-3"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setRespondingTo(review._id)}
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          <FaReply className="text-xs" />
                          Respond to Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ErrandRunnerReviews