import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Title from './Title';
import { assets } from '../assets/assets';

const Testimonial = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8080/api/feedback?page=0&size=3')
      .then((res) => {
        setFeedbacks(res.data.content);
      })
      .catch((err) => {
        console.error('Lỗi khi lấy phản hồi:', err);
      });
  }, []);

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-24 bg-slate-50 pt-20 pb-30">
      <Title
        title="Khách hàng nói gì về chúng tôi"
        subtitle="Khám phá lý do tại sao khách hàng sành điệu luôn lựa chọn QuichStay cho những chỗ ở sang trọng và độc quyền trên toàn thế giới."
      />

      <div className="flex flex-wrap items-center gap-6 mt-20">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white p-6 rounded-xl shadow w-full md:w-[350px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
                {getInitials(feedback.customerName)}
              </div>
              <div>
                <p className="font-playfair text-xl">{feedback.customerName}</p>
                <p className="text-gray-500">Khách hàng</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <img
                  key={star}
                  src={star <= feedback.rating ? assets.starIconFilled : assets.starIconOutlined}
                  alt={`${star} sao`}
                  className="w-5 h-5"
                />
              ))}
            </div>

            <p className="text-gray-500 max-w-90 mt-4">"{feedback.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonial;