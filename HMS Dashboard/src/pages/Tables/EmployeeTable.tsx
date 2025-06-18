import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

enum Role {
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  HOUSEKEEPING = 'HOUSEKEEPING',
  MAINTENANCE = 'MAINTENANCE',
  SECURITY = 'SECURITY',
  WAITER = 'WAITER',
  CHEF = 'CHEF',
  POS_SERVICE = 'POS_SERVICE',
}

interface EmployeeDTO {
  id: number;
  fullName: string;
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  role: Role;
  salary: number;
  hireDate: string;
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

const ActionMenu: React.FC<{ employeeId: number }> = ({ employeeId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  const handleAction = async (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/employee/${employeeId}`);
    } else if (action === 'Reset Password') {
      if (!accessToken) {
        toast.error('Please log in to reset password.');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/employees/reset-password/${employeeId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast.success('Password reset to default successfully.');
        } else {
          const errorText = await response.text();
          console.error('Failed to reset password:', response.status, response.statusText, errorText);
          toast.error(`Failed to reset password: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        toast.error('An error occurred while resetting the password.');
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
            onClick={() => handleAction('Reset Password')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Reset Password
          </button>
        </div>
      )}
    </div>
  );
};

const EmployeeTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const { isOpen, openModal, closeModal } = useModal();
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState<{
    fullName: string;
    username: string;
    password: string;
    role: string;
    email: string;
    phoneNumber: string;
    salary: string;
    hireDate: string;
  }>({
    fullName: '',
    username: '',
    password: '',
    role: '',
    email: '',
    phoneNumber: '',
    salary: '',
    hireDate: '',
  });
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const roles = ['All', ...Object.values(Role)];

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access employees.');
        navigate('/login');
        return;
      }

      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(searchTerm && { fullName: searchTerm }),
          ...(selectedRole !== 'All' && { role: selectedRole }),
        });

        const response = await fetch(`http://localhost:8080/api/employees?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEmployees(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch employees:', response.status, response.statusText, errorText);
          setError(`Failed to fetch employees: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        setError('An error occurred while fetching employees.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, searchTerm, selectedRole, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddEmployee = () => {
    openModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleSave = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to add an employee.');
      navigate('/login');
      return;
    }

    if (!newEmployee.fullName.trim()) {
      toast.error('Name is required.');
      return;
    }

    if (!newEmployee.username.trim()) {
      toast.error('Username is required.');
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(newEmployee.username)) {
      toast.error('Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens.');
      return;
    }

    if (!newEmployee.password.trim()) {
      toast.error('Password is required.');
      return;
    }

    if (newEmployee.password.length < 6 || newEmployee.password.length > 100) {
      toast.error('Password must be 6-100 characters.');
      return;
    }

    if (!newEmployee.role.trim() || !Object.values(Role).includes(newEmployee.role as Role)) {
      toast.error('Valid role is required.');
      return;
    }

    if (newEmployee.email && !/\S+@\S+\.\S+/.test(newEmployee.email)) {
      toast.error('Invalid email format.');
      return;
    }

    if (newEmployee.phoneNumber && !/^\d{7,15}$/.test(newEmployee.phoneNumber)) {
      toast.error('Phone number must be 7-15 digits.');
      return;
    }

    const salary = newEmployee.salary ? parseFloat(newEmployee.salary) : 0;
    if (newEmployee.salary && (isNaN(salary) || salary < 0)) {
      toast.error('Salary must be a non-negative number.');
      return;
    }

    const hireDate = newEmployee.hireDate || new Date().toISOString().split('T')[0];
    if (newEmployee.hireDate && isNaN(new Date(hireDate).getTime())) {
      toast.error('Invalid hire date.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/employees', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: newEmployee.fullName,
          username: newEmployee.username,
          password: newEmployee.password,
          email: newEmployee.email,
          phoneNumber: newEmployee.phoneNumber,
          role: newEmployee.role,
          salary: salary,
          hireDate: hireDate,
        }),
      });

      if (response.ok) {
        const createdEmployee: EmployeeDTO = await response.json();
        setEmployees([...employees, createdEmployee]);
        setNewEmployee({
          fullName: '',
          username: '',
          password: '',
          role: '',
          email: '',
          phoneNumber: '',
          salary: '',
          hireDate: '',
        });
        closeModal();
        toast.success('Employee created successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to create employee:', response.status, response.statusText, errorText);
        toast.error(`Failed to create employee: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      toast.error('An error occurred while creating the employee.');
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
      <PageMeta title="Employee Tables Dashboard" description="Manage employee data with add, view, edit, and reset password functionality" />
      <PageBreadcrumb pageTitle="Employee Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <Button onClick={handleAddEmployee}>Add Employee</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Role</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Email</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Phone</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Salary</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Hire Date</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{employee.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{employee.fullName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{employee.role}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{employee.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{employee.phoneNumber || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {employee.salary.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{employee.hireDate}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <Badge size="sm" color={employee.isActive ? 'success' : 'error'}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu employeeId={employee.id} />
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
              Add New Employee
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a new employee.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    name="fullName"
                    value={newEmployee.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    name="username"
                    value={newEmployee.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    name="password"
                    value={newEmployee.password}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select
                    name="role"
                    value={newEmployee.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Role</option>
                    {Object.values(Role).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={newEmployee.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={newEmployee.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Salary</Label>
                  <Input
                    type="number"
                    name="salary"
                    value={newEmployee.salary}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <Input
                    type="date"
                    name="hireDate"
                    value={newEmployee.hireDate}
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
                Save Employee
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeTable;