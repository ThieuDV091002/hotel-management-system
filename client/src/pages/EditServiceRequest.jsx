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
          Cập nhật yêu cầu dịch vụ
        </h2>
        <p className="text-sm text-slate-900/70 mt-1 text-center">
          Bạn có chắc chắn muốn cập nhật yêu cầu dịch vụ này không?
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button
            type="button"
            className="font-medium text-sm bg-white text-slate-900 active:scale-95 transition w-32 h-10 rounded-md border border-gray-300 hover:bg-gray-100"
            onClick={onCancel}
            aria-label="Hủy cập nhật yêu cầu dịch vụ"
          >
            Hủy
          </button>
          <button
            type="button"
            className="font-medium text-sm text-white bg-red-600 hover:bg-red-700 active:scale-95 transition w-32 h-10 rounded-md"
            onClick={onConfirm}
            aria-label="Xác nhận cập nhật yêu cầu dịch vụ"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

const EditServiceRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { isAuthenticated, token: contextToken, refreshToken } = useContext(AuthContext);
  const [request, setRequest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    serviceId: "",
    quantity: 1,
  });
  const [error, setError] = useState("");
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

    const fetchData = async () => {
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
          setError("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa yêu cầu dịch vụ.");
          toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để chỉnh sửa yêu cầu dịch vụ.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate("/login");
          return;
        }

        const requestResponse = await axios.get(`${API_URL}/api/service-requests/${id}`, config);
        const data = requestResponse.data;
        if (data.status !== "PENDING") {
          setError("Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý.");
          toast.error("Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý.", {
            position: "top-right",
            autoClose: 5000,
          });
          navigate(`/service-requests/${id}${guestToken ? `?token=${guestToken}` : ""}`);
          return;
        }
        setRequest(data);
        setFormData({
          serviceId: data.serviceId || "",
          quantity: data.quantity || 1,
        });

        const servicesResponse = await axios.get(`${API_URL}/api/services`, config);
        setServices(servicesResponse.data.content || []);
        setError("");
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        if (err.response?.status === 401 && isAuthenticated) {
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem("accessToken", newToken);
              await fetchCurrentUser(newToken);
              const retryRequestResponse = await axios.get(`${API_URL}/api/service-requests/${id}`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              const data = retryRequestResponse.data;
              if (data.status !== "PENDING") {
                setError("Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý.");
                toast.error("Chỉ có thể chỉnh sửa các yêu cầu đang chờ xử lý.", {
                  position: "top-right",
                  autoClose: 5000,
                });
                navigate(`/service-requests/${id}`);
                return;
              }
              setRequest(data);
              setFormData({
                serviceId: data.serviceId || "",
                quantity: data.quantity || 1,
              });

              const retryServicesResponse = await axios.get(`${API_URL}/api/services`, {
                headers: { Authorization: `Bearer ${newToken}` },
              });
              setServices(retryServicesResponse.data.content || []);
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
              ? "Không tìm thấy yêu cầu dịch vụ."
              : err.response?.status === 400
              ? "ID yêu cầu hoặc token không hợp lệ."
              : err.response?.data?.message || "Không thể tải yêu cầu dịch vụ.";
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

    fetchData();
  }, [id, isAuthenticated, contextToken, refreshToken, navigate, search]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const queryParams = new URLSearchParams(search);
    const guestToken = localStorage.getItem("guestToken") || queryParams.get("token");
    const isGuestRequest = !request.customerId && request.guestEmail;

    if (!isAuthenticated && !guestToken) {
      setError("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để cập nhật yêu cầu dịch vụ.");
      toast.error("Vui lòng đăng nhập hoặc cung cấp token hợp lệ để cập nhật yêu cầu dịch vụ.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    if (!formData.serviceId) {
      setError("Vui lòng chọn một dịch vụ.");
      toast.error("Vui lòng chọn một dịch vụ.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (formData.quantity < 1) {
      setError("Số lượng phải ít nhất là 1.");
      toast.error("Số lượng phải ít nhất là 1.", {
        position: "top-right",
        autoClose: 5000,
      });
      setIsSubmitting(false);
      return;
    }

    if (isAuthenticated && !isGuestRequest && request.customerId !== currentUser?.id) {
      setError("Yêu cầu này thuộc về người dùng khác.");
      toast.error("Yêu cầu này thuộc về người dùng khác.", {
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
    const isGuestRequest = !request.customerId && request.guestEmail;

    try {
      const requestPayload = {
        serviceId: formData.serviceId,
        quantity: formData.quantity,
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

      await axios.put(`${API_URL}/api/service-requests/${id}`, requestPayload, config);

      toast.success("Yêu cầu dịch vụ đã được cập nhật thành công!", {
        position: "top-right",
        autoClose: 5000,
      });
      navigate(`/service-requests/${id}${guestToken ? `?token=${guestToken}` : ""}`);
    } catch (err) {
      console.error("Lỗi khi cập nhật yêu cầu:", err);
      if (err.response?.status === 401 && isAuthenticated && !isGuestRequest) {
        try {
          const newToken = await refreshToken();
          if (newToken) {
            localStorage.setItem("accessToken", newToken);
            await axios.put(`${API_URL}/api/service-requests/${id}`, requestPayload, {
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
            });
            toast.success("Yêu cầu dịch vụ đã được cập nhật thành công!", {
              position: "top-right",
              autoClose: 5000,
            });
            navigate(`/service-requests/${id}`);
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
            ? "Bạn không được phép cập nhật yêu cầu này."
            : err.response?.status === 404
            ? "Không tìm thấy yêu cầu dịch vụ."
            : err.response?.status === 400
            ? err.response?.data?.message || "Dữ liệu dịch vụ hoặc yêu cầu không hợp lệ."
            : err.response?.data?.message || "Không thể cập nhật yêu cầu dịch vụ.";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
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
      <div className="py-28 px-4 text-center text-gray-800">
        <Title title="Chỉnh sửa yêu cầu dịch vụ" subTitle="Đang tải chi tiết yêu cầu..." align="left" />
        <p>Đang tải...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="py-28 px-4 text-center">
        <Title title="Chỉnh sửa yêu cầu dịch vụ" subTitle="Không thể tải yêu cầu" align="left" />
        <p className="text-red-600">{error || "Không tìm thấy yêu cầu dịch vụ"}</p>
      </div>
    );
  }

  const isGuestRequest = !request.customerId && request.guestEmail;
  const isEditable = isGuestRequest || (isAuthenticated && request.customerId === currentUser?.id);

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title={`Chỉnh sửa yêu cầu dịch vụ - #${request.id}`}
          subTitle="Cập nhật chi tiết yêu cầu dịch vụ của bạn."
          align="left"
        />
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-300">
          <h2 className="font-playfair text-2xl mb-4">Chi tiết yêu cầu</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500" htmlFor="serviceId">
                  Dịch vụ
                </label>
                <select
                  id="serviceId"
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleFormChange}
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                    !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  aria-label="Chọn dịch vụ"
                  disabled={!isEditable}
                >
                  <option value="">Chọn một dịch vụ</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.serviceName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500" htmlFor="quantity">
                  Số lượng
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleFormChange}
                  min="1"
                  className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black mt-2 ${
                    !isEditable ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  aria-label="Số lượng"
                  disabled={!isEditable}
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting || !isEditable}
                className={`px-4 py-2 bg-black text-white rounded-md transition-all ${
                  isSubmitting || !isEditable ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
                }`}
                aria-label={isSubmitting ? "Đang cập nhật yêu cầu" : "Cập nhật yêu cầu"}
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật yêu cầu"}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-all"
                onClick={() => navigate(`/service-requests/${id}${search}`)}
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

export default EditServiceRequest;