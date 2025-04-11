import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import sampleImage from '../../../../assets/sampleUploadImage.jpg';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, FormControl, Select, MenuItem, InputLabel, Radio, RadioGroup, FormControlLabel, FormLabel } from '@mui/material';

const PetBreedEdit = () => {
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const { id } = useParams();
    const [selectedImage, setSelectedImage] = useState(null);
    const [name, setName] = useState('');
    const [typeName, setTypeName] = useState('');
    const [description, setDescription] = useState('');
    const [tmpImage, setTmpImage] = useState(sampleImage);
    const [currentTypeName, setCurrentTypeName] = useState('');
    const [error, setError] = useState({
        name: false,
        typeName: false,
        description: false,
    });
    const [petTypes, setPetTypes] = useState([]);
    const [isDelete, setIsDelete] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const [breedResponse, typesResponse] = await Promise.all([
                    fetch(`http://localhost:5050/api/PetBreed/${id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }),
                    fetch('http://localhost:5050/api/PetType/available', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                ]);

                const breedData = await breedResponse.json();
                const typesData = await typesResponse.json();
                setPetTypes(typesData.data || []);

                if (breedData.flag && breedData.data) {
                    const typeResponse = await fetch(`http://localhost:5050/api/PetType/${breedData.data.petTypeId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const typeData = await typeResponse.json();
                    const currentType = typesData.data.find(t => t.petType_ID === breedData.data.petTypeId);
                    setName(breedData.data.petBreedName);
                    setDescription(breedData.data.petBreedDescription);
                    setTmpImage(breedData.data.petBreedImage ? `http://localhost:5050/pet-service${breedData.data.petBreedImage}` : sampleImage);
                    setTypeName(breedData.data.petTypeId);
                    setIsDelete(breedData.data.isDelete);
                    setCurrentTypeName(typeData.petType_Name);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
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

        // Validate fields first
        const errors = {
            name: name === '',
            typeName: typeName === '',
            description: description === '',
        };
        setError(errors);
        if (Object.values(errors).some((fieldError) => fieldError)) {
            return;
        }

        if (!selectedImage && tmpImage === sampleImage) {
            Swal.fire({
                title: 'Pet Breed Image is required!',
                showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
                hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' },
            });
            return;
        }

        // Add confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to update this pet breed? This action may affect related data in the system.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Update',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#fbbf24',
            cancelButtonColor: '#9ca3af',
        });

        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('petBreedId', id);
            formData.append('petBreedName', name);
            formData.append('petTypeId', typeName);
            formData.append('petBreedDescription', description);

            if (selectedImage) {
                formData.append('imageFile', selectedImage);
            }

            formData.append('isDelete', isDelete);

            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch(`http://localhost:5050/api/PetBreed`, {
                    method: 'PUT',
                    body: formData,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    Swal.fire('Edit Pet Breed', 'Pet Breed Updated Successfully!', 'success');
                    navigate('/petBreed');
                } else {
                    const errorData = await response.json();
                    const errorMessage = errorData.message || 'An unknown error occurred';
                    Swal.fire('Edit Pet Breed', errorMessage, 'error');
                }
            } catch (error) {
                const errorMessage = error?.response?.data?.message || 'Failed To Update Pet Breed!';
                Swal.fire('Edit Pet Breed', errorMessage, 'error');
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
                        <h1 className="text-3xl font-bold text-gray-800 ml-4">Edit Pet Breed</h1>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col md:flex-row gap-12">
                                {/* Left Column */}
                                <div className="md:w-1/2 space-y-6">
                                    {/* Image Upload */}
                                    <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all">
                                        <div className="aspect-square mb-4">
                                            <img
                                                src={tmpImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover rounded-lg shadow-sm"
                                                onClick={() => document.getElementById('fileInput').click()}
                                            />
                                        </div>
                                        <input
                                            type="file"
                                            id="fileInput"
                                            accept="image/*"
                                            className="w-full"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="md:w-1/2 space-y-6">

                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Breed Name</label>
                                            <TextField
                                                fullWidth
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                error={error.name}
                                                helperText={error.name ? 'Breed Name is required.' : ''}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '0.75rem',
                                                        backgroundColor: '#f8fafc',
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
                                            <FormControl fullWidth error={error.typeName}>
                                                <Select
                                                    value={typeName}
                                                    onChange={(e) => setTypeName(e.target.value)}
                                                    sx={{
                                                        borderRadius: '0.75rem',
                                                        backgroundColor: '#f8fafc',
                                                    }}
                                                    renderValue={(selected) => {
                                                        const selectedType = petTypes.find(type => type.petType_ID === selected);
                                                        return selectedType?.petType_Name || currentTypeName;
                                                    }}
                                                >
                                                    {petTypes.map((petType) => (
                                                        <MenuItem key={petType.petType_ID} value={petType.petType_ID}>
                                                            {petType.petType_Name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            className={`w-full p-3 rounded-lg bg-gray-50 border ${error.description ? 'border-red-300' : 'border-gray-200'
                                                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[200px]`}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Enter breed description..."
                                        />
                                        {error.description && (
                                            <p className="text-red-500 text-xs mt-1">Description is required.</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="false"
                                                    checked={!isDelete}
                                                    onChange={(e) => setIsDelete(e.target.value === 'true')}
                                                    className="hidden"
                                                />
                                                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${!isDelete ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100'
                                                    }`}>
                                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                                    Active
                                                </div>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="true"
                                                    checked={isDelete}
                                                    onChange={(e) => setIsDelete(e.target.value === 'true')}
                                                    className="hidden"
                                                />
                                                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isDelete ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-gray-100'
                                                    }`}>
                                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                                    Inactive
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center space-x-4 mt-12 pt-6 border-t">
                                <button
                                    onClick={() => navigate('/petBreed')}
                                    type="button"
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

export default PetBreedEdit;
