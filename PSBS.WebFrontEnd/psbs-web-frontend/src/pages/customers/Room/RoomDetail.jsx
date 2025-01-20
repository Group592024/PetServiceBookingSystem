import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';


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
                const response = await fetch(`http://localhost:5023/api/Room/${id}`);
                const data = await response.json();
                setDetail(data.data);
                if (data.data && data.data.roomTypeId) {
                    const roomTypeResponse = await fetch(`http://localhost:5023/api/RoomType/${data.data.roomTypeId}`);
                    const roomTypeData = await roomTypeResponse.json();
                    if (roomTypeData.data) {
                        setRoomTypeName(roomTypeData.data.name);
                        setRoomTypePrice(roomTypeData.data.price);
                    }
                }
            } catch (error) {
                console.error('Failed fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [id]);

    return (
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex flex-col">
            <div className=" flex-1 overflow-hidden">
                <NavbarCustomer />
                <main className="flex-1 overflow-auto p-8">
                    <div className="flex items-center mb-8 mx-auto w-full">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-black hover:text-gray-700 transition-colors duration-300 font-bold text-4xl"
                        >
                            ⬅️
                        </button>
                        <div className="text-center w-full">
                            <h1 className="text-black font-bold text-4xl px-4 py-2 tracking-wide">
                                Room Details
                            </h1>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <CircularProgress />
                            </div>
                        ) : detail && (
                            <div className="flex flex-col lg:flex-row gap-12">
                                {/* Left side - Image */}
                                <div className="lg:w-1/2">
                                    <div className="relative group">
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-black/20"></div>
                                        <img
                                            src={`http://localhost:5023${detail.roomImage}`}
                                            alt={detail.roomName}
                                            className="w-full h-[600px] object-cover rounded-xl ring-1 ring-gray-200 transform transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded-xl"></div>
                                    </div>
                                </div>
                                {/* Right side - Details and Description */}
                                <div className="lg:w-1/2 flex flex-col gap-8">
                                    <div className="bg-gray-50 rounded-xl p-8 shadow-md">
                                        <h2 className="text-4xl font-bold text-gray-800 mb-8 border-b pb-4">{detail.roomName}</h2>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl text-gray-600">Type:</span>
                                                <span className="text-2xl font-semibold text-gray-800">{roomTypeName}</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="text-xl text-gray-600">Price:</span>
                                                <span className="text-3xl font-bold text-green-600">{roomTypePrice} VND</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="text-xl text-gray-600">Status:</span>
                                                <span className={`px-6 py-2 rounded-full font-semibold text-xl ${detail.status === 'Free' ? 'bg-green-100 text-green-600' :
                                                    detail.status === 'In Use' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>
                                                    {detail.status}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/booking/${detail.roomId}`)}
                                            className="mt-8 w-full bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-xl hover:bg-yellow-500 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                        >
                                            Book Now
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-8 shadow-md">
                                        <h3 className="text-2xl font-bold text-gray-800 border-b mb-4">Description</h3>
                                        <div className="relative">
                                            <p className={`text-lg text-gray-600 leading-relaxed ${!showFullDescription && 'line-clamp-3'}`}>
                                                {detail.description}
                                            </p>
                                            <button
                                                onClick={() => setShowFullDescription(!showFullDescription)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold mt-4 text-base hover:underline"
                                            >
                                                {showFullDescription ? 'Show Less' : 'See More'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );

};

export default CustomerRoomDetail;
