import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { toast } from 'react-toastify';

enum ReceiptStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

interface InventoryDTO {
  id: number;
  name: string;
}

interface SupplierDTO {
  id: number;
  supplierName: string;
  supplierAddress: string;
  supplierPhone: string;
  inventoryItems: InventoryDTO[];
}

interface InventoryReceiptDetailDTO {
  id?: number;
  inventoryId: number;
  inventoryName?: string;
  quantity: number;
  unitPrice?: number;
}

interface InventoryReceiptDTO {
  id?: number;
  receiptCode: string;
  receiptDate: string;
  supplierId: number;
  supplierName?: string;
  status: ReceiptStatus;
  totalAmount?: number;
  details: InventoryReceiptDetailDTO[];
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning';
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
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };
  const sizeStyles: Record<string, string> = {
    sm: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};

const InventoryReceiptDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState<InventoryReceiptDTO | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [selectedInventories, setSelectedInventories] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!accessToken) {
        toast.error('Please log in to access receipt details.');
        navigate('/login');
        return;
      }

      if (!id || isNaN(parseInt(id))) {
        setError('Invalid receipt ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/inventory-receipts/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const receipt: InventoryReceiptDTO = await response.json();
          setFormData(receipt);
          setSelectedInventories(receipt.details.map((d) => d.inventoryId));
          setQuantities(
            receipt.details.reduce((acc, d) => ({ ...acc, [d.inventoryId]: d.quantity }), {})
          );
        } else if (response.status === 404) {
          setError('Receipt not found');
        } else {
          const errorText = await response.text();
          setError(`Failed to fetch receipt: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching receipt:', error);
        setError('An error occurred while fetching receipt data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchSuppliers = async () => {
      if (!accessToken) return;
      try {
        const response = await fetch(`http://localhost:8080/api/suppliers?page=0&size=100`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSuppliers(data.content);
        } else {
          toast.error('Failed to fetch suppliers.');
        }
      } catch (error) {
        console.error('Error fetching suppliers:', error);
        toast.error('An error occurred while fetching suppliers.');
      }
    };

    fetchReceipt();
    fetchSuppliers();
  }, [id, accessToken, navigate]);

  const handleSave = async () => {
    if (!formData) {
      toast.error('No data to save.');
      return;
    }

    if (!accessToken) {
      toast.error('Please log in to update receipt.');
      navigate('/login');
      return;
    }

    if (!formData.receiptCode.trim()) {
      toast.error('Receipt code is required.');
      return;
    }

    if (!formData.supplierId) {
      toast.error('Supplier is required.');
      return;
    }

    if (isNaN(new Date(formData.receiptDate).getTime())) {
      toast.error('Invalid receipt date and time.');
      return;
    }

    const details = selectedInventories.map((inventoryId) => ({
      inventoryId,
      quantity: quantities[inventoryId] || 0,
    }));

    if (details.length === 0) {
      toast.error('At least one inventory item must be selected.');
      return;
    }

    for (const detail of details) {
      if (detail.quantity <= 0) {
        toast.error('Quantity must be greater than 0 for all selected items.');
        return;
      }
    }

    let formattedReceiptDate = formData.receiptDate;
    if (!formData.receiptDate.endsWith(':00')) {
      formattedReceiptDate = `${formData.receiptDate}:00`;
    }

    const payload = {
      receiptCode: formData.receiptCode,
      receiptDate: formattedReceiptDate,
      supplierId: formData.supplierId,
      status: formData.status,
      details,
    };

    console.log('PUT Request Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`http://localhost:8080/api/inventory-receipts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedReceipt: InventoryReceiptDTO = await response.json();
        setFormData(updatedReceipt);
        setSelectedInventories(updatedReceipt.details.map((d) => d.inventoryId));
        setQuantities(
          updatedReceipt.details.reduce((acc, d) => ({ ...acc, [d.inventoryId]: d.quantity }), {})
        );
        closeModal();
        toast.success('Receipt updated successfully.');
      } else {
        const errorText = await response.text();
        let errorMessage = `Failed to update receipt: ${errorText || response.statusText}`;
        if (response.status === 404) {
          errorMessage = 'Receipt not found.';
        } else if (response.status === 400) {
          errorMessage = `Invalid request: ${errorText || 'Check your input data.'}`;
        } else if (response.status === 401) {
          errorMessage = 'Unauthorized: Please log in again.';
          navigate('/login');
        }
        toast.error(errorMessage);
        console.error('PUT Response Error:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error updating receipt:', error);
      toast.error('An error occurred while updating the receipt.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: name === 'supplierId' ? Number(value) : value,
      });
      if (name === 'supplierId') {
        setSelectedInventories([]);
        setQuantities({});
      }
    }
  };

  const handleCheckboxChange = (inventoryId: number, checked: boolean) => {
    setSelectedInventories((prev) =>
      checked ? [...prev, inventoryId] : prev.filter((id) => id !== inventoryId)
    );
    if (!checked) {
      setQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[inventoryId];
        return newQuantities;
      });
    }
  };

  const handleQuantityChange = (inventoryId: number, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [inventoryId]: Number(value),
    }));
  };

  const getBadgeColor = (status: ReceiptStatus): 'success' | 'warning' => {
    return status === ReceiptStatus.COMPLETED ? 'success' : 'warning';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!formData) {
    return <div>No receipt data found.</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Inventory Receipt Details
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">ID</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formData.id}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Receipt Code</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formData.receiptCode}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Receipt Date</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{new Date(formData.receiptDate).toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Supplier Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formData.supplierName}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Status</p>
              <Badge color={getBadgeColor(formData.status)} size="sm">
                {formData.status}
              </Badge>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formData.totalAmount?.toFixed(2) || '0.00'} VND</p>
            </div>
          </div>
          <div className="mt-6">
            <h5 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">Details</h5>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                    <tr>
                      <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Inventory Name</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Quantity</th>
                      <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {formData.details.map((detail, index) => (
                      <tr key={detail.id || index}>
                        <td className="px-5 py-4 text-start text-sm text-gray-800 dark:text-white/90">{detail.inventoryName}</td>
                        <td className="px-5 py-4 text-start text-sm text-gray-800 dark:text-white/90">{detail.quantity}</td>
                        <td className="px-5 py-4 text-start text-sm text-gray-800 dark:text-white/90">${detail.unitPrice?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        <Button onClick={() => navigate("/inventory-receipt")}>Back</Button>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Inventory Receipt Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update receipt details to keep the information up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Receipt Code</Label>
                  <Input
                    type="text"
                    name="receiptCode"
                    value={formData.receiptCode}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Receipt Date and Time</Label>
                  <Input
                    type="datetime-local"
                    name="receiptDate"
                    value={formData.receiptDate.slice(0, 16)} // Remove seconds for input
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value={0}>Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.supplierName}
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
                    {Object.values(ReceiptStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <Label>Inventory Items</Label>
                {formData.supplierId ? (
                  suppliers
                    .find((s) => s.id === formData.supplierId)
                    ?.inventoryItems.map((inventory) => (
                      <div key={inventory.id} className="flex items-center gap-4 mb-4">
                        <input
                          type="checkbox"
                          checked={selectedInventories.includes(inventory.id)}
                          onChange={(e) => handleCheckboxChange(inventory.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="flex-1 text-sm text-gray-800 dark:text-white/90">{inventory.name}</span>
                        {selectedInventories.includes(inventory.id) && (
                          <div className="w-24">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={quantities[inventory.id]?.toString() || ''}
                              onChange={(e) => handleQuantityChange(inventory.id, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    )) || <p className="text-sm text-gray-500">No inventory items available.</p>
                ) : (
                  <p className="text-sm text-gray-500">Please select a supplier to view inventory items.</p>
                )}
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

export default InventoryReceiptDetails;