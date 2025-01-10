import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import sampleImage from '../../../assets/sampleUploadImage.jpg';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const UpdatePetType = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const sidebarRef = useRef(null);

  const [petType, setPetType] = useState({});
  const [imageDisplay, setImageDisplay] = useState(
    `http://localhost:5010${petType.petType_Image}`
  );

  useEffect(() => {
    return () => {
      if (imageDisplay) {
        URL.revokeObjectURL(imageDisplay);
      }
    };
  }, [imageDisplay]);

  const handleImageChange = (event) => {
    const fileImage = event.target.files[0];

    console.log('file ne:', event.target.files);

    if (fileImage) {
      console.log(fileImage.type);

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
        setImageDisplay(tmpUrl);
        setPetType((prev) => ({
          ...prev,
          petType_Image: fileImage,
        }));
      }
    }

    event.target.value = '';
  };

  useEffect(() => {
    const fetchDataUpdate = async () => {
      try {
        const data = await fetch(
          `http://localhost:5010/api/PetType/${id}`
        ).then((response) => response.json());

        setPetType(data);
        setImageDisplay(`http://localhost:5010${data.petType_Image}`);
      } catch (error) {
        console.error('Failed fetching api', error);
        Swal.fire(
          'Update Pet Type',
          'Failed to load the pet type data!',
          'error'
        );
      }
    };

    fetchDataUpdate();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (petType.petType_Name == '') {
      Swal.fire({
        title: 'Pet Type Name is required!',
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

    if (petType.petType_Description == '') {
      Swal.fire({
        title: 'Pet Type Description is required!',
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
    formData.append('petType_Name', petType.petType_Name);
    formData.append('petType_Description', petType.petType_Description);
    formData.append('imageFile', petType.petType_Image);

    try {
      const response = await fetch(`http://localhost:5010/api/PetType/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        Swal.fire(
          'Update Pet Type',
          'Pet Type Updated Successfully!',
          'success'
        );
        navigate('/petType');
        console.log('Update successfully');
      } else {
        console.error('Failed update');
        Swal.fire('Update Pet Type', 'Failed to update pet type!', 'error');
        navigate('/petType');
        console.log('Update successfully');
      }
    } catch (error) {
      console.error('Failed fetching api', error);
      Swal.fire('Update Pet Type', 'Failed to update pet type!', 'error');
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
              <h1 className=''>Update Pet Type</h1>
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
                    value={petType.petType_Name}
                    onChange={(e) =>
                      setPetType((prev) => ({
                        ...prev,
                        petType_Name: e.target.value,
                      }))
                    }
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
                    value={petType.petType_Description}
                    onChange={(e) =>
                      setPetType((prev) => ({
                        ...prev,
                        petType_Description: e.target.value,
                      }))
                    }
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
                  src={imageDisplay}
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

export default UpdatePetType;
