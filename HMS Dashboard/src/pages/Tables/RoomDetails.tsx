import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, getDay } from 'date-fns';
import { eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { isWithinInterval } from 'date-fns/isWithinInterval';
import { parseISO } from 'date-fns/parseISO';
import { toast } from 'react-toastify';

enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
  CLEANING = 'CLEANING',
}

enum RoomType {
  SUITE = 'SUITE',
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TWIN = 'TWIN',
  DELUXE = 'DELUXE',
  FAMILY = 'FAMILY',
}

enum AmenityStatus {
  WORKING = 'WORKING',
  BROKEN = 'BROKEN',
}

interface Amenity {
  id: number;
  name: string;
}

interface RoomAmenityDTO {
  id: number;
  amenityId: number;
  amenityName: string;
  quantity: number;
  status: 'BROKEN' | 'WORKING';
}

interface BookingDTO {
  id: number;
  startDate: string;
  endDate: string;
  bookingId: string;
}

interface RoomDTO {
  id: number;
  roomName: string;
  description: string;
  imageUrl: string;
  price: string;
  capacity: number;
  roomType: RoomType;
  roomStatus: RoomStatus;
  amenities?: RoomAmenityDTO[];
  bookings?: BookingDTO[];
}

interface ButtonProps {
  size?: 'sm';
  variant?: 'outline' | 'filled';
  onClick: () => void;
  children: React.ReactNode;
}

interface LabelProps {
  children?: React.ReactNode;
}

interface BadgeProps {
  children: React.ReactNode;
  color: 'success' | 'error';
  size: 'sm';
}

const Button: React.FC<ButtonProps> = ({ size = 'sm', variant = 'filled', onClick, children }) => {
  const baseStyles = 'px-4 py-2 rounded-md text-sm font-medium';
  const sizeStyles = size === 'sm' ? 'text-sm' : '';
  const variantStyles =
    variant === 'outline'
      ? 'border border-gray-600 text-gray-800 hover:bg-gray-100 dark:border-gray-400 dark:text-gray-300 dark:hover:bg-gray-700'
      : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600';
  return (
    <button className={`${baseStyles} ${sizeStyles} ${variantStyles}`} onClick={onClick}>
      {children}
    </button>
  );
};

