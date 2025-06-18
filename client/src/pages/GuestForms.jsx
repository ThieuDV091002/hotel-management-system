import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../components/Title';
import { AuthContext } from '../context/AuthProvider';

const GuestForms = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token: contextToken } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedback, setFeedback] = useState({
    guestName: '',
    guestEmail: '',
    bookingId: '',
    rating: 0,
    comment: '',
  });
  const [housekeeping, setHousekeeping] = useState({
    roomName: '',
    guestName: '',
    guestEmail: '',
    preferredTime: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = 'http://localhost:8080';

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateFeedbackForm = () => {
    const newErrors = {};
    if (!isAuthenticated) {
      if (!feedback.guestName.trim()) newErrors.guestName = 'Họ và tên là bắt buộc.';
      if (!feedback.guestEmail.trim()) {
        newErrors.guestEmail = 'Email là bắt buộc.';
      } else if (!validateEmail(feedback.guestEmail)) {
        newErrors.guestEmail = 'Định dạng email không hợp lệ.';
      }
    }
    if (!feedback.bookingId.trim()) newErrors.bookingId = 'Mã đặt phòng là bắt buộc.';
    if (feedback.rating === 0) newErrors.rating = 'Đánh giá là bắt buộc.';
    if (!feedback.comment.trim()) newErrors.comment = 'Nhận xét là bắt buộc.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateHousekeepingForm = () => {
    const newErrors = {};
    if (!isAuthenticated) {
      if (!housekeeping.guestName.trim()) newErrors.guestName = 'Họ và tên là bắt buộc.';
      if (!housekeeping.guestEmail.trim()) {
        newErrors.guestEmail = 'Email là bắt buộc.';
      } else if (!validateEmail(housekeeping.guestEmail)) {
        newErrors.guestEmail = 'Định dạng email không hợp lệ.';
      }
    }
    if (!housekeeping.roomName.trim()) newErrors.roomName = 'Tên phòng là bắt buộc.';
    if (!housekeeping.preferredTime) {
      newErrors.preferredTime = 'Thời gian mong muốn là bắt buộc.';
    } else {
      const selectedTime = new Date(housekeeping.preferredTime);
      const now = new Date();
      if (selectedTime < now) {
        newErrors.preferredTime = 'Thời gian mong muốn không thể ở quá khứ.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleHousekeepingChange = (e) => {
    const { name, value } = e.target;
    setHousekeeping((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    if (!validateFeedbackForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = contextToken || localStorage.getItem('accessToken');
      const config = isAuthenticated && token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        bookingId: feedback.bookingId,
        rating: feedback.rating,
        comment: feedback.comment.trim(),
        customerId: null,
        guestName: isAuthenticated ? null : feedback.guestName.trim(),
        guestEmail: isAuthenticated ? null : feedback.guestEmail.trim(),
      };

      await axios.post(`${API_URL}/api/feedback`, payload, config);

      toast.success('Phản hồi đã được gửi thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate(
        isAuthenticated
          ? '/feedback'
          : `/`
      );
    } catch (err) {
      console.error('Lỗi khi gửi phản hồi:', err);
      let errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi gửi phản hồi.';
      
      if (err.response?.status === 404 && err.config.url.includes('/api/bookings/')) {
        errorMessage = 'Mã đặt phòng không hợp lệ.';
        setErrors({ bookingId: 'Mã đặt phòng không hợp lệ.' });
      } else if (err.response?.status === 401 && isAuthenticated) {
        errorMessage = 'Phiên đã hết hạn. Vui lòng đăng nhập lại.';
        setErrors({ general: errorMessage });
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
        navigate('/login');
        setIsSubmitting(false);
        return;
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Dữ liệu phản hồi không hợp lệ.';
        setErrors({ general: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }

      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHousekeepingSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    if (!validateHousekeepingForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = contextToken || localStorage.getItem('accessToken');
      const config = isAuthenticated && token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const payload = {
        roomName: housekeeping.roomName.trim(),
        preferredTime: housekeeping.preferredTime,
        notes: housekeeping.notes.trim() || null,
        customerId: null,
        guestName: isAuthenticated ? null : housekeeping.guestName.trim(),
        guestEmail: isAuthenticated ? null : housekeeping.guestEmail.trim(),
      };

      await axios.post(`${API_URL}/api/housekeeping-requests`, payload, config);

      toast.success('Yêu cầu dọn phòng đã được gửi thành công!', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate(
        isAuthenticated
          ? '/housekeeping-requests'
          : `/`
      );
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu dọn phòng:', err);
      let errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi gửi yêu cầu dọn phòng.';
      
      if (err.response?.status === 401 && isAuthenticated) {
        errorMessage = 'Phiên đã hết hạn. Vui lòng đăng nhập lại.';
        setErrors({ general: errorMessage });
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
        });
        navigate('/login');
        setIsSubmitting(false);
        return;
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Dữ liệu yêu cầu không hợp lệ.';
        setErrors({ general: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }

      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title="Dịch Vụ Khách Hàng"
          subTitle="Gửi phản hồi hoặc yêu cầu dịch vụ dọn phòng."
          align="left"
        />
        <div className="mt-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'feedback' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
              onClick={() => setActiveTab('feedback')}
            >
              Phản Hồi
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'housekeeping' ? 'border-b-2 border-black text-black' : 'text-gray-500'}`}
              onClick={() => setActiveTab('housekeeping')}
            >
              Yêu Cầu Dọn Phòng
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-300 mt-4">
            {activeTab === 'feedback' ? (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {!isAuthenticated && (
                  <>
                    <div>
                      <label className="text-sm text-gray-500" htmlFor="guestName">
                        Họ và Tên
                      </label>
                      <input
                        type="text"
                        id="guestName"
                        name="guestName"
                        value={feedback.guestName}
                        onChange={handleFeedbackChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                          errors.guestName ? 'border-red-600' : 'border-gray-300'
                        }`}
                        placeholder="Nhập họ và tên của bạn"
                      />
                      {errors.guestName && <p className="text-red-600 text-sm mt-1">{errors.guestName}</p>}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500" htmlFor="guestEmail">
                        Email
                      </label>
                      <input
                        type="email"
                        id="guestEmail"
                        name="guestEmail"
                        value={feedback.guestEmail}
                        onChange={handleFeedbackChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                          errors.guestEmail ? 'border-red-600' : 'border-gray-300'
                        }`}
                        placeholder="Nhập email của bạn"
                      />
                      {errors.guestEmail && <p className="text-red-600 text-sm mt-1">{errors.guestEmail}</p>}
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm text-gray-500" htmlFor="bookingId">
                    Mã Đặt Phòng
                  </label>
                  <input
                    type="text"
                    id="bookingId"
                    name="bookingId"
                    value={feedback.bookingId}
                    onChange={handleFeedbackChange}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                      errors.bookingId ? 'border-red-600' : 'border-gray-300'
                    }`}
                    placeholder="Nhập mã đặt phòng của bạn"
                  />
                  {errors.bookingId && <p className="text-red-600 text-sm mt-1">{errors.bookingId}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-500">Đánh Giá</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`text-2xl ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setFeedback({ ...feedback, rating: star })}
                        aria-label={`Đánh giá ${star} sao`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {errors.rating && <p className="text-red-600 text-sm mt-1">{errors.rating}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-500" htmlFor="comment">
                    Nhận Xét
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={feedback.comment}
                    onChange={handleFeedbackChange}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                      errors.comment ? 'border-red-600' : 'border-gray-300'
                    }`}
                    placeholder="Nhập nhận xét của bạn"
                    rows="4"
                  />
                  {errors.comment && <p className="text-red-600 text-sm mt-1">{errors.comment}</p>}
                </div>
                {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-black text-white rounded-md transition-all ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                    }`}
                    aria-label={isSubmitting ? 'Đang gửi phản hồi' : 'Gửi phản hồi'}
                  >
                    {isSubmitting ? 'Đang Gửi...' : 'Gửi Phản Hồi'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleHousekeepingSubmit} className="space-y-4">
                {!isAuthenticated && (
                  <>
                    <div>
                      <label className="text-sm text-gray-500" htmlFor="guestName">
                        Họ và Tên
                      </label>
                      <input
                        type="text"
                        id="guestName"
                        name="guestName"
                        value={housekeeping.guestName}
                        onChange={handleHousekeepingChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                          errors.guestName ? 'border-red-600' : 'border-gray-300'
                        }`}
                        placeholder="Nhập họ và tên của bạn"
                      />
                      {errors.guestName && <p className="text-red-600 text-sm mt-1">{errors.guestName}</p>}
                    </div>
                    <div>
                      <label className="text-sm text-gray-500" htmlFor="guestEmail">
                        Email
                      </label>
                      <input
                        type="email"
                        id="guestEmail"
                        name="guestEmail"
                        value={housekeeping.guestEmail}
                        onChange={handleHousekeepingChange}
                        className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                          errors.guestEmail ? 'border-red-600' : 'border-gray-300'
                        }`}
                        placeholder="Nhập email của bạn"
                      />
                      {errors.guestEmail && <p className="text-red-600 text-sm mt-1">{errors.guestEmail}</p>}
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm text-gray-500" htmlFor="roomName">
                    Tên Phòng
                  </label>
                  <input
                    type="text"
                    id="roomName"
                    name="roomName"
                    value={housekeeping.roomName}
                    onChange={handleHousekeepingChange}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                      errors.roomName ? 'border-red-600' : 'border-gray-300'
                    }`}
                    placeholder="Nhập tên phòng của bạn"
                  />
                  {errors.roomName && <p className="text-red-600 text-sm mt-1">{errors.roomName}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-500" htmlFor="preferredTime">
                    Thời Gian Mong Muốn
                  </label>
                  <input
                    type="datetime-local"
                    id="preferredTime"
                    name="preferredTime"
                    value={housekeeping.preferredTime}
                    onChange={handleHousekeepingChange}
                    className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                      errors.preferredTime ? 'border-red-600' : 'border-gray-300'
                    }`}
                  />
                  {errors.preferredTime && <p className="text-red-600 text-sm mt-1">{errors.preferredTime}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-500" htmlFor="notes">
                    Ghi Chú
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={housekeeping.notes}
                    onChange={handleHousekeepingChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-1"
                    placeholder="Nhập ghi chú (tùy chọn)"
                    rows="4"
                  />
                </div>
                {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-black text-white rounded-md transition-all ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                    }`}
                    aria-label={isSubmitting ? 'Đang gửi yêu cầu dọn phòng' : 'Gửi yêu cầu dọn phòng'}
                  >
                    {isSubmitting ? 'Đang Gửi...' : 'Gửi Yêu Cầu Dọn Phòng'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestForms;