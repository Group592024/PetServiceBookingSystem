import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import Swal from 'sweetalert2';

const CustomerRoomList = () => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [roomTypes, setRoomTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const [roomsResponse, typesResponse] = await Promise.all([
                    fetch('http://localhost:5050/api/Room/available', {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5050/api/RoomType', {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                ]);

                if (!roomsResponse.ok || !typesResponse.ok) {
                    throw new Error("Failed to fetch data");
                }

                const roomsData = await roomsResponse.json();
                const typesData = await typesResponse.json();

                setRooms(roomsData.data?.filter(room => !room.isDeleted) || []);
                setRoomTypes(typesData.data || []);

            } catch (error) {
                Swal.fire("Error", "Failed to fetch room data!", "error");
                console.error("Error fetching data:", error);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-yellow-50">
            <NavbarCustomer />
            <main className="container mx-auto px-4 py-8">
                {/* Enhanced Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Luxury Pet Rooms
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Choose the perfect accommodation for your beloved pet
                    </p>
                    <div className="h-1.5 w-40 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto mt-6 rounded-full"></div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <CircularProgress />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                        {rooms.map((room) => (
                            <div
                                key={room.roomId}
                                className="bg-white rounded-3xl overflow-hidden group transition-all duration-300 
                                         hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] relative"
                            >
                                {/* Image Section */}
                                <div className="relative h-80 overflow-hidden">
                                    <img
                                        src={`http://localhost:5050/facility-service${room.roomImage}`}
                                        alt={room.roomName}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Status Badge */}
                                    <div className="absolute top-6 right-6">
                                        <span className={`px-4 py-2 rounded-full font-medium text-sm
                                            ${room.status === 'Free'
                                                ? 'bg-green-500 text-white'
                                                : room.status === 'In Use'
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-red-500 text-white'}`}>
                                            {room.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                                {room.roomName}
                                            </h2>
                                            <p className="text-gray-600 font-medium">
                                                {getRoomTypeName(room.roomTypeId)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 mb-1">Price per night</p>
                                            <span className="text-2xl font-bold text-green-600">
                                                {getRoomTypePrice(room.roomTypeId)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Features Section */}
                                    <div className="border-t border-gray-100 pt-6">
                                        <div className="flex justify-between items-center">
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-gray-600">Premium Care</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="text-gray-600">24/7 Support</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/customerRoom/${room.roomId}`)}
                                                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 
                                                         px-6 py-3 rounded-xl font-semibold transition-all duration-300 
                                                         hover:from-yellow-500 hover:to-yellow-600 
                                                         transform hover:-translate-y-0.5 hover:shadow-lg
                                                         flex items-center gap-2"
                                            >
                                                View Details
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && rooms.length === 0 && (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Rooms Available</h3>
                            <p className="text-gray-600">Please check back later for available rooms.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerRoomList;
