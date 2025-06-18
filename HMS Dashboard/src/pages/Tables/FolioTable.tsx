import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

enum FolioStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  PENDING = 'PENDING',
}

interface FolioDTO {
  id: number;
  bookingId: number;
  customerName: string;
  userId: number;
  totalAmount: number;
  status: FolioStatus;
  createdAt: string;
  updatedAt: string;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error';
  size: 'sm';
  onClick?: () => void;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Badge: React.FC<BadgeProps> = ({ children, color, size, onClick }) => {
  const colorStyles: Record<string, string> = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };
  const sizeStyles: Record<string, string> = {
    sm: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalElements, itemsPerPage, onPageChange }) => {
  const maxPagesToShow = 5;
  const pages: (number | string)[] = [];

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = end - maxPagesToShow + 1;
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
  }

  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalElements);

  return (
    <div className="flex flex-col items-center px-6 py-4">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Showing {startEntry} to {endEntry} of {totalElements} entries
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
        >
          Previous
        </button>
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-3 py-1 rounded-md ${
              page === currentPage
                ? 'bg-blue-500 text-white'
                : typeof page === 'number'
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                : 'text-gray-500 dark:text-gray-400 cursor-default'
            }`}
            disabled={typeof page !== 'number'}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const ActionMenu: React.FC<{ folioId: number }> = ({ folioId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/folio/${folioId}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        ...
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => handleAction('View')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
};

const StatusDropdown: React.FC<{ folioId: number; currentStatus: FolioStatus; onStatusChange: (folioId: number, status: string) => void }> = ({ folioId, currentStatus, onStatusChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getBadgeColor = (status: FolioStatus): 'success' | 'warning' | 'error' => {
    switch (status) {
      case FolioStatus.PAID:
        return 'success';
      case FolioStatus.UNPAID:
        return 'error';
      case FolioStatus.PENDING:
        return 'warning';
      default:
        return 'warning';
    }
  };

  const handleStatusSelect = (status: string) => {
    onStatusChange(folioId, status);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <Badge
        color={getBadgeColor(currentStatus)}
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {currentStatus}
      </Badge>
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {Object.values(FolioStatus).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FolioTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchCustomerName, setSearchCustomerName] = useState<string>('');
  const [folios, setFolios] = useState<FolioDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFolios = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access folios.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(searchCustomerName && { search: searchCustomerName }),
        });

        const response = await fetch(`http://localhost:8080/api/folios?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFolios(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch folios:', response.status, response.statusText, errorText);
          setError(`Failed to fetch folios: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching folios:', error);
        setError('An error occurred while fetching folios.');
      } finally {
        setLoading(false);
      }
    };

    fetchFolios();
  }, [currentPage, searchCustomerName, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatusChange = async (folioId: number, status: string) => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to update folio status.');
      navigate('/login');
      return;
    }

    if (!Object.values(FolioStatus).includes(status as FolioStatus)) {
      toast.error('Invalid status selected.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/folios/${folioId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      });

      if (response.ok) {
        const updatedFolio: FolioDTO = await response.json();
        setFolios(folios.map((folio) => (folio.id === folioId ? updatedFolio : folio)));
        toast.success('Folio status updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update folio status:', response.status, response.statusText, errorText);
        toast.error(`Failed to update folio status: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating folio status:', error);
      toast.error('An error occurred while updating the folio status.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta title="Folio Tables Dashboard" description="Manage folio data with view and update status functionality" />
      <PageBreadcrumb pageTitle="Folio Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by customer name..."
          value={searchCustomerName}
          onChange={(e) => setSearchCustomerName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Booking ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Customer Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">User ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Total Amount</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Created At</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Updated At</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {folios.map((folio) => (
                <tr key={folio.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{folio.id}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{folio.bookingId}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{folio.customerName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{folio.userId}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{folio.totalAmount.toFixed(2)} VND</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <StatusDropdown
                      folioId={folio.id}
                      currentStatus={folio.status}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {new Date(folio.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{new Date(folio.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu folioId={folio.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default FolioTable;