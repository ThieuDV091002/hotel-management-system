import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
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
  position: string;
  salary: string;
  hireDate: string;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'error';
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

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, openModal, closeModal } = useModal();
  const [employee, setEmployee] = useState<EmployeeDTO | null>(null);
  const [formData, setFormData] = useState<Partial<EmployeeDTO> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to view employee details.');
        navigate('/login');
        return;
      }

      if (!id) {
        setError('Invalid employee ID.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: EmployeeDTO = await response.json();
          setEmployee(data);
          setFormData({
            fullName: data.fullName,
            username: data.username,
            email: data.email,
            phoneNumber: data.phoneNumber,
            isActive: data.isActive,
            role: data.role,
            position: data.position,
            salary: data.salary,
            hireDate: data.hireDate,
          });
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch employee:', response.status, response.statusText, errorText);
          setError(`Failed to fetch employee: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching employee:', error);
        setError('An error occurred while fetching employee details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, accessToken, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return prev;
      if (name === 'isActive') {
        return { ...prev, [name]: value === 'true' };
      }
      if (name === 'role') {
        return { ...prev, role: value as Role, position: value.toLowerCase() };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSave = async () => {
    console.log('handleSave called');
    console.log('accessToken:', accessToken);
    console.log('formData:', formData);
    console.log('employee:', employee);
    if (!accessToken) {
      toast.error('Please log in to update employee.');
      navigate('/login');
      return;
    }

    if (!formData || !employee) {
      toast.error('No employee data to save.');
      return;
    }

    if (!formData.fullName?.trim()) {
      toast.error('Full name is required.');
      return;
    }

    if (!formData.username?.trim()) {
      toast.error('Username is required.');
      return;
    }

    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(formData.username)) {
      toast.error('Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens.');
      return;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Invalid email format.');
      return;
    }

    if (formData.phoneNumber && !/^[\d()-. ]{7,20}$/.test(formData.phoneNumber)) {
    console.log('Validation failed: Invalid phone number');
    toast.error('Phone number must be 7-20 characters and can include digits, (), -, ., and spaces.');
    return;
  }

    if (formData.isActive === undefined) {
      toast.error('Status is required.');
      return;
    }

    if (!formData.role || !Object.values(Role).includes(formData.role as Role)) {
      toast.error('Valid role is required.');
      return;
    }

    const salary = formData.salary !== undefined ? parseFloat(formData.salary) : 0;
    if (formData.salary !== undefined && (isNaN(salary) || salary < 0)) {
      toast.error('Salary must be a non-negative number.');
      return;
    }

    if (!formData.hireDate || isNaN(new Date(formData.hireDate).getTime())) {
      toast.error('Valid hire date is required.');
      return;
    }

    if (!formData.position) {
      toast.error('Position is required.');
      return;
    }

    try {
        const updatedEmployee = {
            fullName: formData.fullName,
            username: formData.username,
            email: formData.email || '',
            phoneNumber: formData.phoneNumber || '',
            isActive: formData.isActive,
            role: formData.role,
            position: formData.position,
            salary: salary.toFixed(2),
            hireDate: formData.hireDate,
        };

        console.log('PUT Body:', JSON.stringify(updatedEmployee, null, 2));

        const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEmployee),
        });

        if (response.ok) {
            const data: EmployeeDTO = await response.json();
            setEmployee(data);
            setFormData({
                fullName: data.fullName,
                username: data.username,
                email: data.email,
                phoneNumber: data.phoneNumber,
                isActive: data.isActive,
                role: data.role,
                position: data.position,
                salary: data.salary,
                hireDate: data.hireDate,
            });
            toast.success('Employee updated successfully.');
            closeModal();
        } else {
            const errorText = await response.text();
            console.error('Failed to update employee:', response.status, response.statusText, errorText);
            if (response.status === 400 && errorText.includes('role')) {
                toast.error('Invalid role value provided.');
            } else if (response.status === 409) {
                toast.error('Username is already taken.');
            } else {
                toast.error(`Failed to update employee: ${errorText || response.statusText}`);
            }
        }
    } catch (error) {
        console.error('Error updating employee:', error);
        toast.error('An error occurred while updating the employee.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !employee) {
    return <div className="text-red-600 dark:text-red-400">{error || 'Employee not found.'}</div>;
  }

  return (
    <>
      <div className="p-5 border bg-white border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Employee Details
            </h4>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Full Name
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {employee.fullName}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Role
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {employee.role}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Username
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {employee.username}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {employee.email || '-'}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Phone Number
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {employee.phoneNumber || '-'}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Salary
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {parseFloat(employee.salary).toLocaleString()} VND
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Hire Date
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {employee.hireDate}
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <Badge size="sm" color={employee.isActive ? 'success' : 'error'}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
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
          <Button onClick={() => navigate("/employee-table")}>Back</Button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Employee Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update employee details to keep the profile up-to-date.
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
                    value={formData?.fullName || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <select
                    name="role"
                    value={formData?.role || ''}
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
                  <Label>Username</Label>
                  <Input
                    type="text"
                    name="username"
                    value={formData?.username || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    name="isActive"
                    value={formData?.isActive?.toString() || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    value={formData?.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData?.phoneNumber || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Salary</Label>
                  <Input
                    type="number"
                    name="salary"
                    value={formData?.salary || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Hire Date</Label>
                  <Input
                    type="date"
                    name="hireDate"
                    value={formData?.hireDate || ''}
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

export default EmployeeDetails;