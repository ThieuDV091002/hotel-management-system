import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { toast } from 'react-toastify';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

interface MaintenanceScheduleDTO {
  id: number;
  assetId: number;
  assetName: string;
  roomId: number;
  roomName: string;
  status: 'ASSIGNED' | 'COMPLETED';
  scheduleDate: string;
  description: string;
  employees: EmployeeDTO[];
}

interface EmployeeDTO {
  id: number;
  fullName: string;
}

interface MaintenanceScheduleCreateDTO {
  assetId?: number;
  roomId?: number;
  scheduledDate: string;
  description: string;
  employeeIds: number[];
}

interface ScheduleResponse {
  id: number;
  employeeId: number;
  fullName: string;
  position: string;
  date: string;
  shift: string;
}

interface AssetDTO {
  id: number;
  name: string;
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

const Button: React.FC<{
  size?: 'sm';
  variant?: 'outline' | 'filled';
  onClick: () => void;
  children: React.ReactNode;
}> = ({ size = 'sm', variant = 'filled', onClick, children }) => {
  const baseStyles = 'px-4 py-2 rounded-md text-sm font-medium';
  const sizeStyles = size === 'sm' ? 'text-sm' : '';
  const variantStyles =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800'
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

const Input: React.FC<{
  type: string;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  name?: string;
}> = ({ type, value, onChange, name }) => {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={onChange}
      name={name}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
    />
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
      {children}
    </label>
  );
};

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

const ActionMenu: React.FC<{ scheduleId: number; onDelete: (scheduleId: number) => void }> = ({ scheduleId, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/maintenance-schedule/${scheduleId}`);
    } else if (action === 'Delete') {
      onDelete(scheduleId);
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
          <button
            onClick={() => handleAction('Delete')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}
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

const MaintenanceScheduleTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [assetId, setAssetId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const { isOpen, openModal, closeModal } = useModal();
  const [schedules, setSchedules] = useState<MaintenanceScheduleDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetDTO[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<ScheduleResponse[]>([]);
  const [newSchedule, setNewSchedule] = useState<MaintenanceScheduleCreateDTO>({
    assetId: undefined,
    roomId: undefined,
    scheduledDate: '',
    description: '',
    employeeIds: [],
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const itemsPerPage: number = 10;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access maintenance schedules.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(assetId && { assetId }),
          ...(roomId && { roomId }),
        });

        const response = await fetch(`http://localhost:8080/api/maintenance-schedules?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSchedules(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch schedules:', response.status, response.statusText, errorText);
          setError(`Failed to fetch schedules: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setError('An error occurred while fetching schedules.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [currentPage, assetId, roomId, accessToken, navigate]);

  useEffect(() => {
    const fetchAssets = async () => {
      if (!accessToken || !isOpen) return;

      try {
        const response = await fetch(`http://localhost:8080/api/assets?size=1000`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAssets(data.content);
        } else {
          const errorText = await response.text();
          toast.error(`Failed to fetch assets: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        toast.error('An error occurred while fetching assets.');
      }
    };

    fetchAssets();
  }, [isOpen, accessToken]);

  const fetchAvailableEmployees = async (scheduledDate: string) => {
    if (!accessToken || !scheduledDate) return;

    try {
      const response = await fetch(`http://localhost:8080/api/schedule/maintenance?time=${scheduledDate}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const employees: ScheduleResponse[] = await response.json();
        setAvailableEmployees(employees);
      } else {
        const errorText = await response.text();
        toast.error(`Failed to fetch available employees: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching available employees:', error);
      toast.error('An error occurred while fetching available employees.');
    }
  };

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddSchedule = () => {
    setNewSchedule({
      assetId: undefined,
      roomId: undefined,
      scheduledDate: '',
      description: '',
      employeeIds: [],
    });
    setAvailableEmployees([]);
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSchedule({
      ...newSchedule,
      [name]: name === 'assetId' || name === 'roomId' ? (value ? parseInt(value) : undefined) : value,
    });

    if (name === 'scheduledDate') {
      fetchAvailableEmployees(value);
    }
  };

  const handleEmployeeToggle = (employeeId: number) => {
    setNewSchedule({
      ...newSchedule,
      employeeIds: newSchedule.employeeIds.includes(employeeId)
        ? newSchedule.employeeIds.filter((id) => id !== employeeId)
        : [...newSchedule.employeeIds, employeeId],
    });
  };

  const handleSave = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to add a schedule.');
      navigate('/login');
      return;
    }

    if (!newSchedule.assetId && !newSchedule.roomId) {
      toast.error('At least one of Asset or Room ID is required.');
      return;
    }

    if (!newSchedule.scheduledDate || isNaN(new Date(newSchedule.scheduledDate).getTime())) {
      toast.error('Valid scheduled date is required.');
      return;
    }

    if (!newSchedule.description.trim()) {
      toast.error('Description is required.');
      return;
    }

    if (newSchedule.employeeIds.length === 0) {
      toast.error('At least one employee must be selected.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:8080/api/maintenance-schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchedule),
      });

      if (response.ok) {
        const createdSchedule: MaintenanceScheduleDTO = await response.json();
        setSchedules([...schedules, createdSchedule]);
        setNewSchedule({
          assetId: undefined,
          roomId: undefined,
          scheduledDate: '',
          description: '',
          employeeIds: [],
        });
        closeModal();
        toast.success('Schedule created successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to create schedule:', response.status, response.statusText, errorText);
        toast.error(`Failed to create schedule: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('An error occurred while creating the schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to delete schedule.');
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/maintenance-schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSchedules(schedules.filter((schedule) => schedule.id !== scheduleId));
        toast.success('Schedule deleted successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to delete schedule:', response.status, response.statusText, errorText);
        toast.error(`Failed to delete schedule: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('An error occurred while deleting the schedule.');
    }
  };

  const handleStatusChange = async (scheduleId: number, status: 'ASSIGNED' | 'COMPLETED') => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to update schedule status.');
      navigate('/login');
      return;
    }

    // Log payload để debug
    console.log('Sending status update:', status);

    try {
      const response = await fetch(`http://localhost:8080/api/maintenance-schedules/${scheduleId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'text/plain', // Gửi raw string với text/plain
        },
        body: status, // Gửi trực tiếp "ASSIGNED" hoặc "COMPLETED"
      });

      if (response.ok) {
        // Lấy lại chi tiết lịch bảo trì để cập nhật trạng thái
        const scheduleResponse = await fetch(`http://localhost:8080/api/maintenance-schedules/${scheduleId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (scheduleResponse.ok) {
          const updatedSchedule: MaintenanceScheduleDTO = await scheduleResponse.json();
          setSchedules(schedules.map((schedule) => (schedule.id === scheduleId ? updatedSchedule : schedule)));
          toast.success('Schedule status updated successfully.');
        } else {
          const errorText = await scheduleResponse.text();
          console.error('Failed to fetch updated schedule:', scheduleResponse.status, scheduleResponse.statusText, errorText);
          toast.error(`Failed to fetch updated schedule: ${errorText || scheduleResponse.statusText}`);
        }
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
      <PageMeta title="Maintenance Schedule Dashboard" description="Manage maintenance schedules with add, view, delete, and update functionality" />
      <PageBreadcrumb pageTitle="Maintenance Schedule" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by asset ID..."
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="text"
          placeholder="Search by room ID..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <Button onClick={handleAddSchedule}>Add Schedule</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Asset</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Scheduled Date</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Description</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Employees</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{schedule.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">
                    {schedule.assetName} (ID: {schedule.assetId})
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {schedule.roomName} (ID: {schedule.roomId})
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {new Date(schedule.scheduleDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{schedule.description}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <StatusDropdown
                      scheduleId={schedule.id}
                      currentStatus={schedule.status}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {schedule.employees.map((emp) => emp.fullName).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu scheduleId={schedule.id} onDelete={handleDelete} />
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add New Maintenance Schedule
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to schedule a new maintenance task.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Asset</Label>
                  <select
                    name="assetId"
                    value={newSchedule.assetId ?? ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Asset (Optional)</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Room ID</Label>
                  <Input
                    type="number"
                    name="roomId"
                    value={newSchedule.roomId ?? ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="datetime-local"
                    name="scheduledDate"
                    value={newSchedule.scheduledDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    name="description"
                    value={newSchedule.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>Available Employees</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {availableEmployees.length > 0 ? (
                      availableEmployees.map((employee) => (
                        <label key={employee.employeeId} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newSchedule.employeeIds.includes(employee.employeeId)}
                            onChange={() => handleEmployeeToggle(employee.employeeId)}
                            className="mr-2"
                          />
                          {employee.fullName}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {newSchedule.scheduledDate
                          ? 'No employees available at this time.'
                          : 'Select a scheduled date to see available employees.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                {isSaving ? 'Saving...' : 'Save Schedule'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MaintenanceScheduleTable;