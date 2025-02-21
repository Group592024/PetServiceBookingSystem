import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../../../components/navbar/Navbar";
import Sidebar from "../../../../components/sidebar/Sidebar";
import Swal from 'sweetalert2';

const AdminPetCreate = () => {
    const sidebarRef = useRef(null);
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState(null);
    const [petTypes, setPetTypes] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [errors, setErrors] = useState({});
    const [search, setSearch] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
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

    useEffect(() => {
        const fetchPetTypes = async () => {
            try {
                const response = await fetch('http://localhost:5050/api/petType');
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
                const response = await fetch('http://localhost:5050/api/account/all');
                const data = await response.json();
                setAccounts(data.data || []);
            } catch (error) {
                console.log('Error fetching accounts:', error);
            }
        };
        fetchAccounts();
    }, []);

    useEffect(() => {
        const fetchBreeds = async () => {
            if (pet.petTypeId) {
                try {
                    const response = await fetch(`http://localhost:5050/api/petBreed/byPetType/${pet.petTypeId}`);
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
        formData.append('accountId', pet.accountId);

        try {
            const response = await fetch('http://localhost:5050/api/pet', {
                method: 'POST',
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
                    navigate('/pet');
                });
            } else {
                Swal.fire('Error', data.message || 'Failed to create pet', 'error');
            }
        } catch (error) {
            console.error('Error creating pet:', error);
            Swal.fire('Error', 'Failed to create pet', 'error');
        }
    };

    const filteredAccounts = accounts.filter((account) =>
        account.accountName.toLowerCase().includes(search.toLowerCase()) && account.roleId === "user"
    ); // Assuming roleId is "user"

    const handleBlur = (e) => {
        setTimeout(() => {
            if (document.activeElement === e.relatedTarget) {
                return;
            }
            const matchedAccount = accounts.find(
                (account) =>
                    account.accountName.toLowerCase() === search.toLowerCase() &&
                    account.roleId === "user"
            );
            if (matchedAccount) {
                setPet((prevPet) => ({ ...prevPet, accountId: matchedAccount.accountId }));
                setErrors((prevErrors) => ({ ...prevErrors, accountId: "" }));
            } else {
                setErrors((prevErrors) => ({ ...prevErrors, accountId: "Please select a valid owner from the list." }));
                setPet((prevPet) => ({ ...prevPet, accountId: "" }));
            }
            setShowDropdown(false);
        }, 200);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            const matchedAccount = accounts.find(
                (account) =>
                    account.accountName.toLowerCase() === search.toLowerCase() && account.roleId === "user"
            );

            if (matchedAccount) {
                handleSelect(matchedAccount.accountId, matchedAccount.accountName);
            } else {
                setErrors({ ...errors, accountId: "Please select a valid owner from the list." });
            }
        }
    };

    const handleSelect = (accountId, accountName) => {
        setPet({ ...pet, accountId });
        setErrors({ ...errors, accountId: "" });
        setSearch(accountName);
        setShowDropdown(false);
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
                                Create Pet
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
                                                value={pet.dateOfBirth}
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
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            placeholder="Owner"
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                                setPet((prevPet) => ({ ...prevPet, accountId: "" }));
                                                setShowDropdown(true);
                                            }}
                                            onFocus={() => setShowDropdown(true)}
                                            onBlur={handleBlur}
                                            onKeyPress={handleKeyPress}
                                            className={`w-full p-2 rounded border ${errors.accountId ? "border-red-500" : "border-gray-300"
                                                }`}
                                        />
                                        {errors.accountId && <p className="text-red-500 text-sm mt-1">{errors.accountId}</p>}
                                        {showDropdown && (
                                            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto">
                                                {filteredAccounts.length > 0 ? (
                                                    filteredAccounts.map((account) => (
                                                        <li
                                                            key={account.accountId}
                                                            tabIndex={0}
                                                            className="p-2 cursor-pointer hover:bg-gray-200"
                                                            onMouseDown={() => handleSelect(account.accountId, account.accountName)}
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

                                    <div className="flex justify-center space-x-4 mt-8">
                                        <button
                                            onClick={handleSubmit}
                                            className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Create
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

export default AdminPetCreate;
