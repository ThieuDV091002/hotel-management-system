import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

interface InventoryDTO {
  id: number;
  inventoryName: string;
  inventoryPrice: number;
  inventoryQuantity: number;
  supplierId: number;
  supplierName: string;
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

const ActionMenu: React.FC<{ inventoryId: number }> = ({ inventoryId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  const handleAction = async (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/inventory/${inventoryId}`);
    } else if (action === 'Delete') {
      if (!accessToken) {
        toast.error('Please log in to delete inventory.');
        navigate('/login');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this inventory item?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/inventories/${inventoryId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast.success('Inventory deleted successfully.');
          window.location.reload();
        } else {
          const errorText = await response.text();
          console.error('Failed to delete inventory:', response.status, response.statusText, errorText);
          toast.error(`Failed to delete inventory: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting inventory:', error);
        toast.error('An error occurred while deleting the inventory.');
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

const QuantityInput: React.FC<{ inventoryId: number; currentQuantity: number; onQuantityChange: (inventoryId: number, quantity: number) => void }> = ({ inventoryId, currentQuantity, onQuantityChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(currentQuantity.toString());

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };

  const handleBlur = () => {
    const newQuantity = parseInt(quantity);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onQuantityChange(inventoryId, newQuantity);
    } else {
      setQuantity(currentQuantity.toString());
      toast.error('Invalid quantity entered.');
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return isEditing ? (
    <input
      type="text"
      value={quantity}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      className="w-16 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
      autoFocus
    />
  ) : (
    <span
      className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
      onClick={handleClick}
    >
      {currentQuantity}
    </span>
  );
};

const InventoryTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchInventoryName, setSearchInventoryName] = useState<string>('');
  const [searchSupplierName, setSearchSupplierName] = useState<string>('');
  const { isOpen, openModal, closeModal } = useModal();
  const [inventories, setInventories] = useState<InventoryDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newInventory, setNewInventory] = useState<{
    inventoryName: string;
    inventoryPrice: string;
    inventoryQuantity: string;
    supplierName: string;
  }>({
    inventoryName: '',
    inventoryPrice: '',
    inventoryQuantity: '',
    supplierName: '',
  });
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventories = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access inventories.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(searchInventoryName && { inventoryName: searchInventoryName }),
          ...(searchSupplierName && { supplierName: searchSupplierName }),
        });

        const response = await fetch(`http://localhost:8080/api/inventories?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setInventories(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch inventories:', response.status, response.statusText, errorText);
          setError(`Failed to fetch inventories: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching inventories:', error);
        setError('An error occurred while fetching inventories.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, [currentPage, searchInventoryName, searchSupplierName, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddInventory = () => {
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInventory({ ...newInventory, [name]: value });
  };

  const handleSave = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to add an inventory item.');
      navigate('/login');
      return;
    }

    if (!newInventory.inventoryName.trim()) {
      toast.error('Inventory name is required.');
      return;
    }

    const price = parseFloat(newInventory.inventoryPrice);
    if (isNaN(price) || price < 0) {
      toast.error('Valid inventory price is required.');
      return;
    }

    const quantity = parseInt(newInventory.inventoryQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Valid inventory quantity is required.');
      return;
    }

    if (!newInventory.supplierName.trim()) {
      toast.error('Supplier name is required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/inventories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inventoryName: newInventory.inventoryName,
          inventoryPrice: price,
          inventoryQuantity: quantity,
          supplierName: newInventory.supplierName,
        }),
      });

      if (response.ok) {
        const createdInventory: InventoryDTO = await response.json();
        setInventories([...inventories, createdInventory]);
        setNewInventory({
          inventoryName: '',
          inventoryPrice: '',
          inventoryQuantity: '',
          supplierName: '',
        });
        closeModal();
        toast.success('Inventory created successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to create inventory:', response.status, response.statusText, errorText);
        toast.error(`Failed to create inventory: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating inventory:', error);
      toast.error('An error occurred while creating the inventory.');
    }
  };

  const handleQuantityChange = async (inventoryId: number, quantity: number) => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to update inventory quantity.');
      navigate('/login');
      return;
    }

    if (quantity < 0) {
      toast.error('Quantity cannot be negative.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/inventories/${inventoryId}/quantity?quantity=${quantity}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedInventory: InventoryDTO = await response.json();
        setInventories(inventories.map((inventory) => (inventory.id === inventoryId ? updatedInventory : inventory)));
        toast.success('Inventory quantity updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update inventory quantity:', response.status, response.statusText, errorText);
        toast.error(`Failed to update inventory quantity: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating inventory quantity:', error);
      toast.error('An error occurred while updating the inventory quantity.');
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
      <PageMeta title="Inventory Tables Dashboard" description="Manage inventory data with add, view, delete, and update quantity functionality" />
      <PageBreadcrumb pageTitle="Inventory Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by inventory name..."
          value={searchInventoryName}
          onChange={(e) => setSearchInventoryName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="text"
          placeholder="Search by supplier name..."
          value={searchSupplierName}
          onChange={(e) => setSearchSupplierName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <Button onClick={handleAddInventory}>Add Inventory</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Inventory Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Price</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Quantity</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Supplier ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Supplier Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {inventories.map((inventory) => (
                <tr key={inventory.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{inventory.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{inventory.inventoryName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{inventory.inventoryPrice.toFixed(2)} VND</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <QuantityInput
                      inventoryId={inventory.id}
                      currentQuantity={inventory.inventoryQuantity}
                      onQuantityChange={handleQuantityChange}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{inventory.supplierId}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{inventory.supplierName}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu inventoryId={inventory.id} />
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
              Add New Inventory
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a new inventory item.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Inventory Name</Label>
                  <Input
                    type="text"
                    name="inventoryName"
                    value={newInventory.inventoryName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="text"
                    name="inventoryPrice"
                    value={newInventory.inventoryPrice}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="text"
                    name="inventoryQuantity"
                    value={newInventory.inventoryQuantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Supplier Name</Label>
                  <Input
                    type="text"
                    name="supplierName"
                    value={newInventory.supplierName}
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
                Save Inventory
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryTable;