import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Title from '../components/Title';
import Pagination from '../components/Pagination';

const Services = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/services', {
          params: {
            page: currentPage - 1,
            size: itemsPerPage,
          },
        });
        setServices(response.data.content);
        setTotalPages(response.data.totalPages);
        setError('');
      } catch (err) {
        setError('Failed to load services. Please try again later.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [currentPage]);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title="Dịch vụ của chúng tôi"
          subTitle="Khám phá các dịch vụ cao cấp tại QuickStay để nâng cao trải nghiệm của bạn."
          align="left"
        />
        <div className="mt-8">
          {loading ? (
            <p className="text-center text-gray-500">Đang tải...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : services.length === 0 ? (
            <p className="text-center text-gray-500">Không có dịch vụ nào có sẵn</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white p-6 rounded-lg shadow border border-gray-300 hover:bg-gray-50 transition-all"
                >
                  <h3 className="text-xl font-playfair text-gray-800">{service.serviceName}</h3>
                  <p className="text-sm text-gray-500 mt-2">{service.serviceDescription}</p>
                  <p className="text-lg font-medium text-gray-700 mt-4">{new Intl.NumberFormat('vi-VN').format(service.servicePrice)} VND</p>
                  <button
                    className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
                    onClick={() => navigate(`/services/${service.id}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
};

export default Services;