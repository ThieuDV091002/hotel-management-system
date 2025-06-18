import React, { useState, useEffect, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface HousekeepingRequestDTO {
  id: number;
  roomId: number;
  roomName: string;
  customerId: number;
  customerName: string;
  status: HousekeepingStatus;
  notes: string;
  preferredTime: string;
  createdAt: string;
}

interface HousekeepingRequestPage {
  content: HousekeepingRequestDTO[];
  number: number;
  totalPages: number;
}

enum HousekeepingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error' | 'info';
  size: 'sm';
  onClick?: () => void;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Input: FC<{
  type: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}> = ({ type, value, onChange, placeholder, className }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${className || ''}`}
    />
  );
};

const Button: FC<{
  size?: 'sm';
  variant?: 'outline' | 'filled';
  onClick: () => void;
  children: React.ReactNode;
}> = ({ size = 'sm', variant = 'filled', onClick, children }) => {
  const baseStyles = 'px-4 py-2 rounded-md text-sm font-medium';
  const sizeStyles = size === 'sm' ? 'text-sm' : '';
  const variantStyles =
    variant === 'outline'
      ? 'text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
      : 'bg-blue-500 text-white hover:bg-blue-600';
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles}`}
    >
      {children}
    </button>
  );
};

const Badge: FC<BadgeProps> = ({ children, color, size, onClick }) => {
  const colorStyles: Record<string, string> = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };
  const sizeStyles: Record<string, string> = {
    sm: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium cursor-pointer ${colorStyles[color]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

const StatusDropdown: FC<{
  requestId: number;
  currentStatus: HousekeepingStatus;
  onChangeStatus: (id: number, status: HousekeepingStatus) => void;
}> = ({ requestId, currentStatus, onChangeStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const statusOptions: HousekeepingStatus[] = [
    HousekeepingStatus.PENDING,
    HousekeepingStatus.IN_PROGRESS,
    HousekeepingStatus.COMPLETED,
    HousekeepingStatus.CANCELLED
  ];

  const handleSelectStatus = (status: HousekeepingStatus) => {
    onChangeStatus(requestId, status);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <Badge
        size="sm"
        color={
          currentStatus === HousekeepingStatus.PENDING ? 'warning' :
          currentStatus === HousekeepingStatus.IN_PROGRESS ? 'info' :
          currentStatus === HousekeepingStatus.COMPLETED ? 'success' :
          'error'
        }
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentStatus}
      </Badge>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleSelectStatus(status)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                currentStatus === status
                  ? 'bg-gray-200 dark:bg-gray-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ActionDropdown: FC<{
  requestId: number;
  onView: (id: number) => void;
}> = ({ requestId, onView }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
      >
        ...
      </Button>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => {
              onView(requestId);
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
};

const Pagination: FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const maxPagesToShow = 5;
  const pages: (number | string)[] = [];

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
  }

  return (
    <div className="flex flex-col items-center px-6 py-4">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Showing {(currentPage - 1) * 5 + 1} to {Math.min(currentPage * 5)} of entries
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
            disabled={typeof page !== 'number'}
            className={`px-3 py-1 rounded-md ${
              currentPage === page
                ? 'bg-blue-500 text-white'
                : typeof page === 'number'
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                : 'text-gray-500 dark:text-gray-400 cursor-default'
            }`}
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

const HousekeepingRequestTable: FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [requests, setRequests] = useState<HousekeepingRequestDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');
  const itemsPerPage = 5;

  const debouncedCustomerName = useDebounce(customerName, 500);
  const debouncedRoomName = useDebounce(roomName, 500);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to view housekeeping requests.');
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(debouncedCustomerName && { customerName: debouncedCustomerName }),
          ...(debouncedRoomName && { roomName: debouncedRoomName }),
        });

        const response = await fetch(`http://localhost:8080/api/admin/housekeeping-requests?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: HousekeepingRequestPage = await response.json();
          setRequests(data.content);
          setTotalPages(data.totalPages);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch requests:', response.status, response.statusText, errorText);
          setError(`Failed to fetch requests: ${errorText || response.statusText}`);
          if (response.status === 401) {
            toast.error('Session expired. Please log in again.');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError('An error occurred while fetching requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [accessToken, navigate, currentPage, debouncedCustomerName, debouncedRoomName]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleChangeStatus = async (id: number, status: HousekeepingStatus) => {
    if (!accessToken) {
      toast.error('Please log in to update request status.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/admin/housekeeping-requests/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      });

      if (response.ok) {
        const updatedRequest: HousekeepingRequestDTO = await response.json();
        setRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === id ? updatedRequest : request
          )
        );
        toast.success('Request status updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update status:', response.status, response.statusText, errorText);
        toast.error(`Failed to update status: ${errorText || response.statusText}`);
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('An error occurred while updating the status.');
    }
  };

  const handleViewRequest = (id: number) => {
    navigate(`/hp-request/${id}`);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta
        title="Housekeeping Requests Dashboard"
        description="Manage housekeeping requests"
      />
      <PageBreadcrumb pageTitle="Housekeeping Requests" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search by customer name..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <Input
          type="text"
          placeholder="Search by room name..."
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Request ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Customer</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Preferred Time</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Created At</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <span className="block font-medium text-gray-800 text-sm dark:text-white/90">{request.id}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{request.roomName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{request.customerName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {new Date(request.preferredTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {new Date(request.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <StatusDropdown
                      requestId={request.id}
                      currentStatus={request.status}
                      onChangeStatus={handleChangeStatus}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionDropdown
                      requestId={request.id}
                      onView={handleViewRequest}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default HousekeepingRequestTable;