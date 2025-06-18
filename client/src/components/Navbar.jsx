import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';
import { assets } from '../assets/assets';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useContext(AuthContext);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    return name?.charAt(0).toUpperCase() || '?';
  };

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Phòng', path: '/rooms' },
    { name: 'Dịch vụ', path: '/services' },
    { name: 'Liên hệ', path: '/contact' },
    { name: 'Về chúng tôi', path: '/about' },
  ];

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(location.pathname !== '/' || window.scrollY > 10);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 transition-all duration-500 z-50 ${
        isScrolled ? 'bg-white/80 shadow-md text-gray-700 backdrop-blur-lg py-3 md:py-4' : 'py-4 md:py-6'
      }`}
    >
      {/* Logo */}
      <Link to="/">
        <img src={assets.logo} alt="logo" className={`h-9 ${isScrolled && 'invert opacity-80'}`} />
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <a
            key={i}
            href={link.path}
            className={`group flex flex-col gap-0.5 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            {link.name}
            <div
              className={`${isScrolled ? 'bg-gray-700' : 'bg-white'} h-0.5 w-0 group-hover:w-full transition-all duration-300`}
            />
          </a>
        ))}
      </div>

      {/* Desktop Right */}
      <div className="hidden md:flex items-center gap-4 relative">
        <img
          src={assets.searchIcon}
          alt="search"
          className={`h-7 transition-all duration-500 ${isScrolled && 'invert'}`}
        />
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-700">
                {getInitials(user?.fullName)}
              </div>
              <span className={`${isScrolled ? 'text-gray-700' : 'text-white'}`}>
                {user?.fullName || 'User'}
              </span>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Hồ sơ cá nhân
                </Link>
                <Link
                  to="/change-password"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Đổi mật khẩu
                </Link>
                <Link
                  to="/my-booking"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Lịch sử đặt phòng
                </Link>
                <Link
                  to="/service-requests"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Yêu cầu dịch vụ
                </Link>
                <Link
                  to="/housekeeping-requests"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Yêu cầu dọn phòng
                </Link>
                <Link
                  to="/transactions"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Hóa đơn
                </Link>
                <Link
                  to="/reviews"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Lịch sư đánh giá
                </Link>
                <button
                  onClick={() => {
                    handleLogoutClick();
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLoginClick}
            className="bg-black text-white px-8 py-2.5 rounded-full ml-4 transition-all duration-500"
          >
            Đăng nhập
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-3 md:hidden">
        <img
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          src={assets.menuIcon}
          alt="menu"
          className={`h-4 ${isScrolled && 'invert'}`}
        />
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white text-base flex flex-col md:hidden items-center justify-center gap-6 font-medium text-gray-800 transition-all duration-500 ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
          <img src={assets.closeIcon} alt="close" className="h-6.5" />
        </button>

        {navLinks.map((link, i) => (
          <a
            key={i}
            href={link.path}
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-800"
          >
            {link.name}
          </a>
        ))}

        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2">
              <img
                src={user?.avatar || assets.avatarIcon}
                alt="avatar"
                className="h-8 w-8 rounded-full"
              />
              <span>{user?.fullName || 'User'}</span>
            </div>
            <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
              Hô sơ cá nhân
            </Link>
            <Link to="/change-password" onClick={() => setIsMenuOpen(false)}>
              Đổi mật khẩu
            </Link>
            <Link to="/my-booking" onClick={() => setIsMenuOpen(false)}>
              Lịch sử đặt phòng
            </Link>
            <Link to="/service-requests" onClick={() => setIsMenuOpen(false)}>
              Yêu cầu dịch vụ
            </Link>
            <Link to="/housekeeping-requests" onClick={() => setIsMenuOpen(false)}>
              Yêu cầu dọn phòng
            </Link>
            <Link to="/transactions" onClick={() => setIsMenuOpen(false)}>
              Hóa đơn
            </Link>
            <Link to="/reviews" onClick={() => setIsMenuOpen(false)}>
              Lịch sử đánh giá
            </Link>
            <button
              onClick={() => {
                handleLogoutClick();
                setIsMenuOpen(false);
              }}
              className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500"
            >
              Đăng xuất
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              handleLoginClick();
              setIsMenuOpen(false);
            }}
            className="bg-black text-white px-8 py-2.5 rounded-full transition-all duration-500"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;