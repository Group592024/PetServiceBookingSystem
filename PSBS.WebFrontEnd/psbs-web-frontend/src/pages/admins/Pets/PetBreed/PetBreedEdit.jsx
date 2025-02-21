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
                const [breedResponse, typesResponse] = await Promise.all([
                    fetch(`http://localhost:5050/api/PetBreed/${id}`),
                    fetch('http://localhost:5050/api/PetType/available')
                ]);

                const breedData = await breedResponse.json();
                const typesData = await typesResponse.json();
                setPetTypes(typesData.data || []);
                if (breedData.flag && breedData.data) {
                    const typeResponse = await fetch(`http://localhost:5050/api/PetType/${breedData.data.petTypeId}`);
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
        return <div>Loading...</div>;
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
                const response = await fetch(`http://localhost:5050/api/PetBreed`, {
                    method: 'PUT',
                    body: formData,
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
        <div>
            <Sidebar ref={sidebarRef} />
            <div className='content'>
                <Navbar sidebarRef={sidebarRef} />
                <main>
                    <div className="flex justify-between items-center mb-6 mx-auto w-full">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-black font-bold text-4xl"
                        >
                            ⬅️
                        </button>
                        <div className="bg-gray-300 p-4 text-center rounded-lg w-72 mb-6 -mt-6 mx-auto">
                            <button className="text-black font-bold text-2xl px-4 py-2 rounded-lg shadow bg-yellow-300 border-2 pointer-events-none">
                                Edit Pet Breed
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 bg-gray-200 rounded-lg flex flex-col lg:flex-row gap-6 -mt-8">
                            <div className="bg-white p-3 rounded-xl shadow-md flex-1 h-[75vh]">
                                {/* Breed Name */}
                                <div className="mb-3 flex items-center">
                                    <label className="font-semibold text-base text-gray-500 mr-5">Name:</label>
                                    <TextField
                                        fullWidth
                                        type='text'
                                        onChange={(e) => setName(e.target.value)}
                                        value={name}
                                        error={error.name}
                                        helperText={error.name ? 'Breed Name is required.' : ''}
                                    />
                                </div>

                                {/* Type */}
                                <div className="mb-3 flex items-center">
                                    <label className="font-semibold text-base text-gray-500 mr-7">Type:</label>
                                    <FormControl fullWidth>
                                        <InputLabel>Choose Type</InputLabel>
                                        <Select
                                            value={typeName}
                                            onChange={(e) => setTypeName(e.target.value)}
                                            label="Choose Type"
                                            error={error.typeName}
                                            renderValue={(selected) => {
                                                console.log('Selected:', selected);
                                                console.log('Current Type Name:', currentTypeName);
                                                const selectedType = petTypes.find(type => type.petType_ID === selected);
                                                console.log('Selected Type:', selectedType);
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

                                {/* Description */}
                                <div className="mb-3">
                                    <label className="font-semibold text-base text-gray-500 mb-1">Description:</label>
                                    <textarea
                                        className={`w-full p-2 rounded-lg border-2 ${error.description ? 'border-red-500' : 'border-gray-300'}`}
                                        rows="5"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                    {error.description && <p className="text-red-500 text-xs">Description is required.</p>}
                                </div>

                                {/* Status */}
                                <div className="mb-3">
                                    <FormControl component="fieldset">
                                        <div className="flex items-center">
                                            <FormLabel component="legend" className="mr-4 font-semibold text-base">Status:</FormLabel>
                                            <RadioGroup
                                                row
                                                value={isDelete ? 'true' : 'false'}
                                                onChange={(e) => setIsDelete(e.target.value === 'true')}
                                                className="flex items-center"
                                            >
                                                <FormControlLabel
                                                    value="false"
                                                    control={<Radio />}
                                                    label="Active"
                                                    className="font-bold text-green-500 text-lg mr-4"
                                                />
                                                <FormControlLabel
                                                    value="true"
                                                    control={<Radio />}
                                                    label="Stopping"
                                                    className="font-bold text-red-500 text-lg"
                                                />
                                            </RadioGroup>
                                        </div>
                                    </FormControl>
                                </div>

                                {/* Submit and Cancel Buttons */}
                                <div className="flex justify-center gap-4">
                                    <button type="submit" className="bg-yellow-300 text-black font-semibold text-lg px-4 py-2 rounded-lg shadow hover:bg-yellow-400">
                                        Save
                                    </button>
                                    <button className="bg-gray-300 text-black font-semibold text-lg px-4 py-2 rounded-lg shadow hover:bg-gray-400" onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/petBreed');
                                    }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Image Preview Section */}
                            <div className="w-full lg:w-1/2 flex justify-center items-center">
                                <img
                                    src={tmpImage}
                                    alt="Breed"
                                    className="w-[400px] h-[400px] object-contain cursor-pointer"
                                    onClick={() => document.getElementById('fileInput').click()}
                                />
                                <input
                                    type="file"
                                    id="fileInput"
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default PetBreedEdit;
