import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { AuthContext } from "../context/AuthProvider";

const MyBookings = () => {
  const { user, token: contextToken, refreshToken, isAuthenticated } = useContext(AuthContext);
  const customerId = user?.id;
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchBookings = async () => {
      const token = contextToken || localStorage.getItem("accessToken");

      if (!isAuthenticated || !customerId || !token) {
        setError("Vui lòng đăng nhập để xem các đặt phòng của bạn");
        toast.error("Vui lòng đăng nhập để xem các đặt phòng của bạn", {
          position: "top-right",
          autoClose: 5000,
        });
        navigate("/login");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${API_URL}/api/bookings/customer/${customerId}?page=${currentPage}&size=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBookings(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } catch (err) {
        if (err.response?.status === 401) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              const retryResponse = await axios.get(
                `${API_URL}/api/bookings/customer/${customerId}?page=${currentPage}&size=5`,
                {
                  headers: { Authorization: `Bearer ${newToken}` },
                }
              );
              setBookings(retryResponse.data.content || []);
              setTotalPages(retryResponse.data.totalPages || 0);
            } else {
              throw new Error("Làm mới token thất bại");
            }
          } catch (retryErr) {
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate("/login");
          }
        } else if (err.response?.status === 404) {
          setBookings([]);
          setTotalPages(0);
          setError("Không tìm thấy đặt phòng nào cho tài khoản của bạn.");
        } else if (err.response?.status === 400) {
          setError("Yêu cầu không hợp lệ. Vui lòng kiểm tra thông tin tài khoản.");
          toast.error("Yêu cầu không hợp lệ. Vui lòng kiểm tra thông tin tài khoản.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          const errorMessage = err.response?.data?.message || "Tải đặt phòng thất bại. Vui lòng thử lại sau.";
          setError(errorMessage);
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [customerId, contextToken, currentPage, refreshToken, isAuthenticated, navigate]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  const formatRoomType = (roomType) => {
    if (!roomType) return "Không rõ";
    return roomType
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatStatus = (status) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "REJECTED":
        return "Đã từ chối";
      case "CANCELLED":
        return "Đã hủy";
      case "CHECKIN":
        return "Đã nhận phòng";
      case "CHECKOUT":
        return "Đã trả phòng";
      default:
        return "Không rõ";
    }
  };

  if (loading) {
    return (
      <div className="py-28 px-4 text-center text-gray-800">
        <Title title="Đặt Phòng Của Tôi" subTitle="Đang tải đặt phòng của bạn..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error && error !== "Không tìm thấy đặt phòng nào cho tài khoản của bạn.") {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Đặt Phòng Của Tôi" subTitle="Không thể tải dữ liệu" align="left" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="Đặt Phòng Của Tôi"
        subTitle="Quản lý các đặt phòng và cập nhật kế hoạch của bạn."
        align="left"
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
          <div>Chi tiết đặt phòng</div>
          <div>Thời gian</div>
          <div>Trạng thái</div>
          <div>Hành động</div>
        </div>
        {bookings.length === 0 ? (
          <p className="text-center text-gray-500 py-6">Không có đặt phòng nào</p>
        ) : (
          bookings.map((booking) => {
            const guests = (booking.adultNumber || 0) + (booking.childNumber || 0);
            return (
              <div
                key={booking.id}
                className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="flex flex-col gap-1.5 max-md:mt-3 md:ml-4">
                    <p className="font-playfair text-2xl">
                      Đặt phòng #{booking.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Khách: {booking.customerFullName || "Không rõ"}
                    </p>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <img
                        src={assets.guestsIcon || "https://via.placeholder.com/16"}
                        alt="Guests icon"
                        className="w-4 h-4"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/16")}
                      />
                      <span>Số khách: {guests}</span>
                    </div>
                    <p className="text-base">
                      Tổng tiền: {(booking.totalPrice || 0).toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col md:items-start md:gap-4 mt-3 gap-8">
                  <div>
                    <p>Nhận phòng:</p>
                    <p className="text-gray-500 text-sm">{formatDate(booking.startDate)}</p>
                  </div>
                  <div>
                    <p>Trả phòng:</p>
                    <p className="text-gray-500 text-sm">{formatDate(booking.endDate)}</p>
                  </div>
                  <p className="text-sm">Số ngày: {booking.numberOfDays || "N/A"} ngày</p>
                </div>
                <div className="flex flex-col items-start justify-center pt-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-500"
                          : booking.status === "PENDING"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <p
                      className={`text-sm ${
                        booking.status === "CONFIRMED"
                          ? "text-green-500"
                          : booking.status === "PENDING"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatStatus(booking.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center pt-3">
                  <button
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
                    onClick={() => navigate(`/booking/${booking.id}`)}
                    aria-label={`Xem chi tiết đặt phòng ${booking.id}`}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            type="button"
            aria-label="Trang trước"
            className="mr-4 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            ←
          </button>
          <div className="flex gap-2 text-gray-500 text-sm md:text-base">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`flex items-center justify-center w-9 md:w-12 h-9 md:h-12 rounded-md transition-all ${
                  currentPage === i
                    ? "bg-black text-white"
                    : "bg-white border border-gray-300/60 hover:bg-gray-300/10"
                }`}
                onClick={() => setCurrentPage(i)}
                aria-label={`Trang ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Trang sau"
            className="ml-4 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
