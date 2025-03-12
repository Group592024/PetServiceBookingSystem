import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
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
        return <div>Loading...</div>;
    }

    const imageURL = `http://localhost:5050/facility-service${detail.roomImage}`;

    return (
        <div className="bg-gray-200 min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-auto p-6">
                    <div className="flex items-center mb-6 mx-auto w-full">
                        <button onClick={() => navigate(-1)} className="text-black font-bold text-4xl">⬅️</button>
                        <div className="text-center w-full">
                            <button className="text-black font-bold text-4xl px-4 py-2 pointer-events-none">
                                Room Detail
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                                <div className="mb-3 flex items-center gap-4 mt-2">
                                    <label className="font-bold text-lg text-gray-500 min-w-[85px]">Name:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={detail.roomName}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-2">
                                    <label className="font-bold text-lg text-gray-500 min-w-[85px]">Type:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={roomTypeName}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4 mt-2">
                                    <label className="font-bold text-lg text-gray-500 min-w-[85px]">Price:</label>
                                    <input
                                        type="text"
                                        className="flex-1 p-2 border rounded-lg bg-gray-200"
                                        value={`${roomTypePrice}`}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 space-y-2">
                                    <label className="font-bold text-lg text-gray-500">Description:</label>
                                    <textarea
                                        className="w-full p-3 border rounded-lg bg-gray-200 h-40 resize-none"
                                        value={detail.description}
                                        readOnly
                                    />
                                </div>

                                <div className="mb-3 flex items-center gap-4">
                                    <label className="font-bold text-lg text-gray-500 min-w-[85px]">Status:</label>
                                    <input
                                        type="text"
                                        className={`flex-1 p-2 border rounded-lg font-semibold ${detail.status === 'In Use' ? 'bg-orange-100 text-orange-500' :
                                                detail.status === 'Free' ? 'bg-green-100 text-green-500' :
                                                    detail.status === 'Maintenance' ? 'bg-red-100 text-red-500' :
                                                        'bg-gray-50 text-gray-500'
                                            }`}
                                        value={detail.status || 'Unknown'}
                                        readOnly
                                    />
                                </div>

                                <div className="mt-4 flex items-center gap-4">
                                    <label className="font-bold text-lg text-gray-500 min-w-[80px]">Available:</label>
                                    <input
                                        type="text"
                                        className={`flex-1 p-2 border rounded-lg font-semibold ${detail.isDeleted ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                                            }`}
                                        value={detail.isDeleted ? 'Inactive' : 'Active'}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="w-full lg:w-1/2 flex justify-center items-center">
                                <img
                                    src={imageURL}
                                    alt={detail.roomName}
                                    className="w-[450px] h-[450px] object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

};

export default RoomDetail;
