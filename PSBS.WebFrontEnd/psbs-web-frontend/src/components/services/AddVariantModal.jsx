import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Box, Modal, TextField } from '@mui/material';

const AddVariantModal = ({ id, open, handleClose }) => {
  const navigate = useNavigate();

  const sidebarRef = useRef(null);

  const [variant, setVariant] = useState({
    serviceContent: '',
    servicePrice: '',
  });

  const [error, setError] = useState({
    content: false,
    price: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (variant.serviceContent === '' && variant.servicePrice === '') {
      setError({
        content: true,
        price: 'Service price is required',
      });
      return;
    }

    if (variant.serviceContent === '') {
      setError((prev) => ({
        ...prev,
        content: true,
      }));
      return;
    }

    if (variant.servicePrice === '') {
      setError((prev) => ({
        ...prev,
        price: 'Service price is required',
      }));
      return;
    } else if (
      isNaN(parseInt(variant.servicePrice, 10)) ||
      parseInt(variant.servicePrice, 10) <= 0
    ) {
      setError((prev) => ({
        ...prev,
        price: 'Service price must be a positive number',
      }));
      return;
    }

    const formData = new FormData();
    formData.append('serviceContent', variant.serviceContent);
    formData.append('servicePrice', variant.servicePrice);
    formData.append('serviceId', id);

    try {
      const response = await fetch(`http://localhost:5023/api/ServiceVariant`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        Swal.fire(
          'Add Service Variant',
          'Service Variant Added Successfully!',
          'success'
        );

        window.location.reload();
      } else {
        console.error('Failed create');
        Swal.fire(
          'Add Service Variant',
          'Failed to add service variant!',
          'error'
        );
      }
    } catch (error) {
      console.error('Failed fetching api', error);
      Swal.fire(
        'Add Service Variant',
        'Failed to add service variant!',
        'error'
      );
    }
  };

  return (
    <div>
      <Modal open={open} onClose={handleClose}>
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
                  Create Service Variant
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
                      multiline
                      rows='7'
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
                        error.content ? 'Service content is required.' : ''
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
                      className='rounded-3xl p-3 m-5
                    w-full resize-none'
                      value={variant.servicePrice}
                      onChange={(e) => {
                        setVariant((prev) => ({
                          ...prev,
                          servicePrice: e.target.value,
                        }));
                        if (e.target.value !== '') {
                          setError((prev) => ({
                            ...prev,
                            price: '',
                          }));
                        }
                      }}
                      error={!!error.price}
                      helperText={error.price}
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

export default AddVariantModal;
