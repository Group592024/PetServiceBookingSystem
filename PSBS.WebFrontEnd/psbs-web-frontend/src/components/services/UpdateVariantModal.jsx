import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Box, Modal, TextField } from '@mui/material';

const UpdateVariantModal = ({ id, open, handleClose }) => {
  const navigate = useNavigate();

  const sidebarRef = useRef(null);

  const [variant, setVariant] = useState({});
  const [selectedOption, setSelectedOption] = useState(variant.isDeleted);

  const [error, setError] = useState({
    content: false,
    price: false,
  });

  console.log('day laf id nhan vao: ', id);

  useEffect(() => {
    const fetchDataUpdate = async () => {
      try {
        const data = await fetch(
          `http://localhost:5023/api/ServiceVariant/${id}`
        ).then((response) => response.json());

        console.log('day la data', data);
        setVariant(data.data);
        setSelectedOption(data.data.isDeleted);
      } catch (error) {
        console.error('Failed fetching api', error);
        Swal.fire(
          'Update Service Variant',
          'Failed to load the service variant data!',
          'error'
        );
      }
    };

    fetchDataUpdate();
  }, []);

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value === 'true');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (variant.serviceContent == '' && variant.servicePrice == '') {
      setError({
        content: true,
        price: true,
      });
      return;
    }

    if (variant.serviceContent == '') {
      setError((prev) => ({
        ...prev,
        content: true,
      }));
      return;
    }

    if (variant.servicePrice == '') {
      setError((prev) => ({
        ...prev,
        price: true,
      }));
      return;
    }

    const formData = new FormData();
    formData.append('serviceContent', variant.serviceContent);
    formData.append('servicePrice', variant.servicePrice);
    formData.append('isDeleted', selectedOption);

    try {
      const response = await fetch(
        `http://localhost:5023/api/ServiceVariant/${id}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      if (response.ok) {
        Swal.fire(
          'Update Service Variant',
          'Service Variant Updated Successfully!',
          'success'
        );
        
       window.location.reload();
        console.log('Update successfully');
      } else {
        console.error('Failed update');
        Swal.fire(
          'Update Service Variant',
          'Failed to update service variant!',
          'error'
        );
        console.log('Update successfully');
      }
    } catch (error) {
      console.error('Failed fetching api', error);
      Swal.fire(
        'Update Service Variant',
        'Failed to update service variant!',
        'error'
      );
    }
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50%',
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}
        >
          <main>
            <div className='header'>
              <div className='left flex justify-center w-full'>
                <h1 className='text-3xl font-bold p-5'>
                  Update Service Variant
                </h1>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className='p-10 bg-customLightPrimary rounded-lg '>
                <div className='p-10  bg-customLight rounded-3xl'>
                  <div>
                    <p className='font-semibold text-2xl '>Service Content:</p>
                    <TextField
                      type='text'
                      value={variant.serviceContent}
                      sx={{
                        borderRadius: '10px',
                        margin: '20px',
                      }}
                      className=' rounded-3xl p-3 m-10 w-full'
                      onChange={(e) => {
                        setVariant((prev) => ({
                          ...prev,
                          serviceContent: e.target.value,
                        }));
                        setError((prev) => ({
                          ...prev,
                          content: false,
                        }));
                      }}
                      error={error.content}
                      helperText={
                        error.name ? 'Service content is required.' : ''
                      }
                    />
                  </div>
                  <div>
                    <p className='font-semibold text-2xl '>Service Price:</p>
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
                      value={variant.servicePrice}
                      onChange={(e) => {
                        setVariant((prev) => ({
                          ...prev,
                          servicePrice: e.target.value,
                        }));
                        setError((prev) => ({
                          ...prev,
                          price: false,
                        }));
                      }}
                      error={error.price}
                      helperText={
                        error.price ? 'Service Price is required.' : ''
                      }
                    />
                  </div>
                  <div className='p-5 '>
                    <p className='font-semibold text-2xl '>
                      Service Variant Status:
                    </p>
                    <div>
                      <label>
                        <input
                          type='radio'
                          name='petTypeStatus'
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
                          name='petTypeStatus'
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
                    >
                      Save
                    </button>

                    <button
                      className='bg-customLightPrimary py-5 px-20 rounded-3xl text-customPrimary text-xl font-semibold 
                  hover:bg-customPrimary hover:text-customLightPrimary'
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </main>
        </Box>
      </Modal>
    </div>
  );
};

export default UpdateVariantModal;
