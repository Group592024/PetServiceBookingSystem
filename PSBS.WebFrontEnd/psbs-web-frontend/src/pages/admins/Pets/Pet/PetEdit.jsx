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
                const response = await fetch(`http://localhost:5010/api/pet/${id}`);
                const data = await response.json();
                if (data.flag) {
                    setPet(data.data);
                    const imagePath = data.data.petImage.startsWith("/")
                        ? `http://localhost:5010${data.data.petImage}`
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
                const response = await fetch('http://localhost:5010/api/petType');
                const data = await response.json();
                setPetTypes(data.filter(type => !type.isDelete));
            } catch (error) {
                console.log('Error fetching pet types:', error);
            }
        };
        fetchPetTypes();
    }, []);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/account/all');
                const data = await response.json();
                setAccounts(data.data || []);
            } catch (error) {
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
                    const response = await fetch(`http://localhost:5010/api/petBreed/byPetType/${pet.petTypeId}`);
                    const data = await response.json();
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
        formData.append('healthNumber', pet.healthNumber ? pet.healthNumber : 'default-health-number');

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
                navigate('/pet');
            }
        } catch (error) {
            console.error('Error updating pet:', error);
            Swal.fire('Error', 'Failed to update pet', 'error');
        }
    };

    const filteredAccounts = accounts.filter((account) =>
        account.accountName.toLowerCase().includes(search.toLowerCase()) && account.roleId === "user"
    ); // Filter accounts based on search and roleId
    
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
                                Edit Pet
                            </button>
                        </div>
                    </div>

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
                                    {errors.petImage && <span className="text-red-800 text-sm mt-1">{errors.petImage}</span>}
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
                                                className="w-full text-gray-800 p-3 rounded bg-gray-50 border border-gray-300"
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
                                        <label className="block font-semibold text-gray-800 mb-1">Owner</label>
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                placeholder="Owner"
                                                value={search}
                                                onChange={(e) => {
                                                    setSearch(e.target.value);
                                                    setShowDropdown(true);
                                                }}
                                                onFocus={() => setShowDropdown(true)}
                                                className="w-full p-2 rounded border border-gray-300"
                                            />
                                            {errors.accountId && (
                                                <p className="text-red-500 text-sm mt-1">{errors.accountId}</p>
                                            )}
                                            {showDropdown && (
                                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto">
                                                    {filteredAccounts.length > 0 ? (
                                                        filteredAccounts.map((account) => (
                                                            <li
                                                                key={account.accountId}
                                                                className="p-2 cursor-pointer hover:bg-gray-200"
                                                                onClick={() => handleSelect(account.accountId, account.accountName)}
                                                            >
                                                                {account.accountName}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="p-2 text-gray-500">No results found</li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-800 mb-1">Notes</label>
                                        <textarea
                                            className="w-full p-2.5 rounded bg-gray-50 border border-gray-300 min-h-[100px]"
                                            value={pet.petNote}
                                            onChange={(e) => {
                                                setPet({ ...pet, petNote: e.target.value });
                                                setErrors((prevErrors) => ({ ...prevErrors, petNote: '' }));  
                                            }}
                                        />
                                        {errors.petNote && <span className="text-red-500 text-sm mt-1">{errors.petNote}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Right side */}
                            <div className="md:w-1/2">
                                <div className="space-y-4">
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

                                    {/* Status Section */}
                                    <div className="text-gray-700 mt-6">
                                        <label className="block font-semibold mb-2">Status</label>
                                        <div className="flex items-center space-x-4 mt-4">
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="false"
                                                    checked={pet.isDelete === false}
                                                    onChange={() => setPet({ ...pet, isDelete: false })}
                                                    className="h-4 w-4 text-green-500"
                                                />
                                                <span className="text-green-500 font-semibold">Active</span>
                                            </label>
                                            <label className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="true"
                                                    checked={pet.isDelete === true}
                                                    onChange={() => setPet({ ...pet, isDelete: true })}
                                                    className="h-4 w-4 text-red-500"
                                                />
                                                <span className="text-red-500 font-semibold">Stopping</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-center space-x-4 -mb-10">
                                        <button
                                            onClick={handleSubmit}
                                            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => navigate('/pet')}
                                            className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
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