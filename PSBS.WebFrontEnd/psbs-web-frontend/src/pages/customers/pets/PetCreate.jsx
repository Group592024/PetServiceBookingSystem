import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import Swal from 'sweetalert2';

const CustomerPetCreate = () => {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
    const [petTypes, setPetTypes] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [errors, setErrors] = useState({});
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

                const response = await fetch("http://localhost:5050/api/petType", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();
                setPetTypes(data.filter(type => !type.isDelete));
            } catch (error) {
                console.log("Error fetching pet types:", error);
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
                            confirmButtonText: "OK"
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
                    confirmButtonText: 'OK'
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
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/customer/pet');
                });
            } else {
                Swal.fire('Error', data.message || 'Failed to create pet', 'error');
            }
        } catch (error) {
            console.error('Error creating pet:', error);
            Swal.fire('Error', 'Failed to create pet', 'error');
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
            <NavbarCustomer />
            <div className="max-w-6xl mx-auto p-6">
                {/* Enhanced Header */}
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

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Left Column - Image Upload and Basic Info */}
                        <div className="md:w-5/12 bg-gradient-to-b from-gray-50 to-white p-8">
                            {/* Image Upload Section */}
                            <div className="mb-8">
                                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all cursor-pointer"
                                    onClick={() => document.querySelector('input[type="file"]').click()}>
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-64 object-contain rounded-xl"
                                        />
                                    ) : (
                                        <div className="w-full h-64 rounded-xl flex flex-col items-center justify-center bg-gray-100">
                                            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-gray-500">Click to upload pet photo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>
                                {errors.petImage && <p className="mt-2 text-red-500 text-sm">{errors.petImage}</p>}
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Pet Name"
                                        className={`w-full text-2xl font-semibold p-4 rounded-xl bg-gray-50 border 
                                        ${errors.petName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'} 
                                        focus:outline-none focus:ring-2 ${errors.petName ? 'focus:ring-red-200' : 'focus:ring-blue-200'} 
                                        transition-all`}
                                        value={pet.petName}
                                        onChange={(e) => {
                                            setPet({ ...pet, petName: e.target.value });
                                            setErrors({ ...errors, petName: '' });
                                        }}
                                    />
                                    {errors.petName && <p className="mt-2 text-red-500 text-sm">{errors.petName}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <select
                                            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                            value={pet.petGender}
                                            onChange={(e) => setPet({ ...pet, petGender: e.target.value === 'true' })}
                                        >
                                            <option value={true}>♂ Male</option>
                                            <option value={false}>♀ Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="absolute left-0 top-full mt-1 w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                                value={pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    setPet({ ...pet, dateOfBirth: e.target.value });
                                                    setErrors({ ...errors, dateOfBirth: '' });
                                                }}
                                                max={new Date().toISOString().split('T')[0]}
                                                id="datePicker"
                                                style={{ opacity: 0, zIndex: -1 }}
                                            />
                                            <input
                                                type="text"
                                                className={`w-full p-3 rounded-xl bg-gray-50 border 
                                                            ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-200'} 
                                                            focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer`}
                                                value={pet.dateOfBirth ? formatDateDisplay(pet.dateOfBirth) : ''}
                                                onClick={() => document.getElementById('datePicker').showPicker()}
                                                readOnly
                                                placeholder="DD/MM/YYYY"
                                            />
                                        </div>
                                        {errors.dateOfBirth &&
                                            <p className="mt-2 text-red-500 text-sm">{errors.dateOfBirth}</p>
                                        }
                                    </div>
                                </div>

                                <div>
                                    <textarea
                                        placeholder="Notes about your pet..."
                                        className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 min-h-[120px] 
                                                 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                        value={pet.petNote}
                                        onChange={(e) => {
                                            setPet({ ...pet, petNote: e.target.value });
                                            setErrors({ ...errors, petNote: '' });
                                        }}
                                    />
                                    {errors.petNote && <p className="mt-2 text-red-500 text-sm">{errors.petNote}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Pet Details */}
                        <div className="md:w-7/12 p-8 bg-white">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <FormRow
                                        label="Pet Type"
                                        type="select"
                                        value={pet.petTypeId}
                                        onChange={(e) => {
                                            setPet({ ...pet, petTypeId: e.target.value, petBreedId: '' });
                                            setErrors({ ...errors, petTypeId: '' });
                                        }}
                                        options={petTypes.map(type => ({
                                            value: type.petType_ID,
                                            label: type.petType_Name
                                        }))}
                                        error={errors.petTypeId}
                                        className="p-3 rounded-xl bg-gray-50"
                                    />

                                    <FormRow
                                        label="Breed"
                                        type="select"
                                        value={pet.petBreedId}
                                        onChange={(e) => {
                                            setPet({ ...pet, petBreedId: e.target.value });
                                            setErrors({ ...errors, petBreedId: '' });
                                        }}
                                        options={breeds.map(breed => ({
                                            value: breed.petBreedId,
                                            label: breed.petBreedName
                                        }))}
                                        disabled={!pet.petTypeId}
                                        error={errors.petBreedId}
                                        className="p-3 rounded-xl bg-gray-50"
                                    />

                                    <FormRow
                                        label="Weight (kg)"
                                        type="number"
                                        value={pet.petWeight}
                                        onChange={(e) => {
                                            setPet({ ...pet, petWeight: e.target.value });
                                            setErrors({ ...errors, petWeight: '' });
                                        }}
                                        error={errors.petWeight}
                                        className="p-3 rounded-xl bg-gray-50"
                                    />

                                    <FormRow
                                        label="Fur Type"
                                        type="text"
                                        value={pet.petFurType}
                                        onChange={(e) => {
                                            setPet({ ...pet, petFurType: e.target.value });
                                            setErrors({ ...errors, petFurType: '' });
                                        }}
                                        error={errors.petFurType}
                                        className="p-3 rounded-xl bg-gray-50"
                                    />

                                    <FormRow
                                        label="Fur Color"
                                        type="text"
                                        value={pet.petFurColor}
                                        onChange={(e) => {
                                            setPet({ ...pet, petFurColor: e.target.value });
                                            setErrors({ ...errors, petFurColor: '' });
                                        }}
                                        error={errors.petFurColor}
                                        className="p-3 rounded-xl bg-gray-50"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-4 pt-6 mt-8 border-t">
                                    <button
                                        onClick={() => navigate('/customer/pet')}
                                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 
                                                 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 
                                                 transition-colors font-medium"
                                    >
                                        Create Pet
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormRow = ({ label, type, value, onChange, options = [], disabled = false, error }) => (
    <div className="flex flex-col">
        <label className="block font-semibold text-gray-800 mb-1">{label}</label>
        {type === 'select' ? (
            <>
                <select
                    className={`w-full p-2.5 rounded bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'}`}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                >
                    <option value="">Select {label}</option>
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
            </>
        ) : (
            <>
                <input
                    type={type}
                    className={`w-full p-2.5 rounded bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'}`}
                    value={value}
                    onChange={onChange}
                />
                {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
            </>
        )}
    </div>
);

export default CustomerPetCreate;
