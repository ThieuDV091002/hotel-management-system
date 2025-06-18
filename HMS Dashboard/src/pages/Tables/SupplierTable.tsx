import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

interface SupplierDTO {
  id: number;
  supplierName: string;
  supplierAddress: string;
  supplierPhone: string;
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

const ActionMenu: React.FC<{ supplierId: number }> = ({ supplierId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  const handleAction = async (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/supplier/${supplierId}`);
    } else if (action === 'Delete') {
      if (!accessToken) {
        toast.error('Please log in to delete supplier.');
        navigate('/login');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this supplier?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/suppliers/${supplierId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast.success('Supplier deleted successfully.');
          window.location.reload();
        } else {
          const errorText = await response.text();
          console.error('Failed to delete supplier:', response.status, response.statusText, errorText);
          toast.error(`Failed to delete supplier: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting supplier:', error);
        toast.error('An error occurred while deleting the supplier.');
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

const SupplierTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchName, setSearchName] = useState<string>('');
  const { isOpen, openModal, closeModal } = useModal();
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState<{
    supplierName: string;
    supplierAddress: string;
    supplierPhone: string;
  }>({
    supplierName: '',
    supplierAddress: '',
    supplierPhone: '',
  });
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access suppliers.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(searchName && { name: searchName }),
        });

        const response = await fetch(`http://localhost:8080/api/suppliers?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSuppliers(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch suppliers:', response.status, response.statusText, errorText);
          setError(`Failed to fetch suppliers: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        setError('An error occurred while fetching suppliers.');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [currentPage, searchName, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddSupplier = () => {
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSupplier({ ...newSupplier, [name]: value });
  };

  const handleSave = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to add a supplier.');
      navigate('/login');
      return;
    }

    if (!newSupplier.supplierName.trim()) {
      toast.error('Supplier name is required.');
      return;
    }

    if (!newSupplier.supplierAddress.trim()) {
      toast.error('Supplier address is required.');
      return;
    }

    if (!newSupplier.supplierPhone.trim()) {
      toast.error('Supplier phone is required.');
      return;
    }

    // Basic phone number validation (e.g., digits, optional + and hyphens)
    const phoneRegex = /^\+?[0-9-]+$/;
    if (!phoneRegex.test(newSupplier.supplierPhone)) {
      toast.error('Invalid phone number format.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/suppliers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierName: newSupplier.supplierName,
          supplierAddress: newSupplier.supplierAddress,
          supplierPhone: newSupplier.supplierPhone,
        }),
      });

      if (response.ok) {
        const createdSupplier: SupplierDTO = await response.json();
        setSuppliers([...suppliers, createdSupplier]);
        setNewSupplier({
          supplierName: '',
          supplierAddress: '',
          supplierPhone: '',
        });
        closeModal();
        toast.success('Supplier created successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to create supplier:', response.status, response.statusText, errorText);
        toast.error(`Failed to create supplier: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error('An error occurred while creating the supplier.');
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
      <PageMeta title="Supplier Tables Dashboard" description="Manage supplier data with add, view, and delete functionality" />
      <PageBreadcrumb pageTitle="Supplier Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <Button onClick={handleAddSupplier}>Add Supplier</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Supplier Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Address</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Phone</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{supplier.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{supplier.supplierName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{supplier.supplierAddress}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{supplier.supplierPhone}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu supplierId={supplier.id} />
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
              Add New Supplier
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a new supplier.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Supplier Name</Label>
                  <Input
                    type="text"
                    name="supplierName"
                    value={newSupplier.supplierName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Supplier Address</Label>
                  <Input
                    type="text"
                    name="supplierAddress"
                    value={newSupplier.supplierAddress}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Supplier Phone</Label>
                  <Input
                    type="text"
                    name="supplierPhone"
                    value={newSupplier.supplierPhone}
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
                Save Supplier
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default SupplierTable;