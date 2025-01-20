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
    const [hasCamera, setHasCamera] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);
    const [error, setError] = useState({
        roomName: false,
        roomType: false,
        description: false,
    });

    useEffect(() => {
        const fetchRoomTypes = async () => {
            try {
                const response = await fetch('http://localhost:5023/api/RoomType/available');
                const data = await response.json();
                setRoomTypes(data.data);
            } catch (error) {
                Swal.fire('Error', 'Failed to fetch room types!', 'error');
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
        formData.append('hasCamera', hasCamera);
        formData.append('imageFile', selectedImage);

        try {
            const response = await fetch('http://localhost:5023/api/Room', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
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
        <div className="bg-gray-200 min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />
                <main className="flex-1 overflow-auto p-6">
                    <div className="flex items-center mb-6 mx-auto w-full">
                        <button onClick={() => navigate(-1)} className="text-black font-bold text-4xl">⬅️</button>
                        <div className="text-center w-full">
                            <button className="text-black font-bold text-4xl px-4 py-2 pointer-events-none">
                                Create Room
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="flex-1">
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
                                        <TextField
                                            className="bg-gray-50 rounded-xl"
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
                                            label="Choose Type"
                                            error={error.roomType}
                                            helperText={error.roomType ? 'Room Type is required.' : ''}
                                        >
                                            {roomTypes.map(type => (
                                                <MenuItem key={type.roomTypeId} value={type.roomTypeId}>
                                                    {type.name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
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

                                    {/* Has Camera */}
                                    <div className="mb-3 flex items-center">
                                        <label className="font-semibold text-base text-gray-500 mr-3">Has Camera:</label>
                                        <FormControlLabel
                                            control={<Checkbox checked={hasCamera} onChange={(e) => setHasCamera(e.target.checked)} />}
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
                                            onChange={(e) => setDescription(e.target.value)}
                                            value={description}
                                            error={error.description}
                                            helperText={error.description ? 'Description is required.' : ''}
                                        />
                                    </div>
                                </div>

                                {/* Image Preview Section */}
                                <div className="w-full lg:w-1/2 flex justify-center items-center">
                                    <img
                                        src={tmpImage}
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
                            <div className="flex justify-center gap-10 mt-10 pb-6">
                                <button type="submit" className="bg-yellow-300 text-black font-semibold text-lg px-4 py-2 rounded-lg shadow hover:bg-yellow-400">
                                    Create
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-300 text-black font-semibold text-lg px-4 py-2 rounded-lg shadow hover:bg-gray-400"
                                    onClick={() => navigate('/room')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );

};

export default RoomCreate;