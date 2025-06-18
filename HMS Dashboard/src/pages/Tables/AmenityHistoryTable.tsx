import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
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
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  name?: string;
}> = ({ type, value, onChange, name }) => {
  return (
    <input
      type={type}
      value={value}
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
  const endEntry = Math.min(currentPage * itemsPerPage, totalElements || 0);

  return (
    <div className="flex flex-col items-center px-6 py-4">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Showing {startEntry} to {endEntry} of {totalElements || 0} entries
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

const ActionMenu: React.FC<{ historyId: number }> = ({ historyId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  const handleAction = async (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/amenity-history/${historyId}`);
    } else if (action === 'Delete') {
      if (!accessToken) {
        toast.error('Please log in to delete amenity history.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/amenity-history/${historyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast.success('Amenity history deleted successfully.');
          window.location.reload();
        } else {
          const errorText = await response.text();
          console.error('Failed to delete amenity history:', response.status, response.statusText, errorText);
          toast.error(`Failed to delete amenity history: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting amenity history:', error);
        toast.error('An error occurred while deleting the amenity history.');
      }
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

const AmenityHistory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchParams, setSearchParams] = useState<{
    amenityId: string;
    action: string;
    sourceRoomId: string;
    destinationRoomId: string;
  }>({
    amenityId: '',
    action: 'All',
    sourceRoomId: '',
    destinationRoomId: '',
  });
  const { isOpen, openModal, closeModal } = useModal();
  const [history, setHistory] = useState<AmenityHistoryDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newHistory, setNewHistory] = useState<{
    amenityId: string;
    action: string;
    sourceRoomId: string;
    destinationRoomId: string;
    quantity: string;
    timestamp: string;
  }>({
    amenityId: '',
    action: '',
    sourceRoomId: '',
    destinationRoomId: '',
    quantity: '',
    timestamp: '',
  });
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const actions = ['All', ...Object.values(AmenityAction)];

  useEffect(() => {
    const fetchHistory = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access amenity history.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(searchParams.amenityId && { amenityId: searchParams.amenityId }),
          ...(searchParams.action !== 'All' && { action: searchParams.action }),
          ...(searchParams.sourceRoomId && { sourceRoomId: searchParams.sourceRoomId }),
          ...(searchParams.destinationRoomId && { destinationRoomId: searchParams.destinationRoomId }),
        });

        const response = await fetch(`http://localhost:8080/api/amenity-history/search?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data.histories || []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalItems || 0);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch amenity history:', response.status, response.statusText, errorText);
          setError(`Failed to fetch amenity history: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching amenity history:', error);
        setError('An error occurred while fetching amenity history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentPage, searchParams, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddHistory = () => {
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewHistory({ ...newHistory, [name]: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
    setCurrentPage(1);
  };

  const handleSave = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to add amenity history.');
      navigate('/login');
      return;
    }

    if (!newHistory.amenityId.trim() || isNaN(parseInt(newHistory.amenityId))) {
      toast.error('Valid Amenity ID is required.');
      return;
    }

    if (!newHistory.action.trim() || !Object.values(AmenityAction).includes(newHistory.action as AmenityAction)) {
      toast.error('Valid action is required.');
      return;
    }

    if (newHistory.sourceRoomId && isNaN(parseInt(newHistory.sourceRoomId))) {
      toast.error('Source Room ID must be a valid number.');
      return;
    }

    if (newHistory.destinationRoomId && isNaN(parseInt(newHistory.destinationRoomId))) {
      toast.error('Destination Room ID must be a valid number.');
      return;
    }

    const quantity = parseInt(newHistory.quantity);
    if (!newHistory.quantity.trim() || isNaN(quantity) || quantity <= 0) {
      toast.error('Quantity must be a positive number.');
      return;
    }

    const timestamp = newHistory.timestamp || new Date().toISOString();
    if (newHistory.timestamp && isNaN(new Date(timestamp).getTime())) {
      toast.error('Invalid timestamp.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/amenity-history', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amenityId: parseInt(newHistory.amenityId),
          action: newHistory.action,
          sourceRoomId: newHistory.sourceRoomId ? parseInt(newHistory.sourceRoomId) : null,
          destinationRoomId: newHistory.destinationRoomId ? parseInt(newHistory.destinationRoomId) : null,
          quantity: quantity,
          timestamp: timestamp,
        }),
      });

      if (response.ok) {
        const createdHistory: AmenityHistoryDTO = await response.json();
        setHistory([...history, createdHistory]);
        setNewHistory({
          amenityId: '',
          action: '',
          sourceRoomId: '',
          destinationRoomId: '',
          quantity: '',
          timestamp: '',
        });
        closeModal();
        toast.success('Amenity history created successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to create amenity history:', response.status, response.statusText, errorText);
        toast.error(`Failed to create amenity history: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating amenity history:', error);
      toast.error('An error occurred while creating the amenity history.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta title="Amenity History Dashboard" description="Manage amenity history with add, view, and delete functionality" />
      <PageBreadcrumb pageTitle="Amenity History" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="number"
          placeholder="Search by Amenity ID..."
          name="amenityId"
          value={searchParams.amenityId}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <select
          name="action"
          value={searchParams.action}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        >
          {actions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Search by Source Room ID..."
          name="sourceRoomId"
          value={searchParams.sourceRoomId}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="number"
          placeholder="Search by Destination Room ID..."
          name="destinationRoomId"
          value={searchParams.destinationRoomId}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <Button onClick={handleAddHistory}>Add History</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Amenity ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Amenity Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Source Room</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Destination Room</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Quantity</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Timestamp</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {history.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{entry.id}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{entry.amenityId}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{entry.amenityName || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <Badge size="sm" color={entry.action === 'TRANSFER' ? 'success' : entry.action === 'FROM_STORAGE' ? 'warning' : 'error'}>
                      {entry.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{entry.sourceRoomName || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{entry.destinationRoomName || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{entry.quantity}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{new Date(entry.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu historyId={entry.id} />
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
              Add New Amenity History
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a new amenity history entry.
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
                    value={newHistory.amenityId}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Action</Label>
                  <select
                    name="action"
                    value={newHistory.action}
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
                    value={newHistory.sourceRoomId}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Destination Room ID</Label>
                  <Input
                    type="number"
                    name="destinationRoomId"
                    value={newHistory.destinationRoomId}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    name="quantity"
                    value={newHistory.quantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <Input
                    type="datetime-local"
                    name="timestamp"
                    value={newHistory.timestamp}
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
                Save History
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AmenityHistory;