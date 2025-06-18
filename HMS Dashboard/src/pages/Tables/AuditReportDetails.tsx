import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface AuditReport {
  id: string;
  reportDate: string;
  numberOfBookings: number;
  checkIns: number;
  checkOuts: number;
  revenue: number;
  expenses: number;
  occupancyRate: number;
  roomCapacity: number;
  adr: number;
  revPar: number;
  createdAt: string;
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

const AuditReportDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchAuditReport = async () => {
      if (!accessToken) {
        console.error('No access token found');
        alert('Please log in to access audit report data.');
        navigate('/login');
        return;
      }

      if (!id) {
        setError('Invalid audit report ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/audit-reports/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const report: AuditReport = await response.json();
          setFormData(report);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch audit report:', response.status, response.statusText, errorText);
          setError(`Failed to fetch audit report: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching audit report:', error);
        setError('An error occurred while fetching audit report data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuditReport();
  }, [id, accessToken, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!formData) {
    return <div>No audit report data found.</div>;
  }

  return (
    <div className="p-5 border bg-white border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Audit Report Details
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Report ID
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.id}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Report Date
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.reportDate}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Number of Bookings
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.numberOfBookings}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Check-Ins
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.checkIns}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Check-Outs
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.checkOuts}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.revenue.toFixed(2)} VND
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Expenses
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.expenses.toFixed(2)} VND
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Occupancy Rate
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {(formData.occupancyRate).toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Room Capacity
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.roomCapacity}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ADR
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.adr.toFixed(2)} VND
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                RevPAR
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formData.revPar.toFixed(2)} VND
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
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
        <Button onClick={() => navigate("/audit-report")}>Back</Button>
      </div>
    </div>
  );
};

export default AuditReportDetails;