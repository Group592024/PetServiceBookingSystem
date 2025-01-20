import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';

const CustomerRoomList = () => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomsResponse, typesResponse] = await Promise.all([
                    fetch('http://localhost:5023/api/Room/available'),
                    fetch('http://localhost:5023/api/RoomType')
                ]);

                const roomsData = await roomsResponse.json();
                const typesData = await typesResponse.json();

                if (roomsData.data && Array.isArray(roomsData.data)) {
                    const activeRooms = roomsData.data.filter(room => !room.isDeleted);
                    setRooms(activeRooms);
                }

                if (typesData.data && Array.isArray(typesData.data)) {
                    setRoomTypes(typesData.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getRoomTypeName = (roomTypeId) => {
        const roomType = roomTypes.find(type => type.roomTypeId === roomTypeId);
        return roomType ? roomType.name : 'Unknown';
    };

    const getRoomTypePrice = (roomTypeId) => {
        const roomType = roomTypes.find(type => type.roomTypeId === roomTypeId);
        return roomType ? `${roomType.price} VND` : 'N/A';
    };

    return (
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex flex-col">
            <div className=" flex-1 overflow-hidden">
                <NavbarCustomer/>
                <main className="flex-1 overflow-auto p-8">
                    <div className="flex items-center mb-10 mx-auto w-full">
                        <div className="text-center w-full">
                            <h1 className="text-4xl font-bold text-gray-800 tracking-wide">
                                Rooms For Your Pets
                                <div className="h-1 w-32 bg-yellow-400 mx-auto mt-4 rounded-full"></div>
                            </h1>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <CircularProgress />
                        </div>
                    ) : (
                        <div className="bg-gray-50/80 p-8 rounded-2xl shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-10">
                                {rooms.map((room) => (
                                    <div key={room.roomId}
                                        className="bg-white/90 rounded-2xl overflow-hidden transform transition-all duration-300 
                                    hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] 
                                    border border-gray-200">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-10"></div>
                                            <img
                                                src={`http://localhost:5023${room.roomImage}`}
                                                alt={room.roomName}
                                                className="w-full h-96 object-cover"
                                            />
                                        </div>
                                        <div className="p-6 space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-2xl font-bold text-gray-800 tracking-wide">
                                                    {room.roomName}
                                                </h2>
                                                <span className="text-2xl font-bold text-green-600">
                                                    {getRoomTypePrice(room.roomTypeId)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="space-y-4">
                                                    <p className="text-xl text-gray-600 font-medium">
                                                        {getRoomTypeName(room.roomTypeId)}
                                                    </p>
                                                    <span className={`inline-block px-4 py-2 rounded-full font-semibold text-base
                                                        ${room.status === 'Free'
                                                            ? 'bg-green-100 text-green-600'
                                                            : room.status === 'In Use'
                                                                ? 'bg-orange-100 text-orange-600'
                                                                : 'bg-red-100 text-red-600'}`}>
                                                        {room.status}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/customerRoom/${room.roomId}`)}
                                                    className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-xl font-semibold 
                                                             hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105
                                                             hover:shadow-md"
                                                >
                                                    See more
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CustomerRoomList;
