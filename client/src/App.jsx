import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import MyBookings from './pages/MyBookings';
import MyProfile from './pages/MyProfile';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import LoyaltyProgram from './pages/LoyaltyProgram';
import BookingDetails from './pages/BookingDetails';
import ReviewBooking from './pages/ReviewBooking';
import ReviewHistory from './pages/ReviewHistory';
import ReviewDetail from './pages/ReviewDetail';
import EditReview from './pages/EditReview';
import TransactionHistory from './pages/TransactionHistory';
import TransactionDetail from './pages/TransactionDetail';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import ServiceRequestHistory from './pages/ServiceRequestHistory';
import ServiceRequestDetail from './pages/ServiceRequestDetail';
import EditBooking from './pages/EditBooking';
import EditServiceRequest from './pages/EditServiceRequest';
import HousekeepingRequestHistory from './pages/HousekeepingRequestHistory';
import HousekeepingRequestDetail from './pages/HousekeepingRequestDetail';
import EditHousekeepingRequest from './pages/EditHousekeepingRequest';
import CreateHousekeepingRequest from './pages/CreateHousekeepingRequest';

const App = () => {
  const location = useLocation();
  
  const hideNavbarRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div>
      {!shouldHideNavbar && <Navbar />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-booking" element={<MyBookings />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
          <Route path="/booking/:id/edit" element={<EditBooking />} />
          <Route path="/booking/:id/review" element={<ReviewBooking />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/loyalty-program" element={<LoyaltyProgram />} />
          <Route path="/reviews" element={<ReviewHistory />} />
          <Route path="/reviews/:id" element={<ReviewDetail />} />
          <Route path="/reviews/edit/:id" element={<EditReview />} /> 
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} /> 
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetails />} />
          <Route path="/service-requests" element={<ServiceRequestHistory />} />
          <Route path="/service-requests/:id" element={<ServiceRequestDetail />} />
          <Route path="/service-requests/edit/:id" element={<EditServiceRequest />} />
          <Route path="/housekeeping-requests" element={<HousekeepingRequestHistory />} />
          <Route path="/housekeeping-requests/:id" element={<HousekeepingRequestDetail />} />
          <Route path="/housekeeping-requests/edit/:id" element={<EditHousekeepingRequest />} />
          <Route path="/housekeeping-requests/new" element={<CreateHousekeepingRequest />} />
        </Routes>
      </div>
      <Footer />
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
      />
    </div>
  );
};

export default App;
