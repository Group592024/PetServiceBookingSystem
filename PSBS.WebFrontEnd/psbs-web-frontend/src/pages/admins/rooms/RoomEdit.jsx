import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, FormControl, Select, MenuItem, InputLabel, Checkbox, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import Swal from 'sweetalert2';

const RoomEdit = () => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const { id } = useParams();
    const [roomDetails, setRoomDetails] = useState(null);
    const [roomTypeName, setRoomTypeName] = useState("");
    const [roomTypePrice, setRoomTypePrice] = useState("");
    const [roomName, setRoomName] = useState("");
    const [roomPrice, setRoomPrice] = useState("");
    const [roomType, setRoomType] = useState('');
    const [roomImage, setRoomImage] = useState(null);
    const [roomDescription, setRoomDescription] = useState('');
    const [roomStatus, setRoomStatus] = useState('');
    const [isDeleted, setIsDeleted] = useState(false);
    const [tmpImage, setTmpImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState({
        roomName: false,
        roomType: false,
        roomPrice: false,
        roomDescription: false,
    });
    const [roomTypes, setRoomTypes] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const [roomResponse, typesResponse] = await Promise.all([
                    fetch(`http://localhost:5050/api/Room/${id}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }),
                    fetch("http://localhost:5050/api/RoomType/available", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    })
                ]);

                const roomData = await roomResponse.json();
                const typesData = await typesResponse.json();
                setRoomTypes(typesData.data || []);

                if (roomData.flag && roomData.data) {
                    const typeResponse = await fetch(`http://localhost:5050/api/RoomType/${roomData.data.roomTypeId}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    const typeData = await typeResponse.json();

                    setRoomName(roomData.data.roomName);
                    setRoomType(roomData.data.roomTypeId);
                    setTmpImage(roomData.data.roomImage ? `http://localhost:5050/facility-service${roomData.data.roomImage}` : "default-room-image.jpg");
                    setRoomDescription(roomData.data.description);
                    setRoomStatus(roomData.data.status);
                    setIsDeleted(roomData.data.isDeleted);
                    setRoomTypeName(typeData.data.name);
                    setRoomTypePrice(typeData.data.price);
                }
            } catch (error) {
                console.error("Error:", error);
                Swal.fire("Error", "Failed to fetch data!", "error");
            }
        };

        fetchData();
    }, [id]);

    const handleImageChange = (event) => {
        const fileImage = event.target.files[0];
        if (fileImage) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(fileImage.type)) {
                Swal.fire({
                    title: 'Only accept image files!',
                    showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
                    hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' },
                });
                event.target.value = '';
                return;
            } else {
                const tmpUrl = URL.createObjectURL(fileImage);
                setSelectedImage(fileImage);
                setTmpImage(tmpUrl);
            }
        }
        event.target.value = '';
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate fields
        const errors = {
            roomName: roomName === '',
            roomType: roomType === '',
            roomDescription: roomDescription === '',
        };
        setError(errors);
        if (Object.values(errors).some((fieldError) => fieldError)) {
            return;
        }

        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to update this room? This action may affect related bookings and services.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Update',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#fbbf24',
            cancelButtonColor: '#9ca3af',
        });

        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('roomId', id);
            formData.append('roomName', roomName);
            formData.append('roomTypeId', roomType);
            formData.append('description', roomDescription);
            formData.append('status', roomStatus);
            formData.append('isDeleted', isDeleted);

            if (selectedImage) {
                formData.append('imageFile', selectedImage);
            }

            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch("http://localhost:5050/api/Room", {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });
                if (response.ok) {
                    Swal.fire('Edit Room', 'Room Updated Successfully!', 'success');
                    navigate('/room');
                } else {
                    const errorData = await response.json();
                    const errorMessage = errorData.message || 'An unknown error occurred';
                    Swal.fire('Edit Room', errorMessage, 'error');
                }
            } catch (error) {
                Swal.fire('Edit Room', 'Failed to update room', 'error');
            }
        }
    };

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
                        <h1 className="text-3xl font-bold text-gray-800 ml-4">Edit Room</h1>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col md:flex-row gap-12">
                                {/* Left Column - Form Fields */}
                                <div className="md:w-1/2 space-y-6">
                                    <div className="space-y-4">
                                        {/* Room Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                                            <TextField
                                                fullWidth
                                                value={roomName}
                                                onChange={(e) => setRoomName(e.target.value)}
                                                error={error.roomName}
                                                helperText={error.roomName ? 'Room Name is required.' : ''}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '0.75rem',
                                                        backgroundColor: '#f8fafc',
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Room Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                                            <FormControl fullWidth>
                                                <Select
                                                    value={roomType}
                                                    onChange={(e) => {
                                                        const selectedTypeId = e.target.value;
                                                        setRoomType(selectedTypeId);
                                                        const selectedType = roomTypes.find(type => type.roomTypeId === selectedTypeId);
                                                        if (selectedType) {
                                                            setRoomTypeName(selectedType.name);
                                                            setRoomTypePrice(selectedType.price);
                                                        }
                                                    }}
                                                    sx={{
                                                        borderRadius: '0.75rem',
                                                        backgroundColor: '#f8fafc',
                                                    }}
                                                >
                                                    {roomTypes.map((type) => (
                                                        <MenuItem key={type.roomTypeId} value={type.roomTypeId}>
                                                            {type.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>

                                        {/* Room Price */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Price</label>
                                            <TextField
                                                fullWidth
                                                value={new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 3
                                                }).format(roomTypePrice)}
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '0.75rem',
                                                        backgroundColor: '#f8fafc',
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={4}
                                                value={roomDescription}
                                                onChange={(e) => setRoomDescription(e.target.value)}
                                                error={error.roomDescription}
                                                helperText={error.roomDescription ? 'Description is required.' : ''}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '0.75rem',
                                                        backgroundColor: '#f8fafc',
                                                    }
                                                }}
                                            />
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <FormControl fullWidth>
                                                <Select
                                                    value={roomStatus}
                                                    onChange={(e) => setRoomStatus(e.target.value)}
                                                    sx={{
                                                        borderRadius: '0.75rem',
                                                        backgroundColor: '#f8fafc',
                                                        color:
                                                            roomStatus === 'In Use' ? '#f97316' :
                                                                roomStatus === 'Free' ? '#22c55e' :
                                                                    roomStatus === 'Maintenance' ? '#ef4444' : 'inherit',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    <MenuItem value="In Use" sx={{ color: '#f97316', fontWeight: '600' }}>In Use</MenuItem>
                                                    <MenuItem value="Free" sx={{ color: '#22c55e', fontWeight: '600' }}>Free</MenuItem>
                                                    <MenuItem value="Maintenance" sx={{ color: '#ef4444', fontWeight: '600' }}>Maintenance</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>

                                        {/* Available Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status</label>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                <RadioGroup
                                                    row
                                                    value={isDeleted ? 'true' : 'false'}
                                                    onChange={(e) => setIsDeleted(e.target.value === 'true')}
                                                >
                                                    <FormControlLabel
                                                        value="false"
                                                        control={<Radio color="success" />}
                                                        label={<span className="text-green-600 font-medium">Active</span>}
                                                        className="mr-8"
                                                    />
                                                    <FormControlLabel
                                                        value="true"
                                                        control={<Radio color="error" />}
                                                        label={<span className="text-red-600 font-medium">Inactive</span>}
                                                    />
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Image Upload */}
                                <div className="md:w-1/2 space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all">
                                        <div className="aspect-square mb-4">
                                            {tmpImage ? (
                                                <img
                                                    src={tmpImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain rounded-lg shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                                                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="text-gray-500">Click to change room photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            id="fileInput"
                                            className="w-full"
                                            accept=".jpg,.jpeg,.png,.gif,.webp"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center space-x-4 mt-12 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => navigate('/room')}
                                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RoomEdit;