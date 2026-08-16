import React from 'react'
import { FaChevronLeft, FaChevronRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa'

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
  siblingCount = 1,
  className = '',
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pageNumbers = []
    const totalPageNumbers = siblingCount * 2 + 5 // 2 siblings + current + first + last + dots

    if (totalPages <= totalPageNumbers) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Calculate left and right sibling indices
      const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
      const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

      const showLeftDots = leftSiblingIndex > 2
      const showRightDots = rightSiblingIndex < totalPages - 1

      if (!showLeftDots && showRightDots) {
        // Show left numbers, then dots, then right
        const leftItems = 3 + 2 * siblingCount
        for (let i = 1; i <= leftItems; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      } else if (showLeftDots && !showRightDots) {
        // Show first, dots, then right numbers
        pageNumbers.push(1)
        pageNumbers.push('...')
        const rightItems = 3 + 2 * siblingCount
        for (let i = totalPages - rightItems + 1; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else if (showLeftDots && showRightDots) {
        // Show first, dots, middle, dots, last
        pageNumbers.push(1)
        pageNumbers.push('...')
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push('...')
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  const handlePageChange = (page) => {
    if (page === currentPage) return
    if (page < 1 || page > totalPages) return
    onPageChange(page)
  }

  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value, 10)
    onItemsPerPageChange(newValue)
    onPageChange(1) // Reset to first page when changing items per page
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center space-x-2 text-sm text-text-light">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="px-2 py-1 rounded-md border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white text-text"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span>entries</span>
          {totalItems > 0 && (
            <span className="ml-2 text-xs text-text-lighter">
              ({((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems})
            </span>
          )}
        </div>
      )}

      {/* Pagination buttons */}
      <div className="flex items-center space-x-1">
        {/* First Page */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 text-text-light"
        >
          <FaAngleDoubleLeft className="text-xs" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 text-text-light"
        >
          <FaChevronLeft className="text-xs" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="px-2 py-1.5 text-sm text-text-light">
                  …
                </span>
              )
            }

            const isActive = page === currentPage
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-light hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 text-text-light"
        >
          <FaChevronRight className="text-xs" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 text-text-light"
        >
          <FaAngleDoubleRight className="text-xs" />
        </button>
      </div>
    </div>
  )
}

export default Pagination