import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

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
        <div className="bg-gray-300 min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-auto p-8">
                    <div className="flex items-center mb-8 mx-auto w-full">
                        <button onClick={() => navigate(-1)} className="text-black font-bold text-4xl">⬅️</button>
                        <div className="text-center w-full">
                            <h1 className="text-black font-bold text-3xl px-4 py-2">
                                Room Detail
                            </h1>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <CircularProgress />
                            </div>
                        ) : detail && (
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Left side - Image */}
                                <div className="lg:w-1/2 -mt-4">
                                    <img
                                        src={`http://localhost:5023${detail.roomImage}`}
                                        alt={detail.roomName}
                                        className="w-[500px] h-[500px] object-contain"
                                    />
                                </div>

                                {/* Right side - Details and Description */}
                                <div className="lg:w-1/2 flex flex-col gap-6">
                                    <div className="p-6 flex flex-col justify-center">
                                        <div className="flex-1 space-y-6">
                                            <h2 className="text-3xl font-bold text-gray-800 mb-6">{detail.roomName}</h2>
                                            <div className="flex flex-col gap-4">
                                                <p className="text-xl text-gray-600">
                                                    Type: <span className="font-semibold">{roomTypeName}</span>
                                                </p>
                                                <p className="text-xl text-gray-600">
                                                    Price: <span className="text-2xl text-green-600 font-bold">{roomTypePrice} VND</span>
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl text-gray-600">Status:</span>
                                                    <span className={`inline-block px-4 py-2 font-semibold text-lg ${detail.status === 'Free' ? 'bg-green-100 text-green-600' :
                                                            detail.status === 'In Use' ? 'bg-orange-100 text-orange-600' :
                                                                'bg-red-100 text-red-600'
                                                        }`}>
                                                        {detail.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/booking/${detail.roomId}`)}
                                                className="mt-4 mx-auto bg-yellow-400 text-black px-4 py-2 font-semibold hover:bg-yellow-500 transition-colors w-1/4 text-base"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pl-6">
                                        <div className="bg-gray-100 p-3">
                                            <h3 className="text-xl font-bold text-gray-800">Description</h3>
                                        </div>
                                        <div className="p-4">
                                            <div className="relative">
                                                <p className={`text-base text-gray-600 leading-relaxed ${!showFullDescription && 'line-clamp-3'}`}>
                                                    {detail.description}
                                                </p>
                                                <button
                                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                                    className="text-blue-600 hover:text-blue-800 font-semibold mt-2 text-sm"
                                                >
                                                    {showFullDescription ? 'Show Less' : 'See More'}
                                                </button>
                                            </div>
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
