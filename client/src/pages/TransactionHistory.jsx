import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import Pagination from "../components/Pagination";
import { AuthContext } from "../context/AuthProvider";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useContext(AuthContext);
  const [folios, setFolios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchFolios = async () => {
      if (!isAuthenticated || !user?.id) {
        setError("Vui lòng đăng nhập để xem lịch sử giao dịch.");
        setLoading(false);
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`http://localhost:8080/api/folios/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage - 1,
            size: itemsPerPage,
          },
        });

        setFolios(response.data.content);
        setTotalPages(response.data.totalPages);
        setError("");
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Không thể tải lịch sử giao dịch. Vui lòng thử lại.";
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

    fetchFolios();
  }, [currentPage, isAuthenticated, token, user, navigate]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatStatus = (status) => {
    switch (status) {
      case "PAID":
        return "Đã thanh toán";
      case "PENDING":
        return "Chờ thanh toán";
      case "UNPAID":
        return "Chưa thanh toán";
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
        <Title
          title="Lịch Sử Giao Dịch"
          subTitle="Xem các hóa đơn của bạn tại Quick Stay."
          align="left"
        />
        <div className="mt-8 w-full text-gray-800">
          <div className="hidden md:grid md:grid-cols-[1fr_2fr_1fr_1fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
            <div>Mã Giao Dịch</div>
            <div>Đặt Phòng</div>
            <div>Số Tiền</div>
            <div>Trạng Thái</div>
            <div>Hành Động</div>
          </div>
          {folios.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Không tìm thấy giao dịch nào.</p>
          ) : (
            folios.map((folio) => (
              <div
                key={folio._id}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr_1fr_1fr] w-full border-b border-gray-300 py-6 first:border-t"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm">{folio.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(folio.createdAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Mã đặt phòng: {folio.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm">{folio.totalAmount} VND</p>
                </div>
                <div className="flex flex-col items-start justify-center pt-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        folio.status === "PAID"
                          ? "bg-green-500"
                          : folio.status === "PENDING"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    <p
                      className={`text-sm ${
                        folio.status === "PAID"
                          ? "text-green-500"
                          : folio.status === "PENDING"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatStatus(folio.status)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
                    onClick={() => navigate(`/transactions/${folio.id}`)}
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

export default TransactionHistory;
