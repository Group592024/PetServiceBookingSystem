import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavbarCustomer from '../../../components/navbar-customer/NavbarCustomer';
import Swal from 'sweetalert2';

const CustomerPetEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    console.log(id);
    const [imagePreview, setImagePreview] = useState(null);
    const [petTypes, setPetTypes] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [errors, setErrors] = useState({});
    const [hasInteractedWithImage, setHasInteractedWithImage] = useState(false);
    const [oldPetImage, setOldPetImage] = useState(null);
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
                const response = await fetch(`http://localhost:5010/api/pet/${id}`);
                const data = await response.json();
                if (data.flag) {
                    const petData = data.data;
                    setPet({
                        ...petData,
                        petBreedId: petData.petBreedId,
                        petTypeId: petData.petTypeId,
                        petImage: null
                    });
                    setImagePreview(petData.petImage ? `http://localhost:5010${petData.petImage}` : null);
                    setOldPetImage(petData.petImage);
                    console.log('Pet Type ID:', petData.petTypeId);
                    console.log('Pet Breed ID:', petData.petBreedId);
                    console.log('Current Pet State:', {
                        ...petData,
                        petImage: null
                    });

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
                const response = await fetch('http://localhost:5010/api/petType');
                const data = await response.json();
                console.log('Fetched Pet Types:', data);
                setPetTypes(data.filter(type => !type.isDelete));
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
                    const response = await fetch(`http://localhost:5010/api/petBreed/byPetType/${pet.petTypeId}`);
                    const data = await response.json();

                    if (!data.flag) {
                        Swal.fire({
                            title: 'Information',
                            text: 'No breeds available for this pet type',
                            icon: 'info',
                            confirmButtonText: 'OK'
                        });
                    }
                    setBreeds(data.data || []);
                    console.log('Fetched Breeds:', data.data);
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
        console.log('Selected file:', file);

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
            console.log('Updated Pet State:', { ...pet, petImage: file });
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
        console.log('Validation Errors:', newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action will update the pet's information and may affect related data. Do you want to proceed?",
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
        formData.append('healthNumber', pet.healthNumber ? pet.healthNumber : 'default-health-number');

        if (pet.petImage) {
            formData.append('imageFile', pet.petImage);
        } else if (oldPetImage) {
            formData.append('imageFile', oldPetImage);
        } else {
            setErrors(prev => ({
                ...prev,
                petImage: 'Please select a pet image or leave it unchanged.'
            }));
            return;
        }

        console.log('Form Data being sent:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        try {
            const response = await fetch(`http://localhost:5010/api/pet`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'An unknown error occurred';
                Swal.fire('Error', errorMessage, 'error');
                return;
            } else {
                Swal.fire('Success', 'Pet updated successfully', 'success');
                navigate('/customer/pet');
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            Swal.fire('Error', 'Failed to update pet', 'error');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <NavbarCustomer />
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Pet</h1>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left side */}
                        <div className="md:w-1/2">
                            <div className="bg-gray-500 p-4 rounded-xl mb-4">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-400 rounded-lg flex items-center justify-center">
                                        <span className="text-white">Select an image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full mt-2"
                                    onChange={handleImageChange}
                                />
                                {errors.petImage && hasInteractedWithImage && <span className="text-red-800 text-sm mt-1">{errors.petImage}</span>}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Pet Name"
                                        className={`w-full text-xl font-semibold p-2.5 rounded bg-gray-50 border ${errors.petName ? 'border-red-500' : 'border-gray-300'}`}
                                        value={pet.petName}
                                        onChange={(e) => {
                                            setPet({ ...pet, petName: e.target.value });
                                            setErrors({ ...errors, petName: '' });
                                        }}
                                    />
                                    {errors.petName && <span className="text-red-500 text-sm mt-1">{errors.petName}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <select
                                            className="w-full text-gray-800 p-2.5 rounded bg-gray-50 border border-gray-300"
                                            value={pet.petGender}
                                            onChange={(e) => setPet({ ...pet, petGender: e.target.value === 'true' })}
                                        >
                                            <option value={true}>Male</option>
                                            <option value={false}>Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <input
                                            type="date"
                                            className={`w-full p-2.5 rounded bg-gray-50 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                                            value={pet.dateOfBirth ? pet.dateOfBirth.split('T')[0] : ''}
                                            onChange={(e) => {
                                                setPet({ ...pet, dateOfBirth: e.target.value });
                                                setErrors({ ...errors, dateOfBirth: '' });
                                            }}
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        {errors.dateOfBirth && <span className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</span>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Note</label>
                                    <textarea
                                        placeholder="Note"
                                        className={`w-full text-xl font-medium p-2.5 rounded bg-gray-50 border ${errors.petNote ? 'border-red-500' : 'border-gray-300'}`}
                                        value={pet.petNote}
                                        onChange={(e) => setPet({ ...pet, petNote: e.target.value })}
                                        rows={4}
                                    />
                                    {errors.petNote && <span className="text-red-500 text-sm mt-1">{errors.petNote}</span>}
                                </div>
                            </div>
                        </div>
                        {/* Right side */}
                        <div className="md:w-1/2">
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-semibold text-gray-800 mb-1">Pet Type</label>
                                    <select
                                        className={`w-full text-gray-800 p-2.5 rounded bg-gray-50 border ${errors.petTypeId ? 'border-red-500' : 'border-gray-300'}`}
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
                                    {errors.petTypeId && <span className="text-red-500 text-sm mt-1">{errors.petTypeId}</span>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-800 mb-1">Breed</label>
                                    <select
                                        className={`w-full text-gray-800 p-2.5 rounded bg-gray-50 border ${errors.petBreedId ? 'border-red-500' : 'border-gray-300'}`}
                                        value={pet.petBreedId || ""}
                                        onChange={(e) => setPet({ ...pet, petBreedId: e.target.value })}
                                        disabled={!pet.petTypeId}
                                    >
                                        <option value="">Select Breed</option>
                                        {breeds.length > 0 ? (
                                            breeds.map(breed => (
                                                <option key={breed.petBreedId} value={breed.petBreedId}>
                                                    {breed.petBreedName}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No breeds available</option>
                                        )}
                                    </select>
                                    {errors.petBreedId && <span className="text-red-500 text-sm mt-1">{errors.petBreedId}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Weight</label>
                                    <input
                                        type="number"
                                        placeholder="Weight"
                                        className={`w-full text-xl font-medium p-2.5 rounded bg-gray-50 border ${errors.petWeight ? 'border-red-500' : 'border-gray-300'}`}
                                        value={pet.petWeight}
                                        onChange={(e) => setPet({ ...pet, petWeight: e.target.value })}
                                    />
                                    {errors.petWeight && <span className="text-red-500 text-sm mt-1">{errors.petWeight}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Fur Type</label>
                                    <input
                                        type="text"
                                        placeholder="Fur Type"
                                        className={`w-full text-xl font-medium p-2.5 rounded bg-gray-50 border ${errors.petFurType ? 'border-red-500' : 'border-gray-300'}`}
                                        value={pet.petFurType}
                                        onChange={(e) => setPet({ ...pet, petFurType: e.target.value })}
                                    />
                                    {errors.petFurType && <span className="text-red-500 text-sm mt-1">{errors.petFurType}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Fur Color</label>
                                    <input
                                        type="text"
                                        placeholder="Fur Color"
                                        className={`w-full text-xl font-medium p-2.5 rounded bg-gray-50 border ${errors.petFurColor ? 'border-red-500' : 'border-gray-300'}`}
                                        value={pet.petFurColor}
                                        onChange={(e) => setPet({ ...pet, petFurColor: e.target.value })}
                                    />
                                    {errors.petFurColor && <span className="text-red-500 text-sm mt-1">{errors.petFurColor}</span>}
                                </div>
                            </div>
                            {/* Center the buttons */}
                            <div className="flex justify-center mt-6 space-x-4">
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
                                    onClick={handleSubmit}
                                >
                                    Save
                                </button>
                                <button
                                    className="bg-gray-300 text-black px-4 py-2 rounded-full hover:bg-gray-400 transition"
                                    onClick={() => {
                                        console.log("Cancel clicked");
                                        navigate('/customer/pet');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerPetEdit;
