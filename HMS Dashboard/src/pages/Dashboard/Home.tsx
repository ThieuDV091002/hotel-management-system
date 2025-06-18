import MonthlyBookingsChart from "../../components/dashboard/MonthlyBookingsChart";
import MonthlyTarget from "../../components/dashboard/MonthlyTarget";
import RecentOrders from "../../components/dashboard/RecentFeedbacks";
import RecentBookings from "../../components/dashboard/RecentBookings";
import PageMeta from "../../components/common/PageMeta";
import CheckInOutMetrics from "../../components/dashboard/CheckInOutMetrics";
import ReExMetrics from "../../components/dashboard/ReExMetrics";
import AdminMetrics from "../../components/dashboard/AdminMetrics";

export default function Home() {
  return (
    <>
      <PageMeta
        title="React.js Admin Dashboard"
        description="This is React.js Admin Dashboard page"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <AdminMetrics />

          <MonthlyBookingsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-6">
          <CheckInOutMetrics />
        </div>
        <div className="col-span-12 space-y-6 xl:col-span-6">
          <ReExMetrics />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <RecentOrders />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <RecentBookings />
        </div>
      </div>
    </>
  );
}
