import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const Hero = () => {
  const [roomType, setRoomType] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const validRoomTypes = ['SINGLE', 'DOUBLE', 'TWIN', 'DELUXE', 'SUITE', 'FAMILY'];

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setError('');
      setIsSubmitting(true);

      if (!checkIn || !checkOut) {
        setError('Vui lòng chọn ngày nhận phòng và trả phòng.');
        setIsSubmitting(false);
        return;
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const todayDate = new Date(today);

      if (checkInDate < todayDate) {
        setError('Ngày nhận phòng không được là ngày trong quá khứ.');
        setIsSubmitting(false);
        return;
      }

      if (checkOutDate <= checkInDate) {
        setError('Ngày trả phòng phải sau ngày nhận phòng.');
        setIsSubmitting(false);
        return;
      }

      let formattedRoomType = roomType.trim().toUpperCase();
      if (formattedRoomType && !validRoomTypes.includes(formattedRoomType)) {
        setError(`Loại phòng không hợp lệ. Vui lòng chọn một trong các loại: ${validRoomTypes.join(', ')}.`);
        setIsSubmitting(false);
        return;
      }

      navigate(
        `/rooms?startDate=${checkIn}&endDate=${checkOut}${
          formattedRoomType ? `&roomType=${formattedRoomType}` : ''
        }`
      );
      setIsSubmitting(false);
    },
    [checkIn, checkOut, roomType, navigate, today, validRoomTypes]
  );

  return (
    <div className="flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url('/src/assets/heroImage.png')] bg-no-repeat bg-cover bg-center h-screen">
      <p className="bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20">Trải nghiệm khách sạn đỉnh cao</p>
      <h1 className="font-playfair text-2xl md:text-5xl md-text-[56px] md:leading-[56px] font-bold md:front-extrabold max-w-xl mt-4">
        Khám phá điểm đến hoàn hảo dành cho bạn
      </h1>
      <p className="max-w-130 mt-2 text-sm md:text-base">
        Sự sang trọng và thoải mái vượt trội đang chờ đón bạn tại khách sạn của chúng tôi. Bắt đầu hành trình ngay hôm nay.
      </p>
      <form
        onSubmit={handleSubmit}
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
            type="text"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
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
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
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
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            className="rounded border border-gray-200 px-3 py-1.5 mt-1.5 text-sm outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center justify-center gap-1 rounded-md bg-black py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <span>Đang tìm kiếm...</span>
          ) : (
            <>
              <img src={assets.searchIcon} alt="" className="h-7" />
              <span>Tìm kiếm</span>
            </>
          )}
        </button>
      </form>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
};

export default Hero;
