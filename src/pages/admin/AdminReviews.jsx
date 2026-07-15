import React, { useState } from 'react'
import { useGetAllReviewsQuery, useDeleteReviewMutation } from '../../redux/services/adminApi'
import { toast } from 'react-hot-toast'
import { FaSearch, FaStar, FaTrash, FaUser } from 'react-icons/fa'

const AdminReviews = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteReview] = useDeleteReviewMutation()

  const { data: reviews, isLoading, refetch } = useGetAllReviewsQuery()

  const filteredReviews = reviews?.filter(r => 
    r.reviewerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.revieweeId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.bookingId?.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    try {
      await deleteReview(reviewId).unwrap()
      toast.success('Review deleted successfully')
      refetch()
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete review')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Reviews</h1>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredReviews?.length === 0 ? (
        <div className="text-center py-12">
          <FaStar className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews?.map((review) => (
            <div key={review._id} className="card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-text">{review.rating} stars</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-text-light">
                    <span className="flex items-center space-x-1">
                      <FaUser className="text-xs" />
                      <span>{review.reviewerId?.fullName}</span>
                    </span>
                    <span>→</span>
                    <span>{review.revieweeId?.fullName}</span>
                    <span className="text-xs text-text-lighter">
                      Booking #{review.bookingId?.bookingId}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-text-light mt-2">{review.comment}</p>
                  )}
                  {review.response && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-text-lighter">Provider Response:</p>
                      <p className="text-text-light">{review.response}</p>
                    </div>
                  )}
                  <p className="text-xs text-text-lighter mt-1">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminReviews