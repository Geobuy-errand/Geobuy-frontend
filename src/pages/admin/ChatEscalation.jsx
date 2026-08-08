import React, { useState, useEffect } from 'react'
import { FaHeadset, FaClock, FaUser, FaCheckCircle, FaArrowRight } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import ChatWindow from '../../components/chat/ChatWindow'

const ChatEscalation = () => {
  const [escalatedChats, setEscalatedChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEscalatedChats()
    // Refresh every 10 seconds
    const interval = setInterval(loadEscalatedChats, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadEscalatedChats = async () => {
    try {
      const response = await axios.get('/api/chatbot/escalated', {
        withCredentials: true,
      })
      setEscalatedChats(response.data)
    } catch (error) {
      console.error('Failed to load escalated chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'text-blue-600 bg-blue-100'
      case 'open': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-32 rounded-xl mb-4"></div>
        <div className="skeleton h-64 rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Chat Escalations</h1>
          <p className="text-text-light mt-1">
            Customers who need agent assistance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
            {escalatedChats.length} pending
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 card p-0 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-text-light">Active Escalations</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {escalatedChats.length === 0 ? (
              <div className="text-center py-12 text-text-light">
                <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
                <p>No pending escalations</p>
                <p className="text-sm">All caught up! 🎉</p>
              </div>
            ) : (
              escalatedChats.map((chat) => {
                const customer = chat.customer
                const isSelected = selectedChat?._id === chat._id

                return (
                  <button
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full text-left p-4 transition-colors border-b border-gray-100 ${
                      isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-text truncate">
                            {customer?.fullName || 'Unknown User'}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(chat.priority)}`}>
                            {chat.priority}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-text-light truncate">
                            {chat.lastMessage?.content || 'No messages'}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(chat.supportStatus)}`}>
                            {chat.supportStatus}
                          </span>
                          <span className="text-xs text-text-lighter">
                            <FaClock className="inline mr-1" />
                            {new Date(chat.updatedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          {selectedChat ? (
            <ChatWindow
              chatId={selectedChat._id}
              onClose={() => setSelectedChat(null)}
              isAdmin={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] text-text-light">
              <FaHeadset className="text-4xl mb-4 text-text-lighter" />
              <p className="text-lg font-medium">Select a chat</p>
              <p className="text-sm">Customer escalations will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatEscalation