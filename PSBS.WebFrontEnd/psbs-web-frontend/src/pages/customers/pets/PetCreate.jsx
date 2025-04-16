import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPaw, FaWeight, FaCalendarAlt, FaMars, FaVenus, FaCamera } from 'react-icons/fa';

const CustomerPetCreate = () => {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
    const [petTypes, setPetTypes] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pet, setPet] = useState({
        petName: '',
        petGender: true,
        dateOfBirth: '',
        petTypeId: '',
        petBreedId: '',
        petWeight: '',
        petFurType: '',
        petFurColor: '',
        petNote: '',
        petImage: null
    });

    useEffect(() => {
        const fetchPetTypes = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch("http://localhost:5050/api/petType/available", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!Array.isArray(data.data)) {
                    throw new Error("API did not return an array");
                }

                setPetTypes(data.data.filter(type => !type.isDelete));
            } catch (error) {
                console.log("Error fetching pet types:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Service Unavailable',
                    text: "We couldn't retrieve pet information at the moment. Please try again later.",
                    confirmButtonText: 'Close',
                    confirmButtonColor: '#3085d6'
                });
            }
        };

        fetchPetTypes();
    }, []);

    useEffect(() => {
        const fetchBreeds = async () => {
            if (pet.petTypeId) {
                try {
                    const token = sessionStorage.getItem("token");
                    const response = await fetch(`http://localhost:5050/api/petBreed/byPetType/${pet.petTypeId}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    const data = await response.json();
                    if (!data.flag) {
                        Swal.fire({
                            title: "Information",
                            text: "No breeds available for this pet type",
                            icon: "info",
                            confirmButtonText: "OK",
                            confirmButtonColor: '#3085d6'
                        });
                    }
                    setBreeds(data.data || []);
                } catch (error) {
                    console.log("Error fetching breeds:", error);
                    setBreeds([]);
                }
            } else {
                setBreeds([]);
            }
        };
        fetchBreeds();
    }, [pet.petTypeId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validImageTypes.includes(file.type)) {
                Swal.fire({
                    title: 'Invalid file type',
                    text: 'Only image files are accepted',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                });
                return;
            }
            setPet({ ...pet, petImage: file });
            setImagePreview(URL.createObjectURL(file));
            setErrors({ ...errors, petImage: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!pet.petImage) newErrors.petImage = 'Please select a pet image';
        if (!pet.petName.trim()) newErrors.petName = 'Please enter pet name';
        if (!pet.petNote.trim()) newErrors.petNote = 'Please enter pet note';
        if (!pet.dateOfBirth) newErrors.dateOfBirth = 'Please select date of birth';
        if (!pet.petTypeId) newErrors.petTypeId = 'Please select pet type';
        if (!pet.petBreedId) newErrors.petBreedId = 'Please select pet breed';
        if (!pet.petWeight || parseFloat(pet.petWeight) <= 0) newErrors.petWeight = 'Please enter a valid weight (greater than 0)';
        if (!pet.petFurType.trim()) newErrors.petFurType = 'Please enter fur type';
        if (!pet.petFurColor.trim()) newErrors.petFurColor = 'Please enter fur color';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        Swal.fire({
            title: 'Creating your pet...',
            html: 'Please wait while we save your pet information',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const formData = new FormData();
        formData.append('petName', pet.petName);
        formData.append('petGender', pet.petGender);
        formData.append('dateOfBirth', pet.dateOfBirth);
        formData.append('petBreedId', pet.petBreedId);
        formData.append('petWeight', pet.petWeight);
        formData.append('petFurType', pet.petFurType);
        formData.append('petFurColor', pet.petFurColor);
        formData.append('petNote', pet.petNote);
        formData.append('imageFile', pet.petImage);
        formData.append('accountId', sessionStorage.getItem('accountId'));

        try {
            const token = sessionStorage.getItem("token");
            const response = await fetch("http://localhost:5050/api/pet", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });
            const data = await response.json();
            if (data.flag) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Pet created successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    navigate('/customer/pet');
                });
            } else {
                Swal.fire('Error', data.message || 'Failed to create pet', 'error');
            }
        } catch (error) {
            console.error('Error creating pet:', error);
            Swal.fire({
                icon: 'error',
                title: 'Failed to Create Pet',
                text: 'Something went wrong while creating the pet. Please try again later.',
                confirmButtonText: 'Close',
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-pink-50">
            <NavbarCustomer />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto p-6"
            >
                {/* Header */}
                <div className="flex items-center mb-8 bg-white p-6 rounded-2xl shadow-sm">
                    <button
                        onClick={() => navigate('/customer/pet')}
                        className="hover:bg-gray-100 p-2 rounded-full transition-all"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 ml-4">Add New Pet</h1>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row">
                        {/* Left Column - Image Upload and Basic Info */}
                        <div className="md:w-5/12 bg-gradient-to-br from-indigo-50 to-blue-300 p-8">
                            {/* Image Upload Section */}
                            <div className="mb-8">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className={`bg-white p-6 rounded-2xl border-2 border-dashed 
                                    ${errors.petImage ? 'border-red-300' : 'border-indigo-200'} 
                                    hover:border-indigo-400 transition-all cursor-pointer shadow-sm`}
                                    onClick={() => document.querySelector('input[type="file"]').click()}
                                >
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-64 object-contain rounded-xl"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg">
                                                <FaCamera />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-64 rounded-xl flex flex-col items-center justify-center bg-indigo-50">
                                            <div className="bg-indigo-100 p-4 rounded-full mb-4">
                                                <FaCamera className="w-10 h-10 text-indigo-500" />
                                            </div>
                                            <span className="text-indigo-700 font-medium">Upload Pet Photo</span>
                                            <span className="text-gray-500 text-sm mt-2">Click to browse files</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </motion.div>
                                {errors.petImage && (
                                    <p className="mt-2 text-red-500 text-sm flex items-center">
                                        <span className="mr-1">⚠</span> {errors.petImage}
                                    </p>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                                    <input
                                        type="text"
                                        placeholder="What's your pet's name?"
                                        className={`w-full text-lg p-4 rounded-xl bg-white border
                                        ${errors.petName ? 'border-red-300 focus:border-red-500' : 'border-indigo-200 focus:border-indigo-500'}
                                        focus:outline-none focus:ring-2 ${errors.petName ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}
                                        transition-all shadow-sm`}
                                        value={pet.petName}
                                        onChange={(e) => {
                                            setPet({ ...pet, petName: e.target.value });
                                            setErrors({ ...errors, petName: '' });
                                        }}
                                    />
                                    {errors.petName && (
                                        <p className="mt-2 text-red-500 text-sm flex items-center">
                                            <span className="mr-1">⚠</span> {errors.petName}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Gender Selection */}
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <div className="flex space-x-2">
                                            <div
                                                className={`flex-1 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-center
                                                        ${pet.petGender
                                                        ? 'bg-blue-100 border-2 border-blue-400 text-blue-700 font-medium'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                onClick={() => setPet({ ...pet, petGender: true })}
                                            >
                                                <FaMars className="mr-2" /> Male
                                            </div>
                                            <div
                                                className={`flex-1 p-3 rounded-xl cursor-pointer transition-all flex items-center justify-center
                                                        ${!pet.petGender
                                                        ? 'bg-pink-100 border-2 border-pink-400 text-pink-700 font-medium'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                                onClick={() => setPet({ ...pet, petGender: false })}
                                            >
                                                <FaVenus className="mr-2" /> Female
                                            </div>
                                        </div>
                                    </div>

                                    {/* Birth Date */}
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="absolute left-0 w-full p-3 rounded-xl bg-white border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                                                value={pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    setPet({ ...pet, dateOfBirth: e.target.value });
                                                    setErrors({ ...errors, dateOfBirth: '' });
                                                }}
                                                max={new Date().toISOString().split('T')[0]}
                                                id="datePicker"
                                                style={{ opacity: 0, zIndex: -1 }}
                                            />
                                            <div
                                                className={`w-full p-3 rounded-xl bg-white border
                                                            ${errors.dateOfBirth ? 'border-red-300' : 'border-indigo-200'}
                                                            focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all 
                                                            cursor-pointer flex items-center shadow-sm pl-10`}
                                                onClick={() => document.getElementById('datePicker').showPicker()}
                                            >
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <FaCalendarAlt className="text-indigo-500" />
                                                </div>
                                                <span>{pet.dateOfBirth ? formatDateDisplay(pet.dateOfBirth) : 'Select date'}</span>
                                            </div>
                                        </div>
                                        {errors.dateOfBirth && (
                                            <p className="mt-2 text-red-500 text-sm flex items-center">
                                                <span className="mr-1">⚠</span> {errors.dateOfBirth}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Pet Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Notes</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Any special information about your pet..."
                                        className={`w-full p-3 rounded-xl bg-white border 
                                        ${errors.petNote ? 'border-red-300 focus:border-red-500' : 'border-indigo-200 focus:border-indigo-500'}
                                        focus:outline-none focus:ring-2 ${errors.petNote ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}
                                        transition-all shadow-sm`}
                                        value={pet.petNote}
                                        onChange={(e) => {
                                            setPet({ ...pet, petNote: e.target.value });
                                            setErrors({ ...errors, petNote: '' });
                                        }}
                                    ></textarea>
                                    {errors.petNote && (
                                        <p className="mt-2 text-red-500 text-sm flex items-center">
                                            <span className="mr-1">⚠</span> {errors.petNote}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Additional Pet Details */}
                        <div className="md:w-7/12 p-8">
                            <div className="space-y-6">
                                <div className="bg-indigo-50 p-4 rounded-xl mb-6">
                                    <h2 className="text-lg font-semibold text-indigo-700 flex items-center mb-1">
                                        <FaPaw className="mr-2" /> Pet Details
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        These details help us provide the best care for your pet
                                    </p>
                                </div>
                                {/* Pet Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pet Type</label>
                                    <div className="relative">
                                        <select
                                            className={`w-full p-3 rounded-xl bg-white border shadow-sm
                                            ${errors.petTypeId ? 'border-red-300' : 'border-indigo-200'}
                                            focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all`}
                                            value={pet.petTypeId}
                                            onChange={(e) => {
                                                setPet({ ...pet, petTypeId: e.target.value, petBreedId: '' });
                                                setErrors({ ...errors, petTypeId: '' });
                                            }}
                                        >
                                            <option value="">Select Pet Type</option>
                                            {petTypes.map(type => (
                                                <option key={type.petType_ID} value={type.petType_ID}>
                                                    {type.petType_Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.petTypeId && (
                                        <p className="mt-2 text-red-500 text-sm flex items-center">
                                            <span className="mr-1">⚠</span> {errors.petTypeId}
                                        </p>
                                    )}
                                </div>

                                {/* Pet Breed */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pet Breed</label>
                                    <select
                                        className={`w-full p-3 rounded-xl bg-white border 
                                            ${errors.petBreedId ? 'border-red-300 focus:border-red-500' : 'border-indigo-200 focus:border-indigo-500'}
                                            focus:outline-none focus:ring-2 ${errors.petBreedId ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}
                                            transition-all shadow-sm`}
                                        value={pet.petBreedId}
                                        onChange={(e) => {
                                            setPet({ ...pet, petBreedId: e.target.value });
                                            setErrors({ ...errors, petBreedId: '' });
                                        }}
                                        disabled={!pet.petTypeId}
                                    >
                                        <option value="">Select Breed</option>
                                        {breeds.map(breed => (
                                            <option key={breed.petBreedId} value={breed.petBreedId}>
                                                {breed.petBreedName}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.petBreedId && (
                                        <p className="mt-2 text-red-500 text-sm flex items-center">
                                            <span className="mr-1">⚠</span> {errors.petBreedId}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Pet Weight */}
                                    <div className='md:col-span-2'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                placeholder="0.0"
                                                className={`w-full p-3 rounded-xl bg-white border 
                                                ${errors.petWeight ? 'border-red-300 focus:border-red-500' : 'border-indigo-200 focus:border-indigo-500'}
                                                focus:outline-none focus:ring-2 ${errors.petWeight ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}
                                                transition-all shadow-sm`}
                                                value={pet.petWeight}
                                                onChange={(e) => {
                                                    setPet({ ...pet, petWeight: e.target.value });
                                                    setErrors({ ...errors, petWeight: '' });
                                                }}
                                            />
                                        </div>
                                        {errors.petWeight && (
                                            <p className="mt-2 text-red-500 text-sm flex items-center">
                                                <span className="mr-1">⚠</span> {errors.petWeight}
                                            </p>
                                        )}
                                    </div>

                                    {/* Fur Type */}
                                    <div className='md:col-span-2'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fur Type</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Short, Long, Curly"
                                            className={`w-full p-3 rounded-xl bg-white border 
                                            ${errors.petFurType ? 'border-red-300 focus:border-red-500' : 'border-indigo-200 focus:border-indigo-500'}
                                            focus:outline-none focus:ring-2 ${errors.petFurType ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}
                                            transition-all shadow-sm`}
                                            value={pet.petFurType}
                                            onChange={(e) => {
                                                setPet({ ...pet, petFurType: e.target.value });
                                                setErrors({ ...errors, petFurType: '' });
                                            }}
                                        />
                                        {errors.petFurType && (
                                            <p className="mt-2 text-red-500 text-sm flex items-center">
                                                <span className="mr-1">⚠</span> {errors.petFurType}
                                            </p>
                                        )}
                                    </div>

                                    {/* Fur Color */}
                                    <div className='md:col-span-2'>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fur Color</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Brown, Black, White"
                                            className={`w-full p-3 rounded-xl bg-white border 
                                            ${errors.petFurColor ? 'border-red-300 focus:border-red-500' : 'border-indigo-200 focus:border-indigo-500'}
                                            focus:outline-none focus:ring-2 ${errors.petFurColor ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}
                                            transition-all shadow-sm`}
                                            value={pet.petFurColor}
                                            onChange={(e) => {
                                                setPet({ ...pet, petFurColor: e.target.value });
                                                setErrors({ ...errors, petFurColor: '' });
                                            }}
                                        />
                                        {errors.petFurColor && (
                                            <p className="mt-2 text-red-500 text-sm flex items-center">
                                                <span className="mr-1">⚠</span> {errors.petFurColor}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center gap-4 pt-6 mt-8 border-t border-gray-100">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/customer/pet')}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700
                                                transition-colors font-medium flex items-center shadow-md"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <FaPaw className="mr-2" /> Create Pet
                                            </span>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default CustomerPetCreate;
