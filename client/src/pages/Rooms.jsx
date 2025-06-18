import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { assets } from '../assets/assets';
import StarRating from '../components/StarRating';
import Pagination from '../components/Pagination';

const Rooms = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [fullRooms, setFullRooms] = useState(null);
  const [displayRooms, setDisplayRooms] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const roomType = searchParams.get('roomType');

    const fetchData = async () => {
      try {
        if (startDate && endDate) {
          const params = { startDate, endDate };
          if (roomType) params.roomType = roomType;

          const response = await axios.get('http://localhost:8080/api/rooms/search', { params });
          const availableRooms = response.data.availableRooms || [];

          setFullRooms(availableRooms);
          const pages = Math.ceil(availableRooms.length / itemsPerPage);
          setTotalPages(pages);
          setCurrentPage(1);
          setDisplayRooms(availableRooms.slice(0, itemsPerPage));
        } else {
          setFullRooms(null);
          const page = 0;
          const response = await axios.get('http://localhost:8080/api/rooms/by-room-types', {
            params: {
              page: currentPage - 1,
              size: itemsPerPage
            }
          });
          setDisplayRooms(response.data.rooms || []);
          setTotalPages(response.data.totalPages || 0);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng:', error);
        setDisplayRooms([]);
        setTotalPages(0);
      }
    };

    fetchData();
  }, [location.search]);

  useEffect(() => {
    if (fullRooms) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setDisplayRooms(fullRooms.slice(startIndex, endIndex));
    } else {
      const fetchPage = async () => {
        try {
          const page = currentPage - 1;
          const response = await axios.get('http://localhost:8080/api/rooms/by-room-types', {
            params: {
              page: currentPage - 1,
              size: itemsPerPage
            }
          });
          setDisplayRooms(response.data.rooms || []);
          setTotalPages(response.data.totalPages || 0);
        } catch (error) {
          console.error('Lỗi khi lấy danh sách phòng:', error);
          setDisplayRooms([]);
        }
      };
      fetchPage();
    }
  }, [currentPage, fullRooms]);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-start text-left">
          <h1 className="font-playfair text-4xl md:text-[40px]">Danh sách phòng</h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
            Hãy tận dụng các ưu đãi có thời hạn và gói đặc biệt của chúng tôi để nâng cao trải nghiệm lưu trú và tạo nên những kỷ niệm khó quên.
          </p>
        </div>
        <div className="mt-8">
          {displayRooms.length === 0 ? (
            <p className="text-center text-gray-500">Không có phòng nào khả dụng</p>
          ) : (
            displayRooms.map((room) => (
              <div
                key={room.id}
                className="flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0 hover:bg-gray-50 transition-all"
              >
                <img
                  onClick={() => {
                    navigate(`/rooms/${room.id}`);
                    window.scrollTo(0, 0);
                  }}
                  src={`http://localhost:8080${room.imageUrl}` || '/default-room-image.jpg'}
                  alt={room.roomName}
                  title="Xem chi tiết phòng"
                  className="max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer hover:opacity-90 transition-all"
                />
                <div className="flex flex-col gap-2 md:w-1/2">
                  <p className="text-gray-500">{room.roomType}</p>
                  <p
                    onClick={() => {
                      navigate(`/rooms/${room.id}`);
                      window.scrollTo(0, 0);
                    }}
                    className="text-gray-800 text-3xl font-playfair cursor-pointer hover:text-gray-600 transition-all"
                  >
                    {room.roomName}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">{room.description}</p>
                  <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
                    <span>Sức chứa: {room.capacity} khách</span>
                  </div>
                  <p className="text-xl font-medium text-gray-700">{new Intl.NumberFormat('vi-VN').format(room.price)} VND / đêm</p>
                </div>
              </div>
            ))
          )}
        </div>
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Rooms;
