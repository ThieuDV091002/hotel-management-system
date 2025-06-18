import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, api } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError('Tên đăng nhập và mật khẩu là bắt buộc');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('http://localhost:8080/api/auth/login', {
        username: trimmedUsername,
        password: trimmedPassword,
      });

      const data = response.data;
      if (!data?.tokenPair?.accessToken || !data?.tokenPair?.refreshToken || !data?.user) {
        setError('Phản hồi không hợp lệ từ máy chủ');
        setIsLoading(false);
        return;
      }

      if (data.user.role !== 'CUSTOMER') {
        setError('Truy cập bị từ chối: Chỉ cho phép người dùng có vai trò CUSTOMER');
        setIsLoading(false);
        return;
      }

      const success = login(
        {
          accessToken: data.tokenPair.accessToken,
          refreshToken: data.tokenPair.refreshToken,
        },
        data.user
      );

      if (success) {
        navigate('/');
      } else {
        setError('Không thể lưu thông tin đăng nhập');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError(error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleLogin}
        className="max-w-96 w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white shadow-md"
      >
        <Link to="/" className="absolute top-6 left-6 text-indigo-500 text-sm">
          ← Trang chủ
        </Link>
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">Đăng nhập</h1>
        <p className="text-gray-500 text-sm mt-2">Vui lòng đăng nhập để tiếp tục</p>

        <div className="flex items-center w-full mt-10 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <label htmlFor="username" className="sr-only">Tên đăng nhập</label>
          <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M3.125 13.125a4.375 4.375 0 0 1 8.75 0M10 4.375a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"
              stroke="#6B7280"
              strokeOpacity=".6"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            id="username"
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full"
            required
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <label htmlFor="password" className="sr-only">Mật khẩu</label>
          <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
              fill="#6B7280"
            />
          </svg>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full"
            required
            aria-describedby={error ? 'login-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="px-3 text-gray-500 text-sm"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>

        {error && (
          <p id="login-error" className="text-red-500 text-sm mt-2">
            {error}
          </p>
        )}

        <div className="mt-5 text-left text-indigo-500">
          <Link className="text-sm" to="/forgot-password">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`mt-2 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className="text-gray-500 text-sm mt-3 mb-11">
          Chưa có tài khoản?{' '}
          <Link className="text-indigo-500" to="/signup">
            Đăng ký
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
