import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { toast } from 'react-toastify';

enum AmenityAction {
  TRANSFER = 'TRANSFER',
  FROM_STORAGE = 'FROM_STORAGE',
  TO_STORAGE = 'TO_STORAGE',
}

interface AmenityHistoryDTO {
  id: number;
  amenityId: number;
  amenityName: string;
  action: AmenityAction;
  sourceRoomId: number | null;
  sourceRoomName: string | null;
  destinationRoomId: number | null;
  destinationRoomName: string | null;
  quantity: number;
  timestamp: string;
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
  value: string | number | boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  name?: string;
}> = ({ type, value, onChange, name }) => {
  return (
    <input
      type={type}
      value={value.toString()}
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

const AmenityHistoryDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, openModal, closeModal } = useModal();
  const [history, setHistory] = useState<AmenityHistoryDTO | null>(null);
  const [formData, setFormData] = useState<Partial<AmenityHistoryDTO> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to view amenity history details.');
        navigate('/login');
        return;
      }

      if (!id) {
        setError('Invalid history ID.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/amenity-history/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: AmenityHistoryDTO = await response.json();
          setHistory(data);
          setFormData({
            amenityId: data.amenityId,
            action: data.action,
            sourceRoomId: data.sourceRoomId,
            destinationRoomId: data.destinationRoomId,
            quantity: data.quantity,
            timestamp: data.timestamp,
          });
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch amenity history:', response.status, response.statusText, errorText);
          setError(`Failed to fetch amenity history: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching amenity history:', error);
        setError('An error occurred while fetching amenity history details.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id, accessToken, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      if (name === 'amenityId' || name === 'sourceRoomId' || name === 'destinationRoomId' || name === 'quantity') {
        return { ...prev, [name]: value ? parseInt(value) : '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async () => {
    if (!accessToken) {
      toast.error('Please log in to update amenity history.');
      navigate('/login');
      return;
    }

    if (!formData || !history) {
      toast.error('No history data to save.');
      return;
    }

    if (!formData.amenityId || isNaN(formData.amenityId)) {
      toast.error('Valid Amenity ID is required.');
      return;
    }

    if (!formData.action || !Object.values(AmenityAction).includes(formData.action as AmenityAction)) {
      toast.error('Valid action is required.');
      return;
    }

    if (formData.sourceRoomId && isNaN(formData.sourceRoomId)) {
      toast.error('Source Room ID must be a valid number.');
      return;
    }

    if (formData.destinationRoomId && isNaN(formData.destinationRoomId)) {
      toast.error('Destination Room ID must be a valid number.');
      return;
    }

    if (!formData.quantity || isNaN(formData.quantity) || formData.quantity <= 0) {
      toast.error('Quantity must be a positive number.');
      return;
    }

    if (!formData.timestamp || isNaN(new Date(formData.timestamp).getTime())) {
      toast.error('Valid timestamp is required.');
      return;
    }

    try {
      const updatedHistory = {
        amenityId: formData.amenityId,
        action: formData.action,
        sourceRoomId: formData.sourceRoomId || null,
        destinationRoomId: formData.destinationRoomId || null,
        quantity: formData.quantity,
        timestamp: formData.timestamp,
      };

      const response = await fetch(`http://localhost:8080/api/amenity-history/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedHistory),
      });

      if (response.ok) {
        const data: AmenityHistoryDTO = await response.json();
        setHistory(data);
        setFormData({
          amenityId: data.amenityId,
          action: data.action,
          sourceRoomId: data.sourceRoomId,
          destinationRoomId: data.destinationRoomId,
          quantity: data.quantity,
          timestamp: data.timestamp,
        });
        toast.success('Amenity history updated successfully.');
        closeModal();
      } else {
        const errorText = await response.text();
        console.error('Failed to update amenity history:', response.status, response.statusText, errorText);
        if (response.status === 400) {
          toast.error(`Invalid data provided: ${errorText || 'Check your input values.'}`);
        } else {
          toast.error(`Failed to update amenity history: ${errorText || response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error updating amenity history:', error);
      toast.error('An error occurred while updating the amenity history.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !history) {
    return <div className="text-red-600 dark:text-red-400">{error || 'Amenity history not found.'}</div>;
  }

  return (
    <>
      <div className="p-5 border bg-white border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Amenity History Details
            </h4>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Amenity ID
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {history.amenityId}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Amenity Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {history.amenityName || '-'}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Action
                </p>
                <Badge size="sm" color={history.action === 'TRANSFER' ? 'success' : history.action === 'FROM_STORAGE' ? 'warning' : 'error'}>
                  {history.action}
                </Badge>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Source Room
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {history.sourceRoomName || history.sourceRoomId || '-'}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Destination Room
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {history.destinationRoomName || history.destinationRoomId || '-'}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Quantity
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {history.quantity}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Timestamp
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {new Date(history.timestamp).toLocaleString()}
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
          <Button onClick={() => navigate("/amenity-history")}>Back</Button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Amenity History Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update amenity history details to keep the record up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Amenity ID</Label>
                  <Input
                    type="number"
                    name="amenityId"
                    value={formData?.amenityId || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Action</Label>
                  <select
                    name="action"
                    value={formData?.action || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Action</option>
                    {Object.values(AmenityAction).map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Source Room ID</Label>
                  <Input
                    type="number"
                    name="sourceRoomId"
                    value={formData?.sourceRoomId || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Destination Room ID</Label>
                  <Input
                    type="number"
                    name="destinationRoomId"
                    value={formData?.destinationRoomId || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    name="quantity"
                    value={formData?.quantity || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <Input
                    type="datetime-local"
                    name="timestamp"
                    value={formData?.timestamp || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AmenityHistoryDetails;