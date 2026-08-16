import React, { useState } from 'react'
import { useGetUsersQuery, useToggleUserStatusMutation } from '../../redux/services/adminApi'
import { toast } from 'react-hot-toast'
import { FaSearch, FaUser, FaBan, FaUserCheck } from 'react-icons/fa'
import Pagination from '../../components/utils/Pagination'

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [toggleStatus] = useToggleUserStatusMutation()

  // ✅ Server-side pagination - send page and limit to API
  const { data, isLoading, refetch } = useGetUsersQuery({
    search: searchTerm,
    role: roleFilter,
    status: statusFilter,
    page: currentPage,
    limit: itemsPerPage,
  })

  // Extract data from response
  const users = data?.users || []
  const totalUsers = data?.total || 0
  const totalPages = data?.totalPages || 0

  // Reset to page 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value)
    setCurrentPage(1) // ✅ Reset to first page when filter changes
  }

  const handleToggleStatus = async (userId) => {
    try {
      await toggleStatus(userId).unwrap()
      toast.success('User status updated')
      refetch() // ✅ Refetch to update the list
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update user status')
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700'
      case 'provider': return 'bg-blue-100 text-blue-700'
      case 'errand_runner': return 'bg-indigo-100 text-indigo-700'
      case 'customer': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'provider': return 'Service Provider'
      case 'errand_runner': return 'Errand Runner'
      default: return role
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-text">Users</h1>
        <span className="text-sm text-text-light">
          Total: {totalUsers} users
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleFilterChange(setSearchTerm, e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => handleFilterChange(setRoleFilter, e.target.value)}
          className="input-field w-full md:w-40"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="errand_runner">Errand Runner</option>
          <option value="provider">Service Provider</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
          className="input-field w-full md:w-40"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="skeleton h-16 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <FaUser className="text-4xl text-text-lighter mx-auto mb-4" />
          <p className="text-text-light">No users found</p>
          {(searchTerm || roleFilter || statusFilter) && (
            <p className="text-sm text-text-lighter mt-2">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-text-light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="font-medium text-text">{user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-light">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-light text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          user.isActive
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive ? (
                          <span className="flex items-center space-x-1">
                            <FaBan />
                            <span>Suspend</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1">
                            <FaUserCheck />
                            <span>Activate</span>
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Pagination - Still needed for server-side pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalUsers}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage)
                  setCurrentPage(1) // ✅ Reset to first page when changing items per page
                }}
                itemsPerPageOptions={[5, 10, 20, 50, 100]}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminUsers