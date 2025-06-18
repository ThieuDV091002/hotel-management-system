import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";

const ChangePassword = () => {
  const [matKhauHienTai, setMatKhauHienTai] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState("");
  const [loi, setLoi] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const xuLyDoiMatKhau = async () => {
    setLoi("");

    if (!matKhauHienTai || !matKhauMoi || !xacNhanMatKhau) {
      setLoi("Tất cả các trường đều bắt buộc");
      toast.error("Tất cả các trường đều bắt buộc", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (matKhauMoi.length < 6) {
      setLoi("Mật khẩu mới phải có ít nhất 6 ký tự");
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (matKhauMoi !== xacNhanMatKhau) {
      setLoi("Mật khẩu mới và mật khẩu xác nhận không khớp");
      toast.error("Mật khẩu mới và mật khẩu xác nhận không khớp", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isAuthenticated) {
        setLoi("Bạn phải đăng nhập để thay đổi mật khẩu");
        toast.error("Vui lòng đăng nhập để tiếp tục", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/api/customers/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: matKhauHienTai, newPassword: matKhauMoi, confirmPassword: xacNhanMatKhau }),
      });

      if (response.ok) {
        toast.success("Đổi mật khẩu thành công!", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/profile");
      } else {
        const errorData = await response.json();
        setLoi(errorData.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.");
        toast.error(errorData.message || "Đổi mật khẩu thất bại", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      setLoi("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      toast.error("Đã xảy ra lỗi khi đổi mật khẩu", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const huyBo = () => {
    navigate("/profile");
  };

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="Đổi Mật Khẩu"
        subTitle="Cập nhật mật khẩu để tăng tính bảo mật."
        align={"left"}
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={matKhauHienTai}
                onChange={(e) => setMatKhauHienTai(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Mật khẩu mới</label>
              <input
                type="password"
                value={matKhauMoi}
                onChange={(e) => setMatKhauMoi(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-500">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={xacNhanMatKhau}
                onChange={(e) => setXacNhanMatKhau(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                required
              />
            </div>
            {loi && <p className="text-red-500 text-sm">{loi}</p>}
            <div className="flex gap-4">
              <button
                type="button"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all"
                onClick={xuLyDoiMatKhau}
              >
                Đổi mật khẩu
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition-all"
                onClick={huyBo}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