const Input: React.FC<{
  type: string;
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  min?: string | number;
  className?: string;
  disabled?: boolean;
}> = ({ type, value, onChange, name, min, className, disabled }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      name={name}
      min={min}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 ${className || ''}`}
      disabled={disabled}
    />
  );
};

const Label: React.FC<LabelProps> = ({ children }) => {
  return (
    <label className="block mb-1 text-xs font-semibold text-gray-600 dark:text-gray-300">{children}</label>
  );
};

const Badge: React.FC<BadgeProps> = ({ children, color, size }) => {
  const colorStyles: Record<string, string> = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };
  const sizeStyles: Record<string, string> = {
    sm: 'px-2.5 py-0.5 text-xs',
  };
  return (
    <span className={`inline-block rounded-full font-medium ${colorStyles[color]} ${sizeStyles[size]}`}>
      {children}
    </span>
  );
};

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isOpen, openModal, closeModal } = useModal();
  const [room, setRoom] = useState<RoomDTO | null>(null);
  const [formData, setFormData] = useState<RoomData>({
    roomName: '',
    description: '',
    image: null,
    price: '',
    capacity: 1,
    roomType: '',
    roomStatus: RoomStatus.AVAILABLE,
    selectedAmenities: [],
  });
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 4, 1));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddAmenityModalOpen, setIsAddAmenityModalOpen] = useState(false);
  const [isEditAmenityModalOpen, setIsEditAmenityModalOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<RoomAmenityDTO | null>(null);
  const [newAmenity, setNewAmenity] = useState<{ amenityId: number; quantity: number; status: AmenityStatus }>({
    amenityId: 0,
    quantity: 1,
    status: AmenityStatus.WORKING,
  });
  const [editAmenity, setEditAmenity] = useState<{ quantity: number; status: AmenityStatus }>({
    quantity: 1,
    status: AmenityStatus.WORKING,
  });
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  interface RoomData {
    roomName: string;
    description: string;
    image: File | null;
    price: string;
    capacity: number;
    roomType: string;
    roomStatus: RoomStatus;
    selectedAmenities: { id: number; quantity: number }[];
  }

  const fetchRoom = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to view room details.');
      navigate('/login');
      return;
    }

    if (!id || isNaN(parseInt(id))) {
      console.error('Invalid room ID:', id);
      toast.error('Invalid room ID.');
      setError('Invalid room ID.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/rooms/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: any = await response.json();
        console.log('Raw Room API Response:', data);
        console.log('Amenities:', data.amenities);
        console.log('Bookings:', data.bookings);

        const amenities = Array.isArray(data.amenities) ? data.amenities : [];
        const bookings = Array.isArray(data.bookings) ? data.bookings : [];

        const invalidAmenities = amenities.filter((ra: any) => !ra || !ra.amenity || !ra.amenity.id);
        if (invalidAmenities.length > 0) {
          console.warn('Invalid amenities found:', invalidAmenities);
        }

        const validAmenities = amenities.map((ra: any) => ({
          id: ra.id || 0,
          amenityId: ra.amenityId || 0,
          amenityName: ra.amenityName || 'Unknown Amenity',
          quantity: ra.quantity || 1,
          status: ra.status || 'WORKING',
        })).filter((ra: RoomAmenityDTO) => ra.amenityId !== 0);

        const validBookings = bookings.map((b: any) => ({
          id: b.id || 0,
          startDate: b.startDate || '',
          endDate: b.endDate || '',
          bookingId: b.bookingId || b.bookingID || `Booking-${b.id || 'unknown'}`,
        })).filter((b: BookingDTO) => b.startDate && b.endDate && b.bookingId);

        if (bookings.length !== validBookings.length) {
          console.warn('Invalid bookings filtered out:', bookings.filter((b: any) => !b.startDate || !b.endDate));
        }

        const roomData: RoomDTO = {
          id: data.id || 0,
          roomName: data.roomName || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          price: data.price || '',
          capacity: data.capacity || 1,
          roomType: data.roomType || RoomType.TWIN,
          roomStatus: data.roomStatus || RoomStatus.AVAILABLE,
          amenities: validAmenities,
          bookings: validBookings,
        };

        setRoom(roomData);
        setFormData({
          roomName: data.roomName || '',
          description: data.description || '',
          image: null,
          price: data.price || '',
          capacity: data.capacity || 1,
          roomType: data.roomType || '',
          roomStatus: data.roomStatus || RoomStatus.AVAILABLE,
          selectedAmenities: validAmenities.map((ra: RoomAmenityDTO) => ({
            id: ra.amenityId,
            quantity: ra.quantity,
          })),
        });
      } else {
        const errorText = await response.text();
        const errorMessage = `Failed to fetch room: ${response.status} ${response.statusText}: ${errorText || 'No details'}`;
        console.error(errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = `Error fetching room: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmenities = async () => {
    if (!accessToken) {
      console.error('No access token found for fetching amenities');
      toast.error('Please log in to access amenities.');
      return;
    }

    try {
      let page = 0;
      const size = 100;
      const allAmenities: Amenity[] = [];

      while (true) {
        const response = await fetch(`http://localhost:8080/api/amenities?page=${page}&size=${size}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch amenities:', response.status, errorText);
          toast.error(`Failed to fetch amenities: ${response.status}`);
          return;
        }

        const data = await response.json();
        const amenities: Amenity[] = Array.isArray(data.amenities) ? data.amenities : [];
        allAmenities.push(...amenities);

        if (amenities.length < size || page >= (data.totalPages - 1 || 0)) break;
        page++;
      }

      console.log('Fetched amenities:', allAmenities);
      setAvailableAmenities(allAmenities);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      toast.error('Error fetching amenities.');
    }
  };

  const addRoomAmenity = async () => {
    if (!accessToken) {
      toast.error('Please log in to add amenity.');
      return;
    }

    if (!newAmenity.amenityId) {
      toast.error('Please select an amenity.');
      return;
    }

    if (newAmenity.quantity < 1) {
      toast.error('Quantity must be at least 1.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/rooms/${id}/amenities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amenityId: newAmenity.amenityId,
          quantity: newAmenity.quantity,
          status: newAmenity.status,
        }),
      });

      if (response.ok) {
        const addedAmenity: RoomAmenityDTO = await response.json();
        setRoom((prev) => ({
          ...prev!,
          amenities: [...(prev?.amenities || []), addedAmenity],
        }));
        setNewAmenity({ amenityId: 0, quantity: 1, status: AmenityStatus.WORKING });
        setIsAddAmenityModalOpen(false);
        toast.success('Amenity added successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to add amenity:', response.status, errorText);
        toast.error(`Failed to add amenity: ${errorText || response.status}`);
      }
    } catch (error) {
      console.error('Error adding amenity:', error);
      toast.error('Error adding amenity.');
    }
  };

  const updateRoomAmenity = async () => {
    if (!accessToken || !selectedAmenity) {
      toast.error('Please log in to update amenity.');
      return;
    }

    if (editAmenity.quantity < 1) {
      toast.error('Quantity must be at least 1.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/rooms/${id}/amenities/${selectedAmenity.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: editAmenity.quantity,
          status: editAmenity.status,
        }),
      });

      if (response.ok) {
        const updatedAmenity: RoomAmenityDTO = await response.json();
        setRoom((prev) => ({
          ...prev!,
          amenities: (prev?.amenities || []).map((ra) =>
            ra.id === updatedAmenity.id ? updatedAmenity : ra,
          ),
        }));
        setIsEditAmenityModalOpen(false);
        setSelectedAmenity(null);
        toast.success('Amenity updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update amenity:', response.status, errorText);
        toast.error(`Failed to update amenity: ${errorText || response.status}`);
      }
    } catch (error) {
      console.error('Error updating amenity:', error);
      toast.error('Error updating amenity.');
    }
  };

  const deleteRoomAmenity = async (amenityId: number) => {
    if (!accessToken) {
      toast.error('Please log in to delete amenity.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/rooms/${id}/amenities/${amenityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setRoom((prev) => ({
          ...prev!,
          amenities: (prev?.amenities || []).filter((ra) => ra.id !== amenityId),
        }));
        setActionMenuId(null);
        toast.success('Amenity deleted successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to delete amenity:', response.status, errorText);
        toast.error(`Failed to delete amenity: ${errorText || response.status}`);
      }
    } catch (error) {
      console.error('Error deleting amenity:', error);
      toast.error('Error deleting amenity.');
    }
  };

  useEffect(() => {
    fetchRoom();
    fetchAmenities();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'capacity' ? parseInt(value) || 1 : value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
  };

  const handleAmenityToggle = (amenityId: number, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          selectedAmenities: [...prev.selectedAmenities, { id: amenityId, quantity: 1 }],
        };
      }
      return {
        ...prev,
        selectedAmenities: prev.selectedAmenities.filter((a) => a.id !== amenityId),
      };
    });
  };

  const handleAmenityQuantityChange = (amenityId: number, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.map((a) =>
        a.id === amenityId ? { ...a, quantity: quantity >= 1 ? quantity : 1 } : a,
      ),
    }));
  };

  const handleSaveRoom = async () => {
    if (!accessToken) {
      console.error('No access token found for updating room');
      toast.error('Please log in to update room.');
      navigate('/login');
      return;
    }

    if (!formData.roomName.trim()) {
      toast.error('Room name is required.');
      return;
    }

    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
      toast.error('Valid price is required.');
      return;
    }

    if (formData.capacity < 1) {
      toast.error('Capacity must be at least 1.');
      return;
    }

    if (!formData.roomType || !Object.values(RoomType).includes(formData.roomType as RoomType)) {
      toast.error('Valid room type is required.');
      return;
    }

    if (!formData.roomStatus || !Object.values(RoomStatus).includes(formData.roomStatus)) {
      toast.error('Valid room status is required.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      const roomRequest = {
        roomName: formData.roomName,
        description: formData.description,
        price: parseFloat(formData.price).toFixed(2),
        capacity: formData.capacity,
        roomType: formData.roomType,
        roomStatus: formData.roomStatus,
        amenityIds: formData.selectedAmenities.map((a) => a.id),
        quantities: formData.selectedAmenities.map((a) => a.quantity),
      };
      formDataToSend.append('room', new Blob([JSON.stringify(roomRequest)], { type: 'application/json' }));
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      console.log('Sending update room request:', { roomRequest, hasImage: !!formData.image });

      const response = await fetch(`http://localhost:8080/api/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedRoom: any = await response.json();
        console.log('Room updated successfully:', updatedRoom);

        const amenities = Array.isArray(updatedRoom.amenities) ? updatedRoom.amenities : [];
        const bookings = Array.isArray(updatedRoom.bookings) ? updatedRoom.bookings : [];

        const validAmenities = amenities.map((ra: any) => ({
          id: ra.id || 0,
          amenityId: ra.amenityId || 0,
          amenityName: ra.amenityName || 'Unknown Amenity',
          quantity: ra.quantity || 1,
          status: ra.status || 'WORKING',
        })).filter((ra: RoomAmenityDTO) => ra.amenityId !== 0);

        const validBookings = bookings.map((b: any) => ({
          id: b.id || 0,
          startDate: b.startDate || '',
          endDate: b.endDate || '',
          bookingId: b.bookingId || b.bookingID || `Booking-${b.id || 'unknown'}`,
        })).filter((b: BookingDTO) => b.startDate && b.endDate && b.bookingId);

        const roomData: RoomDTO = {
          id: updatedRoom.id || 0,
          roomName: updatedRoom.roomName || '',
          description: updatedRoom.description || '',
          imageUrl: updatedRoom.imageUrl || '',
          price: updatedRoom.price || '',
          capacity: updatedRoom.capacity || 1,
          roomType: updatedRoom.roomType || RoomType.TWIN,
          roomStatus: updatedRoom.roomStatus || RoomStatus.AVAILABLE,
          amenities: validAmenities,
          bookings: validBookings,
        };

        setRoom(roomData);
        setFormData({
          roomName: updatedRoom.roomName || '',
          description: updatedRoom.description || '',
          image: null,
          price: updatedRoom.price || '',
          capacity: updatedRoom.capacity || 1,
          roomType: updatedRoom.roomType || '',
          roomStatus: updatedRoom.roomStatus || RoomStatus.AVAILABLE,
          selectedAmenities: validAmenities.map((ra: RoomAmenityDTO) => ({
            id: ra.amenityId,
            quantity: ra.quantity,
          })),
        });
        toast.success('Room updated successfully.');
        closeModal();
      } else {
        const errorText = await response.text();
        const errorMessage = `Failed to update room: ${response.status} ${response.statusText}: ${errorText || 'No details'}`;
        console.error(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage = `Error updating room: ${error instanceof Error ? error.message : 'Unknown error'}`;
      console.error(errorMessage, error);
      toast.error(errorMessage);
    }
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const firstDayOfMonth = getDay(start);

  const getBookingsForDay = (day: Date) => {
    if (!room || !room.bookings) return [];
    return room.bookings.filter((booking) => {
      try {
        const start = parseISO(booking.startDate);
        const end = parseISO(booking.endDate);
        return isWithinInterval(day, { start, end });
      } catch (e) {
        console.warn(`Invalid date format for booking ${booking.bookingId}:`, booking);
        return false;
      }
    });
  };

  const openEditAmenityModal = (amenity: RoomAmenityDTO) => {
    setSelectedAmenity(amenity);
    setEditAmenity({
      quantity: amenity.quantity,
      status: amenity.status as AmenityStatus,
    });
    setIsEditAmenityModalOpen(true);
  };

  const toggleActionMenu = (amenityId: number) => {
    setActionMenuId(actionMenuId === amenityId ? null : amenityId);
  };

  if (loading) {
    return <div className="p-6 text-gray-800 dark:text-white">Loading...</div>;
  }

  if (error || !room) {
    return <div className="p-6 text-red-600 dark:text-red-400">{error || 'Room not found.'}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="p-6 border bg-white border-gray-200 rounded-2xl dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Room Details</h4>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Room Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{room.roomName}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Description</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{room.description}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Price</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{room.price} VND / night</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Capacity</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{room.capacity}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Room Type</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{room.roomType}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Status</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{room.roomStatus}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold text-gray-600 dark:text-gray-300">Image</p>
              <img
                width={150}
                height={150}
                src={`http://localhost:8080${room.imageUrl}`}
                alt={room.roomName || 'Room Image'}
                className="w-60 h-40 rounded-md object-cover"
              />
            </div>
            <div className="mt-8">
              <h5 className="text-md font-semibold text-gray-800 dark:text-white mb-4">Booking Calendar</h5>
              <div className="flex justify-between items-center mb-4">
                <Button size="sm" variant="outline" onClick={prevMonth}>
                  Previous Month
                </Button>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button size="sm" variant="outline" onClick={nextMonth}>
                  Next Month
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {day}
                  </div>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div
                    key={`empty-${currentMonth.getTime()}-${index}`}
                    className="p-3 text-sm rounded-full bg-gray-200 dark:bg-gray-700 invisible"
                  />
                ))}
                {days.map((day, index) => {
                  const bookings = getBookingsForDay(day);
                  const isBooked = bookings.length > 0;
                  return (
                    <div
                      key={`day-${currentMonth.getTime()}-${index}`}
                      className={`p-3 text-sm rounded-sm ${
                        isBooked
                          ? 'bg-red-100 text-red-800 dark:bg-red-600 dark:text-red-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white'
                      }`}
                      title={isBooked ? `Bookings: ${bookings.map((b) => b.bookingId).join(', ')}` : ''}
                    >
                      {format(day, 'd')}
                      {isBooked && (
                        <div className="text-xs mt-1">
                          {bookings.map((booking) => (
                            <div key={booking.id}>{booking.bookingId}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-md font-semibold text-gray-800 dark:text-white">Amenities</h5>
                <Button size="sm" onClick={() => setIsAddAmenityModalOpen(true)}>
                  Add Amenity
                </Button>
              </div>
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600">
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Amenity
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {(room.amenities || []).length > 0 ? (
                        (room.amenities ?? []).map((ra) => (
                          <tr key={ra.id}>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                              {ra.amenityName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{ra.quantity}</td>
                            <td className="px-4 py-3 text-sm">
                              <Badge size="sm" color={ra.status === AmenityStatus.WORKING ? 'success' : 'error'}>
                                {ra.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm relative">
                              <button
                                onClick={() => toggleActionMenu(ra.id)}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                                aria-label="Amenity actions"
                              >
                                …
                              </button>
                              {actionMenuId === ra.id && (
                                <div className="absolute right-4 z-50 bg-white dark:bg-gray-200 border border-gray-200 dark:border-gray-600 shadow-lg rounded-md py-2 w-32">
                                  <button
                                    onClick={() => openEditAmenityModal(ra)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteRoomAmenity(ra.id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 text-center"
                          >
                            No amenities assigned.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 lg:w-auto"
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
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button onClick={() => navigate('/room-table')}>Back</Button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-6 overflow-y-auto bg-white rounded-lg dark:bg-gray-900 lg:p-8">
          <div className="px-2">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white">Edit Room Details</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-300">Update room details and amenities.</p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <Label>Room Name</Label>
                  <Input
                    type="text"
                    name="roomName"
                    value={formData.roomName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Image</Label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    accept="image/*"
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Room Type</Label>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
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
                  <Label>Status</Label>
                  <select
                    name="roomStatus"
                    value={formData.roomStatus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                  >
                    <option value="">Select Status</option>
                    {Object.values(RoomStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2 mt-4">
                  <Label>Amenities</Label>
                  <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
                    {availableAmenities.length === 0 ? (
                      <div className="text-sm text-gray-600 dark:text-gray-300">No amenities available.</div>
                    ) : (
                      availableAmenities.map((amenity) => {
                        const isSelected = formData.selectedAmenities.some((a) => a.id === amenity.id);
                        const quantity = isSelected
                          ? formData.selectedAmenities.find((a) => a.id === amenity.id)?.quantity || 1
                          : 1;
                        return (
                          <div key={amenity.id} className="flex items-center gap-4 mb-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleAmenityToggle(amenity.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-800 dark:text-white">{amenity.name}</span>
                            {isSelected && (
                              <div className="flex items-center gap-2">
                                <Label>Quantity</Label>
                                <Input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) =>
                                    handleAmenityQuantityChange(amenity.id, parseInt(e.target.value) || 1)
                                  }
                                  min="1"
                                  className="w-20"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSaveRoom}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
      <Modal isOpen={isAddAmenityModalOpen} onClose={() => setIsAddAmenityModalOpen(false)} className="max-w-md m-4">
        <div className="relative w-full p-6 bg-white rounded-lg dark:bg-gray-900">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Add Amenity</h4>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Amenity</Label>
              <select
                value={newAmenity.amenityId}
                onChange={(e) => setNewAmenity({ ...newAmenity, amenityId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                <option value={0}>Select Amenity</option>
                {availableAmenities.map((amenity) => (
                  <option key={amenity.id} value={amenity.id}>
                    {amenity.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={newAmenity.quantity}
                onChange={(e) => setNewAmenity({ ...newAmenity, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full"
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={newAmenity.status}
                onChange={(e) => setNewAmenity({ ...newAmenity, status: e.target.value as AmenityStatus })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                {Object.values(AmenityStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button size="sm" variant="outline" onClick={() => setIsAddAmenityModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={addRoomAmenity}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isEditAmenityModalOpen}
        onClose={() => {
          setIsEditAmenityModalOpen(false);
          setSelectedAmenity(null);
        }}
        className="max-w-md m-4"
      >
        <div className="relative w-full p-6 bg-white rounded-lg dark:bg-gray-900">
          <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Edit Amenity</h4>
          <div className="flex flex-col gap-4">
            <div>
              <Label>Amenity</Label>
              <Input
                type="text"
                value={selectedAmenity?.amenityName || ''}
                disabled={true}
                className="w-full bg-gray-100 dark:bg-gray-700"
              />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={editAmenity.quantity}
                onChange={(e) => setEditAmenity({ ...editAmenity, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full"
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={editAmenity.status}
                onChange={(e) => setEditAmenity({ ...editAmenity, status: e.target.value as AmenityStatus })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              >
                {Object.values(AmenityStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditAmenityModalOpen(false);
                  setSelectedAmenity(null);
                }}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={updateRoomAmenity}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomDetails;
