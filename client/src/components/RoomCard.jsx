import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const RoomCard = ({ room, index }) => {
  const imagePath = `http://localhost:8080${room.imageUrl}`

  return (
    <Link
      to={`/rooms/${room.id}`}
      onClick={() => scrollTo(0, 0)}
      className='relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)]'
    >
      <img src={imagePath} alt={room.roomName} className="w-full h-52 object-cover" />

      <div className='p-4 pt-5'>
        <div className='flex items-center justify-between'>
          <p className='font-playfair text-xl font-medium text-gray-800'>{room.roomName}</p>
          <div className='flex items-center gap-1'>
            <img src={assets.starIconFilled} alt="" />4.5
          </div>
        </div>
        <div className='flex items-center gap-1 text-sm'>
          <span>{room.roomType}</span>
        </div>
        <div className='flex items-center justify-between mt-4'>
          <p>
            <span className='text-xl text-gray-800'>{new Intl.NumberFormat('vi-VN').format(room.price)} VND</span> / đêm
          </p>
          <button className='px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all cursor-pointer'>
            Xem chi tiết
          </button>
        </div>
      </div>
    </Link>
  )
}

export default RoomCard
