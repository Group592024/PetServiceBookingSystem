import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import Swal from 'sweetalert2';

const CustomerRoomDetail = () => {
    const sidebarRef = useRef(null);
    const [detail, setDetail] = useState(null);
    const [roomTypeName, setRoomTypeName] = useState("");
    const [roomTypePrice, setRoomTypePrice] = useState("");
    const [loading, setLoading] = useState(true);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const response = await fetch(`http://localhost:5050/api/Room/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) throw new Error("Failed to fetch room data");

                const data = await response.json();
                setDetail(data.data);

                if (data.data?.roomTypeId) {
                    const roomTypeResponse = await fetch(`http://localhost:5050/api/RoomType/${data.data.roomTypeId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    if (!roomTypeResponse.ok) throw new Error("Failed to fetch room type data");

                    const roomTypeData = await roomTypeResponse.json();
                    setRoomTypeName(roomTypeData.data?.name || "Unknown");
                    setRoomTypePrice(roomTypeData.data?.price || "Unknown");
                }
            } catch (error) {
                Swal.fire("Service Unavailable", "We couldn't retrieve room information at the moment. Please try again later", "error");
                console.error("Service unavailable - failed to fetch room data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-yellow-50">
            <NavbarCustomer />
            <main className="container mx-auto px-4 py-8">
                {/* Enhanced Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-white transition-all duration-300"
                    >
                        <svg className="w-6 h-6 text-gray-600 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-gray-600 font-medium">Back</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <CircularProgress />
                    </div>
                ) : detail && (
                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                            {/* Left Column - Image Gallery */}
                            <div className="lg:w-1/2 relative flex flex-col">
                                <div className={`relative h-[600px] group ${showFullDescription ? 'flex-grow' : ''}`}>
                                    <img
                                        src={`http://localhost:5050/facility-service${detail.roomImage}`}
                                        alt={detail.roomName}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                    {/* Room Name Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8">
                                        <h1 className="text-4xl font-bold text-white mb-2">{detail.roomName}</h1>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-sm font-medium
                                                ${detail.status === 'Free' ? 'bg-green-500 text-white' :
                                                    detail.status === 'In Use' ? 'bg-orange-500 text-white' :
                                                        'bg-red-500 text-white'}`}>
                                                {detail.status}
                                            </span>
                                            <span className="text-white/90">{roomTypeName}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Details */}
                            <div className="lg:w-1/2 p-8 lg:p-12">
                                {/* Price Section */}
                                <div className="mb-8 pb-8 border-b border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-500 mb-1">Price</p>
                                            <p className="text-3xl font-bold text-green-600">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 3
                                                }).format(roomTypePrice)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/customer/bookings/new`)}
                                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 
                                                        text-gray-900 px-8 py-4 rounded-xl font-semibold
                                                        hover:from-yellow-500 hover:to-yellow-600 
                                                        transition-all duration-300 transform hover:-translate-y-0.5
                                                        hover:shadow-lg"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>

                                {/* Features Section */}
                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Room Features</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-gray-600">Premium Care</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-600">24/7 Support</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Description Section */}
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
                                    <div className="bg-gray-50 rounded-xl p-6">
                                        <p className={`text-gray-600 leading-relaxed ${!showFullDescription && 'line-clamp-3'}`}>
                                            {detail.description}
                                        </p>
                                        {detail.description.length > 150 && (
                                            <button
                                                onClick={() => setShowFullDescription(!showFullDescription)}
                                                className="mt-4 text-blue-600 hover:text-blue-700 font-medium 
                                                            flex items-center gap-1 transition-colors"
                                            >
                                                {showFullDescription ? 'Show Less' : 'Read More'}
                                                <svg className={`w-4 h-4 transform transition-transform ${showFullDescription ? 'rotate-180' : ''}`}
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerRoomDetail;
