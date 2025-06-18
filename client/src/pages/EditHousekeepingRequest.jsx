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
          Cập nhật yêu cầu dọn phòng
        </h2>
        <p className="text-sm text-slate-900/70 mt-1 text-center">
          Bạn có chắc chắn muốn cập nhật yêu cầu dọn phòng này không?
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            className="font-medium text-sm bg-white text-slate-900 active:scale-95 transition w-32 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
            aria-label="Hủy cập nhật yêu cầu"
          >
            Hủy
          </button>
          <button
            type="button"
            className="font-medium text-sm text-white bg-red-600 hover:bg-red-700 active:scale-95 transition w-32 h-10 rounded-md"
            onClick={onConfirm}
            aria-label="Xác nhận cập nhật yêu cầu"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  );
};

const EditHousekeepingRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { isAuthenticated, token: contextToken, refreshToken, user } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    roomName: "",
    preferredTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchCurrentUser = async (token) => {
      try {
        const response = await axios.get(`${API_URL}/api/customers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin người dùng:", err);
        setCurrentUser(null);
      }
    };

    const fetchRequest = async () => {
      const queryParams = new URLSearchParams(search);
      const guestToken = localStorage.getItem("guestToken") || queryParams.get("token");;
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
          setErrors({ general: "Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa yêu cầu dọn phòng." });
          toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa yêu cầu dọn phòng.", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/housekeeping-requests/${id}`, config);
        const data = response.data;
        if (data.status !== "PENDING") {
          setErrors({ general: "Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý." });
          toast.error("Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý.", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate(`/housekeeping-requests/${id}${guestToken ? `?token=${guestToken}` : ""}`);
          return;
        }
        setRequest(data);
        setFormData({
          roomName: data.roomName || "",
          preferredTime: data.preferredTime ? data.preferredTime.slice(0, 16) : "",
          notes: data.notes || "",
        });
        setErrors({});
      } catch (err) {
        console.error("Lỗi khi lấy yêu cầu:", err);
        if (err.response?.status === 401 && isAuthenticated) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              await fetchCurrentUser(newToken);
              const retryResponse = await axios.get(`${API_URL}/api/housekeeping-requests/${id}`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              const retryData = retryResponse.data;
              if (retryData.status !== "PENDING") {
                setErrors({ general: "Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý." });
                toast.error("Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý.", {
                  position: "top-right",
                  autoClose: 3000,
                });
                navigate(`/housekeeping-requests/${id}`);
                return;
              }
              setRequest(retryData);
              setFormData({
                roomName: retryData.roomName || "",
                preferredTime: retryData.preferredTime ? retryData.preferredTime.slice(0, 16) : "",
                notes: retryData.notes || "",
              });
              setErrors({});
            } else {
              throw new Error("Làm mới token thất bại");
            }
          } catch (retryErr) {
            console.error("Lỗi làm mới token:", retryErr);
            setErrors({ general: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." });
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
              position: "top-right",
              autoClose: 3000,
            });
            navigate("/login");
          }
        } else {
          const errorMessage =
            err.response?.status === 404
              ? "Không tìm thấy yêu cầu dọn phòng."
              : err.response?.status === 400
              ? "ID yêu cầu hoặc token không hợp lệ."
              : err.response?.data?.message || "Không thể tải yêu cầu dọn phòng.";
          setErrors({ general: errorMessage });
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
          });
          if (err.response?.status === 401) {
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, isAuthenticated, contextToken, refreshToken, navigate, search]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomName.trim()) {
      newErrors.roomName = "Tên phòng là bắt buộc";
    }
    if (!formData.preferredTime) {
      newErrors.preferredTime = "Thời gian ưu tiên là bắt buộc";
    } else {
      const selectedTime = new Date(formData.preferredTime);
      const now = new Date();
      if (selectedTime < now) {
        newErrors.preferredTime = "Thời gian ưu tiên không được là thời điểm trong quá khứ";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const queryParams = new URLSearchParams(search);
    const guestToken = localStorage.getItem("guestToken") || queryParams.get("token");;
    const isGuestRequest = !request.customerId && request.guestEmail;

    if (isAuthenticated && !isGuestRequest && request.customerId !== currentUser?.id) {
      setErrors({ general: "Yêu cầu này thuộc về người dùng khác." });
      toast.error("Yêu cầu này thuộc về người dùng khác.", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    setShowModal(true);
  };

  const handleConfirmSubmit = useCallback(async () => {
    setShowModal(false);
    setIsSubmitting(true);

    const queryParams = new URLSearchParams(search);
    const guestToken = localStorage.getItem("guestToken") || queryParams.get("token");;
    const token = contextToken || localStorage.getItem("accessToken");
    const isGuestRequest = !request.customerId && request.guestEmail;

    try {
      const requestPayload = {
        roomName: formData.roomName.trim(),
        customerId: isAuthenticated && !isGuestRequest ? currentUser?.id : null,
        notes: formData.notes.trim() || null,
        preferredTime: formData.preferredTime,
      };

      const config = {
        headers: { "Content-Type": "application/json" },
        params: {},
      };

      if (isAuthenticated && !isGuestRequest && token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (isGuestRequest && guestToken) {
        config.params.token = guestToken;
      } else {
        throw new Error("Xác thực không hợp lệ để cập nhật yêu cầu");
      }

      await axios.put(`${API_URL}/api/housekeeping-requests/${id}`, requestPayload, config);

      toast.success("Yêu cầu dọn phòng đã được cập nhật thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate(`/housekeeping-requests/${id}${guestToken ? `?token=${guestToken}` : ""}`);
    } catch (err) {
      console.error("Lỗi khi cập nhật yêu cầu:", err);
      if (err.response?.status === 401 && isAuthenticated && !isGuestRequest) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            await axios.put(`${API_URL}/api/housekeeping-requests/${id}`, requestPayload, {
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
            });
            toast.success("Yêu cầu dọn phòng đã được cập nhật thành công!", {
              position: "top-right",
              autoClose: 2000,
            });
            navigate(`/housekeeping-requests/${id}`);
          } else {
            throw new Error("Làm mới token thất bại");
          }
        } catch (retryErr) {
          console.error("Lỗi làm mới token:", retryErr);
          setErrors({ general: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." });
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/login");
        }
      } else {
        const errorMessage =
          err.response?.status === 403
            ? "Bạn không được phép cập nhật yêu cầu này."
            : err.response?.status === 404
            ? "Không tìm thấy yêu cầu dọn phòng."
            : err.response?.status === 400
            ? err.response?.data?.message || "Dữ liệu yêu cầu không hợp lệ."
            : err.response?.data?.message || "Không thể cập nhật yêu cầu dọn phòng.";
        setErrors({ general: errorMessage });
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [contextToken, currentUser, request, formData, refreshToken, navigate, id, search]);

  const handleCancelModal = useCallback(() => {
    setShowModal(false);
    setIsSubmitting(false);
  }, []);

  if (loading) {
    return (
      <div className="py-28 px-4 text-center text-gray-600">
        <Title title="Chỉnh sửa yêu cầu dọn phòng" subTitle="Đang tải chi tiết yêu cầu..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (errors.general || !request) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Chỉnh sửa yêu cầu dọn phòng" subTitle="Không thể tải yêu cầu" align="left" />
        <p className="text-red-500">{errors.general || "Không tìm thấy yêu cầu dọn phòng"}</p>
      </div>
    );
  }

  const isGuestRequest = !request.customerId && request.guestEmail;
  const isEditable = isGuestRequest || (isAuthenticated && request.customerId === currentUser?.id);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title={`Chỉnh sửa yêu cầu dọn phòng - #${request.id}`}
          subTitle="Cập nhật chi tiết yêu cầu dọn phòng của bạn cho Urbanza Suites."
          align="left"
        />
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="font-playfair text-2xl mb-6 text-gray-800">Chi tiết yêu cầu</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Tên phòng</label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleFormChange}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                    errors.roomName ? "border-red-500" : "border-gray-300"
                  } ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="Ví dụ: Phòng 302"
                  disabled={!isEditable}
                />
                {errors.roomName && (
                  <p className="text-red-500 text-sm mt-1">{errors.roomName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Thời gian ưu tiên</label>
                <input
                  type="datetime-local"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleFormChange}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                    errors.preferredTime ? "border-red-500" : "border-gray-300"
                  } ${!isEditable ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={!isEditable}
                />
                {errors.preferredTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.preferredTime}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Ghi chú (Tùy chọn)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                  !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                rows="4"
                placeholder="Bất kỳ chi tiết bổ sung hoặc hướng dẫn đặc biệt nào"
                disabled={!isEditable}
              />
            </div>
            {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !isEditable}
                className={`px-6 py-3 bg-black text-white rounded-md font-medium transition-all ${
                  isSubmitting || !isEditable
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-900 focus:ring-2 focus:ring-black focus:ring-offset-2"
                }`}
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật yêu cầu"}
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
                onClick={() => navigate(`/housekeeping-requests/${id}${search}`)}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmModal
        isOpen={showModal}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelModal}
      />
    </div>
  );
};

export default EditHousekeepingRequest;