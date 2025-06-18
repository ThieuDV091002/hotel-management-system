import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

interface ScheduleResponse {
  id: number;
  employeeId: number;
  fullName: string;
  position: string;
  date: string;
  shift: string;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error';
  size: 'sm';
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Input: React.FC<{
  type: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  placeholder?: string;
}> = ({ type, value, onChange, name, placeholder }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      name={name}
      placeholder={placeholder}
      className="w-1/4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
    />
  );
};

const Button: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-sm font-medium"
    >
      {children}
    </button>
  );
};

const Badge: React.FC<BadgeProps> = ({ children, color, size }) => {
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
      className={`inline-flex items-center rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]}`}
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

const MyScheduleTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>('');
  const [schedules, setSchedules] = useState<ScheduleResponse[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage: number = 7;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const handleReset = () => {
    setStartDate('');
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchMySchedules = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access your schedules.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(startDate && { startDate }),
        });

        const response = await fetch(`http://localhost:8080/api/schedule/my-schedule?${params}`, {
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
  }, [currentPage, startDate, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getShiftBadgeColor = (shift: string): "success" | "warning" | "error" => {
    switch (shift.toLowerCase()) {
        case "morning":
        return "success";
        case "afternoon":
        return "warning";
        case "night":
        return "error";
        default:
        return "warning";
    }
  };

  const capitalizeFirstLetter = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);


  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta title="My Schedule Dashboard" description="View your work schedules" />
      <PageBreadcrumb pageTitle="My Schedules" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <Input
          type="date"
          placeholder="Search by start date..."
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Button onClick={handleReset}>Reset</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Employee</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Date</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{schedule.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">
                    {schedule.fullName} (ID: {schedule.employeeId})
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {new Date(schedule.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <Badge color={getShiftBadgeColor(schedule.shift)} size="sm">
                      {capitalizeFirstLetter(schedule.shift)}
                    </Badge>
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

export default MyScheduleTable;