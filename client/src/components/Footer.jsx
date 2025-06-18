import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='bg-[#F9F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
      <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
        <div className='max-w-80'>
          <img src={assets.logo} alt="logo" className='mb-4 h-8 md:h-9 invert opacity-80' />
          <p className='text-sm'>
            Khám phá những nơi lưu trú tuyệt vời nhất thế giới, từ khách sạn boutique đến biệt thự sang trọng và đảo riêng.
          </p>
          <div className='flex items-center gap-3 mt-4'>
            <img src={assets.instagramIcon} alt="Instagram" className='w-6' />
            <img src={assets.facebookIcon} alt="Facebook" className='w-6' />
            <img src={assets.twitterIcon} alt="Twitter" className='w-6' />
            <img src={assets.linkendinIcon} alt="LinkedIn" className='w-6' />
          </div>
        </div>

        <div>
          <p className='font-playfair text-lg text-gray-800'>CÔNG TY</p>
          <ul className='mt-3 flex flex-col gap-2 text-sm'>
            <li><a href="#">Về chúng tôi</a></li>
            <li><a href="#">Cơ hội nghề nghiệp</a></li>
            <li><a href="#">Tin tức</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Đối tác</a></li>
          </ul>
        </div>

        <div>
          <p className='font-playfair text-lg text-gray-800'>HỖ TRỢ</p>
          <ul className='mt-3 flex flex-col gap-2 text-sm'>
            <li><a href="#">Trung tâm trợ giúp</a></li>
            <li><a href="#">Thông tin an toàn</a></li>
            <li><a href="#">Chính sách hủy</a></li>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Hỗ trợ tiếp cận</a></li>
          </ul>
        </div>

        <div className='max-w-80'>
          <p className='font-playfair text-lg text-gray-800'>CẬP NHẬT MỚI NHẤT</p>
          <p className='mt-3 text-sm'>
            Đăng ký nhận bản tin để nhận cảm hứng và các ưu đãi đặc biệt.
          </p>
          <div className='flex items-center mt-4'>
            <input
              type="text"
              className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none'
              placeholder='Email của bạn'
            />
            <button className='flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r'>
              <img src={assets.arrowIcon} alt="Gửi" className='w-3.5 invert' />
            </button>
          </div>
        </div>
      </div>
      <hr className='border-gray-300 mt-8' />
      <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
        <p>© {new Date().getFullYear()} QuickStay. Mọi quyền được bảo lưu.</p>
        <ul className='flex items-center gap-4'>
          <li><a href="#">Chính sách bảo mật</a></li>
          <li><a href="#">Điều khoản</a></li>
          <li><a href="#">Sơ đồ trang</a></li>
        </ul>
      </div>
    </div>
  )
}

export default Footer
