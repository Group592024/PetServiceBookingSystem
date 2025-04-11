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
        return (
            <div className="flex flex-col items-center justify-center h-svh text-center">
                <svg aria-hidden="true" className="w-12 h-12 text-purple-500 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#8B5CF6" />
                </svg>
                <p className="mt-4 text-gray-700 text-lg">Loading, please wait...</p>
            </div>
        );
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
