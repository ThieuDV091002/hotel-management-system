import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";
import { assets } from "../assets/assets";

const ConfirmSubmitModal = ({ isOpen, onConfirm, onCancel }) => {
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
        <div className="flex items-center justify-center p-3 bg-gray-100 rounded-full">
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
              fill="#1F2937"
            />
            <path
              d="M12.785 16.094h-1.598l-.175-7.851h1.957zm-1.827 2.401q0-.434.283-.722q.283-.287.772-.287t.772.287a1 1 0 0 1 .283.722.97.97 0 0 1-.275.703q-.276.284-.78.284q-.505 0-.78-.284a.97.97 0 0 1-.275-.703"
              fill="#1F2937"
            />
          </svg>
        </div>
        <h2 id="modal-title" className="text-slate-900 text-xl font-medium mt-3">
          Gửi phan hồi
        </h2>
        <p className="text-sm text-slate-900/70 mt-1 text-center">
          Bạn có chắc chắn muốn gửi phản hồi này không?
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            className="font-medium text-sm bg-white text-slate-900 active:scale-95 transition w-32 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
            aria-label="Cancel submission"
          >
            Hủy
          </button>
          <button
            type="button"
            className="font-medium text-sm text-white bg-black hover:bg-gray-800 active:scale-95 transition w-32 h-10 rounded-md"
            onClick={onConfirm}
            aria-label="Confirm submission"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token: contextToken } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchCurrentUser = async (token) => {
      try {
        const response = await axios.get(`${API_URL}/api/customers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Fetch current user error:", err);
      }
    };

    const fetchBookingDetails = async () => {
      if (!isAuthenticated) {
        setError("Vui lòng đăng nhập để gửi phản hồi.");
        toast.error("Vui lòng đăng nhập để gửi phản hồi.", {
          position: "top-right",
          autoClose: 3000,
        });
        setLoading(false);
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const token = contextToken || localStorage.getItem("accessToken");
        await fetchCurrentUser(token);
        const response = await axios.get(`${API_URL}/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooking(response.data.booking);
        setError("");
      } catch (err) {
        const errorMessage =
          err.response?.status === 404
            ? "Không tìm thấy đặt phòng."
            : err.response?.data?.message || "Không tải được thông tin đặt phòng.";
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

    fetchBookingDetails();
  }, [id, isAuthenticated, contextToken, navigate]);

  useEffect(() => {
    if (booking && currentUser && booking.customerId !== currentUser.id) {
      setError("Bạn không được phép đánh giá đặt phòng này.");
      toast.error("Bạn không được phép đánh giá đặt phòng này.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  }, [booking, currentUser]);

  const handleStarClick = (star) => {
    setRating(star);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (rating === 0) {
      setError("Vui lòng chọn xếp hạng.");
      toast.error("Vui lòng chọn xếp hạng.", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    if (booking.customerId !== currentUser?.id) {
      setError("Bạn không được phép đánh giá đặt phòng này.");
      toast.error("Bạn không được phép đánh giá đặt phòng này.", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = useCallback(async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const token = contextToken || localStorage.getItem("accessToken");
      const feedbackPayload = {
        bookingId: parseInt(id, 10),
        rating,
        comment,
      };

      const response = await axios.post(`${API_URL}/api/feedback`, feedbackPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Review submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate(`/booking/${id}`);
    } catch (err) {
      console.error("Xảy ra lỗi khi gửi phản hồi:", err);
      const errorMessage =
        err.response?.status === 403
          ? "Bạn không có quyền đánh giá đặt phòng này."
          : err.response?.status === 400
          ? "Dữ liệu phản hồi không hợp lệ. Đặt phòng có thể đã có phản hồi."
          : err.response?.data?.message || "Khôgng thể gửi phản hồi.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [contextToken, id, rating, comment, navigate]);

  const handleCancelModal = useCallback(() => {
    setShowConfirmModal(false);
    setIsSubmitting(false);
  }, []);

  if (loading) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Phản hồi" subTitle="Đang tải thông tin phản hồi..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Phản hồi" subTitle="Không thể tải đặt phòng" align="left" />
        <p className="text-red-600">{error || "Không tìm thấy đặt phòng"}</p>
      </div>
    );
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title={`Phản hồi đặt phòng - #${booking.id}`}
        subTitle="Chia sẻ trải nghiệm của bạn với Quick Stay."
        align="left"
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <h2 className="font-playfair text-2xl mb-4">Phản hồi của bạn</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Summary */}
            <div className="border-b border-gray-300 pb-4">
              <p className="text-sm text-gray-500">
                Ngày nhận phòng: {new Date(booking.startDate).toDateString()}
              </p>
              <p className="text-sm text-gray-500">
                Ngày trả phòng: {new Date(booking.endDate).toDateString()}
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm text-gray-500" htmlFor="rating">Đánh giá</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <img
                    key={star}
                    src={star <= rating ? assets.starIconFilled : assets.starIconOutlined}
                    alt={`${star} star rating`}
                    className="w-6 h-6 cursor-pointer"
                    onClick={() => handleStarClick(star)}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm text-gray-500" htmlFor="comment">Nhận xét</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2"
                rows="5"
                placeholder="Chia sẻ trải nghiệm của bạn..."
                aria-label="Review comment"
              ></textarea>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || booking.customerId !== currentUser?.id}
                className={`px-4 py-2 bg-black text-white rounded-md transition-all ${
                  isSubmitting || booking.customerId !== currentUser?.id
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-800"
                }`}
                aria-label={isSubmitting ? "Submitting review" : "Submit review"}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-all"
                onClick={() => navigate(`/booking/${id}`)}
                aria-label="Cancel review"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmSubmitModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelModal}
      />
    </div>
  );
};

export default ReviewBooking;