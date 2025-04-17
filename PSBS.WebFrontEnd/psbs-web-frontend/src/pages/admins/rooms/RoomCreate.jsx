import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/sidebar/Sidebar";
import sampleImage from '../../../assets/sampleUploadImage.jpg';
import { useNavigate } from 'react-router-dom';
import { TextField, FormControl, Select, MenuItem, InputLabel, Checkbox, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';
import Swal from 'sweetalert2';

const RoomCreate = () => {
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [roomName, setRoomName] = useState('');
    const [roomType, setRoomType] = useState('');
    const [roomTypePrice, setRoomTypePrice] = useState('');
    const [description, setDescription] = useState('');
    const [tmpImage, setTmpImage] = useState(sampleImage);
    const [roomTypes, setRoomTypes] = useState([]);
    const [error, setError] = useState({
        roomName: false,
        roomType: false,
        description: false,
    });

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch('http://localhost:5050/api/RoomType/available', {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch room types");
                }

                const data = await response.json();
                setRoomTypes(data.data || []);
            } catch (error) {
                Swal.fire('Service Unavailable', 'Our service is down. Please contact admin for more information.', 'error');
            }
        };

        fetchRoomTypes();
    }, []);

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
        const errors = {
            roomName: roomName === '',
            roomType: roomType === '',
            description: description === '',
        };
        setError(errors);
        if (Object.values(errors).some((fieldError) => fieldError)) {
            return;
        }

        if (!selectedImage) {
            Swal.fire({
                title: 'Room Image is required!',
                showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
                hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' },
            });
            return;
        }

        const formData = new FormData();
        formData.append('roomName', roomName);
        formData.append('roomTypeId', roomType);
        formData.append('description', description);
        formData.append('imageFile', selectedImage);

        try {
            const token = sessionStorage.getItem("token");

            const response = await fetch('http://localhost:5050/api/Room', {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                },
                body: formData,
            });
            const responseData = await response.json();

            if (response.ok) {
                Swal.fire('Create Room', 'Room Created Successfully!', 'success')
                    .then(() => {
                        navigate('/room');
                    });
            } else {
                Swal.fire('Create Room', responseData.message || 'Failed to create room', 'error');
            }
        } catch (error) {
            console.error('Creation Error:', error);
            Swal.fire('Create Room', 'Failed to create room', 'error');
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
                        <h1 className="text-3xl font-bold text-gray-800 ml-4">Create New Room</h1>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col md:flex-row gap-12">
                                <div className="md:w-1/2 space-y-6">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
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

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                                            <TextField
                                                select
                                                fullWidth
                                                value={roomType}
                                                onChange={(e) => {
                                                    const selectedTypeId = e.target.value;
                                                    setRoomType(selectedTypeId);
                                                    const selectedType = roomTypes.find(type => type.roomTypeId === selectedTypeId);
                                                    if (selectedType) {
                                                        setRoomTypePrice(selectedType.price);
                                                    }
                                                }}
                                                error={error.roomType}
                                                helperText={error.roomType ? 'Room Type is required.' : ''}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '0.75rem',
                                                        backgroundColor: '#f8fafc',
                                                    }
                                                }}
                                            >
                                                {roomTypes.map(type => (
                                                    <MenuItem key={type.roomTypeId} value={type.roomTypeId}>
                                                        {type.name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        </div>
                                    </div>
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            error={error.description}
                                            helperText={error.description ? 'Description is required.' : ''}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '0.75rem',
                                                    backgroundColor: '#f8fafc',
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="md:w-1/2 space-y-6">
                                    {/* Image Upload */}
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
                                                    <span className="text-gray-500">Click to upload room photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full"
                                            onChange={handleImageChange}
                                            id="fileInput"
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
                                    Create Room
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );

};

export default RoomCreate;