import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

enum AssetCondition {
  GOOD = 'GOOD',
  NEEDS_REPAIR = 'NEEDS_REPAIR',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
}

interface AssetDTO {
  id: number;
  name: string;
  location: string;
  maintainDate: string;
  condition: AssetCondition;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error';
  size: 'sm';
  onClick?: () => void; // Added for clickable badge
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

const ActionMenu: React.FC<{ assetId: number }> = ({ assetId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  const handleAction = async (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/asset/${assetId}`);
    } else if (action === 'Delete') {
      if (!accessToken) {
        toast.error('Please log in to delete asset.');
        navigate('/login');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this asset?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/assets/${assetId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast.success('Asset deleted successfully.');
          window.location.reload();
        } else {
          const errorText = await response.text();
          console.error('Failed to delete asset:', response.status, response.statusText, errorText);
          toast.error(`Failed to delete asset: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting asset:', error);
        toast.error('An error occurred while deleting the asset.');
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

const ConditionDropdown: React.FC<{ assetId: number; currentCondition: AssetCondition; onConditionChange: (assetId: number, condition: string) => void }> = ({ assetId, currentCondition, onConditionChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getBadgeColor = (condition: AssetCondition): 'success' | 'warning' | 'error' => {
    switch (condition) {
      case AssetCondition.GOOD:
        return 'success';
      case AssetCondition.NEEDS_REPAIR:
        return 'warning';
      case AssetCondition.UNDER_MAINTENANCE:
        return 'error';
      default:
        return 'success';
    }
  };

  const handleConditionSelect = (condition: string) => {
    onConditionChange(assetId, condition);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <Badge
        color={getBadgeColor(currentCondition)}
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {currentCondition}
      </Badge>
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-45 bg-white rounded-md shadow-lg z-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {Object.values(AssetCondition).map((condition) => (
            <button
              key={condition}
              onClick={() => handleConditionSelect(condition)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {condition}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AssetTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchName, setSearchName] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const { isOpen, openModal, closeModal } = useModal();
  const [assets, setAssets] = useState<AssetDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState<{
    name: string;
    location: string;
    maintainDate: string;
    condition: string;
  }>({
    name: '',
    location: '',
    maintainDate: '',
    condition: '',
  });
  const itemsPerPage: number = 10;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const conditions = ['All', ...Object.values(AssetCondition)];

  useEffect(() => {
    const fetchAssets = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access assets.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(searchName && { name: searchName }),
          ...(searchLocation && { location: searchLocation }),
          ...(selectedCondition !== 'All' && { condition: selectedCondition }),
        });

        const response = await fetch(`http://localhost:8080/api/assets?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAssets(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch assets:', response.status, response.statusText, errorText);
          setError(`Failed to fetch assets: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('An error occurred while fetching assets.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [currentPage, searchName, searchLocation, selectedCondition, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddAsset = () => {
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAsset({ ...newAsset, [name]: value });
  };

  const handleSave = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to add an asset.');
      navigate('/login');
      return;
    }

    if (!newAsset.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    if (!newAsset.location.trim()) {
      toast.error('Location is required.');
      return;
    }

    if (!newAsset.condition || !Object.values(AssetCondition).includes(newAsset.condition as AssetCondition)) {
      toast.error('Valid condition is required.');
      return;
    }

    const maintainDate = newAsset.maintainDate || new Date().toISOString().split('T')[0];
    if (newAsset.maintainDate && isNaN(new Date(maintainDate).getTime())) {
      toast.error('Invalid maintenance date.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAsset.name,
          location: newAsset.location,
          maintainDate: maintainDate,
          condition: newAsset.condition,
        }),
      });

      if (response.ok) {
        const createdAsset: AssetDTO = await response.json();
        setAssets([...assets, createdAsset]);
        setNewAsset({
          name: '',
          location: '',
          maintainDate: '',
          condition: '',
        });
        closeModal();
        toast.success('Asset created successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to create asset:', response.status, response.statusText, errorText);
        toast.error(`Failed to create asset: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      toast.error('An error occurred while creating the asset.');
    }
  };

  const handleConditionChange = async (assetId: number, condition: string) => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to update asset condition.');
      navigate('/login');
      return;
    }

    if (!Object.values(AssetCondition).includes(condition as AssetCondition)) {
      toast.error('Invalid condition selected.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/assets/${assetId}/condition?condition=${condition}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedAsset: AssetDTO = await response.json();
        setAssets(assets.map((asset) => (asset.id === assetId ? updatedAsset : asset)));
        toast.success('Asset condition updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update asset condition:', response.status, response.statusText, errorText);
        toast.error(`Failed to update asset condition: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating asset condition:', error);
      toast.error('An error occurred while updating the asset condition.');
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
      <PageMeta title="Asset Tables Dashboard" description="Manage asset data with add, view, delete, and update condition functionality" />
      <PageBreadcrumb pageTitle="Asset Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="text"
          placeholder="Search by location..."
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        >
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
        <Button onClick={handleAddAsset}>Add Asset</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Location</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Maintenance Date</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Condition</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{asset.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{asset.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{asset.location}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{asset.maintainDate}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ConditionDropdown
                      assetId={asset.id}
                      currentCondition={asset.condition}
                      onConditionChange={handleConditionChange}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu assetId={asset.id} />
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
              Add New Asset
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a new asset.
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
                    value={newAsset.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    type="text"
                    name="location"
                    value={newAsset.location}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Maintenance Date</Label>
                  <Input
                    type="date"
                    name="maintainDate"
                    value={newAsset.maintainDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Condition</Label>
                  <select
                    name="condition"
                    value={newAsset.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Condition</option>
                    {Object.values(AssetCondition).map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Asset
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AssetTable;