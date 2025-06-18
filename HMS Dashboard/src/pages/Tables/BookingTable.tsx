import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';

enum BookingSource {
  ONLINE = 'ONLINE',
  DIRECT = 'DIRECT',
}

enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  CHECKIN = 'CHECKIN',
  CHECKOUT = 'CHECKOUT',
}

enum RoomType {
  SUITE = 'SUITE',
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TWIN = 'TWIN',
  DELUXE = 'DELUXE',
  FAMILY = 'FAMILY',
}

interface BookingDTO {
  id?: number;
  customerId?: number;
  createdById: number;
  customerFullName?: string;
  createdByFullName?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  source: BookingSource;
  status?: BookingStatus;
  totalPrice?: number;
  startDate: string;
  endDate: string;
  roomType: RoomType;
  roomNumber: number;
  adultNumber: number;
  childNumber: number;
  numberOfDays?: number;
  roomIds?: number[];
  serviceUsageIds?: number[];
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error' | 'info';
  size: 'sm';
  onClick?: () => void;
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

const Badge: React.FC<BadgeProps> = ({ children, color, size, onClick }) => {
  const colorStyles: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  const sizeStyles: Record<string, string> = {
    sm: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={onClick}
    >
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

const ActionMenu: React.FC<{ bookingId: number }> = ({ bookingId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  const handleAction = async (action: string) => {
    setIsDropdownOpen(false);
    if (action === "View") {
      navigate(`/booking/${bookingId}`);
    } else if (action === 'Delete') {
      if (!accessToken) {
        toast.error('Please log in to delete booking.');
        navigate('/login');
        return;
      }

      if (!window.confirm('Are you sure you want to delete this booking?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          toast.success('Booking deleted successfully.');
          window.location.reload();
        } else {
          const errorText = await response.text();
          toast.error(`Failed to delete booking: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting booking:', error);
        toast.error('An error occurred while deleting the booking.');
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

const StatusDropdown: React.FC<{ bookingId: number; currentStatus: BookingStatus; onStatusChange: (bookingId: number, status: string) => void }> = ({ bookingId, currentStatus, onStatusChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getBadgeColor = (status: BookingStatus): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'success';
      case BookingStatus.PENDING:
        return 'warning';
      case BookingStatus.REJECTED:
      case BookingStatus.CANCELLED:
        return 'error';
      case BookingStatus.CHECKIN:
      case BookingStatus.CHECKOUT:
        return 'info';
      default:
        return 'warning';
    }
  };

  const allowedStatuses = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.REJECTED, BookingStatus.CANCELLED];

  const handleStatusSelect = (status: string) => {
    onStatusChange(bookingId, status);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative">
      <Badge
        color={getBadgeColor(currentStatus)}
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        {currentStatus}
      </Badge>
      {isDropdownOpen && (
        <div className="absolute left-0 mt-2 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {allowedStatuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusSelect(status)}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const BookingTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchCustomerFullName, setSearchCustomerFullName] = useState<string>('');
  const [searchStartDate, setSearchStartDate] = useState<string>('');
  const [searchEndDate, setSearchEndDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const { isOpen: isAddModalOpen, openModal: openAddModal, closeModal: closeAddModal } = useModal();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [newBooking, setNewBooking] = useState<BookingDTO>({
    createdById: 0,
    customerId: undefined,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    source: BookingSource.DIRECT,
    startDate: '',
    endDate: '',
    roomType: RoomType.SINGLE,
    roomNumber: 0,
    adultNumber: 1,
    childNumber: 0,
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const statuses = ['All', ...Object.values(BookingStatus)];

  useEffect(() => {
    const fetchBookings = async () => {
      if (!accessToken) {
        toast.error('Please log in to access bookings.');
        navigate('/login');
        return;
      }

      try {
        let url = '';
        const params = new URLSearchParams({
          page: (currentPage - 1).toString(),
          size: itemsPerPage.toString(),
        });

        const isSearchEmpty =
          searchCustomerFullName === '' &&
          searchStartDate === '' &&
          searchEndDate === '' &&
          selectedStatus === 'All';

        if (isSearchEmpty) {
          url = `http://localhost:8080/api/bookings/admin?${params}`;
        } else {
          if (searchCustomerFullName) params.append('customerFullName', searchCustomerFullName);
          if (searchStartDate) params.append('startDate', searchStartDate);
          if (searchEndDate) params.append('endDate', searchEndDate);
          if (selectedStatus !== 'All') params.append('status', selectedStatus);
          url = `http://localhost:8080/api/bookings/admin/search?${params}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: PageResponse<BookingDTO> = await response.json();
          setBookings(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else {
          const errorText = await response.text();
          setError(`Failed to fetch bookings: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('An error occurred while fetching bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentPage, searchCustomerFullName, searchStartDate, searchEndDate, selectedStatus, accessToken, navigate]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleAddBooking = () => {
    if (!user) {
      toast.error('Please log in to add a booking.');
      navigate('/login');
      return;
    }
    setNewBooking({
      createdById: user.id, // Always set to logged-in receptionist's ID
      customerId: undefined,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      source: BookingSource.DIRECT,
      startDate: '',
      endDate: '',
      roomType: RoomType.SINGLE,
      roomNumber: 0,
      adultNumber: 1,
      childNumber: 0,
    });
    openAddModal();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBooking((prev) => ({
      ...prev,
      [name]: name === 'roomNumber' || name === 'adultNumber' || name === 'childNumber' || name === 'customerId' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSaveBooking = async () => {
    if (!accessToken || !user) {
      toast.error('Please log in to add a booking.');
      navigate('/login');
      return;
    }

    if (!newBooking.startDate || isNaN(new Date(newBooking.startDate).getTime())) {
      toast.error('Valid start date is required.');
      return;
    }

    if (!newBooking.endDate || isNaN(new Date(newBooking.endDate).getTime())) {
      toast.error('Valid end date is required.');
      return;
    }

    if (new Date(newBooking.endDate) <= new Date(newBooking.startDate)) {
      toast.error('End date must be after start date.');
      return;
    }

    if (!Object.values(RoomType).includes(newBooking.roomType)) {
      toast.error('Valid room type is required.');
      return;
    }

    if (newBooking.roomNumber <= 0) {
      toast.error('Room number must be greater than 0.');
      return;
    }

    if (newBooking.adultNumber <= 0) {
      toast.error('At least one adult is required.');
      return;
    }

    if (newBooking.childNumber < 0) {
      toast.error('Child number cannot be negative.');
      return;
    }

    // Validate booking cases
    if (newBooking.customerId !== undefined && newBooking.customerId > 0) {
      // Case 1: customerId provided, guest fields should be empty
      if (newBooking.guestName || newBooking.guestEmail || newBooking.guestPhone) {
        toast.error('Guest details must be empty when customer ID is provided.');
        return;
      }
    } else {
      // Case 2: customerId is null, guest fields must be provided
      if (!newBooking.guestName || !newBooking.guestEmail || !newBooking.guestPhone) {
        toast.error('Guest name, email, and phone are required when customer ID is not provided.');
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newBooking.guestEmail)) {
        toast.error('Valid guest email is required.');
        return;
      }
      // Basic phone validation (example: allows digits, +, -, and spaces)
      const phoneRegex = /^[+\d\s-]+$/;
      if (!phoneRegex.test(newBooking.guestPhone)) {
        toast.error('Valid guest phone number is required.');
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:8080/api/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newBooking,
          createdById: user.id, // Ensure createdById is the receptionist's ID
          customerId: newBooking.customerId === undefined || newBooking.customerId === 0 ? null : newBooking.customerId,
        }),
      });

      if (response.ok) {
        const createdBooking: BookingDTO = await response.json();
        setBookings([...bookings, createdBooking]);
        closeAddModal();
        toast.success('Booking created successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to create booking: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('An error occurred while creating the booking.');
    }
  };

  const handleStatusChange = async (bookingId: number, status: string) => {
    if (!accessToken) {
      toast.error('Please log in to update booking status.');
      navigate('/login');
      return;
    }

    if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
      toast.error('Invalid status selected.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/change-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(status),
      });

      if (response.ok) {
        const updatedBooking: BookingDTO = await response.json();
        setBookings(bookings.map((booking) => (booking.id === bookingId ? updatedBooking : booking)));
        toast.success('Booking status updated successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to update booking status: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('An error occurred while updating the booking status.');
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
      <PageMeta title="Booking Tables Dashboard" description="Manage booking data with add, delete, and update status functionality" />
      <PageBreadcrumb pageTitle="Booking Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by customer name..."
          value={searchCustomerFullName}
          onChange={(e) => setSearchCustomerFullName(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="date"
          placeholder="Start Date"
          value={searchStartDate}
          onChange={(e) => setSearchStartDate(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <input
          type="date"
          placeholder="End Date"
          value={searchEndDate}
          onChange={(e) => setSearchEndDate(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button onClick={handleAddBooking}>Add Booking</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Customer Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Start Date</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">End Date</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room Type</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room Number</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 min-w-[100px]">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{booking.id}</td>
                  <td className="px-5 py-4 sm:px-6 text-start text-sm text-gray-800 dark:text-white/90">{booking.customerFullName || booking.guestName || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{new Date(booking.startDate).toISOString().split('T')[0]}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{new Date(booking.endDate).toISOString().split('T')[0]}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{booking.roomType}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{booking.roomNumber}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400 min-w-[100px]">
                    <StatusDropdown
                      bookingId={booking.id!}
                      currentStatus={booking.status!}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400 min-w-[100px]">
                    <ActionMenu bookingId={booking.id!} />
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
      {/* Add Booking Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add New Booking
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to create a new booking.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Customer ID (if registered)</Label>
                  <Input
                    type="number"
                    name="customerId"
                    value={newBooking.customerId ?? ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Guest Name</Label>
                  <Input
                    type="text"
                    name="guestName"
                    value={newBooking.guestName ?? ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Guest Email</Label>
                  <Input
                    type="email"
                    name="guestEmail"
                    value={newBooking.guestEmail ?? ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Guest Phone</Label>
                  <Input
                    type="text"
                    name="guestPhone"
                    value={newBooking.guestPhone ?? ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    name="startDate"
                    value={newBooking.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    name="endDate"
                    value={newBooking.endDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Room Type</Label>
                  <select
                    name="roomType"
                    value={newBooking.roomType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="">Select Room Type</option>
                    {Object.values(RoomType).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Room Number</Label>
                  <Input
                    type="number"
                    name="roomNumber"
                    value={newBooking.roomNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Adult Number</Label>
                  <Input
                    type="number"
                    name="adultNumber"
                    value={newBooking.adultNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Child Number</Label>
                  <Input
                    type="number"
                    name="childNumber"
                    value={newBooking.childNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeAddModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSaveBooking}>
                Save Booking
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default BookingTable;