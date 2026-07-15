import React, { useState } from 'react'
import { useGetBookingsQuery } from '../../redux/services/bookingApi'
import { useCreateReviewMutation, useGetUserReviewsQuery } from '../../redux/services/reviewApi'
import { useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'

const CustomerReviews = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: bookings } = useGetBookingsQuery()
  const { data: reviews } = useGetUserReviewsQuery(user?._id, { skip: !user?._id })
  const [createReview, { isLoading }] = useCreateReviewMutation()

  const [reviewForm, setReviewForm] = useState({
    bookingId: '',
    rating: 0,
    comment: '',
    isPublic: true,
  })

  const [hoverRating, setHoverRating] = useState(0)

  const completedBookings = bookings?.filter(b => b.status === 'completed') || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (reviewForm.rating === 0) {
      toast.error('Please select a rating')
      return
    }

    try {
      await createReview(reviewForm).unwrap()
      toast.success('Review submitted successfully')
      setReviewForm({
        bookingId: '',
        rating: 0,
        comment: '',
        isPublic: true,
      })
    } catch (error) {
      toast.error(error.data?.message || 'Failed to submit review')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Reviews</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Write Review */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">Write a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Select Booking
              </label>
              <select
                value={reviewForm.bookingId}
                onChange={(e) => setReviewForm({ ...reviewForm, bookingId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select a completed booking...</option>
                {completedBookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    #{booking.bookingId} - {booking.serviceType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-3xl focus:outline-none transition-colors"
                  >
                    {star <= (hoverRating || reviewForm.rating) ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaStar className="text-gray-300" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-sm text-text-light">
                  {reviewForm.rating > 0 ? `${reviewForm.rating} stars` : 'Select rating'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-light mb-1">
                Comment
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows="3"
                className="input-field resize-none"
                placeholder="Share your experience..."
                maxLength="500"
              />
              <p className="text-xs text-text-lighter mt-1">
                {reviewForm.comment.length}/500 characters
              </p>
            </div>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={reviewForm.isPublic}
                onChange={(e) => setReviewForm({ ...reviewForm, isPublic: e.target.checked })}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-text-light">Make this review public</span>
            </label>

            <button
              type="submit"
              disabled={isLoading || completedBookings.length === 0}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* My Reviews */}
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4">My Reviews</h2>
          {reviews?.length === 0 ? (
            <p className="text-text-light text-sm">No reviews yet</p>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {reviews?.map((review) => (
                <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                      <span className="text-sm text-text-light">{review.rating} stars</span>
                    </div>
                    <span className="text-xs text-text-lighter">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-text-light text-sm mt-2">{review.comment}</p>
                  )}
                  {review.response && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-text-lighter">Provider response:</p>
                      <p className="text-text-light text-sm">{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerReviews