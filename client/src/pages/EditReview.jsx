import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { assets } from "../assets/assets";
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
          Cập nhật đánh giá
        </h2>
        <p className="text-sm text-slate-900/70 mt-1 text-center">
          Bạn có chắc chắn muốn cập nhật đánh giá này không?
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            className="font-medium text-sm bg-white text-slate-900 active:scale-95 transition w-32 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
            aria-label="Hủy cập nhật đánh giá"
          >
            Hủy
          </button>
          <button
            type="button"
            className="font-medium text-sm text-white bg-red-600 hover:bg-red-700 active:scale-95 transition w-32 h-10 rounded-md"
            onClick={onConfirm}
            aria-label="Xác nhận cập nhật đánh giá"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

const EditReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { isAuthenticated, token: contextToken, refreshToken } = useContext(AuthContext);
  const [review, setReview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

    const fetchReview = async () => {
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
          setError("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa đánh giá.");
          toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa đánh giá.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/feedback/${id}`, config);
        if (!response.data) {
          throw new Error("Không tìm thấy dữ liệu đánh giá trong phản hồi");
        }
        setReview(response.data);
        setFormData({
          rating: response.data.rating || 0,
          comment: response.data.comment || "",
        });
        setError("");
      } catch (err) {
        console.error("Lỗi khi lấy đánh giá:", err);
        if (err.response?.status === 401 && isAuthenticated) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              await fetchCurrentUser(newToken);
              const retryResponse = await axios.get(`${API_URL}/api/feedback/${id}`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              if (!retryResponse.data) {
                throw new Error("Không tìm thấy dữ liệu đánh giá trong phản hồi thử lại");
              }
              setReview(retryResponse.data);
              setFormData({
                rating: retryResponse.data.rating || 0,
                comment: retryResponse.data.comment || "",
              });
              setError("");
            } else {
              throw new Error("Làm mới token thất bại");
            }
          } catch (retryErr) {
            console.error("Lỗi làm mới token:", retryErr);
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate("/login");
          }
        } else if (err.response?.status === 404) {
          setError("Không tìm thấy đánh giá.");
          toast.error("Không tìm thấy đánh giá.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else if (err.response?.status === 400) {
          setError("ID đánh giá hoặc token không hợp lệ.");
          toast.error("ID đánh giá hoặc token không hợp lệ.", {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          const errorMessage = err.response?.data?.message || "Không thể tải đánh giá.";
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

    fetchReview();
  }, [id, isAuthenticated, contextToken, refreshToken, navigate, search]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (formData.rating === 0) {
      setError("Vui lòng chọn một mức đánh giá.");
      toast.error("Vui lòng chọn một mức đánh giá.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    const isGuestReview = !review.customerId && review.guestEmail;
    if (isAuthenticated && !isGuestReview && review.customerId !== currentUser?.id) {
      setError("Đánh giá này thuộc về người dùng khác.");
      toast.error("Đánh giá này thuộc về người dùng khác.", {
        position: "top-right",
        autoClose: 5000,
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
    const guestToken = localStorage.getItem("guestToken") || queryParams.get("token");
    const token = contextToken || localStorage.getItem("accessToken");
    const isGuestReview = !review.customerId && review.guestEmail;

    try {
      const requestPayload = {
        rating: formData.rating,
        comment: formData.comment,
      };

      const config = {
        headers: { "Content-Type": "application/json" },
        params: {},
      };

      if (isAuthenticated && !isGuestReview && token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (isGuestReview && guestToken) {
        config.params.token = guestToken;
      } else {
        throw new Error("Xác thực không hợp lệ để cập nhật đánh giá");
      }

      const response = await axios.put(`${API_URL}/api/feedback/${id}`, requestPayload, config);

      toast.success("Đánh giá đã được cập nhật thành công!", {
        position: "top-right",
        autoClose: 5000,
      });
      isAuthenticated?
      navigate(`/reviews/${id}`) :
      navigate(`/reviews/${id}${guestToken ? `?token=${guestToken}` : ""}`);
    } catch (err) {
      console.error("Lỗi khi cập nhật đánh giá:", err);
      if (err.response?.status === 401 && isAuthenticated && !isGuestReview) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            const retryResponse = await axios.put(`${API_URL}/api/feedback/${id}`, {
              rating: formData.rating,
              comment: formData.comment,
            }, {
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
            });
            toast.success("Đánh giá đã được cập nhật thành công!", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate(`/reviews/${id}`);
          } else {
            throw new Error("Làm mới token thất bại");
          }
        } catch (retryErr) {
          console.error("Lỗi làm mới token:", retryErr);
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate("/login");
        }
      } else {
        const errorMessage =
          err.response?.status === 403
            ? "Bạn không được phép cập nhật đánh giá này."
            : err.response?.status === 404
            ? "Không tìm thấy đánh giá."
            : err.response?.status === 400
            ? "Dữ liệu đánh giá không hợp lệ."
            : err.response?.data?.message || "Không thể cập nhật đánh giá.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [contextToken, formData, refreshToken, navigate, id, search, review]);

  const handleCancelModal = useCallback(() => {
    setShowModal(false);
    setIsSubmitting(false);
  }, []);

  if (loading) {
    return (
      <div className="py-28 px-4 text-center text-gray-800">
        <Title title="Chỉnh sửa đánh giá" subTitle="Đang tải chi tiết đánh giá..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Chỉnh sửa đánh giá" subTitle="Không thể tải đánh giá" align="left" />
        <p className="text-red-600">{error || "Không tìm thấy đánh giá"}</p>
      </div>
    );
  }

  const isGuestReview = !review.customerId && review.guestEmail;
  const isEditable = isGuestReview || (isAuthenticated && review.customerId === currentUser?.id);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <Title
          title="Chỉnh sửa đánh giá"
          subTitle="Cập nhật đánh giá của bạn."
          align="left"
        />
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm text-gray-500" htmlFor="booking">Đặt phòng</label>
              <p className="text-lg">{review.bookingId || "Không có"}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="rating">Đánh giá</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <img
                    key={star}
                    src={star <= formData.rating ? assets.starIconFilled : assets.starIconOutlined}
                    alt={`Đánh giá ${star} sao`}
                    className={`w-6 h-6 ${isEditable ? "cursor-pointer" : "cursor-not-allowed"}`}
                    onClick={() => isEditable && setFormData((prev) => ({ ...prev, rating: star }))}
                    aria-label={`Chọn ${star} sao`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500" htmlFor="comment">Bình luận</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleFormChange}
                className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                  !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
                rows="5"
                placeholder="Chia sẻ trải nghiệm của bạn..."
                aria-label="Bình luận đánh giá"
                disabled={!isEditable}
              ></textarea>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !isEditable}
                className={`px-4 py-2 bg-black text-white rounded-md transition-all ${
                  isSubmitting || !isEditable ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                }`}
                aria-label={isSubmitting ? "Đang lưu đánh giá" : "Lưu đánh giá"}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-all"
                onClick={() => navigate(`/reviews/${id}${search}`)}
                aria-label="Hủy chỉnh sửa"
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

export default EditReview;