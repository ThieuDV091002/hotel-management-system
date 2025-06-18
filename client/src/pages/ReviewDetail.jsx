import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";
import { assets } from "../assets/assets";

const ConfirmDeleteModal = ({ isOpen, onConfirm, onCancel }) => {
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
          Xóa phản hồi
        </h2>
        <p className="text-sm text-slate-900/70 mt-1 text-center">
          Bạn có chắc chắn muốn xóa phản hồi này không? Hành động này không thể hoàn tác.
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            className="font-medium text-sm bg-white text-slate-900 active:scale-95 transition w-32 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
            aria-label="Cancel deletion"
          >
            Hủy
          </button>
          <button
            type="button"
            className="font-medium text-sm text-white bg-red-600 hover:bg-red-700 active:scale-95 transition w-32 h-10 rounded-md"
            onClick={onConfirm}
            aria-label="Confirm deletion"
          >
            Xóa
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
      toast.error("Vui lòng nhập mã OTP gồm 6 chữ số.", {
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

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { isAuthenticated, token: contextToken, refreshToken } = useContext(AuthContext);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [otpAction, setOtpAction] = useState(null);
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchFeedback = async () => {
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
          setError("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để xem chi tiết phản hồi.");
          toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để xem chi tiết phản hồi.", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/login");
          return;
        }

        const feedbackResponse = await axios.get(`${API_URL}/api/feedback/${id}`, config);
        if (!feedbackResponse.data) {
          throw new Error("Feedback data not found in response");
        }
        setReview(feedbackResponse.data);
        setError("");
      } catch (err) {
        console.error("Fetch feedback error:", err);
        if (err.response?.status === 401 && isAuthenticated) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              const retryResponse = await axios.get(`${API_URL}/api/feedback/${id}`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              if (!retryResponse.data) {
                throw new Error("Feedback data not found in retry response");
              }
              setReview(retryResponse.data);
              setError("");
            } else {
              throw new Error("Token refresh failed");
            }
          } catch (retryErr) {
            console.error("Token refresh error:", retryErr);
            setError("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
            toast.error("Phiên đã hết hạn. Vui lòng đăng nhập lại.", {
              position: "top-right",
              autoClose: 3000,
            });
            navigate("/login");
          }
        } else if (err.response?.status === 404) {
          setError("Không tim thấy phản hồi.");
          toast.error("Không tim thấy phản hồi.", {
            position: "top-right",
            autoClose: 3000,
          });
        } else if (err.response?.status === 400) {
          setError("ID phản hồi hoặc token không hợp lệ.");
          toast.error("ID phản hồi hoặc token không hợp lệ.", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          const errorMessage = err.response?.data?.message || "Không tải được thông tin phản hồi. Vui lòng thử lại.";
          setError(errorMessage);
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [id, isAuthenticated, contextToken, refreshToken, navigate, search]);

  const handleRequestOTP = async (action) => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    localStorage.setItem("guestToken", guestToken);
    try {
      const response = await axios.post(`${API_URL}/api/feedback/${id}/request-otp`, null, {
        params: { token: guestToken },
      });
      toast.success(response.data || "Mã OTP đã được gửi tới email của bạn.", {
        position: "top-right",
        autoClose: 3000,
      });
      setShowOTPModal(true);
      setOtpError("");
      setOtpAction(action);
    } catch (err) {
      console.error(`Request OTP error for ${action}:`, err);
      const errorMessage = err.response?.data?.message || "Không gửi được OTP. Vui lòng thử lại.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDeleteReview = async () => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    const isGuestReview = !review.customerId && review.guestEmail;

    if (isAuthenticated && !isGuestReview) {
      setShowDeleteModal(true);
    } else if (isGuestReview && guestToken) {
      await handleRequestOTP("delete");
    } else {
      toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để xóa phản hồi.", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/");
    }
  };

  const handleEditReview = async () => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    const isGuestReview = !review.customerId && review.guestEmail;

    if (isAuthenticated && !isGuestReview) {
      navigate(`/reviews/edit/${id}`);
    } else if (isGuestReview && guestToken) {
      await handleRequestOTP("edit");
    } else {
      toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa phản hồi.", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");

    try {
      const response = await axios.post(`${API_URL}/api/feedback/${id}/verify-otp`, null, {
        params: { token: guestToken, otp: otpCode },
      });
      toast.success(response.data || "Xác minh OTP thành công", {
        position: "top-right",
        autoClose: 3000,
      });

      const statusResponse = await axios.get(`${API_URL}/api/feedback/${id}/otp-status`, {
        params: { token: guestToken },
      });

      if (statusResponse.data === true) {
        setShowOTPModal(false);
        if (otpAction === "delete") {
          setShowDeleteModal(true);
        } else if (otpAction === "edit") {
          navigate(`/reviews/edit/${id}`);
        }
        setOtpError("");
        setOtpAction(null);
      } else {
        throw new Error("Trạng thái xác minh OTP không hợp lệ.");
      }
    } catch (err) {
      console.error(`Verify OTP error for ${otpAction}:`, err);
      const errorMessage = err.response?.data?.message || "OTP không hợp lệ. Vui lòng thử lại.";
      setOtpError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleDelete = useCallback(async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);

    const queryParams = new URLSearchParams(search);
    const guestToken = queryParams.get("token");
    const token = contextToken || localStorage.getItem("accessToken");
    const isGuestReview = !review.customerId && review.guestEmail;

    try {
      const config = {};
      if (isAuthenticated && !isGuestReview && token) {
        config.headers = { Authorization: `Bearer ${token}` };
      } else if (isGuestReview && guestToken) {
        config.params = { token: guestToken };
      } else {
        throw new Error("Xác thực không hợp lệ để xóa");
      }

      await axios.delete(`${API_URL}/api/feedback/${id}`, config);
      toast.success("Phản hồi đã được xóa thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/reviews");
    } catch (err) {
      console.error("Delete review error:", err);
      if (err.response?.status === 401 && isAuthenticated && !isGuestReview) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            await axios.delete(`${API_URL}/api/feedback/${id}`, {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            toast.success("Phản hồi đã được xóa thành công!", {
              position: "top-right",
              autoClose: 3000,
            });
            navigate("/reviews");
          } else {
            throw new Error("Làm mới token không thành công");
          }
        } catch (retryErr) {
          console.error("Token refresh error during delete:", retryErr);
          toast.error("Phiên đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 3000,
          });
          navigate("/login");
        }
      } else {
        const errorMessage =
          err.response?.status === 403
            ? "Bạn không có quyền xóa bài đánh giá này."
            : err.response?.status === 404
            ? "Không tìm thấy phản hồi."
            : err.response?.data?.message || "Không thể xóa phản hồi.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setIsDeleting(false);
    }
  }, [contextToken, refreshToken, navigate, id, search, review]);

  const handleCloseModal = useCallback(() => {
    setShowDeleteModal(false);
    setShowOTPModal(false);
    setOtpError("");
    setOtpAction(null);
  }, []);

  if (loading) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Thông tin phản hồi" subTitle="Đang tải thông tin phản hồi..." align="left" />
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Thông tin phản hồi" subTitle="Không thể tải phản hồi" align="left" />
        <p className="text-red-600">{error || "Feedback not found"}</p>
      </div>
    );
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="Thông tin phản hồi"
        subTitle="Xem chi tiết phản hồi của bạn."
        align="left"
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID đặt phòng</p>
              <p className="text-md">{review.bookingId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Họ và tên</p>
              <p className="text-md">{review.customerName || review.guestName || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đánh giá</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <img
                    key={star}
                    src={star <= review.rating ? assets.starIconFilled : assets.starIconOutlined}
                    alt={`${star} star`}
                    className="w-5 h-5"
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày tạo phản hồi</p>
              <p className="text-md">
                {new Date(review.dateTime).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Nhận xét</p>
              <p className="text-md">{review.comment || "No comment provided."}</p>
            </div>
          </div>
          <div className="mt-6 flex gap-4">
            <button
              className={`px-4 py-2 bg-black text-white rounded-md transition-all ${
                isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
              }`}
              onClick={handleEditReview}
              disabled={isDeleting}
              aria-label="Edit review"
            >
              Chỉnh sửa
            </button>
            <button
              className={`px-4 py-2 bg-red-600 text-white rounded-md transition-all ${
                isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
              }`}
              onClick={handleDeleteReview}
              disabled={isDeleting}
              aria-label="Delete review"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </button>
            <button
              className={`px-4 py-2 bg-gray-300 text-black rounded-md transition-all ${
                isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-400"
              }`}
              onClick={() => navigate("/reviews")}
              disabled={isDeleting}
              aria-label="Back to reviews"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={handleCloseModal}
      />
      <OTPModal
        isOpen={showOTPModal}
        onVerify={handleVerifyOTP}
        onCancel={handleCloseModal}
        otpError={otpError}
      />
    </div>
  );
};

export default ReviewDetail;