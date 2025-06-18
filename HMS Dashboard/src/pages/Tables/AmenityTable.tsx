import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

interface AmenityDTO {
  id: number;
  name: string;
  description: string;
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
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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

const TextArea: React.FC<{
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name?: string;
}> = ({ value, onChange, name }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      name={name}
      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
      rows={4}
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

const ActionMenu: React.FC<{
  amenityId: number;
  setRefreshTrigger: React.Dispatch<React.SetStateAction<number>>;
}> = ({ amenityId, setRefreshTrigger }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  const handleAction = async (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/amenity/${amenityId}`);
    } else if (action === 'Delete') {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to delete an amenity.');
        navigate('/login');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this amenity?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/amenities/${amenityId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast.success('Amenity deleted successfully.');
          setRefreshTrigger((prev) => prev + 1);
        } else {
          const errorText = await response.text();
          console.error('Failed to delete amenity:', response.status, response.statusText, errorText);
          toast.error(`Failed to delete amenity: ${errorText || response.statusText}`);
          if (response.status === 401) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error deleting amenity:', error);
        toast.error('An error occurred while deleting the amenity.');
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Amenity actions"
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
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const AmenityTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { isOpen, openModal, closeModal } = useModal();
  const [amenities, setAmenities] = useState<AmenityDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newAmenity, setNewAmenity] = useState<{
    name: string;
    description: string;
  }>({
    name: '',
    description: '',
  });
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAmenities = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access amenities.');
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
        });

        const response = await fetch(`http://localhost:8080/api/amenities?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const content = Array.isArray(data.amenities) ? data.amenities : [];
          setAmenities(content);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalItems || 0);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch amenities:', response.status, response.statusText, errorText);
          setError(`Failed to fetch amenities: ${errorText || response.statusText}`);
          setAmenities([]);
          if (response.status === 401) {
            toast.error('Session expired. Please log in again.');
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error fetching amenities:', error);
        setError('An error occurred while fetching amenities.');
        setAmenities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, [currentPage, accessToken, navigate, refreshTrigger]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddAmenity = () => {
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewAmenity({ ...newAmenity, [name]: value });
  };

  const handleSave = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to add an amenity.');
      navigate('/login');
      return;
    }

    if (!newAmenity.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    if (newAmenity.name.length > 100) {
      toast.error('Name must be 100 characters or less.');
      return;
    }

    if (newAmenity.description && newAmenity.description.length > 500) {
      toast.error('Description must be 500 characters or less.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/amenities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAmenity.name,
          description: newAmenity.description,
        }),
      });

      if (response.ok) {
        const createdAmenity: AmenityDTO = await response.json();
        setNewAmenity({ name: '', description: '' });
        closeModal();
        setCurrentPage(1);
        setRefreshTrigger((prev) => prev + 1);
        toast.success('Amenity created successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to create amenity:', response.status, response.statusText, errorText);
        toast.error(`Failed to create amenity: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating amenity:', error);
      toast.error('An error occurred while creating the amenity.');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta title="Amenity Tables Dashboard" description="Manage amenity data with add and view functionality" />
      <PageBreadcrumb pageTitle="Amenity Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button onClick={handleAddAmenity}>Add Amenity</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Description</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {Array.isArray(amenities) && amenities.length > 0 ? (
                amenities.map((amenity) => (
                  <tr key={amenity.id}>
                    <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{amenity.id}</td>
                    <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{amenity.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{amenity.description || '-'}</td>
                    <td className="px-4 py-3 text-sm dark:text-gray-400">
                      <ActionMenu amenityId={amenity.id} setRefreshTrigger={setRefreshTrigger} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-gray-500 text-center text-sm dark:text-gray-400">
                    No amenities found.
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
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add New Amenity
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a new amenity.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={newAmenity.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <TextArea
                    name="description"
                    value={newAmenity.description}
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
                Save Amenity
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AmenityTable;