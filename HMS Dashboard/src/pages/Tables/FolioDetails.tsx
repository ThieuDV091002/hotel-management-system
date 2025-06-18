import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

enum FolioStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  UNPAID = 'UNPAID',
}

interface FolioDTO {
  id: number;
  bookingId: number;
  customerName: string;
  userId: number;
  totalAmount: number;
  status: FolioStatus;
  createdAt: string;
  updatedAt: string;
}

interface FolioChargesDTO {
  id: number;
  folioId: number;
  chargeType: string;
  description: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  chargeTime: string;
}

interface FolioResponseDTO {
  folio: FolioDTO;
  folioCharges: FolioChargesDTO[];
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error';
  size: 'sm';
}

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

const FolioDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<FolioResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFolio = async () => {
      if (!accessToken) {
        console.error('No access token found');
        alert('Please log in to access folio details.');
        navigate('/login');
        return;
      }

      if (!id || isNaN(parseInt(id))) {
        setError('Invalid folio ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/folios/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const folio: FolioResponseDTO = await response.json();
          setFormData(folio);
        } else if (response.status === 404) {
          setError('Folio not found');
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch folio:', response.status, response.statusText, errorText);
          setError(`Failed to fetch folio: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching folio:', error);
        setError('An error occurred while fetching folio data.');
      } finally {
        setLoading(false);
      }
    };

    fetchFolio();
  }, [id, accessToken, navigate]);

  const getBadgeColor = (status: FolioStatus): 'success' | 'warning' | 'error' => {
    switch (status) {
      case FolioStatus.PENDING:
        return 'warning';
      case FolioStatus.PAID:
        return 'success';
      case FolioStatus.UNPAID:
        return 'error';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!formData || !formData.folio) {
    return <div>No folio data found.</div>;
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Folio Details
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.folio.id}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Booking ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.folio.bookingId}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Customer Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.folio.customerName}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                User ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.folio.userId}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Total Amount
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.folio.totalAmount.toFixed(2)} VND
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Status
              </p>
              <Badge
                color={getBadgeColor(formData.folio.status)}
                size="sm"
              >
                {formData.folio.status}
              </Badge>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Created At
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(formData.folio.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Updated At
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {new Date(formData.folio.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Folio Charges
          </h4>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-100 dark:border-white/[0.05]">
                  <tr>
                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Charge Type</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Item Name</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Description</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Quantity</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Unit Price</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Total Price</th>
                    <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Charge Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {formData.folioCharges.length > 0 ? (
                    formData.folioCharges.map((charge) => (
                      <tr key={charge.id}>
                        <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{charge.id}</td>
                        <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{charge.chargeType}</td>
                        <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{charge.itemName}</td>
                        <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                          {charge.description ? charge.description.substring(0, 50) + (charge.description.length > 50 ? '...' : '') : '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{charge.quantity}</td>
                        <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">${charge.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">${charge.totalPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{new Date(charge.chargeTime).toLocaleString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }).replace(',', '')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-3 text-gray-500 text-center text-sm dark:text-gray-400">
                        No charges found for this folio.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
        <Button onClick={() => navigate("/folio")}>Back</Button>
      </div>
    </div>
  );
};

export default FolioDetails;