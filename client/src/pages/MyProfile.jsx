import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, refreshToken } = useContext(AuthContext);
  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) {
        toast.error("Vui lòng đăng nhập để xem hồ sơ của bạn", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_URL}/api/customers/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProfile({
            name: user.fullName || data.fullName || "Chưa cung cấp",
            email: user.email || data.email || "Chưa cung cấp",
            phone: user.phoneNumber || data.phoneNumber || "Chưa cung cấp",
            address: data.address || "Chưa cung cấp",
            loyaltyLevel: data.loyaltyLevelName || "Cơ bản",
            loyaltyPoints: data.loyaltyPoints || 0,
            loyaltyBenefits: data.loyaltyBenefits
              ? data.loyaltyBenefits.split(",").map((benefit) => benefit.trim()).filter(Boolean)
              : ["Không có ưu đãi nào"],
          });
        } else if (response.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            const retryResponse = await fetch(`${API_URL}/api/customers/profile`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`,
              },
            });
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              setProfile({
                name: user.fullName || retryData.fullName || "Chưa cung cấp",
                email: user.email || retryData.email || "Chưa cung cấp",
                phone: user.phoneNumber || retryData.phoneNumber || "Chưa cung cấp",
                address: retryData.address || "Chưa cung cấp",
                loyaltyLevel: retryData.loyaltyLevelName || "Cơ bản",
                loyaltyPoints: retryData.loyaltyPoints || 0,
                loyaltyBenefits: retryData.loyaltyBenefits
                  ? retryData.loyaltyBenefits.split(",").map((benefit) => benefit.trim()).filter(Boolean)
                  : ["Không có ưu đãi nào"],
              });
            } else {
              throw new Error("Không thể tải hồ sơ sau khi làm mới token");
            }
          } else {
            throw new Error("Làm mới token thất bại");
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Không thể tải hồ sơ");
        }
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
        const errorMessage = error.message === "Làm mới token thất bại"
          ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          : error.message || "Đã xảy ra lỗi khi tải hồ sơ";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
        if (error.message === "Làm mới token thất bại") {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, refreshToken, navigate, location.state?.refresh]);

  const handleEditProfileClick = () => {
    navigate("/edit-profile");
  };

  const handleLoyaltyProgramClick = () => {
    navigate("/loyalty-program");
  };

  if (loading) {
    return (
      <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
        <Title title="Hồ sơ của tôi" subTitle="Đang tải thông tin hồ sơ..." align="left" />
        <p className="text-gray-800">Đang tải...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
        <Title title="Hồ sơ của tôi" subTitle="Không thể tải thông tin hồ sơ" align="left" />
        <p className="text-red-500">{error || "Không có dữ liệu hồ sơ"}</p>
      </div>
    );
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="Hồ sơ của tôi"
        subTitle="Quản lý thông tin cá nhân và chương trình khách hàng thân thiết."
        align="left"
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Thông tin cá nhân */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
            <h2 className="font-playfair text-3xl mb-4">Thông tin cá nhân</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Họ và tên</label>
                <p className="text-md">{profile.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="text-md">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Số điện thoại</label>
                <p className="text-md">{profile.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Địa chỉ</label>
                <p className="text-md">{profile.address}</p>
              </div>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
              onClick={handleEditProfileClick}
            >
              Chỉnh sửa hồ sơ
            </button>
          </div>

          {/* Chương trình khách hàng thân thiết */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
            <h2 className="font-playfair text-2xl mb-4">Chương trình thân thiết</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Hạng thành viên</label>
                <p className="text-md font-medium">{profile.loyaltyLevel}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Điểm tích lũy</label>
                <p className="text-md">{profile.loyaltyPoints} điểm</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Ưu đãi</label>
                <ul className="list-disc list-inside text-md">
                  {profile.loyaltyBenefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              className="mt-6 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
              onClick={handleLoyaltyProgramClick}
            >
              Xem chi tiết chương trình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;