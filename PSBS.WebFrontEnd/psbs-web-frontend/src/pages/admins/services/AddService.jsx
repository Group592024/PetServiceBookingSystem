import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import sampleImage from '../../../assets/sampleUploadImage.jpg';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';

const AddPetType = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tmpImage, setTmpImage] = useState(sampleImage);
  const [error, setError] = useState({
    name: false,
    description: false,
  });

  const handleImageChange = (event) => {
    const fileImage = event.target.files[0];

    if (fileImage) {
      const validImageTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!validImageTypes.includes(fileImage.type)) {
        Swal.fire({
          title: 'Only accept image files!',
          showClass: {
            popup: `
                 animate__animated
                 animate__fadeInUp
                 animate__faster
               `,
          },
          hideClass: {
            popup: `
                 animate__animated
                 animate__fadeOutDown
                 animate__faster
               `,
          },
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

    if (name == '' && description == '') {
      setError({
        description: true,
        name: true,
      });
      return;
    }

    if (name == '') {
      setError((prev) => ({
        ...prev,
        name: true,
      }));
      return;
    }

    if (description == '') {
      setError((prev) => ({
        ...prev,
        description: true,
      }));
      return;
    }

    if (selectedImage == null) {
      Swal.fire({
        title: 'Pet Type Image is required!',
        showClass: {
          popup: `
                 animate__animated
                 animate__fadeInUp
                 animate__faster
               `,
        },
        hideClass: {
          popup: `
                 animate__animated
                 animate__fadeOutDown
                 animate__faster
               `,
        },
      });
      return;
    }

    const formData = new FormData();
    formData.append('petType_Name', name);
    formData.append('petType_Description', description);
    formData.append('imageFile', selectedImage);

    try {
      const response = await fetch('http://localhost:5010/api/PetType', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setName('');
        setDescription('');
        setName(null);

        Swal.fire(
          'Add New Pet Type',
          'Pet Type Added Successfully!',
          'success'
        );
        navigate('/petType');
      } else {
        Swal.fire('Add New Pet Type', 'Failed To Add Pet Type!', 'error');
        navigate('/petType/add');
        console.error('Failed create');
      }
    } catch (error) {
      console.error('Failed fetching api', error);
      Swal.fire('Add New Pet Type', 'Failed To Add Pet Type!', 'error');
      navigate('/petType/add');
      console.error('Failed create');
    }
  };

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div class='content'>
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className='header'>
            <div className='left flex justify-center w-full'>
              <h1 className=''>Add New Pet Type</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='p-10 bg-customLightPrimary rounded-lg flex justify-between'>
              <div className='p-10 w-1/2 bg-customLight rounded-3xl'>
                <div>
                  <p className='font-semibold text-2xl '>Pet Type Name:</p>
                  <TextField
                    type='text'
                    sx={{
                      borderRadius: '10px',
                      margin: '20px',
                    }}
                    className=' rounded-3xl p-3 m-10 w-full'
                    onChange={(e) => {
                      setName(e.target.value);
                      setError((prev) => ({
                        ...prev,
                        name: false,
                      }));
                    }}
                    error={error.name}
                    helperText={error.name ? 'Pet Type Name is required.' : ''}
                  />
                </div>
                <div>
                  <p className='font-semibold text-2xl '>
                    Pet Type Description:
                  </p>
                  <TextField
                    type='text'
                    sx={{
                      borderRadius: '10px',
                      margin: '20px',
                    }}
                    multiline
                    className='rounded-3xl p-3 m-5
                    w-full resize-none'
                    rows='7'
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setError((prev) => ({
                        ...prev,
                        description: false,
                      }));
                    }}
                    error={error.description}
                    helperText={
                      error.description
                        ? 'Pet Type Description is required.'
                        : ''
                    }
                  />
                </div>

                <div className='flex justify-between'>
                  <button
                    type='submit'
                    className='bg-customPrimary py-5 px-20 rounded-3xl text-customLight text-xl font-semibold 
                  hover:bg-customLightPrimary hover:text-customPrimary'
                  >
                    Save
                  </button>

                  <button
                    className='bg-customLightPrimary py-5 px-20 rounded-3xl text-customPrimary text-xl font-semibold 
                  hover:bg-customPrimary hover:text-customLightPrimary'
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/petType');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div className='w-1/2 flex justify-center items-center'>
                <img
                  className='w-3/4 rounded-3xl'
                  src={tmpImage}
                  alt='sampleImage'
                  onClick={(e) => document.getElementById('inputFile').click()}
                />
                <input
                  type='file'
                  accept='image/*'
                  id='inputFile'
                  onChange={(e) => handleImageChange(e)}
                  className='hidden'
                />
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddPetType;
