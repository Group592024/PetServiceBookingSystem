import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Swal from 'sweetalert2';

const AdminPetEdit = () => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const { id } = useParams();
    //const [isDropdownItemSelected, setIsDropdownItemSelected] = useState(false);
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
        accountId: '',
        petImage: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [petTypes, setPetTypes] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch(`http://localhost:5050/api/pet/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.flag) {
                    setPet(data.data);
                    const imagePath = data.data.petImage.startsWith("/")
                        ? `http://localhost:5050/pet-service${data.data.petImage}`
                        : data.data.petImage;
                    setImagePreview(imagePath);
                    setSearch(data.data.accountId);
                    console.log(data.data);
                } else {
                    Swal.fire('Error', 'Pet not found', 'error');
                    navigate('/pet');
                }
            } catch (error) {
                console.log('Error fetching pet:', error);
            }
        };

        fetchPet();
    }, [id]);

    useEffect(() => {
        const fetchPetTypes = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch('http://localhost:5050/api/petType/available', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
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
        const fetchAccounts = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch('http://localhost:5050/api/account/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();

                // Filter out accounts where accountIsDeleted is true
                const activeAccounts = data.data ? data.data.filter(account => !account.accountIsDeleted) : [];
                setAccounts(activeAccounts);
            } catch (error) {
                Swal.fire('Service Unavailable', 'Our service is down. Please contact admin for more information.', 'error');
                console.log('Error fetching accounts:', error);
            }
        };

        fetchAccounts();
    }, []);

    useEffect(() => {
        const findAccountName = (accountId) => {
            const account = accounts.find(acc => acc.accountId === accountId);
            if (account) {
                setSearch(account.accountName);
            }
        };

        if (pet.accountId && accounts.length > 0) {
            findAccountName(pet.accountId);
        }
    }, [pet.accountId, accounts]);

    useEffect(() => {
        const fetchBreeds = async () => {
            if (pet.petTypeId) {
                try {
                    const token = sessionStorage.getItem("token");
                    const response = await fetch(`http://localhost:5050/api/petBreed/byPetType/${pet.petTypeId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

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
        if (!pet.accountId.trim()) newErrors.accountId = 'Please select owner';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        console.log("Pet before submit:", pet);
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This action may affect other data. Do you want to proceed with updating the pet?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, update it!',
            cancelButtonText: 'No, cancel'
        });

        if (!result.isConfirmed) {
            return;
        }

        const formData = new FormData();
        formData.append('petId', id);
        formData.append('petName', pet.petName);
        formData.append('petGender', pet.petGender);
        formData.append('dateOfBirth', pet.dateOfBirth);
        formData.append('petBreedId', pet.petBreedId);
        formData.append('petWeight', pet.petWeight);
        formData.append('petFurType', pet.petFurType);
        formData.append('petFurColor', pet.petFurColor);
        formData.append('petNote', pet.petNote);
        formData.append('imageFile', pet.petImage);
        formData.append('accountId', pet.accountId);
        formData.append('isDelete', pet.isDelete);

        try {
            const response = await fetch(`http://localhost:5050/api/pet`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem("token")}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'An unknown error occurred';
                Swal.fire('Error', errorMessage, 'error');
                return;
            } else {
                Swal.fire('Success', 'Pet updated successfully', 'success');
                navigate('/pet');
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            Swal.fire('Error', 'Failed to update pet', 'error');
        }
    };

    const filteredAccounts = accounts.filter((account) =>
        (account?.accountName?.toLowerCase()?.includes(search.toLowerCase()) ||
            account?.accountPhoneNumber?.toLowerCase()?.includes(search.toLowerCase())) &&
        account?.roleId === "user"
    );

    console.log("Filtered accounts:", filteredAccounts);

    const handleSelect = (accountId, accountName) => {
        console.log("Selected accountId:", accountId);
        setPet({ ...pet, accountId });
        setErrors({ ...errors, accountId: "" });
        setSearch(accountName);
        setShowDropdown(false);
    };

    // const handleBlur = () => {
    //     if (!isDropdownItemSelected) {
    //         setSearch(
    //             pet.accountId
    //                 ? accounts.find((acc) => acc.accountId === pet.accountId)?.accountName || ""
    //                 : ""
    //         );
    //     }
    //     setIsDropdownItemSelected(false);
    //     setShowDropdown(false); 
    // };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };
    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen flex flex-col">
            <Sidebar ref={sidebarRef} />
            <div className="content flex-1 overflow-hidden">
                <Navbar sidebarRef={sidebarRef} />

                <main className="flex-1 overflow-auto p-8">
                    {/* Header Section */}
                    <div className="flex items-center mb-8 bg-white rounded-xl p-4 shadow-sm">
                        <button onClick={() => navigate(-1)} className="hover:bg-gray-100 p-2 rounded-full transition-all">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800 ml-4">Edit Pet Profile</h1>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Left Column */}
                            <div className="md:w-1/2 space-y-6">
                                {/* Image Upload */}
                                <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all">
                                    <div className="aspect-square mb-4">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-contain rounded-lg shadow-sm"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className="text-gray-500">Click to upload pet photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" className="w-full" onChange={handleImageChange} />
                                    {errors.petImage && <span className="text-red-500 text-sm mt-2 block">{errors.petImage}</span>}
                                </div>

                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Pet Name"
                                        className={`w-full text-xl font-semibold p-3 rounded-lg bg-gray-50 border focus:ring-2 focus:ring-blue-200 transition-all ${errors.petName ? 'border-red-500' : 'border-gray-300'}`}
                                        value={pet.petName}
                                        onChange={(e) => {
                                            setPet({ ...pet, petName: e.target.value });
                                            setErrors({ ...errors, petName: '' });
                                        }}
                                    />
                                    {errors.petName && <span className="text-red-500 text-sm">{errors.petName}</span>}

                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-blue-200"
                                            value={pet.petGender}
                                            onChange={(e) => setPet({ ...pet, petGender: e.target.value === 'true' })}
                                        >
                                            <option value={true}>♂ Male</option>
                                            <option value={false}>♀ Female</option>
                                        </select>

                                        <div>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    className="absolute left-0 mb-20 w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
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

                                    {/* Owner Selection */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search Owner"
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                                setShowDropdown(true);
                                            }}
                                            onFocus={() => setShowDropdown(true)}
                                            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-200 ${errors.accountId ? "border-red-500" : "border-gray-300"}`}
                                        />
                                        {errors.accountId && <p className="text-red-500 text-sm mt-1">{errors.accountId}</p>}

                                        {showDropdown && (
                                            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {filteredAccounts.map((account) => (
                                                    <li
                                                        key={account.accountId}
                                                        className="p-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3"
                                                        onClick={() => handleSelect(account.accountId, account.accountName)}
                                                    >
                                                        {/* Avatar */}
                                                        {account.accountImage ? (
                                                            <img
                                                                src={`http://localhost:5050/account-service/images/${account.accountImage}`}
                                                                alt="avatar"
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
                                                                {account.accountName?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-col">
                                                            <span className="text-gray-800 font-medium">{account.accountName}</span>
                                                            <span className="text-gray-500 text-sm">{account.accountPhoneNumber}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="md:w-1/2">
                                <div className="space-y-6">
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
                                    />

                                    {/* Notes Section */}
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-2">Notes</label>
                                        <textarea
                                            className={`w-full p-3 rounded-lg bg-gray-50 border focus:ring-2 focus:ring-blue-200 ${errors.petNote ? 'border-red-500' : 'border-gray-300'} min-h-[120px]`}
                                            value={pet.petNote}
                                            onChange={(e) => {
                                                setPet({ ...pet, petNote: e.target.value });
                                                setErrors({ ...errors, petNote: '' });
                                            }}
                                            placeholder="Enter pet notes..."
                                        />
                                        {errors.petNote && <span className="text-red-500 text-sm">{errors.petNote}</span>}
                                    </div>

                                    {/* Status Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block font-semibold text-gray-700 mb-3">Status</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="false"
                                                    checked={pet.isDelete === false}
                                                    onChange={() => setPet({ ...pet, isDelete: false })}
                                                    className="hidden"
                                                />
                                                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${!pet.isDelete ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100'
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
                                                    checked={pet.isDelete === true}
                                                    onChange={() => setPet({ ...pet, isDelete: true })}
                                                    className="hidden"
                                                />
                                                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${pet.isDelete ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-gray-100'
                                                    }`}>
                                                    <span className="w-2 h-2 rounded-full bg-current"></span>
                                                    Inactive
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-4 mt-12 pt-6 border-t">
                            <button
                                onClick={() => navigate('/pet')}
                                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

};

const FormRow = ({ label, type, value, onChange, options = [], disabled = false, error }) => (
    <div className="flex flex-col">
        <label className="block font-semibold text-gray-800 mb-1">{label}</label>
        {type === 'select' ? (
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
        ) : (
            <input
                type={type}
                className={`w-full p-2.5 rounded bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'}`}
                value={value}
                onChange={onChange}
            />
        )}
        {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
);


export default AdminPetEdit;