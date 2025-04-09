import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaPaw, FaWeight, FaCalendarAlt, FaMars, FaVenus, FaCamera, FaEdit } from 'react-icons/fa';

const CustomerPetEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [imagePreview, setImagePreview] = useState(null);
    const [petTypes, setPetTypes] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [errors, setErrors] = useState({});
    const [hasInteractedWithImage, setHasInteractedWithImage] = useState(false);
    const [oldPetImage, setOldPetImage] = useState(null);
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
        const fetchPetData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch(`http://localhost:5050/api/pet/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.flag) {
                    const petData = data.data;
                    setPet({
                        ...petData,
                        petBreedId: petData.petBreedId,
                        petTypeId: petData.petTypeId,
                        petImage: null
                    });
                    setImagePreview(petData.petImage ? `http://localhost:5050/pet-service${petData.petImage}` : null);
                    setOldPetImage(petData.petImage);
                } else {
                    Swal.fire('Error', data.message || 'Failed to fetch pet details', 'error');
                }
            } catch (error) {
                console.log('Error fetching pet data:', error);
                Swal.fire('Error', 'Failed to fetch pet details', 'error');
            }
        };
        fetchPetData();
    }, [id]);

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
                setPetTypes(data.data.filter(type => !type.isDelete));
            } catch (error) {
                console.log('Error fetching pet types:', error);
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
                            title: 'Information',
                            text: 'No breeds available for this pet type',
                            icon: 'info',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#3085d6'
                        });
                    }
                    setBreeds(data.data || []);
                } catch (error) {
                    console.log('Error fetching breeds:', error);
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
        setHasInteractedWithImage(true);
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
        if (!pet.petImage && !oldPetImage) {
            newErrors.petImage = 'Please select a pet image';
        }
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
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action will update the pet's information. Do you want to proceed?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        if (!validateForm()) return;

        setIsSubmitting(true);

        Swal.fire({
            title: 'Updating your pet...',
            html: 'Please wait while we save your changes',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const formData = new FormData();
        formData.append('petId', pet.petId);
        formData.append('accountId', pet.accountId);
        formData.append('petName', pet.petName);
        formData.append('petGender', pet.petGender);
        formData.append('dateOfBirth', pet.dateOfBirth);
        formData.append('petBreedId', pet.petBreedId);
        formData.append('petWeight', pet.petWeight);
        formData.append('petFurType', pet.petFurType);
        formData.append('petFurColor', pet.petFurColor);
        formData.append('petNote', pet.petNote);

        if (pet.petImage) {
            formData.append('imageFile', pet.petImage);
        } else if (oldPetImage) {
            formData.append('imageFile', oldPetImage);
        } else {
            setErrors(prev => ({
                ...prev,
                petImage: 'Please select a pet image or leave it unchanged.'
            }));
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5050/api/pet`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'An unknown error occurred';
                Swal.fire('Error', errorMessage, 'error');
            } else {
                Swal.fire({
                    title: 'Success!',
                    text: 'Pet updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6'
                }).then(() => {
                    navigate('/customer/pet');
                });
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            Swal.fire('Error', 'Failed to update pet', 'error');
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
                className="max-w-7xl mx-auto p-6"
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
                    <h1 className="text-3xl font-bold text-gray-800 ml-4">Edit Pet Profile</h1>
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
                                    ${errors.petImage && hasInteractedWithImage ? 'border-red-300' : 'border-indigo-200'} 
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
                                                <FaEdit />
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
                                {errors.petImage && hasInteractedWithImage && (
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                        <div className="relative">
                                            <select
                                                className="w-full p-3 rounded-xl bg-white border border-indigo-200 
                                                focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 
                                                transition-all appearance-none shadow-sm pl-10"
                                                value={pet.petGender}
                                                onChange={(e) => setPet({ ...pet, petGender: e.target.value === 'true' })}
                                            >
                                                <option value={true}>Male</option>
                                                <option value={false}>Female</option>
                                            </select>
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                {pet.petGender ?
                                                    <FaMars className="text-blue-500" /> :
                                                    <FaVenus className="text-pink-500" />
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="absolute left-0 mb-20 w-full p-3 rounded-xl bg-white border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        placeholder="Special care instructions, behaviors, or other important information..."
                                        className={`w-full p-4 rounded-xl bg-white border shadow-sm
                                        ${errors.petNote ? 'border-red-300 focus:border-red-500' : 'border-indigo-200 focus:border-indigo-500'}
                                        focus:outline-none focus:ring-2 ${errors.petNote ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}
                                        transition-all min-h-[120px] resize-none`}
                                        value={pet.petNote}
                                        onChange={(e) => {
                                            setPet({ ...pet, petNote: e.target.value });
                                            setErrors({ ...errors, petNote: '' });
                                        }}
                                    />
                                    {errors.petNote && (
                                        <p className="mt-2 text-red-500 text-sm flex items-center">
                                            <span className="mr-1">⚠</span> {errors.petNote}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Pet Details */}
                        <div className="md:w-7/12 p-8 bg-white">
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
                                                setBreeds([]);
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

                                {/* Breed */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                                    <select
                                        className={`w-full p-3 rounded-xl bg-white border shadow-sm
                                        ${errors.petBreedId ? 'border-red-300' : 'border-indigo-200'}
                                        focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all
                                        ${!pet.petTypeId ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                                        value={pet.petBreedId || ""}
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

                                {/* Other Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center">
                                                <FaWeight className="mr-2 text-indigo-500" />
                                                Weight (kg)
                                            </div>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            className={`w-full p-3 rounded-xl bg-white border shadow-sm
                                            ${errors.petWeight ? 'border-red-300' : 'border-indigo-200'}
                                            focus:border-indigo-500 focus:outline-none focus:ring-2 
                                            ${errors.petWeight ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}`}
                                            value={pet.petWeight}
                                            onChange={(e) => {
                                                setPet({ ...pet, petWeight: e.target.value });
                                                setErrors({ ...errors, petWeight: '' });
                                            }}
                                        />
                                        {errors.petWeight && (
                                            <p className="mt-2 text-red-500 text-sm flex items-center">
                                                <span className="mr-1">⚠</span> {errors.petWeight}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fur Type</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Short, Long, Curly"
                                            className={`w-full p-3 rounded-xl bg-white border shadow-sm
                                            ${errors.petFurType ? 'border-red-300' : 'border-indigo-200'}
                                            focus:border-indigo-500 focus:outline-none focus:ring-2
                                            ${errors.petFurType ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}`}
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

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fur Color</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Brown, Black & White, Tabby"
                                            className={`w-full p-3 rounded-xl bg-white border shadow-sm
                                            ${errors.petFurColor ? 'border-red-300' : 'border-indigo-200'}
                                            focus:border-indigo-500 focus:outline-none focus:ring-2
                                            ${errors.petFurColor ? 'focus:ring-red-200' : 'focus:ring-indigo-200'}`}
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

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-4 pt-6 mt-8 border-t border-gray-100">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/customer/pet')}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200
                                                transition-colors font-medium flex items-center"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmit}
                                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700
                                                transition-colors font-medium flex items-center shadow-md"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : (
                                            'Save Changes'
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

export default CustomerPetEdit;

