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
                const [roomResponse, typesResponse] = await Promise.all([
                    fetch(`http://localhost:5050/api/Room/${id}`),
                    fetch('http://localhost:5050/api/RoomType/available')
                ]);

                const roomData = await roomResponse.json();
                const typesData = await typesResponse.json();
                setRoomTypes(typesData.data || []);

                if (roomData.flag && roomData.data) {
                    const typeResponse = await fetch(`http://localhost:5050/api/RoomType/${roomData.data.roomTypeId}`);
                    const typeData = await typeResponse.json();

                    setRoomName(roomData.data.roomName);
                    setRoomType(roomData.data.roomTypeId);
                    setTmpImage(roomData.data.roomImage ? `http://localhost:5050/facility-service${roomData.data.roomImage}` : 'default-room-image.jpg');
                    setRoomDescription(roomData.data.description);
                    setRoomStatus(roomData.data.status);
                    setIsDeleted(roomData.data.isDeleted);
                    setRoomTypeName(typeData.data.name);
                    setRoomTypePrice(typeData.data.price);
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'Failed to fetch data!', 'error');
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
                const response = await fetch(`http://localhost:5050/api/Room`, {
                    method: 'PUT',
                    body: formData,
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
        <div className="bg-gray-200 min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-auto p-6">
                    <div className="flex items-center mb-6 mx-auto w-full">
                        <button onClick={() => navigate(-1)} className="text-black font-bold text-4xl">⬅️</button>
                        <div className="text-center w-full">
                            <button className="text-black font-bold text-4xl px-4 py-2 pointer-events-none">
                                Edit Room
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                                <form>
                                    {/* Room Name */}
                                    <div className="mb-3 flex items-center">
                                        <label className="font-semibold text-base text-gray-500 mr-5">Name:</label>
                                        <TextField
                                            className="bg-gray-50 rounded-xl"
                                            fullWidth
                                            type="text"
                                            onChange={(e) => setRoomName(e.target.value)}
                                            value={roomName}
                                            error={error.roomName}
                                            helperText={error.roomName ? 'Room Name is required.' : ''}
                                        />
                                    </div>

                                    {/* Room Type */}
                                    <div className="mb-3 flex items-center">
                                        <label className="font-semibold text-base text-gray-500 mr-7">Type:</label>
                                        <FormControl fullWidth>
                                            <InputLabel id="room-type-label">Choose Type</InputLabel>
                                            <Select
                                                className="bg-gray-50 rounded-xl"
                                                labelId="room-type-label"
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
                                                label="Choose Type"
                                                error={error.roomType}
                                                renderValue={(selected) => {
                                                    const selectedType = roomTypes.find(type => type.roomTypeId === selected);
                                                    return selectedType?.name || roomTypeName;
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
                                    <div className="mb-3 flex items-center">
                                        <label className="font-semibold text-base text-gray-500 mr-6">Price:</label>
                                        <TextField
                                            className="bg-gray-50 rounded-xl"
                                            fullWidth
                                            type="text"
                                            value={roomTypePrice}
                                            InputProps={{
                                                readOnly: true,
                                            }}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="mb-3 flex flex-col">
                                        <label className="font-semibold text-base text-gray-500 mb-2">Description:</label>
                                        <TextField
                                            className="bg-gray-50 rounded-xl"
                                            fullWidth
                                            multiline
                                            rows={4}
                                            onChange={(e) => setRoomDescription(e.target.value)}
                                            value={roomDescription}
                                            error={error.roomDescription}
                                            helperText={error.roomDescription ? 'Description is required.' : ''}
                                        />
                                    </div>

                                    {/* Status */}
                                    <div className="mb-3 flex items-center mt-5">
                                        <label className="font-semibold text-base text-gray-500 mr-6">Status:</label>
                                        <FormControl fullWidth>
                                            <InputLabel>Choose Status</InputLabel>
                                            <Select
                                                className="bg-gray-50 rounded-xl"
                                                value={roomStatus}
                                                onChange={(e) => setRoomStatus(e.target.value)}
                                                label="Choose Status"
                                                sx={{
                                                    color:
                                                        roomStatus === 'In Use' ? '#FFA500' :
                                                            roomStatus === 'Free' ? '#22C55E' :
                                                                roomStatus === 'Maintenance' ? '#EF4444' : 'inherit',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                <MenuItem value="In Use" sx={{ color: '#FFA500', fontWeight: 'bold' }}>
                                                    In Use
                                                </MenuItem>
                                                <MenuItem value="Free" sx={{ color: '#22C55E', fontWeight: 'bold' }}>
                                                    Free
                                                </MenuItem>
                                                <MenuItem value="Maintenance" sx={{ color: '#EF4444', fontWeight: 'bold' }}>
                                                    Maintenance
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </div>

                                    {/* Available */}
                                    <div className="mb-3">
                                        <FormControl component="fieldset">
                                            <div className="flex items-center">
                                                <FormLabel component="legend" className="mr-4 text-gray-500 font-semibold">Available:</FormLabel>
                                                <RadioGroup
                                                    row
                                                    value={isDeleted ? 'true' : 'false'}
                                                    onChange={(e) => setIsDeleted(e.target.value === 'true')}
                                                    className="flex items-center"
                                                >
                                                    <FormControlLabel
                                                        value="false"
                                                        control={<Radio />}
                                                        label="Active"
                                                        className="font-bold text-green-500 text-lg mr-4"
                                                    />
                                                    <FormControlLabel
                                                        value="true"
                                                        control={<Radio />}
                                                        label="Inactive"
                                                        className="font-bold text-red-500 text-lg"
                                                    />
                                                </RadioGroup>
                                            </div>
                                        </FormControl>
                                    </div>
                                </form>
                            </div>

                            {/* Image Preview Section */}
                            <div className="w-full lg:w-1/2 flex justify-center items-center">
                                <img
                                    src={tmpImage || 'default-room-image.jpg'}
                                    alt="Room"
                                    className="w-[400px] h-[400px] object-contain cursor-pointer"
                                    onClick={() => document.getElementById('fileInput').click()}
                                />
                                <input
                                    type="file"
                                    id="fileInput"
                                    style={{ display: 'none' }}
                                    accept=".jpg,.jpeg,.png,.gif,.webp"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                        <div className="flex justify-center gap-10 mt-6 pb-6">
                            <button onClick={handleSubmit} className="bg-yellow-300 text-black font-semibold text-lg px-4 py-2 rounded-lg shadow hover:bg-yellow-400">
                                Save
                            </button>
                            <button className="bg-gray-300 text-black font-semibold text-lg px-4 py-2 rounded-lg shadow hover:bg-gray-400" onClick={() => navigate('/room')}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RoomEdit;