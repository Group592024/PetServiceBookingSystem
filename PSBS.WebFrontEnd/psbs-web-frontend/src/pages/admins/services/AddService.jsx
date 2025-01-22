import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import sampleImage from '../../../assets/sampleUploadImage.jpg';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { MenuItem, TextField, Select } from '@mui/material';
import AddVariantModal from '../../../components/services/AddVariantModal';

const AddService = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [tmpImage, setTmpImage] = useState(sampleImage);
  const [open, setOpen] = useState(false);
  const [service, setService] = useState({
    serviceTypeId: '',
    serviceName: '',
    serviceDescription: '',
    selectedImage: null,
  });

  const [error, setError] = useState({
    name: false,
    description: false,
  });

  const [serviceType, setServiceType] = useState([]);

  const fetchDataFunction = async () => {
    try {
      const fetchData = await fetch(
        'http://localhost:5023/api/Service/serviceTypes'
      );
      const response = await fetchData.json();

      const result = response.data.map((item, index) => ({
        id: index,
        ...item,
      }));

      if (result.length > 0 && !service.serviceTypeId) {
        setService((prev) => ({
          ...prev,
          serviceTypeId: result[0].serviceTypeId,
        }));

        setServiceType(result);
      }
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  useEffect(() => {
    fetchDataFunction();
  }, []);

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
        setService((prev) => ({
          ...prev,
          selectedImage: fileImage,
        }));
        setTmpImage(tmpUrl);
      }
    }
    event.target.value = '';
  };

 

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (service.serviceName == '' && service.serviceDescription == '') {
      setError({
        description: true,
        name: true,
      });
      return;
    }

    if (service.serviceName == '') {
      setError((prev) => ({
        ...prev,
        name: true,
      }));
      return;
    }

    if (service.serviceDescription == '') {
      setError((prev) => ({
        ...prev,
        description: true,
      }));
      return;
    }

    if (service.selectedImage == null) {
      Swal.fire({
        title: 'Service Image is required!',
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
    formData.append('serviceTypeId', service.serviceTypeId);
    formData.append('serviceName', service.serviceName);
    formData.append('serviceDescription', service.serviceDescription);
    formData.append('imageFile', service.selectedImage);

    try {
      const response = await fetch('http://localhost:5023/api/Service', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('serviceId', data.data.serviceId);

        setService({
          serviceTypeId: '',
          serviceName: '',
          serviceDescription: '',
          selectedImage: null,
        });

        Swal.fire(
          'Add New Service',
          'Service Added Successfully! Now you should add at least one service variant for this service!',
          'success'
        );

        //hien popup add variant

        setOpen(true);
      } else {
        Swal.fire('Add New Service', 'Failed To Add Service!', 'error');
        navigate('/petType/add');
        console.error('Failed create');
      }
    } catch (error) {
      console.error('Failed fetching api', error);
      Swal.fire('Add New Service', 'Failed To Add Service!', 'error');
      navigate('/petType/add');
      console.error('Failed create');
    }
  };

  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div class='content'>
        <Navbar sidebarRef={sidebarRef} />
        <AddVariantModal
          id={localStorage.getItem('serviceId')}
          open={open}
          handleClose={setOpen}
          disableBackdrop={true}
        />
        <main>
          <div className='header'>
            <div className='left flex justify-center w-full'>
              <h1 className=''>Add New Service</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='p-10 bg-customLightPrimary rounded-lg flex justify-between'>
              <div className='p-10 w-1/2 bg-customLight rounded-3xl'>
                <div>
                  <p className='font-semibold text-2xl '>Service Name:</p>
                  <TextField
                    type='text'
                    sx={{
                      borderRadius: '10px',
                      marginBottom: '20px',
                      marginTop: '20px',
                    }}
                    className=' rounded-3xl p-3 m-10 w-full'
                    onChange={(e) => {
                      setService((prev) => ({
                        ...prev,
                        serviceName: e.target.value,
                      }));
                      setError((prev) => ({
                        ...prev,
                        name: false,
                      }));
                    }}
                    error={error.name}
                    helperText={error.name ? 'Service Name is required.' : ''}
                  />
                </div>

                <div>
                  <p className='font-semibold text-2xl '>Service Type:</p>
                  <Select
                    labelId='demo-simple-select-label'
                    value={service.serviceTypeId}
                    onChange={(e) => {
                      setService((prev) => ({
                        ...prev,
                        serviceTypeId: e.target.value,
                      }));
                    }}
                    fullWidth
                    sx={{
                      borderRadius: '10px',
                      marginBottom: '20px',
                      marginTop: '20px',
                    }}
                  >
                    {serviceType.map((item, index) => (
                      <MenuItem
                        key={item.serviceTypeId}
                        value={item.serviceTypeId}
                      >
                        {item.typeName}
                      </MenuItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <p className='font-semibold text-2xl '>
                    Service Description:
                  </p>
                  <TextField
                    type='text'
                    sx={{
                      borderRadius: '10px',
                      marginBottom: '20px',
                      marginTop: '20px',
                    }}
                    multiline
                    className='rounded-3xl p-3 m-5
                    w-full resize-none'
                    rows='7'
                    onChange={(e) => {
                      setService((prev) => ({
                        ...prev,
                        serviceDescription: e.target.value,
                      }));
                      setError((prev) => ({
                        ...prev,
                        description: false,
                      }));
                    }}
                    error={error.description}
                    helperText={
                      error.description
                        ? 'Service Description is required.'
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
                      navigate('/service');
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

export default AddService;
