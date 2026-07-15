import React, { useState } from 'react'
import { FaHeadset, FaEnvelope, FaPhone, FaClock, FaComment, FaUser, FaPaperPlane } from 'react-icons/fa'

const AdminSupport = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      subject: 'Payment Issue',
      customer: 'John Doe',
      status: 'open',
      priority: 'high',
      created: '2024-01-15T10:00:00',
      message: 'My payment was processed but the booking was not confirmed.',
    },
    {
      id: 2,
      subject: 'Provider Verification',
      customer: 'Sarah Smith',
      status: 'in_progress',
      priority: 'medium',
      created: '2024-01-14T15:30:00',
      message: 'I submitted my documents 3 days ago but still not verified.',
    },
    {
      id: 3,
      subject: 'Booking Cancellation',
      customer: 'Mike Johnson',
      status: 'resolved',
      priority: 'low',
      created: '2024-01-13T09:15:00',
      message: 'I need to cancel my booking but the button is not working.',
    },
  ])

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [reply, setReply] = useState('')

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700'
      case 'resolved': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const handleReply = () => {
    if (!reply.trim()) return
    // In a real app, this would send the reply
    alert(`Reply sent: ${reply}`)
    setReply('')
    toast.success('Reply sent successfully')
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Support</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <FaHeadset className="text-2xl text-primary" />
            <div>
              <p className="text-sm text-text-light">Open Tickets</p>
              <p className="text-xl font-bold text-text">
                {tickets.filter(t => t.status === 'open').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <FaClock className="text-2xl text-secondary" />
            <div>
              <p className="text-sm text-text-light">In Progress</p>
              <p className="text-xl font-bold text-text">
                {tickets.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <FaCheck className="text-2xl text-green-600" />
            <div>
              <p className="text-sm text-text-light">Resolved</p>
              <p className="text-xl font-bold text-text">
                {tickets.filter(t => t.status === 'resolved').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <FaEnvelope className="text-2xl text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-text">Email</h3>
          <p className="text-sm text-text-light">support@geobuy.com</p>
          <p className="text-xs text-text-lighter">Reply within 24 hours</p>
        </div>
        <div className="card text-center">
          <FaPhone className="text-2xl text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-text">Phone</h3>
          <p className="text-sm text-text-light">+44 20 1234 5678</p>
          <p className="text-xs text-text-lighter">Mon-Fri 9AM-6PM</p>
        </div>
        <div className="card text-center">
          <FaComment className="text-2xl text-primary mx-auto mb-2" />
          <h3 className="font-semibold text-text">Live Chat</h3>
          <p className="text-sm text-text-light">Available 24/7</p>
          <p className="text-xs text-text-lighter">Instant support</p>
        </div>
      </div>

      {/* Tickets and Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1 card">
          <h2 className="text-lg font-semibold text-text mb-4">Support Tickets</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-primary/10'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-text">{ticket.subject}</p>
                    <p className="text-sm text-text-light">{ticket.customer}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority} priority
                  </span>
                  <span className="text-xs text-text-lighter">
                    {new Date(ticket.created).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-2 card">
          {selectedTicket ? (
            <div>
              <div className="border-b border-gray-100 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-text">{selectedTicket.subject}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center text-sm text-text-light">
                        <FaUser className="mr-1" />
                        {selectedTicket.customer}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                        {selectedTicket.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority} priority
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-text-lighter">
                    {new Date(selectedTicket.created).toLocaleString()}
                  </span>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-text-light">{selectedTicket.message}</p>
                </div>
              </div>

              {/* Reply Section */}
              <div>
                <h4 className="font-semibold text-text mb-2">Reply to Customer</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    className="input-field flex-1"
                  />
                  <button
                    onClick={handleReply}
                    className="btn-primary py-2 px-4 flex items-center space-x-2"
                  >
                    <FaPaperPlane />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaHeadset className="text-4xl text-text-lighter mx-auto mb-4" />
              <p className="text-text-light">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSupport