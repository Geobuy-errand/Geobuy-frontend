import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FaQrcode, FaDownload, FaPrint, FaCopy, FaClock, FaCheckCircle } from 'react-icons/fa'

const QrCodeDisplay = ({ errandId }) => {
  const [qrCode, setQrCode] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    generateQRCode()
  }, [errandId])

  const generateQRCode = async () => {
    setIsGenerating(true)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/qr/generate/${errandId}`, {
        method: 'GET',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        toast.success('QR Code generated successfully')
      } else {
        toast.error(data.message || 'Failed to generate QR code')
      }
    } catch (error) {
      toast.error('Failed to generate QR code')
    } finally {
      setIsLoading(false)
      setIsGenerating(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCode?.dataUrl) return

    const link = document.createElement('a')
    link.download = `errand-${errandId}-qr.png`
    link.href = qrCode.dataUrl
    link.click()
  }

  const printQRCode = () => {
    if (!qrCode?.dataUrl) return

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>QR Code</title></head>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;">
            <img src="${qrCode.dataUrl}" style="max-width:500px;" />
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const copyVerificationToken = () => {
    if (!qrCode?.verificationToken) return

    navigator.clipboard.writeText(qrCode.verificationToken)
    toast.success('Verification token copied to clipboard')
  }

  if (isLoading) {
    return (
      <div className="card text-center py-8">
        <div className="skeleton h-48 w-48 rounded-xl mx-auto"></div>
        <div className="skeleton h-4 w-32 mx-auto mt-4"></div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
        <FaQrcode className="mr-2 text-primary" />
        Errand QR Code
      </h3>

      <div className="text-center">
        {/* QR Code Image */}
        <div className="bg-white p-4 rounded-xl shadow-soft inline-block">
          {qrCode?.dataUrl ? (
            <img 
              src={qrCode.dataUrl} 
              alt="Errand QR Code"
              className="w-48 h-48 mx-auto"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-text-light">No QR Code</span>
            </div>
          )}
        </div>

        {/* QR Code Info */}
        {qrCode && (
          <div className="mt-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-light">Errand Code</span>
              <span className="font-medium">{qrCode.errandCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-light">Status</span>
              <span className="flex items-center text-green-600">
                <FaCheckCircle className="mr-1" />
                Active
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-light">Expires</span>
              <span className="font-medium">
                {new Date(qrCode.expiresAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-light">Verification Token</span>
              <button
                onClick={copyVerificationToken}
                className="text-primary hover:underline text-xs flex items-center"
              >
                <FaCopy className="mr-1" />
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button
            onClick={generateQRCode}
            disabled={isGenerating}
            className="btn-primary text-sm py-2 px-4 flex items-center space-x-2 disabled:opacity-50"
          >
            <FaQrcode />
            <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
          </button>
          
          <button
            onClick={downloadQRCode}
            disabled={!qrCode?.dataUrl}
            className="btn-outline text-sm py-2 px-4 flex items-center space-x-2 disabled:opacity-50"
          >
            <FaDownload />
            <span>Download</span>
          </button>
          
          <button
            onClick={printQRCode}
            disabled={!qrCode?.dataUrl}
            className="btn-outline text-sm py-2 px-4 flex items-center space-x-2 disabled:opacity-50"
          >
            <FaPrint />
            <span>Print</span>
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-text-light">
          <p>📌 <strong>Instructions:</strong></p>
          <ul className="list-disc list-inside text-xs mt-1 space-y-1">
            <li>Show this QR code to your errand runner for verification</li>
            <li>The runner will scan this code to confirm pickup and delivery</li>
            <li>Each scan updates the errand status</li>
            <li>QR code expires in 24 hours</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default QrCodeDisplay