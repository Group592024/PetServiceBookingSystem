import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import sampleImage from '../../../assets/sampleUploadImage.jpg';

const AddPetType = () => {
  const sidebarRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tmpImage, setTmpImage] = useState(sampleImage);

  const handleImageChange = (event) => {
    const fileImage = event.target.files[0];

    if (fileImage) {
      const tmpUrl = URL.createObjectURL(fileImage);
      setSelectedImage(fileImage);
      setTmpImage(tmpUrl);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      } else {
        console.error('Failed create');
      }
    } catch (error) {
      console.error('Failed fetching api', error);
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
                  <input
                    type='text'
                    className='bg-customGrey rounded-3xl p-3 m-5 w-full shadow-lg'
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <p className='font-semibold text-2xl '>
                    Pet Type Description:
                  </p>
                  <textarea
                    type='text'
                    className='bg-customGrey rounded-3xl p-3 m-5
                    w-full shadow-lg resize-none'
                    rows='7'
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
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
