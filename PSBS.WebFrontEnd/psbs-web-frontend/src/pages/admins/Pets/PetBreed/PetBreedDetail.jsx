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
                    if (petTypeData && petTypeData.petType_Name) {
                        setPetTypeName(petTypeData.petType_Name);
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
        <div>
            <Sidebar ref={sidebarRef} />
            <div className='content'>
                <Navbar sidebarRef={sidebarRef} />
                <main>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 mx-auto w-full">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-black font-bold text-4xl"
                        >
                            ⬅️
                        </button>
                        <div className="bg-gray-300 p-4 text-center rounded-lg w-72 mb-6 -mt-6 mx-auto">
                            <button className="text-black font-bold text-2xl px-4 py-2 rounded-lg shadow bg-yellow-300 border-2 pointer-events-none">
                                Pet Breed Detail
                            </button>
                        </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-8 bg-gray-200 rounded-lg flex flex-col lg:flex-row gap-8 -mt-8">
                        {/* Left Section: Pet Breed Information */}
                        <div className="bg-white p-4 rounded-xl shadow-md flex-1 h-[70vh]">
                            <div className="mb-3 flex items-center gap-4 mt-2">
                                <label className="font-bold text-lg text-gray-500 min-w-[80px]">Name:</label>
                                <input 
                                    type="text"
                                    className="flex-1 p-2 border rounded-lg bg-gray-100"
                                    value={detail.petBreedName}
                                    readOnly
                                />
                            </div>
                            <div className="mb-3 flex items-center gap-4 mt-2">
                                <label className="font-bold text-lg text-gray-500 min-w-[80px]">Type:</label>
                                <input 
                                    type="text"
                                    className="flex-1 p-2 border rounded-lg bg-gray-100"
                                    value={petTypeName}
                                    readOnly
                                />
                            </div>
                            <div className="mb-3 space-y-2">
                                <label className="font-bold text-lg text-gray-500">Breed Description:</label>
                                <textarea
                                    className="w-full p-3 border rounded-lg bg-gray-100 h-40 resize-none"
                                    value={detail.petBreedDescription}
                                    readOnly
                                />
                            </div>
                            <div className="mt-4 flex items-center gap-4">
                                <label className="font-bold text-lg text-gray-500 min-w-[80px]">Status:</label>
                                <input 
                                    type="text"
                                    className={`flex-1 p-2 border rounded-lg font-semibold ${
                                        detail.isDelete ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'
                                    }`}
                                    value={detail.isDelete ? 'Stopping' : 'Active'}
                                    readOnly
                                />
                            </div>
                        </div>
                        {/* Right Section: Pet Breed Image */}
                        <img
                            className="object-contain rounded-md w-[450px] h-[450px]"
                            src={imageURL}
                            alt={detail.petBreedName}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PetBreedDetail;
