import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';

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

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalReports: number;
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

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalReports, onPageChange }) => {
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
        Showing {Math.min((currentPage - 1) * 10 + 1, totalReports)} to {Math.min(currentPage * 10, totalReports)} of {totalReports} entries
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

const ActionMenu: React.FC<{ reportId: string }> = ({ reportId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'View') {
      navigate(`/audit-report/${reportId}`);
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
        </div>
      )}
    </div>
  );
};

const AuditReportTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchFields, setSearchFields] = useState<{
    startDate: string;
    endDate: string;
  }>({ startDate: '', endDate: '' });
  const [newReport, setNewReport] = useState<{ reportDate: string }>({ reportDate: '' });
  const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalReports, setTotalReports] = useState<number>(0);
  const { isOpen, openModal, closeModal } = useModal();
  const itemsPerPage: number = 10;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuditReports = async () => {
      try {
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
          ...(searchFields.startDate && { startDate: searchFields.startDate }),
          ...(searchFields.endDate && { endDate: searchFields.endDate }),
        });

        const response = await fetch(`http://localhost:8080/api/audit-reports?${params}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAuditReports(data.content);
          setTotalPages(data.totalPages);
          setTotalReports(data.totalElements);
        } else {
          console.error('Failed to fetch audit reports:', response.status, response.statusText);
          toast.error('Failed to fetch audit reports. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching audit reports:', error);
        toast.error('An error occurred while fetching audit reports.');
      }
    };

    if (accessToken) {
      fetchAuditReports();
    } else {
      console.error('No access token found');
      toast.warning('Please log in to access audit reports.');
      navigate('/login');
    }
  }, [currentPage, searchFields, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchFields((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateReport = async () => {
    if (!accessToken) {
      toast.error('Please log in to create an audit report.');
      navigate('/login');
      return;
    }

    if (!newReport.reportDate) {
      toast.error('Report date is required.');
      return;
    }

    if (isNaN(new Date(newReport.reportDate).getTime())) {
      toast.error('Invalid report date.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/audit-reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportDate: newReport.reportDate }),
      });

      if (response.ok) {
        toast.success('Audit report created successfully.');
        setNewReport({ reportDate: '' });
        closeModal();
        setCurrentPage(1);
        const fetchResponse = await fetch(`http://localhost:8080/api/audit-reports?page=0&size=${itemsPerPage}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await fetchResponse.json();
        setAuditReports(data.content);
        setTotalPages(data.totalPages);
        setTotalReports(data.totalElements);
      } else {
        const errorText = await response.text();
        console.error('Failed to create audit report:', response.status, response.statusText, errorText);
        toast.error(`Failed to create audit report: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating audit report:', error);
      toast.error('An error occurred while creating audit report.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <PageMeta
        title="Audit Reports Dashboard"
        description="Manage audit reports with date range search and pagination"
      />
      <PageBreadcrumb pageTitle="Audit Reports" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="date"
          name="startDate"
          placeholder="Start Date"
          value={searchFields.startDate}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          value={searchFields.endDate}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <Button onClick={openModal}>Create New Report</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Report Date</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Revenue</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Occupancy Rate</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Created At</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {auditReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{report.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{report.reportDate}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{report.revenue.toFixed(2)} VND</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{(report.occupancyRate).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{new Date(report.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu reportId={report.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalReports={totalReports}
          onPageChange={handlePageChange}
        />
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Create New Audit Report
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter the report date to create a new audit report.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                <div>
                  <Label>Report Date</Label>
                  <Input
                    type="date"
                    name="reportDate"
                    value={newReport.reportDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleCreateReport}>
                Create Report
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default AuditReportTable;