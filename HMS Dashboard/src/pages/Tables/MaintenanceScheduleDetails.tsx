import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { toast } from 'react-toastify';

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

interface MaintenanceScheduleUpdateDTO {
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
    <span className={`inline-flex items-center rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};

const MaintenanceScheduleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<MaintenanceScheduleDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableEmployees, setAvailableEmployees] = useState<ScheduleResponse[]>([]);
  const [assets, setAssets] = useState<AssetDTO[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState<boolean>(false);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access maintenance schedule details.');
        navigate('/login');
        return;
      }

      if (!id || isNaN(parseInt(id))) {
        setError('Invalid schedule ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/maintenance-schedules/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const schedule: MaintenanceScheduleDTO = await response.json();
          setFormData({
            ...schedule,
            assetId: schedule.assetId ?? 0,
            roomId: schedule.roomId ?? 0,
            scheduleDate: schedule.scheduleDate ?? '',
            description: schedule.description ?? '',
            employees: schedule.employees ?? [],
          });
        } else if (response.status === 404) {
          setError('Maintenance schedule not found');
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch schedule:', response.status, response.statusText, errorText);
          setError(`Failed to fetch schedule: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('An error occurred while fetching schedule data.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [id, accessToken, navigate]);

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

    const fetchInitialEmployees = async () => {
      if (!accessToken || !formData?.scheduleDate || isNaN(new Date(formData.scheduleDate).getTime())) return;

      setIsFetchingEmployees(true);
      try {
        const response = await fetch(`http://localhost:8080/api/schedule/maintenance?time=${formData.scheduleDate}`, {
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
          console.error('Failed to fetch available employees:', response.status, response.statusText, errorText);
          toast.error(`Failed to fetch available employees: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching available employees:', error);
        toast.error('An error occurred while fetching available employees.');
      } finally {
        setIsFetchingEmployees(false);
      }
    };

    if (isOpen) {
      fetchAssets();
      fetchInitialEmployees();
    }
  }, [isOpen, accessToken, formData?.scheduleDate]);

  const fetchAvailableEmployees = async (scheduledDate: string) => {
    if (!accessToken || !scheduledDate || isNaN(new Date(scheduledDate).getTime())) {
      setAvailableEmployees([]);
      return;
    }

    setIsFetchingEmployees(true);
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
        console.error('Failed to fetch available employees:', response.status, response.statusText, errorText);
        toast.error(`Failed to fetch available employees: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching available employees:', error);
      toast.error('An error occurred while fetching available employees.');
    } finally {
      setIsFetchingEmployees(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: name === 'assetId' || name === 'roomId' ? parseInt(value) || 0 : value,
      });

      if (name === 'scheduleDate') {
        fetchAvailableEmployees(value);
      }
    }
  };

  const handleEmployeeToggle = (employeeId: number) => {
    if (formData) {
      setFormData({
        ...formData,
        employees: formData.employees.some(emp => emp.id === employeeId)
          ? formData.employees.filter(emp => emp.id !== employeeId)
          : [...formData.employees, { id: employeeId, fullName: availableEmployees.find(emp => emp.employeeId === employeeId)?.fullName || '' }],
      });
    }
  };

  const handleSave = async () => {
    if (!formData) {
      toast.error('No data to save.');
      return;
    }

    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to update schedule.');
      navigate('/login');
      return;
    }

    if (formData.assetId === 0 && formData.roomId === 0) {
      toast.error('At least one of Asset or Room ID is required.');
      return;
    }

    if (!formData.scheduleDate || isNaN(new Date(formData.scheduleDate).getTime())) {
      toast.error('Valid scheduled date is required.');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required.');
      return;
    }

    if (formData.employees.length === 0) {
      toast.error('At least one employee must be selected.');
      return;
    }

    const payload: MaintenanceScheduleUpdateDTO = {
      scheduledDate: formData.scheduleDate,
      description: formData.description,
      employeeIds: formData.employees.map(emp => emp.id),
    };

    if (formData.assetId !== 0) {
      payload.assetId = formData.assetId;
    }

    if (formData.roomId !== 0) {
      payload.roomId = formData.roomId;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:8080/api/maintenance-schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedSchedule: MaintenanceScheduleDTO = await response.json();
        setFormData({
          ...updatedSchedule,
          assetId: updatedSchedule.assetId ?? 0,
          roomId: updatedSchedule.roomId ?? 0,
          scheduleDate: updatedSchedule.scheduleDate ?? '',
          description: updatedSchedule.description ?? '',
          employees: updatedSchedule.employees ?? [],
        });
        closeModal();
        toast.success('Maintenance schedule updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update schedule:', response.status, response.statusText, errorText);
        toast.error(`Failed to update schedule: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('An error occurred while updating the schedule.');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400 text-center">{error}</div>;
  }

  if (!formData) {
    return <div className="text-center text-gray-500 dark:text-gray-400">No schedule data found.</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Maintenance Schedule Details
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.id}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Asset
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.assetName} (ID: {formData.assetId})
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Room
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.roomName} (ID: {formData.roomId})
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Scheduled Date
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(formData.scheduleDate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.description}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Status
              </p>
              <Badge
                color={getBadgeColor(formData.status)}
                size="sm"
              >
                {formData.status}
              </Badge>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Employees
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.employees.map(emp => emp.fullName).join(', ')}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
        <Button onClick={() => navigate("/maintenance-schedule")}>Back</Button>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Maintenance Schedule
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update maintenance schedule details to keep the profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Asset</Label>
                  <select
                    name="assetId"
                    value={formData.assetId ?? 0}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="0">Select Asset (Optional)</option>
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
                    value={formData.roomId ?? 0}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <Input
                    type="datetime-local"
                    name="scheduleDate"
                    value={formData.scheduleDate ?? ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    name="description"
                    value={formData.description ?? ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Label>Available Employees</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {isFetchingEmployees ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Loading available employees...
                      </p>
                    ) : availableEmployees.length > 0 ? (
                      availableEmployees.map((employee) => (
                        <label key={employee.employeeId} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.employees.some(emp => emp.id === employee.employeeId)}
                            onChange={() => handleEmployeeToggle(employee.employeeId)}
                            className="mr-2"
                          />
                          {employee.fullName}
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formData.scheduleDate
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
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default MaintenanceScheduleDetails;