import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';
import StarRating from '../components/StarRating';
import { AuthContext } from '../context/AuthProvider';

const RoomDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [searchFormData, setSearchFormData] = useState({
    checkIn: '',
    checkOut: '',
    roomType: '',
    numberOfRooms: 1,
  });
  const [bookingFormData, setBookingFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    roomType: '',
    roomNumber: 1,
    adultNumber: 1,
    childrenNumber: 0,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearchSubmitting, setIsSearchSubmitting] = useState(false);

  const validRoomTypes = ['SINGLE', 'DOUBLE', 'TWIN', 'DELUXE', 'SUITE', 'FAMILY'];
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/rooms/${id}`);
        setRoom(response.data);
        setSearchFormData((prev) => ({
          ...prev,
          roomType: response.data.roomType || validRoomTypes[0],
        }));
        setBookingFormData((prev) => ({
          ...prev,
          roomType: response.data.roomType || validRoomTypes[0],
          guestName: user?.fullName || '',
          guestEmail: user?.email || '',
          guestPhone: user?.phone || '',
        }));
      } catch (error) {
        console.error('Error fetching room:', error);
        setRoom(null);
        toast.error('Failed to load room details', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };

    fetchRoom();
  }, [id, user]);

  const handleSearchFormChange = (e) => {
    const { name, value } = e.target;
    setSearchFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSearchSubmitting(true);

    if (!searchFormData.checkIn || !searchFormData.checkOut) {
      setError('Vui lòng chọn ngày nhận phòng và ngày trả phòng.');
      toast.error('Vui lòng chọn ngày nhận phòng và ngày trả phòng.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSearchSubmitting(false);
      return;
    }

    const checkInDate = new Date(searchFormData.checkIn);
    const checkOutDate = new Date(searchFormData.checkOut);
    const todayDate = new Date(today);

    if (checkInDate < todayDate) {
      setError('Ngày nhận phòng không thể là ngày trong quá khứ.');
      toast.error('Ngày nhận phòng không thể là ngày trong quá khứ.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSearchSubmitting(false);
      return;
    }

    if (checkOutDate <= checkInDate) {
      setError('Ngày trả phòng phải sau ngày nhận phòng.');
      toast.error('Ngày trả phòng phải sau ngày nhận phòng.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSearchSubmitting(false);
      return;
    }

    if (!validRoomTypes.includes(searchFormData.roomType)) {
      setError(`Loại phòng không hợp lệ. Vui lòng chọn một trong các loại sau: ${validRoomTypes.join(', ')}.`);
      toast.error('Loại phòng không hợp lệ.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSearchSubmitting(false);
      return;
    }

    if (searchFormData.numberOfRooms < 1) {
      setError('Số lượng phòng phải ít nhất là 1.');
      toast.error('Số lượng phòng phải ít nhất là 1.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSearchSubmitting(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/api/rooms/availability', {
        params: {
          startDate: searchFormData.checkIn,
          endDate: searchFormData.checkOut,
          roomType: searchFormData.roomType,
          numberOfRooms: searchFormData.numberOfRooms,
        },
      });

      if (response.data) {
        toast.success('Phòng có sẵn! Bạn có thể tiến hành đặt phòng.', {
          position: 'top-right',
          autoClose: 3000,
        });
        setBookingFormData((prev) => ({
          ...prev,
          checkInDate: searchFormData.checkIn,
          checkOutDate: searchFormData.checkOut,
          roomType: searchFormData.roomType,
          roomNumber: searchFormData.numberOfRooms,
        }));
      } else {
        toast.error('Không đủ phòng trống cho yêu cầu của bạn.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Lỗi khi kiểm tra phòng trống. Vui lòng thử lại.', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSearchSubmitting(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!bookingFormData.checkInDate || !bookingFormData.checkOutDate) {
      setError('Vui lòng chọn ngày nhận phòng và ngày trả phòng.');
      toast.error('Vui lòng chọn ngày nhận phòng và ngày trả phòng.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    const checkInDate = new Date(bookingFormData.checkInDate);
    const checkOutDate = new Date(bookingFormData.checkOutDate);
    const todayDate = new Date(today);

    if (checkInDate < todayDate) {
      setError('Ngày nhận phòng không thể là ngày trong quá khứ.');
      toast.error('Ngày nhận phòng không thể là ngày trong quá khứ.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    if (checkOutDate <= checkInDate) {
      setError('Ngày trả phòng phải sau ngày nhận phòng.');
      toast.error('Ngày trả phòng phải sau ngày nhận phòng.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    if (!validRoomTypes.includes(bookingFormData.roomType)) {
      setError(`Loại phòng không hợp lệ. Vui lòng chọn một trong các loại sau: ${validRoomTypes.join(', ')}.`);
      toast.error('Loại phòng không hợp lệ.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    if (bookingFormData.roomNumber < 1) {
      setError('Số lượng phòng phải ít nhất là 1.');
      toast.error('Số lượng phòng phải ít nhất là 1.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    if (bookingFormData.adultNumber < 1) {
      setError('Số lượng người lớn phải ít nhất là 1.');
      toast.error('Số lượng người lớn phải ít nhất là 1.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    if (bookingFormData.childrenNumber < 0) {
      setError('Số lượng trẻ em không thể nhỏ hơn 0.');
      toast.error('Số lượng trẻ em không thể nhỏ hơn 0.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    if (!isAuthenticated) {
      if (!bookingFormData.guestName || !bookingFormData.guestEmail || !bookingFormData.guestPhone) {
        setError('Vui lòng cung cấp tên, email và số điện thoại để đặt phòng.');
        toast.error('Vui lòng cung cấp tên, email và số điện thoại để đặt phòng.', {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsSubmitting(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingFormData.guestEmail)) {
        setError('Vui lòng nhập email hợp lệ.');
        toast.error('Vui lòng nhập email hợp lệ.', {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsSubmitting(false);
        return;
      }
      const phoneRegex = /^[+\d\s-]+$/;
      if (!phoneRegex.test(bookingFormData.guestPhone)) {
        setError('Vui lòng nhập số điện thoại hợp lệ.');
        toast.error('Vui lòng nhập số điện thoại hợp lệ.', {
          position: 'top-right',
          autoClose: 3000,
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const bookingPayload = {
        roomType: bookingFormData.roomType,
        source: 'ONLINE',
        startDate: bookingFormData.checkInDate,
        endDate: bookingFormData.checkOutDate,
        roomNumber: parseInt(bookingFormData.roomNumber, 10),
        adultNumber: parseInt(bookingFormData.adultNumber, 10),
        childNumber: parseInt(bookingFormData.childrenNumber, 10),
      };

      if (isAuthenticated) {
        bookingPayload.customerId = user.id;
        bookingPayload.createdById = user.id;
      } else {
        bookingPayload.guestName = bookingFormData.guestName;
        bookingPayload.guestEmail = bookingFormData.guestEmail;
        bookingPayload.guestPhone = bookingFormData.guestPhone;
      }

      const token = localStorage.getItem('accessToken');
      const response = await axios.post('http://localhost:8080/api/bookings', bookingPayload, {
        headers: isAuthenticated ? { Authorization: `Bearer ${token}` } : {},
      });

      toast.success('Đặt phòng thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      if(isAuthenticated){
        navigate('/my-booking', { state: { booking: response.data } });
      }
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage =
        error.response?.data?.message || 'Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
      if (error.response?.status === 401 && isAuthenticated) {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room) {
    return (
      <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 text-center text-gray-500">
        Không tìm thấy phòng. Vui lòng kiểm tra lại hoặc thử lại sau.
      </div>
    );
  }

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-24">
      <div className="flex flex-col items-start gap-2">
        <h1 className="text-3xl md:text-4xl font-playfair">
          {room.roomName} <span className="font-inter text-sm">({room.roomType})</span>
        </h1>
      </div>
      <div className="flex items-center gap-1 text-gray-500 mt-2">
        <span>Sức chứa: {room.capacity} khách</span>
      </div>
      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        <div className="lg:w-1/2 w-full">
          <img
            src={`http://localhost:8080${room.imageUrl}` || '/default-room-image.jpg'}
            alt={room.roomName}
            className="w-full rounded-xl shadow-lg object-cover"
          />
        </div>
        <div className="lg:w-1/2 w-full">
          <form
            onSubmit={handleBookingSubmit}
            className="bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl w-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
              <div className="flex flex-col">
                <label htmlFor="checkInDate" className="font-medium">
                  Ngày nhận phòng
                </label>
                <input
                  type="date"
                  id="checkInDate"
                  name="checkInDate"
                  value={bookingFormData.checkInDate}
                  onChange={handleBookingFormChange}
                  min={today}
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="checkOutDate" className="font-medium">
                  Ngày trả phòng
                </label>
                <input
                  type="date"
                  id="checkOutDate"
                  name="checkOutDate"
                  value={bookingFormData.checkOutDate}
                  onChange={handleBookingFormChange}
                  min={bookingFormData.checkInDate || today}
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="roomType" className="font-medium">
                  Loại phòng
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={bookingFormData.roomType}
                  onChange={handleBookingFormChange}
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required
                >
                  {validRoomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="roomNumber" className="font-medium">
                  Số lượng phòng
                </label>
                <input
                  type="number"
                  id="roomNumber"
                  name="roomNumber"
                  value={bookingFormData.roomNumber}
                  onChange={handleBookingFormChange}
                  min="1"
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="adultNumber" className="font-medium">
                  Người lớn
                </label>
                <input
                  type="number"
                  id="adultNumber"
                  name="adultNumber"
                  value={bookingFormData.adultNumber}
                  onChange={handleBookingFormChange}
                  min="1"
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="childrenNumber" className="font-medium">
                  Trẻ em
                </label>
                <input
                  type="number"
                  id="childrenNumber"
                  name="childrenNumber"
                  value={bookingFormData.childrenNumber}
                  onChange={handleBookingFormChange}
                  min="0"
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="guestName" className="font-medium">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="guestName"
                  name="guestName"
                  value={bookingFormData.guestName}
                  onChange={handleBookingFormChange}
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required={!isAuthenticated}
                  disabled={isAuthenticated}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="guestEmail" className="font-medium">
                  Email
                </label>
                <input
                  type="email"
                  id="guestEmail"
                  name="guestEmail"
                  value={bookingFormData.guestEmail}
                  onChange={handleBookingFormChange}
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required={!isAuthenticated}
                  disabled={isAuthenticated}
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="guestPhone" className="font-medium">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="guestPhone"
                  name="guestPhone"
                  value={bookingFormData.guestPhone}
                  onChange={handleBookingFormChange}
                  className="rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                  required={!isAuthenticated}
                  disabled={isAuthenticated}
                />
              </div>
            </div>
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md w-full mt-6 py-3 text-base ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? 'Đang đặt phòng...' : 'Đặt phòng ngay'}
            </button>
          </form>
        </div>
      </div>
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white text-gray-500 rounded-lg px-6 py-4 mt-8 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto"
      >
        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="" className="h-4" />
            <label htmlFor="roomTypeInput">Loại phòng</label>
          </div>
          <input
            list="roomTypes"
            id="roomTypeInput"
            name="roomType"
            type="text"
            value={searchFormData.roomType}
            onChange={handleSearchFormChange}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            placeholder="Chọn loại phòng"
          />
          <datalist id="roomTypes">
            {validRoomTypes.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="" className="h-4" />
            <label htmlFor="checkIn">Nhận phòng</label>
          </div>
          <input
            id="checkIn"
            name="checkIn"
            type="date"
            value={searchFormData.checkIn}
            onChange={handleSearchFormChange}
            min={today}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            required
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="" className="h-4" />
            <label htmlFor="checkOut">Trả phòng</label>
          </div>
          <input
            id="checkOut"
            name="checkOut"
            type="date"
            value={searchFormData.checkOut}
            onChange={handleSearchFormChange}
            min={searchFormData.checkIn || today}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            required
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <img src={assets.calenderIcon} alt="" className="h-4" />
            <label htmlFor="numberOfRooms">Số lượng phòng</label>
          </div>
          <input
            id="numberOfRooms"
            name="numberOfRooms"
            type="number"
            value={searchFormData.numberOfRooms}
            onChange={handleSearchFormChange}
            min="1"
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSearchSubmitting}
          className={`flex items-center justify-center gap-1 rounded-md bg-primary py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1 ${
            isSearchSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSearchSubmitting ? (
            <span>Đang tìm kiếm...</span>
          ) : (
            <>
              <img src={assets.searchIcon} alt="" className="h-7" />
              <span>Kiểm tra</span>
            </>
          )}
        </button>
      </form>
      <div className="flex flex-col md:flex-row md:justify-between mt-10">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-playfair">Trải nghiệm sự sang trọng chưa từng có</h1>
          <div className="mt-6">
            <h2 className="text-xl mt-3 font-medium text-gray-700">Danh sách tiện nghi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-gray-500">
              {(room.amenities || []).map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-black-800">✓</span>
                  <p className="text-sm">
                    {amenity.amenityName}
                    {amenity.quantity && amenity.quantity > 1 ? ` (${amenity.quantity})` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-2xl font-medium">{new Intl.NumberFormat('vi-VN').format(room.price)} VND / đêm</p>
      </div>

      <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
        <p>{room.description}</p>
      </div>
    </div>
  );
};

export default RoomDetails;