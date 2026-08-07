import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaCamera, FaQrcode, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'

const QrCodeScanner = ({ errandId, onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsScanning(true)
    setScanResult(null)

    try {
      // Read the QR code from the uploaded image
      const imageUrl = URL.createObjectURL(file)
      const qrData = await decodeQRCode(imageUrl)
      
      if (qrData) {
        await verifyQRCode(qrData)
      } else {
        toast.error('No QR code found in the image')
      }
    } catch (error) {
      toast.error('Failed to scan QR code')
    } finally {
      setIsScanning(false)
    }
  }

  const verifyQRCode = async (qrData) => {
    setIsVerifying(true)
    try {
      const response = await fetch(`/api/qr/scan/${errandId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setScanResult({
          success: true,
          message: data.message,
          scanCount: data.scanCount,
          status: data.status,
        })
        toast.success(data.message)
        if (onScanComplete) {
          onScanComplete(data)
        }
      } else {
        setScanResult({
          success: false,
          message: data.message || 'Verification failed',
        })
        toast.error(data.message || 'Verification failed')
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Failed to verify QR code',
      })
      toast.error('Failed to verify QR code')
    } finally {
      setIsVerifying(false)
    }
  }

  // Simple QR code decoder using an external library
  const decodeQRCode = (imageUrl) => {
    return new Promise((resolve) => {
      // In production, use a QR code decoding library
      // For now, we'll simulate with a mock
      // You can use: https://www.npmjs.com/package/qr-scanner
      // or: https://www.npmjs.com/package/html5-qrcode
      
      // Mock implementation - in production, use html5-qrcode or qr-scanner
      setTimeout(() => {
        resolve(JSON.stringify({
          errandId: errandId,
          type: 'errand_verification',
          verificationToken: 'mock-token',
          timestamp: new Date().toISOString(),
        }))
      }, 1500)
    })
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center">
        <FaQrcode className="mr-2 text-primary" />
        QR Code Scanner
      </h3>

      <div className="space-y-4">
        {/* Upload QR Code Image */}
        <div>
          <p className="text-sm text-text-light mb-2">
            Upload a screenshot of the QR code or use your camera
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="btn-primary text-sm py-2 px-4 cursor-pointer flex items-center space-x-2">
              <FaCamera />
              <span>Upload QR Code</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isScanning || isVerifying}
              />
            </label>
          </div>
        </div>

        {/* Scanning Status */}
        {isScanning && (
          <div className="text-center py-4">
            <FaSpinner className="animate-spin text-primary text-3xl mx-auto mb-2" />
            <p className="text-text-light">Scanning QR code...</p>
          </div>
        )}

        {isVerifying && (
          <div className="text-center py-4">
            <FaSpinner className="animate-spin text-primary text-3xl mx-auto mb-2" />
            <p className="text-text-light">Verifying QR code...</p>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && !isScanning && !isVerifying && (
          <div className={`p-4 rounded-xl border ${
            scanResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              {scanResult.success ? (
                <FaCheckCircle className="text-green-600 text-xl mt-0.5" />
              ) : (
                <FaTimesCircle className="text-red-600 text-xl mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${
                  scanResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {scanResult.message}
                </p>
                {scanResult.success && scanResult.scanCount && (
                  <div className="mt-2 text-sm text-text-light">
                    <p>Scan #{scanResult.scanCount}</p>
                    <p>Status: {scanResult.status}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QrCodeScanner