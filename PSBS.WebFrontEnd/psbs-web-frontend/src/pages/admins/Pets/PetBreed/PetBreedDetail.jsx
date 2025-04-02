import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate

const PetBreedDetail = () => {
    const sidebarRef = useRef(null);
    const [detail, setDetail] = useState(null);
    const [petTypeName, setPetTypeName] = useState("");
    const { id } = useParams();
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const response = await fetch(`http://localhost:5050/api/PetBreed/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                setDetail(data.data);

                if (data.data && data.data.petTypeId) {
                    const petTypeResponse = await fetch(`http://localhost:5050/api/PetType/${data.data.petTypeId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const petTypeData = await petTypeResponse.json();
                    if (petTypeData.data && petTypeData.data.petType_Name) {
                        setPetTypeName(petTypeData.data.petType_Name);
                    } else {
                        console.log("PetType data not found, setting as Unknown");
                        setPetTypeName("Unknown");
                    }
                } else {
                    console.log("No petTypeId in PetBreed data");
                    setPetTypeName("Unknown");
                }
            } catch (error) {
                console.error("Failed fetching data: ", error);
            }
        };

        if (id) fetchDetail();
    }, [id]);

    if (!detail) {
        return <div>Loading...</div>;
    }
    const imageURL = `http://localhost:5050/pet-service${detail.petBreedImage}`;

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-auto p-8">
                    {/* Enhanced Header */}
                    <div className="flex items-center mb-8 bg-white rounded-xl p-4 shadow-sm">
                        <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 rounded-full transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800 ml-4">Pet Breed Detail</h1>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Left Column */}
                            <div className="md:w-1/2 space-y-6">
                                {/* Image Display */}
                                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                                    <div className="aspect-square mb-4">
                                        <img
                                            src={imageURL}
                                            alt={detail.petBreedName}
                                            className="w-full h-full object-cover rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="md:w-1/2 space-y-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Breed Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200"
                                            value={detail.petBreedName}
                                            readOnly
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200"
                                            value={petTypeName}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 min-h-[200px]"
                                        value={detail.petBreedDescription}
                                        readOnly
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <div className={`p-4 rounded-lg ${detail.isDelete
                                        ? 'bg-red-50 border-2 border-red-200'
                                        : 'bg-emerald-50 border-2 border-emerald-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full animate-pulse ${detail.isDelete ? 'bg-red-500' : 'bg-emerald-500'
                                                }`}></div>
                                            <span className={`font-medium ${detail.isDelete ? 'text-red-700' : 'text-emerald-700'
                                                }`}>
                                                {detail.isDelete ? 'Inactive' : 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PetBreedDetail;
