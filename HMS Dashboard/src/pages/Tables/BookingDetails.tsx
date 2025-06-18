import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../../components/ui/modal';
import { toast } from 'react-toastify';

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
  id: number;
  customerId: number;
  createdById: number;
  customerFullName: string;
  createdByFullName: string;
  source: BookingSource;
  status: BookingStatus;
  totalPrice: number;
  startDate: string;
  endDate: string;
  roomType: RoomType;
  roomNumber: number;
  adultNumber: number;
  childNumber: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  numberOfDays: number;
  roomIds?: number[] | null;
  serviceUsageIds?: number[] | null;
}

interface RoomDTO {
  id: number; // roomBookingId
  roomId: number;
  roomNumber: string;
  roomType: RoomType | null;
  pricePerNight: number;
  bookingId: number;
}

interface ServiceUsageDTO {
  id: number;
  serviceId: number;
  bookingId: number;
  serviceName: string;
  quantity: number;
  totalPrice: number;
  timestamp: string | null;
}

interface BookingDetailsDTO {
  booking: BookingDTO;
  rooms: RoomDTO[];
  serviceUsages: ServiceUsageDTO[];
}

interface AutoAllocateRequestDTO {
  bookingId: number;
  roomNumber: number;
  roomType: RoomType;
}

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

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'warning' | 'error' | 'info';
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
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  const sizeStyles: Record<string, string> = {
    sm: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

interface RoomActionMenuProps {
  roomBookingId: number;
  bookingId: number;
  setBookingDetails: React.Dispatch<React.SetStateAction<BookingDetailsDTO | null>>;
  onEdit: (roomBookingId: number) => void;
}

const RoomActionMenu: React.FC<RoomActionMenuProps> = ({ roomBookingId, setBookingDetails, onEdit }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessToken');

  const handleAction = async (action: string) => {
    setIsDropdownOpen(false);

    if (!accessToken) {
      toast.error('Please log in to perform this action.');
      navigate('/login');
      return;
    }

    if (action === 'Edit') {
      onEdit(roomBookingId);
    } else if (action === 'Delete') {
      if (!window.confirm('Are you sure you want to delete this room from the booking?')) {
        return;
      }

      try {
        const response = await fetch(`http://localhost:8080/api/room-allocations/room-booking/${roomBookingId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 204) {
          toast.success('Room removed successfully.');
          setBookingDetails((prev) =>
            prev
              ? {
                  ...prev,
                  rooms: prev.rooms.filter((room) => room.id !== roomBookingId),
                }
              : prev
          );
        } else {
          const errorText = await response.text();
          toast.error(`Failed to remove room: ${errorText || response.statusText}`);
        }
      } catch (error) {
        console.error('Error removing room:', error);
        toast.error('An error occurred while removing the room.');
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
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={() => handleAction('Edit')}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Edit
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

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();
  const { isOpen: isAddRoomModalOpen, openModal: openAddRoomModal, closeModal: closeAddRoomModal } = useModal();
  const { isOpen: isEditRoomModalOpen, openModal: openEditRoomModal, closeModal: closeEditRoomModal } = useModal();
  const [bookingDetails, setBookingDetails] = useState<BookingDetailsDTO | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BookingDTO> | null>(null);
  const [newRoomId, setNewRoomId] = useState<string>('');
  const [editRoomBookingId, setEditRoomBookingId] = useState<number | null>(null);
  const [editNewRoomId, setEditNewRoomId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFolioCreated, setIsFolioCreated] = useState<boolean>(false);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const fetchBookingDetails = async () => {
    if (!accessToken) {
      toast.error('Please log in to access booking details.');
      navigate('/login');
      return;
    }

    if (!id || isNaN(parseInt(id))) {
      setError('Invalid booking ID');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: BookingDetailsDTO = await response.json();
        setBookingDetails(data);
        const folioResponse = await fetch(`http://localhost:8080/api/folios/booking/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (folioResponse.ok) {
          const folioData = await folioResponse.json();
          setIsFolioCreated(!!folioData);
        }
      } else if (response.status === 404) {
        setError('Booking not found');
      } else {
        const errorText = await response.text();
        setError(`Failed to fetch booking: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      setError('An error occurred while fetching booking data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id, accessToken, navigate]);

  const handleEdit = () => {
    if (bookingDetails?.booking) {
      setEditFormData({
        startDate: bookingDetails.booking.startDate.split('T')[0],
        endDate: bookingDetails.booking.endDate.split('T')[0],
        roomType: bookingDetails.booking.roomType,
        roomNumber: bookingDetails.booking.roomNumber,
        adultNumber: bookingDetails.booking.adultNumber,
        childNumber: bookingDetails.booking.childNumber,
      });
      openEditModal();
    }
  };

  const handleSaveEdit = async () => {
    if (!editFormData || !bookingDetails) {
      toast.error('No data to save.');
      return;
    }

    if (!accessToken) {
      toast.error('Please log in to update booking.');
      navigate('/login');
      return;
    }

    if (!editFormData.startDate || isNaN(new Date(editFormData.startDate).getTime())) {
      toast.error('Valid start date is required.');
      return;
    }

    if (!editFormData.endDate || isNaN(new Date(editFormData.endDate).getTime())) {
      toast.error('Valid end date is required.');
      return;
    }

    if (new Date(editFormData.endDate) <= new Date(editFormData.startDate)) {
      toast.error('End date must be after start date.');
      return;
    }

    if (!Object.values(RoomType).includes(editFormData.roomType as RoomType)) {
      toast.error('Valid room type is required.');
      return;
    }

    if ((editFormData.roomNumber ?? 0)<= 0) {
      toast.error('Room number must be greater than 0.');
      return;
    }

    if ((editFormData.adultNumber ?? 0) <= 0) {
      toast.error('At least one adult is required.');
      return;
    }

    if ((editFormData.childNumber ?? 0) < 0) {
      toast.error('Child number cannot be negative.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: editFormData.startDate,
          endDate: editFormData.endDate,
          roomType: editFormData.roomType,
          roomNumber: editFormData.roomNumber,
          adultNumber: editFormData.adultNumber,
          childNumber: editFormData.childNumber,
        }),
      });

      if (response.ok) {
        const updatedBooking: BookingDTO = await response.json();
        setBookingDetails({
          ...bookingDetails,
          booking: updatedBooking,
        });
        closeEditModal();
        toast.success('Booking updated successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to update booking: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('An error occurred while updating the booking.');
    }
  };

  const handleAddRoom = () => {
    setNewRoomId('');
    openAddRoomModal();
  };

  const handleSaveRoom = async () => {
    if (!newRoomId) {
      toast.error('Room ID is required.');
      return;
    }

    const roomIdNum = Number(newRoomId);
    if (isNaN(roomIdNum) || roomIdNum <= 0) {
      toast.error('Invalid room ID.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/room-allocations/booking/${id}/room`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomIdNum),
      });

      if (response.status === 201) {
        const newRoom: RoomDTO = await response.json();
        setBookingDetails((prev) =>
          prev
            ? {
                ...prev,
                rooms: [...prev.rooms, newRoom],
              }
            : prev,
        );
        closeAddRoomModal();
        toast.success('Room added successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to add room: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('An error occurred while adding the room.');
    }
  };

  const handleEditRoom = (roomBookingId: number) => {
    setEditRoomBookingId(roomBookingId);
    setEditNewRoomId('');
    openEditRoomModal();
  };

  const handleSaveEditRoom = async () => {
    if (!editNewRoomId || !editRoomBookingId) {
      toast.error('Room ID is required.');
      return;
    }

    const newRoomIdNum = Number(editNewRoomId);
    if (isNaN(newRoomIdNum) || newRoomIdNum <= 0) {
      toast.error('Invalid room ID.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/room-allocations/room-booking/${editRoomBookingId}/room`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRoomIdNum),
      });

      if (response.ok) {
        await fetchBookingDetails();
        closeEditRoomModal();
        toast.success('Room updated successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to update room: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('An error occurred while updating the room.');
    }
  };

  const handleAutoAllocate = async () => {
    if (!bookingDetails) return;

    const request: AutoAllocateRequestDTO = {
      bookingId: bookingDetails.booking.id,
      roomNumber: bookingDetails.booking.roomNumber,
      roomType: bookingDetails.booking.roomType,
    };

    try {
      const response = await fetch(`http://localhost:8080/api/room-allocations/auto-allocate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        await fetchBookingDetails();
        toast.success('Rooms allocated successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to allocate rooms: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error allocating rooms:', error);
      toast.error('An error occurred while allocating rooms.');
    }
  };

  const handleCheckIn = async () => {
    if (!accessToken) {
      toast.error('Please log in to perform this action.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${id}/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 204) {
        await fetchBookingDetails();
        toast.success('Check-in successful.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to check in: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('An error occurred during check-in.');
    }
  };

  const handleCreateFolio = async () => {
    if (!accessToken) {
      toast.error('Please log in to perform this action.');
      navigate('/login');
      return;
    }

    if (!id) {
      toast.error('Invalid booking ID.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/folios', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Number(id)),
      });

      if (response.ok) {
        const folio: FolioDTO = await response.json();
        console.log('Folio created:', folio);
        toast.success('Folio created successfully.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to create folio: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error creating folio:', error);
      toast.error('An error occurred while creating the folio.');
    }
  };

  const handleCheckOut = async () => {
    if (!accessToken) {
      toast.error('Please log in to perform this action.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/housekeeping/checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: Number(id) }),
      });

      if (response.ok) {
        const schedule = await response.json();
        await fetchBookingDetails();
        toast.success('Check-out successful.');
      } else {
        const errorText = await response.text();
        toast.error(`Failed to check out: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error during check-out:', error);
      toast.error('An error occurred during check-out.');
    }
  };

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

  const formatDateTime = (isoString: string | null): string => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(',', '');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  if (!bookingDetails) {
    return <div>No booking data found.</div>;
  }

  const { booking, rooms, serviceUsages } = bookingDetails;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Booking Details
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">ID</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.id}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Customer Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.customerFullName}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Status</p>
              <Badge color={getBadgeColor(booking.status)} size="sm">
                {booking.status}
              </Badge>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Total Price</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.totalPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Start Date</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.startDate.split('T')[0]}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">End Date</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.endDate.split('T')[0]}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Check-In Time</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formatDateTime(booking.checkInTime)}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Check-Out Time</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{formatDateTime(booking.checkOutTime)}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Room Type</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.roomType}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Room Number</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.roomNumber}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Adults</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.adultNumber}</p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">Children</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{booking.childNumber}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {booking.status === BookingStatus.PENDING && (
            <button
              onClick={handleEdit}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:w-auto"
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
          )}
          {booking.status === BookingStatus.CONFIRMED && (
            <Button size="sm" onClick={handleCheckIn}>
              Check In
            </Button>
          )}
          {booking.status === BookingStatus.CHECKIN && (
            <Button size="sm" onClick={handleCheckOut}>
              Check Out
            </Button>
          )}
          {booking.status === BookingStatus.CHECKOUT && !isFolioCreated && (
            <Button size="sm" onClick={handleCreateFolio}>
              Create Folio
            </Button>
          )}
        </div>
      </div>
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-md font-semibold text-gray-800 dark:text-white/90">Rooms</h5>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAutoAllocate}>Auto Allocate</Button>
            <Button size="sm" onClick={handleAddRoom}>Add Room</Button>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] relative overflow-visible">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room Number</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room Type</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Price per Night</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{room.roomId}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{room.roomNumber}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{room.roomType || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{room.pricePerNight.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <RoomActionMenu
                      roomBookingId={room.id}
                      bookingId={booking.id}
                      setBookingDetails={setBookingDetails}
                      onEdit={handleEditRoom}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-8">
        <h5 className="text-md font-semibold text-gray-800 dark:text-white/90 mb-4">Service Usages</h5>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">ID</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Service Name</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Quantity</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Total Price</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {serviceUsages.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{service.id}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{service.serviceName}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{service.quantity}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{service.totalPrice.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{formatDateTime(service.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 mt-6">
        <Button onClick={() => navigate("/booking")}>Back</Button>
      </div>
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Booking Details
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update booking details to keep the information up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    name="startDate"
                    value={editFormData?.startDate || ''}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev!, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    name="endDate"
                    value={editFormData?.endDate || ''}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev!, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Room Type</Label>
                  <select
                    name="roomType"
                    value={editFormData?.roomType || ''}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev!, roomType: e.target.value as RoomType }))}
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
                    value={editFormData?.roomNumber || ''}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev!, roomNumber: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Adult Number</Label>
                  <Input
                    type="number"
                    name="adultNumber"
                    value={editFormData?.adultNumber || ''}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev!, adultNumber: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Child Number</Label>
                  <Input
                    type="number"
                    name="childNumber"
                    value={editFormData?.childNumber || ''}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev!, childNumber: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeEditModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <Modal isOpen={isAddRoomModalOpen} onClose={closeAddRoomModal} className="max-w-[400px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add Room
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter the Room ID to add to the booking.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-y-5">
                <div>
                  <Label>Room ID</Label>
                  <Input
                    type="number"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeAddRoomModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveRoom}>
                Save Room
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <Modal isOpen={isEditRoomModalOpen} onClose={closeEditRoomModal} className="max-w-[400px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-6">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Room
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter the new Room ID for the booking.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-y-5">
                <div>
                  <Label>New Room ID</Label>
                  <Input
                    type="number"
                    value={editNewRoomId}
                    onChange={(e) => setEditNewRoomId(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeEditRoomModal}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEditRoom}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default BookingDetails;