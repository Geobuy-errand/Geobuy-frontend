import React, { useState } from "react";
import { useGetUsersQuery } from "../../redux/services/adminApi";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaStar,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import Pagination from "../../components/utils/Pagination";

const AdminProviders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ✅ Server-side pagination - send page and limit to API
  const { data, isLoading } = useGetUsersQuery({
    role: "provider",
    search: searchTerm,
    verificationStatus: verificationFilter,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Extract data from response
  const providers = data?.users || [];
  const totalProviders = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // Reset to page 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="flex items-center text-green-600 text-sm">
            <FaCheckCircle className="mr-1" /> Verified
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center text-yellow-600 text-sm">
            <FaClock className="mr-1" /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center text-red-600 text-sm">
            <FaCheckCircle className="mr-1" /> Rejected
          </span>
        );
      default:
        return <span className="text-gray-600 text-sm">Not Submitted</span>;
    }
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-text mb-6">
        Providers
      </h1>

      {/* Stats Summary */}
      {!isLoading && data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-text-light">Total Providers</p>
            <p className="text-2xl font-bold text-primary">{data.total || 0}</p>
          </div>
          <div className="card border-green-200 bg-green-50">
            <p className="text-sm text-text-light">Verified</p>
            <p className="text-2xl font-bold text-green-700">
              {data.stats?.verified || 0}
            </p>
          </div>
          <div className="card border-yellow-200 bg-yellow-50">
            <p className="text-sm text-text-light">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">
              {data.stats?.pending || 0}
            </p>
          </div>
          <div className="card border-red-200 bg-red-50">
            <p className="text-sm text-text-light">Rejected</p>
            <p className="text-2xl font-bold text-red-700">
              {data.stats?.rejected || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={verificationFilter}
          onChange={(e) => handleFilterChange(setVerificationFilter, e.target.value)}
          className="input-field w-full md:w-48"
        >
          <option value="">All Verification</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <Link
          to="/admin/verification"
          className="btn-primary text-sm py-2 px-4 flex items-center whitespace-nowrap"
        >
          Verification Queue
        </Link>
      </div>

      {/* Providers List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-24 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No providers found</p>
          {(searchTerm || verificationFilter) && (
            <p className="text-sm text-text-lighter mt-2">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider._id}
                className="card hover:shadow-medium transition-shadow"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-primary text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text">
                        {provider.fullName}
                      </h3>
                      <p className="text-sm text-text-light">{provider.email}</p>
                      <p className="text-sm text-text-light">
                        {provider.phoneNumber}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center text-sm text-text-light">
                          <FaStar className="text-yellow-400 mr-1" />
                          {provider.averageRating?.toFixed(1) || "New"}
                        </span>
                        <span className="text-sm text-text-light">
                          {provider.totalReviews || 0} reviews
                        </span>
                        <span className="text-sm text-text-light">
                          {provider.completedJobs || 0} jobs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    {getVerificationBadge(provider.verificationStatus)}
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/verification`}
                        className="btn-outline text-sm py-1 px-3"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ Pagination - Server-side */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalProviders}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage);
                  setCurrentPage(1);
                }}
                itemsPerPageOptions={[5, 10, 20, 50, 100]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProviders;