import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-hot-toast'
import { 
  FaPaperPlane, 
  FaUser, 
  FaClock, 
  FaCheck, 
  FaCheckDouble,
  FaImage,
  FaFile,
  FaTimes,
  FaSpinner,
  FaPhone,
  FaVideo,
  FaInfoCircle,
} from 'react-icons/fa'
import axios from 'axios'

const ChatWindow = ({ chatId, onClose, onBack }) => {
  const { user } = useSelector((state) => state.auth)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [chatInfo, setChatInfo] = useState(null)
  const [socket, setSocket] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Socket connection
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    })

    newSocket.on('connect', () => {
      console.log('Chat socket connected')
      newSocket.emit('join-room', `user_${user._id}`)
    })

    newSocket.on('new-message', (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => [...prev, data.message])
        scrollToBottom()
      }
    })

    newSocket.on('typing', (data) => {
      if (data.chatId === chatId && data.userId !== user._id) {
        setIsTyping(true)
        clearTimeout(typingTimeout)
        setTimeout(() => setIsTyping(false), 3000)
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [chatId, user._id])

  // Load messages
  useEffect(() => {
    loadMessages()
    loadChatInfo()
  }, [chatId])

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/chats/${chatId}/messages`, {
        withCredentials: true,
      })
      setMessages(response.data)
      // Mark all as read
      await axios.put(`/api/chats/${chatId}/read-all`, {}, {
        withCredentials: true,
      })
    } catch (error) {
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatInfo = async () => {
    try {
      const response = await axios.get(`/api/chats`, {
        withCredentials: true,
      })
      const chat = response.data.find(c => c._id === chatId)
      if (chat) setChatInfo(chat)
    } catch (error) {
      console.error('Failed to load chat info', error)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      const response = await axios.post('/api/chats/send', {
        chatId,
        content: newMessage.trim(),
        messageType: 'text',
      }, {
        withCredentials: true,
      })

      setMessages(prev => [...prev, response.data])
      setNewMessage('')
      scrollToBottom()

      // Emit typing stop
      if (socket) {
        socket.emit('typing', { chatId, userId: user._id, isTyping: false })
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsSending(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await axios.post('/api/upload/single', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const fileUrl = uploadResponse.data.fileUrl
      const fileType = file.type.startsWith('image/') ? 'image' : 'file'

      const response = await axios.post('/api/chats/send', {
        chatId,
        content: file.name,
        messageType: fileType,
        fileUrl: fileUrl,
      }, {
        withCredentials: true,
      })

      setMessages(prev => [...prev, response.data])
      scrollToBottom()
    } catch (error) {
      toast.error('Failed to upload file')
    } finally {
      setIsSending(false)
      fileInputRef.current.value = ''
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { chatId, userId: user._id, isTyping: true })
      clearTimeout(typingTimeout)
      setTimeout(() => {
        socket.emit('typing', { chatId, userId: user._id, isTyping: false })
      }, 2000)
    }
  }

  const getParticipantName = () => {
    if (!chatInfo) return 'User'
    const other = chatInfo.participants?.find(p => p.userId._id !== user._id)
    return other?.userId?.fullName || 'User'
  }

  const getParticipantAvatar = () => {
    if (!chatInfo) return null
    const other = chatInfo.participants?.find(p => p.userId._id !== user._id)
    return other?.userId?.avatar || null
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getMessageStatus = (message) => {
    if (message.senderId._id !== user._id) return null
    if (message.isRead) {
      return <FaCheckDouble className="text-blue-500" />
    }
    return <FaCheck className="text-gray-400" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-primary text-3xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button onClick={onBack} className="text-text-light hover:text-primary">
              <FaTimes />
            </button>
          )}
          {getParticipantAvatar() ? (
            <img
              src={getParticipantAvatar()}
              alt={getParticipantName()}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FaUser className="text-primary" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-text">{getParticipantName()}</h3>
            {isTyping && (
              <p className="text-xs text-primary">Typing...</p>
            )}
            {chatInfo?.errandId && (
              <p className="text-xs text-text-light">
                Errand #{chatInfo.errandId.errandId}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-text-light hover:text-primary transition-colors">
            <FaInfoCircle />
          </button>
          {onClose && (
            <button onClick={onClose} className="text-text-light hover:text-primary transition-colors">
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-text-light">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId._id === user._id
            return (
              <div
                key={message._id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  {message.messageType === 'image' ? (
                    <div className={`rounded-xl overflow-hidden ${isOwn ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      <img
                        src={message.fileUrl}
                        alt={message.content}
                        className="max-w-[200px] max-h-[200px] object-cover cursor-pointer"
                        onClick={() => window.open(message.fileUrl, '_blank')}
                      />
                      <p className="text-xs p-1 text-text-lighter text-center">{message.content}</p>
                    </div>
                  ) : message.messageType === 'file' ? (
                    <div className={`p-3 rounded-xl flex items-center space-x-2 ${isOwn ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      <FaFile className="text-primary" />
                      <a
                        href={message.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {message.content}
                      </a>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-xl ${isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-text'}`}>
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {message.content}
                      </p>
                    </div>
                  )}
                  <div className={`flex items-center space-x-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-text-lighter">
                      {formatTime(message.createdAt)}
                    </span>
                    {getMessageStatus(message)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-text-light hover:text-primary transition-colors"
          >
            <FaImage />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 input-field resize-none py-2 px-3 max-h-24"
            rows="1"
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="btn-primary py-2 px-4 flex items-center space-x-2 disabled:opacity-50"
          >
            {isSending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow