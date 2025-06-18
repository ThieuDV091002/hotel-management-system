import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Role } from '../../context/Role';
import { toast } from 'react-toastify';

interface Customer {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  active: boolean;
  role: Role;
  address: string;
  loyaltyPoints: number;
  loyaltyLevelId: number;
  loyaltyLevelName: string;
  loyaltyBenefits: string;
  loyaltyDescription: string;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'error';
  size: 'sm';
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
  onPageChange: (page: number) => void;
}

const Badge: React.FC<BadgeProps> = ({ children, color, size }) => {
  const colorStyles: Record<string, string> = {
    success: "bg-green-100 text-green-800",
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

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalCustomers, onPageChange }) => {
  const maxPagesToShow = 5;
  const halfPagesToShow = Math.floor(maxPagesToShow / 2);
  let startPage = Math.max(1, currentPage - halfPagesToShow);
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage < maxPagesToShow - 1) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pages: (number | string)[] = [];
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col items-center px-6 py-4">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Showing {Math.min((currentPage - 1) * 15 + 1, totalCustomers)} to {Math.min(currentPage * 15, totalCustomers)} of {totalCustomers} entries
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
        >
          Previous
        </button>
        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500 dark:text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
            >
              {page}
            </button>
          )
        )}
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

const ActionMenu: React.FC<{ customerId: number; active: boolean; onToggleStatus: (id: number) => void }> = ({ customerId, active, onToggleStatus }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    setIsDropdownOpen(false);
    if (action === "View") {
      navigate(`/customer/${customerId}`);
    } else if (action === "ToggleStatus") {
      onToggleStatus(customerId);
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
            onClick={() => handleAction("View")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View
          </button>
          <button
            onClick={() => handleAction("ToggleStatus")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {active ? "Deactivate" : "Activate"}
          </button>
        </div>
      )}
    </div>
  );
};

const CustomerTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchFields, setSearchFields] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
  }>({ fullName: '', email: '', phoneNumber: '' });
  const [isActiveFilter, setIsActiveFilter] = useState<string>('All');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(searchFields.fullName && { fullName: searchFields.fullName }),
          ...(searchFields.email && { email: searchFields.email }),
          ...(searchFields.phoneNumber && { phoneNumber: searchFields.phoneNumber }),
          ...(isActiveFilter !== 'All' && { isActive: (isActiveFilter === 'Active').toString() }),
        });

        const response = await fetch(`http://localhost:8080/api/customers?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCustomers(data.content);
          setTotalPages(data.totalPages);
          setTotalCustomers(data.totalElements);
        } else {
          console.error('Failed to fetch customers:', response.status, response.statusText);
          toast.error('Failed to fetch customers. Please try again.');

        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('An error occurred while fetching customers.');
      }
    };

    if (accessToken) {
      fetchCustomers();
    } else {
      console.error('No access token found');
      toast.warning('Please log in to access customer data.');
      navigate('/login');
    }
  }, [currentPage, searchFields, isActiveFilter, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchFields((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const customer = customers.find((c) => c.id === id);
      if (!customer) {
        console.error('Customer not found:', id);
        toast.error('Customer not found.');
        return;
      }

      const response = await fetch(`http://localhost:8080/api/customers/${id}/status?isActive=${!customer.active}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setCustomers((prevCustomers) =>
          prevCustomers.map((customer) =>
            customer.id === id ? { ...customer, active: !customer.active } : customer
          )
        );
        toast.success(`Customer ${customer.fullName} status updated to ${!customer.active ? 'Active' : 'Inactive'}.`);
      } else {
        const errorText = await response.text();
        console.error('Failed to update customer status:', response.status, response.statusText, errorText);
        toast.error(`Failed to update customer status: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('An error occurred while updating customer status.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta
        title="Customer Tables Dashboard"
        description="Manage customer data with search, status filtering, and pagination"
      />
      <PageBreadcrumb pageTitle="Customer Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          name="fullName"
          placeholder="Search by name..."
          value={searchFields.fullName}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="text"
          name="email"
          placeholder="Search by email..."
          value={searchFields.email}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Search by phone..."
          value={searchFields.phoneNumber}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <select
          value={isActiveFilter}
          onChange={(e) => {
            setIsActiveFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Full Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Email</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Phone</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{customer.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{customer.fullName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{customer.phoneNumber}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <Badge size="sm" color={customer.active ? "success" : "error"}>
                      {customer.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu
                      customerId={customer.id}
                      active={customer.active}
                      onToggleStatus={handleToggleStatus}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCustomers={totalCustomers}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default CustomerTable;