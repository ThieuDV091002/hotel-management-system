import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

interface HousekeepingScheduleDTO {
  id: number;
  roomId: number;
  roomName: string;
  employeeId: number;
  employeeName: string;
  status: 'ASSIGNED' | 'COMPLETED';
  scheduleTime: string;
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

const StatusDropdown: React.FC<{
  scheduleId: number;
  currentStatus: 'ASSIGNED' | 'COMPLETED';
  onStatusChange: (scheduleId: number, status: 'ASSIGNED' | 'COMPLETED') => void;
}> = ({ scheduleId, currentStatus, onStatusChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getBadgeColor = (status: 'ASSIGNED' | 'COMPLETED'): 'success' | 'warning' | 'error' => {
    switch (status) {
      case 'ASSIGNED':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      default:
        return 'warning';
    }
  };

  const handleStatusSelect = (status: 'ASSIGNED' | 'COMPLETED') => {
    onStatusChange(scheduleId, status);
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
          {['ASSIGNED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status as 'ASSIGNED' | 'COMPLETED')}
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

const ActionMenu: React.FC<{ scheduleId: number }> = ({ scheduleId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = () => {
    setIsDropdownOpen(false);
    navigate(`/housekeeping-schedule/${scheduleId}`);
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
            onClick={handleAction}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
};

const MyHousekeepingScheduleTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [schedules, setSchedules] = useState<HousekeepingScheduleDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage: number = 10;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMySchedules = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access your housekeeping schedules.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
        });

        const response = await fetch(`http://localhost:8080/api/housekeeping/my-schedules?${params}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSchedules(data.content || []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch schedules:', response.status, response.statusText, errorText);
          setError(`Failed to fetch schedules: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setError('An error occurred while fetching your schedules.');
      } finally {
        setLoading(false);
      }
    };

    fetchMySchedules();
  }, [currentPage, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleStatusChange = async (scheduleId: number, status: 'ASSIGNED' | 'COMPLETED') => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to update schedule status.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/housekeeping/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      });

      if (response.ok) {
        const updatedSchedule: HousekeepingScheduleDTO = await response.json();
        setSchedules(schedules.map((schedule) => (schedule.id === scheduleId ? updatedSchedule : schedule)));
        toast.success('Schedule status updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update schedule status:', response.status, response.statusText, errorText);
        toast.error(`Failed to update schedule status: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating schedule status:', error);
      toast.error('An error occurred while updating the schedule status.');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta title="My Housekeeping Schedule Dashboard" description="View and manage your housekeeping schedules" />
      <PageBreadcrumb pageTitle="My Housekeeping Schedules" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Employee</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Schedule Time</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{schedule.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">
                    {schedule.roomName} (ID: {schedule.roomId})
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {schedule.employeeName} (ID: {schedule.employeeId})
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {new Date(schedule.scheduleTime).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <StatusDropdown
                      scheduleId={schedule.id}
                      currentStatus={schedule.status}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu scheduleId={schedule.id} />
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

export default MyHousekeepingScheduleTable;