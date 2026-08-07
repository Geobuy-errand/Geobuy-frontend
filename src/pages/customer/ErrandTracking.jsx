import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetErrandByIdQuery,
  useUpdateErrandStatusMutation,
} from "../../redux/services/errandApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaCircle,
  FaLocationArrow,
  FaBox,
  FaFileAlt,
  FaPills,
  FaTshirt,
  FaUsers,
  FaShoppingBag,
  FaQrcode,
  FaDownload,
  FaPrint,
  FaCopy,
  FaUpload,
  FaImage,
  FaFile,
  FaTimes,
  FaSpinner,
  FaCamera,
  FaArrowRight,
  FaComments,
  FaExpand,
  FaCompress,
} from "react-icons/fa";
import axios from "axios";

const ErrandTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: errand, isLoading, refetch } = useGetErrandByIdQuery(id);
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateErrandStatusMutation();

  // QR Code State
  const [qrCode, setQrCode] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrError, setQrError] = useState(null);

  // Document Upload State
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [documentType, setDocumentType] = useState("image");
  const [documentDescription, setDocumentDescription] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [showQRCode, setShowQRCode] = useState(false);

  // QR Code Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef(null);

  // Image Modal State
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isCustomer = user?._id === errand?.customerId?._id;
  const isProvider = user?._id === errand?.providerId?._id;

  // Load QR code on mount
  useEffect(() => {
    if (errand && isCustomer) {
      loadQRCode();
    }
  }, [errand, isCustomer]);

  // Load documents
  useEffect(() => {
    if (errand) {
      setDocuments(errand.documents || []);
      setUploadedDocs(errand.documents || []);
    }
  }, [errand]);

  const getServiceIcon = (type) => {
    switch (type) {
      case "parcel_delivery":
        return FaBox;
      case "document_delivery":
        return FaFileAlt;
      case "prescription_pickup":
        return FaPills;
      case "dry_cleaning_pickup":
        return FaTshirt;
      case "queue_waiting":
        return FaUsers;
      case "shopping":
        return FaShoppingBag;
      default:
        return FaBox;
    }
  };

  const statusSteps = [
    { key: "pending", label: "Pending", icon: FaCircle },
    { key: "accepted", label: "Accepted", icon: FaCheckCircle },
    { key: "en_route", label: "En Route", icon: FaLocationArrow },
    { key: "collected", label: "Collected", icon: FaBox },
    { key: "delivered", label: "Delivered", icon: FaCheckCircle },
  ];

  const getCurrentStepIndex = () => {
    const statusMap = {
      pending: 0,
      accepted: 1,
      en_route: 2,
      collected: 3,
      delivered: 4,
    };
    return statusMap[errand?.status] || 0;
  };

  // ============================================================
  // QR CODE FUNCTIONS
  // ============================================================

  const loadQRCode = async () => {
    setIsGeneratingQR(true);
    setQrError(null);

    try {
      const response = await axios.get(`/api/errands/${id}/qr-code`, {
        withCredentials: true,
      });

      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
      } else {
        setQrError("No QR code available");
      }
    } catch (error) {
      console.error("QR Code load error:", error);
      setQrError(error.response?.data?.message || "Failed to load QR code");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    setQrError(null);

    try {
      const response = await axios.get(`/api/errands/${id}/qr-code`, {
        withCredentials: true,
      });

      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        toast.success("QR Code generated successfully");
      }
    } catch (error) {
      console.error("QR Code generation error:", error);
      setQrError(error.response?.data?.message || "Failed to generate QR code");
      toast.error("Failed to generate QR code");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCode?.dataUrl) return;

    const link = document.createElement("a");
    link.download = `errand-${errand?.errandId}-qr.png`;
    link.href = qrCode.dataUrl;
    link.click();
  };

  const printQRCode = () => {
    if (!qrCode?.dataUrl) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>QR Code - ${errand?.errandId}</title></head>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;flex-direction:column;font-family:sans-serif;">
            <h2 style="margin-bottom:20px;">Errand QR Code</h2>
            <p style="margin-bottom:10px;color:#666;">${errand?.errandId}</p>
            <img src="${
              qrCode.dataUrl
            }" style="max-width:400px;border:2px solid #e0e0e0;border-radius:12px;padding:20px;" />
            <p style="margin-top:20px;color:#999;font-size:12px;">Generated on ${new Date().toLocaleString()}</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const copyVerificationToken = () => {
    if (!qrCode?.verificationToken) return;

    navigator.clipboard.writeText(qrCode.verificationToken);
    toast.success("Verification token copied to clipboard");
  };

  // ============================================================
  // QR CODE SCANNER FUNCTIONS
  // ============================================================

  const handleScanFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      // In production, use a QR code scanning library
      // For demo, we'll simulate scanning
      const qrData = await simulateQRScan(file);

      if (qrData) {
        await verifyQRCode(qrData);
      } else {
        toast.error("No QR code found in the image");
      }
    } catch (error) {
      toast.error("Failed to scan QR code");
    } finally {
      setIsScanning(false);
      e.target.value = "";
    }
  };

  const simulateQRScan = (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          JSON.stringify({
            errandId: id,
            type: "errand_verification",
            verificationToken: "simulated-token",
            timestamp: new Date().toISOString(),
          })
        );
      }, 1500);
    });
  };

  const verifyQRCode = async (qrData) => {
    setIsVerifying(true);
    try {
      const response = await axios.post(
        `/api/errands/${id}/scan-qr`,
        { qrData },
        { withCredentials: true }
      );

      setScanResult({
        success: true,
        message: response.data.message,
        scanCount: response.data.scanCount,
        status: response.data.status,
      });
      toast.success(response.data.message);
      refetch();
    } catch (error) {
      setScanResult({
        success: false,
        message: error.response?.data?.message || "Verification failed",
      });
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  // ============================================================
  // DOCUMENT UPLOAD FUNCTIONS
  // ============================================================

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPEG, PNG, and PDF files are allowed");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", documentType);
      formData.append("description", documentDescription);

      const response = await axios.post(
        `/api/errands/${id}/upload-document`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.document) {
        setUploadedDocs((prev) => [...prev, response.data.document]);
        setDocuments((prev) => [...prev, response.data.document]);
        setDocumentDescription("");
        toast.success("Document uploaded successfully");
        refetch();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ============================================================
  // IMAGE MODAL FUNCTIONS
  // ============================================================

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setModalImage(null);
    document.body.style.overflow = "unset";
  };

  // ============================================================
  // STATUS UPDATE FUNCTIONS
  // ============================================================

  const canUpdateStatus = () => {
    if (!user || !errand) return false;
    const isProvider = user._id === errand.providerId?._id;
    const isCustomer = user._id === errand.customerId?._id;

    if (errand.status === "pending") return false;
    if (errand.status === "delivered" || errand.status === "cancelled")
      return false;

    return isProvider || user.role === "admin";
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const location = {
        lat: 51.5074 + (Math.random() - 0.5) * 0.01,
        lng: -0.1276 + (Math.random() - 0.5) * 0.01,
      };

      await updateStatus({ id, status: newStatus, location }).unwrap();
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Failed to update status");
    }
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
           lowerUrl.includes('image') || 
           lowerUrl.includes('cloudinary') && !lowerUrl.includes('.pdf');
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-64 rounded-xl"></div>
        <div className="mt-6 space-y-4">
          <div className="skeleton h-32 rounded-xl"></div>
          <div className="skeleton h-32 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!errand) {
    return (
      <div className="text-center py-12">
        <p className="text-text-light">Errand not found</p>
        <button
          onClick={() => navigate("/customer/errands")}
          className="text-primary hover:underline mt-2"
        >
          Back to errands
        </button>
      </div>
    );
  }

  const ServiceIcon = getServiceIcon(errand.serviceType);
  const currentStep = getCurrentStepIndex();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Image Modal */}
      {isModalOpen && modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
            >
              <FaTimes className="text-2xl" />
            </button>
            <button
              onClick={closeImageModal}
              className="absolute top-1/2 -left-4 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-black/50 rounded-full"
            >
              <FaTimes className="text-xl rotate-45" />
            </button>
            <button
              onClick={closeImageModal}
              className="absolute top-1/2 -right-4 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-black/50 rounded-full"
            >
              <FaTimes className="text-xl -rotate-45" />
            </button>
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              <img
                src={modalImage}
                alt="Document preview"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-text-light">
                  Click outside to close
                </span>
                <a
                  href={modalImage}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm py-1 px-3 flex items-center space-x-2"
                >
                  <FaDownload />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate("/customer/errands")}
        className="flex items-center space-x-2 text-text-light hover:text-primary transition-colors mb-6"
      >
        <FaArrowLeft />
        <span>Back to Errands</span>
      </button>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ServiceIcon className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">
                Errand #{errand.errandId}
              </h1>
              <p className="text-text-light capitalize">
                {errand.serviceType.replace("_", " ")}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium
            ${
              errand.status === "delivered"
                ? "bg-green-100 text-green-700"
                : errand.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : errand.status === "cancelled"
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {errand.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-text mb-6">Progress</h2>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div
            className="absolute left-5 top-0 w-0.5 bg-primary transition-all duration-500"
            style={{
              height: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
            }}
          />

          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="flex items-start space-x-4 mb-6 last:mb-0 relative"
              >
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10
                  ${
                    isCompleted
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-400"
                  }
                  ${isCurrent ? "ring-4 ring-primary/20" : ""}
                `}
                >
                  <Icon
                    className={isCompleted ? "text-white" : "text-gray-400"}
                  />
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium ${
                        isCompleted ? "text-text" : "text-text-light"
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span className="text-xs text-primary font-medium">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Section - Always visible for customer */}
      {isCustomer && errand.status !== "cancelled" && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <FaQrcode className="mr-2 text-primary" />
            QR Code
          </h2>

          <div className="text-center">
            {isGeneratingQR ? (
              <div className="py-8">
                <FaSpinner className="animate-spin text-primary text-3xl mx-auto mb-3" />
                <p className="text-text-light">Loading QR Code...</p>
              </div>
            ) : qrError ? (
              <div className="text-center py-8">
                <p className="text-red-600">{qrError}</p>
                <button
                  onClick={generateQRCode}
                  className="mt-3 btn-primary text-sm py-2 px-4"
                >
                  Generate QR Code
                </button>
              </div>
            ) : qrCode?.dataUrl ? (
              <>
                <div className="bg-white p-4 rounded-xl shadow-soft inline-block">
                  <img
                    src={qrCode.dataUrl}
                    alt="Errand QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>

                <div className="mt-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-light">Errand Code</span>
                    <span className="font-medium">{errand.errandId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Status</span>
                    <span className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-1" />
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Scans</span>
                    <span className="font-medium">
                      {errand.qrCode?.scanCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Expires</span>
                    <span className="font-medium">
                      {qrCode.expiresAt
                        ? new Date(qrCode.expiresAt).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={downloadQRCode}
                    className="btn-outline text-sm py-2 px-4 flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={printQRCode}
                    className="btn-outline text-sm py-2 px-4 flex items-center space-x-2"
                  >
                    <FaPrint />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={copyVerificationToken}
                    className="btn-outline text-sm py-2 px-4 flex items-center space-x-2"
                  >
                    <FaCopy />
                    <span>Copy Token</span>
                  </button>
                  <button
                    onClick={generateQRCode}
                    disabled={isGeneratingQR}
                    className="btn-primary text-sm py-2 px-4 flex items-center space-x-2"
                  >
                    <FaQrcode />
                    <span>Regenerate</span>
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-text-light text-left">
                  <p>
                    📌 <strong>Instructions:</strong>
                  </p>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                    <li>Show this QR code to your errand runner</li>
                    <li>The runner will scan to confirm pickup and delivery</li>
                    <li>Each scan updates the errand status</li>
                    <li>QR code expires in 24 hours</li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="py-8">
                <p className="text-text-light">No QR code available</p>
                <button
                  onClick={generateQRCode}
                  className="mt-3 btn-primary text-sm py-2 px-4"
                >
                  Generate QR Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Code Scanner - Show to provider */}
      {isProvider &&
        (errand.status === "accepted" || errand.status === "en_route") && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
              <FaCamera className="mr-2 text-primary" />
              Scan QR Code
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-text-light">
                Upload a photo of the customer's QR code to verify pickup or
                delivery
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <label className="btn-primary text-sm py-2 px-4 cursor-pointer flex items-center space-x-2">
                  <FaUpload />
                  <span>Scan QR Code</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleScanFile}
                    className="hidden"
                    disabled={isScanning || isVerifying}
                  />
                </label>
              </div>

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

              {scanResult && !isScanning && !isVerifying && (
                <div
                  className={`p-4 rounded-xl border ${
                    scanResult.success
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {scanResult.success ? (
                      <FaCheckCircle className="text-green-600 text-xl mt-0.5" />
                    ) : (
                      <FaTimesCircle className="text-red-600 text-xl mt-0.5" />
                    )}
                    <div>
                      <p
                        className={`font-medium ${
                          scanResult.success ? "text-green-700" : "text-red-700"
                        }`}
                      >
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
        )}

      {/* Document Upload Section - Show to both customer and provider */}
      {errand.status !== "cancelled" && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <FaFileAlt className="mr-2 text-primary" />
            Documents & Pickup Info
          </h2>

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
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  className="input-field"
                  placeholder="What is this document?"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="cursor-pointer btn-primary text-sm py-2 px-4 flex items-center space-x-2 disabled:opacity-50">
                <FaUpload />
                <span>{isUploading ? "Uploading..." : "Upload Document"}</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleDocumentUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              <span className="text-xs text-text-light">
                JPG, PNG, PDF (Max 5MB)
              </span>
            </div>

            {/* Uploaded Documents */}
            {uploadedDocs.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-text mb-2">
                  Uploaded Documents ({uploadedDocs.length})
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {uploadedDocs.map((doc, index) => {
                    const isImage = isImageFile(doc.url);
                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                          {/* Document Preview */}
                          {isImage ? (
                            <button
                              onClick={() => openImageModal(doc.url)}
                              className="block shrink-0 group relative rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                            >
                              <img
                                src={doc.url}
                                alt={doc.description || "Document preview"}
                                className="w-16 h-16 md:w-20 md:h-20 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                <FaExpand className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm" />
                              </div>
                            </button>
                          ) : (
                            <div className="p-3 bg-white rounded-lg border border-gray-200 shrink-0 flex items-center justify-center w-16 h-16 md:w-20 md:h-20">
                              {doc.type === "receipt" ? (
                                <FaFile className="text-primary text-2xl" />
                              ) : (
                                <FaFileAlt className="text-primary text-2xl" />
                              )}
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-text truncate">
                              {doc.filename || doc.type}
                            </p>
                            {doc.description && (
                              <p className="text-xs text-text-light break-words line-clamp-2">
                                {doc.description}
                              </p>
                            )}
                            <p className="text-xs text-text-lighter mt-0.5">
                              {doc.uploadedAt
                                ? new Date(doc.uploadedAt).toLocaleString()
                                : "Just now"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pl-16 sm:pl-0">
                          {isImage && (
                            <button
                              onClick={() => openImageModal(doc.url)}
                              className="text-primary hover:text-primary-dark text-sm flex items-center space-x-1"
                            >
                              <FaExpand />
                              <span className="hidden sm:inline">Expand</span>
                            </button>
                          )}
                          {/* <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-dark text-sm flex items-center space-x-1"
                          >
                            <span className="hidden sm:inline">View</span>
                            <FaArrowRight className="text-xs" />
                          </a> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat with Provider Button */}
            {errand.providerId && (
              <button
                onClick={async () => {
                  try {
                    const response = await axios.post(
                      `/api/chats/errand/${errand._id}/initiate`,
                      {},
                      {
                        withCredentials: true,
                      }
                    );
                    if (response.data.chatId) {
                      navigate(`/${user?.role}/chat-support`);
                    }
                  } catch (error) {
                    toast.error("Failed to start chat");
                  }
                }}
                className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 w-full"
              >
                <FaComments />
                <span>Chat with Provider</span>
              </button>
            )}

            <div className="p-3 bg-blue-50 rounded-lg text-sm text-text-light">
              <p>
                📌 <strong>Pickup Instructions:</strong>
              </p>
              <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                <li>Upload a receipt or document for the errand runner</li>
                <li>The runner will use this to verify the pickup</li>
                <li>
                  Documents are securely stored and only visible to the errand
                  parties
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Location & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-primary" />
            Location
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-text-light">Pickup</span>
              <p className="text-text">{errand.pickup?.address}</p>
              {errand.pickup?.instructions && (
                <p className="text-sm text-text-lighter mt-1">
                  📝 {errand.pickup.instructions}
                </p>
              )}
            </div>
            {errand.dropoff?.address && (
              <div>
                <span className="text-sm text-text-light">Dropoff</span>
                <p className="text-text">{errand.dropoff.address}</p>
                {errand.dropoff?.instructions && (
                  <p className="text-sm text-text-lighter mt-1">
                    📝 {errand.dropoff.instructions}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center">
            <FaUser className="mr-2 text-primary" />
            {errand.providerId ? "Provider" : "Status"}
          </h2>
          {errand.providerId ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FaUser className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-text">
                    {errand.providerId.fullName}
                  </p>
                  <p className="text-sm text-text-light">
                    ⭐ {errand.providerId.averageRating?.toFixed(1) || "New"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-text-light">
                <FaPhone className="text-text-lighter" />
                <span>{errand.providerId.phoneNumber}</span>
              </div>
            </div>
          ) : (
            <p className="text-text-light">Waiting for a provider to accept</p>
          )}
        </div>
      </div>

      {/* Task Details */}
      {errand.taskDetails && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text mb-2">Task Details</h2>
          <p className="text-text-light">{errand.taskDetails}</p>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          Price Breakdown
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-text-light">Base Fee</span>
            <span className="font-medium">
              £{errand.baseFee?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-light">
              Distance ({errand.distance?.toFixed(1) || 0} miles)
            </span>
            <span className="font-medium">
              £{errand.distanceFee?.toFixed(2) || "0.00"}
            </span>
          </div>
          {errand.isHeavyItem && (
            <div className="flex justify-between text-orange-600">
              <span>Heavy Item Fee</span>
              <span>+£{errand.heavyItemFee?.toFixed(2) || "0.00"}</span>
            </div>
          )}
          {errand.waitTimeMinutes > 5 && (
            <div className="flex justify-between text-orange-600">
              <span>Wait Time</span>
              <span>+£{errand.waitTimeFee?.toFixed(2) || "0.00"}</span>
            </div>
          )}
          {errand.isPeakUrgent && (
            <div className="flex justify-between text-orange-600">
              <span>Peak/Urgent Fee</span>
              <span>+£{errand.peakUrgentFee?.toFixed(2) || "0.00"}</span>
            </div>
          )}
          {errand.extraStopsCount > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Extra Stops ({errand.extraStopsCount})</span>
              <span>+£{errand.extraStopsFee?.toFixed(2) || "0.00"}</span>
            </div>
          )}
          {errand.isSubscribed && (
            <div className="flex justify-between text-green-600">
              <span>Subscription Discount (20%)</span>
              <span>-£{errand.discountAmount?.toFixed(2) || "0.00"}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200">
            <span className="font-semibold text-text">Total</span>
            <span className="text-xl font-bold text-primary">
              £{errand.total?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canUpdateStatus() && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-text mb-4">
            Update Status
          </h2>
          <div className="flex flex-wrap gap-3">
            {errand.status === "accepted" && (
              <button
                onClick={() => handleStatusUpdate("en_route")}
                disabled={isUpdating}
                className="btn-primary text-sm py-2"
              >
                Mark as En Route
              </button>
            )}
            {errand.status === "en_route" && (
              <button
                onClick={() => handleStatusUpdate("collected")}
                disabled={isUpdating}
                className="btn-primary text-sm py-2"
              >
                Mark as Collected
              </button>
            )}
            {errand.status === "collected" && (
              <button
                onClick={() => handleStatusUpdate("delivered")}
                disabled={isUpdating}
                className="btn-primary text-sm py-2"
              >
                Mark as Delivered
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Location (Optional) */}
      {errand.requiresLiveTracking && errand.status !== "pending" && (
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text flex items-center">
              <FaLocationArrow className="mr-2 text-primary" />
              Live Location
            </h2>
          </div>
          <div className="mt-4 h-48 bg-gray-200 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="text-4xl text-primary mx-auto mb-2" />
              <p className="text-text-light">Live location tracking</p>
              <p className="text-sm text-text-lighter">
                Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrandTracking;