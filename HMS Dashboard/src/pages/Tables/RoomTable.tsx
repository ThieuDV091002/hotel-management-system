import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { FC } from "react";
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

interface Amenity {
  id: number;
  name: string;
}

interface RoomAmenity {
  amenity: Amenity;
  quantity: number;
}

interface RoomDTO {
  id: number;
  roomName: string;
  description: string;
  image: string;
  price: string;
  capacity: number;
  roomType: RoomType;
  roomStatus: RoomStatus;
  amenities: RoomAmenity[];
  sentAmenityHistories: { id: number }[];
  receivedAmenityHistories: { id: number }[];
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
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

interface FileInputProps {
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput: FC<FileInputProps> = ({ className, onChange }) => {
  return (
    <input
      type="file"
      className={`focus:border-ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 shadow-theme-xs transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pl-3.5 file:pr-3 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden focus:file:ring-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:text-white/90 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 ${className}`}
      onChange={onChange}
    />
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

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
      {children}
    </label>
  );
};

const Badge: React.FC<BadgeProps> = ({ children, color, size, onClick }) => {
  const colorStyles: Record<string, string> = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };
  const sizeStyles: Record<string, string> = {
    sm: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium cursor-pointer ${colorStyles[color]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

const StatusDropdown: React.FC<{
  roomId: number;
  currentStatus: RoomStatus;
  onChangeStatus: (id: number, status: RoomStatus) => void;
}> = ({ roomId, currentStatus, onChangeStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const statusOptions: RoomStatus[] = [RoomStatus.AVAILABLE, RoomStatus.OCCUPIED, RoomStatus.MAINTENANCE, RoomStatus.CLEANING];
  const accessToken = localStorage.getItem('accessToken');

  const handleSelectStatus = async (status: RoomStatus) => {
    if (!accessToken) {
      toast.error('Please log in to update room status.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/rooms/${roomId}/status?status=${status}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onChangeStatus(roomId, status);
        toast.success('Room status updated successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to update room status:', response.status, response.statusText, errorText);
        toast.error(`Failed to update room status: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('An error occurred while updating room status.');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <Badge
        size="sm"
        color={
          currentStatus === RoomStatus.AVAILABLE ? 'success' :
          currentStatus === RoomStatus.OCCUPIED ? 'error' :
          currentStatus === RoomStatus.MAINTENANCE ? 'warning' : 'info'
        }
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentStatus}
      </Badge>
      {isOpen && (
        <div className="absolute z-10 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => handleSelectStatus(status)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                currentStatus === status
                  ? 'bg-gray-200 dark:bg-gray-600'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, totalItems);
  const maxPagesToShow = 10;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxPagesToShow - 1);

    if (end - start + 1 < maxPagesToShow) {
      start = Math.max(1, end - maxPagesToShow + 1);
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

    return pages;
  };

  return (
    <div className="flex flex-col items-center px-6 py-4">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Showing {startEntry} to {endEntry} of {totalItems} entries
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300"
        >
          Previous
        </button>
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={`px-3 py-1 rounded-md ${
              page === currentPage
                ? 'bg-blue-500 text-white'
                : page === '...'
                ? 'bg-transparent text-gray-700 dark:text-gray-300 cursor-default'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
            disabled={page === '...'}
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

const ActionMenu: React.FC<{ roomId: number; onDelete: (id: number) => void }> = ({ roomId, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    setIsDropdownOpen(false);
    if (action === "View") {
      navigate(`/room/${roomId}`);
    } else if (action === "Delete") {
      onDelete(roomId);
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
            onClick={() => handleAction("View")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View
          </button>
          <button
            onClick={() => handleAction("Delete")}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

const RoomTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchParams, setSearchParams] = useState<{
    startDate: string;
    endDate: string;
    roomType: string;
  }>({
    startDate: '',
    endDate: '',
    roomType: '',
  });
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const { isOpen, openModal, closeModal } = useModal();
  const [newRoom, setNewRoom] = useState<{
    roomName: string;
    description: string;
    image: File | null;
    price: string;
    capacity: number;
    roomType: string;
    roomStatus: RoomStatus;
    selectedAmenities: { id: number; quantity: number }[];
  }>({
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
  const [amenitiesLoading, setAmenitiesLoading] = useState<boolean>(false);
  const itemsPerPage: number = 15;
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();

  const fetchAmenities = async () => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to access amenities.');
      return;
    }

    setAmenitiesLoading(true);
    const allAmenities: Amenity[] = [];
    let page = 0;
    const size = 100;

    try {
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
          console.error('Failed to fetch amenities:', response.status, response.statusText, errorText);
          toast.error(`Failed to fetch amenities: ${errorText || response.statusText}`);
          return;
        }

        const data = await response.json();
        const amenities: Amenity[] = data.amenities || [];
        allAmenities.push(...amenities);

        if (amenities.length < size || page >= data.totalPages - 1) {
          break;
        }
        page++;
      }

      setAvailableAmenities(allAmenities);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      toast.error('An error occurred while fetching amenities.');
    } finally {
      setAmenitiesLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAmenities();
    }
  }, [isOpen]);

  const fetchRooms = async (page: number = 0, search: boolean = false) => {
    if (!accessToken) {
      console.error('No access token found');
      toast.error('Please log in to access rooms.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      let url = `http://localhost:8080/api/rooms?page=${page}&size=${itemsPerPage}`;
      if (search && searchParams.startDate && searchParams.endDate) {
        const params = new URLSearchParams({
          startDate: searchParams.startDate,
          endDate: searchParams.endDate,
          page: page.toString(),
          size: itemsPerPage.toString(),
          ...(searchParams.roomType && { roomType: searchParams.roomType.toUpperCase() }),
        });
        url = `http://localhost:8080/api/rooms/search?${params}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data.availableRooms || data.rooms || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch rooms:', response.status, response.statusText, errorText);
        toast.error(`Failed to fetch rooms: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('An error occurred while fetching rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(currentPage - 1, isSearchActive);
  }, [currentPage, isSearchActive]);

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = () => {
    if (!searchParams.startDate || !searchParams.endDate) {
      toast.error('Please provide both start date and end date.');
      return;
    }
    setCurrentPage(1);
    setIsSearchActive(true);
    fetchRooms(0, true);
  };

  const handleResetSearch = () => {
    setSearchParams({
      startDate: '',
      endDate: '',
      roomType: '',
    });
    setCurrentPage(1);
    setIsSearchActive(false);
    fetchRooms(0, false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const handleDeleteRoom = async (roomId: number) => {
    if (!accessToken) {
      toast.error('Please log in to delete room.');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setRooms(rooms.filter((room) => room.id !== roomId));
        setTotalItems(totalItems - 1);
        if (rooms.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        toast.success('Room deleted successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to delete room:', response.status, response.statusText, errorText);
        toast.error(`Failed to delete room: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('An error occurred while deleting the room.');
    }
  };

  const handleChangeStatus = (id: number, status: RoomStatus) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === id ? { ...room, roomStatus: status } : room
      )
    );
  };

  const handleAddRoom = () => {
    openModal();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setNewRoom({ ...newRoom, image: file });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRoom({ ...newRoom, [name]: name === 'capacity' ? parseInt(value) || 1 : value });
  };

  const handleAmenityToggle = (amenityId: number, checked: boolean) => {
    setNewRoom((prev) => {
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
    setNewRoom((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.map((a) =>
        a.id === amenityId ? { ...a, quantity: quantity >= 0 ? quantity : 0 } : a
      ),
    }));
  };

  const handleSave = async () => {
    if (!accessToken) {
      toast.error('Please log in to add room.');
      navigate('/login');
      return;
    }

    if (!newRoom.roomName.trim()) {
      toast.error('Room name is required.');
      return;
    }

    if (!newRoom.price.trim() || isNaN(parseFloat(newRoom.price))) {
      toast.error('Valid price is required.');
      return;
    }

    if (newRoom.capacity < 1) {
      toast.error('Capacity must be at least 1.');
      return;
    }

    if (!newRoom.roomType || !Object.values(RoomType).includes(newRoom.roomType as RoomType)) {
      toast.error('Valid room type is required.');
      return;
    }

    if (!newRoom.roomStatus || !Object.values(RoomStatus).includes(newRoom.roomStatus)) {
      toast.error('Valid room status is required.');
      return;
    }

    try {
      const formData = new FormData();
      const roomRequest = {
        roomName: newRoom.roomName,
        description: newRoom.description,
        price: parseFloat(newRoom.price).toFixed(2),
        capacity: newRoom.capacity,
        roomType: newRoom.roomType,
        roomStatus: newRoom.roomStatus,
        amenityIds: newRoom.selectedAmenities.map((a) => a.id),
        quantities: newRoom.selectedAmenities.map((a) => a.quantity),
      };
      formData.append('room', new Blob([JSON.stringify(roomRequest)], { type: 'application/json' }));
      if (newRoom.image) {
        formData.append('image', newRoom.image);
      }

      const response = await fetch('http://localhost:8080/api/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        const createdRoom: RoomDTO = await response.json();
        setRooms([...rooms, createdRoom]);
        setTotalItems(totalItems + 1);
        setNewRoom({
          roomName: '',
          description: '',
          image: null,
          price: '',
          capacity: 1,
          roomType: '',
          roomStatus: RoomStatus.AVAILABLE,
          selectedAmenities: [],
        });
        closeModal();
        toast.success('Room added successfully.');
      } else {
        const errorText = await response.text();
        console.error('Failed to add room:', response.status, response.statusText, errorText);
        toast.error(`Failed to add room: ${errorText || response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding room:', error);
      toast.error('An error occurred while adding the room.');
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
      <PageMeta
        title="Room Tables Dashboard"
        description="Manage rooms with search, add, and delete functionality"
      />
      <PageBreadcrumb pageTitle="Room Tables" />
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            name="startDate"
            value={searchParams.startDate}
            onChange={handleSearchChange}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            name="endDate"
            value={searchParams.endDate}
            onChange={handleSearchChange}
          />
        </div>
        <div>
          <Label>Room Type</Label>
          <select
            name="roomType"
            value={searchParams.roomType}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="">All Types</option>
            {Object.values(RoomType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleSearch}>Search</Button>
          <Button onClick={handleResetSearch}>Reset</Button>
        </div>
        <div className="flex items-end">
          <Button onClick={handleAddRoom}>Add Room</Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Description</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Price</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Capacity</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Room Type</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Amenities</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-sm dark:text-white/90">#{room.id}</span>
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-sm dark:text-white/90">{room.roomName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{room.description}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{room.price} VND</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{room.capacity}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">{room.roomType}</td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {room.amenities.length} {room.amenities.length === 1 ? 'Amenity' : 'Amenities'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    <StatusDropdown
                      roomId={room.id}
                      currentStatus={room.roomStatus}
                      onChangeStatus={handleChangeStatus}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm dark:text-gray-400">
                    <ActionMenu roomId={room.id} onDelete={handleDeleteRoom} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Add New Room
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Enter details to add a new room.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar max-h-[60vh]">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Room Name</Label>
                  <Input
                    type="text"
                    name="roomName"
                    value={newRoom.roomName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Image</Label>
                  <FileInput onChange={handleFileChange} className="custom-class" />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="text"
                    name="price"
                    value={newRoom.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    name="capacity"
                    value={newRoom.capacity}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>
                <div>
                  <Label>Room Type</Label>
                  <select
                    name="roomType"
                    value={newRoom.roomType}
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
                  <Label>Status</Label>
                  <select
                    name="roomStatus"
                    value={newRoom.roomStatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    {Object.values(RoomStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2 mt-5">
                  <Label>Description</Label>
                  <textarea
                    name="description"
                    value={newRoom.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-700 resize-y"
                    rows={4}
                    placeholder="Enter room description..."
                  />
                </div>
                <div className="lg:col-span-2 mt-5">
                  <Label>Amenities</Label>
                  {amenitiesLoading ? (
                    <div>Loading amenities...</div>
                  ) : availableAmenities.length === 0 ? (
                    <div>No amenities available.</div>
                  ) : (
                    <div className="border rounded-md p-4 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-4 font-medium text-sm text-gray-700 dark:text-gray-200 mb-2">
                        <span>Select</span>
                        <span>Name</span>
                        <span className="text-right">Quantity</span>
                      </div>
                      {availableAmenities.map((amenity) => {
                        const isSelected = newRoom.selectedAmenities.some((a) => a.id === amenity.id);
                        const quantity = isSelected
                          ? newRoom.selectedAmenities.find((a) => a.id === amenity.id)?.quantity || 0
                          : 0;
                        return (
                          <div key={amenity.id} className="grid grid-cols-3 gap-2 items-center mb-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => handleAmenityToggle(amenity.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">{amenity.name}</span>
                            <Input
                              type="number"
                              value={quantity}
                              onChange={(e) => handleAmenityQuantityChange(amenity.id, parseInt(e.target.value) || 0)}
                              min="0"
                              disabled={!isSelected}
                              className="w-full text-right"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Room
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default RoomTable;