import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

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
        <div className="bg-white min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-auto">
                    <div className="flex items-center mb-6 mx-auto w-full">
                        <div className="text-center w-full">
                            <button className="text-black font-bold text-4xl px-4 py-2 pointer-events-none">
                                Rooms For Your Pets
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <CircularProgress />
                        </div>
                    ) : (
                        <div className="bg-gray-100 p-6 rounded-xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                {rooms.map((room) => (
                                    <div key={room.roomId} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                        <img
                                            src={`http://localhost:5023${room.roomImage}`}
                                            alt={room.roomName}
                                            className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="p-4">
                                            <div className="flex justify-between items-center mb-5">
                                                <h2 className="text-xl font-bold text-gray-800">{room.roomName}</h2>
                                                <span className="text-lg font-semibold text-green-600">
                                                    {getRoomTypePrice(room.roomTypeId)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <p className="text-gray-600 font-semibold mb-5">
                                                        {getRoomTypeName(room.roomTypeId)}
                                                    </p>
                                                    <div className="mt-1">
                                                        <span className={`px-3 py-1 rounded-full font-semibold ${room.status === 'Free' ? 'bg-green-100 text-green-600' :
                                                                room.status === 'In Use' ? 'bg-orange-100 text-orange-600' :
                                                                    'bg-red-100 text-red-600'
                                                            }`}>
                                                            {room.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="self-end">
                                                    <button
                                                        onClick={() => navigate(`/customerRoom/${room.roomId}`)}
                                                        className="bg-yellow-300 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                                                    >
                                                        See More
                                                    </button>
                                                </div>
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
