import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaUpload, FaFile, FaImage, FaTimes, FaFileAlt } from 'react-icons/fa'

const DocumentUpload = ({ errandId, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [documentType, setDocumentType] = useState('image')
  const [description, setDescription] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('document', file)
      formData.append('documentType', documentType)
      formData.append('description', description)

      const response = await fetch(`/api/qr/upload/${errandId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Document uploaded successfully')
        setUploadedDocs(prev => [...prev, data.document])
        setDescription('')
        if (onUploadComplete) {
          onUploadComplete(data.document)
        }
      } else {
        toast.error(data.message || 'Failed to upload document')
      }
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
      e.target.value = '' // Reset file input
    }
  }

  const removeDocument = async (docIndex) => {
    // In production, you'd have an API endpoint to delete documents
    setUploadedDocs(prev => prev.filter((_, i) => i !== docIndex))
    toast.success('Document removed')
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
        <FaFileAlt className="mr-2 text-primary" />
        Documents & Pickup Info
      </h3>

      {/* Upload Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="input-field"
            >
              <option value="image">Image</option>
              <option value="receipt">Receipt</option>
              <option value="pickup_document">Pickup Document</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-light mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder="What is this document?"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="cursor-pointer btn-primary text-sm py-2 px-4 flex items-center space-x-2 disabled:opacity-50">
            <FaUpload />
            <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          <span className="text-xs text-text-light">
            JPG, PNG, PDF (Max 5MB)
          </span>
        </div>
      </div>

      {/* Uploaded Documents */}
      {uploadedDocs.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-text mb-2">Uploaded Documents</h4>
          <div className="space-y-2">
            {uploadedDocs.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {doc.type === 'receipt' ? (
                    <FaFile className="text-primary" />
                  ) : (
                    <FaImage className="text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-text">{doc.filename || doc.type}</p>
                    {doc.description && (
                      <p className="text-xs text-text-light">{doc.description}</p>
                    )}
                    <p className="text-xs text-text-lighter">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-text-light">
        <p>📌 <strong>Pickup Instructions:</strong></p>
        <ul className="list-disc list-inside text-xs mt-1 space-y-1">
          <li>Upload a receipt or document for the errand runner to pickup</li>
          <li>This could be a store receipt, collection code, or identification</li>
          <li>The runner will use this to verify the pickup</li>
          <li>Documents are securely stored and only visible to the errand parties</li>
        </ul>
      </div>
    </div>
  )
}

export default DocumentUpload