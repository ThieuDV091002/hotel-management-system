import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/customers/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.', {
          position: 'top-right',
          autoClose: 3000,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Gửi email đặt lại mật khẩu thất bại. Vui lòng thử lại.');
        toast.error(errorData.message || 'Gửi email thất bại', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Lỗi quên mật khẩu:', error);
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      toast.error('Đã xảy ra lỗi khi gửi email đặt lại mật khẩu', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="max-w-96 w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white shadow-md"
      >
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">Quên Mật Khẩu</h1>
        <p className="text-gray-500 text-sm mt-2">Nhập email của bạn để đặt lại mật khẩu</p>

        <div className="flex items-center w-full mt-10 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
              fill="#6B7280"
            />
          </svg>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent text-gray-500 placeholder-gray-500 outline-none text-sm w-full h-full"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity"
        >
          Gửi liên kết đặt lại
        </button>

        <p className="text-gray-500 text-sm mt-3 mb-11">
          Chưa có tài khoản? <Link className="text-indigo-500" to="/signup">Đăng ký ngay</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgetPassword;
