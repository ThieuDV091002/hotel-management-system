import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";

const folioStatusMap = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  PENDING: "Đang chờ xử lý",
};

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, token: contextToken, refreshToken, isAuthLoading } = useContext(AuthContext);
  const [folioData, setFolioData] = useState({ folio: null, folioCharges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const API_URL = "http://localhost:8080";

  const queryParams = new URLSearchParams(location.search);
  const guestToken = queryParams.get("token");

  const fetchFolio = useCallback(async () => {
    const token = isAuthenticated ? (contextToken || localStorage.getItem("accessToken")) : null;

    if (!isAuthenticated && !guestToken) {
      setError("Vui lòng đăng nhập hoặc sử dụng liên kết hợp lệ để xem chi tiết giao dịch.");
      toast.error("Vui lòng đăng nhập hoặc sử dụng liên kết hợp lệ để xem chi tiết giao dịch.", {
        position: "top-right",
        autoClose: 5000,
      });
      setLoading(false);
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/folios/${id}`, {
        params: guestToken ? { token: guestToken } : {},
        headers: isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {},
      });
      setFolioData({
        folio: response.data.folio || null,
        folioCharges: response.data.folioCharges || [],
      });
      setError("");
    } catch (err) {
      console.error("Lỗi khi lấy thông tin giao dịch:", err);
      if (err.response?.status === 401 && isAuthenticated) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            const retryResponse = await axios.get(`${API_URL}/api/folios/${id}`, {
              headers: { Authorization: `Bearer ${newToken}` },
            });
            setFolioData({
              folio: retryResponse.data.folio || null,
              folioCharges: retryResponse.data.folioCharges || [],
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
      } else {
        const errorMessage =
          err.response?.status === 404
            ? "Không tìm thấy giao dịch."
            : err.response?.status === 403
            ? guestToken
              ? "Mã truy cập không hợp lệ hoặc không được phép."
              : "Bạn không có quyền xem giao dịch này."
            : err.response?.data?.message || "Không thể tải chi tiết giao dịch.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, contextToken, refreshToken, navigate, guestToken]);

  const handleZaloPayPayment = useCallback(async () => {
    setProcessingPayment(true);
    try {
      const token = isAuthenticated ? (contextToken || localStorage.getItem("accessToken")) : null;
      const response = await axios.post(
        `${API_URL}/api/payments/${id}/initiate`,
        {},
        {
          params: { provider: "zalopay" },
          headers: isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (response.data.status === "success" && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.data.message || "Không thể khởi tạo thanh toán ZaloPay.");
      }
    } catch (err) {
      console.error("Lỗi khởi tạo thanh toán ZaloPay:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể khởi tạo giao dịch thanh toán ZaloPay.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setProcessingPayment(false);
    }
  }, [id, isAuthenticated, contextToken]);

  const verifyPayment = useCallback(async () => {
    try {
      const token = isAuthenticated ? (contextToken || localStorage.getItem("accessToken")) : null;
      const response = await axios.get(`${API_URL}/api/payments/${id}/verify`, {
        params: { provider: "zalopay" },
        headers: isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.data.status === "success" && response.data.paid) {
        toast.success("Xác minh thanh toán thành công và hóa đơn đã được cập nhật!", {
          position: "top-right",
          autoClose: 5000,
        });
        fetchFolio();
      } else {
        toast.error(response.data.message || "Xác minh thanh toán thất bại!", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (err) {
      console.error("Lỗi xác minh thanh toán:", err);
      const errorMessage =
        err.response?.data?.message || "Không thể xác minh thanh toán.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [id, isAuthenticated, contextToken, fetchFolio]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (queryParams.has("status")) {
      verifyPayment();
      isAuthenticated ? 
      navigate(`/transactions/${id}`, { replace: true })
      : navigate(`/transactions/${id}?token=${guestToken}`, { replace: true });
    } else {
      fetchFolio();
    }
  }, [location.search, id, navigate, fetchFolio, verifyPayment, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="py-28 px-4 text-center text-gray-800">
        <Title title="Chi tiết giao dịch" subTitle="Đang xác minh đăng nhập..." align="left" />
        <p>Đang kiểm tra đăng nhập...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-28 px-4 text-center text-gray-800">
        <Title title="Chi tiết giao dịch" subTitle="Đang tải chi tiết giao dịch..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !folioData.folio) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Chi tiết giao dịch" subTitle="Không thể tải chi tiết giao dịch" align="left" />
        <p className="text-red-600">{error || "Không tìm thấy giao dịch"}</p>
      </div>
    );
  }

  const { folio, folioCharges } = folioData;
  const isPaid = folio.status === "PAID";

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title="Chi tiết giao dịch"
          subTitle="Xem chi tiết giao dịch của bạn."
          align="left"
        />
        <div className="mt-8 w-full text-gray-800">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
            <h2 className="font-playfair text-2xl mb-4">Thông tin giao dịch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mã giao dịch</p>
                <p className="text-md">{folio.id || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mã đặt phòng</p>
                <p className="text-md">{folio.bookingId || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Khách hàng</p>
                <p className="text-md">{folio.customerName || "Khách"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="text-md">
                  {folio.createdAt
                    ? new Date(folio.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số tiền</p>
                <p className="text-md">{(folio.totalAmount || 0).toLocaleString("vi-VN")} VND</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <p
                  className={`text-md ${isPaid ? "text-green-600" : "text-red-600"}`}
                >
                  {folioStatusMap[folio.status] || "N/A"}
                </p>
              </div>
            </div>

            <h2 className="font-playfair text-2xl mt-8 mb-4">Chi tiết chi phí</h2>
            {folioCharges.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left text-sm text-gray-600">Tên mục</th>
                      <th className="py-2 px-4 text-left text-sm text-gray-600">Loại chi phí</th>
                      <th className="py-2 px-4 text-left text-sm text-gray-600">Mô tả</th>
                      <th className="py-2 px-4 text-left text-sm text-gray-600">Số lượng</th>
                      <th className="py-2 px-4 text-left text-sm text-gray-600">Đơn giá</th>
                      <th className="py-2 px-4 text-left text-sm text-gray-600">Tổng giá</th>
                      <th className="py-2 px-4 text-left text-sm text-gray-600">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folioCharges.map((charge) => (
                      <tr key={charge.id} className="border-t">
                        <td className="py-2 px-4 text-sm">{charge.itemName || "N/A"}</td>
                        <td className="py-2 px-4 text-sm">{charge.chargeType || "N/A"}</td>
                        <td className="py-2 px-4 text-sm">{charge.description || "Không có mô tả"}</td>
                        <td className="py-2 px-4 text-sm">{charge.quantity || 0}</td>
                        <td className="py-2 px-4 text-sm">{(charge.unitPrice || 0).toLocaleString("vi-VN")} VND</td>
                        <td className="py-2 px-4 text-sm">{(charge.totalPrice || 0).toLocaleString("vi-VN")} VND</td>
                        <td className="py-2 px-4 text-sm">
                          {charge.chargeTime
                            ? new Date(charge.chargeTime).toLocaleString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Không có chi phí liên quan đến giao dịch này.</p>
            )}
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
                onClick={() => navigate(guestToken ? "/" : "/transactions")}
                aria-label="Quay lại"
              >
                Quay lại
              </button>
              {!isPaid && (
                <button
                  className={`px-4 py-2 bg-green-600 text-white rounded-md transition-all flex items-center ${
                    processingPayment ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                  }`}
                  onClick={handleZaloPayPayment}
                  disabled={processingPayment}
                  aria-label={processingPayment ? "Đang xử lý thanh toán" : "Thanh toán qua ZaloPay"}
                >
                  {processingPayment ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    "Thanh toán qua ZaloPay"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;