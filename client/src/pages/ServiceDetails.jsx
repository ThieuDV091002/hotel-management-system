import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Title from '../components/Title';
import { AuthContext } from '../context/AuthProvider';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token: contextToken } = useContext(AuthContext);
  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({
    bookingId: '',
    quantity: 1,
    guestName: '',
    guestEmail: '',
    notes: '', // Added notes field
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/services/${id}`);
        setService(response.data);
        setErrors({});
      } catch (err) {
        setErrors({ general: 'Service not found.' });
        console.error('Error fetching service:', err);
        toast.error('Không tải được thông tin chi tiết về dịch vụ.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bookingId) {
      newErrors.bookingId = 'Cần phải có mã đặt phòng.';
    }
    if (formData.quantity < 1) {
      newErrors.quantity = 'Số lượng phải lớn hơn 0.';
    }
    if (!isAuthenticated) {
      if (!formData.guestName.trim()) {
        newErrors.guestName = 'Tên khách là bắt buộc.';
      }
      if (!formData.guestEmail.trim()) {
        newErrors.guestEmail = 'Guest email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
        newErrors.guestEmail = 'Định dạng email không hợp lệ.';
      }
    }
    // Notes field is optional, so no validation required
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value, 10) || 1 : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const token = contextToken || localStorage.getItem('accessToken');
      const config = isAuthenticated && token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const requestPayload = {
        serviceId: service.id,
        bookingId: formData.bookingId,
        quantity: formData.quantity,
        guestName: isAuthenticated ? null : formData.guestName.trim(),
        guestEmail: isAuthenticated ? null : formData.guestEmail.trim(),
        notes: formData.notes.trim() || null, // Include notes in payload
      };

      const response = await axios.post(`${API_URL}/api/service-requests`, requestPayload, config);

      toast.success('Service booked successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      if (isAuthenticated) {
        navigate('/service-requests', { state: { request: response.data } });
      }
    } catch (err) {
      console.error('Error booking service:', err);
      let errorMessage = err.response?.data?.message || 'Đã xảy ra lỗi khi đặt dịch vụ.';
      
      if (err.response?.status === 404 && err.config.url.includes('/api/bookings/')) {
        errorMessage = 'Mã đặt phòng không hợp lệ.';
        setErrors({ bookingId: 'Mã đặt phòng không hợp lệ.' });
      } else if (err.response?.status === 401 && isAuthenticated) {
        setErrors({ general: 'Phiên đã hết hạn. Vui lòng đăng nhập lại.' });
        toast.error('Phiên đã hết hạn. Vui lòng đăng nhập lại.', {
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

  if (loading) {
    return (
      <div className="py-28 px-4 text-center text-gray-800">
        <Title title="Thông tin dịch vụ" subTitle="Đang tải thông tin dịch vụ..." align="left" />
        <p>Loading...</p>
      </div>
    );
  }

  if (errors.general && !service) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Thông tin dịch vụ" subTitle="Không thể tải dịch vụ" align="left" />
        <p className="text-red-600">{errors.general}</p>
      </div>
    );
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title="Thông tin dịch vụ"
          subTitle="Xem chi tiết và đặt dịch vụ của bạn."
          align="left"
        />
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Dịch vụ</p>
              <p className="text-lg font-playfair">{service.serviceName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phân loại</p>
              <p className="text-lg">{service.serviceType || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Giá</p>
              <p className="text-lg">{new Intl.NumberFormat('vi-VN').format(service.servicePrice)} VND</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Mô tả</p>
              <p className="text-lg">{service.serviceDescription}</p>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-xl font-playfair">Đặt dịch vụ</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {!isAuthenticated && (
                <>
                  <div>
                    <label className="text-sm text-gray-500" htmlFor="guestName">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="guestName"
                      name="guestName"
                      value={formData.guestName}
                      onChange={handleInputChange}
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
                      value={formData.guestEmail}
                      onChange={handleInputChange}
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
                  ID đặt phòng
                </label>
                <input
                  type="text"
                  id="bookingId"
                  name="bookingId"
                  value={formData.bookingId}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                    errors.bookingId ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="Nhập mã đặt phòng"
                />
                {errors.bookingId && <p className="text-red-600 text-sm mt-1">{errors.bookingId}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-500" htmlFor="quantity">
                  Số lượng
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                    errors.quantity ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="Nhập số lượng dịch vụ"
                />
                {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <label className="text-sm text-gray-500" htmlFor="notes">
                  Ghi chú
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md focus:outline-none focus:border-black mt-1 ${
                    errors.notes ? 'border-red-600' : 'border-gray-300'
                  }`}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  rows="4"
                />
                {errors.notes && <p className="text-red-600 text-sm mt-1">{errors.notes}</p>}
              </div>
              {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-black text-white rounded-md transition-all ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                  }`}
                  aria-label={isSubmitting ? 'Booking service' : 'Book service'}
                >
                  {isSubmitting ? 'Đang đặt...' : 'Đặt dịch vụ'}
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-all"
                  onClick={() => navigate('/services')}
                  aria-label="Back to services"
                >
                  Quay lại
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;