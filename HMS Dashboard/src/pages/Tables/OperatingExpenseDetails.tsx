import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { toast } from 'react-toastify';

enum ExpenseType {
  ELECTRICITY = 'ELECTRICITY',
  WATER = 'WATER',
  INTERNET = 'INTERNET',
  PHONE = 'PHONE',
  INSURANCE = 'INSURANCE',
  TAX = 'TAX',
}

enum ExpenseStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
}

interface OperatingExpense {
  id: number;
  expenseType: string;
  status: string;
  description: string;
  amount: number;
  provider: string;
  dueDate: string;
  createdAt: string;
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

const OperatingExpenseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<OperatingExpense | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpense = async () => {
      if (!accessToken) {
        console.error('No access token found');
        toast.error('Please log in to access expense details.');
        navigate('/login');
        return;
      }

      if (!id || isNaN(parseInt(id))) {
        setError('Invalid expense ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/expenses/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const expense: OperatingExpense = await response.json();
          setFormData(expense);
        } else if (response.status === 404) {
          setError('Expense not found');
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch expense:', response.status, response.statusText, errorText);
          setError(`Failed to fetch expense: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching expense:', error);
        setError('An error occurred while fetching expense data.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id, accessToken, navigate]);

  const handleSave = async () => {
    if (!formData) {
      toast.error('No data to save.');
      return;
    }

    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to update expense.');
      navigate('/login');
      return;
    }

    if (!formData.expenseType || !Object.values(ExpenseType).includes(formData.expenseType as ExpenseType)) {
      toast.error('Valid expense type is required.');
      return;
    }

    if (!formData.status || !Object.values(ExpenseStatus).includes(formData.status as ExpenseStatus)) {
      toast.error('Valid status is required.');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description cannot be empty.');
      return;
    }

    if (isNaN(formData.amount) || formData.amount < 0) {
      toast.error('Valid amount is required.');
      return;
    }

    if (!formData.provider.trim()) {
      toast.error('Provider cannot be empty.');
      return;
    }

    if (!formData.dueDate || isNaN(new Date(formData.dueDate).getTime())) {
      toast.error('Valid due date is required.');
      return;
    }

    if (!formData.createdAt || isNaN(new Date(formData.createdAt).getTime())) {
      toast.error('Valid creation date is required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenseType: formData.expenseType,
          status: formData.status,
          description: formData.description,
          amount: formData.amount,
          provider: formData.provider,
          dueDate: formData.dueDate,
          createdAt: formData.createdAt,
        }),
      });

      if (response.ok) {
        const updatedExpense: OperatingExpense = await response.json();
        setFormData(updatedExpense);
        closeModal();
        toast.success('Expense updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update expense:', response.status, response.statusText, errorText);
        toast.error(`Failed to update expense: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('An error occurred while updating the expense.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: name === 'amount' ? parseFloat(value) || '' : value,
      });
    }
  };

  const getBadgeColor = (status: string): 'success' | 'warning' | 'error' => {
    switch (status) {
      case ExpenseStatus.PAID:
        return 'success';
      case ExpenseStatus.UNPAID:
        return 'error';
      default:
        return 'error';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!formData) {
    return <div>No expense data found.</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Expense Details
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.id}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Expense Type
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.expenseType}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Status
              </p>
              <Badge
                color={getBadgeColor(formData.status)}
                size="sm"
              >
                {formData.status}
              </Badge>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.description}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Amount
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.amount.toFixed(2)} VND
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Provider
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.provider}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Due Date
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(formData.dueDate).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Created At
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(formData.createdAt).toLocaleString()}
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
        <Button onClick={() => navigate("/op-expense")}>Back</Button>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Expense Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update expense details to keep the profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Expense Type</Label>
                  <select
                    name="expenseType"
                    value={formData.expenseType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Expense Type</option>
                    {Object.values(ExpenseType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Status</option>
                    {Object.values(ExpenseStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="text"
                    name="amount"
                    value={formData.amount.toString()}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Provider</Label>
                  <Input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Created At</Label>
                  <Input
                    type="datetime-local"
                    name="createdAt"
                    value={formData.createdAt.slice(0, 16)}
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
    </div>
  );
};

export default OperatingExpenseDetails;