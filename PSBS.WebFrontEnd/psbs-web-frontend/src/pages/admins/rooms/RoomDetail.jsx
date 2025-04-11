import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';

const RoomDetail = () => {
    const sidebarRef = useRef(null);
    const [detail, setDetail] = useState(null);
    const [roomTypeName, setRoomTypeName] = useState("");
    const [roomTypePrice, setRoomTypePrice] = useState("");
    const { id } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const response = await fetch(`http://localhost:5050/api/Room/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();

                if (!response.ok || !data.data) {
                    console.error("Failed to fetch room details");
                    Swal.fire("Error", "Failed to fetch room details", "error");
                    return;
                }

                setDetail(data.data);

                if (data.data.roomTypeId) {
                    try {
                        const roomTypeResponse = await fetch(`http://localhost:5050/api/RoomType/${data.data.roomTypeId}`, {
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        const roomTypeData = await roomTypeResponse.json();

                        if (roomTypeData?.data?.name && roomTypeData?.data?.price) {
                            setRoomTypeName(roomTypeData.data.name);
                            setRoomTypePrice(roomTypeData.data.price);
                        } else {
                            setRoomTypeName("Unknown");
                            setRoomTypePrice("Unknown");
                        }
                    } catch (error) {
                        console.error("Error fetching room type data:", error);
                        setRoomTypeName("Unknown");
                        setRoomTypePrice("Unknown");
                    }
                } else {
                    setRoomTypeName("Unknown");
                    setRoomTypePrice("Unknown");
                }
            } catch (error) {
                console.error("Failed fetching data:", error);
                Swal.fire("Error", "Failed to fetch room details", "error");
            }
        };

        if (id) fetchDetail();
    }, [id]);

    if (!detail) {
        return (
            <div className="flex justify-center items-center h-64">
                <CircularProgress />
            </div>
        );
    }

    const imageURL = `http://localhost:5050/facility-service${detail.roomImage}`;

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-auto p-6">
                    {/* Header */}
                    <div className="flex items-center mb-6 mx-auto w-full bg-white rounded-xl p-4 shadow-sm">
                        <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 rounded-full transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="text-center flex-1">
                            <h1 className="text-2xl font-bold text-gray-800">Room Detail</h1>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                                {/* Room Name */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-600 min-w-[100px]">Name:</label>
                                    <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-gray-700">{detail.roomName}</span>
                                    </div>
                                </div>

                                {/* Room Type */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-600 min-w-[100px]">Type:</label>
                                    <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-gray-700">{roomTypeName}</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-600 min-w-[100px]">Price:</label>
                                    <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="text-blue-600 font-medium">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 3
                                            }).format(roomTypePrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="font-semibold text-gray-600">Description:</label>
                                    <div className="w-full p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[160px]">
                                        <p className="text-gray-700 whitespace-pre-wrap">{detail.description}</p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-600 min-w-[100px]">Status:</label>
                                    <div className={`flex-1 p-3 rounded-lg font-medium ${detail.status === 'In Use' ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                                        detail.status === 'Free' ? 'bg-green-50 text-green-600 border border-green-200' :
                                            detail.status === 'Maintenance' ? 'bg-red-50 text-red-600 border border-red-200' :
                                                'bg-gray-50 text-gray-600 border border-gray-200'
                                        }`}>
                                        {detail.status || 'Unknown'}
                                    </div>
                                </div>

                                {/* Available Status */}
                                <div className="flex items-center gap-4">
                                    <label className="font-semibold text-gray-600 min-w-[100px]">Available:</label>
                                    <div className={`flex-1 p-3 rounded-lg font-medium ${detail.isDeleted
                                        ? 'bg-red-50 text-red-600 border border-red-200'
                                        : 'bg-green-50 text-green-600 border border-green-200'
                                        }`}>
                                        {detail.isDeleted ? 'Inactive' : 'Active'}
                                    </div>
                                </div>
                            </div>

                            {/* Image Section */}
                            <div className="lg:w-1/2 flex justify-center items-start">
                                <div className="relative rounded-xl overflow-hidden shadow-lg">
                                    <img
                                        src={imageURL}
                                        alt={detail.roomName}
                                        className="w-[450px] h-[450px] object-contain"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

};

export default RoomDetail;
