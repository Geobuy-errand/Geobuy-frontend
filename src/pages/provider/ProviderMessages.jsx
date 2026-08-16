import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetProviderServiceRequestsQuery } from '../../redux/services/serviceApi'
import { useGetMessagesQuery } from '../../redux/services/messageApi'
import { FaComments, FaChevronRight, FaUser, FaClipboardList } from 'react-icons/fa'

const ServiceProviderMessages = () => {
  const { data: requests } = useGetProviderServiceRequestsQuery()
  const [selectedRequest, setSelectedRequest] = useState(null)
  const { data: messages } = useGetMessagesQuery(selectedRequest?._id, {
    skip: !selectedRequest,
  })

  // Get active requests
  const activeRequests = requests?.filter(r => 
    r.status !== 'cancelled' && r.status !== 'completed'
  ) || []

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="card md:col-span-1">
          <h2 className="text-lg font-semibold text-text mb-4">Active Service Requests</h2>
          {activeRequests.length === 0 ? (
            <p className="text-text-light text-sm">No active service requests to message about</p>
          ) : (
            <div className="space-y-2">
              {activeRequests.map((request) => (
                <button
                  key={request._id}
                  onClick={() => setSelectedRequest(request)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedRequest?._id === request._id
                      ? 'bg-primary/10'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-text">{request.serviceType}</p>
                      <p className="text-sm text-text-light">
                        #{request.requestId} - {request.customerId?.fullName}
                      </p>
                    </div>
                    <FaChevronRight className={`text-text-lighter transition-transform ${
                      selectedRequest?._id === request._id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="card md:col-span-2">
          {selectedRequest ? (
            <>
              <div className="border-b border-gray-100 pb-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FaUser className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text">
                      {selectedRequest.customerId?.fullName}
                    </h3>
                    <p className="text-sm text-text-light flex items-center">
                      <FaClipboardList className="mr-1 text-xs" />
                      {selectedRequest.serviceType}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {messages?.length === 0 ? (
                  <p className="text-text-light text-center py-8">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  messages?.map((msg) => (
                    <div key={msg._id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">
                          {msg.senderId.fullName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-text text-sm">
                            {msg.senderId.fullName}
                          </span>
                          <span className="text-xs text-text-lighter">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-text-light text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <FaComments className="text-4xl text-text-lighter mx-auto mb-4" />
              <p className="text-text-light">Select a service request to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ServiceProviderMessages