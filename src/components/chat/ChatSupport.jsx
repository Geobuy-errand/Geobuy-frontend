import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import { FaComments, FaHeadset, FaBox, FaFilter } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'

const ChatSupport = () => {
  const { user } = useSelector((state) => state.auth)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [isCreatingSupport, setIsCreatingSupport] = useState(false)
  const [socket, setSocket] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Socket connection for real-time updates
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    })

    newSocket.on('connect', () => {
      console.log('Chat socket connected')
    })

    newSocket.on('new-message', (data) => {
      // Refresh chat list when new message arrives
      setRefreshKey(prev => prev + 1)
    })

    newSocket.on('new-message-notification', (data) => {
      setRefreshKey(prev => prev + 1)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId)
  }

  const handleCreateSupport = async () => {
    setIsCreatingSupport(true)
    try {
      const response = await axios.post('/api/chats/support/create', 
        { 
          category: 'general',
          priority: 'medium',
          subject: 'General Support Request'
        },
        { withCredentials: true }
      )
      
      if (response.data.chat) {
        toast.success('Support chat created! A support agent will assist you soon.')
        setSelectedChatId(response.data.chat._id)
        setRefreshKey(prev => prev + 1)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create support chat')
    } finally {
      setIsCreatingSupport(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text">Messages</h1>
          <p className="text-text-light mt-1">Chat with providers, customers, and support</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                filterType === 'all' ? 'bg-white shadow-soft' : 'hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('errands')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center space-x-1 ${
                filterType === 'errands' ? 'bg-white shadow-soft' : 'hover:bg-gray-200'
              }`}
            >
              <FaBox className="text-xs" />
              <span>Errands</span>
            </button>
            <button
              onClick={() => setFilterType('support')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center space-x-1 ${
                filterType === 'support' ? 'bg-white shadow-soft' : 'hover:bg-gray-200'
              }`}
            >
              <FaHeadset className="text-xs" />
              <span>Support</span>
            </button>
          </div>

          {/* Support button - only for customers and providers */}
          {(user?.role === 'customer' || user?.role === 'provider') && (
            <button
              onClick={handleCreateSupport}
              disabled={isCreatingSupport}
              className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 whitespace-nowrap disabled:opacity-50"
            >
              <FaHeadset />
              <span>{isCreatingSupport ? 'Creating...' : 'Get Support'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 card p-0 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <p className="text-sm text-text-light">
              {filterType === 'all' ? 'All Conversations' :
               filterType === 'errands' ? 'Errand Chats' :
               'Support Chats'}
            </p>
          </div>
          <ChatList 
            key={refreshKey}
            onChatSelect={handleChatSelect} 
            selectedChatId={selectedChatId}
            filterType={filterType}
          />
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          {selectedChatId ? (
            <ChatWindow
              key={selectedChatId}
              chatId={selectedChatId}
              onClose={() => setSelectedChatId(null)}
              onMessageSent={() => setRefreshKey(prev => prev + 1)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-text-light">
              <FaComments className="text-4xl mb-4 text-text-lighter" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Your messages will appear here</p>
              {(user?.role === 'customer' || user?.role === 'provider') && (
                <button
                  onClick={handleCreateSupport}
                  className="mt-4 btn-secondary text-sm py-2 px-4 flex items-center space-x-2"
                >
                  <FaHeadset />
                  <span>Contact Support</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatSupport