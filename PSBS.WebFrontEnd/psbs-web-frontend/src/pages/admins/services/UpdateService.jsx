import React, { useEffect, useRef, useState } from 'react';
import Sidebar from '../../../components/sidebar/Sidebar';
import Navbar from '../../../components/navbar/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { MenuItem, TextField, Select } from '@mui/material';

const UpdateService = () => {
  //set state
  const navigate = useNavigate();
  const { id } = useParams();
  const sidebarRef = useRef(null);
  const [service, setService] = useState({
    serviceTypeId: '',
    serviceName: '',
    serviceDescription: '',
    serviceImage: null,
  });
  const [selectedOption, setSelectedOption] = useState(service.isDeleted);
  const [imageDisplay, setImageDisplay] = useState(
    `http://localhost:5023${service.serviceImage}`
  );
  const [error, setError] = useState({
    name: false,
    description: false,
  });
  const [serviceType, setServiceType] = useState([]);

  useEffect(() => {
    return () => {
      if (imageDisplay) {
        URL.revokeObjectURL(imageDisplay);
      }
    };
  }, [imageDisplay]);

  //api serviceTypes
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

  //upload hinh
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
        setService((prev) => ({
          ...prev,
          serviceImage: fileImage,
        }));
      }
    }

    event.target.value = '';
  };

  //api fill data
  useEffect(() => {
    const fetchDataUpdate = async () => {
      try {
        const response = await fetch(
          `http://localhost:5023/api/Service/${id}`
        );

        const data=await response.json();

        setService(data.data);
        setSelectedOption(data.data.isDeleted);
        setImageDisplay(`http://localhost:5023${data.data.serviceImage}`);
      } catch (error) {
        console.error('Failed fetching api', error);
        Swal.fire(
          'Update Service',
          'Failed to load the service data!',
          'error'
        );
      }
    };

    fetchDataUpdate();
  }, []);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value === 'true');
  };

  console.log(selectedOption);
  console.log(service);

  //validate
  const handleSubmit = async (event) => {
  
    //api update
    const formData = new FormData();
    formData.append('serviceTypeId', service.serviceTypeId);
    formData.append('serviceName', service.serviceName);
    formData.append('serviceDescription', service.serviceDescription);
    formData.append('imageFile', service.serviceImage);
    formData.append('isDeleted', selectedOption);

    try {
      const response = await fetch(`http://localhost:5023/api/Service/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        Swal.fire('Update Service', 'Service Updated Successfully!', 'success');
        navigate('/service');
        console.log('Update successfully');
      } else {
        console.error('Failed update');
        Swal.fire('Update Service', 'Failed to update service!', 'error');
        navigate('/service');
        console.log('Update successfully');
      }
    } catch (error) {
      console.error('Failed fetching api', error);
      Swal.fire('Update Service', 'Failed to update service!', 'error');
    }
  };

  const handleUpdate = (e) => {
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

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to update this item? This action may change the booking information associated with this service.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Continue to Update',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleSubmit(e);
      }
    });
  };

  //UI
  return (
    <div>
      <Sidebar ref={sidebarRef} />
      <div class='content'>
        <Navbar sidebarRef={sidebarRef} />
        <main>
          <div className='header'>
            <div className='left flex justify-center w-full'>
              <h1 className=''>Update Service</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='p-10 bg-customLightPrimary rounded-lg flex justify-between'>
              <div className='p-10 w-1/2 bg-customLight rounded-3xl'>
                <div>
                  <p className='font-semibold text-2xl '>Service Name:</p>
                  <TextField
                    type='text'
                    value={service.serviceName}
                    sx={{
                      borderRadius: '10px',
                      margin: '20px',
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
                      margin: '20px',
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
                      margin: '20px',
                    }}
                    multiline
                    className='rounded-3xl p-3 m-5
                    w-full resize-none'
                    rows='7'
                    value={service.serviceDescription}
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
                <div className='p-5 '>
                  <p className='font-semibold text-2xl '>Service Status:</p>
                  <div>
                    <label>
                      <input
                        type='radio'
                        name='serviceStatus'
                        value='false'
                        checked={selectedOption === false}
                        onChange={handleOptionChange}
                      />
                      Active
                    </label>
                  </div>
                  <div>
                    <label>
                      <input
                        type='radio'
                        name='serviceStatus'
                        value='true'
                        checked={selectedOption === true}
                        onChange={handleOptionChange}
                      />
                      Inactive
                    </label>
                  </div>
                </div>

                <div className='flex justify-between'>
                  <button
                    type='submit'
                    className='bg-customPrimary py-5 px-20 rounded-3xl text-customLight text-xl font-semibold 
                  hover:bg-customLightPrimary hover:text-customPrimary'
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpdate(e);
                    }}
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

export default UpdateService;
