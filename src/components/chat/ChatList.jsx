import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaUser, FaClock, FaCircle, FaHeadset, FaBox } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const ChatList = ({ onChatSelect, selectedChatId, filterType = 'all' }) => {
  const { user } = useSelector((state) => state.auth)
  const [chats, setChats] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get('/api/chats', {
        withCredentials: true,
      })
      
      // Filter chats based on filterType
      let filtered = response.data
      if (filterType === 'errands') {
        filtered = filtered.filter(c => c.errandId)
      } else if (filterType === 'support') {
        filtered = filtered.filter(c => c.isSupportChat)
      }
      
      setChats(filtered)
    } catch (error) {
      toast.error('Failed to load chats')
    } finally {
      setIsLoading(false)
    }
  }

  const getOtherParticipant = (chat) => {
    const other = chat.participants?.find(p => p.userId._id !== user._id)
    return other?.userId
  }

  const formatTime = (date) => {
    if (!date) return ''
    const now = new Date()
    const msgDate = new Date(date)
    const diff = now - msgDate
    
    if (diff < 24 * 60 * 60 * 1000) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return msgDate.toLocaleDateString([], { weekday: 'short' })
    } else {
      return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getChatIcon = (chat) => {
    if (chat.isSupportChat) return FaHeadset
    if (chat.errandId) return FaBox
    return FaUser
  }

  const getChatLabel = (chat) => {
    if (chat.isSupportChat) return 'Support'
    if (chat.errandId) return `Errand ${chat.errandId.errandId || ''}`
    return 'Direct Chat'
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl"></div>
        ))}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-12 text-text-light">
        <FaUser className="text-4xl mx-auto mb-4 text-text-lighter" />
        <p>No conversations yet</p>
        <p className="text-sm">
          {filterType === 'errands' 
            ? 'Chats will appear when a provider accepts your errand' 
            : filterType === 'support'
            ? 'Contact support to start a conversation'
            : 'Start a chat from a booking or errand'}
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {chats.map((chat) => {
        const other = getOtherParticipant(chat)
        const isSelected = chat._id === selectedChatId
        const hasUnread = chat.unreadCount > 0
        const Icon = getChatIcon(chat)
        const label = getChatLabel(chat)

        return (
          <button
            key={chat._id}
            onClick={() => onChatSelect(chat._id)}
            className={`w-full text-left p-4 transition-colors ${
              isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="relative flex-shrink-0">
                {other?.avatar ? (
                  <img
                    src={other.avatar}
                    alt={other.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="text-primary text-xl" />
                  </div>
                )}
                {hasUnread && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-text truncate">
                      {other?.fullName || 'Unknown User'}
                    </p>
                    {chat.isSupportChat && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Support
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <span className="text-xs text-text-lighter flex-shrink-0">
                      {formatTime(chat.lastMessage.sentAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-sm text-text-light truncate">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                  {hasUnread && (
                    <span className="flex-shrink-0 w-5 h-5 bg-primary rounded-full text-white text-xs flex items-center justify-center">
                      {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                    </span>
                  )}
                </div>
                {chat.errandId && (
                  <p className="text-xs text-text-lighter mt-1">
                    {label}
                  </p>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ChatList