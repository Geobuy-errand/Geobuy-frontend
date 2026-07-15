import React from 'react'
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '../../redux/services/notificationApi'
import { toast } from 'react-hot-toast'
import { FaBell, FaCheck, FaClock } from 'react-icons/fa'

const CustomerNotifications = () => {
  const { data: notifications, isLoading } = useGetNotificationsQuery()
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead] = useMarkAllNotificationsReadMutation()

  const handleMarkRead = async (id) => {
    try {
      await markRead(id).unwrap()
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap()
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark all as read')
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_created':
        return '📋'
      case 'booking_accepted':
        return '✅'
      case 'booking_completed':
        return '🎉'
      case 'payment_released':
        return '💰'
      case 'new_message':
        return '💬'
      case 'booking_cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Notifications</h1>
        <button
          onClick={handleMarkAllRead}
          className="text-primary hover:underline text-sm"
        >
          Mark all as read
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-16 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : notifications?.length === 0 ? (
        <div className="text-center py-12">
          <FaBell className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications?.map((notification) => (
            <div
              key={notification._id}
              className={`card flex items-start justify-between ${!notification.isRead ? 'border-l-4 border-primary' : ''}`}
            >
              <div className="flex items-start space-x-4 flex-1">
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text">{notification.title}</h3>
                  <p className="text-text-light text-sm">{notification.message}</p>
                  <p className="text-xs text-text-lighter mt-1 flex items-center">
                    <FaClock className="mr-1" />
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => handleMarkRead(notification._id)}
                  className="text-primary hover:text-primary-dark transition-colors"
                  title="Mark as read"
                >
                  <FaCheck />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomerNotifications