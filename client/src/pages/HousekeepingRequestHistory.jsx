import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";
import Pagination from "../components/Pagination";

const HousekeepingRequestHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHousekeepingRequests = async () => {
      if (!isAuthenticated) {
        setError("Vui lòng đăng nhập để xem lịch sử yêu cầu dọn phòng.");
        setLoading(false);
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:8080/api/housekeeping-requests`, {
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
          err.response?.data?.message || "Không thể tải dữ liệu yêu cầu dọn phòng. Vui lòng thử lại.";
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

    fetchHousekeepingRequests();
  }, [currentPage, isAuthenticated, token, navigate]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ xử lý";
      case "IN_PROGRESS":
        return "Đang thực hiện";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return <div className="py-28 px-4 text-center">Đang tải...</div>;
  }

  if (error) {
    return <div className="py-28 px-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <Title
            title="Lịch Sử Yêu Cầu Dọn Phòng"
            subTitle="Xem các yêu cầu dọn phòng bạn đã gửi tại Quick Stay."
            align="left"
          />
          <button
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
            onClick={() => navigate("/housekeeping-requests/new")}
          >
            Tạo Yêu Cầu
          </button>
        </div>
        <div className="mt-8">
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_2fr_1fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
            <div>ID</div>
            <div>Phòng</div>
            <div>Thời Gian Ưu Tiên</div>
            <div>Trạng Thái</div>
            <div>Thao Tác</div>
          </div>
          {requests.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Không có yêu cầu dọn phòng nào.</p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_2fr_1fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
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
                  <p className="text-sm">Phòng: {request.roomName}</p>
                  <p className="text-xs text-gray-500">Khách: {request.customerName}</p>
                </div>
                <div>
                  <p className="text-sm">
                    {new Date(request.preferredTime).toLocaleString("vi-VN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
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
                    onClick={() => navigate(`/housekeeping-requests/${request.id}`)}
                  >
                    Xem Chi Tiết
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

export default HousekeepingRequestHistory;
