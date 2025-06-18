import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";

const ConfirmModal = ({ isOpen, onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="flex flex-col items-center bg-white shadow-lg rounded-xl p-6 md:px-12 md:py-8 transition-transform duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center p-3 bg-red-100 rounded-full">
          <svg
            className="mb-0.5"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M12.211.538c1.042.059 1.91.556 2.433 1.566l8.561 17.283c.83 1.747-.455 4.098-2.565 4.131H3.4c-1.92-.03-3.495-2.21-2.555-4.15L9.566 2.085c.164-.31.238-.4.379-.562C10.511.866 11.13.515 12.21.538m-.14 1.908a.97.97 0 0 0-.792.485 574 574 0 0 0-8.736 17.311c-.26.585.187 1.335.841 1.367q8.637.14 17.272 0c.633-.03 1.108-.756.844-1.36a572 572 0 0 0-8.575-17.312c-.175-.31-.431-.497-.855-.491"
              fill="#DC2626"
            />
            <path
              d="M12.785 16.094h-1.598l-.175-7.851h1.957zm-1.827 2.401q0-.434.283-.722.283-.287.772-.287t.772.287a1 1 0 0 1 .283.722.97.97 0 0 1-.275.703q-.276.284-.78.284-.505 0-.78-.284a.97.97 0 0 1-.275-.703"
              fill="#DC2626"
            />
          </svg>
        </div>
        <h2 id="modal-title" className="text-slate-900 text-xl font-medium mt-3">
          Hủy đặt phòng
        </h2>
        <p className="text-sm text-slate-900/70 mt-1 text-center">
          Bạn có chắc chắn muốn hủy đặt phòng này không? Hành động này không thể hoàn tác.
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            className="font-medium text-sm bg-white text-slate-900 active:scale-95 transition w-32 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
            aria-label="Cancel booking cancellation"
          >
            Quay lại
          </button>
          <button
            type="button"
            className="font-medium text-sm text-white bg-red-600 hover:bg-red-700 active:scale-95 transition w-32 h-10 rounded-md"
            onClick={onConfirm}
            aria-label="Confirm booking cancellation"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

const OTPModal = ({ isOpen, onVerify, onCancel, otpError }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      inputRefs.current[0]?.focus();
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleInputChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length <= 6) {
      const newOtp = paste.split("").concat(Array(6 - paste.length).fill(""));
      setOtp(newOtp);
      inputRefs.current[Math.min(paste.length, 5)].focus();
    }
    e.preventDefault();
  };

  const handleVerify = () => {
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      onVerify(otpCode);
    } else {
      toast.error("Please enter a 6-digit OTP.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
    >
      <div
        className="flex flex-col items-center md:max-w-[423px] w-[380px] bg-white rounded-2xl shadow-lg p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="otp-modal-title" className="text-2xl font-semibold text-gray-900">
          Xác minh OTP
        </p>
        <p className="mt-2 text-sm text-gray-900/90 text-center">
          Nhập mã gồm 6 chữ số được gửi đến email của bạn.
        </p>
        <div className="grid grid-cols-6 gap-2 sm:gap-3 w-11/12 mt-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              ref={(el) => (inputRefs.current[index] = el)}
              className="w-full h-12 bg-indigo-50 text-gray-900 text-xl rounded-md outline-none text-center"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>
        {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
        <button
          type="button"
          className="mt-8 w-full max-w-80 h-11 rounded-full text-white text-sm bg-indigo-500 hover:opacity-90 transition-opacity"
          onClick={handleVerify}
          aria-label="Verify OTP"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { isAuthenticated, token: contextToken, refreshToken } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [serviceUsages, setServiceUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpAction, setOtpAction] = useState(null);
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchBookingDetails = async () => {
      const queryParams = new URLSearchParams(search);
      const guestToken = queryParams.get("token");
      localStorage.setItem("guestToken", guestToken);
      const token = contextToken || localStorage.getItem("accessToken");

      setLoading(true);
      try {
        const config = {};
        if (isAuthenticated && token) {
          config.headers = { Authorization: `Bearer ${token}` };
        } else if (guestToken) {
          config.params = { token: guestToken };
        } else {
          setError("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để xem chi tiết đặt phòng.");
          toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để xem chi tiết đặt phòng.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/bookings/${id}`, config);
        if (!response.data) {
          throw new Error("Booking data not found in response");
        }
        setBooking(response.data.booking || response.data);
        setRooms(response.data.rooms || []);
        setServiceUsages(response.data.serviceUsages || []);
        setError("");
      } catch (err) {
        console.error("Fetch booking error:", err);
        if (err.response?.status === 401 && isAuthenticated) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              const retryResponse = await axios.get(`${API_URL}/api/bookings/${id}`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              if (!retryResponse.data) {
                throw new Error("Booking data not found in retry response");
              }
              setBooking(retryResponse.data.booking);
              setRooms(retryResponse.data.rooms || []);
              setServiceUsages(retryResponse.data.serviceUsages || []);
              setError("");
            } else {
              throw new Error("Token refresh failed");
            }
          } catch (retryErr) {
            console.error("Token refresh error:", retryErr);
            setError("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
            toast.error("Phiên đã hết hạn. Vui lòng đăng nhập lại.", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate("/login");
          }
        } else if (err.response?.status === 404) {
          setError("Không tìm thấy đặt phòng.");
          toast.error("Không tìm thấy đặt phòng.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else if (err.response?.status === 400) {
          setError("Mã đặt phòng hoặc token không hợp lệ.");
          toast.error("Mã đặt phòng hoặc token không hợp lệ.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          const errorMessage = err.response?.data?.message || "Không tải được thông tin đặt phòng.";
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

    fetchBookingDetails();
  }, [id, search, isAuthenticated, contextToken, refreshToken, navigate]);

  const handleRequestOTP = async (action) => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    try {
      const response = await axios.post(`${API_URL}/api/bookings/${id}/request-otp`, null, {
        params: { token: guestToken },
      });
      toast.success(response.data || "OTP sent to your email.", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowOTPModal(true);
      setOtpError("");
      setOtpAction(action);
    } catch (err) {
      console.error(`Request OTP error for ${action}:`, err);
      const errorMessage =
        err.response?.data?.message || "Không gửi được OTP. Vui lòng thử lại.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleCancelBooking = async () => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    const isGuestBooking = !booking.customerId && booking.guestEmail;

    if (isAuthenticated && !isGuestBooking) {
      setShowConfirmModal(true);
    } else if (isGuestBooking && guestToken) {
      await handleRequestOTP("cancel");
    } else {
      toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để hủy đặt phòng.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/login");
    }
  };

  const handleEditBooking = async () => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    const isGuestBooking = !booking.customerId && booking.guestEmail;

    if (isAuthenticated && !isGuestBooking) {
      navigate(`/booking/${id}/edit`);
    } else if (isGuestBooking && guestToken) {
      await handleRequestOTP("edit");
    } else {
      toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa đặt phòng.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/login");
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");

    try {
      const response = await axios.post(`${API_URL}/api/bookings/${id}/verify-otp`, null, {
        params: { token: guestToken, otp: otpCode },
      });
      toast.success(response.data || "OTP verified successfully.", {
        position: "top-right",
        autoClose: 3000,
      });

      const statusResponse = await axios.get(`${API_URL}/api/bookings/${id}/otp-status`, {
        params: { token: guestToken },
      });

      if (statusResponse.data === true) {
        setShowOTPModal(false);
        if (otpAction === "cancel") {
          setShowConfirmModal(true);
        } else if (otpAction === "edit") {
          navigate(`/booking/${id}/edit`);
        }
        setOtpError("");
        setOtpAction(null);
      } else {
        throw new Error("Trạng thái xác minh OTP không hợp lệ.");
      }
    } catch (err) {
      console.error(`Verify OTP error for ${otpAction}:`, err);
      const errorMessage =
        err.response?.data?.message || "OTP không hợp lệ. Vui lòng thử lại.";
      setOtpError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleConfirmCancel = useCallback(async () => {
    setShowConfirmModal(false);
    setIsCancelling(true);

    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    const token = contextToken || localStorage.getItem("accessToken");
    const isGuestBooking = !booking.customerId && booking.guestEmail;

    try {
      const config = {
        headers: { "Content-Type": "application/json" },
      };
      if (isAuthenticated && !isGuestBooking && token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (isGuestBooking && guestToken) {
        config.params = { token: guestToken };
      } else {
        throw new Error("Invalid authentication for cancellation");
      }

      const response = await axios.put(
        `${API_URL}/api/bookings/${id}/change-status`,
        "CANCELLED",
        config
      );
      toast.success("Booking cancelled successfully!", {
        position: "top-right",
        autoClose: 5000,
      });
      isAuthenticated ?
      navigate("/booking/{id}")
      : navigate(`/booking/${id}?token=${guestToken}`);
    } catch (err) {
      console.error("Cancel booking error:", err);
      if (err.response?.status === 401 && isAuthenticated && !isGuestBooking) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            const retryResponse = await axios.put(
              `${API_URL}/api/bookings/${id}/change-status`,
              "CANCELLED",
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  "Content-Type": "application/json",
                },
              }
            );
            toast.success("Đã hủy đặt phòng thành công!", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate("/my-booking");
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (retryErr) {
          console.error("Token refresh error during cancel:", retryErr);
          toast.error("Phiên đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate("/login");
        }
      } else if (err.response?.status === 400) {
        const errorMessage =
          err.response?.data?.message || "Không thể hủy đặt phòng. Có thể đặt phòng đang ở trạng thái không hợp lệ.";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        const errorMessage =
          err.response?.data?.message || "Không thể hủy đặt phòng. Vui lòng thử lại.";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setIsCancelling(false);
    }
  }, [contextToken, refreshToken, navigate, id, search, booking]);

  const handleCancelModal = useCallback(() => {
    setShowConfirmModal(false);
    setShowOTPModal(false);
    setOtpError("");
    setOtpAction(null);
  }, []);

  const handleReview = () => {
    navigate(`/booking/${id}/review`);
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatRoomType = (roomType) => {
    if (!roomType) return "Unknown";
    return roomType
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <div className="py-28 px-4 text-center text-gray-800">
        <Title title="Chi tiết đặt phòng" subTitle="Đang tải thông tin đặt phòng..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Chi tiết đặt phòng" subTitle="Không thể tải đặt phòng" align="left" />
        <p className="text-red-500">{error || "Không tìm thấy đặt phòng"}</p>
      </div>
    );
  }

  const guests = (booking.adultNumber || 0) + (booking.childNumber || 0);
  const canCancel = booking.status !== "CANCELLED" && booking.status !== "CHECKOUT";
  const isGuestBooking = !booking.customerId && booking.guestEmail;

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title={`Chi tiết đặt phòng - #${booking.id}`}
        subTitle="Xem thông tin đặt phòng và quản lý kỳ nghỉ của bạn."
        align="left"
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        {/* Booking Information */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300 mb-8">
          <h2 className="font-playfair text-2xl mb-4">Thông tin đặt phòng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tên khách hàng</p>
              <p className="text-md">{booking.customerFullName || booking.guestName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày nhận phòng</p>
              <p className="text-md">{formatDate(booking.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày trả phòng</p>
              <p className="text-md">{formatDate(booking.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Khoảng thời gian</p>
              <p className="text-md">{booking.numberOfDays || "N/A"} ngày</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số khách</p>
              <p className="text-md">{guests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Loại phòng</p>
              <p className="text-md">{formatRoomType(booking.roomType)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số phòng</p>
              <p className="text-md">{booking.roomNumber || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Giá trị</p>
              <p className="text-md">{(booking.totalPrice || 0).toLocaleString("vi-VN")} VND</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trạng thái</p>
              <p
                className={`text-md ${
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
        </div>

        {/* Assigned Rooms */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300 mb-8">
          <h2 className="font-playfair text-2xl mb-4">Phòng</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms && rooms.length > 0 ? (
              rooms.map((room, index) => (
                <div key={index} className="border p-4 rounded-md">
                  <p className="text-lg">{room.roomNumber}</p>
                  <p className="text-sm text-gray-500">{room.roomType}</p>
                  <p className="text-sm text-gray-500">
                    Price: {(room.pricePerNight || 0).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không có phòng nào được chỉ định</p>
            )}
          </div>
        </div>

        {/* Services Used */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300 mb-8">
          <h2 className="font-playfair text-2xl mb-4">Dịch vụ</h2>
          <div className="space-y-4">
            {serviceUsages && serviceUsages.length > 0 ? (
              serviceUsages.map((service, index) => (
                <div key={index} className="flex justify-between">
                  <p className="text-lg">{service.serviceName || `Service #${index + 1}`}</p>
                  <p className="text-lg">{(service.totalPrice || 0).toLocaleString("vi-VN")} VND</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không có dịch vụ nào được sử dụng</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          {booking.status === "PENDING" && (
            <button
              className={`px-4 py-2 bg-red-500 text-white rounded-md transition-all ${
                isCancelling || !canCancel ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"
              }`}
              onClick={handleCancelBooking}
              disabled={isCancelling || !canCancel}
              aria-label="Cancel booking"
            >
              {isCancelling ? "Đang hủy..." : "Hủy đặt phòng"}
            </button>
          )}
          {booking.status === "CHECKOUT" && isAuthenticated && !isGuestBooking && (
            <button
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
              onClick={handleReview}
              aria-label="Review booking"
            >
              Phản hồi
            </button>
          )}
          {booking.status === "PENDING" && (
            <button
              className={`px-4 py-2 bg-blue-500 text-white rounded-md transition-all ${
                isCancelling ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
              onClick={handleEditBooking}
              disabled={isCancelling}
              aria-label="Edit booking"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelModal}
      />
      <OTPModal
        isOpen={showOTPModal}
        onVerify={handleVerifyOTP}
        onCancel={handleCancelModal}
        otpError={otpError}
      />
    </div>
  );
};

export default BookingDetails;