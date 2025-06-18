import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoomCard from './RoomCard';
import Title from './Title';

const FeaturedDestination = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:8080/api/rooms/by-room-types');
        setRooms(response.data.rooms || []);
      } catch (error) {
        console.error('Failed to fetch featured rooms:', error);
        setError('Unable to load featured room list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
      <Title
        title="Các phòng nôi bật"
        subTitle="Khám phá bộ sưu tập các phòng đặc biệt được chúng tôi chuẩn bị kỹ lưỡng, mang đến sự sang trọng và trải nghiệm khó quên."
      />

      <div className="flex flex-wrap items-center justify-center gap-6 mt-20">
        {loading ? (
          Array(4)
            .fill()
            .map((_, index) => (
              <div
                key={index}
                className="w-full sm:w-1/2 lg:w-1/4 p-2"
              >
                <div className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
                <div className="mt-2 h-6 bg-gray-200 animate-pulse rounded"></div>
                <div className="mt-1 h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
              </div>
            ))
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : rooms.length === 0 ? (
          <p className="text-center text-gray-500">Không có phòng để hiển thị</p>
        ) : (
          rooms.map((room, index) => (
            <RoomCard room={room} index={index} key={room.id} />
          ))
        )}
      </div>

      <button
        onClick={() => navigate('/rooms')}
        className="my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer"
      >
        Xem tất cả phòng
      </button>
    </div>
  );
};

export default FeaturedDestination;