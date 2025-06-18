import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Title from "../components/Title";
import { AuthContext } from "../context/AuthProvider";

const LoyaltyProgram = () => {
  const [user, setUser] = useState(null);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        toast.error("Vui lòng đăng nhập để xem chương trình khách hàng thân thiết", {
          position: "top-right",
          autoClose: 3000,
        });
        navigate("/login");
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");

        const profileResponse = await fetch("http://localhost:8080/api/customers/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          setError(errorData.message || "Không thể tải thông tin người dùng");
          toast.error(errorData.message || "Không thể tải thông tin người dùng", {
            position: "top-right",
            autoClose: 3000,
          });
          if (profileResponse.status === 401) {
            navigate("/login");
          }
          return;
        }

        const profileData = await profileResponse.json();
        setUser({
          loyaltyLevel: profileData.loyaltyLevelName,
          loyaltyPoints: profileData.loyaltyPoints,
        });

        const levelsResponse = await fetch("http://localhost:8080/api/loyalty-levels", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!levelsResponse.ok) {
          const errorData = await levelsResponse.json();
          setError(errorData.message || "Không thể tải danh sách cấp độ");
          toast.error(errorData.message || "Không thể tải danh sách cấp độ", {
            position: "top-right",
            autoClose: 3000,
          });
          if (levelsResponse.status === 401) {
            navigate("/login");
          }
          return;
        }

        const levelsData = await levelsResponse.json();
        setLevels(
          levelsData.map((level) => ({
            level: level.levelName,
            pointsRequired: level.pointsRequired,
            benefits: level.benefits.split(",").map((benefit) => benefit.trim()),
          }))
        );
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Đã xảy ra lỗi khi tải dữ liệu");
        toast.error("Đã xảy ra lỗi khi tải dữ liệu", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
        <Title
          title="Chương Trình Khách Hàng Thân Thiết"
          subTitle="Đang tải chương trình..."
          align={"left"}
        />
        <p className="text-gray-800">Đang tải...</p>
      </div>
    );
  }

  if (error || !user || !levels.length) {
    return (
      <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
        <Title
          title="Chương Trình Khách Hàng Thân Thiết"
          subTitle="Không thể tải chương trình"
          align={"left"}
        />
        <p className="text-red-500">{error || "Không có dữ liệu để hiển thị"}</p>
      </div>
    );
  }

  const currentLevel = levels.find((level) => level.level === user.loyaltyLevel);
  const nextLevel = levels
    .filter((level) => level.pointsRequired > user.loyaltyPoints)
    .sort((a, b) => a.pointsRequired - b.pointsRequired)[0];

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="Chương Trình Khách Hàng Thân Thiết"
        subTitle="Khám phá các lợi ích khi tham gia chương trình."
        align={"left"}
      />
      <div className="max-w-6xl mt-8 w-full text-gray-800">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-300">
          <h2 className="font-playfair text-2xl mb-4">Trạng Thái Của Bạn</h2>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-lg font-medium">{user.loyaltyLevel}</p>
              <p className="text-sm text-gray-500">{user.loyaltyPoints} điểm</p>
            </div>
          </div>
          <p className="mt-4 text-sm">
            {currentLevel ? (
              nextLevel ? (
                <>
                  Bạn cần thêm {nextLevel.pointsRequired - user.loyaltyPoints} điểm để đạt cấp{" "}
                  {nextLevel.level}.
                </>
              ) : (
                <>Bạn đang ở cấp cao nhất ({user.loyaltyLevel}).</>
              )
            ) : (
              <>
                Không xác định được cấp độ hiện tại. Vui lòng liên hệ bộ phận hỗ trợ.
                {console.warn(`Không tìm thấy cấp độ phù hợp cho: ${user.loyaltyLevel}`)}
              </>
            )}
          </p>
        </div>
        <div className="mt-8">
          <h2 className="font-playfair text-2xl mb-4">Các Cấp Độ Khách Hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((level) => (
              <div
                key={level.level}
                className="bg-white p-4 rounded-lg shadow border border-gray-300"
              >
                <h3 className="text-xl font-medium">{level.level}</h3>
                <p className="text-sm text-gray-500">
                  Cần {level.pointsRequired} điểm
                </p>
                <ul className="mt-2 list-disc list-inside text-sm">
                  {level.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyProgram;