import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const MyMaintenanceScheduleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<MaintenanceScheduleDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
        <Button onClick={() => navigate("/my-mt-schedule")}>Back</Button>
      </div>
    </div>
  );
};

export default MyMaintenanceScheduleDetails;