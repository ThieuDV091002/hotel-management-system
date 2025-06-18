import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";

const CreateHousekeepingRequest = () => {
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    roomName: "",
    preferredTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để tạo yêu cầu dọn dẹp.", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.roomName.trim()) {
      newErrors.roomName = "Room name is required";
    }
    if (!formData.preferredTime) {
      newErrors.preferredTime = "Preferred time is required";
    } else {
      const selectedTime = new Date(formData.preferredTime);
      const now = new Date();
      if (selectedTime < now) {
        newErrors.preferredTime = "Preferred time cannot be in the past";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const requestPayload = {
        roomName: formData.roomName.trim(),
        customerId: user.id,
        notes: formData.notes.trim() || null,
        preferredTime: formData.preferredTime,
      };

      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `http://localhost:8080/api/housekeeping-requests`,
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Yêu cầu dọn dẹp đã được tạo thành công!", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate(`/housekeeping-requests`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Không tạo được yêu cầu dọn dẹp. Vui lòng thử lại.";
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
  };

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-6xl mx-auto">
        <Title
          title="Tạo yêu cầu dọn dẹp"
          subTitle="Gửi yêu cầu dọn phòng mới cho Quick Stay."
          align="left"
        />
        <div className="mt-8 bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="font-playfair text-2xl mb-6 text-gray-800">Thông tin yêu cầu</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Phòng</label>
                <input
                  type="text"
                  name="roomName"
                  value={formData.roomName}
                  onChange={handleFormChange}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                    errors.roomName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Room 302"
                />
                {errors.roomName && (
                  <p className="text-red-500 text-sm mt-1">{errors.roomName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Thời gian mong muốn</label>
                <input
                  type="datetime-local"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleFormChange}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                    errors.preferredTime ? "border-red-500" : "border-gray-300"
                  }`}
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
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all"
                rows="4"
                placeholder="Bất kỳ thông tin chi tiết bổ sung hoặc hướng dẫn đặc biệt nào bạn muốn cung cấp"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-black text-white rounded-md font-medium transition-all ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-900 focus:ring-2 focus:ring-black focus:ring-offset-2"
                }`}
              >
                {isSubmitting ? "Đang tạo..." : "Tạo yêu cầu"}
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
                onClick={() => navigate("/housekeeping-requests")}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateHousekeepingRequest;