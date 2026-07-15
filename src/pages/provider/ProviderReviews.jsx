import React from 'react'
import { useSelector } from 'react-redux'
import { useGetUserReviewsQuery, useRespondToReviewMutation } from '../../redux/services/reviewApi'
import { toast } from 'react-hot-toast'
import { FaStar, FaStarHalfAlt } from 'react-icons/fa'

const ProviderReviews = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: reviews, isLoading } = useGetUserReviewsQuery(user?._id, { skip: !user?._id })
  const [respondToReview, { isLoading: isResponding }] = useRespondToReviewMutation()

  const [respondingTo, setRespondingTo] = React.useState(null)
  const [responseText, setResponseText] = React.useState('')

  const handleRespond = async (reviewId) => {
    try {
      await respondToReview({ id: reviewId, response: responseText }).unwrap()
      toast.success('Response added successfully')
      setRespondingTo(null)
      setResponseText('')
    } catch (error) {
      toast.error(error.data?.message || 'Failed to add response')
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Reviews</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : reviews?.length === 0 ? (
        <div className="text-center py-12">
          <FaStar className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews?.map((review) => (
            <div key={review._id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <span className="text-sm text-text-light">{review.rating} stars</span>
                </div>
                <span className="text-sm text-text-lighter">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2">
                <p className="font-medium text-text">{review.reviewerId?.fullName}</p>
                {review.comment && (
                  <p className="text-text-light mt-1">{review.comment}</p>
                )}
              </div>
              {review.response ? (
                <div className="mt-3 bg-primary/5 p-3 rounded-lg">
                  <p className="text-sm text-text-lighter">Your response:</p>
                  <p className="text-text-light text-sm">{review.response}</p>
                </div>
              ) : (
                <div className="mt-3">
                  {respondingTo === review._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write your response..."
                        className="input-field text-sm"
                        rows="2"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRespond(review._id)}
                          disabled={isResponding || !responseText.trim()}
                          className="btn-primary text-sm py-1 px-4"
                        >
                          Submit Response
                        </button>
                        <button
                          onClick={() => {
                            setRespondingTo(null)
                            setResponseText('')
                          }}
                          className="btn-outline text-sm py-1 px-4"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(review._id)}
                      className="text-primary hover:underline text-sm"
                    >
                      Respond to Review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProviderReviews