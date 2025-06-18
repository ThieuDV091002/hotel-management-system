import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

enum ServiceRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

interface ServiceRequestDTO {
  id: number;
  bookingId: number;
  serviceId: number;
  serviceName: string;
  quantity: number;
  totalAmount: number;
  status: ServiceRequestStatus;
  notes: string;
  createdAt: string;
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

const ServiceRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequestDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchRequest = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to view service request details.');
        navigate('/login');
        return;
      }

      if (!id) {
        setError('Invalid request ID.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/admin/service-requests/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: ServiceRequestDTO = await response.json();
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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error || !request) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error || 'Request not found.'}</div>;
  }

  return (
    <div className="p-5 border bg-white border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Service Request Details
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
                Service
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {request.serviceName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Quantity
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {request.quantity}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Total Amount
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {request.totalAmount.toFixed(2)} VND
              </p>
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
                Created At
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(request.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Status
              </p>
              <Badge
                size="sm"
                color={
                  request.status === ServiceRequestStatus.PENDING ? 'warning' :
                  request.status === ServiceRequestStatus.IN_PROGRESS ? 'info' :
                  request.status === ServiceRequestStatus.COMPLETED ? 'success' :
                  'error'
                }
              >
                {request.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
          <Button onClick={() => navigate("/service-request")}>Back</Button>
        </div>
    </div>
  );
};

export default ServiceRequestDetails;