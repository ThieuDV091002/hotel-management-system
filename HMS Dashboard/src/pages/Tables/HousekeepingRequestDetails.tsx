import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { toast } from 'react-toastify';

enum HousekeepingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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

interface HousekeepingScheduleDTO {
  id: number;
  requestId: number;
  housekeeperId: number;
  housekeeperName: string;
  scheduledTime: string;
  status: HousekeepingStatus;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error' | 'info';
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
    info: "bg-blue-100 text-blue-800",
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

const HousekeepingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen: isAssignOpen, openModal: openAssignModal, closeModal: closeAssignModal } = useModal();
  const [request, setRequest] = useState<HousekeepingRequestDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchRequest = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to view housekeeping request details.');
        navigate('/login');
        return;
      }

      if (!id) {
        setError('Invalid request ID.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/admin/housekeeping-requests/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: HousekeepingRequestDTO = await response.json();
          setRequest(data);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch request:', response.status, response.statusText, errorText);
          setError(`Failed to fetch request: ${errorText || response.statusText}`);
          if (response.status === 401) {
            toast.error('Session expired. Please log in again.');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching request:', error);
        setError('An error occurred while fetching request details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, accessToken, navigate]);

  const handleAssignHousekeeper = async () => {
    if (!accessToken) {
      toast.error('Please log in to assign housekeeper.');
      navigate('/login');
      return;
    }

    if (!id) {
      toast.error('Invalid request ID.');
      closeAssignModal();
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/housekeeping/approve/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const schedule: HousekeepingScheduleDTO = await response.json();
        toast.success(`Housekeeper ${schedule.housekeeperName} assigned successfully.`);
        if (request && schedule.status !== request.status) {
          setRequest((prev) => prev ? { ...prev, status: schedule.status } : prev);
        }
        closeAssignModal();
      } else {
        const errorText = await response.text();
        console.error('Failed to assign housekeeper:', response.status, response.statusText, errorText);
        toast.error(`Failed to assign housekeeper: ${errorText || response.statusText}`);
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        }
        closeAssignModal();
      }
    } catch (error) {
      console.error('Error assigning housekeeper:', error);
      toast.error('An error occurred while assigning the housekeeper.');
      closeAssignModal();
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error || !request) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error || 'Request not found.'}</div>;
  }

  return (
    <>
      <div className="p-5 border bg-white border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Housekeeping Request Details
            </h4>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Request ID
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  #{request.id}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Room
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {request.roomName}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Customer
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {request.customerName}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <Badge
                  size="sm"
                  color={
                    request.status === HousekeepingStatus.PENDING ? 'warning' :
                    request.status === HousekeepingStatus.IN_PROGRESS ? 'info' :
                    request.status === HousekeepingStatus.COMPLETED ? 'success' :
                    'error'
                  }
                >
                  {request.status}
                </Badge>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Notes
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {request.notes || '-'}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Preferred Time
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {new Date(request.preferredTime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Created At
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {new Date(request.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <button
              onClick={openAssignModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:w-auto"
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
                  d="M9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3ZM7.5 6C7.5 5.17157 8.17157 4.5 9 4.5C9.82843 4.5 10.5 5.17157 10.5 6C10.5 6.82843 9.82843 7.5 9 7.5C8.17157 7.5 7.5 6.82843 7.5 6Z"
                  fill=""
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.5 12C3.67157 12 3 12.6716 3 13.5C3 14.3284 3.67157 15 4.5 15C5.32843 15 6 14.3284 6 13.5C6 12.6716 5.32843 12 4.5 12ZM4.5 13.5C4.08579 13.5 3.75 13.8358 3.75 14.25C3.75 14.6642 4.08579 15 4.5 15C4.91421 15 5.25 14.6642 5.25 14.25C5.25 13.8358 4.91421 13.5 4.5 13.5Z"
                  fill=""
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.5 12C12.6716 12 12 12.6716 12 13.5C12 14.3284 12.6716 15 13.5 15C14.3284 15 15 14.3284 15 13.5C15 12.6716 14.3284 12 13.5 12ZM13.5 13.5C13.0858 13.5 12.75 13.8358 12.75 14.25C12.75 14.6642 13.0858 15 13.5 15C13.9142 15 14.25 14.6642 14.25 14.25C14.25 13.8358 13.9142 13.5 13.5 13.5Z"
                  fill=""
                />
              </svg>
              Assign Housekeeper
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
          <Button onClick={() => navigate("/hp-request")}>Back</Button>
        </div>
      </div>
      {/* Assign Housekeeper Modal */}
      <Modal isOpen={isAssignOpen} onClose={closeAssignModal} className="max-w-[400px] m-4">
        <div className="relative w-full p-4 bg-white rounded-3xl dark:bg-gray-900 lg:p-6">
          <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Assign Housekeeper
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to assign a housekeeper to this request?
          </p>
          <div className="flex items-center gap-3 justify-end">
            <Button size="sm" variant="outline" onClick={closeAssignModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAssignHousekeeper}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default HousekeepingDetails;