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
              d="M12.785 16.094h-1.598l-.175-7.851h1.957zm-1.827 2.401q0-.434.283-.722q.283-.287.772-.287t.772.287a1 1 0 0 1 .283.722.97.97 0 0 1-.275.703q-.276.284-.78.284q-.505 0-.78-.284a.97.97 0 0 1-.275-.703"
              fill="#DC2626"
            />
          </svg>
        </div>
        <h2 id="modal-title" className="text-slate-900 text-xl font-medium mt-3">
          Hủy Yêu Cầu Dịch Vụ
        </h2>
        <p className="text-sm text-slate-900/70 mt-1 text-center">
          Bạn có chắc chắn muốn hủy yêu cầu dịch vụ này không? Hành động này không thể hoàn tác.
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            className="font-medium text-sm bg-white text-slate-900 active:scale-95 transition w-32 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
            aria-label="Hủy bỏ việc hủy yêu cầu dịch vụ"
          >
            Hủy
          </button>
          <button
            type="button"
            className="font-medium text-sm text-white bg-red-600 hover:bg-red-700 active:scale-95 transition w-32 h-10 rounded-md"
            onClick={onConfirm}
            aria-label="Xác nhận hủy yêu cầu dịch vụ"
          >
            Xác Nhận Hủy
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
      toast.error("Vui lòng nhập mã OTP 6 chữ số.", {
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
          Xác Minh OTP Qua Email
        </p>
        <p className="mt-2 text-sm text-gray-900/90 text-center">
          Nhập mã 6 chữ số đã được gửi đến email của bạn.
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
              aria-label={`Mã OTP chữ số ${index + 1}`}
            />
          ))}
        </div>
        {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
        <button
          type="button"
          className="mt-8 w-full max-w-80 h-11 rounded-full text-white text-sm bg-indigo-500 hover:opacity-90 transition-opacity"
          onClick={handleVerify}
          aria-label="Xác minh OTP"
        >
          Xác Minh
        </button>
      </div>
    </div>
  );
};

const ServiceRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { isAuthenticated, token: contextToken, refreshToken } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpAction, setOtpAction] = useState(null);
  const API_URL = "http://localhost:8080";

  const statusTranslations = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang xử lý",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
  };

  useEffect(() => {
    const fetchRequest = async () => {
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
          setError("Vui lòng đăng nhập hoặc cung cấp mã hợp lệ để xem chi tiết yêu cầu dịch vụ.");
          toast.error("Vui lòng đăng nhập hoặc cung cấp mã hợp lệ để xem chi tiết yêu cầu dịch vụ.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate("/login");
          return;
        }

        const requestResponse = await axios.get(`${API_URL}/api/service-requests/${id}`, config);
        const requestData = requestResponse.data;
        if (!requestData) {
          throw new Error("Không tìm thấy dữ liệu yêu cầu dịch vụ trong phản hồi");
        }
        setRequest(requestData);
        setError("");
      } catch (err) {
        console.error("Lỗi lấy yêu cầu:", err);
        if (err.response?.status === 401 && isAuthenticated) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              const configRetry = { headers: { Authorization: `Bearer ${newToken}` } };
              const retryRequestResponse = await axios.get(`${API_URL}/api/service-requests/${id}`, configRetry);
              const requestData = retryRequestResponse.data;
              if (!requestData) {
                throw new Error("Không tìm thấy dữ liệu yêu cầu dịch vụ trong phản hồi thử lại");
              }
              setRequest(requestData);
              setError("");
            } else {
              throw new Error("Làm mới mã thất bại");
            }
          } catch (retryErr) {
            console.error("Lỗi làm mới mã:", retryErr);
            setError("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
            toast.error("Phiên đã hết hạn. Vui lòng đăng nhập lại.", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate("/login");
          }
        } else if (err.response?.status === 404) {
          setError("Không tìm thấy yêu cầu dịch vụ hoặc đặt phòng.");
          toast.error("Không tìm thấy yêu cầu dịch vụ hoặc đặt phòng.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else if (err.response?.status === 400) {
          setError("ID yêu cầu hoặc mã không hợp lệ.");
          toast.error("ID yêu cầu hoặc mã không hợp lệ.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          const errorMessage = err.response?.data?.message || "Không thể tải chi tiết yêu cầu dịch vụ.";
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

    fetchRequest();
  }, [id, isAuthenticated, contextToken, refreshToken, navigate, search]);

  const handleRequestOTP = async (action) => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    try {
      const response = await axios.post(`${API_URL}/api/service-requests/${id}/request-otp`, null, {
        params: { token: guestToken },
      });
      toast.success(response.data || "OTP đã được gửi đến email của bạn.", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowOTPModal(true);
      setOtpError("");
      setOtpAction(action);
    } catch (err) {
      console.error(`Lỗi yêu cầu OTP cho ${action}:`, err);
      const errorMessage = err.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleCancelRequest = async () => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    const isGuestRequest = !request.customerId && request.guestEmail;

    if (request.status !== "PENDING") {
      toast.error("Chỉ có thể hủy các yêu cầu đang chờ xử lý.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (isAuthenticated && !isGuestRequest) {
      setShowConfirmModal(true);
    } else if (isGuestRequest && guestToken) {
      await handleRequestOTP("cancel");
    } else {
      toast.error("Vui lòng đăng nhập hoặc cung cấp mã hợp lệ để hủy yêu cầu.", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate("/login");
    }
  };

  const handleEditRequest = async () => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    const isGuestRequest = !request.customerId && request.guestEmail;

    if (request.status !== "PENDING") {
      toast.error("Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (isAuthenticated && !isGuestRequest) {
      navigate(`/service-requests/edit/${id}`);
    } else if (isGuestRequest && guestToken) {
      await handleRequestOTP("edit");
    } else {
      toast.error("Vui lòng đăng nhập hoặc cung cấp mã hợp lệ để chỉnh sửa yêu cầu.", {
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
      const response = await axios.post(`${API_URL}/api/service-requests/${id}/verify-otp`, null, {
        params: { token: guestToken, otp: otpCode },
      });
      toast.success(response.data || "OTP đã được xác minh thành công.", {
        position: "top-right",
        autoClose: 3000,
      });

      const statusResponse = await axios.get(`${API_URL}/api/service-requests/${id}/otp-status`, {
        params: { token: guestToken },
      });

      if (statusResponse.data === true) {
        setShowOTPModal(false);
        if (otpAction === "cancel") {
          setShowConfirmModal(true);
        } else if (otpAction === "edit") {
          navigate(`/service-requests/edit/${id}`);
        }
        setOtpError("");
        setOtpAction(null);
      } else {
        throw new Error("Trạng thái xác minh OTP không hợp lệ.");
      }
    } catch (err) {
      console.error(`Lỗi xác minh OTP cho ${otpAction}:`, err);
      const errorMessage = err.response?.data?.message || "OTP không hợp lệ. Vui lòng thử lại.";
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
    const isGuestRequest = !request.customerId && request.guestEmail;

    try {
      const config = {};
      if (isAuthenticated && !isGuestRequest && token) {
        config.headers = { Authorization: `Bearer ${token}` };
      } else if (isGuestRequest && guestToken) {
        config.params = { token: guestToken };
      } else {
        throw new Error("Xác thực không hợp lệ để hủy");
      }

      await axios.delete(`${API_URL}/api/service-requests/${id}`, config);
      toast.success("Yêu cầu đã được hủy thành công!", {
        position: "top-right",
        autoClose: 5000,
      });
      isAuthenticated
        ? navigate("/service-requests")
        : navigate(`/service-requests/${id}?token=${guestToken}`);
    } catch (err) {
      console.error("Lỗi hủy yêu cầu:", err);
      if (err.response?.status === 401 && isAuthenticated && !isGuestRequest) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            await axios.delete(`${API_URL}/api/service-requests/${id}`, {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            toast.success("Yêu cầu đã được hủy thành công!", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate("/service-requests");
          } else {
            throw new Error("Làm mới mã thất bại");
          }
        } catch (retryErr) {
          console.error("Lỗi làm mới mã khi hủy:", retryErr);
          toast.error("Phiên đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate("/login");
        }
      } else {
        const errorMessage =
          err.response?.status === 403
            ? "Bạn không được phép hủy yêu cầu này."
            : err.response?.status === 404
            ? "Không tìm thấy yêu cầu dịch vụ."
            : err.response?.status === 400
            ? "Không thể hủy yêu cầu. Yêu cầu có thể ở trạng thái không hợp lệ."
            : err.response?.data?.message || "Không thể hủy yêu cầu. Vui lòng thử lại.";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setIsCancelling(false);
    }
  }, [contextToken, refreshToken, navigate, id, search, request]);

  const handleCancelModal = useCallback(() => {
    setShowConfirmModal(false);
    setShowOTPModal(false);
    setOtpError("");
    setOtpAction(null);
  }, []);

  if (loading) {
    return (
      <div className="py-28 px-4 text-center text-gray-800">
        <Title title="Chi Tiết Yêu Cầu Dịch Vụ" subTitle="Đang tải chi tiết yêu cầu..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Chi Tiết Yêu Cầu Dịch Vụ" subTitle="Không thể tải yêu cầu" align="left" />
        <p className="text-red-600">{error || "Không tìm thấy yêu cầu dịch vụ"}</p>
      </div>
    );
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title="Chi Tiết Yêu Cầu Dịch Vụ"
          subTitle="Xem chi tiết yêu cầu dịch vụ của bạn."
          align="left"
        />
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Mã Yêu Cầu</p>
              <p className="text-md">{request.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mã Đặt Phòng</p>
              <p className="text-md">{request.bookingId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tên Khách</p>
              <p className="text-md">{request.customerName || request.guestName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dịch Vụ</p>
              <p className="text-md">{request.serviceName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đơn Giá</p>
              <p className="text-md">{(request.unitPrice || 0).toLocaleString("vi-VN")} VND</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số Lượng</p>
              <p className="text-md">{request.quantity || 1}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng Tiền</p>
              <p className="text-md">{(request.totalAmount || 0).toLocaleString("vi-VN")} VND</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trạng Thái</p>
              <p
                className={`text-md ${
                  request.status === "COMPLETED"
                    ? "text-green-600"
                    : request.status === "PENDING"
                    ? "text-yellow-600"
                    : request.status === "IN_PROGRESS"
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {statusTranslations[request.status] || request.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày Yêu Cầu</p>
              <p className="text-md">
                {request.createdAt
                  ? new Date(request.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Ghi Chú</p>
              <p className="text-md">{request.notes || "Không có ghi chú"}</p>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            {request.status === "PENDING" && (
              <>
                <button
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md transition-all ${
                    isCancelling ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                  }`}
                  onClick={handleEditRequest}
                  disabled={isCancelling}
                  aria-label="Chỉnh sửa yêu cầu dịch vụ"
                >
                  Chỉnh Sửa Yêu Cầu
                </button>
                <button
                  className={`px-4 py-2 bg-red-600 text-white rounded-md transition-all ${
                    isCancelling ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
                  }`}
                  onClick={handleCancelRequest}
                  disabled={isCancelling}
                  aria-label="Hủy yêu cầu dịch vụ"
                >
                  {isCancelling ? "Đang Hủy..." : "Hủy Yêu Cầu"}
                </button>
              </>
            )}
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-all"
              onClick={() => navigate("/service-requests")}
              aria-label="Quay lại danh sách yêu cầu dịch vụ"
            >
              Quay Lại
            </button>
          </div>
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

export default ServiceRequestDetail;