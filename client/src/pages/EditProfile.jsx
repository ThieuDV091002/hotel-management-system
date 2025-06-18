import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, user, login, refreshToken } = useContext(AuthContext);
  const API_URL ="http://localhost:8080";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user) {
        toast.error("Vui lòng đăng nhập để chỉnh sửa thông tin cá nhân", {
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
            fullName: data.fullName || "",
            email: data.email || user.email || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
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
                fullName: retryData.fullName || "",
                email: retryData.email || user.email || "",
                phoneNumber: retryData.phoneNumber || "",
                address: retryData.address || "",
              });
            } else {
              throw new Error("Không tải được hồ sơ sau khi làm mới token");
            }
          } else {
            throw new Error("Làm mới token không thành công");
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "Không tải được hồ sơ");
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
        const errorMessage = error.message === "Làm mới token không thành công"
          ? "Phiên đã hết hạn. Vui lòng đăng nhập lại."
          : error.message || "Đã xảy ra lỗi khi tải hồ sơ của bạn";
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
        if (error.message === "Làm mới token không thành công") {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, refreshToken, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const validateInputs = () => {
    if (!profile.fullName.trim()) {
      return "Tên là bắt buộc";
    }
    if (!profile.email.trim()) {
      return "Email là bắt buộc";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return "Định dạng email không hợp lệ";
    }
    if (profile.phoneNumber && !/^\+?[\d\s-]{8,15}$/.test(profile.phoneNumber)) {
      return "Định dạng số điện thoại không hợp lệ (8-15 chữ số, tùy chọn +, khoảng trắng hoặc dấu gạch ngang)";
    }
    return "";
  };

  const handleSave = async () => {
    setError("");

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      toast.error(validationError, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isAuthenticated) {
        throw new Error("Phiên đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const response = await fetch(`${API_URL}/api/customers/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: profile.fullName.trim(),
          phoneNumber: profile.phoneNumber.trim(),
          email: profile.email.trim(),
          address: profile.address.trim(),
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        login(
          {
            accessToken: token,
            refreshToken: localStorage.getItem("refreshToken"),
          },
          {
            ...user,
            fullName: updatedData.fullName || profile.fullName,
            phoneNumber: updatedData.phoneNumber || profile.phoneNumber,
            email: updatedData.email || profile.email,
            address: updatedData.address || profile.address,
          }
        );
        toast.success("Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/profile", { state: { refresh: true } });
      } else if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          const retryResponse = await fetch(`${API_URL}/api/customers/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify({
              fullName: profile.fullName.trim(),
              phoneNumber: profile.phoneNumber.trim(),
              email: profile.email.trim(),
              address: profile.address.trim(),
            }),
          });
          if (retryResponse.ok) {
            const updatedData = await retryResponse.json();
            login(
              {
                accessToken: newToken,
                refreshToken: localStorage.getItem("refreshToken"),
              },
              {
                ...user,
                fullName: updatedData.fullName || profile.fullName,
                phoneNumber: updatedData.phoneNumber || profile.phoneNumber,
                email: updatedData.email || profile.email,
                address: updatedData.address || profile.address,
              }
            );
            toast.success("Profile updated successfully!", {
              position: "top-right",
              autoClose: 3000,
            });
            navigate("/profile", { state: { refresh: true } });
          } else {
            const errorData = await retryResponse.json();
            throw new Error(errorData.message || "Không cập nhật được hồ sơ sau khi làm mới token");
          }
        } else {
          throw new Error("Làm mới token không thành công");
        }
      } else {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            (response.status === 409 ? "Email đã được sử dụng": "Không thể cập nhật hồ sơ")
        );
      }
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMessage = error.message === "Làm mới token không thành công"
          ? "Phiên đã hết hạn. Vui lòng đăng nhập lại."
          : error.message || "Đã xảy ra lỗi khi cập nhật hồ sơ của bạn";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
      if (error.message === "Lam mới token không thành công") {
        navigate("/login");
      }
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
        <Title title="Chỉnh sửa hồ sơ" subTitle="Đang tải hồ sơ của bạn..." align="left" />
        <p className="text-gray-800">Đang tải...</p>
      </div>
    );
  }

  if (error && !profile.fullName) {
    return (
      <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
        <Title title="Chỉnh sửa hồ sơ" subTitle="Không thể tải hồ sơ" align="left" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="Chỉnh sửa hồ sơ"
        subTitle="Cập nhật thông tin cá nhân của bạn."
        align="left"
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="text-sm text-gray-500">Họ và tên</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm text-gray-500">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="text-sm text-gray-500">Số điện thoại</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                placeholder="+1234567890"
              />
            </div>
            <div>
              <label htmlFor="address" className="text-sm text-gray-500">Địa chỉ</label>
              <input
                type="text"
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-4">
              <button
                type="button"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
                onClick={handleSave}
                aria-label="Save profile"
              >
                Lưu
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-all"
                onClick={handleCancel}
                aria-label="Cancel"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;