import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

enum ScheduleStatus {
  COMPLETED = 'COMPLETED',
  ASSIGNED = 'ASSIGNED',
}

interface HousekeepingSchedule {
  id: number;
  roomId: number;
  roomName: string;
  employeeId: number;
  employeeName: string;
  status: ScheduleStatus;
  scheduleTime: string;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error';
  size: 'sm';
}

const Badge: React.FC<BadgeProps> = ({ children, color, size }) => {
  const colorStyles: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };
  const sizeStyles: Record<string, string> = {
    sm: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
      {children}
    </label>
  );
};

const HousekeepingScheduleDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scheduleData, setScheduleData] = useState<HousekeepingSchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!accessToken) {
        console.error('No access token found');
        alert('Please log in to access housekeeping schedule details.');
        navigate('/login');
        return;
      }

      if (!id || isNaN(parseInt(id))) {
        setError('Invalid schedule ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/housekeeping/schedules/${id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const schedule: HousekeepingSchedule = await response.json();
          setScheduleData(schedule);
        } else if (response.status === 404) {
          setError('Housekeeping schedule not found');
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

  const getBadgeColor = (status: ScheduleStatus): 'success' | 'warning' | 'error' => {
    switch (status) {
      case ScheduleStatus.COMPLETED:
        return 'success';
      case ScheduleStatus.ASSIGNED:
        return 'warning';
        return 'success';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!scheduleData) {
    return <div>No schedule data found.</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Housekeeping Schedule Details
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <Label>ID</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {scheduleData.id}
              </p>
            </div>
            <div>
              <Label>Room ID</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {scheduleData.roomId}
              </p>
            </div>
            <div>
              <Label>Room Name</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {scheduleData.roomName}
              </p>
            </div>
            <div>
              <Label>Employee ID</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {scheduleData.employeeId}
              </p>
            </div>
            <div>
              <Label>Employee Name</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/ Ninety">
                {scheduleData.employeeName}
              </p>
            </div>
            <div>
              <Label>Schedule Time</Label>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(scheduleData.scheduleTime).toLocaleString()}
              </p>
            </div>
            <div>
              <Label>Status</Label>
              <Badge color={getBadgeColor(scheduleData.status)} size="sm">
                {scheduleData.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HousekeepingScheduleDetails;