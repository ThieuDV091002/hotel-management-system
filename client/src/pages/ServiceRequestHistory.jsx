import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";
import Pagination from "../components/Pagination";

const ServiceRequestHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!isAuthenticated) {
        setError("Vui lòng đăng nhập để xem lịch sử yêu cầu dịch vụ.");
        setLoading(false);
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:8080/api/service-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage - 1,
            size: itemsPerPage,
          },
        });

        setRequests(response.data.content);
        setTotalPages(response.data.totalPages);
        setError("");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Không thể tải dữ liệu. Vui lòng thử lại.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [currentPage, isAuthenticated, token, navigate]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatStatus = (status) => {
    if (!status) return "Không rõ";
    switch (status) {
      case "PENDING":
        return "Chờ xử lý";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Không rõ";
    }
  };

  if (loading) {
    return <div className="py-28 px-4 text-center">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="py-28 px-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title="Lịch Sử Yêu Cầu Dịch Vụ"
          subTitle="Xem lại các yêu cầu dịch vụ bạn đã gửi tại Quick Stay."
          align="left"
        />
        <div className="mt-8">
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr_1fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
            <div>Mã</div>
            <div>Dịch vụ</div>
            <div>Thành tiền</div>
            <div>Trạng thái</div>
            <div>Thao tác</div>
          </div>
          {requests.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Không có yêu cầu dịch vụ nào.</p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm">{request.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm">{request.serviceName}</p>
                  <p className="text-xs text-gray-500">Mã đặt phòng: {request.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm">{new Intl.NumberFormat('vi-VN').format(request.totalAmount)} VND</p>
                </div>
                <div className="flex flex-col items-start justify-center pt-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        request.status === "COMPLETED"
                          ? "bg-green-500"
                          : request.status === "PENDING"
                          ? "bg-yellow-500"
                          : request.status === "IN_PROGRESS"
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <p
                      className={`text-sm ${
                        request.status === "COMPLETED"
                          ? "text-green-500"
                          : request.status === "PENDING"
                          ? "text-yellow-500"
                          : request.status === "IN_PROGRESS"
                          ? "text-blue-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatStatus(request.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
                    onClick={() => navigate(`/service-requests/${request.id}`)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default ServiceRequestHistory;
