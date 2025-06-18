import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Changed to react-router-dom
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import EmployeeTable from "./pages/Tables/EmployeeTable";
import EmployeeDetails from "./pages/Tables/EmployeeDetails";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import CustomerTable from "./pages/Tables/CustomerTable";
import RoomTable from "./pages/Tables/RoomTable";
import RoomDetails from "./pages/Tables/RoomDetails";
import { ToastContainer } from "react-toastify";
import CustomerDetails from "./pages/Tables/CustomerDetails";
import LoyaltyLevelTable from "./pages/Tables/LoyaltyLevelTable";
import LoyaltyLevelDetails from "./pages/Tables/LoyaltyLevelDetails";
import HousekeepingRequestTable from "./pages/Tables/HousekeepingRequestTable";
import HousekeepingDetails from "./pages/Tables/HousekeepingRequestDetails";
import ServiceRequestTable from "./pages/Tables/ServiceRequestTable";
import ServiceRequestDetails from "./pages/Tables/ServiceRequestDetails";
import AmenityTable from "./pages/Tables/AmenityTable";
import AmenityDetails from "./pages/Tables/AmenityDetails";
import AmenityHistoryTable from "./pages/Tables/AmenityHistoryTable";
import AmenityHistoryDetails from "./pages/Tables/AmenityHistoryDetails";
import AssetTable from "./pages/Tables/AssetTable";
import AssetDetails from "./pages/Tables/AssetDetails";
import FeedbackTable from "./pages/Tables/FeedbackTable";
import FeedbackDetails from "./pages/Tables/FeedbackDetails";
import FolioTable from "./pages/Tables/FolioTable";
import FolioDetails from "./pages/Tables/FolioDetails";
import GuestTable from "./pages/Tables/GuestTable";
import GuestDetails from "./pages/Tables/GuestDetails";
import InventoryTable from "./pages/Tables/InventoryTable";
import InventoryDetails from "./pages/Tables/InventoryDetails";
import OperatingExpenseTable from "./pages/Tables/OperatingExpenseTable";
import OperatingExpenseDetails from "./pages/Tables/OperatingExpenseDetails";
import ServiceTable from "./pages/Tables/ServiceTable";
import ServiceDetails from "./pages/Tables/ServiceDetails";
import SupplierTable from "./pages/Tables/SupplierTable";
import SupplierDetails from "./pages/Tables/SupplierDetails";
import SalaryTable from "./pages/Tables/SalaryTable";
import SalaryDetails from "./pages/Tables/SalaryDetails";
import AuditReportTable from "./pages/Tables/AuditReportTable";
import AuditReportDetails from "./pages/Tables/AuditReportDetails";
import MaintenanceScheduleTable from "./pages/Tables/MaintenanceScheduleTable";
import MaintenanceScheduleDetails from "./pages/Tables/MaintenanceScheduleDetails";
import MyMaintenanceScheduleTable from "./pages/Tables/MyMaintenanceScheduleTable";
import MyMaintenanceScheduleDetails from "./pages/Tables/MyMaintenanceScheduleDetails";
import InventoryReceiptTable from "./pages/Tables/InventoryReceiptTable";
import InventoryReceiptDetails from "./pages/Tables/InventoryReceiptDetails";
import BookingTable from "./pages/Tables/BookingTable";
import BookingDetails from "./pages/Tables/BookingDetails";
import HousekeepingScheduleTable from "./pages/Tables/HousekeepingScheduleTable";
import HousekeepingScheduleDetails from "./pages/Tables/HousekeepingScheduleDetails";
import MyHousekeepingScheduleTable from "./pages/Tables/MyHousekeepingScheduleTable";
import MyScheduleTable from "./pages/Tables/MyScheduleTable";
import WorkScheduleTable from "./pages/Tables/WorkScheduleTable";
import Welcome from "./pages/Welcome";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ marginTop: "70px" }}
        />
        <Routes>
          {/* Default route for the app */}
          <Route path="/signin" element={<SignIn />} />

          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Home route */}
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard" element={<Home />} />

            {/* Other Pages */}
            <Route path="/profile" element={<UserProfiles />} />

            {/* Table and Detail Routes */}
            <Route path="/employee-table" element={<EmployeeTable />} />
            <Route path="/employee/:id" element={<EmployeeDetails />} />
            <Route path="/customer-table" element={<CustomerTable />} />
            <Route path="/customer/:id" element={<CustomerDetails />} />
            <Route path="/loyalty-level" element={<LoyaltyLevelTable />} />
            <Route path="/loyalty/:id" element={<LoyaltyLevelDetails />} />
            <Route path="/room-table" element={<RoomTable />} />
            <Route path="/room/:id" element={<RoomDetails />} />
            <Route path="/hp-request" element={<HousekeepingRequestTable />} />
            <Route path="/hp-request/:id" element={<HousekeepingDetails />} />
            <Route path="/service-request" element={<ServiceRequestTable />} />
            <Route path="/service-request/:id" element={<ServiceRequestDetails />} />
            <Route path="/amenity" element={<AmenityTable />} />
            <Route path="/amenity/:id" element={<AmenityDetails />} />
            <Route path="/amenity-history" element={<AmenityHistoryTable />} />
            <Route path="/amenity-history/:id" element={<AmenityHistoryDetails />} />
            <Route path="/asset" element={<AssetTable />} />
            <Route path="/asset/:id" element={<AssetDetails />} />
            <Route path="/feedback" element={<FeedbackTable />} />
            <Route path="/feedback/:id" element={<FeedbackDetails />} />
            <Route path="/folio" element={<FolioTable />} />
            <Route path="/folio/:id" element={<FolioDetails />} />
            <Route path="/guest" element={<GuestTable />} />
            <Route path="/guest/:id" element={<GuestDetails />} />
            <Route path="/inventory" element={<InventoryTable />} />
            <Route path="/inventory/:id" element={<InventoryDetails />} />
            <Route path="/op-expense" element={<OperatingExpenseTable />} />
            <Route path="/op-expense/:id" element={<OperatingExpenseDetails />} />
            <Route path="/services" element={<ServiceTable />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
            <Route path="/supplier" element={<SupplierTable />} />
            <Route path="/supplier/:id" element={<SupplierDetails />} />
            <Route path="/salary" element={<SalaryTable />} />
            <Route path="/salary/:id" element={<SalaryDetails />} />
            <Route path="/audit-report" element={<AuditReportTable />} />
            <Route path="/audit-report/:id" element={<AuditReportDetails />} />
            <Route path="/maintenance-schedule" element={<MaintenanceScheduleTable />} />
            <Route path="/maintenance-schedule/:id" element={<MaintenanceScheduleDetails />} />
            <Route path="/my-mt-schedule" element={<MyMaintenanceScheduleTable />} />
            <Route path="/my-mt-schedule/:id" element={<MyMaintenanceScheduleDetails />} />
            <Route path="/inventory-receipt" element={<InventoryReceiptTable />} />
            <Route path="/inventory-receipt/:id" element={<InventoryReceiptDetails />} />
            <Route path="/booking" element={<BookingTable />} />
            <Route path="/booking/:id" element={<BookingDetails />} />
            <Route path="/housekeeping-schedule" element={<HousekeepingScheduleTable />} />
            <Route path="/housekeeping-schedule/:id" element={<HousekeepingScheduleDetails />} />
            <Route path="/my-hp-schedule" element={<MyHousekeepingScheduleTable />} />
            <Route path="/my-schedule" element={<MyScheduleTable />} />
            <Route path="/work-schedule" element={<WorkScheduleTable />} />
          </Route>

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}