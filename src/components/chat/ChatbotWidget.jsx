import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { FaComments, FaTimes, FaPaperPlane, FaRobot, FaUser, FaCircle, FaHeadset } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const ChatbotWidget = () => {
  const { user } = useSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [isAgentOnline, setIsAgentOnline] = useState(false)
  const [isEscalated, setIsEscalated] = useState(false)
  const messagesEndRef = useRef(null)

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          content: `Hi there! 👋 I'm GEOBUY's AI assistant.\n\nI can help you with:\n• Booking errands 🛒\n• Finding providers 🔍\n• Payments 💳\n• Account questions 👤\n\nIf I can't help, I'll connect you to a real agent!`,
          timestamp: new Date(),
        }
      ])
    }
  }, [isOpen])

  // Scroll to bottom
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/chatbot/response', {
        message: inputMessage.trim(),
        chatId: chatId,
      }, {
        withCredentials: true,
      })

      if (response.data.success) {
        setChatId(response.data.chatId)

        // Add bot response
        const botMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          content: response.data.botMessage.content,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, botMessage])

        // Check if escalated
        if (response.data.shouldEscalate) {
          setIsEscalated(true)
          toast.info('Connecting you to a real agent...')
        }
      }
    } catch (error) {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-large hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-primary text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FaRobot className="text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">GEOBUY Assistant</h3>
                  <div className="flex items-center space-x-1 text-xs text-white/80">
                    <FaCircle className="text-green-400 text-[6px]" />
                    <span>{isEscalated ? 'Connecting to agent...' : 'Online'}</span>
                  </div>
                </div>
              </div>
              {isEscalated && (
                <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-full text-xs">
                  <FaHeadset className="text-yellow-300" />
                  <span>Agent coming</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 h-96 overflow-y-auto p-4 bg-gray-50 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {msg.sender === 'user' ? <FaUser size={14} /> : <FaRobot size={14} />}
                    </div>
                    <div className={`p-3 rounded-xl ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-white shadow-soft text-text'
                    }`}>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-text-lighter'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white shadow-soft p-3 rounded-xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isEscalated ? "Agent will join shortly..." : "Type your message..."}
                disabled={isEscalated}
                className="flex-1 input-field resize-none py-2 px-3 max-h-24 text-sm disabled:opacity-50"
                rows="1"
                style={{ minHeight: '40px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isEscalated}
                className="btn-primary py-2 px-4 flex items-center space-x-2 disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </div>
            <p className="text-xs text-text-lighter mt-2 text-center">
              {isEscalated 
                ? '🔄 Connecting you to a real agent...' 
                : '💬 Chat with AI. Type "help" for options.'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatbotWidget