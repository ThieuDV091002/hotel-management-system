import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { format, addDays, startOfWeek } from 'date-fns';
import { isWithinInterval } from 'date-fns/isWithinInterval';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

interface EmployeeSchedule {
  employeeId: number;
  fullName: string;
  position: string;
  workSchedules: ScheduleResponse[];
}

interface ScheduleResponse {
  id: number;
  employeeId: number;
  fullName: string;
  position: string;
  date: string;
  shift: string;
}

interface ScheduleRequest {
  startDate?: string;
  employeeId?: number;
  scheduleDate?: string;
  shift?: string;
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
  totalElements: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const Input: React.FC<{
  type: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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

const Badge: React.FC<BadgeProps> = ({ children, color, size, onClick }) => {
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
            onClick={() => {
              setIsDropdownOpen(false);
              onDelete(scheduleId);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const shifts = ['morning', 'afternoon', 'night'];

const ShiftDropdown: React.FC<{
  scheduleId: number;
  currentShift: string;
  onShiftChange: (scheduleId: number, shift: string) => void;
}> = ({ scheduleId, currentShift, onShiftChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getBadgeColor = (shift: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (shift.toLowerCase()) {
      case 'morning':
        return 'success';
      case 'afternoon':
        return 'warning';
      case 'night':
        return 'error';
      default:
        return 'info';
    }
  };

  const handleShiftSelect = (shift: string) => {
    onShiftChange(scheduleId, shift);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <Badge
        color={getBadgeColor(currentShift)}
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {currentShift.charAt(0).toUpperCase() + currentShift.slice(1)}
      </Badge>
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {shifts.map((shift) => (
            <button
              key={shift}
              onClick={() => handleShiftSelect(shift)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {shift.charAt(0).toUpperCase() + shift.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const WorkScheduleTable: React.FC = () => {
  const defaultStartDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [fullName, setFullName] = useState<string>('');
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newScheduleDate, setNewScheduleDate] = useState<string>('');
  const [newSingleSchedule, setNewSingleSchedule] = useState<{
    employeeId: string;
    scheduleDate: string;
    shift: string;
  }>({ employeeId: '', scheduleDate: '', shift: '' });
  const { isOpen, openModal, closeModal } = useModal();
  const [isSingleScheduleModalOpen, setIsSingleScheduleModalOpen] = useState<boolean>(false);
  const itemsPerPage = 10;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    if (!startDate) {
      setStartDate(defaultStartDate);
      return;
    }

    const fetchSchedules = async () => {
      if (!accessToken) {
        toast.error('Please log in to access schedules.');
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          startDate,
          ...(fullName && { fullName }),
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
        });

        const response = await fetch(`http://localhost:8080/api/schedule/list?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.content && data.content.length > 0) {
            setSchedules(data.content[0].employees || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
          } else {
            setSchedules([]);
            setTotalPages(1);
            setTotalElements(0);
          }
        } else {
          const errorText = await response.text();
          setError(`Failed to fetch schedules: ${errorText || response.statusText}`);
        }
      } catch (error) {
        setError('An error occurred while fetching schedules.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [currentPage, startDate, fullName, accessToken, navigate, defaultStartDate]);

  const handleShiftChange = async (scheduleId: number, shift: string) => {
    if (!accessToken) {
      toast.error('Please log in to update shift.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/schedule/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shift }),
      });

      if (response.ok) {
        const updatedSchedule: ScheduleResponse = await response.json();
        setSchedules((prevSchedules) =>
          prevSchedules.map((employee) => ({
            ...employee,
            workSchedules: employee.workSchedules.map((s) =>
              s.id === scheduleId ? { ...s, shift: updatedSchedule.shift } : s
            ),
          }))
        );
        toast.success('Shift updated successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to update shift: ${errorText || response.statusText}`);
      }
    } catch (error) {
      toast.error('An error occurred while updating the shift.');
    }
  };

  const handleDelete = async (scheduleId: number) => {
    if (!accessToken) {
      toast.error('Please log in to delete schedule.');
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/schedule/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSchedules((prevSchedules) =>
          prevSchedules.map((employee) => ({
            ...employee,
            workSchedules: employee.workSchedules.filter((s) => s.id !== scheduleId),
          }))
        );
        toast.success('Schedule deleted successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to delete schedule: ${errorText || response.statusText}`);
      }
    } catch (error) {
      toast.error('An error occurred while deleting the schedule.');
    }
  };

  const handleGenerateSchedule = () => {
    setNewScheduleDate('');
    openModal();
  };

  const handleSaveSchedule = async () => {
    if (!accessToken) {
      toast.error('Please log in to generate schedule.');
      navigate('/login');
      return;
    }

    if (!newScheduleDate) {
      toast.error('Start date is required.');
      return;
    }

    if (isNaN(new Date(newScheduleDate).getTime())) {
      toast.error('Invalid start date.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ startDate: newScheduleDate } as ScheduleRequest),
      });

      if (response.ok) {
        const newSchedules: ScheduleResponse[] = await response.json();
        const weekStart = new Date(startDate);
        const weekEnd = addDays(weekStart, 6);

        const relevantSchedules = newSchedules.filter((s) =>
          isWithinInterval(new Date(s.date), { start: weekStart, end: weekEnd })
        );

        if (relevantSchedules.length > 0) {
          setSchedules((prevSchedules) => {
            const updatedSchedules = [...prevSchedules];
            relevantSchedules.forEach((newSchedule) => {
              const employeeIndex = updatedSchedules.findIndex(
                (e) => e.employeeId === newSchedule.employeeId
              );
              if (employeeIndex >= 0) {
                updatedSchedules[employeeIndex] = {
                  ...updatedSchedules[employeeIndex],
                  workSchedules: [
                    ...updatedSchedules[employeeIndex].workSchedules,
                    newSchedule,
                  ],
                };
              } else {
                updatedSchedules.push({
                  employeeId: newSchedule.employeeId,
                  fullName: newSchedule.fullName,
                  position: newSchedule.position,
                  workSchedules: [newSchedule],
                });
              }
            });
            return updatedSchedules;
          });
        }

        setNewScheduleDate('');
        closeModal();
        toast.success('Schedule generated successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to generate schedule: ${errorText || response.statusText}`);
      }
    } catch (error) {
      toast.error('An error occurred while generating the schedule.');
    }
  };

  const handleAddSingleSchedule = () => {
    setNewSingleSchedule({ employeeId: '', scheduleDate: '', shift: '' });
    setIsSingleScheduleModalOpen(true);
  };

  const handleSingleScheduleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSingleSchedule((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSingleSchedule = async () => {
    if (!accessToken) {
      toast.error('Please log in to add schedule.');
      navigate('/login');
      return;
    }

    const employeeId = parseInt(newSingleSchedule.employeeId, 10);
    if (!newSingleSchedule.employeeId || isNaN(employeeId) || employeeId <= 0) {
      toast.error('Valid employee ID is required.');
      return;
    }

    if (!newSingleSchedule.scheduleDate) {
      toast.error('Schedule date is required.');
      return;
    }

    if (isNaN(new Date(newSingleSchedule.scheduleDate).getTime())) {
      toast.error('Invalid schedule date.');
      return;
    }

    if (!newSingleSchedule.shift || !shifts.includes(newSingleSchedule.shift.toLowerCase())) {
      toast.error('Valid shift is required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/schedule/single', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          scheduleDate: newSingleSchedule.scheduleDate,
          shift: newSingleSchedule.shift,
        } as ScheduleRequest),
      });

      if (response.ok) {
        const newSchedule: ScheduleResponse = await response.json();
        const weekStart = new Date(startDate);
        const weekEnd = addDays(weekStart, 6);

        if (isWithinInterval(new Date(newSchedule.date), { start: weekStart, end: weekEnd })) {
          setSchedules((prevSchedules) => {
            const updatedSchedules = [...prevSchedules];
            const employeeIndex = updatedSchedules.findIndex(
              (e) => e.employeeId === newSchedule.employeeId
            );
            if (employeeIndex >= 0) {
              updatedSchedules[employeeIndex] = {
                ...updatedSchedules[employeeIndex],
                workSchedules: [
                  ...updatedSchedules[employeeIndex].workSchedules,
                  newSchedule,
                ],
              };
            } else {
              updatedSchedules.push({
                employeeId: newSchedule.employeeId,
                fullName: newSchedule.fullName,
                position: newSchedule.position,
                workSchedules: [newSchedule],
              });
            }
            return updatedSchedules;
          });
        }

        setNewSingleSchedule({ employeeId: '', scheduleDate: '', shift: '' });
        setIsSingleScheduleModalOpen(false);
        toast.success('Single schedule added successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to add single schedule: ${errorText || response.statusText}`);
      }
    } catch (error) {
      toast.error('An error occurred while adding the single schedule.');
    }
  };

  const handleReset = () => {
    setStartDate(defaultStartDate);
    setFullName('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  let days: string[] = [];
  try {
    days = Array.from({ length: 7 }, (_, i) => format(addDays(new Date(startDate), i), 'EEE, MMM d'));
  } catch (e) {
    setError('Invalid start date format.');
  }

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta title="Work Schedule Dashboard" description="View and manage employee work schedules" />
      <PageBreadcrumb pageTitle="Work Schedules" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <div className="w-1/4 sm:w-1/4">
            <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Select start date"
            />
        </div>
        <div className="w-1/4 sm:w-1/4">
            <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Search by full name..."
            />
        </div>
        <Button size="sm" variant="outline" onClick={handleReset}>
          Reset
        </Button>
        <Button size="sm" onClick={handleGenerateSchedule}>
          Generate Schedule
        </Button>
        <Button size="sm" onClick={handleAddSingleSchedule}>
          Add Single Schedule
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Employee</th>
                {days.map((day, index) => (
                  <th key={index} className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {schedules.length > 0 ? (
                schedules.map((employee) => (
                  <tr key={employee.employeeId}>
                    <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">
                      {employee.fullName}
                    </td>
                    {days.map((_, index) => {
                      const date = format(addDays(new Date(startDate), index), 'yyyy-MM-dd');
                      const schedule = employee.workSchedules.find((s) => s.date === date);
                      return (
                        <td key={index} className="px-4 py-3 text-sm dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            {schedule ? (
                              <>
                                <ShiftDropdown
                                  scheduleId={schedule.id}
                                  currentShift={schedule.shift}
                                  onShiftChange={handleShiftChange}
                                />
                                <ActionMenu scheduleId={schedule.id} onDelete={handleDelete} />
                              </>
                            ) : (
                              <Badge color="info" size="sm">
                                No Schedule
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={days.length + 1} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    No schedules found for the selected date or name.
                  </td>
                </tr>
              )}
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
      {/* Generate Schedule Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Generate New Schedule
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter the start date to generate a new schedule.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-y-5">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    name="startDate"
                    value={newScheduleDate}
                    onChange={(e) => setNewScheduleDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSaveSchedule}>
                Save Schedule
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      {/* Add Single Schedule Modal */}
      <Modal isOpen={isSingleScheduleModalOpen} onClose={() => setIsSingleScheduleModalOpen(false)} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Single Schedule
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a single schedule.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Employee ID</Label>
                  <Input
                    type="text"
                    name="employeeId"
                    value={newSingleSchedule.employeeId}
                    onChange={handleSingleScheduleInputChange}
                    placeholder="Enter employee ID"
                  />
                </div>
                <div>
                  <Label>Schedule Date</Label>
                  <Input
                    type="date"
                    name="scheduleDate"
                    value={newSingleSchedule.scheduleDate}
                    onChange={handleSingleScheduleInputChange}
                  />
                </div>
                <div>
                  <Label>Shift</Label>
                  <select
                    name="shift"
                    value={newSingleSchedule.shift}
                    onChange={handleSingleScheduleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Shift</option>
                    {shifts.map((shift) => (
                      <option key={shift} value={shift}>
                        {shift.charAt(0).toUpperCase() + shift.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsSingleScheduleModalOpen(false)}>
                Close
              </Button>
              <Button size="sm" onClick={handleSaveSingleSchedule}>
                Save Schedule
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default WorkScheduleTable;