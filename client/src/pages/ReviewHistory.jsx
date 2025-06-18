import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";
import { assets } from "../assets/assets";
import Pagination from "../components/Pagination";

const ReviewHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useContext(AuthContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!isAuthenticated) {
        setError("Vui lòng đăng nhập để xem lịch sử phản hồi của bạn.");
        setLoading(false);
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:8080/api/feedback/my-feedback`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage - 1,
            size: itemsPerPage,
          },
        });

        const feedbackData = response.data.content;
        setFeedbacks(feedbackData);
        setTotalPages(response.data.totalPages);
        setError("");

        const bookingIds = [...new Set(feedbackData.map((f) => f.bookingId))];
        const bookingPromises = bookingIds.map((bookingId) =>
          axios.get(`/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => {
            console.error(`Failed to fetch booking ${bookingId}:`, err);
            return { data: { id: bookingId, hotel: { name: "N/A" } } };
          })
        );

        const bookingResponses = await Promise.all(bookingPromises);
        const newBookingDetails = bookingResponses.reduce((acc, res) => {
          acc[res.data.id] = res.data;
          return acc;
        }, {});

        setBookingDetails((prev) => ({ ...prev, ...newBookingDetails }));
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Không tải được phản hồi. Vui lòng thử lại.";
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

    fetchFeedback();
  }, [currentPage, isAuthenticated, token, navigate]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return <div className="py-28 px-4 text-center">Đang tải...</div>;
  }

  if (error) {
    return <div className="py-28 px-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="Lịch sử phản hồi"
        subTitle="Xem các phản hồi bạn đã gửi cho các đặt phòng của bạn."
        align="left"
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
          <div>ID</div>
          <div>Đơn đặt phòn</div>
          <div>Đánh giá</div>
          <div>Nhận xét</div>
          <div>Hành động</div>
        </div>
        {feedbacks.length === 0 ? (
          <p className="text-center text-gray-500 py-6">Không tìm thấy phản hồi nào.</p>
        ) : (
          feedbacks.map((review) => (
            <div
              key={review.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">{review.id}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500">ID đặt phòng: {review.bookingId}</p>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <img
                    key={star}
                    src={star <= review.rating ? assets.starIconFilled : assets.starIconOutlined}
                    alt={`${star} star`}
                    className="w-4 h-4"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm">
                  {review.comment.substring(0, 50)}
                  {review.comment.length > 50 ? "..." : ""}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(review.dateTime).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center">
                <button
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
                  onClick={() => navigate(`/reviews/${review.id}`)}
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
  );
};

export default ReviewHistory;