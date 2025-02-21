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
                const response = await fetch('http://localhost:5050/api/PetType/available');
                const data = await response.json();
                setPetTypes(data.data || []);
            } catch (error) {
                Swal.fire('Error', 'Failed to fetch pet types!', 'error');
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
            const response = await fetch('http://localhost:5050/api/PetBreed', {
                method: 'POST',
                body: formData,
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
                                Create Pet Breed
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-6 bg-gray-200 rounded-lg flex flex-col lg:flex-row gap-6 -mt-8">
                            <div className="bg-white p-3 rounded-xl shadow-md flex-1">
                                {/* Breed Name */}
                                <div className="mb-3 flex items-center">
                                    <label className="font-semibold text-base text-gray-500 mr-5">Name:</label>
                                    <TextField
                                        fullWidth
                                        type='text'
                                        sx={{ borderRadius: '8px', marginBottom: '8px' }}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setError((prev) => ({ ...prev, name: false }));
                                        }}
                                        error={error.name}
                                        helperText={error.name ? 'Breed Name is required.' : ''}
                                    />
                                </div>

                                {/* Type */}
                                <div className="mb-3 flex items-center">
                                    <label className="font-semibold text-base text-gray-500 mr-7">Type:</label>
                                    <FormControl fullWidth sx={{ borderRadius: '8px', marginBottom: '8px' }}>
                                        <InputLabel>Choose Type</InputLabel>
                                        <Select
                                            value={typeName}
                                            onChange={(e) => {
                                                setTypeName(e.target.value);
                                                setError((prev) => ({ ...prev, typeName: false }));
                                            }}
                                            label="Choose Type"
                                            error={error.typeName}
                                        >
                                            {petTypes.map((petType) => (
                                                <MenuItem key={petType.petType_ID} value={petType.petType_ID}>
                                                    {petType.petType_Name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {error.typeName && <p className="text-red-500 text-xs">Type is required.</p>}
                                    </FormControl>
                                </div>

                                {/* Description */}
                                <div className="mb-3">
                                    <label className="font-semibold text-base text-gray-500 mb-1">Description:</label>
                                    <textarea
                                        className={`w-full p-2 rounded-lg border-2 ${error.description ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-yellow-300`}
                                        rows="5"
                                        maxLength="500"
                                        placeholder="Enter the pet breed description here"
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

                                {/* Submit and Cancel Buttons */}
                                <div className="flex justify-center gap-4">
                                    <button
                                        type='submit'
                                        className="bg-yellow-300 text-black font-semibold text-lg px-4 py-2 rounded-lg shadow hover:bg-yellow-400"
                                    >
                                        Save
                                    </button>

                                    <button
                                        className="bg-gray-300 text-black font-semibold text-lg px-4 py-2 rounded-lg shadow hover:bg-gray-400"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('/petBreed');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>

                            {/* Image Preview Section */}
                            <div className="w-full lg:w-1/2 flex justify-center items-center">
                                <img
                                    className="w-[400px] h-[400px] object-contain cursor-pointer"
                                    src={tmpImage}
                                    alt="sampleImage"
                                    onClick={() => document.getElementById('inputFile').click()}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="inputFile"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default PetBreedCreate;
