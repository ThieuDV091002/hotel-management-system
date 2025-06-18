import { useState, useEffect } from 'react';
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import PageMeta from "../components/common/PageMeta";
import { Role } from "../context/Role";

interface UserData {
  fullName: string;
  email: string;
  phoneNumber: string;
  salary?: string;
  hireDate?: string;
  role: Role;
}

export default function UserProfiles() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/employees/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUserData({
            ...data,
            role: data.role || 'USER' as Role,
          });
        } else {
          console.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    if (accessToken) fetchUserData();
  }, [accessToken]);

  const updateUserData = (updatedData: UserData) => {
    setUserData(updatedData);
  };

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Profile" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>
        <div className="space-y-6">
          <UserMetaCard userData={userData} />
          {userData && <UserInfoCard userData={userData} updateUserData={updateUserData} />}
          <UserAddressCard />
        </div>
      </div>
    </>
  );
}