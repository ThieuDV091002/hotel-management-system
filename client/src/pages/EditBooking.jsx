import React, { useState, useEffect, useContext, useCallback } from "react";
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
              d="M12.785 16.094h-1.598l-.175-7.851h1.957zm-1.827 2.401q0-.434.283-.722q.283-.287.772-.287t.772.287a1 1 0 0 1 .283.722.97.97 0 0 1-.275.703q-.276.284-.78.284q-.505 0-.78-.284a.97.97 0 0 1-.275-.703"
              fill="#DC2626"
            />
          </svg>
        </div>
        <h2 id="modal-title" className="text-slate-900 text-xl font-medium mt-3">
          Thay đổi thông tin đặt phòng
        </h2>
        <p className="text-sm text-slate-900/70 mt-1 text-center">
          Bạn có chắc chắn muốn thay đổi thông tin đặt phòng không?
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            className="font-medium text-sm bg-white text-slate-900 active:scale-95 transition w-32 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
            aria-label="Cancel booking update"
          >
            Hủy
          </button>
          <button
            type="button"
            className="font-medium text-sm text-white bg-red-600 hover:bg-red-700 active:scale-95 transition w-32 h-10 rounded-md"
            onClick={onConfirm}
            aria-label="Confirm booking update"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

const EditBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { isAuthenticated, token: contextToken, refreshToken, user } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    roomType: "",
    roomNumber: 1,
    adultNumber: 1,
    childrenNumber: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const API_URL = "http://localhost:8080";

  const validRoomTypes = ["SINGLE", "DOUBLE", "TWIN", "DELUXE", "SUITE", "FAMILY"];
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchCurrentUser = async (token) => {
      try {
        const response = await axios.get(`${API_URL}/api/customers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Fetch current user error:", err);
        setCurrentUser(null);
      }
    };

    const fetchBookingDetails = async () => {
      const queryParams = new URLSearchParams(search);
      const guestToken = localStorage.getItem("guestToken") || queryParams.get("token");
      const token = contextToken || localStorage.getItem("accessToken");

      setLoading(true);
      try {
        const config = {};
        if (isAuthenticated && token) {
          await fetchCurrentUser(token);
          config.headers = { Authorization: `Bearer ${token}` };
        } else if (guestToken) {
          config.params = { token: guestToken };
        } else {
          setError("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa đặt phòng.");
          toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa đặt phòng.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/bookings/${id}`, config);
        if (!response.data.booking) {
          throw new Error("Không tìm thấy dữ liệu đặt phòng trong phản hồi");
        }
        const bookingData = response.data.booking;
        setBooking(bookingData);
        setFormData({
          checkInDate: bookingData.startDate ? bookingData.startDate.split("T")[0] : "",
          checkOutDate: bookingData.endDate ? bookingData.endDate.split("T")[0] : "",
          roomType: bookingData.roomType && validRoomTypes.includes(bookingData.roomType)
            ? bookingData.roomType
            : validRoomTypes[0],
          roomNumber: bookingData.roomNumber || 1,
          adultNumber: bookingData.adultNumber || 1,
          childrenNumber: bookingData.childNumber || 0,
        });
        setError("");
      } catch (err) {
        console.error("Fetch booking error:", err);
        if (err.response?.status === 401 && isAuthenticated) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              await fetchCurrentUser(newToken);
              const retryResponse = await axios.get(`${API_URL}/api/bookings/${id}`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              if (!retryResponse.data.booking) {
                throw new Error("Không tìm thấy dữ liệu đặt phòng trong phản hồi");
              }
              const bookingData = retryResponse.data.booking;
              setBooking(bookingData);
              setFormData({
                checkInDate: bookingData.startDate ? bookingData.startDate.split("T")[0] : "",
                checkOutDate: bookingData.endDate ? bookingData.endDate.split("T")[0] : "",
                roomType: bookingData.roomType && validRoomTypes.includes(bookingData.roomType)
                  ? bookingData.roomType
                  : validRoomTypes[0],
                roomNumber: bookingData.roomNumber || 1,
                adultNumber: bookingData.adultNumber || 1,
                childrenNumber: bookingData.childNumber || 0,
              });
              setError("");
            } else {
              throw new Error("Làm mới token không thành công");
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
          const errorMessage = err.response?.data?.message || "Không tải được thông tin đặt phòng";
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
  }, [id, isAuthenticated, contextToken, refreshToken, navigate, search]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Number") ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const queryParams = new URLSearchParams(search);
    const guestToken = localStorage.getItem("guestToken") || queryParams.get("token");
    const isGuestBooking = !booking.customerId && booking.guestEmail;

    if (!isAuthenticated && !guestToken) {
      setError("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để cập nhật đặt phòng.");
      toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để cập nhật đặt phòng.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    if (!formData.checkInDate || !formData.checkOutDate) {
      setError("Vui lòng chọn ngày nhận phòng và ngày trả phòng.");
      toast.error("Vui lòng chọn ngày nhận phòng và ngày trả phòng.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    const checkInDate = new Date(formData.checkInDate);
    const todayDate = new Date(today);
    const checkOutDate = new Date(formData.checkOutDate);

    if (checkInDate < todayDate) {
      setError("Ngày nhận phòng không thể là ngày trong quá khứ.");
      toast.error("Ngày nhận phòng không thể là ngày trong quá khứ.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (checkOutDate <= checkInDate) {
      setError("Ngày trả phòng phải sau ngày nhận phòng.");
      toast.error("Ngày trả phòng phải sau ngày nhận phòng.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (!validRoomTypes.includes(formData.roomType)) {
      setError(`Loại phòng không hợp lệ. Vui lòng chọn một trong các loại sau: ${validRoomTypes.join(", ")}.`);
      toast.error("Loại phòng không hợp lệ.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.roomNumber < 1) {
      setError("Số lượng phòng phải ít nhất là 1.");
      toast.error("Số lượng phòng phải ít nhất là 1.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.adultNumber < 1) {
      setError("Số lượng người lớn phải ít nhất là 1.");
      toast.error("Số lượng người lớn phải ít nhất là 1.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.childrenNumber < 0) {
      setError("Số lượng trẻ em không được ít hơn 0.");
      toast.error("Số lượng trẻ em không được ít hơn 0.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (booking.status === "CHECKOUT" || booking.status === "CANCELLED") {
      setError(`Cannot edit a ${booking.status.toLowerCase()} booking.`);
      toast.error(`Không thể chỉnh sửa một ${booking.status.toLowerCase()} Đặt phòng.`, {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (isAuthenticated && !isGuestBooking && booking.customerId !== currentUser?.id) {
      setError("Đặt phòng này thuộc về người dùng khác.");
      toast.error("Đặt phòng này thuộc về người dùng khác.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    setShowModal(true);
  };

  const handleConfirm = useCallback(async () => {
    setShowModal(false);
    setIsSubmitting(true);

    const queryParams = new URLSearchParams(search);
    const guestToken = localStorage.getItem("guestToken") || queryParams.get("token");
    const token = contextToken || localStorage.getItem("accessToken");
    const isGuestBooking = !booking.customerId && booking.guestEmail;

    try {
      const bookingPayload = {
        customerId: isAuthenticated && !isGuestBooking ? currentUser?.id : null,
        source: booking.source || "ONLINE",
        startDate: formData.checkInDate,
        endDate: formData.checkOutDate,
        roomType: formData.roomType,
        roomNumber: parseInt(formData.roomNumber, 10),
        adultNumber: parseInt(formData.adultNumber, 10),
        childNumber: parseInt(formData.childrenNumber, 10),
      };

      const config = {
        headers: { "Content-Type": "application/json" },
        params: {},
      };

      if (isAuthenticated && !isGuestBooking && token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (isGuestBooking && guestToken) {
        config.params.token = guestToken;
      } else {
        throw new Error("Xác thực không hợp lệ để cập nhật đặt phòng.");
      }

      const response = await axios.put(`${API_URL}/api/bookings/${id}`, bookingPayload, config);

      toast.success("Đã cập nhật đặt phòng thành công!", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate(`/booking/${id}${guestToken ? `?token=${guestToken}` : ""}`);
    } catch (err) {
      console.error("Xảy lỗi trong quá trình chỉnh sửa:", err);
      if (err.response?.status === 401 && isAuthenticated && !isGuestBooking) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            const retryResponse = await axios.put(`${API_URL}/api/bookings/${id}`, bookingPayload, {
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
            });
            toast.success("Đã cập nhật đặt phòng thành công!", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate(`/booking/${id}`);
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
      } else {
        const errorMessage =
          err.response?.status === 403
            ? "Bạn không được phép cập nhật đặt phòng này."
            : err.response?.status === 404
            ? "Không tìm thấy đặt phòng."
            : err.response?.status === 400
            ? err.response?.data?.message || "Chi tiết đặt phòng không hợp lệ. Vui lòng kiểm tra thông tin bạn nhập."
            : err.response?.data?.message || "Không cập nhật được thông tin đặt phòng. Vui lòng thử lại sau.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [contextToken, currentUser, booking, formData, refreshToken, navigate, id, search]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setIsSubmitting(false);
  }, []);

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
        <Title title="Chỉnh sửa đặt phòng" subTitle="Đang tải thông tin đặt phòng..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Chỉnh sửa đặt phòng" subTitle="Không thể tải đặt phòng" align="left" />
        <p className="text-red-500">{error || "Không tìm thấy đặt phòng"}</p>
      </div>
    );
  }

  const isGuestBooking = !booking.customerId && booking.guestEmail;
  const isEditable = isGuestBooking || (isAuthenticated && booking.customerId === currentUser?.id);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title={`Chỉnh sửa đặt phòng - #${booking.id}`}
        subTitle="Cập nhật thông tin đặt phòng của bạn."
        align="left"
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <h2 className="font-playfair text-2xl mb-4">Thông tin đặt phòng</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-300 pb-4">
              <p className="text-lg">Guest: {booking.customerFullName || booking.guestName || "N/A"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkInDate" className="text-sm text-gray-500">
                  Ngày nhận phòng
                </label>
                <input
                  type="date"
                  id="checkInDate"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleFormChange}
                  min={today}
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                    !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  aria-label="Check-in date"
                  disabled={!isEditable}
                />
              </div>
              <div>
                <label htmlFor="checkOutDate" className="text-sm text-gray-500">
                  Ngày trả phòng
                </label>
                <input
                  type="date"
                  id="checkOutDate"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleFormChange}
                  min={formData.checkInDate || today}
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                    !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  aria-label="Check-out date"
                  disabled={!isEditable}
                />
              </div>
              <div>
                <label htmlFor="roomType" className="text-sm text-gray-500">
                  Loại phòng
                </label>
                <select
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleFormChange}
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                    !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  aria-label="Room type"
                  disabled={!isEditable}
                >
                  {validRoomTypes.map((type) => (
                    <option key={type} value={type}>
                      {formatRoomType(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="roomNumber" className="text-sm text-gray-500">
                  Số Phòng
                </label>
                <input
                  type="number"
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleFormChange}
                  min="1"
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                    !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  aria-label="Number of rooms"
                  disabled={!isEditable}
                />
              </div>
              <div>
                <label htmlFor="adultNumber" className="text-sm text-gray-500">
                  Người Lớn
                </label>
                <input
                  type="number"
                  id="adultNumber"
                  name="adultNumber"
                  value={formData.adultNumber}
                  onChange={handleFormChange}
                  min="1"
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                    !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  aria-label="Number of adults"
                  disabled={!isEditable}
                />
              </div>
              <div>
                <label htmlFor="childrenNumber" className="text-sm text-gray-500">
                  Trẻ Em
                </label>
                <input
                  type="number"
                  id="childrenNumber"
                  name="childrenNumber"
                  value={formData.childrenNumber}
                  onChange={handleFormChange}
                  min="0"
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                    !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  aria-label="Number of children"
                  disabled={!isEditable}
                />
              </div>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !isEditable || booking.status === "CHECKOUT" || booking.status === "CANCELLED"}
                className={`px-4 py-2 bg-black text-white rounded-md transition-all ${
                  isSubmitting || !isEditable || booking.status === "CHECKOUT" || booking.status === "CANCELLED"
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800"
                }`}
                aria-label={isSubmitting ? "Updating booking" : "Update booking"}
              >
                {isSubmitting ? "Đang sửa..." : "Chỉnh sửa"}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-all"
                onClick={() => navigate(`/booking/${id}${search}`)}
                aria-label="Cancel edit"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmModal
        isOpen={showModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditBooking;