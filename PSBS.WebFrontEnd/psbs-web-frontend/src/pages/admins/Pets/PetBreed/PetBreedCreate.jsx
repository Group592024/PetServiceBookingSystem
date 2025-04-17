import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import sampleImage from '../../../../assets/sampleUploadImage.jpg';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { TextField, FormControl, Select, MenuItem, InputLabel } from '@mui/material';

const PetBreedCreate = () => {
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [name, setName] = useState('');
    const [typeName, setTypeName] = useState('');
    const [description, setDescription] = useState('');
    const [tmpImage, setTmpImage] = useState(sampleImage);
    const [error, setError] = useState({
        name: false,
        typeName: false,
        description: false,
    });
    const [petTypes, setPetTypes] = useState([]);

    useEffect(() => {
        const fetchPetTypes = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch('http://localhost:5050/api/PetType/available', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setPetTypes(data.data || []);
            } catch (error) {
                Swal.fire('Service Unavailable', 'Our service is down. Please contact admin for more information.', 'error');
                console.error('Failed to fetch pet types', error);
            }
        };

        fetchPetTypes();
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
            name: name === '',
            typeName: typeName === '',
            description: description === '',
        };
        setError(errors);
        if (Object.values(errors).some((fieldError) => fieldError)) {
            return;
        }

        if (selectedImage == null) {
            Swal.fire({
                title: 'Pet Breed Image is required!',
                showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
                hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' },
            });
            return;
        }

        const formData = new FormData();
        formData.append('petBreedName', name);
        formData.append('petTypeId', typeName);
        formData.append('petBreedDescription', description);
        formData.append('imageFile', selectedImage);

        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        console.log('Name:', name);
        console.log('TypeName:', typeName);
        console.log('Description:', description);
        console.log('Selected Image:', selectedImage);

        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch('http://localhost:5050/api/PetBreed', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('Pet Breed added successfully');
                setName('');
                setTypeName('');
                setDescription('');
                setSelectedImage(null);
                setTmpImage(sampleImage);

                Swal.fire('Add New Pet Breed', 'Pet Breed Added Successfully!', 'success');
                navigate('/petBreed');
            } else {
                const errorData = await response.json();
                console.log('Failed to add Pet Breed', errorData);
                Swal.fire('Add New Pet Breed', `${errorData.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Failed fetching API', error);
            Swal.fire('Add New Pet Breed', 'Failed To Add Pet Breed!', 'error');
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
                        <h1 className="text-3xl font-bold text-gray-800 ml-4">Create New Breed</h1>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-8 flex flex-col lg:flex-row gap-12">
                                {/* Left Column - Form Fields */}
                                <div className="lg:w-1/2 space-y-6">
                                    {/* Breed Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Breed Name</label>
                                        <TextField
                                            fullWidth
                                            placeholder="Enter breed name"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '0.75rem',
                                                    backgroundColor: '#f8fafc',
                                                }
                                            }}
                                            onChange={(e) => {
                                                setName(e.target.value);
                                                setError((prev) => ({ ...prev, name: false }));
                                            }}
                                            error={error.name}
                                            helperText={error.name ? 'Breed Name is required.' : ''}
                                        />
                                    </div>

                                    {/* Pet Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
                                        <FormControl fullWidth>
                                            <Select
                                                value={typeName}
                                                onChange={(e) => {
                                                    setTypeName(e.target.value);
                                                    setError((prev) => ({ ...prev, typeName: false }));
                                                }}
                                                error={error.typeName}
                                                sx={{
                                                    borderRadius: '0.75rem',
                                                    backgroundColor: '#f8fafc',
                                                }}
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>Select pet type</MenuItem>
                                                {petTypes.map((petType) => (
                                                    <MenuItem key={petType.petType_ID} value={petType.petType_ID}>
                                                        {petType.petType_Name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {error.typeName && (
                                                <p className="text-red-500 text-xs mt-1">Type is required.</p>
                                            )}
                                        </FormControl>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            className={`w-full p-4 rounded-xl bg-gray-50 border ${error.description ? 'border-red-300' : 'border-gray-200'
                                                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[200px]`}
                                            placeholder="Enter breed description..."
                                            value={description}
                                            onChange={(e) => {
                                                setDescription(e.target.value);
                                                setError((prev) => ({ ...prev, description: false }));
                                            }}
                                        ></textarea>
                                        {error.description && (
                                            <p className="text-red-500 text-xs mt-1">Description is required.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column - Image Upload */}
                                <div className="lg:w-1/2">
                                    <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all">
                                        <div
                                            className="aspect-square cursor-pointer"
                                            onClick={() => document.getElementById('inputFile').click()}
                                        >
                                            <img
                                                src={tmpImage}
                                                alt="Preview"
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="inputFile"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <p className="text-center text-sm text-gray-500 mt-2">
                                            Click to upload or change image
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center space-x-4 p-6 bg-gray-50 border-t">
                                <button
                                    onClick={() => navigate('/petBreed')}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    type="button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    Create Breed
                                </button>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default PetBreedCreate;
